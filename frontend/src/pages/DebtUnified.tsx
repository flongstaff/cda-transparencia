/**
 * Debt Page - Unified Data Integration
 * Displays debt data from all sources: CSV, JSON, PDFs
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  CreditCard,
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
  AlertTriangle,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

import { useDebtData } from '../hooks/useUnifiedData';
import PageYearSelector from '../components/forms/PageYearSelector';
import UnifiedChart from '../components/charts/UnifiedChart';
import DebtReportChart from '../components/charts/DebtReportChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import TreemapChart from '../components/charts/TreemapChart';
import WaterfallChart from '../components/charts/WaterfallChart';
import ErrorBoundary from '../components/common/ErrorBoundary';

const DebtUnified: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'overview' | 'breakdown' | 'trends' | 'external' | 'timeline' | 'composition' | 'sources'>('overview');

  // Use unified data service
  const {
    data: debtData,
    sources,
    loading,
    error,
    refetch,
    availableYears,
    dataInventory
  } = useDebtData(selectedYear);

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

  const getDebtStatus = (debtToGDP: number) => {
    if (debtToGDP < 30) return { status: 'low', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
    if (debtToGDP < 60) return { status: 'moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle };
    return { status: 'high', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle };
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
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Deuda Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {debtData?.total_debt ? formatCurrency(debtData.total_debt) : 'N/A'}
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
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <TrendingUpIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Deuda per Cápita</p>
              <p className="text-2xl font-bold text-gray-900">
                {debtData?.debt_per_capita ? formatCurrency(debtData.debt_per_capita) : 'N/A'}
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
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tasa de Interés Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {debtData?.average_interest_rate ? formatPercentage(debtData.average_interest_rate) : 'N/A'}
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
            <div className={`p-3 rounded-lg mr-4 ${
              debtData?.debt_to_gdp ? getDebtStatus(debtData.debt_to_gdp).bg : 'bg-gray-100'
            }`}>
              <Scale className={`h-6 w-6 ${
                debtData?.debt_to_gdp ? getDebtStatus(debtData.debt_to_gdp).color : 'text-gray-600'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Deuda/PBI</p>
              <p className={`text-2xl font-bold ${
                debtData?.debt_to_gdp ? getDebtStatus(debtData.debt_to_gdp).color : 'text-gray-900'
              }`}>
                {debtData?.debt_to_gdp ? formatPercentage(debtData.debt_to_gdp) : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Debt Status Alert */}
      {debtData?.debt_to_gdp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl p-6 ${
            getDebtStatus(debtData.debt_to_gdp).bg
          }`}
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 ${
              getDebtStatus(debtData.debt_to_gdp).bg
            }`}>
              {React.createElement(getDebtStatus(debtData.debt_to_gdp).icon, {
                className: `h-6 w-6 ${getDebtStatus(debtData.debt_to_gdp).color}`
              })}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${getDebtStatus(debtData.debt_to_gdp).color}`}>
                Estado de la Deuda Municipal
              </h3>
              <p className={`text-sm ${getDebtStatus(debtData.debt_to_gdp).color} mt-1`}>
                {debtData.debt_to_gdp < 30 
                  ? 'La deuda municipal se encuentra en niveles bajos y sostenibles.'
                  : debtData.debt_to_gdp < 60
                  ? 'La deuda municipal se encuentra en niveles moderados. Se recomienda monitoreo continuo.'
                  : 'La deuda municipal se encuentra en niveles altos. Se requiere atención inmediata.'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
            Tipos de Deuda
          </h3>
          <div className="h-64">
            <UnifiedChart
              type="pie"
              data={debtData?.debt_breakdown || []}
              height={250}
              showLegend={true}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Evolución de la Deuda
          </h3>
          <div className="h-64">
            <UnifiedChart
              type="line"
              data={debtData?.debt_trend || []}
              height={250}
              showLegend={true}
            />
          </div>
        </motion.div>
      </div>

      {/* Debt Details Table */}
      {debtData?.debt_details && debtData.debt_details.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Detalle de Deudas
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasa de Interés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debtData.debt_details.map((debt: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {debt.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(debt.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(debt.interest_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {debt.maturity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        debt.status === 'current' ? 'bg-green-100 text-green-600' :
                        debt.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {debt.status === 'current' ? 'Al día' :
                         debt.status === 'overdue' ? 'Vencida' :
                         'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderDebtBreakdown = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CreditCard className="h-6 w-6 mr-3 text-red-600" />
          Desglose Detallado de Deuda Municipal
        </h3>
        <p className="text-gray-600 mb-6">
          Análisis por tipo de deuda, acreedores y condiciones financieras
        </p>

        {/* Multi-source data integration status */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-900">Datos de Deuda Multi-fuente Integrados</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-sm text-red-700">
            <span>📄 Ministerio: Registro oficial</span>
            <span>🏦 Bancos: Créditos y préstamos</span>
            <span>📊 CSV: Planillas detalladas</span>
            <span>🌐 APIs: Datos en tiempo real</span>
          </div>
        </div>

        {/* Debt Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Deuda por Tipo
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <TreemapChart
                  year={selectedYear}
                  title="Composición de Deuda por Tipo"
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
              <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
              Deuda por Acreedor
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <UnifiedChart
                  type="pie"
                  data={debtData?.debt_by_creditor || []}
                  height={300}
                  showLegend={true}
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        </div>

        {/* Debt Conditions Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Condiciones y Términos de Deuda
          </h4>
          <div className="h-80">
            <ErrorBoundary>
              <DebtReportChart
                year={selectedYear}
                height={300}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderDebtTrends = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUpIcon className="h-6 w-6 mr-3 text-blue-600" />
          Tendencias Históricas de Deuda
        </h3>
        <p className="text-gray-600 mb-6">
          Evolución temporal de la deuda municipal y proyecciones
        </p>

        {/* Multi-year trend analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Evolución de Deuda Total
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <TimeSeriesChart
                  year={selectedYear}
                  chartType="line"
                  title="Deuda Total - Tendencia Histórica"
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
              <Scale className="h-5 w-5 mr-2 text-purple-600" />
              Ratio Deuda/PBI Histórico
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <TimeSeriesChart
                  year={selectedYear}
                  chartType="area"
                  title="Sostenibilidad de Deuda - Ratio Deuda/PBI"
                  height={300}
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        </div>

        {/* Debt Growth Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-red-600" />
            Análisis de Crecimiento de Deuda
          </h4>
          <div className="h-80">
            <ErrorBoundary>
              <WaterfallChart
                year={selectedYear}
                title="Factores de Crecimiento de Deuda"
                height={300}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderExternalDebt = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <ExternalLink className="h-6 w-6 mr-3 text-orange-600" />
          Deuda Externa Municipal
        </h3>
        <p className="text-gray-600 mb-6">
          Análisis de deuda con organismos externos y fuentes de financiamiento internacionales
        </p>

        {/* External debt sources status */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-medium text-orange-900">Fuentes de Deuda Externa Monitoreadas</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-sm text-orange-700">
            <span>🏛️ Ministerio: Deuda provincial/nacional</span>
            <span>🌍 Organismos: BID, Banco Mundial</span>
            <span>💼 Privados: Bonos y créditos</span>
            <span>📊 APIs: Cotizaciones en tiempo real</span>
          </div>
        </div>

        {/* External Debt Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Deuda Externa por Organismo
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <UnifiedChart
                  type="donut"
                  data={debtData?.external_debt_by_source || []}
                  height={300}
                  showLegend={true}
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
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Evolución Deuda Externa vs Interna
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <TimeSeriesChart
                  year={selectedYear}
                  chartType="line"
                  title="Comparación Deuda Externa vs Interna"
                  height={300}
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const renderDebtTimeline = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-6 w-6 mr-3 text-green-600" />
          Timeline de Deuda Municipal
        </h3>
        <p className="text-gray-600 mb-6">
          Cronología de endeudamiento y calendario de vencimientos
        </p>

        {/* Timeline Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Cronología de Endeudamiento
          </h4>
          <div className="h-96">
            <ErrorBoundary>
              <TimeSeriesChart
                year={selectedYear}
                chartType="timeline"
                title="Timeline Completo de Deuda Municipal"
                height={350}
              />
            </ErrorBoundary>
          </div>
        </motion.div>

        {/* Maturity Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Perfil de Vencimientos
          </h4>
          <div className="h-80">
            <ErrorBoundary>
              <WaterfallChart
                year={selectedYear}
                title="Calendario de Vencimientos de Deuda"
                height={300}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderDebtComposition = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
          Composición de Deuda Municipal
        </h3>
        <p className="text-gray-600 mb-6">
          Análisis detallado de la estructura y composición de la deuda
        </p>

        {/* Composition Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Composición por Moneda
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <TreemapChart
                  year={selectedYear}
                  title="Deuda por Tipo de Moneda"
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
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Estructura de Tasas de Interés
            </h4>
            <div className="h-80">
              <ErrorBoundary>
                <UnifiedChart
                  type="bar"
                  data={debtData?.debt_by_interest_rate || []}
                  height={300}
                  showLegend={true}
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        </div>

        {/* Detailed Composition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-purple-600" />
            Análisis de Sostenibilidad por Composición
          </h4>
          <div className="h-80">
            <ErrorBoundary>
              <DebtReportChart
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
          Fuentes de Datos de Deuda
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
        <title>{`Deuda ${selectedYear} - Portal de Transparencia Carmen de Areco`}</title>
        <meta name="description" content={`Análisis detallado de la deuda municipal de Carmen de Areco para el año ${selectedYear}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <CreditCard className="h-8 w-8 mr-3 text-red-600" />
                  Deuda Municipal
                </h1>
                <p className="mt-2 text-gray-600">
                  Análisis detallado de la deuda municipal y su sostenibilidad
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
                  { id: 'breakdown', label: 'Desglose', icon: CreditCard },
                  { id: 'trends', label: 'Tendencias', icon: TrendingUp },
                  { id: 'external', label: 'Externa', icon: ExternalLink },
                  { id: 'timeline', label: 'Timeline', icon: Calendar },
                  { id: 'composition', label: 'Composición', icon: Scale },
                  { id: 'sources', label: 'Fuentes', icon: Database }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      viewMode === tab.id
                        ? 'border-red-500 text-red-600'
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
                <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-2" />
                <p className="text-gray-600">Cargando datos de deuda...</p>
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
              {viewMode === 'breakdown' && renderDebtBreakdown()}
              {viewMode === 'trends' && renderDebtTrends()}
              {viewMode === 'external' && renderExternalDebt()}
              {viewMode === 'timeline' && renderDebtTimeline()}
              {viewMode === 'composition' && renderDebtComposition()}
              {viewMode === 'sources' && renderSources()}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default DebtUnified;
