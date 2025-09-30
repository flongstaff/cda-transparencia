/**
 * JSON Data Hook - Optimized for JSON resources
 * No page reloads, efficient caching, multi-year filtering
 */

import { useState, useEffect, useCallback } from 'react';

interface JsonDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// JSON cache
const jsonCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export default function useJsonData<T>(
  jsonUrl: string | null,
  selectedYear?: number,
  searchQuery?: string
): JsonDataState<T> {
  const [state, setState] = useState<JsonDataState<T>>({
    data: null,
    loading: false,
    error: null,
    refetch: () => {}
  });

  const loadData = useCallback(async () => {
    if (!jsonUrl) {
      setState(prev => ({ ...prev, data: null, loading: false, error: null }));
      return;
    }

    // Check cache first
    const cached = jsonCache.get(jsonUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      let filteredData = cached.data;

      // Apply year filter if specified
      if (selectedYear && filteredData) {
        if (Array.isArray(filteredData)) {
          filteredData = filteredData.filter((item: any) => {
            const year = item.year || item.Year || item.YEAR || item.año || item.Año;
            return !year || parseInt(year) === selectedYear;
          });
        } else if (filteredData.year && parseInt(filteredData.year) !== selectedYear) {
          filteredData = null;
        }
      }

      // Apply search filter if specified
      if (searchQuery && filteredData && Array.isArray(filteredData)) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter((item: any) =>
          Object.values(item).some(value =>
            String(value || '').toLowerCase().includes(lowerQuery)
          )
        );
      }

      setState(prev => ({
        ...prev,
        data: filteredData as T,
        loading: false,
        error: null
      }));
      return;
    }

    // Set loading state
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // Cache the data
      jsonCache.set(jsonUrl, {
        data: rawData,
        timestamp: Date.now()
      });

      let filteredData = rawData;

      // Apply year filter if specified
      if (selectedYear && filteredData) {
        if (Array.isArray(filteredData)) {
          filteredData = filteredData.filter((item: any) => {
            const year = item.year || item.Year || item.YEAR || item.año || item.Año;
            return !year || parseInt(year) === selectedYear;
          });
        } else if (filteredData.year && parseInt(filteredData.year) !== selectedYear) {
          filteredData = null;
        }
      }

      // Apply search filter if specified
      if (searchQuery && filteredData && Array.isArray(filteredData)) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter((item: any) =>
          Object.values(item).some(value =>
            String(value || '').toLowerCase().includes(lowerQuery)
          )
        );
      }

      setState(prev => ({
        ...prev,
        data: filteredData as T,
        loading: false,
        error: null
      }));

    } catch (err) {
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: err as Error
      }));
    }
  }, [jsonUrl, selectedYear, searchQuery]);

  const refetch = useCallback(() => {
    // Clear cache for this URL and reload
    if (jsonUrl) {
      jsonCache.delete(jsonUrl);
    }
    loadData();
  }, [jsonUrl, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update the refetch function in state
  useEffect(() => {
    setState(prev => ({ ...prev, refetch }));
  }, [refetch]);

  return state;
}

export { jsonCache };