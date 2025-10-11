import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/ApiService';

interface UseApiDataReturn<T = any> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useApiData = <T = any>(endpoint: string, enabled: boolean = true): UseApiDataReturn<T> => {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery<T>({
    queryKey: ['apiData', endpoint],
    queryFn: async () => {
      const result = await apiService.get<T>(endpoint);
      
      if (result.success && result.data) {
        console.log(`[API DATA] Successfully fetched ${endpoint} via ${result.source || 'service'}`);
        return result.data;
      } else {
        throw new Error(result.error || `Failed to fetch data from ${endpoint}`);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled && !!endpoint, // Only run query if enabled and endpoint is provided
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
};