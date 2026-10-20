import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { createRequirementSchema, requirementQuerySchema, updateRequirementSchema } from './requirement.schema.js';
import { requirementController } from './requirement.controller.js';

const router = Router();

router.post('/', requireAuth, validate(createRequirementSchema), requirementController.create);
router.get('/', requireAuth, validate(requirementQuerySchema), requirementController.list);
router.get('/:id', requireAuth, requirementController.getById);
router.patch('/:id', requireAuth, validate(updateRequirementSchema), requirementController.update);
router.post('/:id/pause', requireAuth, requirementController.pause);
router.post('/:id/resume', requireAuth, requirementController.resume);
router.post('/:id/close', requireAuth, requirementController.close);

export const requirementsRoutes = router;
