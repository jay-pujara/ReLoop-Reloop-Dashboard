import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service.js';
import { assertOwnership } from '../../utils/ownershipCheck.js';

export class OrdersController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.organizationId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ORGANIZATION_REQUIRED',
            message: 'User must belong to an organization to create an order',
            fields: {},
          },
        });
        return;
      }

      const order = await ordersService.createOrder({
        ...req.body,
        buyerOrganizationId: req.user.organizationId,
      });

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await ordersService.getById(req.params.id);
      assertOwnership(
        order
          ? {
              buyerOrganizationId: (order.buyerOrganizationId as any)?._id || order.buyerOrganizationId,
              sellerOrganizationId: (order.sellerOrganizationId as any)?._id || order.sellerOrganizationId,
            }
          : null,
        {
          userId: req.user!.userId,
          organizationId: req.user!.organizationId,
          role: req.user!.role,
        },
        'Order'
      );

      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.organizationId) {
        res.json({ success: true, data: [] });
        return;
      }

      const orders = await ordersService.listForOrganization(req.user.organizationId);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();
