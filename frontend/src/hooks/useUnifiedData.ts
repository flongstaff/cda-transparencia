// src/hooks/useUnifiedData.ts
// Unified data hook that ensures all components use the same data sources

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { consolidatedApiService } from '../services/ConsolidatedApiService';
import { DebtApiResponse, DebtApiResponseSchema } from '../schemas/debt';
import { BudgetData, BudgetDataSchema } from '../schemas/budget';

// Generic unified data hook
export const useUnifiedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  schema?: z.ZodSchema<T>
) => {
  return useQuery<T, Error>({
    queryKey: [key],
    queryFn: async () => {
      try {
        const data = await fetcher();
        
        // Validate data if schema is provided
        if (schema) {
          const parsed = schema.safeParse(data);
          if (!parsed.success) {
            console.error('Data validation failed:', parsed.error);
            throw new Error('Invalid data structure received from API');
          }
          return parsed.data as T;
        }
        
        return data;
      } catch (error) {
        console.error(`Error fetching ${key} data:`, error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Specific hook for debt data
export const useDebtData = (year: number) => {
  return useUnifiedData<DebtApiResponse>(
    `debt-${year}`,
    () => consolidatedApiService.getMunicipalDebt(year),
    DebtApiResponseSchema
  );
};

// Specific hook for budget data
export const useBudgetData = (year: number) => {
  return useUnifiedData<BudgetData>(
    `budget-${year}`,
    () => consolidatedApiService.getBudgetData(year),
    BudgetDataSchema
  );
};

// Data transformation utilities
export const transformDebtData = (debtData: any) => {
  // Handle case where debtData is an object with debt_by_type property
  if (debtData && typeof debtData === 'object' && debtData.debt_by_type) {
    return Object.entries(debtData.debt_by_type).map(([debt_type, amount]) => ({
      debt_type,
      amount: typeof amount === 'number' ? amount : 0,
      interest_rate: debtData.interest_rate || 0,
      due_date: debtData.due_date || null,
      status: debtData.status || 'active',
      description: `${debt_type} - Tasa: ${debtData.interest_rate || 0}%`,
      principal_amount: typeof amount === 'number' ? amount : 0,
      accrued_interest: 0
    }));
  }
  
  // Handle case where debtData is already an array
  if (Array.isArray(debtData)) {
    return debtData;
  }
  
  // Handle case where debtData is a simple object
  return [{
    debt_type: 'Total',
    amount: typeof debtData.total_debt === 'number' ? debtData.total_debt : 0,
    interest_rate: typeof debtData.average_interest_rate === 'number' ? debtData.average_interest_rate : 0,
    due_date: debtData.due_date || null,
    status: debtData.status || 'active',
    description: 'Deuda total del municipio',
    principal_amount: typeof debtData.total_debt === 'number' ? debtData.total_debt : 0,
    accrued_interest: 0
  }];
};

export default {
  useUnifiedData,
  useDebtData,
  useBudgetData,
  transformDebtData
};