import mongoose, { Document, Schema } from 'mongoose';

export interface ICarbon extends Document {
  entityId: mongoose.Types.ObjectId; // could be listing, shipment, transaction
  entityType: string; // e.g., 'listing', 'shipment', 'transaction'
  carbonKg: number; // netSavedKg
  grossAvoidedKg?: number;
  reprocessKg?: number;
  transportKg?: number;
  netSavedKg?: number;
  breakEvenRadiusKm?: number;
  classification?: 'carbon-positive' | 'marginal' | 'carbon-negative';
  materialCategory?: string;
  materialSubtype?: string;
  massKg?: number;
  distanceKm?: number;
  efVirgin?: number;
  efReprocess?: number;
  efFreight?: number;
  loadFactor?: number;
  methodologyVersion: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const CarbonSchema = new Schema<ICarbon>(
  {
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    carbonKg: { type: Number, required: true },
    grossAvoidedKg: { type: Number },
    reprocessKg: { type: Number },
    transportKg: { type: Number },
    netSavedKg: { type: Number },
    breakEvenRadiusKm: { type: Number },
    classification: {
      type: String,
      enum: ['carbon-positive', 'marginal', 'carbon-negative'],
      default: 'carbon-positive',
    },
    materialCategory: { type: String },
    materialSubtype: { type: String },
    massKg: { type: Number },
    distanceKm: { type: Number },
    efVirgin: { type: Number },
    efReprocess: { type: Number },
    efFreight: { type: Number },
    loadFactor: { type: Number },
    methodologyVersion: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CarbonModel = mongoose.model<ICarbon>('Carbon', CarbonSchema);

