import { z } from 'zod';

export const BudgetDataSchema = z.object({
  total_budgeted: z.number(),
  total_executed: z.number(),
  execution_rate: z.string(),
  categories: z.record(z.object({
    budgeted: z.number().optional(),
    executed: z.number().optional(),
    execution_rate: z.string().optional()
  })).optional()
});

export const BudgetItemSchema = z.object({
  name: z.string(),
  value: z.number(),
  budgeted: z.number().optional(),
  executed: z.number().optional(),
  source: z.string().optional()
});

export type BudgetData = z.infer<typeof BudgetDataSchema>;
export type BudgetItem = z.infer<typeof BudgetItemSchema>;