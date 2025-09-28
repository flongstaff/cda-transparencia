// useFinancialData.ts
// Custom hook to fetch financial data for Carmen de Areco Transparency Portal

import { useState, useEffect } from 'react';
import FinancialDataService, {
  FinancialData,
  RevenueBySource,
  ExpenditureByProgram,
  ConsolidatedData
} from './FinancialDataService';

interface UseFinancialDataReturn {
  data: {
    summary: FinancialData | null;
    revenueBySource: RevenueBySource | null;
    expenditureByProgram: ExpenditureByProgram | null;
    consolidated: ConsolidatedData | null;
  };
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useFinancialData = (year: number = 2019): UseFinancialDataReturn => {
  const [data, setData] = useState<UseFinancialDataReturn['data']>({
    summary: null,
    revenueBySource: null,
    expenditureByProgram: null,
    consolidated: null
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const financialData = await FinancialDataService.getAllFinancialData(year);
      
      setData(financialData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useFinancialSummary = (year: number = 2019) => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await FinancialDataService.getFinancialSummary(year);
        setData(summary);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch financial summary'));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [year]);

  return { data, loading, error };
};

export const useRevenueBySource = (year: number = 2019) => {
  const [data, setData] = useState<RevenueBySource | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        setError(null);
        const revenue = await FinancialDataService.getRevenueBySource(year);
        setData(revenue);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch revenue by source'));
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [year]);

  return { data, loading, error };
};

export const useExpenditureByProgram = (year: number = 2019) => {
  const [data, setData] = useState<ExpenditureByProgram | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExpenditure = async () => {
      try {
        setLoading(true);
        setError(null);
        const expenditure = await FinancialDataService.getExpenditureByProgram(year);
        setData(expenditure);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch expenditure by program'));
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditure();
  }, [year]);

  return { data, loading, error };
};

export const useConsolidatedData = (year: number = 2019) => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConsolidated = async () => {
      try {
        setLoading(true);
        setError(null);
        const consolidated = await FinancialDataService.getConsolidatedData(year);
        setData(consolidated);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch consolidated data'));
      } finally {
        setLoading(false);
      }
    };

    fetchConsolidated();
  }, [year]);

  return { data, loading, error };
};

export default useFinancialData;