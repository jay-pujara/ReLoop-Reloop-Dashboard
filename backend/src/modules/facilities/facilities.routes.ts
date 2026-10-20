import { Router, Request, Response, NextFunction } from 'express';
import { FacilityModel } from './facilities.model.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { facilitySchema } from '../organizations/organizations.schema.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const facilities = await FacilityModel.find({
      organizationId: req.user?.organizationId,
      isDeleted: false,
    });
    res.json({ success: true, data: facilities });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, validate(facilitySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const facility = await FacilityModel.create({
      ...req.body,
      organizationId: req.user?.organizationId,
    });
    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
});

export const facilitiesRoutes = router;
