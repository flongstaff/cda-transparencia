import { z } from 'zod';

// Budget Category Schema
export const BudgetCategorySchema = z.object({
  budgeted: z.number().min(0, 'Budgeted amount must be non-negative'),
  executed: z.number().min(0, 'Executed amount must be non-negative'),
  execution_rate: z.union([
    z.string().regex(/^\d+(\.\d+)?$/, 'Invalid execution rate format'),
    z.number().min(0).max(200, 'Execution rate must be between 0-200%')
  ])
});

// Main Budget Data Schema
export const BudgetDataSchema = z.object({
  total_budgeted: z.number().min(0, 'Total budgeted must be non-negative'),
  total_executed: z.number().min(0, 'Total executed must be non-negative'),
  execution_rate: z.union([
    z.string().regex(/^\d+(\.\d+)?$/, 'Invalid execution rate format'),
    z.number().min(0).max(200, 'Execution rate must be between 0-200%')
  ]),
  categories: z.record(BudgetCategorySchema).optional()
});

// Budget Item Schema (for chart data)
export const BudgetItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.number().min(0, 'Value must be non-negative'),
  budgeted: z.number().min(0).optional(),
  executed: z.number().min(0).optional(),
  source: z.string().optional(),
  category: z.string().optional(),
  efficiency: z.number().min(0).max(200).optional(),
  trend: z.enum(['up', 'down', 'stable']).optional()
});

// Extended Budget Data with Analytics
export const BudgetAnalyticsSchema = z.object({
  totalBudgeted: z.number().min(0),
  totalExecuted: z.number().min(0),
  executionRate: z.number().min(0).max(200),
  overBudgetCount: z.number().min(0),
  underBudgetCount: z.number().min(0),
  efficiencyScore: z.enum(['excellent', 'good', 'needs_improvement'])
});

// API Response Schema
export const BudgetApiResponseSchema = z.object({
  data: z.array(BudgetItemSchema),
  metadata: z.object({
    year: z.number().min(2000).max(2030),
    lastUpdated: z.string().datetime(),
    source: z.string(),
    dataQuality: z.enum(['HIGH', 'MEDIUM', 'LOW', 'CACHED']),
    recordCount: z.number().min(0),
    networkStatus: z.enum(['online', 'offline']).optional(),
    cacheUsed: z.boolean().optional()
  }),
  error: z.string().nullable().optional(),
  warning: z.string().nullable().optional()
});

// Health Check Schema
export const HealthCheckSchema = z.object({
  status: z.enum(['success', 'error', 'degraded']),
  timestamp: z.string().datetime(),
  services: z.record(z.enum(['active', 'inactive', 'degraded'])).optional(),
  database: z.enum(['connected', 'disconnected']).optional()
});

// Type exports
export type BudgetData = z.infer<typeof BudgetDataSchema>;
export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;
export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type BudgetAnalytics = z.infer<typeof BudgetAnalyticsSchema>;
export type BudgetApiResponse = z.infer<typeof BudgetApiResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Validation helper functions
export const validateBudgetData = (data: unknown): BudgetData => {
  try {
    return BudgetDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Budget data validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

export const validateBudgetItems = (data: unknown[]): BudgetItem[] => {
  try {
    return data.map((item, index) => {
      try {
        return BudgetItemSchema.parse(item);
      } catch (error) {
        console.warn(`Invalid budget item at index ${index}:`, error);
        // Return a safe fallback item
        return {
          name: `Item ${index + 1}`,
          value: 0,
          source: 'Validation Error'
        };
      }
    });
  } catch (error) {
    throw new Error(`Budget items validation failed: ${error.message}`);
  }
};

// Schema refinements for business logic
export const BudgetDataWithBusinessRulesSchema = BudgetDataSchema.refine(
  (data) => data.total_executed <= data.total_budgeted * 1.5,
  {
    message: "Executed amount seems unusually high compared to budgeted amount",
    path: ["total_executed"]
  }
).refine(
  (data) => {
    if (data.categories) {
      const categoryTotal = Object.values(data.categories).reduce(
        (sum, cat) => sum + cat.budgeted, 0
      );
      return Math.abs(categoryTotal - data.total_budgeted) < data.total_budgeted * 0.1;
    }
    return true;
  },
  {
    message: "Category totals don't match overall budget within 10% tolerance",
    path: ["categories"]
  }
);

export default {
  BudgetDataSchema,
  BudgetCategorySchema,
  BudgetItemSchema,
  BudgetAnalyticsSchema,
  BudgetApiResponseSchema,
  HealthCheckSchema,
  validateBudgetData,
  validateBudgetItems
};