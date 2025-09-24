/**
 * Unified Transparency Data Hook
 * Single hook for accessing all transparency data
 * Simplifies data access across all components
 */

import { useState, useEffect, useCallback } from 'react';
import { unifiedTransparencyService, TransparencyData } from '../services/UnifiedTransparencyService';

export interface UseTransparencyDataReturn extends TransparencyData {
  // Additional helper functions
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number) => string;
  getDocumentById: (id: string) => any | null;
  searchDocuments: (query: string) => any[];
}

export const useTransparencyData = (selectedYear?: number): UseTransparencyDataReturn => {
  const [data, setData] = useState<TransparencyData>({
    completeData: null,
    currentYearData: null,
    loading: true,
    error: null,
    metrics: {
      totalDocuments: 0,
      availableYears: [],
      categories: [],
      auditCompletionRate: 0,
      totalBudget: 0,
      totalExecuted: 0,
      executionRate: 0,
      externalSourcesActive: 0
    },
    refetch: async () => {},
    clearCache: () => {}
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      const transparencyData = await unifiedTransparencyService.loadCompleteData(selectedYear);
      setData(transparencyData);
    } catch (error: any) {
      setData({
        completeData: null,
        currentYearData: null,
        loading: false,
        error: error.message || 'Failed to load data',
        metrics: {
          totalDocuments: 0,
          availableYears: [],
          categories: [],
          auditCompletionRate: 0,
          totalBudget: 0,
          totalExecuted: 0,
          executionRate: 0,
          externalSourcesActive: 0
        },
        refetch: async () => loadData(),
        clearCache: () => unifiedTransparencyService.clearCache()
      });
    }
  }, [selectedYear]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper functions
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  const getDocumentById = useCallback((id: string): any | null => {
    if (!data.completeData) return null;
    
    // Search through all documents
    for (const year in data.completeData.byYear) {
      const docs = data.completeData.byYear[year]?.documents || [];
      const found = docs.find((doc: any) => doc.id === id);
      if (found) return found;
    }
    
    return null;
  }, [data.completeData]);

  const searchDocuments = useCallback((query: string): any[] => {
    if (!data.completeData || !query) return [];
    
    const results: any[] = [];
    const searchTerm = query.toLowerCase();
    
    // Search through all documents
    for (const year in data.completeData.byYear) {
      const docs = data.completeData.byYear[year]?.documents || [];
      docs.forEach((doc: any) => {
        if (
          doc.title?.toLowerCase().includes(searchTerm) ||
          doc.category?.toLowerCase().includes(searchTerm) ||
          doc.description?.toLowerCase().includes(searchTerm) ||
          doc.filename?.toLowerCase().includes(searchTerm)
        ) {
          results.push({ ...doc, year: parseInt(year) });
        }
      });
    }
    
    return results;
  }, [data.completeData]);

  return {
    ...data,
    formatCurrency,
    formatPercentage,
    getDocumentById,
    searchDocuments,
    refetch: loadData,
    clearCache: () => {
      unifiedTransparencyService.clearCache();
      loadData();
    }
  };
};

export default useTransparencyData;