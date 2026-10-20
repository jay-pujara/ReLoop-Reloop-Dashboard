import mongoose, { Document, Schema } from 'mongoose';

export type RequirementGrade = 'A' | 'B' | 'C' | 'reject';
export type RequirementStatus = 'active' | 'paused' | 'closed';
export type RequirementPeriod = 'weekly' | 'monthly';

export interface IRequirement extends Document {
  organizationId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  materialTypeId: mongoose.Types.ObjectId;
  materialCategory: string;
  materialSubtype: string;
  description: string;
  minGrade: RequirementGrade;
  massKgPerPeriod: number;
  period: RequirementPeriod;
  maxPricePerKg?: number;
  maxDistanceKm?: number;
  useCarbonLimit: boolean;
  status: RequirementStatus;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema<IRequirement>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    materialTypeId: { type: Schema.Types.ObjectId, ref: 'MaterialType', required: true, index: true },
    materialCategory: {
      type: String,
      required: true,
      enum: ['cardboard', 'plastics', 'pallets', 'drums', 'gaylords'],
      index: true,
    },
    materialSubtype: { type: String, required: true, index: true },
    description: { type: String, default: '', maxlength: 5000 },
    minGrade: { type: String, required: true, enum: ['A', 'B', 'C', 'reject'] },
    massKgPerPeriod: { type: Number, required: true, min: 0.001, max: 100000000 },
    period: { type: String, required: true, enum: ['weekly', 'monthly'] },
    maxPricePerKg: { type: Number, min: 0 },
    maxDistanceKm: { type: Number, min: 1, max: 20000 },
    useCarbonLimit: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      required: true,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

RequirementSchema.index({ organizationId: 1, createdAt: -1 });
RequirementSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
RequirementSchema.index({ status: 1, materialCategory: 1, createdAt: -1 });
RequirementSchema.index({ facilityId: 1, status: 1 });

export const RequirementModel = mongoose.model<IRequirement>('Requirement', RequirementSchema);
