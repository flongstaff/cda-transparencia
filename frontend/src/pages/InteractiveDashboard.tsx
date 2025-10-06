/***
 * Interactive Dashboard Page for Carmen de Areco Transparency Portal
 * Integrates all available chart types with interactive features
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Search,
  Download,
  RefreshCw,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  FileText,
  MapPin,
  Filter,
  LayoutDashboard,
  PieChart,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  AreaChart,
  ScatterChart,
  Radar,
  Activity,
  Layers,
  Grid3X3,
  Sliders,
  Settings,
  LayersIcon,
  CalendarIcon,
  DownloadIcon
} from 'lucide-react';
import { useDashboardData } from '../hooks/useUnifiedData';
import { YearSelector } from '../components/common/YearSelector';
import { DataSourcesIndicator } from '../components/common/DataSourcesIndicator';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Import all chart components
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import RevenueBySourceChart from '../components/charts/RevenueBySourceChart';
import ExpenditureByProgramChart from '../components/charts/ExpenditureByProgramChart';
import DebtAnalysisChart from '../components/charts/DebtAnalysisChart';
import PersonnelExpensesChart from '../components/charts/PersonnelExpensesChart';
import InfrastructureProjectsChart from '../components/charts/InfrastructureProjectsChart';
import ContractAnalysisChart from '../components/charts/ContractAnalysisChart';
import SalaryAnalysisChart from '../components/charts/SalaryAnalysisChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import GenderBudgetingChart from '../components/charts/GenderBudgetingChart';
import FinancialReservesChart from '../components/charts/FinancialReservesChart';
import MultiYearRevenueChart from '../components/charts/MultiYearRevenueChart';
import QuarterlyExecutionChart from '../components/charts/QuarterlyExecutionChart';
import WaterfallExecutionChart from '../components/charts/WaterfallExecutionChart';
import TreasuryAnalysisChart from '../components/charts/TreasuryAnalysisChart';
import ComplianceChart from '../components/charts/ComplianceChart';
import RadarChart from '../components/charts/RadarChart';
import TreemapChart from '../components/charts/TreemapChart';
import GanttChart from '../components/charts/GanttChart';
import FunnelChart from '../components/charts/FunnelChart';
import ProcurementTimelineChart from '../components/charts/ProcurementTimelineChart';
import UserEngagementChart from '../components/charts/UserEngagementChart';
import ImprovedBudgetExecutionChart from '../components/charts/ImprovedBudgetExecutionChart';
import EconomicReportChart from '../components/charts/EconomicReportChart';
import EducationDataChart from '../components/charts/EducationDataChart';
import HealthStatisticsChart from '../components/charts/HealthStatisticsChart';
import InvestmentReportChart from '../components/charts/InvestmentReportChart';
import RevenueReportChart from '../components/charts/RevenueReportChart';
import ExpenditureReportChart from '../components/charts/ExpenditureReportChart';
import DebtReportChart from '../components/charts/DebtReportChart';
import FiscalBalanceReportChart from '../components/charts/FiscalBalanceReportChart';
import PropertyDeclarationsChart from '../components/charts/PropertyDeclarationsChart';
import YearlyComparisonChart from '../components/charts/YearlyComparisonChart';
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import GeographicInfrastructureProjectsMap from '../components/geo/GeographicInfrastructureProjectsMap';
import BudgetExecutionChartWrapperStandardized from '../components/charts/BudgetExecutionChartWrapperStandardized';
import UnifiedDashboardChart from '../components/charts/UnifiedDashboardChart';
import EnhancedDataVisualization from '../components/charts/EnhancedDataVisualization';
import UniversalChart from '../components/charts/UniversalChart';
import StandardizedChart from '../components/charts/StandardizedChart';

interface InteractiveDashboardProps {
  initialYear?: number;
  municipality?: string;
}

const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  initialYear = new Date().getFullYear(),
  municipality = 'Carmen de Areco'
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeTab, setActiveTab] = useState<string>('financial');
  const [chartSize, setChartSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [chartFilter, setChartFilter] = useState<string>('all');
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

  // Define chart categories and configurations
  const chartCategories = [
    { id: 'financial', label: 'Financiero', icon: DollarSign },
    { id: 'operational', label: 'Operativo', icon: Building },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'geographic', label: 'Geográfico', icon: MapPin },
    { id: 'time-series', label: 'Series Temporales', icon: LineChartIcon },
    { id: 'compliance', label: 'Cumplimiento', icon: FileText },
  ];

  // Define chart configurations
  const chartConfigs = [
    {
      id: 'budget-execution',
      title: 'Ejecución Presupuestaria',
      category: 'financial',
      component: <BudgetAnalysisChart selectedYear={selectedYear} />,
      icon: BarChartIcon
    },
    {
      id: 'revenue-sources',
      title: 'Ingresos por Fuente',
      category: 'financial',
      component: <RevenueBySourceChart selectedYear={selectedYear} />,
      icon: PieChart
    },
    {
      id: 'expenditure-programs',
      title: 'Gastos por Programa',
      category: 'financial',
      component: <ExpenditureByProgramChart selectedYear={selectedYear} />,
      icon: AreaChart
    },
    {
      id: 'debt-analysis',
      title: 'Análisis de Deuda',
      category: 'financial',
      component: <DebtAnalysisChart selectedYear={selectedYear} />,
      icon: TrendingUp
    },
    {
      id: 'personnel-expenses',
      title: 'Gastos de Personal',
      category: 'operational',
      component: <PersonnelExpensesChart selectedYear={selectedYear} />,
      icon: Users
    },
    {
      id: 'infrastructure-projects',
      title: 'Proyectos de Infraestructura',
      category: 'operational',
      component: <InfrastructureProjectsChart selectedYear={selectedYear} />,
      icon: Building
    },
    {
      id: 'contracts-analysis',
      title: 'Análisis de Contratos',
      category: 'compliance',
      component: <ContractAnalysisChart selectedYear={selectedYear} />,
      icon: FileText
    },
    {
      id: 'salary-analysis',
      title: 'Análisis de Salarios',
      category: 'social',
      component: <SalaryAnalysisChart selectedYear={selectedYear} />,
      icon: DollarSign
    },
    {
      id: 'time-series',
      title: 'Series Temporales',
      category: 'time-series',
      component: <TimeSeriesChart 
        type="Budget_Execution"
        year={selectedYear}
        dataKey="year"
        valueKey="budget"
      />,
      icon: LineChartIcon
    },
    {
      id: 'gender-budgeting',
      title: 'Presupuesto por Género',
      category: 'social',
      component: <GenderBudgetingChart selectedYear={selectedYear} />,
      icon: Users
    },
    {
      id: 'treasury-analysis',
      title: 'Análisis del Tesoro',
      category: 'financial',
      component: <TreasuryAnalysisChart selectedYear={selectedYear} />,
      icon: DollarSign
    },
    {
      id: 'compliance',
      title: 'Cumplimiento',
      category: 'compliance',
      component: <ComplianceChart selectedYear={selectedYear} />,
      icon: FileText
    },
    {
      id: 'radar',
      title: 'Gráfico Radar',
      category: 'financial',
      component: <RadarChart selectedYear={selectedYear} />,
      icon: Radar
    },
    {
      id: 'treemap',
      title: 'Mapa de Árbol',
      category: 'financial',
      component: <TreemapChart selectedYear={selectedYear} />,
      icon: Grid3X3
    },
    {
      id: 'gantt',
      title: 'Diagrama de Gantt',
      category: 'operational',
      component: <GanttChart selectedYear={selectedYear} />,
      icon: LayersIcon
    },
    {
      id: 'geographic-map',
      title: 'Mapa Geográfico',
      category: 'geographic',
      component: <GeographicInfrastructureProjectsMap 
        year={selectedYear} 
        height={400} 
      />,
      icon: MapPin
    },
    {
      id: 'procurement-timeline',
      title: 'Cronograma de Contrataciones',
      category: 'operational',
      component: <ProcurementTimelineChart selectedYear={selectedYear} />,
      icon: CalendarIcon
    },
    {
      id: 'multi-year-revenue',
      title: 'Ingresos Multi-Año',
      category: 'financial',
      component: <MultiYearRevenueChart selectedYear={selectedYear} />,
      icon: BarChartIcon
    },
    {
      id: 'quarterly-execution',
      title: 'Ejecución Trimestral',
      category: 'financial',
      component: <QuarterlyExecutionChart selectedYear={selectedYear} />,
      icon: BarChartIcon
    },
    {
      id: 'waterfall-execution',
      title: 'Ejecución en Cascada',
      category: 'financial',
      component: <WaterfallExecutionChart selectedYear={selectedYear} />,
      icon: BarChartIcon
    },
    {
      id: 'user-engagement',
      title: 'Participación Ciudadana',
      category: 'social',
      component: <UserEngagementChart selectedYear={selectedYear} />,
      icon: Activity
    },
    {
      id: 'improved-budget',
      title: 'Gráfico Mejorado',
      category: 'financial',
      component: <ImprovedBudgetExecutionChart selectedYear={selectedYear} />,
      icon: BarChartIcon
    },
    {
      id: 'unified-dashboard',
      title: 'Dashboard Unificado',
      category: 'financial',
      component: <UnifiedDashboardChart year={selectedYear} />,
      icon: LayoutDashboard
    },
    {
      id: 'enhanced-viz',
      title: 'Visualización Mejorada',
      category: 'financial',
      component: <EnhancedDataVisualization 
        year={selectedYear} 
        dataType="budget" 
        variant="dashboard" 
      />,
      icon: Activity
    },
    {
      id: 'universal-chart',
      title: 'Gráfico Universal',
      category: 'financial',
      component: <UniversalChart 
        year={selectedYear} 
        chartType="line" 
        dataKey="budget" 
      />,
      icon: BarChartIcon
    },
  ];

  // Filter charts based on category and search
  const filteredCharts = chartConfigs.filter(chart => {
    const matchesCategory = chartFilter === 'all' || chart.category === chartFilter;
    const matchesSearch = chart.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <LayoutDashboard className="w-8 h-8 mr-3 text-blue-600" />
                Dashboard Interactivo - {municipality}
              </h1>
              <p className="mt-2 text-gray-600">
                Análisis integral de datos financieros municipales con visualizaciones interactivas
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en los gráficos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
                className="flex-1 pl-3 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las categorías</option>
                <option value="financial">Financiero</option>
                <option value="operational">Operativo</option>
                <option value="social">Social</option>
                <option value="geographic">Geográfico</option>
                <option value="time-series">Series Temporales</option>
                <option value="compliance">Cumplimiento</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto py-2 space-x-8">
            {chartCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setChartFilter(category.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  chartFilter === category.id || (chartFilter === 'all' && category.id === 'financial')
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chart Controls */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Visualizaciones Interactivas
            </h2>
            <p className="text-gray-600">
              Mostrando {filteredCharts.length} gráficos
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tamaño:</span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setChartSize(size)}
                    className={`px-3 py-1 text-sm ${
                      chartSize === size
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Cargando datos del dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error en el Sistema</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {!loading && !error && (
          <div className={`grid grid-cols-1 ${
            chartSize === 'small' ? 'md:grid-cols-2 lg:grid-cols-3' : 
            chartSize === 'medium' ? 'md:grid-cols-2' : 
            'md:grid-cols-1'
          } gap-6`}>
            {filteredCharts.map((chart, index) => (
              <motion.div
                key={chart.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <chart.icon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">{chart.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </button>
                    <button 
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                      title="Exportar datos"
                    >
                      <Download className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <ErrorBoundary
                    fallback={(error) => (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">Error al cargar el gráfico: {error?.message || 'Gráfico no disponible'}</p>
                      </div>
                    )}
                  >
                    {chart.component}
                  </ErrorBoundary>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredCharts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron gráficos</h3>
            <p className="mt-2 text-gray-600">
              No hay gráficos que coincidan con tu búsqueda o filtro.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setChartFilter('all');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Interactivo</h3>
              <p className="text-gray-600 text-sm">
                Sistema integral de visualización de datos con múltiples gráficos interactivos.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
              <ul className="space-y-2 text-sm">
                {chartCategories.map((category) => (
                  <li key={category.id}>
                    <button 
                      onClick={() => setChartFilter(category.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {category.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => setChartSize('large')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver gráficos grandes
                  </button>
                </li>
                <li>
                  <button 
                    onClick={refetch}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Actualizar datos
                  </button>
                </li>
                <li>
                  <a href="/reports" className="text-blue-600 hover:text-blue-800">
                    Ver informes completos
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 Dashboard Interactivo - {municipality}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrap with error boundary for production safety
const InteractiveDashboardWithErrorBoundary: React.FC = () => {
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
                  Error al Cargar el Dashboard
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Ocurrió un error al cargar los datos del dashboard. Por favor, intente más tarde.</p>
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
      <InteractiveDashboard />
    </ErrorBoundary>
  );
};

export default InteractiveDashboardWithErrorBoundary;