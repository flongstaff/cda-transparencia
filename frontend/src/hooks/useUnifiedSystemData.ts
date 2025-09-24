/**
 * Unified System Data Hook - ELECTION READY
 * Provides access to ALL 9+ data services integrated
 * Real-time data for elections with complete transparency
 */

import { useState, useEffect, useCallback } from 'react';
import { unifiedDataIntegrationService, UnifiedSystemData } from '../services/UnifiedDataIntegrationService';

export interface UseUnifiedSystemDataReturn {
  // Complete system data from all services
  systemData: UnifiedSystemData | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Quick access to key data
  budget: any;
  contracts: any;
  documents: any;
  salaries: any;
  moneyFlow: any;

  // System health
  systemHealth: any;
  servicesActive: number;
  totalServices: number;
  dataIntegrity: number;

  // Actions
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export const useUnifiedSystemData = () => {
  const [systemData, setSystemData] = useState<UnifiedSystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Load complete system data
  const loadSystemData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 LOADING COMPLETE ELECTION DATA SYSTEM...');

      // Load all data sources in parallel
      const [data, health] = await Promise.all([
        unifiedDataIntegrationService.getCachedSystemData(),
        unifiedDataIntegrationService.getSystemHealth()
      ]);

      setSystemData(data);
      setSystemHealth(health);

      console.log('✅ ELECTION SYSTEM READY:', {
        services: `${health.servicesActive}/${health.totalServices}`,
        integrity: `${health.dataIntegrity}%`,
        status: health.status
      });

    } catch (err: any) {
      console.error('❌ SYSTEM LOAD FAILED:', err);
      setError(err.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadSystemData();
  }, [loadSystemData]);

  // Clear all caches
  const clearCache = useCallback(() => {
    unifiedDataIntegrationService.clearCache();
    loadSystemData(); // Reload after clearing cache
  }, [loadSystemData]);

  // Quick access to key data with fallbacks
  const budget = systemData?.repository?.budget || systemData?.master?.structured?.budget || {};
  const contracts = systemData?.repository?.contracts || systemData?.master?.structured?.contracts || {};
  const documents = systemData?.repository?.documents || systemData?.master?.documents || { all: [], byYear: {}, byCategory: {} };
  const salaries = systemData?.master?.structured?.salaries || {};
  const moneyFlow = systemData?.repository?.moneyFlow || {};

  return {
    systemData,
    loading,
    error,

    // Quick access
    budget,
    contracts,
    documents,
    salaries,
    moneyFlow,

    // System health
    systemHealth,
    servicesActive: systemHealth?.servicesActive || 0,
    totalServices: systemHealth?.totalServices || 9,
    dataIntegrity: systemHealth?.dataIntegrity || 0,

    // Actions
    refetch: loadSystemData,
    clearCache
  };
};

export default useUnifiedSystemData;