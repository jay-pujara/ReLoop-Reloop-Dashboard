import { Router } from 'express';
import { matchingController } from './matching.controller.js';
import { validate } from '../../middleware/validate.js';
import { matchingQuerySchema } from './matching.schema.js';
import { requireAuth, optionalAuth } from '../../middleware/requireAuth.js';

const router = Router();

// GET /api/v1/matching - PRD matches endpoint
router.get('/', optionalAuth, matchingController.listMatches);

// POST /api/v1/matching/recommendations
router.post('/recommendations', requireAuth, validate(matchingQuerySchema), matchingController.recommend);

export const matchingRoutes = router;
