import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_YEAR, getAvailableYears } from '../utils/yearConfig';

export const useYearlyComparisonData = (type: 'budget' | 'debt' | 'revenue' | 'investment', years: number[] = []) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparisonData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const allYears = years.length > 0 ? years : getAvailableYears();
    
    // TODO: Implement proper data fetching logic
    // For now, create mock data
    const mockData = allYears.map(year => ({
      year,
      value: Math.floor(Math.random() * 10000000), // Mock value
      label: year.toString()
    })).sort((a, b) => a.year - b.year);

    setData(mockData);
    setLoading(false);
  }, [type, years]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  return { data, loading, error };
};
