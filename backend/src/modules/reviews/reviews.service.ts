import { ReviewModel } from './reviews.model.js';

export class ReviewsService {
  async getForOrganization(organizationId: string) {
    return ReviewModel.find({ targetOrganizationId: organizationId })
      .populate('reviewerOrganizationId', 'name')
      .sort({ createdAt: -1 });
  }

  async createReview(data: {
    orderId: string;
    reviewerOrganizationId: string;
    targetOrganizationId: string;
    rating: number;
    comment?: string;
  }) {
    return ReviewModel.create(data);
  }
}

export const reviewsService = new ReviewsService();
