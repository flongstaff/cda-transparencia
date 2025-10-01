/**
 * Multi-Year Data Hook
 *
 * Custom hook to access multi-year data trends, comparisons, and analysis
 * Integrates with MultiYearDataService to provide React components with
 * comprehensive multi-year financial and administrative data
 */

import { useState, useEffect, useCallback } from 'react';
import MultiYearDataService, {
  MultiYearTrend,
  YearComparison,
  DataAvailability,
  YearlyDataPoint
} from '../services/MultiYearDataService';

interface UseMultiYearDataOptions {
  indicators?: string[];
  categories?: string[];
  autoLoad?: boolean;
  refreshInterval?: number;
}

interface MultiYearDataState {
  trends: MultiYearTrend[];
  yearlyData: Map<number, YearlyDataPoint[]>;
  dataAvailability: DataAvailability[];
  summary: {
    totalDataPoints: number;
    yearsWithData: number[];
    categoriesWithData: string[];
    dataQualityByYear: Record<number, number>;
    trendsCount: {
      increasing: number;
      decreasing: number;
      stable: number;
      volatile: number;
    };
  } | null;
  loading: boolean;
  error: string | null;
}

export const useMultiYearData = (options: UseMultiYearDataOptions = {}) => {
  const {
    indicators,
    categories,
    autoLoad = true,
    refreshInterval
  } = options;

  const [state, setState] = useState<MultiYearDataState>({
    trends: [],
    yearlyData: new Map(),
    dataAvailability: [],
    summary: null,
    loading: false,
    error: null
  });

  const multiYearService = MultiYearDataService.getInstance();

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔄 Loading multi-year data...');

      // Load all data in parallel
      const [
        yearlyData,
        trends,
        dataAvailability,
        summary
      ] = await Promise.all([
        multiYearService.loadAllYearsData(),
        multiYearService.getMultiYearTrends(indicators, categories),
        multiYearService.getDataAvailability(),
        multiYearService.getYearsSummary()
      ]);

      setState({
        trends,
        yearlyData,
        dataAvailability,
        summary,
        loading: false,
        error: null
      });

      console.log(`✅ Loaded multi-year data: ${trends.length} trends, ${yearlyData.size} years`);
    } catch (error) {
      console.error('❌ Error loading multi-year data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [indicators, categories, multiYearService]);

  const refreshData = useCallback(() => {
    multiYearService.clearCache();
    return loadData();
  }, [loadData, multiYearService]);

  const compareYears = useCallback(async (
    baseYear: number,
    comparisonYear: number,
    category?: string
  ): Promise<YearComparison[]> => {
    try {
      return await multiYearService.compareYears(baseYear, comparisonYear, category);
    } catch (error) {
      console.error('Error comparing years:', error);
      return [];
    }
  }, [multiYearService]);

  const getKPITrends = useCallback(async (): Promise<MultiYearTrend[]> => {
    try {
      return await multiYearService.getKPITrends();
    } catch (error) {
      console.error('Error loading KPI trends:', error);
      return [];
    }
  }, [multiYearService]);

  const getDataForYear = useCallback((year: number): YearlyDataPoint[] => {
    return state.yearlyData.get(year) || [];
  }, [state.yearlyData]);

  const getDataForCategory = useCallback((category: string): YearlyDataPoint[] => {
    const allData: YearlyDataPoint[] = [];
    state.yearlyData.forEach(yearData => {
      const categoryData = yearData.filter(point => point.category === category);
      allData.push(...categoryData);
    });
    return allData;
  }, [state.yearlyData]);

  const getDataForIndicator = useCallback((indicator: string): YearlyDataPoint[] => {
    const allData: YearlyDataPoint[] = [];
    state.yearlyData.forEach(yearData => {
      const indicatorData = yearData.filter(point => point.indicator === indicator);
      allData.push(...indicatorData);
    });
    return allData.sort((a, b) => a.year - b.year);
  }, [state.yearlyData]);

  const getTrendForIndicator = useCallback((
    indicator: string,
    category?: string
  ): MultiYearTrend | null => {
    return state.trends.find(trend =>
      trend.indicator === indicator &&
      (!category || trend.category === category)
    ) || null;
  }, [state.trends]);

  const getAvailableYears = useCallback((): number[] => {
    return multiYearService.getAvailableYears();
  }, [multiYearService]);

  const getAvailableCategories = useCallback((): string[] => {
    return state.summary?.categoriesWithData || [];
  }, [state.summary]);

  const getAvailableIndicators = useCallback((category?: string): string[] => {
    const indicators = new Set<string>();

    state.yearlyData.forEach(yearData => {
      yearData.forEach(point => {
        if (!category || point.category === category) {
          indicators.add(point.indicator);
        }
      });
    });

    return Array.from(indicators).sort();
  }, [state.yearlyData]);

  // Data quality and statistics
  const getDataQualityStats = useCallback(() => {
    if (!state.summary) return null;

    const avgQuality = Object.values(state.summary.dataQualityByYear)
      .reduce((sum, quality) => sum + quality, 0) / Object.keys(state.summary.dataQualityByYear).length;

    return {
      averageQuality: avgQuality,
      qualityByYear: state.summary.dataQualityByYear,
      dataCompleteness: state.dataAvailability.reduce(
        (sum, item) => sum + item.dataCompleteness, 0
      ) / state.dataAvailability.length
    };
  }, [state.summary, state.dataAvailability]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refreshData]);

  return {
    // Data
    trends: state.trends,
    yearlyData: state.yearlyData,
    dataAvailability: state.dataAvailability,
    summary: state.summary,

    // State
    loading: state.loading,
    error: state.error,

    // Actions
    loadData,
    refreshData,
    compareYears,
    getKPITrends,

    // Data access helpers
    getDataForYear,
    getDataForCategory,
    getDataForIndicator,
    getTrendForIndicator,

    // Metadata helpers
    getAvailableYears,
    getAvailableCategories,
    getAvailableIndicators,
    getDataQualityStats,

    // Utilities
    clearCache: multiYearService.clearCache.bind(multiYearService),
    hasData: state.yearlyData.size > 0
  };
};

export default useMultiYearData;