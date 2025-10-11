/**
 * Budget Page - Unified Data Integration
 * Displays budget data from all sources: CSV, JSON, PDFs
 */

import React, { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';

import { useMasterData } from '../hooks/useMasterData';
import PageYearSelector from '../components/forms/PageYearSelector';
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
import UnifiedDataViewer from '../components/data-viewers/UnifiedDataViewer';
import PDFGallery from '../components/data-viewers/PDFGallery';
import DataVisualization from '../components/charts/DataVisualization';
import DataTable from '../components/tables/DataTable';

// Mock data for demonstration - in real app this would come from API
import { getNationalData } from '../services/NationalDataService';

// Generate municipal datasets
const generateMunicipalBudgetDatasets = (count: number) => {
  const datasets = [];
  for (let i = 0; i < count; i++) {
    datasets.push({
      id: `municipal-budget-${i + 1}`,
      title: `Dataset Presupuestario Municipal #${i + 1}`,
      description: `Datos detallados de ejecución presupuestaria municipal por categoría y mes`,
      category: 'Presupuesto y Financiero',
      formats: ['csv', 'xlsx', 'json'],
      size: `${Math.round(Math.random() * 5) + 1}.${Math.round(Math.random() * 9)} MB`,
      lastUpdated: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      url: `/data/municipal-budget-${i + 1}.csv`,
      accessibility: {
        compliant: Math.random() > 0.2,
        standards: ['WCAG 2.1 AA']
      },
      source: 'Municipal',
      license: 'Creative Commons',
      tags: ['presupuesto', 'financiero', 'municipal', '2024'],
      updateFrequency: Math.random() > 0.5 ? 'mensual' : 'trimestral',
      downloads: Math.floor(Math.random() * 200) + 50
    });
  }
  return datasets;
};

// Generate municipal budget PDFs
const generateMunicipalBudgetPDFs = (count: number) => {
  const pdfs = [];
  for (let i = 0; i < count; i++) {
    pdfs.push({
      id: `municipal-budget-pdf-${i + 1}`,
      title: `Documento Presupuestario Municipal #${i + 1}`,
      description: `Documento PDF oficial sobre presupuesto municipal`,
      category: 'Presupuesto y Financiero',
      size: `${Math.round(Math.random() * 15) + 5} MB`,
      lastUpdated: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      url: `/data/municipal-budget-${i + 1}.pdf`,
      tags: ['presupuesto', 'ley', 'municipal', '2024'],
      source: 'Municipal',
      page: 'finances'
    });
  }
  return pdfs;
};

// Combine municipal and national budget data
const municipalBudgetDatasets = generateMunicipalBudgetDatasets(5); // 5 municipal datasets
const municipalBudgetPDFs = generateMunicipalBudgetPDFs(3); // 3 municipal PDFs

const nationalData = getNationalData();
const nationalBudgetDatasets = nationalData.datasets.filter((d: any) => d.category.includes('Economía') || d.category.includes('Finanzas'));
const nationalBudgetPDFs = nationalData.documents.filter((d: any) => d.category.includes('Economía') || d.category.includes('Finanzas'));

// Combine all budget-related datasets and documents
const mockBudgetDatasets = [
  ...municipalBudgetDatasets,
  ...nationalBudgetDatasets.slice(0, 10) // Include first 10 national datasets
];

const mockBudgetPDFs = [
  ...municipalBudgetPDFs,
  ...nationalBudgetPDFs.slice(0, 5) // Include first 5 national PDFs
];

const mockChartData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
  datasets: [
    {
      label: 'Presupuesto',
      data: [65000000, 70000000, 68000000, 72000000, 75000000, 73000000],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    },
    {
      label: 'Ejecutado',
      data: [58000000, 63000000, 59000000, 65000000, 67000000, 60000000],
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1
    }
  ]
};

const mockTableData = [
  ['Personal', '45,000,000', '42,000,000', '93.3%'],
  ['Servicios', '20,000,000', '18,500,000', '92.5%'],
  ['Obras', '15,000,000', '13,200,000', '88.0%'],
  ['Salud', '8,000,000', '7,800,000', '97.5%'],
  ['Educación', '6,000,000', '5,500,000', '91.7%']
];

const Budget: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'execution' | 'finalidad' | 'financiamiento' | 'economico' | 'gender' | 'sources' | 'data' | 'reports'>('overview');

  // Multi-year data hook - preloads all years for instant switching
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    loading: dataLoading,
    error,
    totalDocuments,
    availableYears: allAvailableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

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
    if (rate >= 90) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 70) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 50) return { status: 'moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Extract budget data from current year
  const budgetData = currentBudget;

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
                <PageYearSelector
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  availableYears={allAvailableYears}
                  size="md"
                  label="Año de consulta"
                  showDataAvailability={true}
                />
                
                <button
                  onClick={refetch}
                  disabled={dataLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${dataLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6">
              <nav className="flex overflow-x-auto">
                {[
                  { id: 'overview', label: 'Resumen', icon: BarChart3 },
                  { id: 'execution', label: 'Ejecución', icon: Activity },
                  { id: 'finalidad', label: 'Finalidad y Función', icon: PiggyBank },
                  { id: 'financiamiento', label: 'Financiamiento', icon: TrendingUp },
                  { id: 'economico', label: 'Carácter Económico', icon: Scale },
                  { id: 'gender', label: 'Perspectiva de Género', icon: CheckCircle },
                  { id: 'data', label: 'Datos Abiertos', icon: Database },
                  { id: 'reports', label: 'Reportes', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <tab.icon className="h-4 w-4 mr-1" />
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
          {dataLoading && (
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
          {!dataLoading && !error && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
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
                          <DataVisualization 
                            type="pie" 
                            title="Distribución del Presupuesto" 
                            data={mockChartData}
                            height={250}
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
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <UnifiedDataViewer 
                    datasets={masterData?.metadata?.datasets || mockBudgetDatasets}
                    documents={currentDocuments || mockBudgetPDFs}
                    title="Datos Abiertos de Presupuesto"
                    description="Conjuntos de datos estructurados relacionados con el presupuesto municipal"
                    showFilters={true}
                    showSearch={true}
                    defaultView="grid"
                  />
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <PDFGallery 
                    documents={mockBudgetPDFs}
                    title="Reportes y Documentos PDF de Presupuesto"
                    description="Documentos oficiales en formato PDF relacionados con el presupuesto municipal"
                    maxDocuments={20}
                  />
                </div>
              )}

              {/* All other tabs */}
              {activeTab === 'execution' && (
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
              )}

              {activeTab === 'finalidad' && (
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
              )}

              {activeTab === 'financiamiento' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart - Funding Sources */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Fuentes de Financiamiento
                      </h3>
                      <ErrorBoundary>
                        <DataVisualization 
                          type="pie" 
                          title="Distribución de Fuentes de Financiamiento" 
                          data={mockChartData}
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
              )}

              {activeTab === 'economico' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Economic Character Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Scale className="h-5 w-5 mr-2 text-blue-600" />
                        Carácter Económico del Gasto
                      </h3>
                      <ErrorBoundary>
                        <DataVisualization 
                          type="doughnut" 
                          title="Carácter Económico del Gasto" 
                          data={mockChartData}
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
              )}

              {activeTab === 'gender' && (
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
                        <DataVisualization 
                          type="bar" 
                          title="Programas con Enfoque de Género" 
                          data={mockChartData}
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
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Budget;