import { z } from 'zod';

export const DebtDataSchema = z.object({
  debt_type: z.string(),
  description: z.string(),
  amount: z.number().positive(),
  interest_rate: z.number().min(0).max(100),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'paid', 'defaulted', 'refinanced']),
  principal_amount: z.number().optional(),
  accrued_interest: z.number().optional(),
});

export const DebtApiResponseSchema = z.object({
  debt_data: z.array(DebtDataSchema),
  total_debt: z.number(),
  average_interest_rate: z.number(),
  long_term_debt: z.number(),
  short_term_debt: z.number(),
  debt_by_type: z.record(z.number()),
  metadata: z.object({
    year: z.number(),
    last_updated: z.string(),
    source: z.string()
  }).optional()
});

export type DebtData = z.infer<typeof DebtDataSchema>;
export type DebtApiResponse = z.infer<typeof DebtApiResponseSchema>;