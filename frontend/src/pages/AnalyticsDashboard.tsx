/***
 * Analytics Dashboard Page
 * Comprehensive data analytics dashboard integrating all analysis components
 * Provides unified access to financial, operational, and compliance analytics
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  FileText,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  Database,
  Activity,
  Eye
} from 'lucide-react';

// Import analysis components
import BudgetAnalysisChart from '@components/charts/BudgetAnalysisChart';
import DebtAnalysisChart from '@components/charts/DebtAnalysisChart';
import TreasuryAnalysisChart from '@components/charts/TreasuryAnalysisChart';
import ContractAnalysisChart from '@components/charts/ContractAnalysisChart';
import SalaryAnalysisChart from '@components/charts/SalaryAnalysisChart';
import DocumentAnalysisChart from '@components/charts/DocumentAnalysisChart';

// Import data services
import { useMasterData } from '../hooks/useMasterData';
import { useDashboardData } from '../hooks/useUnifiedData';
import { DataSourcesIndicator } from '@components/common/DataSourcesIndicator';
import YearSelector from '@components/common/YearSelector';
import ErrorBoundary from '@components/common/ErrorBoundary';

// Define types
interface AnalyticsSummary {
  total_analyses: number;
  successful_analyses: number;
  failed_analyses: number;
  last_updated: string;
  data_sources: string[];
}

interface AnalysisMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  icon: React.ReactNode;
  description: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'budget' | 'debt' | 'treasury' | 'contracts' | 'salaries' | 'documents'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Use unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    currentDebt,
    loading: legacyLoading,
    error: legacyError,
    totalDocuments,
    availableYears: legacyYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Use new UnifiedDataService with external APIs for analytics
  const {
    data: unifiedAnalyticsData,
    externalData,
    sources,
    activeSources,
    loading: unifiedLoading,
    error: unifiedError,
    refetch: unifiedRefetch,
    availableYears,
    liveDataEnabled
  } = useDashboardData(selectedYear);

  const loading = legacyLoading || unifiedLoading;
  const error = legacyError || unifiedError;

  // Calculate analytics summary
  const analyticsSummary = {
    total_analyses: 6,
    successful_analyses: activeSources.filter(source => source !== 'local').length,
    failed_analyses: 0,
    last_updated: new Date().toISOString(),
    data_sources: activeSources
  };

  // Analysis metrics
  const analysisMetrics: AnalysisMetric[] = [
    {
      id: 'budget',
      name: 'Análisis Presupuestario',
      value: currentBudget?.execution_rate || 0,
      unit: '%',
      trend: 'up',
      change: 2.5,
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Tasa de ejecución presupuestaria'
    },
    {
      id: 'debt',
      name: 'Análisis de Deuda',
      value: currentDebt?.total_debt ? (currentDebt.total_debt / 1000000).toFixed(1) : 0,
      unit: 'M',
      trend: 'down',
      change: -1.2,
      icon: <TrendingDown className="w-5 h-5" />,
      description: 'Deuda total en millones'
    },
    {
      id: 'contracts',
      name: 'Análisis de Contratos',
      value: currentContracts?.length || 0,
      unit: 'contratos',
      trend: 'up',
      change: 15,
      icon: <Building className="w-5 h-5" />,
      description: 'Contratos analizados'
    },
    {
      id: 'salaries',
      name: 'Análisis de Salarios',
      value: currentSalaries?.employeeCount || 0,
      unit: 'empleados',
      trend: 'stable',
      change: 0,
      icon: <Users className="w-5 h-5" />,
      description: 'Empleados analizados'
    }
  ];

  // Filter analysis metrics
  const filteredMetrics = analysisMetrics.filter(metric => 
    filterCategory === 'all' || metric.id === filterCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-dark-text-secondary">Cargando análisis de datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-dark-text-secondary">{error}</p>
          <button
            onClick={() => {
              refetch();
              unifiedRefetch();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                Panel de Análisis de Datos
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                Análisis completo de datos financieros, operativos y de cumplimiento para el municipio de Carmen de Areco.
                Integración con fuentes externas para análisis avanzados.
              </p>
              <div className="mt-3 flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-dark-text-tertiary">
                <span className="flex items-center">
                  <Database className="h-4 w-4 mr-1" />
                  {analyticsSummary.total_analyses} tipos de análisis
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {analyticsSummary.successful_analyses} fuentes activas
                </span>
                <span className="flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Datos en tiempo real
                </span>
              </div>
            </div>

            {/* Year Selector */}
            <div className="w-full md:w-auto">
              <YearSelector
                selectedYear={selectedYear}
                availableYears={availableYears}
                onChange={(year) => {
                  setSelectedYear(year);
                  switchYear(year);
                }}
                label="Año de Análisis"
              />
            </div>
          </div>
        </motion.div>

        {/* Data Sources Indicator */}
        <DataSourcesIndicator
          activeSources={activeSources}
          externalData={externalData}
          loading={unifiedLoading}
          className="mb-6"
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {filteredMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    metric.trend === 'up' ? 'bg-green-100 text-green-600' :
                    metric.trend === 'down' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {metric.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                      <span className="text-sm font-normal text-gray-500 dark:text-dark-text-tertiary ml-1">{metric.unit}</span>
                    </p>
                  </div>
                </div>
                <div className={`flex items-center text-sm ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> :
                   metric.trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> :
                   <Activity className="w-4 h-4 mr-1" />}
                  {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">{metric.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm mb-8">
          <nav className="flex border-b border-gray-200 dark:border-dark-border">
            {[
              { id: 'overview', label: 'Resumen General', icon: BarChart3 },
              { id: 'budget', label: 'Presupuesto', icon: DollarSign },
              { id: 'debt', label: 'Deuda', icon: TrendingDown },
              { id: 'treasury', label: 'Tesorería', icon: Building },
              { id: 'contracts', label: 'Contratos', icon: FileText },
              { id: 'salaries', label: 'Salarios', icon: Users },
              { id: 'documents', label: 'Documentos', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:text-dark-text-secondary hover:border-gray-300'
                  }`}
                  title={`Ver análisis de ${tab.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content based on view mode */}
        <div className="space-y-8">
          {viewMode === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Budget Analysis */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Análisis Presupuestario
                </h2>
                <BudgetAnalysisChart year={selectedYear} className="h-80" />
              </div>

              {/* Debt Analysis */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                  Análisis de Deuda
                </h2>
                <DebtAnalysisChart year={selectedYear} className="h-80" />
              </div>

              {/* Treasury Analysis */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  Análisis de Tesorería
                </h2>
                <TreasuryAnalysisChart year={selectedYear} className="h-80" />
              </div>

              {/* Contract Analysis */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Análisis de Contratos
                </h2>
                <ContractAnalysisChart year={selectedYear} className="h-80" />
              </div>
            </motion.div>
          )}

          {viewMode === 'budget' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Análisis Presupuestario Detallado
              </h2>
              <BudgetAnalysisChart year={selectedYear} className="h-96" />
            </motion.div>
          )}

          {viewMode === 'debt' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                Análisis de Deuda Detallado
              </h2>
              <DebtAnalysisChart year={selectedYear} className="h-96" />
            </motion.div>
          )}

          {viewMode === 'treasury' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Análisis de Tesorería Detallado
              </h2>
              <TreasuryAnalysisChart year={selectedYear} className="h-96" />
            </motion.div>
          )}

          {viewMode === 'contracts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Análisis de Contratos Detallado
              </h2>
              <ContractAnalysisChart year={selectedYear} className="h-96" />
            </motion.div>
          )}

          {viewMode === 'salaries' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-yellow-600" />
                Análisis de Salarios Detallado
              </h2>
              <SalaryAnalysisChart year={selectedYear} className="h-96" />
            </motion.div>
          )}

          {viewMode === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Análisis de Documentos Detallado
              </h2>
              <DocumentAnalysisChart year={selectedYear} className="h-96" />
            </motion.div>
          )}
        </div>

        {/* Additional Analytics Tools */}
        <div className="mt-8 bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Herramientas de Análisis Avanzado
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Visualización de Datos</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3">
                Explorar datos mediante gráficos interactivos y visualizaciones avanzadas.
              </p>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
                Explorar <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Download className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Exportación de Datos</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3">
                Descargar datos analizados en múltiples formatos para análisis externo.
              </p>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
                Exportar <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Search className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Búsqueda Inteligente</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3">
                Buscar patrones y tendencias en los datos utilizando IA y análisis predictivo.
              </p>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
                Buscar <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const AnalyticsDashboardWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                      {error.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md"
                  >
                    Recargar
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <AnalyticsDashboard />
    </ErrorBoundary>
  );
};

export default AnalyticsDashboardWithErrorBoundary;