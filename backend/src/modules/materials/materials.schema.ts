import { z } from 'zod';

export const createMaterialSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional().default(''),
    materialType: z.string().min(2),
    condition: z.enum(['new', 'reusable', 'damaged_recyclable', 'clean_scrap']),
    quantity: z.number().positive(),
    unit: z.enum(['kg', 'tonnes', 'units', 'pallets']),
    pricePerUnit: z.number().nonnegative().default(0),
    isFreeClaim: z.boolean().default(false),
    images: z.array(z.string().url()).optional().default([]),
    pickupLocation: z.object({
      address: z.string().min(3),
      city: z.string().min(1),
      location: z.object({
        type: z.literal('Point').default('Point'),
        coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
      }),
    }),
  }),
});

export const queryMaterialsSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(20),
    materialType: z.string().optional(),
    status: z.string().optional(),
    lng: z.coerce.number().optional(),
    lat: z.coerce.number().optional(),
    maxDistanceKm: z.coerce.number().positive().optional(),
  }),
});
