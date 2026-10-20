import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IImpactEntry extends Document {
  // Reference to the domain entity (e.g., transaction, carbon record)
  entityId: mongoose.Types.ObjectId;
  entityType: string; // e.g., 'transaction', 'carbon', 'listing'
  // Hash of the previous ledger entry (empty string for first entry)
  previousHash: string;
  // SHA256 hash of the entry's immutable data (entityId, entityType, previousHash, timestamp)
  dataHash: string;
  // Digital signature of the dataHash using the platform's private key
  signature: string;
  // Timestamp when entry was created (indexed for queries)
  createdAt: Date;
}

// Helper to compute the data hash for an entry
export function computeImpactHash(
  entityId: mongoose.Types.ObjectId,
  entityType: string,
  previousHash: string,
  timestamp: Date
): string {
  const hash = crypto.createHash('sha256');
  hash.update(entityId.toHexString());
  hash.update(entityType);
  hash.update(previousHash);
  hash.update(timestamp.toISOString());
  return hash.digest('hex');
}

const ImpactEntrySchema = new Schema<IImpactEntry>(
  {
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    entityType: { type: String, required: true },
    previousHash: { type: String, required: true },
    dataHash: { type: String, required: true, unique: true },
    signature: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ImpactEntryModel = mongoose.model<IImpactEntry>('ImpactEntry', ImpactEntrySchema);
