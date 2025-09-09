// Advanced Data Fetching with React Query
// Comprehensive data management for transparency portal charts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import * as consolidatedApiService from '../services/ConsolidatedApiService';
import monitoring from '../utils/monitoring';
import { z } from 'zod';

// Zod schemas for runtime validation
const BudgetDataSchema = z.object({
  total_budgeted: z.number().min(0),
  total_executed: z.number().min(0),
  execution_rate: z.number().min(0).max(100),
  categories: z.record(z.object({
    budgeted: z.number().min(0),
    executed: z.number().min(0),
    execution_rate: z.number().min(0).max(100),
    variance: z.number().optional(),
    variance_percentage: z.number().optional()
  }))
});

const DebtDataSchema = z.array(z.object({
  id: z.string(),
  debt_type: z.string().min(1),
  description: z.string(),
  amount: z.number().min(0),
  interest_rate: z.number().min(0),
  due_date: z.string(),
  status: z.enum(['active', 'paid', 'overdue', 'restructured']),
  principal_amount: z.number().min(0).optional(),
  accrued_interest: z.number().min(0).optional()
}));

const InvestmentDataSchema = z.array(z.object({
  id: z.string(),
  asset_type: z.string(),
  description: z.string(),
  value: z.number().min(0),
  depreciation: z.number().min(0),
  location: z.string(),
  net_value: z.number().min(0),
  age_years: z.number().min(0),
  acquisition_date: z.string(),
  category: z.string(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical'])
}));

// Query keys factory
export const queryKeys = {
  all: ['transparency'] as const,
  budget: (year: number) => [...queryKeys.all, 'budget', year] as const,
  debt: (year: number) => [...queryKeys.all, 'debt', year] as const,
  investments: (year: number) => [...queryKeys.all, 'investments', year] as const,
  salaries: (year: number) => [...queryKeys.all, 'salaries', year] as const,
  contracts: (year: number) => [...queryKeys.all, 'contracts', year] as const,
  documents: (year: number) => [...queryKeys.all, 'documents', year] as const,
  availableYears: () => [...queryKeys.all, 'availableYears'] as const,
  health: () => [...queryKeys.all, 'health'] as const,
};

// Cache configuration
const cacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes  
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors except 408 (timeout)
    if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
      return false;
    }
    // Retry up to 3 times with exponential backoff
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
};

// Enhanced error handling
const handleQueryError = (error: any, queryKey: string) => {
  monitoring.captureError(error, {
    queryKey,
    chartType: queryKey.includes('budget') ? 'budget' : 
               queryKey.includes('debt') ? 'debt' : 
               'unknown'
  });
  
  console.error(`Query error for ${queryKey}:`, error);
  return error;
};

// Advanced Budget Data Hook
export const useBudgetData = (year: number, options: {
  enabled?: boolean;
  locale?: string;
  includeMetrics?: boolean;
  refetchInterval?: number;
} = {}) => {
  const {
    enabled = true,
    locale = 'es',
    includeMetrics = true,
    refetchInterval
  } = options;

  const queryResult = useQuery({
    queryKey: queryKeys.budget(year),
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        const response = await consolidatedApiService.getYearlyData(year);
        
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch budget data');
        }

        // Validate data with Zod
        const validatedData = BudgetDataSchema.parse(response.data);
        
        // Track performance
        const duration = performance.now() - startTime;
        monitoring.captureMetric({
          name: 'api_budget_fetch',
          value: duration,
          unit: 'ms',
          tags: { year: year.toString(), locale }
        });

        return {
          ...validatedData,
          metadata: response.metadata,
          fetchTime: duration
        };
      } catch (error) {
        handleQueryError(error, 'budget');
        throw error;
      }
    },
    enabled,
    refetchInterval,
    ...cacheConfig
  });

  // Enhanced derived data
  const enhancedData = useMemo(() => {
    if (!queryResult.data) return null;

    const data = queryResult.data;
    
    // Calculate enhanced metrics
    const categoryMetrics = Object.entries(data.categories).map(([name, category]) => ({
      name,
      ...category,
      efficiency: category.budgeted > 0 ? (category.executed / category.budgeted) : 0,
      variance_abs: Math.abs(category.variance || 0),
      performance_rating: category.execution_rate >= 90 ? 'excellent' :
                         category.execution_rate >= 75 ? 'good' :
                         category.execution_rate >= 60 ? 'fair' : 'poor'
    }));

    const totalVariance = categoryMetrics.reduce((sum, cat) => sum + (cat.variance || 0), 0);
    const avgExecutionRate = categoryMetrics.reduce((sum, cat) => sum + cat.execution_rate, 0) / categoryMetrics.length;

    return {
      ...data,
      categoryMetrics,
      summary: {
        totalVariance,
        avgExecutionRate,
        topPerformer: categoryMetrics.reduce((best, cat) => 
          cat.execution_rate > best.execution_rate ? cat : best
        ),
        bottomPerformer: categoryMetrics.reduce((worst, cat) => 
          cat.execution_rate < worst.execution_rate ? cat : worst
        ),
        totalCategories: categoryMetrics.length,
        overBudgetCount: categoryMetrics.filter(cat => (cat.variance || 0) > 0).length,
        underBudgetCount: categoryMetrics.filter(cat => (cat.variance || 0) < 0).length
      }
    };
  }, [queryResult.data]);

  return {
    ...queryResult,
    data: enhancedData,
    isValidating: queryResult.isFetching && !queryResult.isLoading
  };
};

