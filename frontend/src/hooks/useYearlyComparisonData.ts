import { useState, useEffect, useCallback } from 'react';
import { useTransparencyData } from '../hooks/useTransparencyData';

export const useYearlyComparisonData = (type: 'budget' | 'debt' | 'revenue' | 'investment', years: number[] = []) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { completeData, loading: dataLoading, error: dataError } = useTransparencyData();

  const fetchComparisonData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the available years from the unified data
      const allYears = years.length > 0 ? years : (completeData?.summary?.years_covered || []);
      
      // Create mock data based on the type
      const mockData = allYears.map(year => ({
        year,
        value: Math.floor(Math.random() * 10000000), // Mock value
        label: year.toString()
      })).sort((a, b) => a.year - b.year);

      setData(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  }, [type, years, completeData]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  return { data, loading, error };
};

export default useYearlyComparisonData;