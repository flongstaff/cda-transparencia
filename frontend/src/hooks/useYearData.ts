import { useQuery } from '@tanstack/react-query';
import { githubDataService } from '../services/GitHubDataService';
import cloudflareDataService from '../services/CloudflareDataService';

interface YearData {
  year: number;
  budget: any;
  contracts: any[];
  salaries: any[];
  documents: any[];
  treasury: any;
  debt: any;
  summary: any;
  sources: string[];
  lastUpdated: string;
}

interface UseYearDataReturn {
  data: YearData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useYearData = (year: number): UseYearDataReturn => {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery<YearData>({
    queryKey: ['yearData', year],
    queryFn: async () => {
      // First try Cloudflare service
      try {
        const result = await cloudflareDataService.loadYearData(year);
        if (result.success && result.data) {
          console.log(`[YEAR DATA] Successfully fetched year ${year} via Cloudflare service`);
          return result.data as YearData;
        }
      } catch (error) {
        console.warn(`[YEAR DATA] Cloudflare service failed for year ${year}:`, error);
        // If Cloudflare fails, try GitHub service as fallback
      }

      // Fallback to GitHub service
      try {
        const result = await githubDataService.loadYearData(year);
        if (result.success && result.data) {
          console.log(`[YEAR DATA] Successfully fetched year ${year} via GitHub service`);
          return result.data as YearData;
        }
      } catch (error) {
        console.error(`[YEAR DATA] GitHub service failed for year ${year}:`, error);
      }

      // If both services fail, throw an error
      throw new Error(`Unable to fetch data for year ${year} from any source`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!year, // Only run query if year is provided
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