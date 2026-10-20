import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRoute extends Document {
  shipmentIds: Types.ObjectId[]; // references to ShipmentModel
  plan: any; // JSON representation of the optimized plan
  status: 'planned' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    shipmentIds: [{ type: Schema.Types.ObjectId, ref: 'Shipment', required: true }],
    plan: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['planned', 'completed'], default: 'planned' },
  },
  { timestamps: true }
);

export const RouteModel = mongoose.model<IRoute>('Route', RouteSchema);
