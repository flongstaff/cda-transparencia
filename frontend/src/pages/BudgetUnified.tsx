/**
 * Budget Page - Unified Data Integration
 * Displays budget data from all sources: CSV, JSON, PDFs
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
  ExternalLink
} from 'lucide-react';

import { useMultiYearData } from '../hooks/useMultiYearData';
import ResponsiveYearSelector from '../components/forms/ResponsiveYearSelector';
import UnifiedChart from '../components/charts/UnifiedChart';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import BudgetExecutionDashboard from '../components/charts/BudgetExecutionDashboard';
import BudgetExecutionChart from '../components/charts/BudgetExecutionChart';
import TreemapChart from '../components/charts/TreemapChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import WaterfallChart from '../components/charts/WaterfallChart';
import QuarterlyExecutionChart from '../components/charts/QuarterlyExecutionChart';
import GenderBudgetingChart from '../components/charts/GenderBudgetingChart';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { StatCard } from '../components/common/StatCard';
import { ChartContainer } from '../components/common/ChartContainer';

const BudgetUnified: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'execution' | 'finalidad' | 'financiamiento' | 'economico' | 'gender' | 'sources'>('overview');

  // Multi-year data hook - preloads all years for instant switching
  const {
    selectedYear,
    setSelectedYear,
    currentData,
    availableYears,
    initialLoading: loading,
    backgroundLoading
  } = useMultiYearData();

  // Extract budget data from current year
  const budgetData = currentData?.budget;
  const error = currentData?.error || null;

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // Data is already preloaded, UI updates instantly
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
    if (rate >= 90) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 70) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 50) return { status: 'moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Presupuesto Total"
          value={budgetData?.total_budget ? formatCurrency(budgetData.total_budget) : 'N/A'}
          subtitle="Aprobado para el ejercicio"
          icon={DollarSign}
          iconColor="blue"
          delay={0}
        />

        <StatCard
          title="Ejecutado"
          value={budgetData?.total_executed ? formatCurrency(budgetData.total_executed) : 'N/A'}
          subtitle="Devengado al período"
          icon={TrendingUp}
          iconColor="green"
          delay={0.1}
        />

        <StatCard
          title="Tasa de Ejecución"
          value={budgetData?.execution_rate ? formatPercentage(budgetData.execution_rate) : 'N/A'}
          subtitle={budgetData?.execution_rate && budgetData.execution_rate >= 90 ? 'Excelente' : budgetData?.execution_rate && budgetData.execution_rate >= 70 ? 'Buena' : 'Moderada'}
          icon={Activity}
          iconColor="purple"
          trend={budgetData?.execution_rate ? {
            value: budgetData.execution_rate,
            direction: budgetData.execution_rate >= 80 ? 'up' : 'down',
            label: 'del presupuesto'
          } : undefined}
          delay={0.2}
        />

        <StatCard
          title="Ahorro Presupuestario"
          value={budgetData?.total_budget && budgetData?.total_executed
            ? formatCurrency(budgetData.total_budget - budgetData.total_executed)
            : 'N/A'}
          subtitle="No ejecutado"
          icon={PiggyBank}
          iconColor="orange"
          delay={0.3}
        />
      </div>

      {/* Enhanced Budget Charts Grid */}
      <div className="space-y-6">
        {/* Main Budget Execution Dashboard */}
        <ChartContainer
          title={`Dashboard de Ejecución Presupuestaria - ${selectedYear}`}
          description="Panel integral de análisis presupuestario"
          icon={BarChart3}
          delay={0.4}
        >
          <ErrorBoundary>
            <BudgetExecutionDashboard
              year={selectedYear}
              data={budgetData}
            />
          </ErrorBoundary>
        </ChartContainer>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Ejecución por Partida"
            description="Comparación de presupuesto vs ejecutado"
            icon={BarChart3}
            height={280}
            delay={0.5}
          >
            <ErrorBoundary>
              <UnifiedChart
                type="bar"
                data={budgetData?.budget_execution || []}
                height={250}
                showLegend={true}
              />
            </ErrorBoundary>
          </ChartContainer>

          <ChartContainer
            title="Distribución por Categoría"
            description="Composición del presupuesto"
            icon={PiggyBank}
            height={280}
            delay={0.6}
          >
            <ErrorBoundary>
              <UnifiedChart
                type="pie"
                data={budgetData?.revenue_sources || []}
                height={250}
                showLegend={true}
              />
            </ErrorBoundary>
          </ChartContainer>

          <ChartContainer
            title="Análisis de Tendencias"
            description="Evolución de la ejecución"
            icon={Activity}
            height={280}
            delay={0.7}
          >
            <ErrorBoundary>
              <BudgetExecutionChart
                data={budgetData?.budget_execution || []}
                year={selectedYear}
              />
            </ErrorBoundary>
          </ChartContainer>

          <ChartContainer
            title="Análisis Presupuestario"
            description="Métricas de cumplimiento"
            icon={Scale}
            height={280}
            delay={0.8}
          >
            <ErrorBoundary>
              <BudgetAnalysisChart
                data={budgetData}
                year={selectedYear}
              />
            </ErrorBoundary>
          </ChartContainer>
        </div>
      </div>
    </div>
  );

  // 1. Ejecución Presupuestaria (Budget Execution) - Stacked bars, progress indicators
  const renderBudgetExecution = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Bar Chart - Approved vs Executed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Presupuestado vs Ejecutado por Trimestre
          </h3>
          <ErrorBoundary>
            <BudgetExecutionChart year={selectedYear} height={300} />
          </ErrorBoundary>
        </div>

        {/* Progress Bars - Execution Percentage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Porcentajes de Ejecución
          </h3>
          <ErrorBoundary>
            <QuarterlyExecutionChart year={selectedYear} height={300} />
          </ErrorBoundary>
        </div>

        {/* Line Chart - Execution Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Tendencia de Ejecución Mensual
          </h3>
          <ErrorBoundary>
            <TimeSeriesChart
              type="budget_execution"
              year={selectedYear}
              height={300}
            />
          </ErrorBoundary>
        </div>

        {/* Waterfall Chart - Budget Flow */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-orange-600" />
            Flujo Presupuestario
          </h3>
          <ErrorBoundary>
            <WaterfallChart year={selectedYear} height={300} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Multi-Source Data Integration Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Fuentes de Datos Integradas</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span>CSV extraídos de PDFs</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span>APIs JSON estructuradas</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span>Documentos PDF oficiales</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span>Servicios externos GBA</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Finalidad y Función (Education, Health, Public Works, etc.) - Treemap
  const renderFinalidadFuncion = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treemap - Composition by Function */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PiggyBank className="h-5 w-5 mr-2 text-blue-600" />
            Composición por Finalidad
          </h3>
          <ErrorBoundary>
            <TreemapChart
              type="finalidad"
              year={selectedYear}
              height={350}
            />
          </ErrorBoundary>
        </div>

        {/* Unified Chart - Function Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Análisis por Función
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="budget_function"
              year={selectedYear}
              variant="bar"
              height={350}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Sector Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Sectores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['Educación', 'Salud', 'Obras Públicas', 'Seguridad', 'Administración'].map((sector, index) => (
            <div key={sector} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">
                {index === 0 ? '📚' : index === 1 ? '🏥' : index === 2 ? '🏗️' : index === 3 ? '👮' : '🏛️'}
              </div>
              <p className="font-medium text-gray-900">{sector}</p>
              <p className="text-sm text-gray-600">Datos CSV + JSON</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 3. Fuente de Financiamiento (Own resources, provincial, national transfers)
  const renderFuentesFinanciamiento = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Funding Sources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Fuentes de Financiamiento
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="funding_sources"
              year={selectedYear}
              variant="pie"
              height={350}
            />
          </ErrorBoundary>
        </div>

        {/* Time Series - Funding Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Tendencias de Transferencias
          </h3>
          <ErrorBoundary>
            <TimeSeriesChart
              type="transfers"
              year={selectedYear}
              height={350}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Funding Sources Detail */}
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

  // 4. Carácter Económico (Current expenses, capital investment, debt service)
  const renderCaracterEconomico = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Character Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-blue-600" />
            Carácter Económico del Gasto
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="economic_character"
              year={selectedYear}
              variant="donut"
              height={350}
            />
          </ErrorBoundary>
        </div>

        {/* Investment vs Current Spending */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Inversión vs Gasto Corriente
          </h3>
          <ErrorBoundary>
            <BudgetAnalysisChart year={selectedYear} height={350} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Economic Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías Económicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-700">💰 Gastos Corrientes</h4>
            <p className="text-sm text-blue-600">Sueldos, servicios, mantenimiento</p>
            <p className="text-xs text-gray-600 mt-1">Multi-fuente: CSV + JSON + PDF</p>
          </div>
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-700">🏗️ Inversión de Capital</h4>
            <p className="text-sm text-green-600">Obras públicas e infraestructura</p>
            <p className="text-xs text-gray-600 mt-1">Fuente: Contratos + Licitaciones</p>
          </div>
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
            <h4 className="font-semibold text-red-700">💳 Servicio de Deuda</h4>
            <p className="text-sm text-red-600">Amortización e intereses</p>
            <p className="text-xs text-gray-600 mt-1">Fuente: API externa + informes</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. Gender-responsive budgeting
  const renderGenderPerspective = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Budget Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
            Presupuesto con Perspectiva de Género
          </h3>
          <ErrorBoundary>
            <GenderBudgetingChart year={selectedYear} height={350} />
          </ErrorBoundary>
        </div>

        {/* Gender Programs Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-pink-600" />
            Programas Orientados por Género
          </h3>
          <ErrorBoundary>
            <UnifiedChart
              type="gender_programs"
              year={selectedYear}
              variant="bar"
              height={350}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Gender Impact Areas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Áreas de Impacto de Género</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { area: 'Salud Reproductiva', icon: '🏥', impact: 'Alto' },
            { area: 'Educación Inclusiva', icon: '📚', impact: 'Alto' },
            { area: 'Violencia de Género', icon: '🛡️', impact: 'Crítico' },
            { area: 'Participación Política', icon: '🗳️', impact: 'Medio' }
          ].map((item, index) => (
            <div key={item.area} className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="font-semibold text-purple-700">{item.area}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.impact === 'Crítico' ? 'bg-red-100 text-red-700' :
                item.impact === 'Alto' ? 'bg-orange-100 text-orange-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                Impacto {item.impact}
              </span>
              <p className="text-xs text-gray-600 mt-1">Datos etiquetados por género</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSources = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Fuentes de Datos
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

      {dataInventory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-purple-600" />
            Inventario de Datos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{dataInventory.csv.length}</p>
              <p className="text-sm text-gray-500">Archivos CSV</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dataInventory.json.length}</p>
              <p className="text-sm text-gray-500">Archivos JSON</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{dataInventory.pdf.length}</p>
              <p className="text-sm text-gray-500">Documentos PDF</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{dataInventory.external.length}</p>
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
        <title>{`Presupuesto ${selectedYear} - Portal de Transparencia Carmen de Areco`}</title>
        <meta name="description" content={`Análisis detallado del presupuesto municipal de Carmen de Areco para el año ${selectedYear}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <DollarSign className="h-8 w-8 mr-3 text-blue-600" />
                  Presupuesto Municipal
                </h1>
                <p className="mt-2 text-gray-600">
                  Análisis detallado del presupuesto y ejecución financiera
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <ResponsiveYearSelector
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  availableYears={availableYears}
                  className="min-w-[200px]"
                />
                {backgroundLoading && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Precargando años...
                  </div>
                )}
                
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
                  { id: 'execution', label: 'Ejecución', icon: Activity },
                  { id: 'finalidad', label: 'Finalidad y Función', icon: PiggyBank },
                  { id: 'financiamiento', label: 'Financiamiento', icon: TrendingUp },
                  { id: 'economico', label: 'Carácter Económico', icon: Scale },
                  { id: 'gender', label: 'Perspectiva de Género', icon: CheckCircle },
                  { id: 'sources', label: 'Fuentes de Datos', icon: Database }
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
                <p className="text-gray-600">Cargando datos presupuestarios...</p>
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
              {viewMode === 'execution' && renderBudgetExecution()}
              {viewMode === 'finalidad' && renderFinalidadFuncion()}
              {viewMode === 'financiamiento' && renderFuentesFinanciamiento()}
              {viewMode === 'economico' && renderCaracterEconomico()}
              {viewMode === 'gender' && renderGenderPerspective()}
              {viewMode === 'sources' && renderSources()}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default BudgetUnified;
