import { OrganizationModel, IOrganization } from './organizations.model.js';
import { UserModel } from '../users/users.model.js';
import { FacilityModel, IFacility } from '../facilities/facilities.model.js';
import { OrganizationAuditModel } from './audit.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class OrganizationsService {
  async getById(id: string): Promise<IOrganization | null> {
    return OrganizationModel.findOne({ _id: id, isDeleted: false });
  }

  async create(data: Partial<IOrganization>): Promise<IOrganization> {
    return OrganizationModel.create({
      ...data,
      legalName: data.legalName || data.name,
      name: data.name || data.legalName,
    });
  }

  async list(): Promise<IOrganization[]> {
    return OrganizationModel.find({ isDeleted: false }).limit(50);
  }

  async getForUser(userId: string): Promise<IOrganization | null> {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId');
    return user?.organizationId ? OrganizationModel.findOne({ _id: user.organizationId, isDeleted: false }) : null;
  }

  async updateForUser(userId: string, data: Partial<IOrganization>): Promise<IOrganization> {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId role');
    if (!user?.organizationId) throw this.error(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    if (!['owner', 'admin'].includes(user.role)) throw this.error(403, 'FORBIDDEN', 'Organization administration permission is required');

    const update = { ...data } as Record<string, unknown>;
    delete update.verificationStatus;
    delete update.verified;
    delete update.organizationId;
    if (update.legalName && !update.name) update.name = update.legalName;
    const organization = await OrganizationModel.findOneAndUpdate(
      { _id: user.organizationId, isDeleted: false },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!organization) throw this.error(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    await OrganizationAuditModel.create({ actorId: userId, organizationId: organization._id, action: 'organization.updated', target: 'organization' });
    return organization;
  }

  async addFacility(userId: string, data: Partial<IFacility>): Promise<IFacility> {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId role');
    if (!user?.organizationId) throw this.error(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    if (!['owner', 'admin'].includes(user.role)) throw this.error(403, 'FORBIDDEN', 'Organization administration permission is required');
    const facility = await FacilityModel.create({ ...data, organizationId: user.organizationId });
    await OrganizationAuditModel.create({ actorId: userId, organizationId: user.organizationId, action: 'facility.created', target: facility._id.toString() });
    return facility;
  }

  async getFacilitiesForUser(userId: string): Promise<IFacility[]> {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId');
    if (!user?.organizationId) return [];
    return FacilityModel.find({ organizationId: user.organizationId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async submitVerification(userId: string, documents: unknown[]): Promise<IOrganization> {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select('organizationId role');
    if (!user?.organizationId) throw this.error(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found');
    if (!['owner', 'admin'].includes(user.role)) throw this.error(403, 'FORBIDDEN', 'Organization administration permission is required');
    const organization = await OrganizationModel.findOneAndUpdate(
      { _id: user.organizationId, isDeleted: false, verificationStatus: 'unverified' },
      { $set: { verificationStatus: 'document-submitted', verified: false } },
      { new: true }
    );
    if (!organization) throw this.error(409, 'INVALID_VERIFICATION_STATE', 'Organization verification has already been submitted or completed');
    await OrganizationAuditModel.create({ actorId: userId, organizationId: organization._id, action: 'verification.submitted', target: 'organization', metadata: { documentCount: documents.length } });
    return organization;
  }

  private error(statusCode: number, code: string, message: string): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }
}

export const organizationsService = new OrganizationsService();
