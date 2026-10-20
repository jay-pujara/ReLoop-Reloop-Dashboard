import mongoose, { Document, Schema } from 'mongoose';

export interface IListingMedia extends Document {
  listingId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}

const ListingMediaSchema = new Schema<IListingMedia>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    storageKey: { type: String, required: true, unique: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
    sizeBytes: { type: Number, required: true, min: 1, max: 10 * 1024 * 1024 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ListingMediaSchema.index({ listingId: 1, createdAt: 1 });

export const ListingMediaModel = mongoose.model<IListingMedia>('ListingMedia', ListingMediaSchema);
