import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    organizationName: z.string().min(2),
    organizationType: z.enum(['manufacturer', 'retailer', 'recycler', 'logistics']),
    city: z.string().min(1),
    country: z.string().default('USA'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});
