import { useState, useEffect, useCallback, useMemo } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/transparency';
const USE_API = import.meta.env.VITE_USE_API === 'true';

export interface UnifiedTransparencyData {
  // Complete data payload from backend
  year: number | null;
  financialOverview: any | null;
  budgetBreakdown: any[] | null;
  documents: any[] | null;
  dashboard: any | null;
  spendingEfficiency: any | null;
  auditOverview: any | null;
  antiCorruption: any | null;
  // Loading & error states
  loading: boolean;
  error: string | null;
  // Metadata
  generated_at: string | null;
  // Consistency check data
  consistency_check: {
    documents_expected: number | null;
    documents_received: number | null;
    data_complete: boolean | null;
  } | null;
}

export interface InvestmentAnalytics {
  totalInvestment: number;
  totalDepreciation: number;
  netInvestmentValue: number;
  investmentByType: Array<{ name: string; value: number; color: string }>;
  topInvestments: any[];
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

export const useUnifiedTransparencyData = (year: number) => {
  const [data, setData] = useState<UnifiedTransparencyData>({
    year: null,
    financialOverview: null,
    budgetBreakdown: null,
    documents: null,
    dashboard: null,
    spendingEfficiency: null,
    auditOverview: null,
    antiCorruption: null,
    loading: false,
    error: null,
    generated_at: null,
    consistency_check: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null, year }));

    try {
      let fullData;
      
      if (USE_API) {
        try {
          // Try to fetch from API first
          const response = await fetch(`${API_BASE}/year/${year}`);
          
          if (response.ok) {
            const apiData = await response.json();
            // If API returns real data, use it
            if (apiData.documents && apiData.documents.length > 0) {
              fullData = apiData;
            } else {
              // API returned empty data, fallback to local
              throw new Error('API returned empty data');
            }
          } else {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          console.warn('API fetch failed, falling back to local data:', apiError);
          // Fallback to local data
          try {
            const dataModule = await import(`../data/data_index_${year}.json`);
            fullData = dataModule.default;
          } catch (importError) {
            // Fallback to comprehensive data if year-specific file doesn't exist
            const comprehensiveModule = await import('../data/comprehensive_data_index.json');
            fullData = comprehensiveModule.default;
          }
        }
      } else {
        // Load data from local JSON files
        try {
          const dataModule = await import(`../data/data_index_${year}.json`);
          fullData = dataModule.default;
        } catch (importError) {
          // Fallback to comprehensive data if year-specific file doesn't exist
          const comprehensiveModule = await import('../data/comprehensive_data_index.json');
          fullData = comprehensiveModule.default;
        }
      }

      setData({
        financialOverview: fullData.financialOverview,
        budgetBreakdown: fullData.budgetBreakdown,
        documents: fullData.documents || [],
        dashboard: fullData.dashboard,
        spendingEfficiency: fullData.spendingEfficiency,
        auditOverview: fullData.auditOverview,
        antiCorruption: fullData.antiCorruption,
        loading: false,
        error: null,
        year,
        generated_at: fullData.generated_at,
        consistency_check: fullData.consistency_check || null,
      });

    } catch (err: any) {
      setData({
        financialOverview: null,
        budgetBreakdown: null,
        documents: null,
        dashboard: null,
        spendingEfficiency: null,
        auditOverview: null,
        antiCorruption: null,
        loading: false,
        error: err.message || 'Failed to load transparency data',
        year,
        generated_at: null,
        consistency_check: null,
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

// Memoized analytics calculation to prevent expensive recalculations on every render
export const useInvestmentAnalytics = (data: any[]) => {
  const analytics = useMemo<InvestmentAnalytics | null>(() => {
    if (data.length === 0) return null;

    const totalInvestment = data.reduce((sum, inv) => sum + inv.value, 0);
    const totalDepreciation = data.reduce((sum, inv) => sum + (inv.depreciation || 0), 0);
    const netInvestmentValue = totalInvestment - totalDepreciation;

    const investmentByType = data.reduce((acc, inv) => {
      const type = inv.asset_type || 'Otros';
      acc[type] = (acc[type] || 0) + inv.value;
      return acc;
    }, {} as Record<string, number>);

    const investmentByTypeArray = Object.entries(investmentByType)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    const topInvestments = [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalInvestment,
      totalDepreciation,
      netInvestmentValue,
      investmentByType: investmentByTypeArray,
      topInvestments
    };
  }, [data]);

  return analytics;
};