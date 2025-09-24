import { useTransparencyData } from './useTransparencyData';
import { consolidatedApiService } from '../services/ConsolidatedApiService';
import { useState, useEffect } from 'react';

export const useUnifiedData = (year: number) => {
  const { data: transparencyData, loading: transparencyLoading, error: transparencyError } = useTransparencyData(year);
  const [additionalData, setAdditionalData] = useState<any>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const years = await consolidatedApiService.getAvailableYears();
        setAvailableYears(years);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAvailableYears();
  }, []);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [auditAnomalies, documents, salaries, contracts, propertyDeclarations] = await Promise.all([
          consolidatedApiService.getAuditAnomalies(),
          consolidatedApiService.getDocuments(year),
          consolidatedApiService.getSalaryData(year),
          consolidatedApiService.getPublicTenders(year),
          consolidatedApiService.getPropertyDeclarations(year),
        ]);
        setAdditionalData({ auditAnomalies, documents, salaries, contracts, propertyDeclarations });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAdditionalData();
  }, [year]);

  useEffect(() => {
    setLoading(transparencyLoading || !additionalData);
    setError(transparencyError || error);
  }, [transparencyLoading, additionalData, transparencyError, error]);

  const mergedData = {
    ...transparencyData,
    ...additionalData,
  };

  return { data: mergedData, loading, error, availableYears };
};
