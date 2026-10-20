import mongoose, { Schema, Document } from 'mongoose';

export interface ICarbonLedgerEntry extends Document {
  organizationId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  transactionId?: mongoose.Types.ObjectId;
  eventType: 'material_diverted' | 'reusable_cycle_completed' | 'virgin_avoidance';
  materialType: string;
  materialSubtype?: string;

  // PRD Core Calculation Fields
  massKg: number;
  weightKg: number; // backward compatibility
  distanceKm?: number;
  virginEmissionFactor?: number;
  reprocessEmissionFactor?: number;
  freightEmissionFactor?: number;
  loadFactor?: number;
  allocatedKm?: number;
  grossAvoidedKg?: number;
  transportEmissionsKg?: number;
  netSavedKg: number;
  co2eAvoidedKg: number; // backward compatibility

  factorVersion: string;
  methodology: string;

  // Cryptographic immutability & chaining
  previousHash: string;
  entryHash: string;
  verificationHash: string; // backward compatibility
  signature?: string;

  timestamp: Date;
}

const CarbonLedgerSchema = new Schema<ICarbonLedgerEntry>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', index: true },
    eventType: {
      type: String,
      enum: ['material_diverted', 'reusable_cycle_completed', 'virgin_avoidance'],
      required: true,
    },
    materialType: { type: String, required: true },
    materialSubtype: { type: String },

    massKg: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    distanceKm: { type: Number, default: 0 },
    virginEmissionFactor: { type: Number },
    reprocessEmissionFactor: { type: Number },
    freightEmissionFactor: { type: Number },
    loadFactor: { type: Number },
    allocatedKm: { type: Number },
    grossAvoidedKg: { type: Number },
    transportEmissionsKg: { type: Number },
    netSavedKg: { type: Number, required: true },
    co2eAvoidedKg: { type: Number, required: true },

    factorVersion: { type: String, default: 'GHG-Protocol-Scope3-v2026.1' },
    methodology: { type: String, default: 'ISO 14021 / GHG Protocol Scope 3 Cat 1 & 4' },

    previousHash: { type: String, default: '' },
    entryHash: { type: String, required: true, index: true },
    verificationHash: { type: String, required: true },
    signature: { type: String },

    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const CarbonLedgerModel = mongoose.model<ICarbonLedgerEntry>('CarbonLedger', CarbonLedgerSchema);
