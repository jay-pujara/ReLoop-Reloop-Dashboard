import { Request, Response, NextFunction } from 'express';
import { organizationsService } from './organizations.service.js';

export class OrganizationsController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await organizationsService.getForUser(req.user!.userId);
      if (!organization) {
        res.status(404).json({ success: false, error: { code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found', fields: {} } });
        return;
      }
      const facilities = await organizationsService.getFacilitiesForUser(req.user!.userId);
      res.json({ success: true, data: { ...organization.toObject(), facilities } });
    } catch (error) { next(error); }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: await organizationsService.updateForUser(req.user!.userId, req.body) }); }
    catch (error) { next(error); }
  }

  async addFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ success: true, data: await organizationsService.addFacility(req.user!.userId, req.body) }); }
    catch (error) { next(error); }
  }

  async listFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: await organizationsService.getFacilitiesForUser(req.user!.userId) }); }
    catch (error) { next(error); }
  }

  async submitVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: await organizationsService.submitVerification(req.user!.userId, req.body.documents) }); }
    catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationsService.getById(req.params.id);
      if (!org) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Organization not found', fields: {} },
        });
        return;
      }
      res.json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationsService.create(req.body);
      res.status(201).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  }

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgs = await organizationsService.list();
      res.json({ success: true, data: orgs });
    } catch (error) {
      next(error);
    }
  }
}

export const organizationsController = new OrganizationsController();
