import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Grid3X3,
  Table,
  LineChart,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  DollarSign,
  PiggyBank,
  TrendingDown,
  Scale
} from 'lucide-react';
import ConsistentDataVisualization from '../components/charts/ConsistentDataVisualization';
import ConsistentDataTable from '../components/tables/ConsistentDataTable';
import { formatCurrencyARS } from '../utils/formatters';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useMasterData } from '../hooks/useMasterData';

const StandardizedDashboard: React.FC = () => {
  const { data, loading, error } = useMasterData();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'overview' | 'budget' | 'treasury' | 'debt' | 'contracts' | 'salaries' | 'documents'>('overview');
  const [multiSourceMode, setMultiSourceMode] = useState<boolean>(true);

  // Available years for selection
  const availableYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrencyARS(340341750)}
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
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ejecutado</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrencyARS(320498610)}
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
              <p className="text-sm font-medium text-gray-500">Tasa de Ejecución</p>
              <p className="text-2xl font-bold text-gray-900">
                94.17%
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
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <PiggyBank className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Inversión</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrencyARS(61990819)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Consistent Visualization Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Budget Execution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Ejecución Presupuestaria
          </h3>
          <ErrorBoundary>
            <ConsistentDataVisualization
              visualizationType="chart"
              chartType="bar"
              pageType="budget"
              year={selectedYear}
              height={300}
              multiSourceComparison={multiSourceMode}
            />
          </ErrorBoundary>
        </motion.div>

        {/* Revenue vs Expenses Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Ingresos vs Gastos
          </h3>
          <ErrorBoundary>
            <ConsistentDataVisualization
              visualizationType="chart"
              chartType="line"
              pageType="treasury"
              year={selectedYear}
              height={300}
              yAxisKeys={['income', 'expense']}
              multiSourceComparison={multiSourceMode}
            />
          </ErrorBoundary>
        </motion.div>

        {/* Budget Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2 text-blue-600" />
            Detalle Presupuestario
          </h3>
          <ErrorBoundary>
            <ConsistentDataTable
              pageType="budget"
              year={selectedYear}
              rowsPerPage={5}
              includeExternal={multiSourceMode}
            />
          </ErrorBoundary>
        </motion.div>

        {/* Debt Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-red-600" />
            Situación de Deuda
          </h3>
          <ErrorBoundary>
            <ConsistentDataVisualization
              visualizationType="chart"
              chartType="pie"
              pageType="debt"
              year={selectedYear}
              height={300}
              multiSourceComparison={multiSourceMode}
            />
          </ErrorBoundary>
        </motion.div>
      </div>
    </div>
  );

  const renderBudgetView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Ejecución Presupuestaria por Partida
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="bar"
            pageType="budget"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-green-600" />
            Distribución de Presupuesto
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="pie"
            pageType="budget"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2 text-purple-600" />
            Datos Detallados de Presupuesto
          </h3>
          <ConsistentDataTable
            pageType="budget"
            year={selectedYear}
            includeExternal={multiSourceMode}
          />
        </motion.div>
      </div>
    </div>
  );

  const renderTreasuryView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Evolución de Ingresos y Gastos
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="line"
            pageType="treasury"
            year={selectedYear}
            height={400}
            yAxisKeys={['income', 'expense']}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PiggyBank className="h-5 w-5 mr-2 text-blue-600" />
            Balance de Tesorería
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="area"
            pageType="treasury"
            year={selectedYear}
            height={400}
            yAxisKeys={['income', 'expense', 'balance']}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2 text-purple-600" />
            Movimientos de Tesorería
          </h3>
          <ConsistentDataTable
            pageType="treasury"
            year={selectedYear}
            includeExternal={multiSourceMode}
          />
        </motion.div>
      </div>
    </div>
  );

  const renderDebtView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-red-600" />
            Distribución de Deuda
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="pie"
            pageType="debt"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-orange-600" />
            Evolución de Deuda
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="line"
            pageType="debt"
            year={selectedYear}
            height={400}
            yAxisKeys={['amount', 'service']}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2 text-purple-600" />
            Detalle de Deuda
          </h3>
          <ConsistentDataTable
            pageType="debt"
            year={selectedYear}
            includeExternal={multiSourceMode}
          />
        </motion.div>
      </div>
    </div>
  );

  const renderContractsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Contratos por Monto
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="bar"
            pageType="contracts"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Estado de Contratos
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="pie"
            pageType="contracts"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2 text-purple-600" />
            Detalle de Contratos
          </h3>
          <ConsistentDataTable
            pageType="contracts"
            year={selectedYear}
            includeExternal={multiSourceMode}
          />
        </motion.div>
      </div>
    </div>
  );

  const renderSalariesView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Salarios por Cargo
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="bar"
            pageType="salaries"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PiggyBank className="h-5 w-5 mr-2 text-green-600" />
            Distribución Salarial
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="pie"
            pageType="salaries"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2 text-purple-600" />
            Detalle de Salarios
          </h3>
          <ConsistentDataTable
            pageType="salaries"
            year={selectedYear}
            includeExternal={multiSourceMode}
          />
        </motion.div>
      </div>
    </div>
  );

  const renderDocumentsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Documentos por Categoría
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="bar"
            pageType="documents"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
            Tipos de Documentos
          </h3>
          <ConsistentDataVisualization
            visualizationType="chart"
            chartType="pie"
            pageType="documents"
            year={selectedYear}
            height={400}
            multiSourceComparison={multiSourceMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2 text-purple-600" />
            Detalle de Documentos
          </h3>
          <ConsistentDataTable
            pageType="documents"
            year={selectedYear}
            includeExternal={multiSourceMode}
          />
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Dashboard Estándar - Portal de Transparencia Carmen de Areco</title>
        <meta name="description" content="Dashboard estandarizado con visualizaciones consistentes de datos municipales" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Database className="h-8 w-8 mr-3 text-blue-600" />
                  Dashboard de Datos Estándar
                </h1>
                <p className="mt-2 text-gray-600">
                  Visualizaciones estandarizadas con integración de múltiples fuentes de datos
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                {/* Multi-source toggle */}
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600">Fuentes Múltiples:</span>
                  <button
                    onClick={() => setMultiSourceMode(!multiSourceMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      multiSourceMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        multiSourceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Refresh button */}
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6">
              <nav className="flex flex-wrap gap-1">
                {[
                  { id: 'overview', label: 'Resumen', icon: BarChart3 },
                  { id: 'budget', label: 'Presupuesto', icon: DollarSign },
                  { id: 'treasury', label: 'Tesorería', icon: PiggyBank },
                  { id: 'debt', label: 'Deuda', icon: Scale },
                  { id: 'contracts', label: 'Contratos', icon: FileSpreadsheet },
                  { id: 'salaries', label: 'Salarios', icon: TrendingUp },
                  { id: 'documents', label: 'Documentos', icon: Table }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as any)}
                    className={`flex items-center py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
                      viewMode === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
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
          {/* Data Sources Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-blue-900 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Fuentes de Datos Integradas
              </h3>
              <div className="flex items-center">
                <span className="text-xs text-blue-700 mr-2">
                  {multiSourceMode ? '✓ Fuentes múltiples' : '✓ Solo datos locales'}
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                <span>CSV estructurados</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                <span>JSON consolidados</span>
              </div>
              <div className="flex items-center">
                {multiSourceMode ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    <span>APIs externas</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />
                    <span>APIs externas</span>
                  </>
                )}
              </div>
              <div className="flex items-center">
                {multiSourceMode ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    <span>Datos comparados</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />
                    <span>Datos comparados</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'overview' && renderOverview()}
            {viewMode === 'budget' && renderBudgetView()}
            {viewMode === 'treasury' && renderTreasuryView()}
            {viewMode === 'debt' && renderDebtView()}
            {viewMode === 'contracts' && renderContractsView()}
            {viewMode === 'salaries' && renderSalariesView()}
            {viewMode === 'documents' && renderDocumentsView()}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StandardizedDashboard;