// Advanced Debt Data Hook  
export const useDebtData = (year: number, options: {
  enabled?: boolean;
  includeAnalytics?: boolean;
  riskAnalysis?: boolean;
} = {}) => {
  const {
    enabled = true,
    includeAnalytics = true,
    riskAnalysis = true
  } = options;

  const queryResult = useQuery({
    queryKey: queryKeys.debt(year),
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        const response = await consolidatedApiService.getMunicipalDebt(year);
        
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch debt data');
        }

        // Validate data with Zod
        const validatedData = DebtDataSchema.parse(response.data);
        
        // Track performance
        const duration = performance.now() - startTime;
        monitoring.captureMetric({
          name: 'api_debt_fetch',
          value: duration,
          unit: 'ms',
          tags: { year: year.toString() }
        });

        return {
          items: validatedData,
          metadata: response.metadata,
          fetchTime: duration
        };
      } catch (error) {
        handleQueryError(error, 'debt');
        throw error;
      }
    },
    enabled,
    ...cacheConfig
  });

  // Enhanced analytics
  const analytics = useMemo(() => {
    if (!queryResult.data || !includeAnalytics) return null;

    const items = queryResult.data.items;
    const currentDate = new Date();
    const oneYearFromNow = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

    const totalDebt = items.reduce((sum, item) => sum + item.amount, 0);
    const totalInterest = items.reduce((sum, item) => sum + (item.accrued_interest || 0), 0);
    const averageRate = items.length > 0 ? 
      items.reduce((sum, item) => sum + item.interest_rate, 0) / items.length : 0;

    // Maturity analysis
    const shortTermDebt = items.filter(item => new Date(item.due_date) <= oneYearFromNow);
    const longTermDebt = items.filter(item => new Date(item.due_date) > oneYearFromNow);

    // Risk analysis
    let riskScore = 0;
    let riskFactors: string[] = [];

    if (riskAnalysis) {
      // High interest rate risk
      const highRateItems = items.filter(item => item.interest_rate > 10);
      if (highRateItems.length > 0) {
        riskScore += highRateItems.length * 2;
        riskFactors.push(`${highRateItems.length} deudas con tasa alta (>10%)`);
      }

      // Short-term liquidity risk
      const shortTermRatio = shortTermDebt.length / items.length;
      if (shortTermRatio > 0.6) {
        riskScore += 3;
        riskFactors.push('Alta concentración de deuda a corto plazo');
      }

      // Large debt concentration risk
      const largestDebt = Math.max(...items.map(item => item.amount));
      const debtConcentration = largestDebt / totalDebt;
      if (debtConcentration > 0.5) {
        riskScore += 2;
        riskFactors.push('Alta concentración en una sola deuda');
      }
    }

    const riskLevel = riskScore >= 7 ? 'high' : riskScore >= 4 ? 'medium' : 'low';

    return {
      totalDebt,
      totalInterest,
      averageRate,
      shortTerm: {
        count: shortTermDebt.length,
        amount: shortTermDebt.reduce((sum, item) => sum + item.amount, 0),
        percentage: (shortTermDebt.reduce((sum, item) => sum + item.amount, 0) / totalDebt) * 100
      },
      longTerm: {
        count: longTermDebt.length,
        amount: longTermDebt.reduce((sum, item) => sum + item.amount, 0),
        percentage: (longTermDebt.reduce((sum, item) => sum + item.amount, 0) / totalDebt) * 100
      },
      byType: items.reduce((acc, item) => {
        const type = item.debt_type;
        if (!acc[type]) {
          acc[type] = { count: 0, amount: 0, items: [] };
        }
        acc[type].count++;
        acc[type].amount += item.amount;
        acc[type].items.push(item);
        return acc;
      }, {} as Record<string, { count: number; amount: number; items: any[] }>),
      risk: {
        score: riskScore,
        level: riskLevel,
        factors: riskFactors,
        recommendations: generateRiskRecommendations(riskLevel, riskFactors)
      }
    };
  }, [queryResult.data, includeAnalytics, riskAnalysis]);

  return {
    ...queryResult,
    data: queryResult.data,
    analytics
  };
};

