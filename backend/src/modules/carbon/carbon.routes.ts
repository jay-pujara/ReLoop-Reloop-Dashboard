import { Router } from 'express';
import { carbonController } from './carbon.controller.js';
import { requireAuth, optionalAuth } from '../../middleware/requireAuth.js';

const router = Router();

// PRD-compliant estimate endpoint
router.post('/estimate', optionalAuth, carbonController.estimate);

// Audited persistence calculation endpoint
router.post('/calculate', requireAuth, carbonController.calculate);

router.get('/:id', optionalAuth, carbonController.get);

export const carbonRoutes = router;
