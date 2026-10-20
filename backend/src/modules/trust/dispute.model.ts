import mongoose, { Schema, Document } from 'mongoose';

export type DisputeReason = 'weight_mismatch' | 'quality_degraded' | 'contamination' | 'late_delivery' | 'cancellation';
export type DisputeStatus = 'opened' | 'in_review' | 'resolved' | 'dismissed';

export interface IDispute extends Document {
  orderId: mongoose.Types.ObjectId;
  openedByOrgId: mongoose.Types.ObjectId;
  targetOrgId: mongoose.Types.ObjectId;
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    openedByOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    targetOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    reason: {
      type: String,
      enum: ['weight_mismatch', 'quality_degraded', 'contamination', 'late_delivery', 'cancellation'],
      required: true,
    },
    description: { type: String, required: true },
    evidenceUrls: { type: [String], default: [] },
    status: { type: String, enum: ['opened', 'in_review', 'resolved', 'dismissed'], default: 'opened', index: true },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

export const DisputeModel = mongoose.model<IDispute>('Dispute', DisputeSchema);
