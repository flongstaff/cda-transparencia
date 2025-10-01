/**
 * MonitoringDashboard Component
 * Main dashboard for monitoring portal performance and compliance
 * Following AAIP guidelines for transparency and data protection
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Shield, AlertTriangle, CheckCircle, Clock, Activity, TrendingUp, TrendingDown, Minus, Users, Search, Download, Eye, FileText, Server, Wifi, Zap, Database, HardHat, Heart } from 'lucide-react';
import { monitoringService, MonitoringDashboardData, KpiValue, Alert } from '../services/monitoringService';
import KpiCards from '../components/KpiCards';
import ComplianceChart from '../components/ComplianceChart';
import DataQualityReport from '../components/DataQualityReport';
import UserEngagementChart from '../components/UserEngagementChart';
import RealtimeMetrics from '../components/RealtimeMetrics';

const MonitoringDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<MonitoringDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh
    const interval = setInterval(() => {
      loadDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await monitoringService.getDashboardOverview();
      setDashboardData(data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del panel de monitoreo');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Cargando panel de monitoreo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background">
        <div className="max-w-md mx-auto p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sin datos disponibles</h2>
          <p className="text-gray-600 dark:text-gray-400">No se pudieron cargar los datos del panel de monitoreo</p>
        </div>
      </div>
    );
  }

  // Extract key metrics for quick view
  const systemStatus = dashboardData.systemStatus;
  const kpiSummary = dashboardData.kpiSummary;
  const complianceStatus = dashboardData.complianceStatus;
  const recentAlerts = dashboardData.recentAlerts;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                Panel de Monitoreo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Estado del sistema y cumplimiento con estándares de transparencia
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {lastRefreshed.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
          
          {/* AAIP Compliance Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-1.5 rounded-full">
              <Shield className="h-4 w-4 mr-1" />
              Cumple AAIP
            </div>
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1.5 rounded-full">
              <Shield className="h-4 w-4 mr-1" />
              ITA Metodología
            </div>
            <div className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm px-3 py-1.5 rounded-full">
              <Shield className="h-4 w-4 mr-1" />
              Privacidad Garantizada
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Estado del Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponibilidad</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {systemStatus.uptime}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  systemStatus.overallStatus === 'operational' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {systemStatus.overallStatus === 'operational' ? (
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tiempo de actividad del sistema
              </p>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Respuesta</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {systemStatus.responseTime}ms
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tiempo promedio de respuesta
              </p>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios Activos</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {systemStatus.activeUsers}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Sesiones activas en el portal
              </p>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado API</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1 capitalize">
                    {systemStatus.apiStatus}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  systemStatus.apiStatus === 'operational' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  <Wifi className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Estado de los servicios API
              </p>
            </div>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Indicadores de Rendimiento Clave (KPI)
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Salud general: {kpiSummary.overallHealth.score}%
            </div>
          </div>
          
          <KpiCards kpis={kpiSummary.kpis} />
        </div>

        {/* Compliance Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Estado de Cumplimiento
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Cumplimiento General</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Puntaje de cumplimiento</span>
                  <span className="font-medium">{complianceStatus.overallCompliance.score}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${complianceStatus.overallCompliance.score}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Criterios cumplidos</span>
                  <span className="font-medium">{complianceStatus.overallCompliance.compliantCriteria} / {complianceStatus.overallCompliance.totalCriteria}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estado general</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    complianceStatus.overallCompliance.status === 'compliant' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : complianceStatus.overallCompliance.status === 'partially-compliant'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  }`}>
                    {complianceStatus.overallCompliance.status === 'compliant' ? 'Cumplido' : 
                     complianceStatus.overallCompliance.status === 'partially-compliant' ? 'Parcialmente cumplido' : 'No cumplido'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Áreas de Cumplimiento</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">AAIP</span>
                    <span className="font-medium">
                      {complianceStatus.aaipCompliance.overallCompliant ? 'Cumplido' : 'No cumplido'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        complianceStatus.aaipCompliance.overallCompliant 
                          ? 'bg-green-600' 
                          : 'bg-red-600'
                      }`} 
                      style={{ width: complianceStatus.aaipCompliance.overallCompliant ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Protección de Datos</span>
                    <span className="font-medium">
                      {complianceStatus.dataProtectionCompliance.overallCompliant ? 'Cumplido' : 'No cumplido'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        complianceStatus.dataProtectionCompliance.overallCompliant 
                          ? 'bg-green-600' 
                          : 'bg-red-600'
                      }`} 
                      style={{ width: complianceStatus.dataProtectionCompliance.overallCompliant ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Monitoreo</span>
                    <span className="font-medium">
                      {complianceStatus.monitoring.overallCompliant ? 'Cumplido' : 'No cumplido'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        complianceStatus.monitoring.overallCompliant 
                          ? 'bg-green-600' 
                          : 'bg-red-600'
                      }`} 
                      style={{ width: complianceStatus.monitoring.overallCompliant ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Alertas Recientes
            </h2>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-dark-border">
                {recentAlerts.slice(0, 5).map((alert) => (
                  <li key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-surface-alt">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        alert.level === 'critical' 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : alert.level === 'warning' 
                            ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                            : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {alert.level === 'critical' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : alert.level === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.message}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            hace {alert.age} minutos
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Métrica: {alert.metric} | Valor: {alert.value} | Umbral: {alert.threshold}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              Calidad de Datos
            </h2>
            <DataQualityReport />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Participación Ciudadana
            </h2>
            <UserEngagementChart />
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Métricas en Tiempo Real
          </h2>
          <RealtimeMetrics />
        </div>

        {/* AAIP Compliance Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Cumplimiento con Directrices AAIP
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Este panel de monitoreo se adhiere a las directrices de la Agencia de Acceso a la Información Pública (AAIP) 
            y sigue la metodología del Índice de Transparencia Activa (ITA).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Evaluación continua de indicadores de transparencia
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Reportes automáticos de cumplimiento
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Protección de datos personales garantizada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;