// Investment Data Hook
export const useInvestmentData = (year: number, options: {
  enabled?: boolean;
  includeDepreciation?: boolean;
} = {}) => {
  const { enabled = true, includeDepreciation = true } = options;

  return useQuery({
    queryKey: queryKeys.investments(year),
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        // Note: This would need to be implemented in the API
        const response = await fetch(`/api/transparency/investments/${year}`);
        
        if (!response.ok) {
          throw new Error(`Investment API error: ${response.status}`);
        }

        const data = await response.json();
        const validatedData = InvestmentDataSchema.parse(data.data || []);
        
        const duration = performance.now() - startTime;
        monitoring.captureMetric({
          name: 'api_investment_fetch',
          value: duration,
          unit: 'ms',
          tags: { year: year.toString() }
        });

        return {
          items: validatedData,
          fetchTime: duration
        };
      } catch (error) {
        handleQueryError(error, 'investments');
        throw error;
      }
    },
    enabled,
    ...cacheConfig
  });
};

// Multi-year data comparison hook
export const useMultiYearComparison = (years: number[], dataType: 'budget' | 'debt') => {
  const queries = years.map(year => ({
    queryKey: dataType === 'budget' ? queryKeys.budget(year) : queryKeys.debt(year),
    year
  }));

  const results = useQuery({
    queryKey: ['multiYear', dataType, ...years],
    queryFn: async () => {
      const promises = years.map(async (year) => {
        try {
          const response = dataType === 'budget' 
            ? await consolidatedApiService.getYearlyData(year)
            : await consolidatedApiService.getMunicipalDebt(year);
          
          return { year, data: response.data, success: response.success };
        } catch (error) {
          return { year, data: null, success: false, error };
        }
      });

      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        year: years[index],
        ...(result.status === 'fulfilled' ? result.value : { data: null, success: false, error: result.reason })
      }));
    },
    ...cacheConfig
  });

  const comparison = useMemo(() => {
    if (!results.data) return null;

    const validYears = results.data.filter(item => item.success && item.data);
    
    if (dataType === 'budget') {
      return {
        totalBudgetTrend: validYears.map(item => ({
          year: item.year,
          value: item.data.total_budgeted
        })),
        executionTrend: validYears.map(item => ({
          year: item.year,
          value: item.data.execution_rate
        })),
        yearOverYearGrowth: validYears.map((item, index) => {
          if (index === 0) return { year: item.year, growth: 0 };
          const prev = validYears[index - 1];
          const growth = ((item.data.total_budgeted - prev.data.total_budgeted) / prev.data.total_budgeted) * 100;
          return { year: item.year, growth };
        })
      };
    } else {
      return {
        totalDebtTrend: validYears.map(item => ({
          year: item.year,
          value: item.data.reduce((sum: number, debt: any) => sum + debt.amount, 0)
        })),
        averageRateTrend: validYears.map(item => ({
          year: item.year,
          value: item.data.reduce((sum: number, debt: any) => sum + debt.interest_rate, 0) / item.data.length
        }))
      };
    }
  }, [results.data, dataType]);

  return {
    ...results,
    comparison
  };
};

// Available years hook
export const useAvailableYears = () => {
  return useQuery({
    queryKey: queryKeys.availableYears(),
    queryFn: async () => {
      const response = await fetch('/api/transparency/years');
      if (!response.ok) {
        throw new Error('Failed to fetch available years');
      }
      const data = await response.json();
      return data.years || [2024, 2023, 2022, 2021, 2020];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000 // 1 hour
  });
};

// Prefetch hook for performance optimization
export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchBudgetData = useCallback(async (year: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.budget(year),
      queryFn: async () => {
        const response = await consolidatedApiService.getYearlyData(year);
        if (!response.success) throw new Error('Failed to fetch budget data');
        return BudgetDataSchema.parse(response.data);
      },
      ...cacheConfig
    });
  }, [queryClient]);

  const prefetchDebtData = useCallback(async (year: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.debt(year),
      queryFn: async () => {
        const response = await consolidatedApiService.getMunicipalDebt(year);
        if (!response.success) throw new Error('Failed to fetch debt data');
        return DebtDataSchema.parse(response.data);
      },
      ...cacheConfig
    });
  }, [queryClient]);

  return {
    prefetchBudgetData,
    prefetchDebtData
  };
};

// Utility functions
const generateRiskRecommendations = (riskLevel: string, factors: string[]): string[] => {
  const recommendations: string[] = [];

  if (riskLevel === 'high') {
    recommendations.push('Considerar reestructuración de deuda a corto plazo');
    recommendations.push('Evaluar refinanciamiento de deudas con alta tasa de interés');
    recommendations.push('Implementar plan de reducción de deuda urgente');
  } else if (riskLevel === 'medium') {
    recommendations.push('Monitorear vencimientos próximos');
    recommendations.push('Diversificar fuentes de financiamiento');
  } else {
    recommendations.push('Mantener nivel actual de endeudamiento');
    recommendations.push('Evaluar oportunidades de inversión');
  }

  if (factors.some(f => f.includes('corto plazo'))) {
    recommendations.push('Negociar extensión de plazos con acreedores');
  }

  if (factors.some(f => f.includes('concentración'))) {
    recommendations.push('Diversificar cartera de deuda');
  }

  return recommendations;
};

export default {
  useBudgetData,
  useDebtData,
  useInvestmentData,
  useMultiYearComparison,
  useAvailableYears,
  usePrefetchData
};