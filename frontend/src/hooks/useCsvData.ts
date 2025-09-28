/**
 * Custom Hook for Loading and Parsing CSV Data
 * Uses PapaParse to convert CSV files to JSON format
 * Handles loading states, error handling, and caching
 */

import { useState, useEffect } from "react";
import Papa from "papaparse";

// Define types for the hook
interface CsvDataState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

interface PapaParseOptions {
  header?: boolean;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
  download?: boolean;
}

/**
 * Custom hook to load and parse CSV data
 * @param csvUrl - URL to the CSV file
 * @param options - PapaParse options
 * @returns Object with data, loading, and error states
 */
export default function useCsvData<T>(
  csvUrl: string | null, 
  options: PapaParseOptions = {}
): CsvDataState<T> {
  const [state, setState] = useState<CsvDataState<T>>({
    data: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    // Reset state when URL changes
    if (!csvUrl) {
      setState({ data: null, loading: false, error: null });
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
        setState({
          data: results.data as T[],
          loading: false,
          error: null
        });
      },
      error: (err) => {
        setState({
          data: null,
          loading: false,
          error: err
        });
      }
    });

    // Cleanup function
    return () => {
      setState({ data: null, loading: false, error: null });
    };
  }, [csvUrl, JSON.stringify(options)]);

  return state;
}

// Export additional utility functions
export { Papa };