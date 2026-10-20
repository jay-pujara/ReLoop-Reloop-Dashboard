import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientUserId: mongoose.Types.ObjectId;
  recipientOrganizationId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'order' | 'match' | 'system';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'match', 'system'], default: 'system' },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
