import mongoose, { Schema, Document } from 'mongoose';

export type OrganizationType = 'manufacturer' | 'retailer' | 'recycler' | 'logistics';
export type OrganizationRole = 'seller' | 'buyer' | 'recycler' | 'carrier';
export type VerificationStatus = 'unverified' | 'document-submitted' | 'verified';

export interface IOrganization extends Document {
  name: string;
  legalName: string;
  businessId?: string;
  type: OrganizationType;
  roles: OrganizationRole[];
  registrationNumber?: string;
  contactEmail: string;
  phone?: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  verified: boolean;
  verificationStatus: VerificationStatus;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, required: true, trim: true },
    businessId: { type: String, trim: true, uppercase: true },
    type: {
      type: String,
      enum: ['manufacturer', 'retailer', 'recycler', 'logistics'],
      required: true,
      index: true,
    },
    registrationNumber: { type: String, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true, default: 'USA' },
      postalCode: { type: String },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
    verified: { type: Boolean, default: false },
    roles: {
      type: [{ type: String, enum: ['seller', 'buyer', 'recycler', 'carrier'] }],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'document-submitted', 'verified'],
      default: 'unverified',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

OrganizationSchema.index({ location: '2dsphere' });
OrganizationSchema.index({ businessId: 1 }, { unique: true, sparse: true });

export const OrganizationModel = mongoose.model<IOrganization>('Organization', OrganizationSchema);
