import { z } from 'zod';

// Budget Data Schema
export const BudgetDataSchema = z.object({
  total_budgeted: z.number(),
  total_executed: z.number(),
  categories: z.record(z.object({
    budgeted: z.number().optional(),
    executed: z.number().optional()
  })).optional()
});

// Document Schema
export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  filename: z.string(),
  year: z.number(),
  category: z.string(),
  type: z.string(),
  size_mb: z.string(),
  url: z.string(),
  official_url: z.string(),
  verification_status: z.string(),
  processing_date: z.string()
});

// Financial Summary Schema
export const FinancialSummarySchema = z.object({
  totalBudget: z.number(),
  totalExecuted: z.number(),
  executionRate: z.number(),
  categories: z.array(z.object({
    name: z.string(),
    budgeted: z.number(),
    executed: z.number(),
    execution_rate: z.number()
  }))
});

// Salary Data Schema
export const SalaryDataSchema = z.object({
  id: z.string(),
  employee_name: z.string(),
  position: z.string(),
  department: z.string(),
  gross_salary: z.number(),
  net_salary: z.number(),
  year: z.number(),
  month: z.string()
});

// Validation helper function
export const validateApiResponse = <T>(data: unknown, schema: z.ZodSchema<T>): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Data validation error:', error);
    throw new Error('Invalid data structure received from API');
  }
};