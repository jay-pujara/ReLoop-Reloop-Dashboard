import mongoose, { Schema, Document } from 'mongoose';

export type MaterialType = 'cardboard' | 'plastic' | 'pallets' | string;
export type MaterialCondition = 'new' | 'reusable' | 'damaged_recyclable' | 'clean_scrap';
export type ListingStatus = 'available' | 'reserved' | 'completed' | 'cancelled';

export interface IMaterial extends Document {
  sellerOrganizationId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  materialType: MaterialType;
  condition: MaterialCondition;
  quantity: number;
  availableQuantity: number;
  unit: 'kg' | 'tonnes' | 'units' | 'pallets';
  pricePerUnit: number; // 0 represents free claim
  isFreeClaim: boolean;
  images: string[];
  pickupLocation: {
    address: string;
    city: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  status: ListingStatus;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    sellerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    materialType: {
      type: String,
      required: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ['new', 'reusable', 'damaged_recyclable', 'clean_scrap'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      enum: ['kg', 'tonnes', 'units', 'pallets'],
      required: true,
    },
    pricePerUnit: { type: Number, default: 0, min: 0 },
    isFreeClaim: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    pickupLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
      },
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'cancelled'],
      default: 'available',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

MaterialSchema.index({ 'pickupLocation.location': '2dsphere' });
MaterialSchema.index({ createdAt: -1 });

export const MaterialModel = mongoose.model<IMaterial>('Material', MaterialSchema);
