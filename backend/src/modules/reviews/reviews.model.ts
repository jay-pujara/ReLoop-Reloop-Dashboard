import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  reviewerOrganizationId: mongoose.Types.ObjectId;
  targetOrganizationId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    reviewerOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    targetOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
