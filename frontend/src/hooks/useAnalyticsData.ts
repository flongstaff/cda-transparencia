/***
 * Analytics Service
 * Provides data access for the analytics dashboard with integration to external data sources
 * Implements comprehensive data analysis capabilities for financial, operational, and compliance data
 */

import { useState, useEffect, useCallback } from 'react';
import unifiedDataService from './UnifiedDataService';
import type { PageData, DataInventory } from './UnifiedDataService';

interface AnalyticsData {
  budget: any;
  debt: any;
  treasury: any;
  contracts: any;
  salaries: any;
  documents: any;
  summary: {
    total_analyses: number;
    successful_analyses: number;
    failed_analyses: number;
    last_updated: string;
    data_sources: string[];
  };
  metrics: any[];
  trends: any[];
  correlations: any[];
  anomalies: any[];
  forecasts: any[];
}

interface UseAnalyticsDataOptions {
  year?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableLiveData?: boolean;
  includeExternal?: boolean;
}

interface UseAnalyticsDataReturn {
  data: AnalyticsData | null;
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

export const useAnalyticsData = (options: UseAnalyticsDataOptions = {}): UseAnalyticsDataReturn => {
  const { 
    year, 
    autoRefresh = false, 
    refreshInterval = 300000, 
    enableLiveData = true, 
    includeExternal = true 
  } = options;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [externalData, setExternalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [dataInventory, setDataInventory] = useState<DataInventory | null>(null);
  const [liveDataEnabled, setLiveDataEnabled] = useState<boolean>(false);
  const [activeSources, setActiveSources] = useState<string[]>(['local']);
  const [visualizationReady, setVisualizationReady] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data with visualization formatting
      const analyticsData = await unifiedDataService.getAnalyticsData(year || new Date().getFullYear(), includeExternal);
      
      // Set the main data
      setData(analyticsData.data);
      setSources(analyticsData.sources);
      setExternalData(analyticsData.externalData || null);
      setLiveDataEnabled(analyticsData.liveDataEnabled);
      
      // Count active sources
      const activeSourcesList = ['local'];
      if (analyticsData.externalData) {
        Object.keys(analyticsData.externalData).forEach(key => {
          if (analyticsData.externalData[key]) {
            activeSourcesList.push(key);
          }
        });
      }
      setActiveSources(activeSourcesList);
      
      // Set visualization ready state
      setVisualizationReady(true);
      
      // Fetch available years
      const years = await unifiedDataService.getAvailableYears();
      setAvailableYears(years);
      
      // Fetch data inventory
      const inventory = await unifiedDataService.getDataInventory();
      setDataInventory(inventory);
      
      console.log(`[USE ANALYTICS DATA] Analytics data loaded with ${activeSourcesList.length} active sources:`, activeSourcesList);
      
    } catch (err) {
      console.error('[USE ANALYTICS DATA] Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [year, includeExternal]);

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
    visualizationReady
  };
};

// Specialized hooks for specific analytics types
export const useBudgetAnalytics = (year?: number) => {
  return useAnalyticsData({ year, includeExternal: true });
};

export const useDebtAnalytics = (year?: number) => {
  return useAnalyticsData({ year, includeExternal: true });
};

export const useTreasuryAnalytics = (year?: number) => {
  return useAnalyticsData({ year, includeExternal: true });
};

export const useContractsAnalytics = (year?: number) => {
  return useAnalyticsData({ year, includeExternal: true });
};

export const useSalariesAnalytics = (year?: number) => {
  return useAnalyticsData({ year, includeExternal: true });
};

export const useDocumentsAnalytics = (year?: number) => {
  return useAnalyticsData({ year, includeExternal: true });
};

// Chart data hook for analytics
export const useAnalyticsChartData = (chartType: string, year?: number) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unifiedDataService.getAnalyticsChartData(chartType, year);
      setChartData(data);
    } catch (err) {
      console.error(`[USE ANALYTICS CHART DATA] Error fetching chart data for ${chartType}:`, err);
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

export default useAnalyticsData;