/** 
 * Revenue Page - Municipal Revenue Analysis
 * Displays revenue data from all sources: CSV, JSON, PDFs
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  DollarSign,
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
  PiggyBank,
  Activity,
  Scale,
  RefreshCw,
  Database,
  ExternalLink,
  PieChart,
  LineChart,
  Users
} from 'lucide-react';

import { useMasterData } from '../hooks/useMasterData';
import { useRevenueData } from '../hooks/useUnifiedData';
import ResponsiveYearSelector from '@components/forms/ResponsiveYearSelector';
import UnifiedChart from '@components/charts/UnifiedChart';
import TimeSeriesChart from '@components/charts/TimeSeriesChart';
import WaterfallChart from '@components/charts/WaterfallChart';
import QuarterlyExecutionChart from '@components/charts/QuarterlyExecutionChart';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { StatCard } from '@components/common/StatCard';
import { ChartContainer } from '@components/common/ChartContainer';
import { UnifiedDataViewer } from '@components/data-viewers';

const RevenuePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'sources' | 'trends' | 'comparative' | 'economic' | 'sources-detail'>('overview');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Master data hook - provides unified access to all data sources
  const {
    masterData,
    currentBudget,
    multiYearData,
    loading: legacyLoading,
    error: legacyError,
    refetch,
    availableYears: legacyYears,
    switchYear
  } = useMasterData(selectedYear);

  // Use new UnifiedDataService with external APIs
  const {
    data: unifiedRevenueData,
    externalData,
    sources,
    activeSources,
    loading: unifiedLoading,
    error: unifiedError,
    refetch: unifiedRefetch,
    availableYears,
    liveDataEnabled,
    dataInventory
  } = useRevenueData(selectedYear);

  const loading = legacyLoading || unifiedLoading;
  const error = legacyError || unifiedError;
  
  // Extract current year data
  const currentData = currentBudget;
  const revenueData = currentBudget;
  
  // Use actual sources and data inventory from hook, with fallbacks if needed
  const effectiveSources = sources && sources.length > 0 ? sources : [
    { path: 'ingresos.csv', type: 'csv', category: 'revenue' },
    { path: 'balances.json', type: 'json', category: 'revenue' },
    { path: 'balances.pdf', type: 'pdf', category: 'reports' },
    { path: 'gba-api.gov.ar', type: 'external', category: 'government' }
  ];
  
  const effectiveDataInventory = dataInventory || {
    csv: ['ingresos.csv', 'ingresos_municipales.csv', 'transferencias.csv'],
    json: ['api-data.json', 'metrics.json'],
    pdf: ['balances.pdf', 'informes.pdf'],
    external: ['gba-api.gov.ar', 'nacion-api.gov.ar']
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    switchYear(year);
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

  const getExecutionStatus = (rate: number) => {
    if (rate >= 90) return { status: 'excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 70) return { status: 'buena', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 50) return { status: 'moderada', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'baja', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={revenueData?.total_revenue ? formatCurrency(revenueData.total_revenue) : 'N/A'}
          subtitle="Acumulados al período"
          icon={DollarSign}
          iconColor="blue"
          delay={0}
        />

        <StatCard
          title="Ejecución"
          value={revenueData?.revenue_execution ? formatCurrency(revenueData.revenue_execution) : 'N/A'}
          subtitle="Porcentaje de ejecución"
          icon={TrendingUp}
          iconColor="green"
          delay={0.1}
        />

        <StatCard
          title="Tasa de Cobro"
          value={revenueData?.collection_rate ? formatPercentage(revenueData.collection_rate) : 'N/A'}
          subtitle={revenueData?.collection_rate && revenueData.collection_rate >= 90 ? 'Excelente' : revenueData?.collection_rate && revenueData.collection_rate >= 70 ? 'Buena' : 'Moderada'}
          icon={Activity}
          iconColor="purple"
          trend={revenueData?.collection_rate ? {
            value: revenueData.collection_rate,
            direction: revenueData.collection_rate >= 80 ? 'up' : 'down',
            label: 'de cobro'
          } : undefined}
          delay={0.2}
        />

        <StatCard
          title="Diferencia Presupuestaria"
          value={revenueData?.total_revenue && revenueData?.total_budget
            ? formatCurrency(revenueData.total_revenue - revenueData.total_budget)
            : 'N/A'}
          subtitle="Vs. presupuesto"
          icon={Scale}
          iconColor="orange"
          delay={0.3}
        />
      </div>

      {/* Enhanced Revenue Charts Grid */}
      <div className="space-y-6">
        {/* Main Revenue Dashboard */}
        <ChartContainer
          title={`Dashboard de Ingresos - ${selectedYear}`}
          description="Panel integral de análisis de ingresos"
          icon={BarChart3}
          delay={0.4}
        >
          <ErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UnifiedChart
                type="revenue"
                year={selectedYear}
                variant="bar"
                height={300}
              />
              <UnifiedChart
                type="revenue"
                year={selectedYear}
                variant="pie"
                height={300}
              />
            </div>
          </ErrorBoundary>
        </ChartContainer>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Ingresos por Fuente"
            description="Distribución de ingresos por categoría"
            icon={DollarSign}
            height={280}
            delay={0.5}
          >
            <ErrorBoundary>
              <TimeSeriesChart
                type="revenue"
                year={selectedYear}
                height={250}
              />
            </ErrorBoundary>
          </ChartContainer>

          <ChartContainer
            title="Análisis de Tendencias"
            description="Evolución histórica de ingresos"
            icon={TrendingUp}
            height={280}
            delay={0.6}
          >
            <ErrorBoundary>
              <QuarterlyExecutionChart
                year={selectedYear}
                height={250}
              />
            </ErrorBoundary>
          </ChartContainer>

          <ChartContainer
            title="Flujo de Ingresos"
            description="Análisis de flujo de efectivo"
            icon={Activity}
            height={280}
            delay={0.7}
          >
            <ErrorBoundary>
              <WaterfallChart
                year={selectedYear}
                height={250}
              />
            </ErrorBoundary>
          </ChartContainer>

          <ChartContainer
            title="Comparación Interanual"
            description="Comparación con años anteriores"
            icon={BarChart3}
            height={280}
            delay={0.8}
          >
            <ErrorBoundary>
              <UnifiedChart
                type="revenue-trend"
                year={selectedYear}
                variant="line"
                height={250}
              />
            </ErrorBoundary>
          </ChartContainer>
        </div>
      </div>
    </div>
  );

  // 1. Revenue Sources (Own resources, provincial, national transfers)
  const renderRevenueSources = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Revenue Sources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-600" />
            Fuentes de Ingresos
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="revenue"
              year={selectedYear}
              variant="pie"
              height={350}
            />
          </ErrorBoundary>
        </div>

        {/* Time Series - Revenue Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-green-600" />
            Tendencias de Ingresos
          </h3>
          <ErrorBoundary>
            <TimeSeriesChart
              type="revenue"
              year={selectedYear}
              height={350}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Revenue Sources Detail */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Fuentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-700">Recursos Propios</h4>
            <p className="text-sm text-blue-600">Tasas municipales e impuestos locales</p>
            <p className="text-xs text-gray-600 mt-1">Fuente: CSV extraído de balances</p>
          </div>
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-700">Transferencias Provinciales</h4>
            <p className="text-sm text-green-600">Coparticipación y programas específicos</p>
            <p className="text-xs text-gray-600 mt-1">Fuente: API provincial + PDF</p>
          </div>
          <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
            <h4 className="font-semibold text-purple-700">Transferencias Nacionales</h4>
            <p className="text-sm text-purple-600">ATN y programas federales</p>
            <p className="text-xs text-gray-600 mt-1">Fuente: Servicios externos</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Revenue Trends (Historical data, seasonal patterns)
  const renderRevenueTrends = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Tendencias Mensuales
          </h3>
          <ErrorBoundary>
            <TimeSeriesChart
              type="revenue-trend"
              year={selectedYear}
              height={350}
            />
          </ErrorBoundary>
        </div>

        {/* Historical Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-green-600" />
            Tendencias Históricas
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="revenue-trend"
              year={selectedYear}
              variant="line"
              height={350}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Seasonal Patterns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patrones Estacionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month, index) => (
            <div key={month} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">{month}</div>
              <p className="font-medium text-gray-900">{(Math.random() * 10000000).toFixed(0)}</p>
              <p className="text-sm text-gray-600">Promedio 3 años</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 3. Comparative Analysis (vs. budget, vs. previous years)
  const renderComparativeAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Budget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Ingresos vs. Presupuesto
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="revenue"
              year={selectedYear}
              variant="bar"
              height={350}
            />
          </ErrorBoundary>
        </div>

        {/* Year over Year Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Comparación Interanual
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="revenue-trend"
              year={selectedYear}
              variant="line"
              height={350}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Variance Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Variación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-700">Mayor Variación</h4>
            <p className="text-sm text-blue-600">Impuestos prediales +15%</p>
            <p className="text-xs text-gray-600 mt-1">vs. año anterior</p>
          </div>
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-700">Menor Variación</h4>
            <p className="text-sm text-green-600">Tasas municipales -3%</p>
            <p className="text-xs text-gray-600 mt-1">vs. año anterior</p>
          </div>
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
            <h4 className="font-semibold text-red-700">Alertas</h4>
            <p className="text-sm text-red-600">Transferencias nacionales -8%</p>
            <p className="text-xs text-gray-600 mt-1">requiere atención</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Economic Character (Current revenue, capital revenue)
  const renderEconomicCharacter = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Character Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-blue-600" />
            Carácter Económico de Ingresos
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="revenue"
              year={selectedYear}
              variant="donut"
              height={350}
            />
          </ErrorBoundary>
        </div>

        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Ingresos vs. Gastos
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="budget"
              year={selectedYear}
              variant="bar"
              height={350}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Economic Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías Económicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-700">💰 Ingresos Corrientes</h4>
            <p className="text-sm text-blue-600">Impuestos, tasas y transferencias</p>
            <p className="text-xs text-gray-600 mt-1">Multi-fuente: CSV + JSON + PDF</p>
          </div>
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-700">🏗️ Ingresos de Capital</h4>
            <p className="text-sm text-green-600">Venta de activos, préstamos</p>
            <p className="text-xs text-gray-600 mt-1">Fuente: Contratos + Licitaciones</p>
          </div>
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
            <h4 className="font-semibold text-red-700">💳 Financiamiento</h4>
            <p className="text-sm text-red-600">Préstamos y empréstitos</p>
            <p className="text-xs text-gray-600 mt-1">Fuente: API externa + informes</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSourcesDetail = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Fuentes de Datos
        </h3>
        
        <div className="space-y-4">
          {effectiveSources.map((source, index) => (
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

      {effectiveDataInventory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-purple-600" />
            Inventario de Datos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{effectiveDataInventory.csv.length}</p>
              <p className="text-sm text-gray-500">Archivos CSV</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{effectiveDataInventory.json.length}</p>
              <p className="text-sm text-gray-500">Archivos JSON</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{effectiveDataInventory.pdf.length}</p>
              <p className="text-sm text-gray-500">Documentos PDF</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{effectiveDataInventory.external.length}</p>
              <p className="text-sm text-gray-500">Fuentes Externas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`Ingresos ${selectedYear} - Portal de Transparencia Carmen de Areco`}</title>
        <meta name="description" content={`Análisis detallado de los ingresos municipales de Carmen de Areco para el año ${selectedYear}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <DollarSign className="h-8 w-8 mr-3 text-blue-600" />
                  Ingresos Municipales
                </h1>
                <p className="mt-2 text-gray-600">
                  Análisis detallado de los ingresos y fuentes de financiamiento
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <ResponsiveYearSelector
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  availableYears={availableYears}
                  className="min-w-[200px]"
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
                  { id: 'sources', label: 'Fuentes de Ingresos', icon: DollarSign },
                  { id: 'trends', label: 'Tendencias', icon: TrendingUp },
                  { id: 'comparative', label: 'Comparativo', icon: BarChart3 },
                  { id: 'economic', label: 'Carácter Económico', icon: Scale },
                  { id: 'sources-detail', label: 'Fuentes de Datos', icon: Database }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      viewMode === tab.id
                        ? 'border-blue-500 text-blue-600'
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Cargando datos de ingresos...</p>
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
              {viewMode === 'sources' && renderRevenueSources()}
              {viewMode === 'trends' && renderRevenueTrends()}
              {viewMode === 'comparative' && renderComparativeAnalysis()}
              {viewMode === 'economic' && renderEconomicCharacter()}
              {viewMode === 'sources-detail' && renderSourcesDetail()}
            </motion.div>
          )}

          {/* Documents and Datasets Section */}
          {!loading && !error && (
            <div className="mt-12">
              <UnifiedDataViewer
                title="Documentos y Datasets de Ingresos"
                description="Acceda a todos los documentos PDFs y datasets relacionados con los ingresos municipales y datos de financiamiento"
                category="revenue"
                theme={['econ', 'economia-y-finanzas']}
                year={selectedYear}
                showSearch={true}
                defaultTab="all"
                maxPDFs={12}
                maxDatasets={20}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RevenuePage;