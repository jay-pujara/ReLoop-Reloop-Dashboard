import crypto from 'crypto';
import path from 'path';
import mongoose from 'mongoose';
import { ListingModel, IListing, ListingStatus } from './listing.model.js';
import { ListingMediaModel, IListingMedia } from './listingMedia.model.js';
import { MaterialTypeModel, isKnownMaterial } from './materialType.model.js';
import { FacilityModel } from '../facilities/facilities.model.js';
import { OrganizationModel } from '../organizations/organizations.model.js';
import { UserModel } from '../users/users.model.js';
import { OrganizationAuditModel } from '../organizations/audit.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { storageProvider } from '../../services/storage/storage.service.js';
import { ListingCsvParser } from './listingCsv.parser.js';
import { carbonService } from '../carbon/carbon.service.js';

const transitions: Record<ListingStatus, ListingStatus[]> = {
  draft: ['published', 'cancelled'],
  published: ['matched', 'cancelled'],
  matched: ['reserved', 'cancelled'],
  reserved: ['in-transit', 'cancelled'],
  'in-transit': ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export interface ListingInput {
  facilityId: string;
  materialCategory: string;
  materialSubtype: string;
  title: string;
  description?: string;
  grade: 'A' | 'B' | 'C' | 'reject';
  gradeSource?: 'seller' | 'ai' | 'manual';
  massKg: number;
  unitCount?: number;
  dimensionsMm?: { length: number; width: number; height: number };
  packagingState: 'new' | 'reusable' | 'damaged_recyclable' | 'clean_scrap';
  availableFrom: Date;
  availableUntil: Date;
  askingPrice?: { amount: number; currency: string };
  openToOffers: boolean;
  pickupConstraints: { dockHours: { opens: string; closes: string }; hasForklift: boolean; packagingMode: 'loose' | 'palletised' };
}

export interface ListingQuery {
  cursor?: string;
  limit: number;
  materialCategory?: string;
  materialSubtype?: string;
  grade?: string;
  status?: ListingStatus;
  facilityId?: string;
  organizationId?: string;
  longitude?: number;
  latitude?: number;
  radiusKm?: number;
}

export class ListingService {
  async create(userId: string, input: ListingInput): Promise<IListing> {
    const context = await this.getContext(userId, true);
    this.assertObjectId(input.facilityId, 'facilityId');
    const facility = await FacilityModel.findOne({ _id: input.facilityId, organizationId: context.organizationId, isDeleted: false });
    if (!facility) throw this.error(404, 'FACILITY_NOT_FOUND', 'Facility not found');
    this.validateMaterial(input.materialCategory, input.materialSubtype);
    const materialType = await this.getMaterialType(input.materialCategory, input.materialSubtype);
    const listing = await ListingModel.create({ ...input, organizationId: context.organizationId, materialTypeId: materialType._id, gradeSource: 'seller' });
    await this.audit(userId, context.organizationId, 'listing.created', listing._id.toString());
    return listing;
  }

  async getById(userId: string | undefined, listingId: string): Promise<IListing | null> {
    this.assertObjectId(listingId, 'listingId');
    const listing = await ListingModel.findOne({ _id: listingId, isDeleted: false }).populate('facilityId materialTypeId', 'name address location slug category');
    if (!listing) return null;
    const isOwner = Boolean(userId && (await UserModel.exists({ _id: userId, organizationId: listing.organizationId, isDeleted: false })));
    if (listing.status === 'draft' && !isOwner) return null;
    if (!isOwner && !['published', 'matched', 'reserved', 'in-transit', 'completed'].includes(listing.status)) return null;
    return listing;
  }

  async update(userId: string, listingId: string, updates: Partial<ListingInput>): Promise<IListing> {
    this.assertObjectId(listingId, 'listingId');
    const context = await this.getContext(userId, true);
    const existing = await this.assertOwner(listingId, context.organizationId);
    if (!['draft', 'published'].includes(existing.status)) throw this.error(409, 'LISTING_NOT_EDITABLE', 'Only draft or published listings can be edited');
    if (updates.facilityId) {
      const facility = await FacilityModel.exists({ _id: updates.facilityId, organizationId: context.organizationId, isDeleted: false });
      if (!facility) throw this.error(404, 'FACILITY_NOT_FOUND', 'Facility not found');
    }
    const safeUpdates = { ...updates } as Record<string, unknown>;
    delete safeUpdates.gradeSource;
    if (updates.materialCategory || updates.materialSubtype) this.validateMaterial(updates.materialCategory || existing.materialCategory, updates.materialSubtype || existing.materialSubtype);
    const nextFrom = updates.availableFrom || existing.availableFrom;
    const nextUntil = updates.availableUntil || existing.availableUntil;
    if (nextFrom > nextUntil) throw this.error(422, 'INVALID_AVAILABILITY', 'availableFrom must be before or equal to availableUntil');
    const updated = await ListingModel.findOneAndUpdate({ _id: listingId, organizationId: context.organizationId, isDeleted: false }, { $set: safeUpdates }, { new: true, runValidators: true });
    if (!updated) throw this.error(404, 'LISTING_NOT_FOUND', 'Listing not found');
    await this.audit(userId, context.organizationId, 'listing.updated', listingId);
    return updated;
  }

  async publish(userId: string, listingId: string): Promise<IListing> {
    this.assertObjectId(listingId, 'listingId');
    const context = await this.getContext(userId, true);
    const listing = await this.assertOwner(listingId, context.organizationId);
    if (listing.status !== 'draft') throw this.error(409, 'INVALID_STATUS_TRANSITION', 'Only draft listings can be published');
    const mediaCount = await ListingMediaModel.countDocuments({ listingId: listing._id, organizationId: context.organizationId });
    if (mediaCount < 3) throw this.error(422, 'MINIMUM_MEDIA_REQUIRED', 'At least 3 photos are required before publishing');
    const updated = await ListingModel.findOneAndUpdate({ _id: listing._id, organizationId: context.organizationId, status: 'draft' }, { $set: { status: 'published' } }, { new: true });
    if (!updated) throw this.error(409, 'INVALID_STATUS_TRANSITION', 'Listing changed before it could be published');
    await this.audit(userId, context.organizationId, 'listing.published', listingId);
    return updated;
  }

  async transition(userId: string, listingId: string, nextStatus: ListingStatus): Promise<IListing> {
    this.assertObjectId(listingId, 'listingId');
    const context = await this.getContext(userId, true);
    const listing = await this.assertOwner(listingId, context.organizationId);
    if (!transitions[listing.status].includes(nextStatus)) throw this.error(409, 'INVALID_STATUS_TRANSITION', `Cannot transition listing from ${listing.status} to ${nextStatus}`);
    const updated = await ListingModel.findOneAndUpdate({ _id: listingId, organizationId: context.organizationId, status: listing.status }, { $set: { status: nextStatus } }, { new: true });
    if (!updated) throw this.error(409, 'INVALID_STATUS_TRANSITION', 'Listing changed before the transition completed');
    await this.audit(userId, context.organizationId, `listing.${nextStatus}`, listingId);
    return updated;
  }

  async list(userId: string | undefined, query: ListingQuery) {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.status === 'draft') {
      if (!userId) return { items: [], nextCursor: null, hasMore: false };
      const user = await UserModel.findById(userId).select('organizationId');
      filter.organizationId = user?.organizationId;
      filter.status = 'draft';
    } else {
      filter.status = query.status || 'published';
      if (query.organizationId) filter.organizationId = query.organizationId;
    }
    if (query.materialCategory) filter.materialCategory = query.materialCategory;
    if (query.materialSubtype) filter.materialSubtype = query.materialSubtype;
    if (query.grade) filter.grade = query.grade;
    if (query.facilityId) filter.facilityId = query.facilityId;
    if (query.cursor) {
      const cursor = this.decodeCursor(query.cursor);
      filter.$or = [{ createdAt: { $lt: cursor.createdAt } }, { createdAt: cursor.createdAt, _id: { $lt: cursor.id } }];
    }
    if (query.longitude !== undefined && query.latitude !== undefined) {
      const facilities = await FacilityModel.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [query.longitude, query.latitude] }, $maxDistance: (query.radiusKm || 50) * 1000 } }, isDeleted: false }).select('_id').lean();
      filter.facilityId = { $in: facilities.map((facility) => facility._id) };
    }
    const rows = await ListingModel.find(filter).sort({ createdAt: -1, _id: -1 }).limit(query.limit + 1).populate('facilityId materialTypeId', 'name address location slug category').lean();
    const hasMore = rows.length > query.limit;
    const items = hasMore ? rows.slice(0, query.limit) : rows;
    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? this.encodeCursor(last.createdAt, last._id.toString()) : null, hasMore };
  }

  async addMedia(userId: string, listingId: string, file: { buffer: Buffer; originalname: string; mimetype: string; size: number }): Promise<IListingMedia> {
    this.assertObjectId(listingId, 'listingId');
    const context = await this.getContext(userId, true);
    const listing = await this.assertOwner(listingId, context.organizationId);
    if (!['draft', 'published'].includes(listing.status)) throw this.error(409, 'LISTING_NOT_EDITABLE', 'Media cannot be added to this listing');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) throw this.error(422, 'INVALID_MEDIA_TYPE', 'Only JPEG, PNG, and WebP images are supported');
    if (file.size > 10 * 1024 * 1024) throw this.error(422, 'MEDIA_TOO_LARGE', 'Image must be 10MB or smaller');

    const ext = path.extname(file.originalname).toLowerCase();
    const storageKey = `${context.organizationId}/${listingId}/${crypto.randomUUID()}${ext}`;
    await storageProvider.upload(storageKey, file.buffer, file.mimetype);

    try {
      const media = await ListingMediaModel.create({
        listingId,
        organizationId: context.organizationId,
        storageKey,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      });
      await this.audit(userId, context.organizationId, 'listing.media_added', listingId, { mediaId: media._id.toString() });
      return media;
    } catch (error) {
      await storageProvider.delete(storageKey);
      throw error;
    }
  }

  async getMedia(userId: string | undefined, listingId: string): Promise<IListingMedia[]> {
    this.assertObjectId(listingId, 'listingId');
    const listing = await this.getById(userId, listingId);
    if (!listing) return [];
    return ListingMediaModel.find({ listingId }).sort({ createdAt: 1 });
  }

  async getMediaFile(userId: string | undefined, listingId: string, mediaId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    this.assertObjectId(listingId, 'listingId');
    this.assertObjectId(mediaId, 'mediaId');
    const mediaList = await this.getMedia(userId, listingId);
    const media = mediaList.find((item) => item._id.toString() === mediaId);
    if (!media) return null;
    const file = await storageProvider.get(media.storageKey);
    return { buffer: file.buffer, mimeType: media.mimeType };
  }

  async bulkImport(userId: string, csvBuffer: Buffer): Promise<{ created: number; failed: number; errors: Array<{ row: number; field: string; message: string }>; listingIds: string[] }> {
    const context = await this.getContext(userId, true);
    const { validRows, errors } = await ListingCsvParser.parseAndValidate(csvBuffer, context.organizationId);

    const result = {
      created: 0,
      failed: errors.length,
      errors: [...errors],
      listingIds: [] as string[],
    };

    for (const valid of validRows) {
      try {
        const listing = await this.create(userId, valid.input);
        result.created += 1;
        result.listingIds.push(listing._id.toString());
      } catch (err) {
        result.failed += 1;
        result.errors.push({
          row: valid.rowNumber,
          field: 'listing',
          message: err instanceof Error ? err.message : 'Could not create listing',
        });
      }
    }

    return result;
  }

  private async getContext(userId: string, requireAdmin: boolean) {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId role');
    if (!user?.organizationId) throw this.error(403, 'ORGANIZATION_REQUIRED', 'An organisation is required');
    if (requireAdmin && !['owner', 'admin'].includes(user.role)) throw this.error(403, 'FORBIDDEN', 'Listing management permission is required');
    const organization = await OrganizationModel.findOne({ _id: user.organizationId, isDeleted: false });
    if (!organization) throw this.error(403, 'ORGANIZATION_NOT_FOUND', 'Organisation not found');
    return { organizationId: organization._id };
  }

  async getBreakEven(listingId: string) {
    this.assertObjectId(listingId, 'listingId');
    const listing = await ListingModel.findOne({ _id: listingId, isDeleted: false });
    if (!listing) throw this.error(404, 'LISTING_NOT_FOUND', 'Listing not found');

    const facility = await FacilityModel.findOne({ _id: listing.facilityId, isDeleted: false });
    const metrics = carbonService.calculateMetrics({
      materialCategory: listing.materialCategory,
      materialSubtype: listing.materialSubtype,
      massKg: listing.massKg,
      distanceKm: 0,
    });

    return {
      listingId: listing._id,
      title: listing.title,
      materialCategory: listing.materialCategory,
      materialSubtype: listing.materialSubtype,
      massKg: listing.massKg,
      facility: facility ? { id: facility._id, name: facility.name, location: facility.location } : null,
      grossAvoidedKg: metrics.grossAvoidedKg,
      reprocessKg: metrics.reprocessKg,
      breakEvenRadiusKm: metrics.breakEvenRadiusKm,
      emissionFactors: {
        virgin: metrics.efVirgin,
        reprocess: metrics.efReprocess,
        freightPerTonneKm: metrics.efFreight,
        loadFactor: metrics.loadFactor,
      },
      methodologyVersion: metrics.methodologyVersion,
    };
  }

  private async assertOwner(listingId: string, organizationId: mongoose.Types.ObjectId): Promise<IListing> {
    const listing = await ListingModel.findOne({ _id: listingId, organizationId, isDeleted: false });
    if (!listing) throw this.error(404, 'LISTING_NOT_FOUND', 'Listing not found');
    return listing;
  }

  private async getMaterialType(category: string, subtype: string) {
    const name = subtype.replace(/_/g, ' ');
    return MaterialTypeModel.findOneAndUpdate({ slug: subtype }, { $setOnInsert: { slug: subtype, category, name, active: true } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  private validateMaterial(category: string, subtype: string): void {
    if (!isKnownMaterial(category, subtype)) throw this.error(422, 'INVALID_MATERIAL_TYPE', 'Unknown material category or subtype');
  }

  private assertObjectId(value: string, field: string): void {
    if (!mongoose.isValidObjectId(value)) throw this.error(400, 'INVALID_IDENTIFIER', `${field} is invalid`);
  }

  private async audit(userId: string, organizationId: mongoose.Types.ObjectId, action: string, target: string, metadata?: Record<string, unknown>) {
    await OrganizationAuditModel.create({ actorId: userId, organizationId, action, target, metadata });
  }

  private encodeCursor(createdAt: Date, id: string): string { return Buffer.from(JSON.stringify({ createdAt, id })).toString('base64url'); }
  private decodeCursor(cursor: string): { createdAt: Date; id: string } {
    try { const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { createdAt: string; id: string }; if (!value.createdAt || !mongoose.isValidObjectId(value.id)) throw new Error(); return { createdAt: new Date(value.createdAt), id: value.id }; }
    catch { throw this.error(400, 'INVALID_CURSOR', 'Pagination cursor is invalid'); }
  }

  private error(statusCode: number, code: string, message: string): AppError { const error = new Error(message) as AppError; error.statusCode = statusCode; error.code = code; return error; }
}

export const listingService = new ListingService();
