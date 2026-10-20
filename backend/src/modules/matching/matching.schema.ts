import { z } from 'zod';

export const matchingQuerySchema = z.object({
  body: z.object({
    requirementId: z.string().optional(),
    listingId: z.string().optional(),
    materialCategory: z.string().optional(),
    materialSubtype: z.string().optional(),
    materialType: z.string().optional(),
    requiredQuantity: z.number().positive().optional(),
    massKg: z.number().positive().optional(),
    minGrade: z.enum(['A', 'B', 'C', 'reject']).optional(),
    buyerLocation: z
      .object({
        longitude: z.number(),
        latitude: z.number(),
      })
      .optional(),
    maxDistanceKm: z.number().positive().optional(),
    maxPricePerUnit: z.number().nonnegative().optional(),
    maxPricePerKg: z.number().nonnegative().optional(),
    preferredCondition: z.enum(['new', 'reusable', 'damaged_recyclable', 'clean_scrap']).optional(),
  }),
});
