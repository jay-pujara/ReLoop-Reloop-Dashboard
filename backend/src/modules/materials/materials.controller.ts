import { Request, Response, NextFunction } from 'express';
import { materialsService, MaterialQueryParams } from './materials.service.js';
import { assertOwnership } from '../../utils/ownershipCheck.js';

export class MaterialsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: MaterialQueryParams = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        materialType: req.query.materialType as string,
        status: req.query.status as string,
        lng: req.query.lng ? Number(req.query.lng) : undefined,
        lat: req.query.lat ? Number(req.query.lat) : undefined,
        maxDistanceKm: req.query.maxDistanceKm ? Number(req.query.maxDistanceKm) : undefined,
      };

      const result = await materialsService.list(queryParams);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const material = await materialsService.getById(req.params.id);
      if (!material) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Material listing not found', fields: {} },
        });
        return;
      }
      res.json({ success: true, data: material });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.organizationId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ORGANIZATION_REQUIRED',
            message: 'User must belong to an organization to list materials',
            fields: {},
          },
        });
        return;
      }

      const listing = await materialsService.create({
        ...req.body,
        sellerOrganizationId: req.user.organizationId as any,
        availableQuantity: req.body.quantity,
      });

      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await materialsService.getById(req.params.id);
      assertOwnership(
        existing ? { sellerOrganizationId: (existing.sellerOrganizationId as any)?._id || existing.sellerOrganizationId } : null,
        {
          userId: req.user!.userId,
          organizationId: req.user!.organizationId,
          role: req.user!.role,
        },
        'Material listing'
      );

      const updated = await materialsService.update(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await materialsService.getById(req.params.id);
      assertOwnership(
        existing ? { sellerOrganizationId: (existing.sellerOrganizationId as any)?._id || existing.sellerOrganizationId } : null,
        {
          userId: req.user!.userId,
          organizationId: req.user!.organizationId,
          role: req.user!.role,
        },
        'Material listing'
      );

      await materialsService.softDelete(req.params.id);
      res.json({ success: true, data: { message: 'Listing deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}

export const materialsController = new MaterialsController();
