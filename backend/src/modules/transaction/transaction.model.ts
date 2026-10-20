import mongoose, { Schema, Document, Types } from 'mongoose';

export type TransactionStatus =
  | 'initiated'
  | 'carbon_checked'
  | 'claimed'
  | 'negotiated'
  | 'agreed'
  | 'in_transit'
  | 'completed'
  | 'disputed';

export interface ITransaction extends Document {
  matchId?: Types.ObjectId;
  listingId?: Types.ObjectId;
  buyerOrganizationId?: Types.ObjectId;
  sellerOrganizationId?: Types.ObjectId;
  quantityKg?: number;
  totalPrice?: number;
  carbonRecordId?: Types.ObjectId;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    matchId: { type: Schema.Types.ObjectId, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', index: true },
    buyerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    sellerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    quantityKg: { type: Number },
    totalPrice: { type: Number, default: 0 },
    carbonRecordId: { type: Schema.Types.ObjectId, ref: 'Carbon' },
    status: {
      type: String,
      enum: ['initiated', 'carbon_checked', 'claimed', 'negotiated', 'agreed', 'in_transit', 'completed', 'disputed'],
      default: 'initiated',
    },
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
