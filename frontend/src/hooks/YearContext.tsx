import { createContext, useState, useEffect, useCallback } from 'react';
import DataService, { YearlyData, DataSource } from '../services/DataService';

export interface YearContextProps {
  currentYear: string;
  availableYears: string[];
  yearlyData: YearlyData | null;
  isLoading: boolean;
  error: string | null;
  dataSources: DataSource[];
  setCurrentYear: (year: string) => void;
  refreshData: () => Promise<void>;
  syncWithLiveData: (sourceId?: string) => Promise<boolean>;
  validateCurrentData: () => Promise<{ isValid: boolean; issues: string[] }>;
}

export const YearContext = createContext<YearContextProps | undefined>(undefined);

export const YearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentYear, setCurrentYear] = useState<string>(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);

  // Load available years and data sources on mount
  useEffect(() => {
    const years = DataService.getAvailableYears();
    setAvailableYears(years);
    setDataSources(DataService.getDataSources());
    if (years.length > 0) setCurrentYear(years[0]);
  }, []);

  const loadDataForYear = useCallback(async (year: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DataService.getDataForYear(year);
      setYearlyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentYear) loadDataForYear(currentYear);
  }, [currentYear, loadDataForYear]);

  const handleSetCurrentYear = useCallback((year: string) => {
    if (availableYears.includes(year)) setCurrentYear(year);
    else setError(`Year ${year} is not available`);
  }, [availableYears]);

  const refreshData = useCallback(async () => {
    await loadDataForYear(currentYear);
  }, [currentYear, loadDataForYear]);

  const syncWithLiveData = useCallback(async (sourceId?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const targetSource = sourceId || dataSources.find(s => s.type === 'live')?.id;
      if (!targetSource) throw new Error('No live data source available');
      const success = await DataService.syncWithLiveSource(targetSource);
      if (success) {
        await loadDataForYear(currentYear);
        setDataSources(DataService.getDataSources());
      } else throw new Error('Failed to sync with live data source');
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync with live data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dataSources, currentYear, loadDataForYear]);

  const validateCurrentData = useCallback(async () => {
    if (!yearlyData) return { isValid: false, issues: ['No data loaded'] };
    return await DataService.validateDataIntegrity(currentYear);
  }, [yearlyData, currentYear]);

  return (
    <YearContext.Provider
      value={{
        currentYear,
        availableYears,
        yearlyData,
        isLoading,
        error,
        dataSources,
        setCurrentYear: handleSetCurrentYear,
        refreshData,
        syncWithLiveData,
        validateCurrentData,
      }}
    >
      {children}
    </YearContext.Provider>
  );
};
