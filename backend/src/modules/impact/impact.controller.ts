import { Request, Response, NextFunction } from 'express';
import { ImpactService } from './impact.service.js';
import mongoose from 'mongoose';

export class ImpactController {
  /** Create a new ledger entry for a given entity */
  async createEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityId, entityType, metadata } = req.body;
      if (!entityId || !entityType) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'entityId and entityType required' } });
      }
      const objId = new mongoose.Types.ObjectId(entityId);
      const entry = await ImpactService.createEntry(objId, entityType, metadata);
      res.status(201).json({ success: true, data: entry });
    } catch (err) {
      next(err);
    }
  }

  /** Retrieve a ledger entry by id */
  async getEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await ImpactService.getEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ledger entry not found' } });
      }
      res.json({ success: true, data: entry });
    } catch (err) {
      next(err);
    }
  }

  /** Verify the full ledger chain */
  async verifyChain(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ImpactService.verifyChain();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const impactController = new ImpactController();
