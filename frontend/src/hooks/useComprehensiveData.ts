import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUnifiedData } from './useUnifiedData';
import { DataFilters } from './useUnifiedData';

// -----------------------------------------------------------------------------
// Helper types (kept minimal for the purposes of this project)
// -----------------------------------------------------------------------------
type Document = {
  id: string;
  title: string;
  category: string;
  type: string;
  filename: string;
  size_mb: number;
  url: string;
  year: number;
  verification_status: string;
  processing_date: string;
};

type FinancialOverview = {
  totalBudget: number;
  totalExecuted: number;
  executionRate: number;
  totalRevenue: number;
  totalDebt: number;
  transparencyScore: number;
};

type BudgetData = Record<string, any>;

// -----------------------------------------------------------------------------
// Core hook – returns the full unified data payload
// -----------------------------------------------------------------------------
export const useComprehensiveData = (filters: DataFilters = {}) => {
  const {
    documents,
    structured,
    loading,
    error,
    metadata,
    lastUpdated,
  } = useUnifiedData(filters);

  // The original stub returned a huge empty object – we now expose the real data.
  return {
    documents: documents as Document[],
    structured,
    loading,
    error,
    metadata,
    lastUpdated,
  };
};

// -----------------------------------------------------------------------------
// Document analysis hook – returns documents + loading/error
// -----------------------------------------------------------------------------
export const useDocumentAnalysis = (filters: DataFilters = {}) => {
  const { documents, loading, error } = useUnifiedData(filters);
  return {
    documents: documents as Document[],
    loading,
    error,
  };
};

// -----------------------------------------------------------------------------
// Financial overview hook – extracts the financial summary for a given year
// -----------------------------------------------------------------------------
export const useFinancialOverview = (year: number, unifiedData?: any) => {
  // Always call useUnifiedData unconditionally
  const {
    structured: hookStructured,
    loading: hookLoading,
    error: hookError,
  } = useUnifiedData({ year });

  // Use provided unifiedData if available, otherwise use data from the hook
  const structured = unifiedData ? unifiedData.structured : hookStructured;
  const loading = unifiedData ? unifiedData.loading : hookLoading;
  const error = unifiedData ? unifiedData.error : hookError;

  // Extract financial data from the structured data
  // The data structure varies by year, so we need to handle different formats
  const financialData = useMemo(() => {
    if (!structured) return null;
    
    // For newer data structures, look for financialOverview
    if (structured.financialOverview) {
      return {
        year: year,
        totalBudget: structured.financialOverview.totalBudget || 0,
        totalExecuted: structured.financialOverview.totalExecuted || 0,
        executionPercentage: structured.financialOverview.executionRate || 0,
        totalRevenue: structured.financialOverview.totalRevenue || 0,
        totalDebt: structured.financialOverview.totalDebt || 0,
        transparencyScore: 85
      };
    }
    
    // For older data structures, look for financial[year]
    if (structured.financial && structured.financial[year]) {
      return structured.financial[year];
    }
    
    // If we can't find specific financial data, return null
    return null;
  }, [structured, year]);

  return {
    data: financialData,
    loading,
    error,
  };
};

// -----------------------------------------------------------------------------
// Budget analysis hook – returns the raw budget JSON for a given year
// -----------------------------------------------------------------------------
export const useBudgetAnalysis = (year: number) => {
  const { structured, loading, error } = useUnifiedData({ year });
  const budget = structured?.budget?.[year] ?? null;

  return {
    budget,
    loading,
    error,
  };
};

// -----------------------------------------------------------------------------
// Export all hooks together (kept for backward compatibility)
// -----------------------------------------------------------------------------
export default {
  useComprehensiveData,
  useDocumentAnalysis,
  useFinancialOverview,
  useBudgetAnalysis,
};