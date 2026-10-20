import { Router } from 'express';
import { routeController } from './route.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.post('/plan', requireAuth, routeController.plan);
router.post('/complete', requireAuth, routeController.complete);

export const routeRoutes = router;
