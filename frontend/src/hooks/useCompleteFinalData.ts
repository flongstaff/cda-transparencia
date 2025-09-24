/**
 * COMPLETE FINAL DATA HOOK - ELECTION READY
 * This hook ACTUALLY loads ALL data from ALL sources
 * - All years (2018-2025)
 * - All file types (PDF, JSON, MD)
 * - All categories
 * - External validation (AFIP, procurement)
 * - Audit system
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { completeFinalDataService, CompleteFinalData, CompleteDocument } from '../services/CompleteFinalDataService';

export interface UseCompleteFinalDataReturn {
  // Complete system data
  completeData: CompleteFinalData | null;

  // Current year data
  currentYearData: {
    documents: CompleteDocument[];
    budget: any;
    salaries: any;
    contracts: any;
  } | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Summary stats
  totalDocuments: number;
  availableYears: number[];
  categories: string[];
  externalSourcesActive: number;
  auditCompletionRate: number;

  // Actions
  refetch: () => Promise<void>;
  clearCache: () => void;
  getDocumentContent: (document: CompleteDocument) => Promise<any>;
}

export const useCompleteFinalData = (selectedYear?: number) => {
  const [completeData, setCompleteData] = useState<CompleteFinalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ALL data from ALL sources
  const loadCompleteData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 LOADING COMPLETE FINAL SYSTEM DATA...');

      const data = await completeFinalDataService.loadCompleteSystemData();
      setCompleteData(data);

      console.log('✅ COMPLETE SYSTEM LOADED:', data.summary);

    } catch (err: any) {
      console.error('❌ Complete system loading failed:', err);
      setError(err.message || 'Failed to load complete system data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadCompleteData();
  }, [loadCompleteData]);

  // Current year data
  const currentYearData = useMemo(() => {
    if (!completeData) return null;

    const year = selectedYear || new Date().getFullYear();
    const yearData = completeData.byYear[year];

    if (!yearData) return null;

    return {
      documents: yearData.documents,
      budget: yearData.budget,
      salaries: yearData.salaries,
      contracts: yearData.contracts
    };
  }, [completeData, selectedYear]);

  // Summary statistics
  const totalDocuments = completeData?.summary.total_documents || 0;
  const availableYears = completeData?.summary.years_covered || [];
  const categories = completeData?.summary.categories || [];
  const externalSourcesActive = completeData?.summary.external_sources_active || 0;
  const auditCompletionRate = completeData?.summary.audit_completion_rate || 0;

  // Clear cache
  const clearCache = useCallback(() => {
    completeFinalDataService.clearCache();
    loadCompleteData();
  }, [loadCompleteData]);

  // Get document content
  const getDocumentContent = useCallback(async (document: CompleteDocument) => {
    try {
      // Try JSON first, then markdown, then PDF
      if (document.json_url) {
        const response = await fetch(document.json_url);
        if (response.ok) {
          return await response.json();
        }
      }

      if (document.markdown_url) {
        const response = await fetch(document.markdown_url);
        if (response.ok) {
          return await response.text();
        }
      }

      if (document.content) {
        return document.content;
      }

      throw new Error('No content available for this document');
    } catch (error) {
      console.error('Failed to load document content:', error);
      throw error;
    }
  }, []);

  return {
    completeData,
    currentYearData,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories,
    externalSourcesActive,
    auditCompletionRate,
    refetch: loadCompleteData,
    clearCache,
    getDocumentContent
  };
};

export default useCompleteFinalData;