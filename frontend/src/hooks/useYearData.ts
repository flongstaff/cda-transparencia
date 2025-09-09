import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface YearData {
  categories: Record<string, number> | null;
  documents: any[] | null;
  total_documents: number | null;
  loading: boolean;
  error: string | null;
}

export const useYearData = (selectedYear: number | null) => {
  const [data, setData] = useState<YearData>({
    categories: null,
    documents: null,
    total_documents: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch in parallel
        const [categoriesRes, documentsRes] = await Promise.all([
          fetch(`${API_BASE}/${selectedYear}/categories`),
          fetch(`${API_BASE}/${selectedYear}/documents`),
        ]);

        if (!categoriesRes.ok || !documentsRes.ok) {
          throw new Error('Failed to fetch year data');
        }

        const categoriesData = await categoriesRes.json();
        const documentsData = await documentsRes.json();

        setData({
          categories: categoriesData.categories,
          documents: documentsData.documents,
          total_documents: documentsData.documents?.length || 0,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setData({
          categories: null,
          documents: null,
          total_documents: null,
          loading: false,
          error: err.message || 'Error loading data',
        });
      }
    };

    fetchData();
  }, [selectedYear]);

  return data;
};