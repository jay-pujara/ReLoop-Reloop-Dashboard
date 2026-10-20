import mongoose, { Schema, Document } from 'mongoose';

export type ShipmentStatus = 'draft' | 'quote_requested' | 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';

export interface IShipment extends Document {
  shipmentNumber: string;
  orderId: mongoose.Types.ObjectId;
  logisticsOrganizationId?: mongoose.Types.ObjectId;
  pickupLocation: {
    address: string;
    city: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  deliveryLocation: {
    address: string;
    city: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  distanceKm: number;
  estimatedDurationMinutes: number;
  estimatedCost: number;
  status: ShipmentStatus;
  scheduledPickupDate?: Date;
  actualDeliveryDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    shipmentNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    logisticsOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    pickupLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    deliveryLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    distanceKm: { type: Number, default: 0 },
    estimatedDurationMinutes: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'quote_requested', 'scheduled', 'in_transit', 'delivered', 'cancelled'],
      default: 'draft',
      index: true,
    },
    scheduledPickupDate: { type: Date },
    actualDeliveryDate: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ShipmentSchema.index({ 'pickupLocation.location': '2dsphere' });
ShipmentSchema.index({ 'deliveryLocation.location': '2dsphere' });

export const ShipmentModel = mongoose.model<IShipment>('Shipment', ShipmentSchema);
