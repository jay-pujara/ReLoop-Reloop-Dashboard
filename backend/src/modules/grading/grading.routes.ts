import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { gradingController } from './grading.controller.js';
import { requireAuth, optionalAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { overrideGradeSchema } from './grading.schema.js';

const router = Router({ mergeParams: true });

// Rate limiter for compute-expensive AI grading triggering: max 20 requests per 15 min per IP/User
const gradingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many grading requests initiated. Please wait before triggering additional grading jobs.',
    },
  },
});

router.post('/:id/grade', requireAuth, gradingLimiter, gradingController.trigger);
router.get('/:id/grading', optionalAuth, gradingController.get);
router.post('/:id/grading/confirm', requireAuth, gradingController.confirm);
router.post('/:id/grading/override', requireAuth, validate(overrideGradeSchema), gradingController.override);

export const gradingRoutes = router;
