import mongoose from 'mongoose';
import { IRequirement, RequirementModel, RequirementGrade, RequirementPeriod, RequirementStatus } from './requirement.model.js';
import { MaterialTypeModel, isKnownMaterial } from '../listings/materialType.model.js';
import { FacilityModel } from '../facilities/facilities.model.js';
import { OrganizationModel } from '../organizations/organizations.model.js';
import { UserModel } from '../users/users.model.js';
import { OrganizationAuditModel } from '../organizations/audit.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface RequirementInput {
  facilityId: string;
  materialCategory: string;
  materialSubtype: string;
  description?: string;
  minGrade: RequirementGrade;
  massKgPerPeriod: number;
  period: RequirementPeriod;
  maxPricePerKg?: number;
  maxDistanceKm?: number;
  useCarbonLimit: boolean;
}

export interface RequirementQuery {
  cursor?: string;
  limit: number;
  status?: RequirementStatus;
  materialCategory?: string;
  materialSubtype?: string;
  facilityId?: string;
  minGrade?: string;
}

export class RequirementService {
  async create(userId: string, input: RequirementInput): Promise<IRequirement> {
    const context = await this.getContext(userId);
    this.assertObjectId(input.facilityId, 'facilityId');

    // Verify facility belongs to the authenticated organization
    const facility = await FacilityModel.findOne({
      _id: input.facilityId,
      organizationId: context.organizationId,
      isDeleted: false,
    });
    if (!facility) {
      throw this.error(404, 'FACILITY_NOT_FOUND', 'Facility not found or does not belong to your organisation');
    }

    // Validate material taxonomy against system catalog
    this.validateMaterial(input.materialCategory, input.materialSubtype);
    const materialType = await this.getMaterialType(input.materialCategory, input.materialSubtype);

    // Validate carbon limit / distance consistency
    if (!input.useCarbonLimit && (!input.maxDistanceKm || input.maxDistanceKm <= 0)) {
      throw this.error(422, 'INVALID_DISTANCE_CONFIGURATION', 'maxDistanceKm must be provided when useCarbonLimit is false');
    }

    const requirement = await RequirementModel.create({
      organizationId: context.organizationId,
      facilityId: input.facilityId,
      materialTypeId: materialType._id,
      materialCategory: input.materialCategory,
      materialSubtype: input.materialSubtype,
      description: input.description || '',
      minGrade: input.minGrade,
      massKgPerPeriod: input.massKgPerPeriod,
      period: input.period,
      maxPricePerKg: input.maxPricePerKg,
      maxDistanceKm: input.maxDistanceKm,
      useCarbonLimit: input.useCarbonLimit,
      status: 'active',
    });

    await this.audit(userId, context.organizationId, 'requirement.created', requirement._id.toString(), {
      materialCategory: input.materialCategory,
      materialSubtype: input.materialSubtype,
      minGrade: input.minGrade,
      massKgPerPeriod: input.massKgPerPeriod,
      period: input.period,
    });

    return requirement;
  }

  async list(userId: string, query: RequirementQuery) {
    const context = await this.getContext(userId);

    // Strict organization scoping: users only see their own organization's requirements
    const filter: Record<string, unknown> = {
      organizationId: context.organizationId,
      isDeleted: false,
    };

    if (query.status) filter.status = query.status;
    if (query.materialCategory) filter.materialCategory = query.materialCategory;
    if (query.materialSubtype) filter.materialSubtype = query.materialSubtype;
    if (query.facilityId) filter.facilityId = query.facilityId;
    if (query.minGrade) filter.minGrade = query.minGrade;

    if (query.cursor) {
      const cursor = this.decodeCursor(query.cursor);
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
      ];
    }

    const rows = await RequirementModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(query.limit + 1)
      .populate('facilityId materialTypeId', 'name address location slug category')
      .lean();

    const hasMore = rows.length > query.limit;
    const items = hasMore ? rows.slice(0, query.limit) : rows;
    const last = items[items.length - 1];

