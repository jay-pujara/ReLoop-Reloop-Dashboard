import mongoose from 'mongoose';
import { ListingModel } from '../listings/listing.model.js';
import { ListingMediaModel } from '../listings/listingMedia.model.js';
import { ListingGradingModel, IListingGrading } from './listingGrading.model.js';
import { OrganizationAuditModel } from '../organizations/audit.model.js';
import { UserModel } from '../users/users.model.js';
import { OrganizationModel } from '../organizations/organizations.model.js';
import { storageProvider } from '../../services/storage/storage.service.js';
import { getVisionGradingProvider } from './vision.provider.js';
import { CURRENT_GRADING_RUBRIC_VERSION } from './rubric.js';
import { GradingGrade, GradingStatus } from './grading.types.js';

export class GradingService {
  private processingQueue = new Set<string>();

  private assertObjectId(id: string, name: string): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid ${name} format`);
      (err as any).statusCode = 400;
      (err as any).code = 'INVALID_ID';
      throw err;
    }
    return new mongoose.Types.ObjectId(id);
  }

  private error(statusCode: number, code: string, message: string): Error {
    const err = new Error(message);
    (err as any).statusCode = statusCode;
    (err as any).code = code;
    return err;
  }

  private async getContext(userId: string, requireActive = true) {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId role');
    if (!user?.organizationId) throw this.error(403, 'ORGANIZATION_REQUIRED', 'An organisation is required');
    if (requireActive && !['owner', 'admin', 'member'].includes(user.role)) {
      throw this.error(403, 'FORBIDDEN', 'Active organization membership is required');
    }
    const organization = await OrganizationModel.findOne({ _id: user.organizationId, isDeleted: false });
    if (!organization) throw this.error(403, 'ORGANIZATION_NOT_FOUND', 'Organisation not found');
    return { user, organizationId: organization._id };
  }

  private async assertListingOwner(listingId: string, organizationId: mongoose.Types.ObjectId) {
    const listing = await ListingModel.findOne({ _id: listingId, isDeleted: false });
    if (!listing) {
      throw this.error(404, 'LISTING_NOT_FOUND', 'Listing not found');
    }
    if (listing.organizationId.toString() !== organizationId.toString()) {
      throw this.error(403, 'FORBIDDEN_ORGANIZATION', 'Not authorized to manage this listing');
    }
    return listing;
  }

  /**
   * Triggers an asynchronous grading job for a listing.
   * Enforces minimum 3 photos and organization ownership.
   */
  async triggerGrading(userId: string, listingId: string): Promise<{
    listingId: string;
    gradingStatus: GradingStatus;
    message: string;
    mediaCount: number;
  }> {
    this.assertObjectId(listingId, 'listingId');
    const context = await this.getContext(userId, true);
    const listing = await this.assertListingOwner(listingId, context.organizationId);

    if (!['draft', 'published'].includes(listing.status)) {
      throw this.error(409, 'INVALID_LISTING_STATE', 'Grading can only be performed on draft or published listings');
    }

    // Minimum 3 photos check (PRD strict rule)
    const mediaList = await ListingMediaModel.find({ listingId }).lean();
    if (mediaList.length < 3) {
      throw this.error(
        422,
        'INSUFFICIENT_PHOTOS',
        `At least 3 photos are required for AI condition grading. Currently uploaded: ${mediaList.length}`
      );
    }

    // Idempotency: if currently queued or processing, return existing state
    if (this.processingQueue.has(listingId) || listing.gradingStatus === 'processing') {
      return {
        listingId,
        gradingStatus: listing.gradingStatus,
        message: 'Grading is currently in progress',
        mediaCount: mediaList.length,
      };
    }

    // Update listing status to queued
    listing.gradingStatus = 'queued';
    await listing.save();

    // Create or update grading document in queued state
    await ListingGradingModel.findOneAndUpdate(
      { listingId: listing._id },
      {
        $set: {
          organizationId: listing.organizationId,
          mediaIds: mediaList.map((m) => m._id),
          status: 'queued',
          rubricVersion: CURRENT_GRADING_RUBRIC_VERSION,
        },
      },
      { upsert: true, new: true }
    );

    // Schedule background asynchronous grading execution
    this.enqueueGradingJob(listingId);

    return {
      listingId,
      gradingStatus: 'queued',
      message: 'Grading job successfully queued for execution',
      mediaCount: mediaList.length,
    };
  }

  /**
   * Asynchronous background job queue execution
   */
  private enqueueGradingJob(listingId: string) {
    if (this.processingQueue.has(listingId)) return;
    this.processingQueue.add(listingId);

    // Run asynchronously without blocking HTTP response
    setImmediate(async () => {
      try {
        await this.executeGradingJob(listingId);
      } catch (err) {
        console.error(`[GradingJob] Failed for listing ${listingId}:`, err);
      } finally {
        this.processingQueue.delete(listingId);
      }
    });
  }

  /**
   * Authoritative execution of the grading pipeline
   */
  async executeGradingJob(listingId: string): Promise<IListingGrading> {
    const listing = await ListingModel.findById(listingId);
    if (!listing || listing.isDeleted) {
      throw this.error(404, 'LISTING_NOT_FOUND', 'Listing not found for grading job');
    }

    const mediaList = await ListingMediaModel.find({ listingId: listing._id }).lean();
    if (mediaList.length < 3) {
      listing.gradingStatus = 'failed';
      await listing.save();
      throw this.error(422, 'INSUFFICIENT_PHOTOS', 'Insufficient photos for grading execution');
    }

    // Transition to processing state
    listing.gradingStatus = 'processing';
    await listing.save();

    await ListingGradingModel.updateOne(
      { listingId: listing._id },
      { $set: { status: 'processing', mediaIds: mediaList.map((m) => m._id) } },
      { upsert: true }
    );

    try {
      // 1. Fetch photo buffers from storage provider
      const photosForInference = [];
      for (const m of mediaList) {
        const file = await storageProvider.get(m.storageKey);
        photosForInference.push({
          id: m._id.toString(),
          mimeType: m.mimeType,
          buffer: file.buffer,
          originalFilename: m.originalFilename,
        });
      }

      // 2. Obtain vision provider
      const provider = getVisionGradingProvider();

      // 3. Call vision model
      const result = await provider.gradePhotos({
        listingId: listing._id.toString(),
        materialCategory: listing.materialCategory,
        materialSubtype: listing.materialSubtype,
        title: listing.title,
        description: listing.description || '',
        photos: photosForInference,
        rubricVersion: CURRENT_GRADING_RUBRIC_VERSION,
      });

      // 4. Evaluate low-confidence rule: PRD requires confidence < 0.7 to trigger manual review
      const manualConfirmationRequired = result.confidence < 0.7;
      const gradingStatus: GradingStatus = manualConfirmationRequired
        ? 'manual_review_required'
        : 'completed';

      // 5. Persist grading result in MongoDB
      const gradingRecord = await ListingGradingModel.findOneAndUpdate(
        { listingId: listing._id },
        {
          $set: {
            organizationId: listing.organizationId,
            mediaIds: mediaList.map((m) => m._id),
            provider: provider.providerName,
            model: provider.modelName,
            rubricVersion: CURRENT_GRADING_RUBRIC_VERSION,
            grade: result.grade,
            gradeSource: 'ai',
            confidence: result.confidence,
            manualConfirmationRequired,
            damage: result.damage,
            contamination: result.contamination,
            reusableUnitsEstimate: result.reusableUnitsEstimate,
            notes: result.notes,
            status: gradingStatus,
            errorMessage: undefined,
            rawResponseSanitized: {
              materialDetected: result.materialDetected,
              timestamp: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );

      // 6. Update listing state
      listing.gradingStatus = gradingStatus;
      listing.gradingId = gradingRecord._id as mongoose.Types.ObjectId;

      if (!manualConfirmationRequired) {
        listing.grade = result.grade;
        listing.gradeSource = 'ai';
      }

      await listing.save();

      // Audit trail
      await OrganizationAuditModel.create({
        actorId: listing.organizationId, // System / org audit
        organizationId: listing.organizationId,
        action: 'listing.ai_graded',
        target: listing._id.toString(),
        metadata: {
          grade: result.grade,
          confidence: result.confidence,
          manualConfirmationRequired,
          provider: provider.providerName,
        },
      });

      return gradingRecord;
    } catch (err: any) {
      listing.gradingStatus = 'failed';
      await listing.save();

      await ListingGradingModel.updateOne(
        { listingId: listing._id },
        {
          $set: {
            status: 'failed',
            errorMessage: err.message?.slice(0, 500) || 'Unknown vision model grading error',
          },
        }
      );

      throw err;
    }
  }

  /**
   * Retrieves the grading details for a listing
   */
  async getGrading(userId: string | undefined, listingId: string): Promise<IListingGrading> {
    this.assertObjectId(listingId, 'listingId');
    const listing = await ListingModel.findOne({ _id: listingId, isDeleted: false });
    if (!listing) {
      throw this.error(404, 'LISTING_NOT_FOUND', 'Listing not found');
    }

    // Draft privacy isolation: only owner can view draft grading
    if (listing.status === 'draft') {
      if (!userId) {
        throw this.error(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for draft listing');
      }
      const context = await this.getContext(userId, false);
      if (listing.organizationId.toString() !== context.organizationId.toString()) {
        throw this.error(404, 'LISTING_NOT_FOUND', 'Listing not found');
      }
    }

    const grading = await ListingGradingModel.findOne({ listingId }).populate('mediaIds', 'storageKey originalFilename mimeType');
    if (!grading) {
      throw this.error(404, 'GRADING_NOT_FOUND', 'No grading record found for this listing');
    }

    return grading;
  }

  /**
   * Seller manual confirmation of AI grade
   */
  async confirmGrade(userId: string, listingId: string): Promise<IListingGrading> {
    this.assertObjectId(listingId, 'listingId');
    const context = await this.getContext(userId, true);
    const listing = await this.assertListingOwner(listingId, context.organizationId);

    const grading = await ListingGradingModel.findOne({ listingId: listing._id });
    if (!grading) {
      throw this.error(404, 'GRADING_NOT_FOUND', 'No grading record exists to confirm');
    }

    // Update listing to authoritative AI grade
    listing.grade = grading.grade;
    listing.gradeSource = 'ai';
    listing.gradingStatus = 'completed';
    await listing.save();

    grading.manualConfirmationRequired = false;
    grading.status = 'completed';
    grading.gradeSource = 'ai';
    await grading.save();

    await OrganizationAuditModel.create({
      actorId: context.user._id,
      organizationId: context.organizationId,
      action: 'listing.grade_confirmed',
      target: listing._id.toString(),
      metadata: { grade: grading.grade },
    });

    return grading;
  }

  /**
   * Seller manual override of AI grade with preserved audit trail
   */
  async overrideGrade(
    userId: string,
    listingId: string,
    newGrade: GradingGrade,
    reason: string
  ): Promise<IListingGrading> {
    this.assertObjectId(listingId, 'listingId');
    const validGrades: GradingGrade[] = ['A', 'B', 'C', 'reject'];
    if (!validGrades.includes(newGrade)) {
      throw this.error(400, 'INVALID_GRADE', 'Grade must be one of A, B, C, reject');
    }
    if (!reason || reason.trim().length < 5) {
      throw this.error(400, 'INVALID_REASON', 'A valid override reason of at least 5 characters is required');
    }

    const context = await this.getContext(userId, true);
    const listing = await this.assertListingOwner(listingId, context.organizationId);

    const grading = await ListingGradingModel.findOne({ listingId: listing._id });
    if (!grading) {
      throw this.error(404, 'GRADING_NOT_FOUND', 'No grading record exists to override');
    }

    const previousGrade = listing.grade;

    // Record override history without erasing original AI findings
    grading.overrideHistory.push({
      previousGrade,
      newGrade,
      userId: context.user._id as mongoose.Types.ObjectId,
      reason: reason.trim(),
      timestamp: new Date(),
    });

    grading.grade = newGrade;
    grading.gradeSource = 'manual';
    grading.manualConfirmationRequired = false;
    grading.status = 'completed';
    await grading.save();

    listing.grade = newGrade;
    listing.gradeSource = 'manual';
    listing.gradingStatus = 'completed';
    await listing.save();

    await OrganizationAuditModel.create({
      actorId: context.user._id,
      organizationId: context.organizationId,
      action: 'listing.grade_overridden',
      target: listing._id.toString(),
      metadata: { previousGrade, newGrade, reason: reason.trim() },
    });

    return grading;
  }
}

export const gradingService = new GradingService();
