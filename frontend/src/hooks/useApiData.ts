import { useState, useEffect, useCallback } from 'react';
import { handleDataError } from '../utils/dataRoutes';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Custom hook for data fetching with built-in retry mechanism and error handling
 */
export const useApiData = <T,>(
  fetchFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  retryOptions: RetryOptions = {}
): UseApiDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true
  } = retryOptions;

  const fetchData = useCallback(async () => {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchFunction();
        setData(result);
        break; // Success, exit the retry loop
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        
        retries++;
        
        if (retries > maxRetries) {
          // Log error to error tracking service if available
          handleDataError(err, 'useApiData');
          break;
        }
        
        // Calculate delay with exponential backoff if enabled
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, retries - 1)
          : retryDelay;
          
        console.warn(`Retry attempt ${retries}/${maxRetries} failed, retrying in ${delay}ms...`, err);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } finally {
        if (retries > maxRetries) {
          setLoading(false);
        }
      }
    }
    
    setLoading(false);
  }, [fetchFunction, maxRetries, retryDelay, exponentialBackoff]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const retry = useCallback(async () => {
    setError(null);
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    retry
  };
};

export default useApiData;