    return {
      items,
      nextCursor: hasMore && last ? this.encodeCursor(last.createdAt, last._id.toString()) : null,
      hasMore,
    };
  }

  async getById(userId: string, requirementId: string): Promise<IRequirement | null> {
    this.assertObjectId(requirementId, 'requirementId');
    const context = await this.getContext(userId);

    // Enforce organization scoping: prevent IDOR cross-organisation inspection
    const requirement = await RequirementModel.findOne({
      _id: requirementId,
      organizationId: context.organizationId,
      isDeleted: false,
    }).populate('facilityId materialTypeId', 'name address location slug category');

    return requirement;
  }

  async update(userId: string, requirementId: string, updates: Partial<RequirementInput>): Promise<IRequirement> {
    this.assertObjectId(requirementId, 'requirementId');
    const context = await this.getContext(userId);
    const existing = await this.assertOwner(requirementId, context.organizationId);

    if (existing.status === 'closed') {
      throw this.error(409, 'REQUIREMENT_CLOSED', 'Closed requirements cannot be modified');
    }

    if (updates.facilityId) {
      this.assertObjectId(updates.facilityId, 'facilityId');
      const facilityExists = await FacilityModel.exists({
        _id: updates.facilityId,
        organizationId: context.organizationId,
        isDeleted: false,
      });
      if (!facilityExists) {
        throw this.error(404, 'FACILITY_NOT_FOUND', 'Facility not found or does not belong to your organisation');
      }
    }

    // Check distance / carbon consistency
    const nextUseCarbon = updates.useCarbonLimit !== undefined ? updates.useCarbonLimit : existing.useCarbonLimit;
    const nextMaxDist = updates.maxDistanceKm !== undefined ? updates.maxDistanceKm : existing.maxDistanceKm;
    if (!nextUseCarbon && (!nextMaxDist || nextMaxDist <= 0)) {
      throw this.error(422, 'INVALID_DISTANCE_CONFIGURATION', 'maxDistanceKm must be provided when useCarbonLimit is false');
    }

    const safeUpdates = { ...updates } as Record<string, unknown>;
    // Protect immutable / administrative fields from client mutation
    delete safeUpdates.organizationId;
    delete safeUpdates.materialTypeId;
    delete safeUpdates.materialCategory;
    delete safeUpdates.materialSubtype;
    delete safeUpdates.status;

    const updated = await RequirementModel.findOneAndUpdate(
      { _id: requirementId, organizationId: context.organizationId, isDeleted: false },
      { $set: safeUpdates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw this.error(404, 'REQUIREMENT_NOT_FOUND', 'Requirement not found');
    }

    await this.audit(userId, context.organizationId, 'requirement.updated', requirementId, safeUpdates);
    return updated;
  }

  async pause(userId: string, requirementId: string): Promise<IRequirement> {
    this.assertObjectId(requirementId, 'requirementId');
    const context = await this.getContext(userId);
    const requirement = await this.assertOwner(requirementId, context.organizationId);

    if (requirement.status !== 'active') {
      throw this.error(409, 'INVALID_STATUS_TRANSITION', `Cannot pause a requirement with status '${requirement.status}'`);
    }

    const updated = await RequirementModel.findOneAndUpdate(
      { _id: requirementId, organizationId: context.organizationId, status: 'active' },
      { $set: { status: 'paused' } },
      { new: true }
    );

    if (!updated) {
      throw this.error(409, 'INVALID_STATUS_TRANSITION', 'Requirement status changed concurrently');
    }

    await this.audit(userId, context.organizationId, 'requirement.paused', requirementId);
    return updated;
  }

  async resume(userId: string, requirementId: string): Promise<IRequirement> {
    this.assertObjectId(requirementId, 'requirementId');
    const context = await this.getContext(userId);
    const requirement = await this.assertOwner(requirementId, context.organizationId);

    if (requirement.status !== 'paused') {
      throw this.error(409, 'INVALID_STATUS_TRANSITION', `Cannot resume a requirement with status '${requirement.status}'`);
    }

    const updated = await RequirementModel.findOneAndUpdate(
      { _id: requirementId, organizationId: context.organizationId, status: 'paused' },
      { $set: { status: 'active' } },
      { new: true }
    );

    if (!updated) {
      throw this.error(409, 'INVALID_STATUS_TRANSITION', 'Requirement status changed concurrently');
    }

    await this.audit(userId, context.organizationId, 'requirement.resumed', requirementId);
    return updated;
  }

  async close(userId: string, requirementId: string): Promise<IRequirement> {
    this.assertObjectId(requirementId, 'requirementId');
    const context = await this.getContext(userId);
    const requirement = await this.assertOwner(requirementId, context.organizationId);

    if (requirement.status === 'closed') {
      throw this.error(409, 'INVALID_STATUS_TRANSITION', 'Requirement is already closed');
    }

    const updated = await RequirementModel.findOneAndUpdate(
      { _id: requirementId, organizationId: context.organizationId },
      { $set: { status: 'closed' } },
      { new: true }
    );

    if (!updated) {
      throw this.error(404, 'REQUIREMENT_NOT_FOUND', 'Requirement not found');
    }

    await this.audit(userId, context.organizationId, 'requirement.closed', requirementId);
    return updated;
  }

  private async getContext(userId: string) {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId role');
    if (!user?.organizationId) {
      throw this.error(403, 'ORGANIZATION_REQUIRED', 'An active organisation context is required');
    }
    const organization = await OrganizationModel.findOne({ _id: user.organizationId, isDeleted: false });
    if (!organization) {
      throw this.error(403, 'ORGANIZATION_NOT_FOUND', 'Organisation not found');
    }
    return { organizationId: organization._id, role: user.role };
  }

  private async assertOwner(requirementId: string, organizationId: mongoose.Types.ObjectId): Promise<IRequirement> {
    const requirement = await RequirementModel.findOne({ _id: requirementId, organizationId, isDeleted: false });
    if (!requirement) {
      throw this.error(404, 'REQUIREMENT_NOT_FOUND', 'Requirement not found');
    }
    return requirement;
  }

  private async getMaterialType(category: string, subtype: string) {
    const name = subtype.replace(/_/g, ' ');
    return MaterialTypeModel.findOneAndUpdate(
      { slug: subtype },
      { $setOnInsert: { slug: subtype, category, name, active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  private validateMaterial(category: string, subtype: string): void {
    if (!isKnownMaterial(category, subtype)) {
      throw this.error(422, 'INVALID_MATERIAL_TYPE', `Unknown material category '${category}' or subtype '${subtype}'`);
    }
  }

  private assertObjectId(value: string, field: string): void {
    if (!mongoose.isValidObjectId(value)) {
      throw this.error(400, 'INVALID_IDENTIFIER', `${field} is invalid`);
    }
  }

  private async audit(
    userId: string,
    organizationId: mongoose.Types.ObjectId,
    action: string,
    target: string,
    metadata?: Record<string, unknown>
  ) {
    await OrganizationAuditModel.create({ actorId: userId, organizationId, action, target, metadata });
  }

  private encodeCursor(createdAt: Date, id: string): string {
    return Buffer.from(JSON.stringify({ createdAt, id })).toString('base64url');
  }

  private decodeCursor(cursor: string): { createdAt: Date; id: string } {
    try {
      const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { createdAt: string; id: string };
      if (!value.createdAt || !mongoose.isValidObjectId(value.id)) throw new Error();
      return { createdAt: new Date(value.createdAt), id: value.id };
    } catch {
      throw this.error(400, 'INVALID_CURSOR', 'Pagination cursor is invalid');
    }
  }

  private error(statusCode: number, code: string, message: string): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }
}

export const requirementService = new RequirementService();
