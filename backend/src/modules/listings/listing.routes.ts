import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { createListingSchema, listingQuerySchema, transitionSchema, updateListingSchema } from './listing.schema.js';
import { listingController, listingUpload } from './listing.controller.js';
import { gradingRoutes } from '../grading/grading.routes.js';

const router = Router();

router.post('/evaluate-photos', optionalAuth, listingUpload.array('photos', 6), listingController.evaluatePhotos);
router.use('/', gradingRoutes);
router.get('/', optionalAuth, validate(listingQuerySchema), listingController.list);
router.get('/:id', optionalAuth, listingController.getById);
router.get('/:id/breakeven', optionalAuth, listingController.getBreakEven);
router.post('/', requireAuth, validate(createListingSchema), listingController.create);
router.post('/bulk', requireAuth, listingUpload.single('file'), listingController.bulk);
router.patch('/:id', requireAuth, validate(updateListingSchema), listingController.update);
router.post('/:id/publish', requireAuth, listingController.publish);
router.post('/:id/status', requireAuth, validate(transitionSchema), listingController.transition);
router.post('/:id/media', requireAuth, listingUpload.single('file'), listingController.addMedia);
router.get('/:id/media', optionalAuth, listingController.listMedia);
router.get('/:id/media/:mediaId', optionalAuth, listingController.downloadMedia);

export const listingRoutes = router;
