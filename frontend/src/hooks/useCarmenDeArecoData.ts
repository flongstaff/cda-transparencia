/**
 * Custom hook for accessing Carmen de Areco data
 * Provides reactive data access for Carmen de Areco transparency and licitaciones data
 */

import { useState, useEffect, useCallback } from 'react';
import { carmenDeArecoService, CarmenTransparencyData, CarmenLicitacionesData } from '../services/CarmenDeArecoService';

export interface CarmenDataHook {
  transparencyData: CarmenTransparencyData | null;
  licitacionesData: CarmenLicitacionesData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for accessing Carmen de Areco data
 * @returns CarmenDataHook - Object containing data, loading state, error state, and refresh function
 */
export const useCarmenDeArecoData = (): CarmenDataHook => {
  const [transparencyData, setTransparencyData] = useState<CarmenTransparencyData | null>(null);
  const [licitacionesData, setLicitacionesData] = useState<CarmenLicitacionesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all Carmen de Areco data
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch transparency data
      const transparencyResponse = await carmenDeArecoService.getTransparencyData();
      
      if (transparencyResponse.success && transparencyResponse.data) {
        setTransparencyData(transparencyResponse.data);
      } else if (transparencyResponse.error) {
        console.warn('Transparency data fetch warning:', transparencyResponse.error);
      }

      // Fetch licitaciones data
      const licitacionesResponse = await carmenDeArecoService.getLicitacionesData();
      
      if (licitacionesResponse.success && licitacionesResponse.data) {
        setLicitacionesData(licitacionesResponse.data);
      } else if (licitacionesResponse.error) {
        console.warn('Licitaciones data fetch warning:', licitacionesResponse.error);
      }

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    transparencyData,
    licitacionesData,
    loading,
    error,
    refreshData
  };
};

export default useCarmenDeArecoData;