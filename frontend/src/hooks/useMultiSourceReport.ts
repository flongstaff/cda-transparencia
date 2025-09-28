import { useMemo, useCallback } from 'react';
import { useTransparencyData } from './useTransparencyData';

export interface MultiSourceReport {
  // Main report data
  report: any;
  
  // Data by source type
  bySource: {
    web_sources: any;
    multi_source: any;
    financial: any;
    governance: any;
    analysis: any;
  };
  
  // Aggregated metrics
  metrics: {
    totalDocuments: number;
    documentTypes: Record<string, number>;
    yearsCovered: number[];
    categoriesCovered: string[];
    dataSources: number;
  };
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

export const useMultiSourceReport = () => {
  // 🚀 Use the unified transparency data hook
  const {
    completeData,
    currentYearData,
    loading,
    error,
    metrics
  } = useTransparencyData();

  // Transform the data into a multi-source report format
  const reportData = useMemo<MultiSourceReport>(() => {
    if (!completeData || loading) {
      return {
        report: null,
        bySource: {
          web_sources: null,
          multi_source: null,
          financial: null,
          governance: null,
          analysis: null,
        },
        metrics: {
          totalDocuments: 0,
          documentTypes: {},
          yearsCovered: [],
          categoriesCovered: [],
          dataSources: 0,
        },
        loading,
        error: error || null,
      };
    }

    // Extract data by source type from the complete data
    const bySource = {
      web_sources: null, // Web sources data if available
      multi_source: null, // Multi-source data if available
      financial: currentYearData?.budget || null, // Financial data
      governance: null, // Governance data if available
      analysis: null, // Analysis data if available
    };

    // Calculate metrics from the unified metrics
    return {
      report: completeData,
      bySource,
      metrics: {
        totalDocuments: metrics.totalDocuments,
        documentTypes: {}, // Will populate from documents
        yearsCovered: metrics.availableYears,
        categoriesCovered: metrics.categories,
        dataSources: metrics.externalSourcesActive,
      },
      loading,
      error: error || null,
    };
  }, [completeData, currentYearData, loading, error, metrics]);

  const refreshReport = useCallback(() => {
    console.log('Refreshing multi-source report...');
    // Refresh handled by the underlying hook
  }, []);

  return {
    ...reportData,
    refreshReport,
  };
};

// Hook for specific source types
export const useMultiSourceByType = (sourceType: 'web_sources' | 'multi_source' | 'financial' | 'governance' | 'analysis') => {
  const { bySource, loading, error } = useMultiSourceReport();
  
  return {
    data: bySource[sourceType],
    loading,
    error,
  };
};

// Hook for document metrics
export const useMultiSourceMetrics = () => {
  const { metrics, loading, error } = useMultiSourceReport();
  
  return {
    metrics,
    loading,
    error,
  };
};

export default {
  useMultiSourceReport,
  useMultiSourceByType,
  useMultiSourceMetrics,
};