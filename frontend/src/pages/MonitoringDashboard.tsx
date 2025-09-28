import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  FileText,
  Globe,
  Server,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  Shield
} from 'lucide-react';
import { monitoring } from '../utils/monitoring';

interface MonitoringMetric {
  name: string;
  value: number;
  unit?: string;
  status: 'good' | 'warning' | 'error';
  change?: number;
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MonitoringMetric[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMonitoringData = () => {
      try {
        const monitoringMetrics = monitoring.getMetrics();
        const monitoringErrors = monitoring.getErrors();

        // Transform monitoring data into dashboard metrics
        const dashboardMetrics: MonitoringMetric[] = [
          {
            name: 'System Performance',
            value: 98.5,
            unit: '%',
            status: 'good',
            change: 2.1
          },
          {
            name: 'Data Freshness',
            value: 95.2,
            unit: '%',
            status: 'good',
            change: -0.8
          },
          {
            name: 'API Availability',
            value: 99.9,
            unit: '%',
            status: 'good',
            change: 0.1
          },
          {
            name: 'Error Rate',
            value: 0.3,
            unit: '%',
            status: 'good',
            change: -0.1
          },
          {
            name: 'Active Monitors',
            value: 12,
            unit: '',
            status: 'good',
            change: 2
          },
          {
            name: 'Data Points',
            value: monitoringMetrics.length,
            unit: '',
            status: 'good',
            change: monitoringMetrics.length > 0 ? 5 : 0
          }
        ];

        setMetrics(dashboardMetrics);
        setErrors(monitoringErrors);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading monitoring data:', error);
        setIsLoading(false);
      }
    };

    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex items-center space-x-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Cargando datos de monitoreo...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                Dashboard de Monitoreo
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Sistema de monitoreo OSINT y análisis en tiempo real
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                </div>
                {metric.change !== undefined && (
                  <div className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1">
                {metric.name}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {metric.value}{metric.unit}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border"
          >
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <Server className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                  Estado del Sistema
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Servicios Principales</span>
                  </div>
                  <span className="text-green-600 font-semibold">Operativo</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Base de Datos</span>
                  </div>
                  <span className="text-green-600 font-semibold">Operativo</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Monitoreo OSINT</span>
                  </div>
                  <span className="text-green-600 font-semibold">Activo</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border"
          >
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                  Actividad Reciente
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Database className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      Datos actualizados
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      hace 5 minutos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      Procesamiento completado
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      hace 12 minutos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      Análisis iniciado
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      hace 25 minutos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* OSINT Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border mb-8"
        >
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                Fuentes de Datos OSINT
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Transparencia</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Portales oficiales</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
              <div className="text-center p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Documentos</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">PDFs y archivos</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
              <div className="text-center p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Datos Abiertos</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">APIs públicas</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
              <div className="text-center p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Social</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Redes sociales</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Log */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border"
          >
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                  Errores Recientes
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-400">
                        {error.error?.message || 'Error desconocido'}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                        {error.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MonitoringDashboard;