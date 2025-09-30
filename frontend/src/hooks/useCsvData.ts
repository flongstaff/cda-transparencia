/**
 * Enhanced CSV Data Hook with Caching and Year Filtering
 * Uses PapaParse to convert CSV files to JSON format
 * Handles loading states, error handling, caching, and multi-year data
 */

import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";

// Define types for the hook
interface CsvDataState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface PapaParseOptions {
  header?: boolean;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
  download?: boolean;
}

// Cache for CSV data to avoid repeated requests
export const csvCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Enhanced hook to load and parse CSV data with caching and year filtering
 * @param csvUrl - URL to the CSV file
 * @param options - PapaParse options
 * @param selectedYear - Optional year filter
 * @returns Object with data, loading, error states and refetch function
 */
export default function useCsvData<T>(
  csvUrl: string | null,
  options: PapaParseOptions = {},
  selectedYear?: number
): CsvDataState<T> {
  const [state, setState] = useState<CsvDataState<T>>({
    data: null,
    loading: false,
    error: null,
    refetch: () => {}
  });

  const loadData = useCallback(async () => {
    if (!csvUrl) {
      setState(prev => ({ ...prev, data: null, loading: false, error: null }));
      return;
    }

    // Check cache first
    const cached = csvCache.get(csvUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      let filteredData = cached.data;

      // Apply year filter if specified
      if (selectedYear && filteredData.length > 0) {
        filteredData = cached.data.filter((row: any) => {
          // Try multiple year field variations
          const year = row.year || row.Year || row.YEAR || row.año || row.Año;
          return !year || parseInt(year) === selectedYear;
        });
      }

      setState(prev => ({
        ...prev,
        data: filteredData as T[],
        loading: false,
        error: null
      }));
      return;
    }

    // Set loading state
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Parse CSV data
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      ...options,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`CSV parsing warnings for ${csvUrl}:`, results.errors);
        }

        const cleanData = results.data.filter((row: any) =>
          Object.values(row).some(value => value !== null && value !== '')
        );

        // Cache the data
        csvCache.set(csvUrl, {
          data: cleanData,
          timestamp: Date.now()
        });

        let filteredData = cleanData;

        // Apply year filter if specified
        if (selectedYear && filteredData.length > 0) {
          filteredData = cleanData.filter((row: any) => {
            // Try multiple year field variations
            const year = row.year || row.Year || row.YEAR || row.año || row.Año;
            return !year || parseInt(year) === selectedYear;
          });
        }

        setState(prev => ({
          ...prev,
          data: filteredData as T[],
          loading: false,
          error: null
        }));
      },
      error: (err) => {
        setState(prev => ({
          ...prev,
          data: null,
          loading: false,
          error: err
        }));
      }
    });
  }, [csvUrl, JSON.stringify(options), selectedYear]);

  const refetch = useCallback(() => {
    // Clear cache for this URL and reload
    if (csvUrl) {
      csvCache.delete(csvUrl);
    }
    loadData();
  }, [csvUrl, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update the refetch function in state
  useEffect(() => {
    setState(prev => ({ ...prev, refetch }));
  }, [refetch]);

  return state;
}

// Export additional utility functions
export { Papa };