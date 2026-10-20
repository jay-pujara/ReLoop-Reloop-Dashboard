import { z } from 'zod';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must use HH:MM format');
const dimensionsSchema = z.object({
  length: z.number().finite().positive().max(1000000),
  width: z.number().finite().positive().max(1000000),
  height: z.number().finite().positive().max(1000000),
});
const pickupSchema = z.object({
  dockHours: z.object({ opens: timeSchema, closes: timeSchema }).refine((value) => value.opens < value.closes, 'Dock closing time must be after opening time'),
  hasForklift: z.boolean(),
  packagingMode: z.enum(['loose', 'palletised']),
});

const listingFields = {
  facilityId: z.string().min(1),
  materialCategory: z.enum(['cardboard', 'plastics', 'pallets', 'drums', 'gaylords']),
  materialSubtype: z.string().min(1),
  title: z.string().min(3).max(160),
  description: z.string().max(5000).default(''),
  grade: z.enum(['A', 'B', 'C', 'reject']),
  gradeSource: z.enum(['seller', 'ai', 'manual']).default('seller'),
  massKg: z.number().finite().positive().max(100000000),
  unitCount: z.number().int().positive().max(100000000).optional(),
  dimensionsMm: dimensionsSchema.optional(),
  packagingState: z.enum(['new', 'reusable', 'damaged_recyclable', 'clean_scrap']),
  availableFrom: z.coerce.date(),
  availableUntil: z.coerce.date(),
  askingPrice: z.object({ amount: z.number().finite().nonnegative(), currency: z.string().length(3).default('USD') }).optional(),
  openToOffers: z.boolean().default(false),
  pickupConstraints: pickupSchema,
};

export const createListingSchema = z.object({
  body: z.object(listingFields).refine((value) => value.availableFrom <= value.availableUntil, 'availableFrom must be before or equal to availableUntil'),
});

export const updateListingSchema = z.object({
  body: z.object({
    facilityId: listingFields.facilityId.optional(),
    materialCategory: listingFields.materialCategory.optional(),
    materialSubtype: listingFields.materialSubtype.optional(),
    title: listingFields.title.optional(),
    description: listingFields.description.optional(),
    grade: listingFields.grade.optional(),
    gradeSource: z.enum(['seller', 'ai', 'manual']).optional(),
    massKg: listingFields.massKg.optional(),
    unitCount: listingFields.unitCount,
    dimensionsMm: listingFields.dimensionsMm,
    packagingState: listingFields.packagingState.optional(),
    availableFrom: z.coerce.date().optional(),
    availableUntil: z.coerce.date().optional(),
    askingPrice: listingFields.askingPrice,
    openToOffers: listingFields.openToOffers.optional(),
    pickupConstraints: listingFields.pickupConstraints.optional(),
  }).refine((value) => Object.keys(value).length > 0, 'At least one editable field is required'),
});

export const listingQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    materialCategory: z.string().optional(),
    materialSubtype: z.string().optional(),
    grade: z.enum(['A', 'B', 'C', 'reject']).optional(),
    status: z.enum(['draft', 'published', 'matched', 'reserved', 'in-transit', 'completed', 'cancelled']).optional(),
    facilityId: z.string().optional(),
    organizationId: z.string().optional(),
    longitude: z.coerce.number().optional(),
    latitude: z.coerce.number().optional(),
    radiusKm: z.coerce.number().positive().max(10000).optional(),
  }),
});

export const mediaMetadataSchema = z.object({
  body: z.object({
    originalFilename: z.string().min(1).max(255).optional(),
  }),
});

export const transitionSchema = z.object({
  body: z.object({
    status: z.enum(['matched', 'reserved', 'in-transit', 'completed', 'cancelled']),
  }),
});
