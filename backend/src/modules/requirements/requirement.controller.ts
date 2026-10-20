import { Request, Response, NextFunction } from 'express';
import { requirementService } from './requirement.service.js';

export class RequirementController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requirement = await requirementService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: requirement });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await requirementService.list(req.user!.userId, req.query as never);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requirement = await requirementService.getById(req.user!.userId, req.params.id);
      if (!requirement) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Requirement not found', fields: {} },
        });
        return;
      }
      res.json({ success: true, data: requirement });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await requirementService.update(req.user!.userId, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await requirementService.pause(req.user!.userId, req.params.id);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await requirementService.resume(req.user!.userId, req.params.id);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await requirementService.close(req.user!.userId, req.params.id);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const requirementController = new RequirementController();
