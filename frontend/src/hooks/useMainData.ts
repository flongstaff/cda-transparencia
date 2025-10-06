import { useState, useEffect } from 'react';

interface MainData {
  '@context': string;
  version: string;
  title: string;
  description: string;
  publisher: {
    name: string;
    mbox: string;
  };
  license: string;
  dataset: DataSet[];
}

interface DataSet {
  identifier: string;
  title: string;
  description: string;
  theme: string[];
  superTheme: string[];
  distribution: Distribution[];
}

interface Distribution {
  title: string;
  format: string;
  accessURL: string;
  downloadURL: string;
}

interface UseMainDataReturn {
  data: MainData | null;
  loading: boolean;
  error: string | null;
}

export const useMainData = (): UseMainDataReturn => {
  const [data, setData] = useState<MainData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try multiple endpoints
        const endpoints = [
          '/main-data.json',  // Static file
          '/api/main-data',   // API endpoint
          '/data/main-data.json'  // Alternative path
        ];
        
        let jsonData: MainData | null = null;
        let success = false;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`[MAIN DATA] Attempting to fetch from ${endpoint}`);
            const response = await fetch(endpoint);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            jsonData = await response.json();
            console.log(`[MAIN DATA] Successfully fetched from ${endpoint}`);
            success = true;
            break;
          } catch (err) {
            console.warn(`[MAIN DATA] Failed to fetch from ${endpoint}:`, err);
            continue;
          }
        }
        
        if (!success) {
          throw new Error('Failed to fetch main data from any endpoint');
        }
        
        setData(jsonData);
        setError(null);
      } catch (err) {
        console.error('[MAIN DATA] Error fetching main data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};