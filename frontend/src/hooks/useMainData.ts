import { useQuery } from '@tanstack/react-query';
import cloudflareDataService from '../services/CloudflareDataService';

interface MainData {
  title: string;
  description: string;
  lastUpdated: string;
  dataset: DataSet[];
}

interface DataSet {
  identifier: string;
  title: string;
  description: string;
  theme: string;
  superTheme: string;
  keywords: string[];
  issued: string;
  modified: string;
  landingPage: string;
  publisher: string;
  distribution: Distribution[];
}

interface Distribution {
  title: string;
  format: string;
  fileName: string;
  accessURL: string;
  downloadURL: string;
}

interface UseMainDataReturn {
  data: MainData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useMainData = (): UseMainDataReturn => {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery<MainData>({
    queryKey: ['mainData'],
    queryFn: async () => {
      // Use CloudflareDataService for optimized fetching
      const result = await cloudflareDataService.fetchJson('/data/main-data.json');
      
      if (result.success && result.data) {
        console.log(`[MAIN DATA] Successfully fetched via Cloudflare service (source: ${result.source})`);
        return result.data as MainData;
      } else {
        throw new Error(result.error || 'Failed to fetch main data via Cloudflare service');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
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