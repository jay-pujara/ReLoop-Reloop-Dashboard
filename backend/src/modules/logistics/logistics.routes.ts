import { Router } from 'express';
import { logisticsController } from './logistics.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/estimate', requireAuth, logisticsController.estimate);
router.get('/orders/:orderId', requireAuth, logisticsController.getByOrder);

export const logisticsRoutes = router;
