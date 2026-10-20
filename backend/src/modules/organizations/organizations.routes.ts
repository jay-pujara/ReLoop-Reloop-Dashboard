import { Router } from 'express';
import { organizationsController } from './organizations.controller.js';
import { validate } from '../../middleware/validate.js';
import { createOrganizationSchema, facilitySchema, updateOrganizationSchema, verificationSchema } from './organizations.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/me', requireAuth, organizationsController.getMe);
router.patch('/me', requireAuth, validate(updateOrganizationSchema), organizationsController.updateMe);
router.get('/me/facilities', requireAuth, organizationsController.listFacilities);
router.post('/me/facilities', requireAuth, validate(facilitySchema), organizationsController.addFacility);
router.post('/me/verification', requireAuth, validate(verificationSchema), organizationsController.submitVerification);
router.get('/', organizationsController.list);
router.get('/:id', organizationsController.getById);
router.post('/', requireAuth, validate(createOrganizationSchema), organizationsController.create);

export const organizationsRoutes = router;
