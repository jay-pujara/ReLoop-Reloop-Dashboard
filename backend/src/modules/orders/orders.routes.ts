import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { validate } from '../../middleware/validate.js';
import { createOrderSchema } from './orders.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, ordersController.list);
router.get('/:id', requireAuth, ordersController.getById);
router.post('/', requireAuth, validate(createOrderSchema), ordersController.create);

export const ordersRoutes = router;
