import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

export interface TransparencyData {
  // Complete data payload from backend
  year: number | null;
  documents: any[] | null;
  categories: Record<string, number> | null;
  budget: any | null;
  salaries: any | null;
  contracts: any | null;
  summary: any | null;
  metrics: any | null;
  audit: any | null;
  // Loading & error states
  loading: boolean;
  error: string | null;
  // Metadata
  generated_at: string | null;
  // Sanity check data
  expectedDocCount: number | null;
  actualDocCount: number | null;
}

export const useTransparencyData = (year: number) => {
  const [data, setData] = useState<TransparencyData>({
    year: null,
    documents: null,
    categories: null,
    budget: null,
    salaries: null,
    contracts: null,
    summary: null,
    metrics: null,
    audit: null,
    loading: false,
    error: null,
    generated_at: null,
    expectedDocCount: null,
    actualDocCount: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch complete data payload from the new consolidated endpoint
      const response = await fetch(`${API_BASE}/years/${year}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data for year ${year}`);
      }

      const fullData = await response.json();

      // Extract data from the payload
      const {
        documents,
        categories,
        budget,
        salaries,
        contracts,
        summary,
        metrics,
        audit,
        generated_at
      } = fullData;

      // Calculate document counts for sanity check
      const expectedDocCount = categories ? Object.values(categories).reduce((a: number, b: number) => a + b, 0) : 0;
      const actualDocCount = documents?.length || 0;

      // Log warning if there's a mismatch
      if (expectedDocCount > 0 && actualDocCount < expectedDocCount) {
        console.warn(`⚠️ Showing ${actualDocCount} of ${expectedDocCount} documents for ${year}`);
      }

      setData({
        year,
        documents: documents || [],
        categories: categories || null,
        budget: budget || null,
        salaries: salaries || null,
        contracts: contracts || null,
        summary: summary || null,
        metrics: metrics || null,
        audit: audit || null,
        loading: false,
        error: null,
        generated_at: generated_at || null,
        expectedDocCount,
        actualDocCount,
      });
    } catch (err: any) {
      setData({
        year: null,
        documents: null,
        categories: null,
        budget: null,
        salaries: null,
        contracts: null,
        summary: null,
        metrics: null,
        audit: null,
        loading: false,
        error: err.message || `Failed to load transparency data for year ${year}`,
        generated_at: null,
        expectedDocCount: null,
        actualDocCount: null,
      });
    }
  }, [year]);

  useEffect(() => {
    if (year) {
      fetchData();
    }
  }, [year, fetchData]);

  return { ...data, refetch: fetchData };
};