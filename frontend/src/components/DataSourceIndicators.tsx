/**
 * DataSourceIndicators Component
 * 
 * Displays real-time indicators for all external data sources
 * showing their status, reliability, and coverage.
 */

import React, { useState, useEffect } from 'react';
import { dataSourceIndicatorsService, DataSourceIndicator } from '../services/DataSourceIndicatorsService';

interface DataSourceIndicatorsProps {
  className?: string;
  showSummary?: boolean;
  showDetailed?: boolean;
  refreshInterval?: number; // in seconds
}

const DataSourceIndicators: React.FC<DataSourceIndicatorsProps> = ({
  className = '',
  showSummary = true,
  showDetailed = false,
  refreshInterval = 300 // 5 minutes
}) => {
  const [indicators, setIndicators] = useState<DataSourceIndicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Load initial indicators
    loadIndicators();

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      loadIndicators();
    }, refreshInterval * 1000);

    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval]);

  const loadIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const indicators = await dataSourceIndicatorsService.generateIndicators();
      setIndicators(indicators);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to load data source indicators');
      console.error('Error loading indicators:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: DataSourceIndicator['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'slow': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: DataSourceIndicator['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'slow': return 'Lento';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 0.8) return 'text-green-600';
    if (reliability >= 0.6) return 'text-yellow-600';
    if (reliability >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 0.8) return 'text-green-600';
    if (coverage >= 0.6) return 'text-yellow-600';
    if (coverage >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading && indicators.length === 0) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando indicadores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onlineCount = indicators.filter(i => i.status === 'online').length;
  const slowCount = indicators.filter(i => i.status === 'slow').length;
  const offlineCount = indicators.filter(i => i.status === 'offline').length;
  const errorCount = indicators.filter(i => i.status === 'error').length;
  const avgReliability = indicators.length > 0 
    ? (indicators.reduce((sum, i) => sum + i.reliability, 0) / indicators.length).toFixed(2)
    : '0.00';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Indicadores de Fuentes de Datos</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {lastUpdated}
        </div>
      </div>

      {/* Summary */}
      {showSummary && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{slowCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Lentas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{offlineCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Offline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-800">{errorCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Errores</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getReliabilityColor(parseFloat(avgReliability))}`}>
                {avgReliability}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Confiabilidad</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed List */}
      {showDetailed && (
        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {indicators.map((indicator) => (
              <li key={indicator.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-3 h-3 rounded-full ${getStatusColor(indicator.status)}`}></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{indicator.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Última actualización: {new Date(indicator.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getReliabilityColor(indicator.reliability)}`}>
                        {(indicator.reliability * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Confiabilidad</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getCoverageColor(indicator.coverage)}`}>
                        {(indicator.coverage * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cobertura</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {indicator.responseTime}ms
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Respuesta</p>
                    </div>
                  </div>
                </div>
                
                {/* Status and Notes */}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    indicator.status === 'online' ? 'bg-green-100 text-green-800' :
                    indicator.status === 'slow' ? 'bg-yellow-100 text-yellow-800' :
                    indicator.status === 'offline' ? 'bg-red-100 text-red-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusText(indicator.status)}
                  </span>
                  
                  {indicator.notes && indicator.notes.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {indicator.notes.join(', ')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        {indicators.length} fuentes de datos monitoreadas • 
        {indicators.filter(i => i.status === 'online').length} fuentes activas
      </div>
    </div>
  );
};

export default DataSourceIndicators;