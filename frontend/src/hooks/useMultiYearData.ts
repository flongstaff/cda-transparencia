/**
 * MULTI-YEAR DATA HOOK
 *
 * Preloads data for ALL available years and provides instant year switching
 * without page refresh. Uses data source priority: CSV > JSON > PDF > External
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import dataIntegrationService from '../services/DataIntegrationService';
import yearSpecificDataService from '../services/YearSpecificDataService';

export interface YearData {
  year: number;
  budget: {
    total_budget: number;
    total_executed: number;
    execution_rate: number;
    quarterly_data: any[];
  };
  contracts: any[];
  salaries: any;
  documents: any[];
  treasury: any;
  debt: any;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export interface UseMultiYearDataReturn {
  // Current year selection
  selectedYear: number;
  setSelectedYear: (year: number) => void;

  // Current year data (instant access, no loading)
  currentData: YearData | null;

  // All years data (for multi-year charts)
  allYearsData: Map<number, YearData>;

  // Available years
  availableYears: number[];

  // Loading states
  initialLoading: boolean;
  backgroundLoading: boolean;

  // Preload specific year
  preloadYear: (year: number) => Promise<void>;

  // Refresh data
  refresh: () => Promise<void>;
}

export const useMultiYearData = (defaultYear?: number): UseMultiYearDataReturn => {
  const [selectedYear, setSelectedYear] = useState<number>(
    defaultYear || new Date().getFullYear()
  );

  const [allYearsData, setAllYearsData] = useState<Map<number, YearData>>(new Map());
  const [initialLoading, setInitialLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  const availableYears = useMemo(() =>
    yearSpecificDataService.getAvailableYears(),
    []
  );

  // Load data for a specific year
  const loadYearData = useCallback(async (year: number, isBackground = false): Promise<YearData> => {
    console.log(`📅 Loading data for year ${year}${isBackground ? ' (background)' : ''}...`);

    try {
      // Check if already loaded
      const existing = allYearsData.get(year);
      if (existing?.loaded && !existing.error) {
        console.log(`✅ Year ${year} already loaded from cache`);
        return existing;
      }

      // Set loading state
      const loadingData: YearData = {
        year,
        budget: { total_budget: 0, total_executed: 0, execution_rate: 0, quarterly_data: [] },
        contracts: [],
        salaries: {},
        documents: [],
        treasury: {},
        debt: {},
        loaded: false,
        loading: true,
        error: null
      };

      setAllYearsData(prev => new Map(prev).set(year, loadingData));

      // Load integrated data (CSV + JSON + PDF + External)
      const integratedData = await dataIntegrationService.loadIntegratedData(year);

      const yearData: YearData = {
        year,
        budget: integratedData.budget,
        contracts: integratedData.contracts,
        salaries: integratedData.salaries,
        documents: integratedData.documents,
        treasury: integratedData.treasury,
        debt: integratedData.debt,
        loaded: true,
        loading: false,
        error: null
      };

      console.log(`✅ Year ${year} loaded successfully:`, {
        budget: yearData.budget.total_budget,
        contracts: yearData.contracts.length,
        sources: integratedData.metadata.sources_used
      });

      setAllYearsData(prev => new Map(prev).set(year, yearData));
      return yearData;

    } catch (error: any) {
      console.error(`❌ Failed to load year ${year}:`, error);

      const errorData: YearData = {
        year,
        budget: { total_budget: 0, total_executed: 0, execution_rate: 0, quarterly_data: [] },
        contracts: [],
        salaries: {},
        documents: [],
        treasury: {},
        debt: {},
        loaded: false,
        loading: false,
        error: error.message || 'Failed to load data'
      };

      setAllYearsData(prev => new Map(prev).set(year, errorData));
      return errorData;
    }
  }, [allYearsData]);

  // Initial load: Load current year immediately, then preload others in background
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);

      try {
        // 1. Load current year first (blocking)
        console.log(`🚀 Initial load: Loading current year ${selectedYear}...`);
        await loadYearData(selectedYear, false);

        setInitialLoading(false);

        // 2. Preload adjacent years in background (non-blocking)
        setBackgroundLoading(true);
        const adjacentYears = [
          selectedYear - 1,
          selectedYear + 1,
          selectedYear - 2,
          selectedYear + 2
        ].filter(year => availableYears.includes(year));

        console.log(`🔄 Background preload: Loading ${adjacentYears.length} adjacent years...`);

        for (const year of adjacentYears) {
          await loadYearData(year, true);
          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 3. Load remaining years
        const remainingYears = availableYears.filter(
          year => year !== selectedYear && !adjacentYears.includes(year)
        );

        console.log(`🔄 Background preload: Loading ${remainingYears.length} remaining years...`);

        for (const year of remainingYears) {
          await loadYearData(year, true);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        setBackgroundLoading(false);
        console.log(`✅ All ${availableYears.length} years preloaded successfully`);

      } catch (error) {
        console.error('❌ Initialization failed:', error);
        setInitialLoading(false);
        setBackgroundLoading(false);
      }
    };

    initializeData();
  }, []); // Only run once on mount

  // Preload specific year on demand
  const preloadYear = useCallback(async (year: number) => {
    if (!availableYears.includes(year)) {
      console.warn(`⚠️ Year ${year} not available`);
      return;
    }

    const existing = allYearsData.get(year);
    if (existing?.loaded) {
      console.log(`✅ Year ${year} already loaded`);
      return;
    }

    await loadYearData(year, true);
  }, [availableYears, allYearsData, loadYearData]);

  // Refresh all data
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    setInitialLoading(true);

    // Clear cache
    dataIntegrationService.clearCache();
    setAllYearsData(new Map());

    // Reload current year
    await loadYearData(selectedYear, false);
    setInitialLoading(false);
  }, [selectedYear, loadYearData]);

  // Get current year data
  const currentData = useMemo(() => {
    return allYearsData.get(selectedYear) || null;
  }, [allYearsData, selectedYear]);

  // Custom setter that preloads adjacent years
  const handleSetSelectedYear = useCallback((year: number) => {
    console.log(`🔀 Switching to year ${year}...`);
    setSelectedYear(year);

    // Preload adjacent years if not already loaded
    const adjacentYears = [year - 1, year + 1].filter(y =>
      availableYears.includes(y) && !allYearsData.get(y)?.loaded
    );

    adjacentYears.forEach(y => preloadYear(y));
  }, [availableYears, allYearsData, preloadYear]);

  return {
    selectedYear,
    setSelectedYear: handleSetSelectedYear,
    currentData,
    allYearsData,
    availableYears,
    initialLoading,
    backgroundLoading,
    preloadYear,
    refresh
  };
};

export default useMultiYearData;
