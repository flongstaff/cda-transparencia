/**
 * Simple Anomaly Detection Hook
 * Provides basic anomaly detection capabilities to components
 */

import { useState, useEffect, useCallback } from 'react';
import SimpleAnomalyDetectionService, { SimpleAnomalyDetectionResult } from '../services/SimpleAnomalyDetectionService';

interface SimpleAnomalyDetectionState {
  result: SimpleAnomalyDetectionResult | null;
  loading: boolean;
  error: Error | null;
  detectBudget: (data: any[]) => void;
  detectSuppliers: (data: any[]) => void;
}

/**
 * Hook to detect simple anomalies in financial data
 * @returns Object with anomaly detection result, loading state, and detection functions
 */
export const useSimpleAnomalyDetection = (): SimpleAnomalyDetectionState => {
  const [result, setResult] = useState<SimpleAnomalyDetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const detectBudget = useCallback((data: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const detectionResult = SimpleAnomalyDetectionService.detectBudgetAnomalies(data);
      setResult(detectionResult);
    } catch (err: any) {
      setError(err);
      console.error('Budget anomaly detection error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const detectSuppliers = useCallback((data: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const detectionResult = SimpleAnomalyDetectionService.detectSupplierAnomalies(data);
      setResult(detectionResult);
    } catch (err: any) {
      setError(err);
      console.error('Supplier anomaly detection error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    loading,
    error,
    detectBudget,
    detectSuppliers
  };
};
