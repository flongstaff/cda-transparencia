/**
 * RealtimeMetrics Component
 * Displays real-time system performance and user engagement metrics
 * Following AAIP guidelines for transparency and data protection
 */

import React, { useState, useEffect } from 'react';
import { Activity, Users, Zap, Database, Server, Wifi, Clock, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { monitoringService } from '../services/monitoringService';

interface RealtimeMetricsProps {
  refreshInterval?: number; // in milliseconds
}

const RealtimeMetrics: React.FC<RealtimeMetricsProps> = ({ refreshInterval = 5000 }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch real-time metrics
        // For now, we'll simulate real-time data
        const simulatedMetrics = {
          activeUsers: Math.floor(Math.random() * 50) + 10,
          requestsPerSecond: Math.random() * 100 + 50,
          responseTime: Math.random() * 200 + 100,
          uptime: 99.9 + (Math.random() * 0.1),
          cpuUsage: Math.random() * 50 + 20,
          memoryUsage: Math.random() * 60 + 30,
          networkTraffic: Math.random() * 1000 + 500,
          databaseConnections: Math.floor(Math.random() * 20) + 5
        };
        
        setMetrics(simulatedMetrics);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error loading real-time metrics:', err);
        setError('Error al cargar métricas en tiempo real');
      } finally {
        setLoading(false);
      }
    };

    // Load initial metrics
    loadMetrics();

    // Set up interval for refreshing metrics
    const interval = setInterval(loadMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading && !metrics) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-700 dark:text-gray-300">Cargando métricas en tiempo real...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sin métricas disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No se pudieron cargar las métricas en tiempo real
          </p>
        </div>
      </div>
    );
  }

  // Get trend indicators
  const getTrendIcon = (value: number, isPositiveGood: boolean = true) => {
    if (value > 0 && isPositiveGood) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (value < 0 && !isPositiveGood) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    } else if (value > 0 && !isPositiveGood) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (value < 0 && isPositiveGood) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Métricas en Tiempo Real
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Estado actual del sistema y participación ciudadana
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Actualizado: {lastUpdated.toLocaleTimeString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Users */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Usuarios Activos</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {metrics.activeUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm">
              {getTrendIcon(5, true)}
              <span className="text-blue-700 dark:text-blue-300 ml-1">+5 desde hace 1 min</span>
            </div>
          </div>

          {/* Requests Per Second */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-5 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Solicitudes/Seg</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {metrics.requestsPerSecond.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm">
              {getTrendIcon(-2.3, false)}
              <span className="text-green-700 dark:text-green-300 ml-1">-2.3% vs promedio</span>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Tiempo Respuesta</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {Math.round(metrics.responseTime)}<span className="text-lg">ms</span>
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm">
              {getTrendIcon(15, false)}
              <span className="text-purple-700 dark:text-purple-300 ml-1">+15ms vs promedio</span>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30 rounded-xl p-5 border border-teal-200 dark:border-teal-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-800 dark:text-teal-200">Disponibilidad</p>
                <p className="text-3xl font-bold text-teal-900 dark:text-teal-100 mt-1">
                  {metrics.uptime.toFixed(3)}<span className="text-lg">%</span>
                </p>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                <Server className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm">
              {getTrendIcon(0.001, true)}
              <span className="text-teal-700 dark:text-teal-300 ml-1">+0.001% hoy</span>
            </div>
          </div>
        </div>

        {/* System Performance Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU Usage */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                  {metrics.cpuUsage.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-dark-surface-alt rounded-full">
                <Server className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memoria</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                  {metrics.memoryUsage.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-dark-surface-alt rounded-full">
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Network Traffic */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Red</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                  {Math.round(metrics.networkTraffic)}<span className="text-sm">KB/s</span>
                </p>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-dark-surface-alt rounded-full">
                <Wifi className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, metrics.networkTraffic / 10)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Database Connections */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conexiones DB</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                  {metrics.databaseConnections}
                </p>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-dark-surface-alt rounded-full">
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, metrics.databaseConnections * 5)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-8 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Rendimiento del Sistema (últimos 5 minutos)
            </h4>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Actualizado cada {refreshInterval / 1000} segundos
            </div>
          </div>
          
          {/* Simulated chart - in a real implementation, this would show actual performance data */}
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Gráfico de rendimiento del sistema
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                (Simulación de datos en tiempo real)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-dark-surface-alt border-t border-gray-200 dark:border-dark-border text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Sistema operativo</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <span>Monitoreo activo</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-1 text-green-500" />
            <span>{metrics.activeUsers} usuarios conectados ahora</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMetrics;