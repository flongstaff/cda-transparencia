/**
 * GitHub Pages Data Hook - ELECTION READY
 * Loads ALL years (2018-2025) from GitHub Pages deployment
 * Proper URL handling for production deployment
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { gitHubPagesDataService, YearlyDataIndex, DocumentFile } from '../services/GitHubPagesDataService';

export interface UseGitHubPagesDataReturn {
  // All years data
  allYearsData: Record<number, YearlyDataIndex>;

  // Current year data
  currentYearData: YearlyDataIndex | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Summary statistics
  totalDocuments: number;
  availableYears: number[];
  totalCategories: string[];

  // Actions
  refetch: () => Promise<void>;
  clearCache: () => void;
  getDocumentContent: (document: DocumentFile) => Promise<any>;
}

export const useGitHubPagesData = (selectedYear?: number) => {
  const [allYearsData, setAllYearsData] = useState<Record<number, YearlyDataIndex>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ALL years data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 LOADING ALL YEARS FROM GITHUB PAGES...');

      const yearsData = await gitHubPagesDataService.loadAllYearsData();
      setAllYearsData(yearsData);

      const totalDocs = Object.values(yearsData).reduce((sum, year) => sum + year.totalDocuments, 0);
      console.log(`✅ GITHUB PAGES DATA LOADED: ${totalDocs} documents across ${Object.keys(yearsData).length} years`);

    } catch (err: any) {
      console.error('❌ GitHub Pages data loading failed:', err);
      setError(err.message || 'Failed to load data from GitHub Pages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current year data
  const currentYearData = useMemo(() => {
    const year = selectedYear || new Date().getFullYear();
    return allYearsData[year] || null;
  }, [allYearsData, selectedYear]);

  // Summary statistics
  const totalDocuments = useMemo(() => {
    return Object.values(allYearsData).reduce((sum, yearData) => sum + yearData.totalDocuments, 0);
  }, [allYearsData]);

  const availableYears = useMemo(() => {
    return Object.keys(allYearsData)
      .map(Number)
      .filter(year => allYearsData[year].totalDocuments > 0)
      .sort((a, b) => b - a); // Newest first
  }, [allYearsData]);

  const totalCategories = useMemo(() => {
    const allCategories = new Set<string>();
    Object.values(allYearsData).forEach(yearData => {
      yearData.categories.forEach(category => allCategories.add(category));
    });
    return Array.from(allCategories).sort();
  }, [allYearsData]);

  // Clear cache
  const clearCache = useCallback(() => {
    gitHubPagesDataService.clearCache();
    loadData();
  }, [loadData]);

  // Get document content
  const getDocumentContent = useCallback(async (document: DocumentFile) => {
    return gitHubPagesDataService.getDocumentContent(document);
  }, []);

  return {
    allYearsData,
    currentYearData,
    loading,
    error,
    totalDocuments,
    availableYears,
    totalCategories,
    refetch: loadData,
    clearCache,
    getDocumentContent
  };
};

export default useGitHubPagesData;