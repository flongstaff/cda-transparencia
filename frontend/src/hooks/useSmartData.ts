/**
 * useSmartData Hook
 *
 * React hook that integrates SmartDataLoader with React components
 * Provides intelligent data loading with caching and prefetching
 */

import { useState, useEffect, useCallback } from 'react';
import smartDataLoader from '../services/SmartDataLoader';
import dataCachingService from '../services/DataCachingService';

export interface UseSmartDataOptions {
  sourceId: string;
  params?: Record<string, any>;
  priority?: 'immediate' | 'high' | 'low';
  sourceType?: string;
  enabled?: boolean;
  forceRefresh?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseSmartDataResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isCached: boolean;
  cacheAge: number | null;
}

/**
 * Hook for smart data loading with caching
 */
export function useSmartData<T = any>(options: UseSmartDataOptions): UseSmartDataResult<T> {
  const {
    sourceId,
    params,
    priority = 'immediate',
    sourceType = 'general',
    enabled = true,
    forceRefresh = false,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if data is already cached
      const cached = dataCachingService.get(sourceId, params);
      if (cached && !forceRefresh) {
        setData(cached);
        setIsCached(true);

        const cacheInfo = dataCachingService.getEntryInfo(sourceId, params);
        if (cacheInfo) {
          setCacheAge(cacheInfo.age);
        }

        setLoading(false);
        if (onSuccess) onSuccess(cached);
        return;
      }

      // Load data using smart loader
      const result = await smartDataLoader.load<T>(sourceId, params, {
        priority,
        sourceType,
        forceRefresh
      });

      if (result) {
        setData(result);
        setIsCached(false);
        setCacheAge(0);
        if (onSuccess) onSuccess(result);
      } else {
        // Data queued for later loading
        setLoading(false);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  }, [sourceId, JSON.stringify(params), priority, sourceType, enabled, forceRefresh]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch,
    isCached,
    cacheAge
  };
}

/**
 * Hook for batch loading multiple data sources
 */
export function useSmartDataBatch(requests: UseSmartDataOptions[]) {
  const [data, setData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadBatch = async () => {
      setLoading(true);
      setError(null);

      try {
        const dataRequests = requests.map(req => ({
          sourceId: req.sourceId,
          params: req.params,
          priority: req.priority || 'immediate',
          sourceType: req.sourceType || 'general'
        }));

        const results = await smartDataLoader.loadBatch(dataRequests);
        setData(results);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (requests.length > 0) {
      loadBatch();
    }
  }, [JSON.stringify(requests)]);

  return { data, loading, error };
}

/**
 * Hook for prefetching data (doesn't return data, just loads it into cache)
 */
export function usePrefetch() {
  const prefetch = useCallback((sourceIds: string[], sourceType?: string) => {
    smartDataLoader.prefetch(sourceIds, sourceType);
  }, []);

  const prefetchPage = useCallback((pageName: string, year?: number) => {
    smartDataLoader.prefetchPageData(pageName, year);
  }, []);

  return { prefetch, prefetchPage };
}

/**
 * Hook for cache management
 */
export function useCacheControl() {
  const clearCache = useCallback(() => {
    dataCachingService.clear();
  }, []);

  const clearExpired = useCallback(() => {
    return dataCachingService.clearExpired();
  }, []);

  const getCacheStats = useCallback(() => {
    return dataCachingService.getStats();
  }, []);

  const getLoaderStats = useCallback(() => {
    return smartDataLoader.getStats();
  }, []);

  return {
    clearCache,
    clearExpired,
    getCacheStats,
    getLoaderStats
  };
}

/**
 * Hook for checking if data is cached
 */
export function useIsCached(sourceId: string, params?: Record<string, any>) {
  const [isCached, setIsCached] = useState<boolean>(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  useEffect(() => {
    const cached = dataCachingService.has(sourceId, params);
    setIsCached(cached);

    if (cached) {
      const info = dataCachingService.getEntryInfo(sourceId, params);
      setCacheInfo(info);
    }
  }, [sourceId, JSON.stringify(params)]);

  return { isCached, cacheInfo };
}
