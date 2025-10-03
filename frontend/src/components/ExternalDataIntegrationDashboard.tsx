/**
 * External Data Integration Dashboard
 * 
 * Main dashboard component that displays all external data integration
 * components including data source indicators, cache stats, and health metrics.
 */

import React, { useState, useEffect } from 'react';
import { comprehensiveExternalDataIntegrationService } from '../services/ComprehensiveExternalDataIntegrationService';
import { dataSourceIndicatorsService } from '../services/DataSourceIndicatorsService';
import { dataCachingService } from '../services/DataCachingService';
import DataSourceIndicators from '../components/DataSourceIndicators';
import { ExternalDataResponse } from '../services/ExternalAPIsService';
import { NormalizedDataPoint } from '../services/DataNormalizationService';

interface DashboardStats {
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalDataPoints: number;
  cacheHitRatio: number;
  averageResponseTime: number;
  lastUpdated: string;
}

const ExternalDataIntegrationDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get dashboard statistics
      const healthMetrics = await dataSourceIndicatorsService.getHealthMetrics();
      const cacheStats = dataCachingService.getStats();
      const cacheHitRatio = dataCachingService.getHitRatio();

      // Get some sample data to estimate counts
      const sampleData = await comprehensiveExternalDataIntegrationService.fetchAllIntegratedData();

      setStats({
        totalSources: sampleData.summary.totalSources,
        successfulSources: sampleData.summary.successfulSources,
        failedSources: sampleData.summary.failedSources,
        totalDataPoints: sampleData.summary.totalDataPoints,
        cacheHitRatio,
        averageResponseTime: 0, // Would need to calculate from individual responses
        lastUpdated: sampleData.summary.lastUpdated
      });

      setCacheStats(cacheStats);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Refresh all data
      await comprehensiveExternalDataIntegrationService.refreshAllData();
      
      // Reload dashboard data
      await loadData();
    } catch (err) {
      setError('Failed to refresh data');
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearCache = () => {
    try {
      comprehensiveExternalDataIntegrationService.clearAllCaches();
      setCacheStats(dataCachingService.getStats());
    } catch (err) {
      setError('Failed to clear cache');
      console.error('Error clearing cache:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Cargando panel de integración de datos externos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Integración de Datos Externos</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitoreo y gestión de todas las fuentes de datos externas del portal de transparencia
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar Datos
                  </>
                )}
              </button>
              <button
                onClick={handleClearCache}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar Caché
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-md">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Fuentes Totales</dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalSources}</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 p-3 rounded-md">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Fuentes Activas</dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.successfulSources}</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 p-3 rounded-md">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Puntos de Datos</dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalDataPoints.toLocaleString()}</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md">
                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Éxito del Caché</dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(stats.cacheHitRatio * 100).toFixed(1)}%
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Source Indicators */}
        <div className="mb-8">
          <DataSourceIndicators 
            className="mb-6"
            showDetailed={true}
            refreshInterval={300}
          />
        </div>

        {/* Cache Statistics */}
        {cacheStats && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Estadísticas del Caché</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Entradas en Caché</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {cacheStats.entries}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Tamaño Total</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {(cacheStats.totalSize / (1024 * 1024)).toFixed(2)} MB
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Aciertos</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {cacheStats.hits}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Panel de integración de datos externos - Última actualización: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ExternalDataIntegrationDashboard;