/**
 * Enhanced CSV Data Hook
 * Works with existing data structure to provide better CSV data integration
 */

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface CsvDataState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  rowCount: number;
}

interface PapaParseOptions {
  header?: boolean;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
}

// Simple cache for CSV data
const csvCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Enhanced hook to load and parse CSV data with better error handling
 * @param csvUrl - URL to the CSV file (can be relative or absolute)
 * @param options - PapaParse options
 * @returns Object with data, loading, error states and refetch function
 */
export default function useEnhancedCsvData<T>(
  csvUrl: string | null,
  options: PapaParseOptions = {}
): CsvDataState<T> {
  const [state, setState] = useState<CsvDataState<T>>({
    data: null,
    loading: false,
    error: null,
    refetch: () => {},
    rowCount: 0
  });

  const loadData = useCallback(async () => {
    if (!csvUrl) {
      setState(prev => ({ ...prev, data: null, loading: false, error: null, rowCount: 0 }));
      return;
    }

    // Check cache first
    const cached = csvCache.get(csvUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setState(prev => ({
        ...prev,
        data: cached.data as T[],
        loading: false,
        error: null,
        rowCount: cached.data.length
      }));
      return;
    }

    // Set loading state
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Parse CSV data
      const result = await new Promise<{ data: T[]; errors: any[] }>((resolve, reject) => {
        Papa.parse(csvUrl, {
          download: true,
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          ...options,
          complete: (results) => {
            resolve({
              data: results.data as T[],
              errors: results.errors
            });
          },
          error: (error) => {
            reject(error);
          }
        });
      });

      // Handle parsing errors
      if (result.errors.length > 0) {
        console.warn(`CSV parsing warnings for ${csvUrl}:`, result.errors);
      }

      const cleanData = result.data.filter((row: any) =>
        Object.values(row).some(value => value !== null && value !== '')
      );

      // Cache the data
      csvCache.set(csvUrl, {
        data: cleanData,
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        data: cleanData as T[],
        loading: false,
        error: null,
        rowCount: cleanData.length
      }));

    } catch (error: any) {
      console.error(`❌ Error loading CSV data from ${csvUrl}:`, error);
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: error,
        rowCount: 0
      }));
    }
  }, [csvUrl, options]);

  // Initial load and refetch
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    refetch: loadData
  };
}
