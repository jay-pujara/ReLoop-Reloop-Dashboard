import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  facilityType: 'manufacturing_plant' | 'warehouse' | 'retail_depot' | 'recycling_yard' | 'transfer_station';
  operatingHours?: Record<string, { closed: boolean; opens?: string; closes?: string }>;
  hasForklift: boolean;
  dockCount?: number;
  contactPerson?: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    facilityType: {
      type: String,
      enum: ['manufacturing_plant', 'warehouse', 'retail_depot', 'recycling_yard', 'transfer_station'],
      required: true,
      index: true,
    },
    operatingHours: { type: Schema.Types.Mixed },
    hasForklift: { type: Boolean, default: false },
    dockCount: { type: Number, default: 1 },
    contactPerson: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true, default: 'USA' },
      postalCode: { type: String },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

FacilitySchema.index({ location: '2dsphere' });
FacilitySchema.index({ organizationId: 1, createdAt: -1 });

export const FacilityModel = mongoose.model<IFacility>('Facility', FacilitySchema);
