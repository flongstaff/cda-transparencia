/**
 * Unified Data Hook
 * Provides data access for all pages using the UnifiedDataService
 */

import { useState, useEffect, useCallback } from 'react';
import unifiedDataService from '../services/UnifiedDataService';
import type { PageData, DataInventory } from '../services/UnifiedDataService';

interface UseUnifiedDataOptions {
  page: string;
  year?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseUnifiedDataReturn {
  data: any;
  sources: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  availableYears: number[];
  dataInventory: DataInventory | null;
}

export const useUnifiedData = (options: UseUnifiedDataOptions): UseUnifiedDataReturn => {
  const { page, year, autoRefresh = false, refreshInterval = 300000 } = options;
  
  const [data, setData] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [dataInventory, setDataInventory] = useState<DataInventory | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch page data
      const pageData: PageData = await unifiedDataService.getPageData(page, year);
      setData(pageData.data);
      setSources(pageData.sources);

      // Fetch available years
      const years = await unifiedDataService.getAvailableYears();
      setAvailableYears(years);

      // Fetch data inventory
      const inventory = await unifiedDataService.getDataInventory();
      setDataInventory(inventory);

    } catch (err) {
      console.error(`[USE UNIFIED DATA] Error fetching data for ${page}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, year]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    sources,
    loading,
    error,
    refetch,
    availableYears,
    dataInventory
  };
};

// Specialized hooks for specific data types
export const useBudgetData = (year?: number) => {
  return useUnifiedData({ page: 'budget', year });
};

export const useTreasuryData = (year?: number) => {
  return useUnifiedData({ page: 'treasury', year });
};

export const useDebtData = (year?: number) => {
  return useUnifiedData({ page: 'debt', year });
};

export const useExpensesData = (year?: number) => {
  return useUnifiedData({ page: 'expenses', year });
};

export const useInvestmentsData = (year?: number) => {
  return useUnifiedData({ page: 'investments', year });
};

export const useSalariesData = (year?: number) => {
  return useUnifiedData({ page: 'salaries', year });
};

export const useContractsData = (year?: number) => {
  return useUnifiedData({ page: 'contracts', year });
};

export const useDocumentsData = (year?: number) => {
  return useUnifiedData({ page: 'documents', year });
};

export const useReportsData = (year?: number) => {
  return useUnifiedData({ page: 'reports', year });
};

export const useDatabaseData = () => {
  return useUnifiedData({ page: 'database' });
};

export const useDashboardData = (year?: number) => {
  return useUnifiedData({ page: 'dashboard', year, autoRefresh: true });
};

// Chart data hook
export const useChartData = (chartType: string, year?: number) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unifiedDataService.getChartData(chartType, year);
      setChartData(data);
    } catch (err) {
      console.error(`[USE CHART DATA] Error fetching chart data for ${chartType}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [chartType, year]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    data: chartData,
    loading,
    error,
    refetch: fetchChartData
  };
};

export default useUnifiedData;
