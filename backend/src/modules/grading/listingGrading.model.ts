import mongoose, { Document, Schema } from 'mongoose';
import {
  GradingGrade,
  GradeSource,
  GradingStatus,
  DamageItem,
  ContaminationItem,
  GradeOverrideEntry,
} from './grading.types.js';

export interface IListingGrading extends Document {
  listingId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  mediaIds: mongoose.Types.ObjectId[];
  provider: string;
  aiModel: string;
  rubricVersion: string;
  grade: GradingGrade;
  gradeSource: GradeSource;
  confidence: number;
  manualConfirmationRequired: boolean;
  damage: DamageItem[];
  contamination: ContaminationItem[];
  reusableUnitsEstimate?: number;
  notes: string;
  status: GradingStatus;
  errorMessage?: string;
  overrideHistory: GradeOverrideEntry[];
  rawResponseSanitized?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DamageSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    severity: { type: String, required: true, enum: ['minor', 'moderate', 'severe'] },
    region: { type: String, trim: true },
  },
  { _id: false }
);

const ContaminationSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    severity: { type: String, required: true, enum: ['none', 'low', 'moderate', 'high'] },
  },
  { _id: false }
);

const OverrideHistorySchema = new Schema(
  {
    previousGrade: { type: String, required: true, enum: ['A', 'B', 'C', 'reject'] },
    newGrade: { type: String, required: true, enum: ['A', 'B', 'C', 'reject'] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ListingGradingSchema = new Schema<IListingGrading>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    mediaIds: [{ type: Schema.Types.ObjectId, ref: 'ListingMedia', required: true }],
    provider: { type: String, required: true, trim: true },
    aiModel: { type: String, required: true, trim: true },
    rubricVersion: { type: String, required: true, trim: true },
    grade: { type: String, required: true, enum: ['A', 'B', 'C', 'reject'] },
    gradeSource: { type: String, required: true, enum: ['seller', 'ai', 'manual'], default: 'ai' },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    manualConfirmationRequired: { type: Boolean, required: true, default: false },
    damage: { type: [DamageSchema], default: [] },
    contamination: { type: [ContaminationSchema], default: [] },
    reusableUnitsEstimate: { type: Number, min: 0 },
    notes: { type: String, default: '', maxlength: 5000 },
    status: {
      type: String,
      required: true,
      enum: ['queued', 'processing', 'completed', 'manual_review_required', 'failed'],
      default: 'queued',
      index: true,
    },
    errorMessage: { type: String, maxlength: 1000 },
    overrideHistory: { type: [OverrideHistorySchema], default: [] },
    rawResponseSanitized: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ListingGradingSchema.index({ listingId: 1, createdAt: -1 });
ListingGradingSchema.index({ organizationId: 1, status: 1 });

export const ListingGradingModel = mongoose.model<IListingGrading>('ListingGrading', ListingGradingSchema);
