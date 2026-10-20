import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganizationAudit extends Document {
  actorId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  action: string;
  target: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const OrganizationAuditSchema = new Schema<IOrganizationAudit>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OrganizationAuditModel = mongoose.model<IOrganizationAudit>('OrganizationAudit', OrganizationAuditSchema);