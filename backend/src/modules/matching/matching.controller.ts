import { Request, Response, NextFunction } from 'express';
import { matchingService, MatchingCriteria } from './matching.service.js';

export class MatchingController {
  async recommend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const criteria: MatchingCriteria = {
        ...req.body,
        includeCarbonNegative: Boolean(req.body.includeCarbonNegative),
        buyerLocation: req.body.buyerLocation
          ? {
              longitude: Number(req.body.buyerLocation.longitude),
              latitude: Number(req.body.buyerLocation.latitude),
            }
          : undefined,
      };

      const recommendations = await matchingService.findMatches(criteria);
      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  async listMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query;
      const criteria: MatchingCriteria = {
        requirementId: q.requirementId as string,
        listingId: q.listingId as string,
        materialCategory: q.materialCategory as string,
        materialSubtype: q.materialSubtype as string,
        minGrade: q.minGrade as any,
        massKg: q.massKg ? Number(q.massKg) : undefined,
        maxDistanceKm: q.maxDistanceKm ? Number(q.maxDistanceKm) : undefined,
        maxPricePerKg: q.maxPricePerKg ? Number(q.maxPricePerKg) : undefined,
        includeCarbonNegative: q.includeCarbonNegative === 'true',
        buyerLocation:
          q.longitude && q.latitude
            ? {
                longitude: Number(q.longitude),
                latitude: Number(q.latitude),
              }
            : undefined,
      };

      const matches = await matchingService.findMatches(criteria);
      res.json({
        success: true,
        data: matches,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const matchingController = new MatchingController();
