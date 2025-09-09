// src/schemas/budget.ts
// Zod schemas for budget data validation

import { z } from 'zod';

export const BudgetCategorySchema = z.object({
  budgeted: z.number().optional(),
  executed: z.number().optional(),
  execution_rate: z.string().optional(),
  description: z.string().optional(),
});

export const BudgetDataSchema = z.object({
  total_budgeted: z.number(),
  total_executed: z.number(),
  execution_rate: z.string(),
  categories: z.record(BudgetCategorySchema).optional(),
  metadata: z.object({
    year: z.number(),
    last_updated: z.string(),
    source: z.string(),
  }).optional(),
});

export const BudgetApiResponseSchema = z.object({
  year: z.number(),
  budget_data: BudgetDataSchema,
  comparison_data: z.object({
    previous_year: z.number().optional(),
    current_year: z.number(),
    budget_change: z.number().optional(),
    execution_change: z.number().optional(),
  }).optional(),
});

export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;
export type BudgetData = z.infer<typeof BudgetDataSchema>;
export type BudgetApiResponse = z.infer<typeof BudgetApiResponseSchema>;