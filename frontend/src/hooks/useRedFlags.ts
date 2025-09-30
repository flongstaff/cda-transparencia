import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';

/**
 * Red Flags Hook - Fetches red flags data with caching and error handling
 * Provides access to financial red flags detected in the municipality's data
 */

interface RedFlagsState {
  flags: any[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export default function useRedFlags(selectedYear?: number): RedFlagsState {
  const [state, setState] = useState<RedFlagsState>({
    flags: [],
    loading: false,
    error: null,
    refetch: () => {}
  });

  const fetchRedFlags = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log(`[RED FLAGS HOOK] Fetching red flags for year ${selectedYear || 'all'}`);
      
      // Try to fetch red flags from data service
      const flags = await dataService.getRedFlags();
      
      // Filter by year if specified
      let filteredFlags = flags;
      if (selectedYear) {
        filteredFlags = flags.filter((flag: any) => {
          // Try to extract year from various possible fields
          const flagYear = flag.year || 
                          (flag.metadata && flag.metadata.year) ||
                          (flag.metadata && flag.metadata.document_year) ||
                          new Date().getFullYear();
          return parseInt(flagYear) === selectedYear;
        });
      }
      
      console.log(`[RED FLAGS HOOK] Successfully fetched ${filteredFlags.length} red flags`);
      
      setState({
        flags: filteredFlags,
        loading: false,
        error: null,
        refetch: fetchRedFlags
      });
    } catch (error) {
      console.error('[RED FLAGS HOOK] Error fetching red flags:', error);
      
      setState({
        flags: [],
        loading: false,
        error: error as Error,
        refetch: fetchRedFlags
      });
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchRedFlags();
  }, [fetchRedFlags]);

  return state;
}