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
  enableLiveData?: boolean;
  includeExternal?: boolean;  // Whether to include external data sources
}

interface UseUnifiedDataReturn {
  data: any;
  sources: any[];
  externalData: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  availableYears: number[];
  dataInventory: DataInventory | null;
  liveDataEnabled: boolean;
  activeSources: string[];
  visualizationReady: boolean;
}

interface UseUnifiedDataOptions {
  page: string;
  year?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableLiveData?: boolean;
  includeExternal?: boolean;  // Whether to include external data sources
}

interface UseUnifiedDataReturn {
  data: any;
  sources: any[];
  externalData: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  availableYears: number[];
  dataInventory: DataInventory | null;
  liveDataEnabled: boolean;
  activeSources: string[];
  visualizationReady: boolean;
}

export const useUnifiedData = (options: UseUnifiedDataOptions): UseUnifiedDataReturn => {
  const { page, year, autoRefresh = false, refreshInterval = 300000, enableLiveData = true, includeExternal = true } = options;

  const [data, setData] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [externalData, setExternalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [dataInventory, setDataInventory] = useState<DataInventory | null>(null);
  const [liveDataEnabled, setLiveDataEnabled] = useState<boolean>(false);
  const [activeSources, setActiveSources] = useState<string[]>(['local']);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch standardized data with visualization formatting
      const pageData: PageData = await unifiedDataService.getPageData(page, year || new Date().getFullYear(), includeExternal);
      setData(pageData.data);
      setSources(pageData.sources);
      setExternalData(pageData.externalData || null);
      setLiveDataEnabled(pageData.liveDataEnabled);

      // Count active sources
      const activeSourcesList = ['local'];
      if (pageData.externalData) {
        Object.keys(pageData.externalData).forEach(key => {
          if (pageData.externalData[key]) {
            activeSourcesList.push(key);
          }
        });
      }
      setActiveSources(activeSourcesList);

      // Fetch available years
      const years = await unifiedDataService.getAvailableYears();
      setAvailableYears(years);

      // Fetch data inventory
      const inventory = await unifiedDataService.getDataInventory();
      setDataInventory(inventory);

      console.log(`[USE UNIFIED DATA] ${page} loaded with ${activeSourcesList.length} active sources:`, activeSourcesList);

    } catch (err) {
      console.error(`[USE UNIFIED DATA] Error fetching data for ${page}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, year, enableLiveData, includeExternal]);

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
    externalData,
    loading,
    error,
    refetch,
    availableYears,
    dataInventory,
    liveDataEnabled,
    activeSources,
    visualizationReady: true
  };
};

// Specialized hooks for specific data types
export const useBudgetData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'budget', year, includeExternal });
};

export const useTreasuryData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'treasury', year, includeExternal });
};

export const useDebtData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'debt', year, includeExternal });
};

export const useExpensesData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'expenses', year, includeExternal });
};

export const useInvestmentsData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'investments', year, includeExternal });
};

export const useSalariesData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'salaries', year, includeExternal });
};

export const useContractsData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'contracts', year, includeExternal });
};

export const useDocumentsData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'documents', year, includeExternal });
};

export const useReportsData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'reports', year, includeExternal });
};

export const useDatabaseData = (includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'database', includeExternal });
};

export const useDashboardData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'dashboard', year, includeExternal, autoRefresh: true });
};

export const useAuditsData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'audits', year, includeExternal });
};

export const useSearchData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'search', year, includeExternal });
};

export const useOpenDataData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'opendata', year, includeExternal });
};

export const useMonitoringData = (year?: number, includeExternal: boolean = true) => {
  return useUnifiedData({ page: 'monitoring', year, includeExternal });
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
