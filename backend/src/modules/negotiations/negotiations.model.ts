import mongoose, { Schema, Document } from 'mongoose';

export type NegotiationStatus = 'proposed' | 'counter_offered' | 'accepted' | 'rejected';

export interface INegotiation extends Document {
  materialId?: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  buyerOrganizationId: mongoose.Types.ObjectId;
  sellerOrganizationId: mongoose.Types.ObjectId;
  offeredPricePerUnit: number;
  offeredQuantity: number;
  counterPricePerUnit?: number;
  counterQuantity?: number;
  status: NegotiationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NegotiationSchema = new Schema<INegotiation>(
  {
    materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: false, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: false, index: true },
    buyerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    sellerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    offeredPricePerUnit: { type: Number, required: true },
    offeredQuantity: { type: Number, required: true },
    counterPricePerUnit: { type: Number },
    counterQuantity: { type: Number },
    status: {
      type: String,
      enum: ['proposed', 'counter_offered', 'accepted', 'rejected'],
      default: 'proposed',
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const NegotiationModel = mongoose.model<INegotiation>('Negotiation', NegotiationSchema);
