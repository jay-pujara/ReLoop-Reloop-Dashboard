import { Request, Response, NextFunction } from 'express';
import { carbonService } from './carbon.service.js';
import { CarbonModel } from './carbon.model.js';
import { Types } from 'mongoose';

export class CarbonController {
  /**
   * Estimate avoided emissions and break-even haul radius without persisting (PRD POST /carbon/estimate)
   */
  async estimate(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        materialCategory,
        materialSubtype,
        massKg,
        distanceKm,
        totalShipmentMassKg,
        efFreight,
        loadFactor,
      } = req.body;

      if (!materialCategory || typeof massKg !== 'number') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'materialCategory and massKg (number) are required for carbon estimation',
          },
        });
      }

      const metrics = carbonService.calculateMetrics({
        materialCategory,
        materialSubtype,
        massKg,
        distanceKm: Number(distanceKm) || 0,
        totalShipmentMassKg: totalShipmentMassKg ? Number(totalShipmentMassKg) : undefined,
        efFreight: efFreight ? Number(efFreight) : undefined,
        loadFactor: loadFactor ? Number(loadFactor) : undefined,
      });

      res.json({ success: true, data: metrics });
    } catch (err) {
      next(err);
    }
  }

  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityId, entityType, quantity, massKg, materialCategory, materialSubtype, distanceKm, extra } = req.body;
      if (!entityId || !entityType || (typeof quantity !== 'number' && typeof massKg !== 'number')) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'entityId, entityType and quantity/massKg are required' },
        });
      }

      const effectiveMass = typeof massKg === 'number' ? massKg : quantity;
      const combinedExtra = {
        ...extra,
        materialCategory,
        materialSubtype,
        distanceKm,
        actorId: req.user?.userId,
        organizationId: req.user?.organizationId,
      };

      const targetEntityId = Types.ObjectId.isValid(entityId) ? new Types.ObjectId(entityId) : new Types.ObjectId();
      const carbon = await carbonService.calculateAndSave(targetEntityId, entityType, effectiveMass, combinedExtra);
      res.status(201).json({ success: true, data: carbon });
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const carbon = await CarbonModel.findById(req.params.id);
      if (!carbon) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Carbon record not found' } });
      }
      res.json({ success: true, data: carbon });
    } catch (err) {
      next(err);
    }
  }
}

export const carbonController = new CarbonController();
