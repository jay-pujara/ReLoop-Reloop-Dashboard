import { z } from 'zod';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    legalName: z.string().min(2).optional(),
    businessId: z.string().min(2).max(100).optional(),
    roles: z.array(z.enum(['seller', 'buyer', 'recycler', 'carrier'])).min(1).optional(),
    type: z.enum(['manufacturer', 'retailer', 'recycler', 'logistics']).optional(),
    contactEmail: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      country: z.string().min(1),
      postalCode: z.string().optional(),
    }),
    location: z
      .object({
        type: z.literal('Point').default('Point'),
        coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
      })
      .refine((value) => value.coordinates[0] >= -180 && value.coordinates[0] <= 180 && value.coordinates[1] >= -90 && value.coordinates[1] <= 90, 'Coordinates are out of range')
      .optional(),
  }).refine((body) => Boolean(body.legalName || body.name), 'legalName or name is required'),
});

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    legalName: z.string().min(2).optional(),
    businessId: z.string().min(2).max(100).optional(),
    roles: z.array(z.enum(['seller', 'buyer', 'recycler', 'carrier'])).min(1).optional(),
    contactEmail: z.string().email().optional(),
    phone: z.string().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one field is required'),
});

export const facilitySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    facilityType: z.enum(['manufacturing_plant', 'warehouse', 'retail_depot', 'recycling_yard', 'transfer_station']).optional(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().optional(),
      country: z.string().min(1),
      postalCode: z.string().optional(),
    }),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]).refine(([longitude, latitude]) => longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90, 'Coordinates are out of range'),
    }),
    operatingHours: z.record(z.object({
      closed: z.boolean(),
      opens: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      closes: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    }).refine((hours) => hours.closed || Boolean(hours.opens && hours.closes && hours.opens < hours.closes), 'Opening and closing times are invalid')),
    hasForklift: z.boolean().default(false),
  }),
});

export const verificationSchema = z.object({
  body: z.object({
    documents: z.array(z.object({
      documentType: z.string().min(1),
      storageKey: z.string().min(1),
      originalFilename: z.string().min(1),
      mimeType: z.string().min(1),
      size: z.number().int().positive().max(10 * 1024 * 1024),
    })).default([]),
  }),
});
