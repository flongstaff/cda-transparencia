/**
 * Enhanced Year Data Hook
 *
 * Provides optimized year-specific data loading with caching,
 * preloading, and comprehensive statistics
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import YearDataService, { YearData, YearDataSummary } from '../services/yearDataService';

export interface UseYearDataOptions {
  preloadAdjacentYears?: boolean;
  cacheTimeout?: number;
  onYearChange?: (year: number, data: YearData) => void;
  onError?: (error: Error) => void;
}

export interface UseYearDataReturn {
  // Core data
  yearData: YearData | null;
  summary: YearDataSummary | null;

  // State management
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];

  // Loading states
  isLoading: boolean;
  isPreloading: boolean;
  error: string | null;

  // Data access helpers
  getFinancialData: () => any[];
  getChartData: () => any[];
  getAuditData: () => any[];
  getContractData: () => any[];
  getBudgetData: () => any[];
  getExpenseData: () => any[];
  getRevenueData: () => any[];

  // Utility functions
  refreshData: () => Promise<void>;
  preloadYear: (year: number) => Promise<void>;
  clearCache: () => void;
  getCacheStatus: () => any[];
}

export function useYearData(
  initialYear?: number,
  options: UseYearDataOptions = {}
): UseYearDataReturn {
  const {
    preloadAdjacentYears = true,
    cacheTimeout = 60 * 60 * 1000, // 1 hour
    onYearChange,
    onError
  } = options;

  const [selectedYear, setSelectedYearState] = useState<number>(
    initialYear || new Date().getFullYear()
  );
  const [yearData, setYearData] = useState<YearData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate summary statistics
  const summary = useMemo<YearDataSummary | null>(() => {
    if (!yearData) return null;
    return YearDataService.getYearSummary(yearData);
  }, [yearData]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = YearDataService.getAvailableYears();
    const currentYear = new Date().getFullYear();

    // Ensure we have at least the current year and previous 3 years
    const defaultYears = [
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3
    ];

    return Array.from(new Set([...years, ...defaultYears])).sort((a, b) => b - a);
  }, [yearData]); // Recalculate when data changes

  // Load data for a specific year
  const loadYearData = useCallback(async (year: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await YearDataService.getYearData(year);
      setYearData(data);

      if (onYearChange) {
        onYearChange(year, data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading year data';
      setError(errorMessage);

      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [onYearChange, onError]);

  // Preload adjacent years for better UX
  const preloadAdjacentData = useCallback(async (currentYear: number) => {
    if (!preloadAdjacentYears) return;

    setIsPreloading(true);
    try {
      const yearsToPreload = [currentYear - 1, currentYear + 1].filter(year =>
        year >= 2019 && year <= new Date().getFullYear() + 1
      );

      await YearDataService.preloadYears(yearsToPreload);
    } catch (err) {
      // Preloading errors are non-critical
      console.warn('Failed to preload adjacent years:', err);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadAdjacentYears]);

  // Set selected year with data loading
  const setSelectedYear = useCallback(async (year: number) => {
    if (year === selectedYear) return;

    setSelectedYearState(year);
    await loadYearData(year);

    // Preload adjacent years in background
    preloadAdjacentData(year);
  }, [selectedYear, loadYearData, preloadAdjacentData]);

  // Refresh current year data
  const refreshData = useCallback(async () => {
    YearDataService.clearYearCache(selectedYear);
    await loadYearData(selectedYear);
  }, [selectedYear, loadYearData]);

  // Preload specific year
  const preloadYear = useCallback(async (year: number) => {
    try {
      await YearDataService.getYearData(year);
    } catch (err) {
      console.warn(`Failed to preload year ${year}:`, err);
    }
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    YearDataService.clearAllCache();
    setYearData(null);
  }, []);

  // Get cache status
  const getCacheStatus = useCallback(() => {
    return YearDataService.getCacheStatus();
  }, []);

  // Data access helpers
  const getFinancialData = useCallback(() => yearData?.financial || [], [yearData]);
  const getChartData = useCallback(() => yearData?.charts || [], [yearData]);
  const getAuditData = useCallback(() => yearData?.audits || [], [yearData]);
  const getContractData = useCallback(() => yearData?.contracts || [], [yearData]);
  const getBudgetData = useCallback(() => yearData?.budget || [], [yearData]);
  const getExpenseData = useCallback(() => yearData?.expenses || [], [yearData]);
  const getRevenueData = useCallback(() => yearData?.revenue || [], [yearData]);

  // Load initial data
  useEffect(() => {
    loadYearData(selectedYear);
  }, []); // Only run on mount

  // Preload adjacent years when year changes
  useEffect(() => {
    if (yearData) {
      preloadAdjacentData(selectedYear);
    }
  }, [selectedYear, yearData, preloadAdjacentData]);

  return {
    // Core data
    yearData,
    summary,

    // State management
    selectedYear,
    setSelectedYear,
    availableYears,

    // Loading states
    isLoading,
    isPreloading,
    error,

    // Data access helpers
    getFinancialData,
    getChartData,
    getAuditData,
    getContractData,
    getBudgetData,
    getExpenseData,
    getRevenueData,

    // Utility functions
    refreshData,
    preloadYear,
    clearCache,
    getCacheStatus
  };
}