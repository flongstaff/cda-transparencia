import { useState, useEffect, useCallback, useMemo } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/transparency';

export interface TransparencyData {
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
  // Sanity check data
  expectedDocCount: number | null;
  actualDocCount: number | null;
}

export interface InvestmentAnalytics {
  totalInvestment: number;
  totalDepreciation: number;
  netInvestmentValue: number;
  investmentByType: Array<{ name: string; value: number; color: string }>;
  topInvestments: any[];
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

export const useTransparencyData = (year: number) => {
  const [data, setData] = useState<TransparencyData>({
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
    expectedDocCount: null,
    actualDocCount: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null, year }));

    try {
      // Fetch complete data payload from the new consolidated endpoint
      const response = await fetch(`${API_BASE}/year/${year}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const fullData = await response.json();

      setData({
        financialOverview: fullData.financialOverview,
        budgetBreakdown: fullData.budgetBreakdown,
        documents: fullData.documents || [],
        auditOverview: fullData.auditOverview,
        spendingEfficiency: fullData.spendingEfficiency,
        dashboard: fullData.dashboard,
        antiCorruption: fullData.antiCorruption,
        loading: false,
        error: null,
        year,
        generated_at: fullData.generated_at || null,
        expectedDocCount: fullData.consistency_check?.documents_expected || null,
        actualDocCount: fullData.consistency_check?.documents_received || null,
      });

    } catch (err: any) {
      setData({
        financialOverview: null,
        budgetBreakdown: null,
        documents: null,
        auditOverview: null,
        spendingEfficiency: null,
        dashboard: null,
        antiCorruption: null,
        loading: false,
        error: err.message || 'Failed to load transparency data',
        year,
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