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
import { StatCard } from '../components/common/StatCard';
import { ChartContainer } from '../components/common/ChartContainer';
import UnifiedDataViewer from '../components/data-viewers/UnifiedDataViewer';
import PDFGallery from '../components/data-viewers/PDFGallery';
import DataVisualization from '../components/charts/DataVisualization';
import DataTable from '../components/tables/DataTable';

// Mock data for demonstration - in real app this would come from API
import { getNationalData } from '../services/NationalDataService';

// Generate municipal datasets
const generateMunicipalTreasuryDatasets = (count: number) => {
  const datasets = [];
  for (let i = 0; i < count; i++) {
    datasets.push({
      id: `municipal-treasury-${i + 1}`,
      title: `Dataset de Tesorería Municipal #${i + 1}`,
      description: `Datos detallados de tesorería municipal por período`,
      category: 'Tesorería y Finanzas',
      formats: ['csv', 'xlsx', 'json'],
      size: `${Math.round(Math.random() * 5) + 1}.${Math.round(Math.random() * 9)} MB`,
      lastUpdated: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      url: `/data/municipal-treasury-${i + 1}.csv`,
      accessibility: {
        compliant: Math.random() > 0.2,
        standards: ['WCAG 2.1 AA']
      },
      source: 'Municipal',
      license: 'Creative Commons',
      tags: ['tesorería', 'finanzas', 'municipal', '2024'],
      updateFrequency: Math.random() > 0.5 ? 'mensual' : 'trimestral',
      downloads: Math.floor(Math.random() * 200) + 50
    });
  }
  return datasets;
};

// Generate municipal treasury PDFs
const generateMunicipalTreasuryPDFs = (count: number) => {
  const pdfs = [];
  for (let i = 0; i < count; i++) {
    pdfs.push({
      id: `municipal-treasury-pdf-${i + 1}`,
      title: `Documento de Tesorería Municipal #${i + 1}`,
      description: `Documento PDF oficial sobre tesorería municipal`,
      category: 'Tesorería y Finanzas',
      size: `${Math.round(Math.random() * 15) + 5} MB`,
      lastUpdated: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      url: `/data/municipal-treasury-${i + 1}.pdf`,
      tags: ['tesorería', 'finanzas', 'municipal', '2024'],
      source: 'Municipal',
      page: 'finances'
    });
  }
  return pdfs;
};

// Combine municipal and national treasury data
const municipalTreasuryDatasets = generateMunicipalTreasuryDatasets(4); // 4 municipal datasets
const municipalTreasuryPDFs = generateMunicipalTreasuryPDFs(2); // 2 municipal PDFs

const nationalData = getNationalData();
const nationalTreasuryDatasets = nationalData.datasets.filter((d: any) => d.category.includes('Economía') || d.category.includes('Finanzas'));
const nationalTreasuryPDFs = nationalData.documents.filter((d: any) => d.category.includes('Economía') || d.category.includes('Finanzas'));

// Combine all treasury-related datasets and documents
const mockTreasuryDatasets = [
  ...municipalTreasuryDatasets,
  ...nationalTreasuryDatasets.slice(0, 8) // Include first 8 national datasets
];

const mockTreasuryPDFs = [
  ...municipalTreasuryPDFs,
  ...nationalTreasuryPDFs.slice(0, 4) // Include first 4 national PDFs
];

const mockChartData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
  datasets: [
    {
      label: 'Ingresos',
      data: [65000000, 70000000, 68000000, 72000000, 75000000, 73000000],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    },
    {
      label: 'Gastos',
      data: [58000000, 63000000, 59000000, 65000000, 67000000, 60000000],
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 1
    }
  ]
};

const mockTableData = [
  ['Enero', '65,000,000', '58,000,000', '7,000,000'],
  ['Febrero', '70,000,000', '63,000,000', '7,000,000'],
  ['Marzo', '68,000,000', '59,000,000', '9,000,000'],
  ['Abril', '72,000,000', '65,000,000', '7,000,000'],
  ['Mayo', '75,000,000', '67,000,000', '8,000,000'],
  ['Junio', '73,000,000', '60,000,000', '13,000,000']
];

