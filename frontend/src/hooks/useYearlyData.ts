import { useState, useEffect, useCallback } from 'react';
import DataService, { YearlyData, DataSource } from '../services/DataService';

export interface UseYearlyDataReturn {
  currentYear: string;
  availableYears: string[];
  yearlyData: YearlyData | null;
  isLoading: boolean;
  error: string | null;
  dataSources: DataSource[];
  setCurrentYear: (year: string) => void;
  refreshData: () => Promise<void>;
  syncWithLiveData: (sourceId?: string) => Promise<boolean>;
  validateCurrentData: () => Promise<{isValid: boolean, issues: string[]}>;
}

export const useYearlyData = (initialYear?: string): UseYearlyDataReturn => {
  const [currentYear, setCurrentYear] = useState<string>(
    initialYear || new Date().getFullYear().toString()
  );
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);

  // Load available years on mount
  useEffect(() => {
    const years = DataService.getAvailableYears();
    setAvailableYears(years);
    setDataSources(DataService.getDataSources());
    
    // Set current year to latest available if not provided
    if (!initialYear && years.length > 0) {
      setCurrentYear(years[0]);
    }
  }, [initialYear]);

  const loadDataForYear = useCallback(async (year: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await DataService.getDataForYear(year);
      setYearlyData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading yearly data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when year changes
  useEffect(() => {
    if (currentYear) {
      loadDataForYear(currentYear);
    }
  }, [currentYear, loadDataForYear]);

  const handleSetCurrentYear = useCallback((year: string) => {
    if (availableYears.includes(year)) {
      setCurrentYear(year);
    } else {
      setError(`Year ${year} is not available in the dataset`);
    }
  }, [availableYears]);

  const refreshData = useCallback(async () => {
    await loadDataForYear(currentYear);
  }, [currentYear, loadDataForYear]);

  const syncWithLiveData = useCallback(async (sourceId?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const targetSource = sourceId || dataSources.find(s => s.type === 'live')?.id;
      if (!targetSource) {
        throw new Error('No live data source available');
      }
      
      const success = await DataService.syncWithLiveSource(targetSource);
      
      if (success) {
        // Refresh data after successful sync
        await loadDataForYear(currentYear);
        // Update data sources status
        setDataSources(DataService.getDataSources());
      } else {
        throw new Error('Failed to sync with live data source');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with live data';
      setError(errorMessage);
      console.error('Error syncing with live data:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dataSources, currentYear, loadDataForYear]);

  const validateCurrentData = useCallback(async (): Promise<{isValid: boolean, issues: string[]}> => {
    if (!yearlyData) {
      return { isValid: false, issues: ['No data loaded'] };
    }
    
    return await DataService.validateDataIntegrity(currentYear);
  }, [yearlyData, currentYear]);

  return {
    currentYear,
    availableYears,
    yearlyData,
    isLoading,
    error,
    dataSources,
    setCurrentYear: handleSetCurrentYear,
    refreshData,
    syncWithLiveData,
    validateCurrentData
  };
};