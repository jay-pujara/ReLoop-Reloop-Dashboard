import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z
    .object({
      materialId: z.string().optional(),
      listingId: z.string().optional(),
      quantity: z.number().positive(),
      orderType: z.enum(['free_claim', 'paid_purchase']).default('paid_purchase'),
      deliveryNotes: z.string().optional(),
    })
    .refine((data) => Boolean(data.materialId || data.listingId), {
      message: 'Either materialId or listingId is required',
    }),
});
