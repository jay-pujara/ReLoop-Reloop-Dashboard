import { Router, Request, Response, NextFunction } from 'express';
import { reviewsService } from './reviews.service.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/organization/:organizationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await reviewsService.getForOrganization(req.params.organizationId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.organizationId) {
      res.status(400).json({
        success: false,
        error: { code: 'ORGANIZATION_REQUIRED', message: 'Organization required to post reviews', fields: {} },
      });
      return;
    }

    const review = await reviewsService.createReview({
      ...req.body,
      reviewerOrganizationId: req.user.organizationId,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

export const reviewsRoutes = router;
