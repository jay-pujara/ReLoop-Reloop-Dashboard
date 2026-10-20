import { Request, Response, NextFunction } from 'express';
import { logisticsService } from './logistics.service.js';

export class LogisticsController {
  async estimate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { originLng, originLat, destLng, destLat } = req.query;
      if (!originLng || !originLat || !destLng || !destLat) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COORDINATES',
            message: 'originLng, originLat, destLng, and destLat are required query params',
            fields: {},
          },
        });
        return;
      }

      const estimate = await logisticsService.estimateRoute(
        [Number(originLng), Number(originLat)],
        [Number(destLng), Number(destLat)]
      );

      res.json({ success: true, data: estimate });
    } catch (error) {
      next(error);
    }
  }

  async getByOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shipment = await logisticsService.getShipmentByOrderId(req.params.orderId);
      if (!shipment) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Shipment not found for this order', fields: {} },
        });
        return;
      }
      res.json({ success: true, data: shipment });
    } catch (error) {
      next(error);
    }
  }
}

export const logisticsController = new LogisticsController();