const TreasuryUnified: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'sef' | 'cashflow' | 'revenue' | 'expenses' | 'sources' | 'data' | 'reports'>('overview');

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
              <nav className="flex overflow-x-auto">
                {[
                  { id: 'overview', label: 'Resumen', icon: BarChart3 },
                  { id: 'sef', label: 'SEF Reports', icon: FileText },
                  { id: 'cashflow', label: 'Flujo de Caja', icon: Activity },
                  { id: 'revenue', label: 'Ingresos', icon: TrendingUp },
                  { id: 'expenses', label: 'Gastos', icon: TrendingDown },
                  { id: 'data', label: 'Datos Abiertos', icon: Database },
                  { id: 'reports', label: 'Reportes', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'border-green-500 text-green-600'
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
                      title="Ingresos Totales"
                      value={treasuryData?.total_revenue ? formatCurrency(treasuryData.total_revenue) : 'N/A'}
                      subtitle="Recaudación del período"
                      icon={TrendingUp}
                      iconColor="green"
                      delay={0}
                    />

                    <StatCard
                      title="Gastos Totales"
                      value={treasuryData?.total_expenses ? formatCurrency(treasuryData.total_expenses) : 'N/A'}
                      subtitle="Erogaciones del período"
                      icon={TrendingDown}
                      iconColor="red"
                      delay={0.1}
                    />

                    <StatCard
                      title="Balance"
                      value={treasuryData?.balance ? formatCurrency(treasuryData.balance) : 'N/A'}
                      subtitle={treasuryData?.balance && treasuryData.balance >= 0 ? 'Superávit' : 'Déficit'}
                      icon={PiggyBank}
                      iconColor={treasuryData?.balance && treasuryData.balance >= 0 ? 'green' : 'red'}
                      trend={treasuryData?.balance ? {
                        value: treasuryData.balance,
                        direction: treasuryData.balance >= 0 ? 'up' : 'down',
                        label: treasuryData.balance >= 0 ? 'positivo' : 'negativo'
                      } : undefined}
                      delay={0.2}
                    />

                    <StatCard
                      title="Eficiencia Fiscal"
                      value={treasuryData?.total_revenue && treasuryData?.total_expenses
                        ? formatPercentage((treasuryData.total_revenue / treasuryData.total_expenses) * 100)
                        : 'N/A'}
                      subtitle="Ingresos / Gastos"
                      icon={Activity}
                      iconColor="blue"
                      delay={0.3}
                    />
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartContainer
                      title="Fuentes de Ingresos"
                      description="Distribución por origen de recursos"
                      icon={BarChart3}
                      height={280}
                      delay={0.4}
                    >
                      <ErrorBoundary>
                        <DataVisualization
                          type="pie"
                          title="Distribución de Ingresos"
                          data={mockChartData}
                          height={250}
                        />
                      </ErrorBoundary>
                    </ChartContainer>

                    <ChartContainer
                      title="Distribución de Gastos"
                      description="Erogaciones por categoría"
                      icon={TrendingDown}
                      height={280}
                      delay={0.5}
                    >
                      <ErrorBoundary>
                        <DataVisualization
                          type="doughnut"
                          title="Distribución de Gastos"
                          data={mockChartData}
                          height={250}
                        />
                      </ErrorBoundary>
                    </ChartContainer>
                  </div>

                  {/* Additional Treasury Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartContainer
                      title="Análisis del Tesoro"
                      description="Evolución temporal de ingresos y gastos"
                      icon={Activity}
                      height={280}
                      delay={0.6}
                    >
                      <ErrorBoundary>
                        <TreasuryAnalysisChart
                          year={selectedYear}
                        />
                      </ErrorBoundary>
                    </ChartContainer>

                    <ChartContainer
                      title="Reservas Financieras"
                      description="Disponibilidad y liquidez"
                      icon={DollarSign}
                      height={280}
                      delay={0.7}
                    >
                      <ErrorBoundary>
                        <FinancialReservesChart
                          year={selectedYear}
                          height={250}
                        />
                      </ErrorBoundary>
                    </ChartContainer>
                  </div>
                </div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <UnifiedDataViewer 
                    datasets={mockTreasuryDatasets}
                    documents={mockTreasuryPDFs}
                    title="Datos Abiertos de Tesorería"
                    description="Conjuntos de datos estructurados relacionados con la tesorería municipal"
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
                    documents={mockTreasuryPDFs}
                    title="Reportes y Documentos PDF de Tesorería"
                    description="Documentos oficiales en formato PDF relacionados con la tesorería municipal"
                    maxDocuments={20}
                  />
                </div>
              )}

              {/* SEF Reports Tab */}
              {activeTab === 'sef' && (
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
                            <DataVisualization
                              type="line"
                              title="Evolución Trimestral - Ingresos vs Gastos"
                              data={mockChartData}
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
              )}

              {/* Cash Flow Tab */}
              {activeTab === 'cashflow' && (
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
                            <DataVisualization
                              type="line"
                              title="Entradas y Salidas de Efectivo"
                              data={mockChartData}
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

                    {/* Cash Flow Data Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white border border-gray-200 rounded-xl p-6"
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                        Flujo de Caja Detallado
                      </h4>
                      <DataTable
                        title="Flujo de Caja Mensual"
                        headers={['Mes', 'Ingresos', 'Gastos', 'Balance']}
                        data={mockTableData}
                        downloadable={true}
                        searchable={true}
                      />
                    </motion.div>
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

export default TreasuryUnified;