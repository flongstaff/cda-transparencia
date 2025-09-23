import { useMemo, useCallback } from 'react';
import { useUnifiedData } from './useUnifiedData';

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
  // Use the unified data hook to get the multi‑source data
  const { 
    data,
    refetch,
    isLoading,
    isError,
    error
  } = useUnifiedData();

  // Transform the data into a multi‑source report format
  const reportData = useMemo<MultiSourceReport>(() => {
    if (!data || isLoading) {
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
        loading: isLoading,
        error: isError ? error.message : null,
      };
    }

    // Extract data by source type
    const bySource = {
      web_sources: data.multi_source?.external_apis?.web_sources || null,
      multi_source: data.multi_source?.external_apis?.multi_source || null,
      financial: data.multi_source?.financial || null,
      governance: data.multi_source?.governance || null,
      analysis: data.multi_source?.analysis || null,
    };

    // Calculate metrics
    const documentTypes = data.documents.reduce((acc, doc) => {
      const type = doc.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const yearsCovered = Array.from(
      new Set(data.documents.map(doc => doc.year).filter(Boolean))
    ).sort();

    const categoriesCovered = Array.from(
      new Set(data.documents.map(doc => doc.category).filter(Boolean))
    );

    return {
      report: data.multi_source,
      bySource,
      metrics: {
        totalDocuments: data.documents.length,
        documentTypes,
        yearsCovered,
        categoriesCovered,
        dataSources: data.metadata.data_sources,
      },
      loading: isLoading,
      error: isError ? error.message : null,
    };
  }, [data, isLoading, isError, error]);

  // Method to refresh the report data
  const refreshReport = useCallback(() => {
    refetch();
    console.log('Refreshing multi-source report...');
  }, [refetch]);

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