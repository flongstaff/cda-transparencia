import { z } from 'zod';

// Investment Data Schema with comprehensive validation
export const InvestmentDataSchema = z.object({
  id: z.string().min(1, 'Investment ID is required'),
  asset_type: z.string().min(1, 'Asset type is required'),
  description: z.string().min(1, 'Description is required'),
  value: z.number().positive('Investment value must be positive'),
  depreciation: z.number().nonnegative('Depreciation cannot be negative').optional(),
  location: z.string().min(1, 'Location is required'),
  net_value: z.number().optional(),
  age_years: z.number().nonnegative('Age cannot be negative').optional(),
  acquisition_date: z.string().datetime().or(z.string().date()).optional(),
  category: z.enum(['infrastructure', 'equipment', 'vehicles', 'buildings', 'technology', 'other']).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']).optional(),
  maintenance_cost_annual: z.number().nonnegative().optional(),
  estimated_useful_life: z.number().positive().optional(),
  salvage_value: z.number().nonnegative().optional()
});

// Array of investments
export const InvestmentDataArraySchema = z.array(InvestmentDataSchema);

// Investment Analytics Schema
export const InvestmentAnalyticsSchema = z.object({
  totalInvestment: z.number().nonnegative(),
  totalDepreciation: z.number().nonnegative(),
  netInvestmentValue: z.number(),
  investmentByType: z.array(z.object({
    name: z.string(),
    value: z.number().nonnegative(),
    color: z.string(),
    percentage: z.number().min(0).max(100),
    count: z.number().nonnegative()
  })),
  topInvestments: z.array(InvestmentDataSchema),
  averageAge: z.number().nonnegative(),
  maintenanceRatio: z.number().min(0).max(1),
  depreciationRate: z.number().min(0).max(1)
});

// API Response Schema
export const InvestmentApiResponseSchema = z.object({
  success: z.boolean(),
  data: InvestmentDataArraySchema,
  metadata: z.object({
    total_records: z.number().nonnegative(),
    year: z.number().int().min(2000).max(2030),
    last_updated: z.string(),
    source: z.string(),
    data_quality: z.enum(['HIGH', 'MEDIUM', 'LOW', 'CACHED']),
    currency: z.string().default('ARS')
  }),
  error: z.string().nullable().optional()
});

// Type exports
export type InvestmentData = z.infer<typeof InvestmentDataSchema>;
export type InvestmentDataArray = z.infer<typeof InvestmentDataArraySchema>;
export type InvestmentAnalytics = z.infer<typeof InvestmentAnalyticsSchema>;
export type InvestmentApiResponse = z.infer<typeof InvestmentApiResponseSchema>;

// Validation helper functions
export const validateInvestmentData = (data: unknown): InvestmentDataArray => {
  try {
    return InvestmentDataArraySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Investment data validation errors:', error.errors);
      throw new Error(`Investment data validation failed: ${error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ')}`);
    }
    throw error;
  }
};

// Calculate investment analytics with proper typing
export const calculateInvestmentAnalytics = (data: InvestmentDataArray): InvestmentAnalytics => {
  if (data.length === 0) {
    return {
      totalInvestment: 0,
      totalDepreciation: 0,
      netInvestmentValue: 0,
      investmentByType: [],
      topInvestments: [],
      averageAge: 0,
      maintenanceRatio: 0,
      depreciationRate: 0
    };
  }

  const totalInvestment = data.reduce((sum, inv) => sum + inv.value, 0);
  const totalDepreciation = data.reduce((sum, inv) => sum + (inv.depreciation || 0), 0);
  const netInvestmentValue = totalInvestment - totalDepreciation;
  
  // Calculate total maintenance costs
  const totalMaintenanceCost = data.reduce((sum, inv) => sum + (inv.maintenance_cost_annual || 0), 0);

  // Group by asset type
  const investmentByType = data.reduce((acc, inv) => {
    const type = inv.asset_type || 'Otros';
    if (!acc[type]) {
      acc[type] = { value: 0, count: 0 };
    }
    acc[type].value += inv.value;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { value: number; count: number }>);

  // Colors for different asset types
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ];

  const investmentByTypeArray = Object.entries(investmentByType)
    .map(([name, data], index) => ({
      name,
      value: data.value,
      count: data.count,
      color: COLORS[index % COLORS.length],
      percentage: totalInvestment > 0 ? (data.value / totalInvestment) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  // Top 5 investments by value
  const topInvestments = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Calculate average age
  const assetsWithAge = data.filter(inv => inv.age_years !== undefined);
  const averageAge = assetsWithAge.length > 0 
    ? assetsWithAge.reduce((sum, inv) => sum + (inv.age_years || 0), 0) / assetsWithAge.length 
    : 0;

  // Calculate ratios
  const maintenanceRatio = totalInvestment > 0 ? totalMaintenanceCost / totalInvestment : 0;
  const depreciationRate = totalInvestment > 0 ? totalDepreciation / totalInvestment : 0;

  return {
    totalInvestment,
    totalDepreciation,
    netInvestmentValue,
    investmentByType: investmentByTypeArray,
    topInvestments,
    averageAge: parseFloat(averageAge.toFixed(1)),
    maintenanceRatio: parseFloat(maintenanceRatio.toFixed(3)),
    depreciationRate: parseFloat(depreciationRate.toFixed(3))
  };
};

// Business rule validations
export const InvestmentBusinessRulesSchema = InvestmentDataSchema
  .refine(
    (data) => !data.depreciation || data.depreciation <= data.value,
    {
      message: "Depreciation cannot exceed asset value",
      path: ["depreciation"]
    }
  )
  .refine(
    (data) => !data.net_value || data.net_value >= 0,
    {
      message: "Net value cannot be negative",
      path: ["net_value"]  
    }
  )
  .refine(
    (data) => !data.salvage_value || data.salvage_value <= data.value,
    {
      message: "Salvage value cannot exceed original asset value",
      path: ["salvage_value"]
    }
  )
  .refine(
    (data) => {
      if (data.acquisition_date && data.age_years !== undefined) {
        const acquisitionYear = new Date(data.acquisition_date).getFullYear();
        const currentYear = new Date().getFullYear();
        const calculatedAge = currentYear - acquisitionYear;
        return Math.abs(calculatedAge - data.age_years) <= 1; // Allow 1 year tolerance
      }
      return true;
    },
    {
      message: "Asset age doesn't match acquisition date",
      path: ["age_years"]
    }
  );

export default {
  InvestmentDataSchema,
  InvestmentDataArraySchema,
  InvestmentAnalyticsSchema,
  InvestmentApiResponseSchema,
  InvestmentBusinessRulesSchema,
  validateInvestmentData,
  calculateInvestmentAnalytics
};