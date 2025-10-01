/**
 * Treasury Page - Unified Data Integration
 * Displays treasury data from all sources: CSV, JSON, PDFs
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  BarChart3,
  DollarSign,
  Activity,
  Scale,
  RefreshCw,
  Database,
  ExternalLink,
  CreditCard,
  Banknote
} from 'lucide-react';

import { useTreasuryData } from '../hooks/useUnifiedData';
import PageYearSelector from '../components/forms/PageYearSelector';
import UnifiedChart from '../components/charts/UnifiedChart';
import TreasuryAnalysisChart from '../components/charts/TreasuryAnalysisChart';
import FinancialReservesChart from '../components/charts/FinancialReservesChart';
import FiscalBalanceReportChart from '../components/charts/FiscalBalanceReportChart';
import EconomicReportChart from '../components/charts/EconomicReportChart';
import WaterfallChart from '../components/charts/WaterfallChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import RevenueSourcesChart from '../components/charts/RevenueSourcesChart';
import ErrorBoundary from '../components/common/ErrorBoundary';

const TreasuryUnified: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'overview' | 'sef' | 'cashflow' | 'revenue' | 'expenses' | 'sources'>('overview');

  // Use unified data service
  const {
    data: treasuryData,
    sources,
    loading,
    error,
    refetch,
    availableYears,
    dataInventory
  } = useTreasuryData(selectedYear);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {treasuryData?.total_revenue ? formatCurrency(treasuryData.total_revenue) : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {treasuryData?.total_expenses ? formatCurrency(treasuryData.total_expenses) : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${
              (treasuryData?.balance || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <PiggyBank className={`h-6 w-6 ${
                (treasuryData?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Balance</p>
              <p className={`text-2xl font-bold ${
                (treasuryData?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {treasuryData?.balance ? formatCurrency(treasuryData.balance) : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Eficiencia</p>
              <p className="text-2xl font-bold text-gray-900">
                {treasuryData?.total_revenue && treasuryData?.total_expenses
                  ? formatPercentage((treasuryData.total_revenue / treasuryData.total_expenses) * 100)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Fuentes de Ingresos
          </h3>
          <div className="h-64">
            <ErrorBoundary>
              <UnifiedChart
                type="treasury"
                year={selectedYear}
                variant="pie"
                height={250}
              />
            </ErrorBoundary>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
            Distribución de Gastos
          </h3>
          <div className="h-64">
            <ErrorBoundary>
              <UnifiedChart
                type="treasury"
                year={selectedYear}
                variant="bar"
                height={250}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </div>

      {/* Additional Treasury Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Análisis del Tesoro
          </h3>
          <div className="h-64">
            <ErrorBoundary>
              <TreasuryAnalysisChart
                year={selectedYear}
              />
            </ErrorBoundary>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
            Reservas Financieras
          </h3>
          <div className="h-64">
            <ErrorBoundary>
              <FinancialReservesChart
                year={selectedYear}
                height={250}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderSEFReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Scale className="h-6 w-6 mr-3 text-blue-600" />
          Situación Económico-Financiera (SEF)
        </h3>
        <p className="text-gray-600 mb-6">
          Análisis trimestral de ingresos vs gastos con detección de sobregastos y análisis de balance
        </p>

        {/* Multi-source data status indicator */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Integración Multi-fuente Activa</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-sm text-blue-700">
            <span>📊 CSV: Estados financieros</span>
            <span>📄 PDF: Reportes SEF</span>
            <span>🔗 JSON: Datos estructurados</span>
            <span>🌐 APIs: Datos en tiempo real</span>
          </div>
        </div>

        {/* SEF Revenue vs Expenditure Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Ingresos vs Gastos - Análisis Trimestral
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <TimeSeriesChart
                  year={selectedYear}
                  chartType="line"
                  title="Evolución Trimestral - Ingresos vs Gastos"
                  height={300}
                />
              </ErrorBoundary>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              Heatmap de Sobregastos
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <FiscalBalanceReportChart
                  year={selectedYear}
                  chartType="heatmap"
                  title="Meses con Gastos > Ingresos"
                  height={300}
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        </div>

        {/* Waterfall Chart for Balance Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Balance Sheet Waterfall - Origen de Déficits
          </h4>
          <div className="h-80">
            <ErrorBoundary>
              <WaterfallChart
                year={selectedYear}
                title="Análisis de Balance - De dónde vienen los déficits"
                height={300}
              />
            </ErrorBoundary>
          </div>
        </motion.div>

        {/* Economic Report Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
            Reporte Económico Detallado
          </h4>
          <div className="h-80">
            <ErrorBoundary>
              <EconomicReportChart
                year={selectedYear}
                height={300}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderCashFlow = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Activity className="h-6 w-6 mr-3 text-green-600" />
          Flujo de Caja Municipal
        </h3>
        <p className="text-gray-600 mb-6">
          Análisis detallado del flujo de efectivo con proyecciones y análisis de liquidez
        </p>

        {/* Multi-source data integration status */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Datos de Flujo de Caja Integrados</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-sm text-green-700">
            <span>💰 Tesorería: Movimientos diarios</span>
            <span>🏦 Bancos: Estados de cuenta</span>
            <span>📈 Proyecciones: Modelos predictivos</span>
            <span>⚡ Tiempo real: APIs bancarias</span>
          </div>
        </div>

        {/* Cash Flow Time Series */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Flujo de Efectivo Mensual
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <TimeSeriesChart
                  year={selectedYear}
                  chartType="area"
                  title="Entradas y Salidas de Efectivo"
                  height={300}
                />
              </ErrorBoundary>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              Análisis de Liquidez
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <FinancialReservesChart
                  year={selectedYear}
                  height={300}
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        </div>

        {/* Cash Sources Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Banknote className="h-5 w-5 mr-2 text-green-600" />
            Fuentes de Efectivo
          </h4>
          <div className="h-80">
            <ErrorBoundary>
              <RevenueSourcesChart
                year={selectedYear}
                height={300}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderSources = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Fuentes de Datos del Tesoro
        </h3>

        <div className="space-y-4">
          {sources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  source.type === 'csv' ? 'bg-green-100' :
                  source.type === 'json' ? 'bg-blue-100' :
                  source.type === 'pdf' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {source.type === 'csv' && <FileText className="h-4 w-4 text-green-600" />}
                  {source.type === 'json' && <Database className="h-4 w-4 text-blue-600" />}
                  {source.type === 'pdf' && <FileText className="h-4 w-4 text-red-600" />}
                  {source.type === 'external' && <ExternalLink className="h-4 w-4 text-gray-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{source.path}</p>
                  <p className="text-sm text-gray-500 capitalize">{source.type} • {source.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                  Activo
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`Tesoro ${selectedYear} - Portal de Transparencia Carmen de Areco`}</title>
        <meta name="description" content={`Análisis detallado del tesoro municipal de Carmen de Areco para el año ${selectedYear}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <PiggyBank className="h-8 w-8 mr-3 text-green-600" />
                  Tesoro Municipal
                </h1>
                <p className="mt-2 text-gray-600">
                  Análisis de ingresos, gastos y balance financiero
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <PageYearSelector
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  availableYears={availableYears}
                  size="md"
                  label="Año de consulta"
                  showDataAvailability={true}
                />
                
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Resumen', icon: BarChart3 },
                  { id: 'sef', label: 'SEF Reports', icon: FileText },
                  { id: 'cashflow', label: 'Flujo de Caja', icon: Activity },
                  { id: 'revenue', label: 'Ingresos', icon: TrendingUp },
                  { id: 'expenses', label: 'Gastos', icon: TrendingDown },
                  { id: 'sources', label: 'Fuentes', icon: Database }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      viewMode === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-2" />
                <p className="text-gray-600">Cargando datos del tesoro...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'overview' && renderOverview()}
              {viewMode === 'sef' && renderSEFReports()}
              {viewMode === 'cashflow' && renderCashFlow()}
              {viewMode === 'sources' && renderSources()}
              {viewMode === 'revenue' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Ingresos</h3>
                  <p className="text-gray-600">Análisis detallado de ingresos en desarrollo...</p>
                </div>
              )}
              {viewMode === 'expenses' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Gastos</h3>
                  <p className="text-gray-600">Análisis detallado de gastos en desarrollo...</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default TreasuryUnified;
