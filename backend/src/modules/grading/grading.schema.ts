import { z } from 'zod';

export const overrideGradeSchema = z.object({
  body: z.object({
    grade: z.enum(['A', 'B', 'C', 'reject']),
    reason: z.string().trim().min(5, 'Override reason must be at least 5 characters long').max(1000),
  }),
});
