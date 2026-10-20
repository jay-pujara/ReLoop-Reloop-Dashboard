import mongoose, { Document, Schema } from 'mongoose';

export type ListingGrade = 'A' | 'B' | 'C' | 'reject';
export type GradeSource = 'seller' | 'ai' | 'manual';
export type ListingStatus = 'draft' | 'published' | 'matched' | 'reserved' | 'in-transit' | 'completed' | 'cancelled';
export type PackagingState = 'new' | 'reusable' | 'damaged_recyclable' | 'clean_scrap';
export type PackagingMode = 'loose' | 'palletised';

export interface IListing extends Document {
  organizationId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  materialTypeId: mongoose.Types.ObjectId;
  materialCategory: string;
  materialSubtype: string;
  title: string;
  description: string;
  grade: ListingGrade;
  gradeSource: GradeSource;
  massKg: number;
  unitCount?: number;
  dimensionsMm?: { length: number; width: number; height: number };
  packagingState: PackagingState;
  availableFrom: Date;
  availableUntil: Date;
  askingPrice?: { amount: number; currency: string };
  openToOffers: boolean;
  pickupConstraints: {
    dockHours: { opens: string; closes: string };
    hasForklift: boolean;
    packagingMode: PackagingMode;
  };
  gradingStatus: 'not_started' | 'queued' | 'processing' | 'completed' | 'manual_review_required' | 'failed';
  gradingId?: mongoose.Types.ObjectId;
  embedding?: number[];
  embeddingMetadata?: {
    model: string;
    dimension: number;
    version: string;
    generatedAt: Date;
  };
  status: ListingStatus;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    materialTypeId: { type: Schema.Types.ObjectId, ref: 'MaterialType', required: true, index: true },
    materialCategory: { type: String, required: true, index: true },
    materialSubtype: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', maxlength: 5000 },
    grade: { type: String, required: true, enum: ['A', 'B', 'C', 'reject'] },
    gradeSource: { type: String, required: true, enum: ['seller', 'ai', 'manual'], default: 'seller' },
    gradingStatus: {
      type: String,
      required: true,
      enum: ['not_started', 'queued', 'processing', 'completed', 'manual_review_required', 'failed'],
      default: 'not_started',
      index: true,
    },
    gradingId: { type: Schema.Types.ObjectId, ref: 'ListingGrading' },
    embedding: { type: [Number], select: false },
    embeddingMetadata: {
      model: { type: String },
      dimension: { type: Number },
      version: { type: String },
      generatedAt: { type: Date },
    },
    massKg: { type: Number, required: true, min: 0.001, max: 100000000 },
    unitCount: { type: Number, min: 1, max: 100000000, validate: Number.isInteger },
    dimensionsMm: {
      length: { type: Number, min: 0.001, max: 1000000 },
      width: { type: Number, min: 0.001, max: 1000000 },
      height: { type: Number, min: 0.001, max: 1000000 },
    },
    packagingState: { type: String, required: true, enum: ['new', 'reusable', 'damaged_recyclable', 'clean_scrap'] },
    availableFrom: { type: Date, required: true },
    availableUntil: { type: Date, required: true },
    askingPrice: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
    },
    openToOffers: { type: Boolean, required: true, default: false },
    pickupConstraints: {
      dockHours: {
        opens: { type: String, required: true },
        closes: { type: String, required: true },
      },
      hasForklift: { type: Boolean, required: true },
      packagingMode: { type: String, required: true, enum: ['loose', 'palletised'] },
    },
    status: { type: String, required: true, enum: ['draft', 'published', 'matched', 'reserved', 'in-transit', 'completed', 'cancelled'], default: 'draft', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

ListingSchema.index({ organizationId: 1, createdAt: -1 });
ListingSchema.index({ status: 1, materialCategory: 1, createdAt: -1 });
ListingSchema.index({ facilityId: 1, status: 1, createdAt: -1 });
ListingSchema.index({ availableFrom: 1, availableUntil: 1 });
ListingSchema.index({ gradingStatus: 1, createdAt: -1 });

ListingSchema.pre('validate', function validateWindow(next) {
  if (this.availableFrom && this.availableUntil && this.availableFrom > this.availableUntil) {
    next(new Error('availableFrom must be before or equal to availableUntil'));
    return;
  }
  next();
});

export const ListingModel = mongoose.model<IListing>('Listing', ListingSchema);
