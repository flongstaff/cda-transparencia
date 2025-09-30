/**
 * Enhanced Data Hook
 * Provides unified access to financial data, OSINT monitoring, and audit results
 */

import { useState, useEffect, useCallback } from 'react';
import enhancedDataIntegrationService, { 
  FinancialDataPoint, 
  ConsolidatedData, 
  OSINTDataPoint, 
  AuditFinding 
} from '../services/EnhancedDataIntegrationService';

// Hook for consolidated data
export const useConsolidatedData = (year: number) => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const consolidatedData = await enhancedDataIntegrationService.getConsolidatedData(year);
      setData(consolidatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading consolidated data');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
};

// Hook for financial data by type
export const useFinancialData = (year: number, type: string) => {
  const [data, setData] = useState<FinancialDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const financialData = await enhancedDataIntegrationService.getFinancialData(year, type);
      setData(financialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading financial data');
    } finally {
      setLoading(false);
    }
  }, [year, type]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
};

// Hook for OSINT data
export const useOSINTData = (year: number, municipality: string) => {
  const [data, setData] = useState<OSINTDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const osintData = await enhancedDataIntegrationService.getOSINTData(year, municipality);
      setData(osintData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading OSINT data');
    } finally {
      setLoading(false);
    }
  }, [year, municipality]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
};

// Hook for audit findings
export const useAuditFindings = (year: number) => {
  const [data, setData] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const auditFindings = await enhancedDataIntegrationService.getAuditFindings(year);
      setData(auditFindings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading audit findings');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
};

// Hook for data quality metrics
export const useDataQualityMetrics = (year: number) => {
  const [metrics, setMetrics] = useState<{
    coverage: number;
    completeness: number;
    accuracy: number;
    timeliness: number;
    consistency: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const qualityMetrics = await enhancedDataIntegrationService.getDataQualityMetrics(year);
      setMetrics(qualityMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data quality metrics');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: loadMetrics
  };
};

// Combined hook for dashboard data
export const useDashboardData = (year: number, municipality: string = 'Carmen de Areco') => {
  const consolidatedData = useConsolidatedData(year);
  const osintData = useOSINTData(year, municipality);
  const auditFindings = useAuditFindings(year);
  const qualityMetrics = useDataQualityMetrics(year);

  const loading = consolidatedData.loading || osintData.loading || auditFindings.loading || qualityMetrics.loading;
  const error = consolidatedData.error || osintData.error || auditFindings.error || qualityMetrics.error;

  const refetch = useCallback(async () => {
    await Promise.all([
      consolidatedData.refetch(),
      osintData.refetch(),
      auditFindings.refetch(),
      qualityMetrics.refetch()
    ]);
  }, [consolidatedData.refetch, osintData.refetch, auditFindings.refetch, qualityMetrics.refetch]);

  return {
    consolidatedData: consolidatedData.data,
    osintData: osintData.data,
    auditFindings: auditFindings.data,
    qualityMetrics: qualityMetrics.metrics,
    loading,
    error,
    refetch
  };
};

// Hook for specific data type with filtering
export const useFilteredFinancialData = (
  year: number, 
  type: string, 
  filters: {
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
  } = {}
) => {
  const { data, loading, error, refetch } = useFinancialData(year, type);

  const filteredData = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    // Apply amount filters
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(item => item.budgeted >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(item => item.budgeted <= filters.maxAmount!);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'budgeted':
            return b.budgeted - a.budgeted;
          case 'executed':
            return b.executed - a.executed;
          case 'percentage':
            return b.percentage - a.percentage;
          case 'variance':
            return Math.abs(b.variance || 0) - Math.abs(a.variance || 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [data, filters]);

  return {
    data: filteredData,
    originalData: data,
    loading,
    error,
    refetch
  };
};

// Import useMemo for the filtered data hook
import { useMemo } from 'react';
