import mongoose, { Schema, Document } from 'mongoose';

export type OrderType = 'free_claim' | 'paid_purchase';
export type OrderStatus = 'pending' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';

export interface IOrder extends Document {
  orderNumber: string;
  buyerOrganizationId: mongoose.Types.ObjectId;
  sellerOrganizationId: mongoose.Types.ObjectId;
  materialId?: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  orderType: OrderType;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: OrderStatus;
  deliveryNotes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    buyerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    sellerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: false, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: false, index: true },
    orderType: { type: String, enum: ['free_claim', 'paid_purchase'], required: true },
    quantity: { type: Number, required: true, min: 0.1 },
    unit: { type: String, required: true },
    totalPrice: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_transit', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    deliveryNotes: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
