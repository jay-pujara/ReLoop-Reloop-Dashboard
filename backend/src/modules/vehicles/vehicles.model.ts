import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  carrierOrganizationId: mongoose.Types.ObjectId;
  licensePlate: string;
  vehicleType: 'box_truck' | 'flatbed' | 'dry_van' | 'sprinter_van' | 'curtainsider';
  maxPayloadKg: number;
  palletCapacity: number;
  currentStatus: 'available' | 'in_transit' | 'maintenance';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    carrierOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    licensePlate: { type: String, required: true, trim: true },
    vehicleType: {
      type: String,
      enum: ['box_truck', 'flatbed', 'dry_van', 'sprinter_van', 'curtainsider'],
      required: true,
    },
    maxPayloadKg: { type: Number, required: true },
    palletCapacity: { type: Number, required: true },
    currentStatus: { type: String, enum: ['available', 'in_transit', 'maintenance'], default: 'available' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VehicleModel = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
