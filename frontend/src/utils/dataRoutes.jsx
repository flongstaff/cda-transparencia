// src/utils/dataRoutes.js
// Unified data routing system for all transparency components

/**
 * Unified data routing system that ensures all components use the same data sources
 * with consistent error handling, caching, and fallback mechanisms
 */

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { consolidatedApiService } from '../services/ConsolidatedApiService';

// Define data schemas for validation
const DebtDataSchema = z.array(z.object({
  debt_type: z.string(),
  description: z.string(),
  amount: z.number().positive(),
  interest_rate: z.number().min(0).max(100),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'paid', 'defaulted', 'refinanced']),
  principal_amount: z.number().optional(),
  accrued_interest: z.number().optional(),
}));

const BudgetDataSchema = z.object({
  total_budgeted: z.number(),
  total_executed: z.number(),
  execution_rate: z.string(),
  categories: z.record(z.object({
    budgeted: z.number().optional(),
    executed: z.number().optional(),
    execution_rate: z.string().optional()
  })).optional()
});

// Unified data fetching hook with consistent error handling and caching
export const useUnifiedData = (endpoint, params, schema) => {
  return useQuery({
    queryKey: [endpoint, ...Object.values(params)],
    queryFn: async () => {
      try {
        // Try primary data source first
        let data;
        switch (endpoint) {
          case 'debt':
            data = await consolidatedApiService.getMunicipalDebt(params.year);
            break;
          case 'budget':
            data = await consolidatedApiService.getBudgetData(params.year);
            break;
          case 'documents':
            data = await consolidatedApiService.getDocuments(params.year);
            break;
          default:
            throw new Error(`Unknown endpoint: ${endpoint}`);
        }
        
        // Validate data structure
        if (schema) {
          const parsed = schema.safeParse(data);
          if (!parsed.success) {
            console.error('Data validation failed:', parsed.error);
            throw new Error('Invalid data structure received from API');
          }
          return parsed.data;
        }
        
        return data;
      } catch (error) {
        console.error(`Error fetching ${endpoint} data:`, error);
        
        // Fallback to local data sources if available
        try {
          // This would implement local data fallback logic
          // For now, we'll just re-throw the error
          throw error;
        } catch (fallbackError) {
          console.error('Both primary and fallback data sources failed:', fallbackError);
          throw new Error(`Failed to fetch ${endpoint} data from all sources`);
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Specific hooks for different data types
export const useDebtData = (year) => {
  return useUnifiedData('debt', { year }, DebtDataSchema);
};

export const useBudgetData = (year) => {
  return useUnifiedData('budget', { year }, BudgetDataSchema);
};

export const useDocumentData = (year) => {
  return useUnifiedData('documents', { year }, null); // No specific schema for now
};

// Utility functions for data transformation
export const transformDebtData = (debtData) => {
  // Ensure we're working with the correct data structure
  if (!debtData || typeof debtData !== 'object') {
    return [];
  }
  
  // Handle case where debtData is an object with debt_by_type property
  if (debtData.debt_by_type && typeof debtData.debt_by_type === 'object') {
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

// Error handling utilities
export const handleDataError = (error, componentName) => {
  console.error(`${componentName} data error:`, error);
  
  // Log to error tracking service if available
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: {
        component: componentName
      }
    });
  }
  
  return {
    error: true,
    message: 'Error al cargar los datos. Por favor, inténtelo de nuevo más tarde.',
    details: error.message
  };
};

// Loading state utilities
export const LoadingSkeleton = ({ type = 'chart' }) => {
  const skeletons = {
    chart: (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-80 w-full"></div>
    ),
    table: (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    ),
    card: (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32 w-full"></div>
    )
  };
  
  return skeletons[type] || skeletons.chart;
};

// Accessibility utilities
export const useAnnouncement = () => {
  // This would implement aria-live announcements
  // For now, we'll return a simple function
  return (message) => {
    console.log('Screen reader announcement:', message);
  };
};

export default {
  useDebtData,
  useBudgetData,
  useDocumentData,
  transformDebtData,
  handleDataError,
  LoadingSkeleton,
  useAnnouncement
};