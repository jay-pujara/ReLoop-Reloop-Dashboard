import { Request, Response, NextFunction } from 'express';
import { routeService } from './route.service.js';

export class RouteController {
  /** Plan an optimized route for given shipments */
  async plan(req: Request, res: Response, next: NextFunction) {
    try {
      const { shipments, vehicleCapacityKg, vehiclePalletCapacity } = req.body;
      if (!Array.isArray(shipments) || shipments.length === 0) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'shipments array required' } });
      }
      const route = await routeService.plan(shipments, {
        vehicleCapacityKg,
        vehiclePalletCapacity,
        actorId: req.user?.userId,
        organizationId: req.user?.organizationId,
      });
      res.status(201).json({ success: true, data: route });
    } catch (err) {
      next(err);
    }
  }

  /** Complete a route and record actual carbon */
  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const { routeId, actualKg } = req.body;
      if (!routeId || typeof actualKg !== 'number') {
        return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'routeId and actualKg are required' } });
      }
      const route = await routeService.complete(routeId, actualKg, {
        actorId: req.user?.userId,
        organizationId: req.user?.organizationId,
      });
      res.json({ success: true, data: route });
    } catch (err) {
      next(err);
    }
  }
}

export const routeController = new RouteController();
