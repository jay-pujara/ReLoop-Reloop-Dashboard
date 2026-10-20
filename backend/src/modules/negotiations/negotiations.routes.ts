import { Router, Request, Response, NextFunction } from 'express';
import { NegotiationModel } from './negotiations.model.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await NegotiationModel.find({
      $or: [{ buyerOrganizationId: req.user?.organizationId }, { sellerOrganizationId: req.user?.organizationId }],
    })
      .populate('materialId', 'title pricePerUnit')
      .populate('listingId', 'title askingPrice materialCategory materialSubtype')
      .populate('buyerOrganizationId', 'name')
      .populate('sellerOrganizationId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const neg = await NegotiationModel.create({
      ...req.body,
      buyerOrganizationId: req.user?.organizationId,
    });
    res.status(201).json({ success: true, data: neg });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await NegotiationModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export const negotiationsRoutes = router;
