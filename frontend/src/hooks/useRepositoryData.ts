/**
 * Repository Data Hook - Complete transparency data from GitHub repository
 * Provides access to ALL processed files: PDFs->JSONs, markdowns, CSVs, Excel
 * Tracks money flow from budget to contracts to execution
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { repositoryDataService, CompleteRepositoryData, ContractTender, BudgetExecution } from '../services/RepositoryDataService';

interface UseRepositoryDataOptions {
  year?: number;
  category?: string;
  autoLoad?: boolean;
}

interface UseRepositoryDataReturn {
  // Complete data structure
  data: CompleteRepositoryData | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Filtered/processed data
  documents: {
    all: any[];
    byYear: any[];
    byCategory: any[];
  };

  // Financial data
  budget: {
    summary: any;
    execution: BudgetExecution[];
    categories: string[];
  };

  // Contract/tender data
  contracts: {
    tenders: ContractTender[];
    summary: any;
    byStatus: Record<string, ContractTender[]>;
  };

  // Money flow tracking
  moneyFlow: {
    budgetToContracts: any[];
    executionTracking: any[];
    discrepancies: any[];
    completionRates: any[];
  };

  // Metadata
  metadata: {
    availableYears: number[];
    categories: string[];
    totalDocuments: number;
    lastUpdated: string;
  };

  // Actions
  refetch: () => Promise<void>;
  selectYear: (year: number) => void;
  selectCategory: (category: string) => void;
}

export const useRepositoryData = (options: UseRepositoryDataOptions = {}): UseRepositoryDataReturn => {
  const { year = new Date().getFullYear(), category, autoLoad = true } = options;

  // State
  const [data, setData] = useState<CompleteRepositoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedCategory, setSelectedCategory] = useState(category);

  // Load complete repository data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const repositoryData = await repositoryDataService.loadCompleteRepository();
      setData(repositoryData);

      console.log('Repository data loaded:', repositoryData);
    } catch (err: any) {
      console.error('Error loading repository data:', err);
      setError(err.message || 'Failed to load repository data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  // Filtered documents based on year and category
  const documents = useMemo(() => {
    if (!data) return { all: [], byYear: [], byCategory: [] };

    return {
      all: data.documents.all,
      byYear: data.documents.byYear[selectedYear] || [],
      byCategory: selectedCategory ? (data.documents.byCategory[selectedCategory] || []) : []
    };
  }, [data, selectedYear, selectedCategory]);

  // Budget data for selected year
  const budget = useMemo(() => {
    if (!data) return { summary: null, execution: [], categories: [] };

    const yearBudget = data.budget.summary[selectedYear];
    const yearExecution = data.budget.byYear[selectedYear] || [];

    return {
      summary: yearBudget,
      execution: yearExecution,
      categories: yearExecution.map(item => item.category)
    };
  }, [data, selectedYear]);

  // Contract data for selected year
  const contracts = useMemo(() => {
    if (!data) return { tenders: [], summary: null, byStatus: {} };

    const yearContracts = data.contracts.byYear[selectedYear] || [];
    const byStatus = yearContracts.reduce((acc, contract) => {
      if (!acc[contract.status]) acc[contract.status] = [];
      acc[contract.status].push(contract);
      return acc;
    }, {} as Record<string, ContractTender[]>);

    return {
      tenders: yearContracts,
      summary: data.contracts.summary[selectedYear],
      byStatus
    };
  }, [data, selectedYear]);

  // Money flow analysis
  const moneyFlow = useMemo(() => {
    if (!data) return { budgetToContracts: [], executionTracking: [], discrepancies: [], completionRates: [] };

    const yearFlow = data.money_flow.byYear[selectedYear];
    const budgetToContracts = data.money_flow.budget_to_contracts[selectedYear] || [];
    const executionTracking = data.money_flow.execution_tracking[selectedYear] || [];

    // Calculate discrepancies between budget and actual spending
    const discrepancies = budgetToContracts.map(item => ({
      category: item.budget_category,
      budgeted: item.allocated,
      executed: item.executed,
      contracts_value: item.related_tenders.reduce((sum: number, tender: any) => sum + (tender.amount || 0), 0),
      discrepancy: Math.abs(item.allocated - item.executed),
      discrepancy_percentage: item.allocated > 0 ? ((item.executed - item.allocated) / item.allocated) * 100 : 0,
      status: Math.abs(item.executed - item.allocated) / item.allocated > 0.1 ? 'significant' : 'normal'
    }));

    // Calculate completion rates
    const completionRates = yearFlow?.categories?.map((cat: any) => ({
      category: cat.name,
      completion_rate: cat.completion_rate,
      budget: cat.budget,
      executed: cat.executed,
      contracts_count: cat.contracts.length,
      status: cat.completion_rate > 90 ? 'completed' : (cat.completion_rate > 50 ? 'in_progress' : 'delayed')
    })) || [];

    return {
      budgetToContracts,
      executionTracking,
      discrepancies,
      completionRates
    };
  }, [data, selectedYear]);

  // Metadata
  const metadata = useMemo(() => {
    if (!data) return { availableYears: [], categories: [], totalDocuments: 0, lastUpdated: '' };

    return {
      availableYears: data.metadata.available_years,
      categories: data.metadata.categories,
      totalDocuments: data.metadata.total_documents,
      lastUpdated: data.metadata.last_updated
    };
  }, [data]);

  // Actions
  const refetch = useCallback(() => loadData(), [loadData]);
  const selectYear = useCallback((newYear: number) => setSelectedYear(newYear), []);
  const selectCategory = useCallback((newCategory: string) => setSelectedCategory(newCategory), []);

  return {
    data,
    loading,
    error,
    documents,
    budget,
    contracts,
    moneyFlow,
    metadata,
    refetch,
    selectYear,
    selectCategory
  };
};

// Export convenience hooks for specific data types
export const useBudgetTracking = (year: number) => {
  const { budget, moneyFlow, loading, error } = useRepositoryData({ year });

  return {
    budget: budget.summary,
    execution: budget.execution,
    discrepancies: moneyFlow.discrepancies,
    completionRates: moneyFlow.completionRates,
    loading,
    error
  };
};

export const useContractTracking = (year: number) => {
  const { contracts, moneyFlow, loading, error } = useRepositoryData({ year });

  return {
    tenders: contracts.tenders,
    byStatus: contracts.byStatus,
    budgetLinks: moneyFlow.budgetToContracts,
    loading,
    error
  };
};

export const useMoneyFlowAnalysis = (year: number) => {
  const { moneyFlow, budget, contracts, loading, error } = useRepositoryData({ year });

  return {
    budgetToContracts: moneyFlow.budgetToContracts,
    executionTracking: moneyFlow.executionTracking,
    discrepancies: moneyFlow.discrepancies,
    totalBudget: budget.execution.reduce((sum, item) => sum + item.budgeted, 0),
    totalExecuted: budget.execution.reduce((sum, item) => sum + item.executed, 0),
    totalContracts: contracts.tenders.length,
    loading,
    error
  };
};