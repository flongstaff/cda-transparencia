// src/hooks/useUnifiedData.ts
// Unified data hook that ensures all components use the same data sources

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { consolidatedApiService } from '../services/ConsolidatedApiService';
import { DebtApiResponse, DebtApiResponseSchema } from '../schemas/debt';
import { BudgetData, BudgetDataSchema } from '../schemas/budget';
import { dataLoader } from '../utils/dataLoader';

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
    async () => {
      try {
        // First try to get real data from the API
        const apiData = await consolidatedApiService.getMunicipalDebt(year);
        return apiData;
      } catch (error) {
        console.warn(`Failed to fetch debt data from API for year ${year}, using local mock data:`, error.message);
        
        // Fallback to local JSON data
        try {
          const localData = await dataLoader.loadDebtData(year);
          
          // Transform local data to match expected API format
          const transformedData: DebtApiResponse = {
            debt_data: localData.debt_by_type ? 
              Object.entries(localData.debt_by_type).map(([debt_type, amount]) => ({
                debt_type,
                description: `${debt_type} - Tasa: ${localData.average_interest_rate || 0}%`,
                amount: typeof amount === 'number' ? amount : 0,
                interest_rate: localData.average_interest_rate || 0,
                due_date: localData.due_date || null,
                status: 'active',
                principal_amount: typeof amount === 'number' ? amount : 0,
                accrued_interest: 0
              })) : [],
            total_debt: localData.total_debt || 0,
            average_interest_rate: localData.average_interest_rate || 0,
            long_term_debt: localData.long_term_debt || 0,
            short_term_debt: localData.short_term_debt || 0,
            debt_by_type: localData.debt_by_type || {},
            metadata: {
              year: year,
              last_updated: new Date().toISOString(),
              source: 'local_json_fallback'
            }
          };
          
          return transformedData;
        } catch (localError) {
          console.error(`Failed to load local debt data for year ${year}:`, localError.message);
          
          // Ultimate fallback - generate mock data
          return {
            debt_data: [
              {
                debt_type: 'Deuda Pública',
                description: 'Bonos municipales',
                amount: 1000000000,
                interest_rate: 8.5,
                due_date: '2025-12-31',
                status: 'active',
                principal_amount: 1000000000,
                accrued_interest: 0
              },
              {
                debt_type: 'Deuda Comercial',
                description: 'Proveedores',
                amount: 300000000,
                interest_rate: 12.0,
                due_date: '2024-06-30',
                status: 'active',
                principal_amount: 300000000,
                accrued_interest: 0
              },
              {
                debt_type: 'Otras Obligaciones',
                description: 'Préstamos bancarios',
                amount: 200000000,
                interest_rate: 10.0,
                due_date: '2026-03-15',
                status: 'active',
                principal_amount: 200000000,
                accrued_interest: 0
              }
            ],
            total_debt: 1500000000,
            average_interest_rate: 9.83,
            long_term_debt: 1200000000,
            short_term_debt: 300000000,
            debt_by_type: {
              'Deuda Pública': 1000000000,
              'Deuda Comercial': 300000000,
              'Otras Obligaciones': 200000000
            },
            metadata: {
              year: year,
              last_updated: new Date().toISOString(),
              source: 'mock_data_fallback'
            }
          };
        }
      }
    },
    DebtApiResponseSchema
  );
};

// Specific hook for budget data
export const useBudgetData = (year: number) => {
  return useUnifiedData<BudgetData>(
    `budget-${year}`,
    async () => {
      try {
        // First try to get real data from the API
        const apiData = await consolidatedApiService.getBudgetData(year);
        return apiData;
      } catch (error) {
        console.warn(`Failed to fetch budget data from API for year ${year}, using local mock data:`, error.message);
        
        // Fallback to local JSON data
        try {
          const localData = await dataLoader.loadBudgetData(year);
          
          // Transform local data to match expected API format
          const transformedData: BudgetData = {
            total_budgeted: localData.totalBudget || 0,
            total_executed: localData.totalExecuted || 0,
            execution_rate: localData.executionPercentage?.toString() || '0',
            categories: localData.categories ? 
              Object.fromEntries(
                localData.categories.map((cat: any) => [
                  cat.name,
                  {
                    budgeted: cat.budgeted,
                    executed: cat.executed,
                    execution_rate: cat.percentage?.toString() || '0'
                  }
                ])
              ) : {},
            metadata: {
              year: year,
              last_updated: new Date().toISOString(),
              source: 'local_json_fallback'
            }
          };
          
          return transformedData;
        } catch (localError) {
          console.error(`Failed to load local budget data for year ${year}:`, localError.message);
          
          // Ultimate fallback - generate mock data
          return {
            total_budgeted: 5000000000,
            total_executed: 4200000000,
            execution_rate: '84.0',
            categories: {
              'Gastos en Personal': {
                budgeted: 2250000000,
                executed: 1900000000,
                execution_rate: '84.4'
              },
              'Servicios no Personales': {
                budgeted: 1250000000,
                executed: 1050000000,
                execution_rate: '84.0'
              },
              'Bienes de Consumo': {
                budgeted: 750000000,
                executed: 630000000,
                execution_rate: '84.0'
              },
              'Transferencias': {
                budgeted: 750000000,
                executed: 620000000,
                execution_rate: '82.7'
              }
            },
            metadata: {
              year: year,
              last_updated: new Date().toISOString(),
              source: 'mock_data_fallback'
            }
          };
        }
      }
    },
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
      interest_rate: debtData.average_interest_rate || 0,
      due_date: debtData.due_date || null,
      status: debtData.status || 'active',
      description: `${debt_type} - Tasa: ${debtData.average_interest_rate || 0}%`,
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