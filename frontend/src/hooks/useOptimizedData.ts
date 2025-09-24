/**
 * OPTIMIZED DATA HOOK - UNIFIED ACCESS TO ALL YOUR DATA
 *
 * This hook provides optimized access to ALL your existing services:
 * - CompleteFinalDataService (primary)
 * - RealDataService (fallback)
 * - MasterDataService (fallback)
 * - Advanced data validation and caching
 * - Automatic service health monitoring
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { optimizedMasterService } from '../services/OptimizedMasterService';

export interface UseOptimizedDataReturn {
  // Complete system data
  completeData: any | null;

  // Current year data
  currentYearData: {
    documents: any[];
    budget: any;
    salaries: any;
    contracts: any[];
  } | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Summary statistics
  totalDocuments: number;
  availableYears: number[];
  categories: string[];
  auditCompletionRate: number;

  // Service health
  serviceStatus: any;
  activeService: string;

  // Actions
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export const useOptimizedData = (selectedYear?: number): UseOptimizedDataReturn => {
  const [completeData, setCompleteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [activeService, setActiveService] = useState<string>('CompleteFinalDataService');

  // Load complete data with service monitoring
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🚀 OPTIMIZED LOADING: Starting data load for year ${selectedYear || 'all'}`);

      // Load data through optimized master service
      const data = await optimizedMasterService.loadCompleteData(selectedYear);

      // Get service health status
      const status = await optimizedMasterService.getServiceStatus();

      setCompleteData(data);
      setServiceStatus(status);
      setActiveService(status.services.find(s => s.primary && s.status === 'healthy')?.service || 'Fallback Services');

      console.log(`✅ OPTIMIZED SUCCESS: Loaded ${data?.summary?.total_documents || 0} documents`);
      console.log(`📊 SERVICE STATUS: ${status.overall} (${status.services.filter(s => s.status === 'healthy').length}/${status.services.length} healthy)`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading data';
      console.error('❌ OPTIMIZED ERROR:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  // Initial load and reload on year change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refetch function
  const refetch = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    optimizedMasterService.clearCache();
    console.log('🧹 CACHE CLEARED: All services cache cleared');
  }, []);

  // Process current year data
  const currentYearData = useMemo(() => {
    if (!completeData || !selectedYear) return null;

    const yearData = completeData.byYear?.[selectedYear] || completeData.years?.[selectedYear];

    if (!yearData) return null;

    return {
      documents: yearData.documents || [],
      budget: yearData.budget || null,
      salaries: yearData.salaries || null,
      contracts: yearData.contracts || []
    };
  }, [completeData, selectedYear]);

  // Calculate summary statistics
  const { totalDocuments, availableYears, categories, auditCompletionRate } = useMemo(() => {
    if (!completeData) {
      return {
        totalDocuments: 0,
        availableYears: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        categories: [],
        auditCompletionRate: 0
      };
    }

    const summary = completeData.summary || {};
    const totalDocs = summary.total_documents || completeData.documents?.length || 0;
    const years = summary.years_covered || Object.keys(completeData.byYear || {}).map(Number) || [];
    const cats = summary.categories || [];

    // Calculate audit completion rate based on data availability
    const completionRate = years.length > 0 ? (totalDocs / (years.length * 10)) * 100 : 0; // Rough estimate
    const cappedRate = Math.min(Math.max(completionRate, 0), 100);

    return {
      totalDocuments: totalDocs,
      availableYears: years.sort((a, b) => b - a),
      categories: cats,
      auditCompletionRate: cappedRate
    };
  }, [completeData]);

  return {
    completeData,
    currentYearData,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories,
    auditCompletionRate,
    serviceStatus,
    activeService,
    refetch,
    clearCache
  };
};

export default useOptimizedData;