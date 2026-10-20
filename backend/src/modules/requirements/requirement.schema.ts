import { z } from 'zod';

const requirementFields = {
  facilityId: z.string().min(1, 'facilityId is required'),
  materialCategory: z.enum(['cardboard', 'plastics', 'pallets', 'drums', 'gaylords'], {
    errorMap: () => ({ message: 'materialCategory must be one of: cardboard, plastics, pallets, drums, gaylords' }),
  }),
  materialSubtype: z.string().min(1, 'materialSubtype is required'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').default(''),
  minGrade: z.enum(['A', 'B', 'C', 'reject'], {
    errorMap: () => ({ message: 'minGrade must be one of: A, B, C, reject' }),
  }),
  massKgPerPeriod: z.number().finite().positive('massKgPerPeriod must be a positive number').max(100000000),
  period: z.enum(['weekly', 'monthly'], {
    errorMap: () => ({ message: 'period must be weekly or monthly' }),
  }),
  maxPricePerKg: z.number().finite().nonnegative('maxPricePerKg must be non-negative').optional(),
  useCarbonLimit: z.boolean().default(false),
  maxDistanceKm: z.number().finite().positive('maxDistanceKm must be greater than zero').max(20000).optional(),
};

export const createRequirementSchema = z.object({
  body: z
    .object(requirementFields)
    .refine(
      (data) => {
        // If useCarbonLimit is false, maxDistanceKm is required
        if (data.useCarbonLimit === false) {
          return data.maxDistanceKm !== undefined && data.maxDistanceKm > 0;
        }
        return true;
      },
      {
        message: 'maxDistanceKm must be provided when useCarbonLimit is false',
        path: ['maxDistanceKm'],
      }
    ),
});

export const updateRequirementSchema = z.object({
  body: z
    .object({
      facilityId: requirementFields.facilityId.optional(),
      description: z.string().max(5000).optional(),
      minGrade: requirementFields.minGrade.optional(),
      massKgPerPeriod: requirementFields.massKgPerPeriod.optional(),
      period: requirementFields.period.optional(),
      maxPricePerKg: requirementFields.maxPricePerKg,
      useCarbonLimit: z.boolean().optional(),
      maxDistanceKm: requirementFields.maxDistanceKm,
    })
    .refine((data) => Object.keys(data).length > 0, 'At least one editable field is required'),
});

export const requirementQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['active', 'paused', 'closed']).optional(),
    materialCategory: z.string().optional(),
    materialSubtype: z.string().optional(),
    facilityId: z.string().optional(),
    minGrade: z.enum(['A', 'B', 'C', 'reject']).optional(),
  }),
});
