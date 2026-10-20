import { Router } from 'express';
import { materialsController } from './materials.controller.js';
import { validate } from '../../middleware/validate.js';
import { createMaterialSchema, queryMaterialsSchema } from './materials.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/', validate(queryMaterialsSchema), materialsController.list);
router.get('/:id', materialsController.getById);
router.post('/', requireAuth, validate(createMaterialSchema), materialsController.create);
router.patch('/:id', requireAuth, materialsController.update);
router.delete('/:id', requireAuth, materialsController.delete);

export const materialsRoutes = router;
