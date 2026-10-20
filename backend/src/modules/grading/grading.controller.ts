import { Request, Response, NextFunction } from 'express';
import { gradingService } from './grading.service.js';

export class GradingController {
  async trigger(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.params.id;
      const result = await gradingService.triggerGrading(req.user!.userId, listingId);
      res.status(202).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.params.id;
      const grading = await gradingService.getGrading(req.user?.userId, listingId);
      res.status(200).json({
        success: true,
        data: grading,
      });
    } catch (err) {
      next(err);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.params.id;
      const result = await gradingService.confirmGrade(req.user!.userId, listingId);
      res.status(200).json({
        success: true,
        message: 'AI condition grade confirmed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async override(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.params.id;
      const { grade, reason } = req.body;
      const result = await gradingService.overrideGrade(req.user!.userId, listingId, grade, reason);
      res.status(200).json({
        success: true,
        message: 'Condition grade overridden successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const gradingController = new GradingController();
