/***
 * Time-Series Analysis Page for Carmen de Areco Transparency Portal
 * Integrates time-series analysis components with interactive features
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart as LineChartIcon,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  AreaChart,
  Zap,
  Filter,
  Search,
  Sliders,
  Settings,
  CalendarRange,
  Target,
  DollarSign,
  Users,
  Layers
} from 'lucide-react';
import { useDashboardData } from '../hooks/useUnifiedData';
import { YearSelector } from '../components/common/YearSelector';
import { DataSourcesIndicator } from '../components/common/DataSourcesIndicator';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Import time-series components
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import TimeSeriesAnomalyChart from '../components/charts/TimeSeriesAnomalyChart';
import MultiYearRevenueChart from '../components/charts/MultiYearRevenueChart';
import QuarterlyExecutionChart from '../components/charts/QuarterlyExecutionChart';
import YearlyComparisonChart from '../components/charts/YearlyComparisonChart';
import RevenueReportChart from '../components/charts/RevenueReportChart';
import ExpenditureReportChart from '../components/charts/ExpenditureReportChart';
import DebtReportChart from '../components/charts/DebtReportChart';
import FiscalBalanceReportChart from '../components/charts/FiscalBalanceReportChart';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import ImprovedBudgetExecutionChart from '../components/charts/ImprovedBudgetExecutionChart';

interface TimeSeriesAnalysisPageProps {
  initialYear?: number;
  municipality?: string;
}

const TimeSeriesAnalysisPage: React.FC<TimeSeriesAnalysisPageProps> = ({
  initialYear = new Date().getFullYear(),
  municipality = 'Carmen de Areco'
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenditure' | 'debt' | 'balance'>('revenue');
  const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [anomalyDetection, setAnomalyDetection] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Use unified data service
  const {
    data: dashboardData,
    externalData,
    sources,
    activeSources,
    loading,
    error,
    refetch,
    availableYears,
    liveDataEnabled
  } = useDashboardData(selectedYear);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Time range options
  const timeRangeOptions = [
    { id: 'monthly', label: 'Mensual' },
    { id: 'quarterly', label: 'Trimestral' },
    { id: 'yearly', label: 'Anual' }
  ];

  // Chart type options
  const chartTypeOptions = [
    { id: 'line', label: 'Línea' },
    { id: 'bar', label: 'Barras' },
    { id: 'area', label: 'Área' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <LineChartIcon className="w-8 h-8 mr-3 text-blue-600" />
                Análisis de Series Temporales - {municipality}
              </h1>
              <p className="mt-2 text-gray-600">
                Evolución histórica de indicadores financieros y detectación de anomalías
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <YearSelector
                selectedYear={selectedYear}
                availableYears={availableYears}
                onChange={handleYearChange}
                label="Año de consulta"
                className="min-w-[200px]"
              />
            </div>
          </div>

          {/* Data Sources Indicator */}
          <div className="mt-6">
            <DataSourcesIndicator
              activeSources={activeSources}
              externalData={externalData}
              loading={loading}
              className="w-full"
            />
          </div>

          {/* Search and Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en series temporales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <CalendarRange className="h-5 w-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="flex-1 pl-3 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="flex-1 pl-3 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {chartTypeOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
              <span className="text-sm text-gray-700">Detección de Anomalías</span>
              <button
                onClick={() => setAnomalyDetection(!anomalyDetection)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  anomalyDetection ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    anomalyDetection ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'revenue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ingresos
            </button>
            <button
              onClick={() => setActiveTab('expenditure')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'expenditure'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Gastos
            </button>
            <button
              onClick={() => setActiveTab('debt')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'debt'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Deuda
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'balance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Target className="h-4 w-4 mr-2" />
              Balance Fiscal
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'revenue' && 'Serie Temporal de Ingresos'}
              {activeTab === 'expenditure' && 'Serie Temporal de Gastos'}
              {activeTab === 'debt' && 'Serie Temporal de Deuda'}
              {activeTab === 'balance' && 'Serie Temporal de Balance Fiscal'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'revenue' && 'Evolución histórica de ingresos municipales'}
              {activeTab === 'expenditure' && 'Evolución histórica de gastos municipales'}
              {activeTab === 'debt' && 'Evolución histórica de deuda municipal'}
              {activeTab === 'balance' && 'Análisis de balance fiscal a lo largo del tiempo'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="h-4 w-4 mr-1" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Cargando series temporales...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error en el Sistema</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {!loading && !error && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                {/* Revenue Time Series Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Serie Temporal de Ingresos
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Eye className="h-3 w-3 mr-1" />
                          Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <ErrorBoundary
                      fallback={(error) => (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-80 flex items-center justify-center">
                          <p className="text-sm text-red-600">Error al cargar la serie temporal: {error?.message || 'Gráfico no disponible'}</p>
                        </div>
                      )}
                    >
                      <TimeSeriesChart 
                        type="Revenue_by_Source"
                        year={selectedYear}
                        dataKey={timeRange === 'monthly' ? 'month' : timeRange === 'quarterly' ? 'quarter' : 'year'}
                        valueKey="revenue"
                        showAnomalies={anomalyDetection}
                        height={400}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Multi-Year Revenue Comparison */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                        Comparación Multi-Año
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver datos
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <ErrorBoundary
                      fallback={(error) => (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-80 flex items-center justify-center">
                          <p className="text-sm text-red-600">Error al cargar la comparación: {error?.message || 'Gráfico no disponible'}</p>
                        </div>
                      )}
                    >
                      <MultiYearRevenueChart 
                        selectedYear={selectedYear} 
                        height={400}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Anomaly Detection */}
                {anomalyDetection && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <Activity className="h-5 w-5 mr-2 text-orange-600" />
                          Detección de Anomalías
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Reportar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary
                        fallback={(error) => (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-80 flex items-center justify-center">
                            <p className="text-sm text-red-600">Error al cargar la detección de anomalías: {error?.message || 'Gráfico no disponible'}</p>
                          </div>
                        )}
                      >
                        <TimeSeriesAnomalyChart 
                          years={[selectedYear - 2, selectedYear - 1, selectedYear]} 
                          height={400}
                        />
                      </ErrorBoundary>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'expenditure' && (
              <div className="space-y-6">
                {/* Expenditure Time Series Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                        Serie Temporal de Gastos
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Eye className="h-4 w-4 mr-1" />
                          Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <ErrorBoundary
                      fallback={(error) => (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-80 flex items-center justify-center">
                          <p className="text-sm text-red-600">Error al cargar la serie temporal de gastos: {error?.message || 'Gráfico no disponible'}</p>
                        </div>
                      )}
                    >
                      <TimeSeriesChart 
                        type="Expenditure_by_Program"
                        year={selectedYear}
                        dataKey={timeRange === 'monthly' ? 'month' : timeRange === 'quarterly' ? 'quarter' : 'year'}
                        valueKey="expenditure"
                        showAnomalies={anomalyDetection}
                        height={400}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Quarterly Execution Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                        Ejecución Trimestral
                      </h3>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary
                        fallback={(error) => (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-60 flex items-center justify-center">
                            <p className="text-sm text-red-600">Error al cargar la ejecución trimestral: {error?.message || 'Gráfico no disponible'}</p>
                          </div>
                        )}
                      >
                        <QuarterlyExecutionChart selectedYear={selectedYear} />
                      </ErrorBoundary>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                        Comparación Anual
                      </h3>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary
                        fallback={(error) => (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-60 flex items-center justify-center">
                            <p className="text-sm text-red-600">Error al cargar la comparación anual: {error?.message || 'Gráfico no disponible'}</p>
                          </div>
                        )}
                      >
                        <YearlyComparisonChart selectedYear={selectedYear} />
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>

                {/* Expenditure Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-teal-600" />
                        Análisis de Gastos
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Download className="h-3 w-3 mr-1" />
                          Exportar
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <ErrorBoundary
                      fallback={(error) => (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-80 flex items-center justify-center">
                          <p className="text-sm text-red-600">Error al cargar el análisis de gastos: {error?.message || 'Gráfico no disponible'}</p>
                        </div>
                      )}
                    >
                      <ExpenditureReportChart selectedYear={selectedYear} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'debt' && (
              <div className="space-y-6">
                {/* Debt Time Series Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                        Serie Temporal de Deuda
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Eye className="h-4 w-4 mr-1" />
                          Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <ErrorBoundary
                      fallback={(error) => (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-80 flex items-center justify-center">
                          <p className="text-sm text-red-600">Error al cargar la serie temporal de deuda: {error?.message || 'Gráfico no disponible'}</p>
                        </div>
                      )}
                    >
                      <TimeSeriesChart 
                        type="Debt_by_Source"
                        year={selectedYear}
                        dataKey={timeRange === 'monthly' ? 'month' : timeRange === 'quarterly' ? 'quarter' : 'year'}
                        valueKey="debt"
                        showAnomalies={anomalyDetection}
                        height={400}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Debt Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                        Análisis de Deuda
                      </h3>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary
                        fallback={(error) => (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-60 flex items-center justify-center">
                            <p className="text-sm text-red-600">Error al cargar el análisis de deuda: {error?.message || 'Gráfico no disponible'}</p>
                          </div>
                        )}
                      >
                        <DebtReportChart selectedYear={selectedYear} />
                      </ErrorBoundary>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-green-600" />
                        Indicadores de Deuda
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-800">Deuda Total</p>
                          <p className="text-lg font-bold text-blue-900">ARS 450M</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-800">Deuda per cápita</p>
                          <p className="text-lg font-bold text-green-900">ARS 12,500</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">Relación Deuda/Ingreso</p>
                          <p className="text-lg font-bold text-yellow-900">45%</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-purple-800">Vencimiento Promedio</p>
                          <p className="text-lg font-bold text-purple-900">4.2 años</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'balance' && (
              <div className="space-y-6">
                {/* Fiscal Balance Time Series Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-green-600" />
                        Serie Temporal de Balance Fiscal
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Eye className="h-4 w-4 mr-1" />
                          Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <ErrorBoundary
                      fallback={(error) => (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-80 flex items-center justify-center">
                          <p className="text-sm text-red-600">Error al cargar la serie temporal de balance fiscal: {error?.message || 'Gráfico no disponible'}</p>
                        </div>
                      )}
                    >
                      <TimeSeriesChart 
                        type="Fiscal_Balance"
                        year={selectedYear}
                        dataKey={timeRange === 'monthly' ? 'month' : timeRange === 'quarterly' ? 'quarter' : 'year'}
                        valueKey="balance"
                        showAnomalies={anomalyDetection}
                        height={400}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Fiscal Balance Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                        Balance Fiscal Anual
                      </h3>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary
                        fallback={(error) => (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-60 flex items-center justify-center">
                            <p className="text-sm text-red-600">Error al cargar el balance fiscal anual: {error?.message || 'Gráfico no disponible'}</p>
                          </div>
                        )}
                      >
                        <FiscalBalanceReportChart selectedYear={selectedYear} />
                      </ErrorBoundary>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-orange-600" />
                        Indicadores Clave
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-800">Balance Fiscal</p>
                          <p className="text-lg font-bold text-blue-900">ARS 25M</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-800">Tasa de Cobertura</p>
                          <p className="text-lg font-bold text-green-900">92%</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">Liquidez</p>
                          <p className="text-lg font-bold text-yellow-900">ARS 120M</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-purple-800">Fiscal Sustainability</p>
                          <p className="text-lg font-bold text-purple-900">Stable</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Series Temporales</h3>
              <p className="text-gray-600 text-sm">
                Visualización histórica de indicadores financieros con detección de anomalías y comparaciones temporales.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Series</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                  <span>Ingresos por Fuente</span>
                </li>
                <li className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                  <span>Gastos por Programa</span>
                </li>
                <li className="flex items-center">
                  <DollarSign className="h-4 w-4 text-yellow-600 mr-2" />
                  <span>Deuda Pública</span>
                </li>
                <li className="flex items-center">
                  <Target className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Balance Fiscal</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    <span>Exportar datos históricos</span>
                  </button>
                </li>
                <li>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>Reporte de anomalías</span>
                  </button>
                </li>
                <li>
                  <a href="/reports" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Ver informes</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 Análisis de Series Temporales - {municipality}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrap with error boundary for production safety
const TimeSeriesAnalysisPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">
                  Error al Cargar el Análisis de Series Temporales
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Ocurrió un error al cargar el análisis de series temporales. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 p-2 rounded">
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
      <TimeSeriesAnalysisPage />
    </ErrorBoundary>
  );
};

export default TimeSeriesAnalysisPageWithErrorBoundary;