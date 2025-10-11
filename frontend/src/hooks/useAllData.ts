import { useQuery } from '@tanstack/react-query';
import { githubDataService } from '../services/GitHubDataService';
import cloudflareDataService from '../services/CloudflareDataService';

interface AllData {
  byYear: Record<number, any>;
  summary: {
    total_documents: number;
    years_covered: number[];
    categories: string[];
    audit_completion_rate: number;
    external_sources_active: number;
    last_updated: string;
  };
  external_validation: any[];
  metadata: {
    source: string;
    repository: string;
    branch: string;
    fetched_at: string;
  };
}

interface UseAllDataReturn {
  data: AllData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useAllData = (): UseAllDataReturn => {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery<AllData>({
    queryKey: ['allData'],
    queryFn: async () => {
      // First try Cloudflare service
      try {
        const result = await cloudflareDataService.loadAllData();
        if (result.success && result.data) {
          console.log(`[ALL DATA] Successfully fetched all data via Cloudflare service`);
          return result.data as AllData;
        }
      } catch (error) {
        console.warn(`[ALL DATA] Cloudflare service failed:`, error);
        // If Cloudflare fails, try GitHub service as fallback
      }

      // Fallback to GitHub service
      try {
        const result = await githubDataService.loadAllData();
        if (result.success && result.data) {
          console.log(`[ALL DATA] Successfully fetched all data via GitHub service`);
          return result.data as AllData;
        }
      } catch (error) {
        console.error(`[ALL DATA] GitHub service failed:`, error);
      }

      // If both services fail, throw an error
      throw new Error('Unable to fetch all data from any source');
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
};