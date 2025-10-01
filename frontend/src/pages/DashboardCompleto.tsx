/**
 * DASHBOARD COMPLETO
 *
 * Dashboard integral que unifica todos los dashboards existentes en una vista completa
 * con selección de año por página y datos precargados para rendimiento óptimo.
 */

import React, { useState, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Heart,
  Wrench,
  FileText,
  TrendingDown,
  Wallet,
  ArrowUpDown,
  Package,
  Eye,
  Shield,
  Search,
  Calendar,
  Activity,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Database,
  Award,
  AlertTriangle,
  CreditCard,
  Mail,
  Info,
  Archive,
  Filter,
  Download,
  Scale,
  PiggyBank,
  Clock
} from 'lucide-react';

// Import enhanced year selector and data hooks
import ResponsiveYearSelector from '../components/forms/ResponsiveYearSelector';
import { useMultiYearData } from '../hooks/useMultiYearData';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import RechartsWrapper from '../components/charts/RechartsWrapper';

// Import all chart components
import BudgetExecutionChartWrapper from '../components/charts/BudgetExecutionChartWrapper';
import DebtReportChart from '../components/charts/DebtReportChart';
import ChartAuditReport from '../components/charts/ChartAuditReport';

// Import chart integration utilities
import { ChartsGrid, AuditSection, QuickStats } from '../utils/chartIntegration';
import EconomicReportChart from '../components/charts/EconomicReportChart';
import EducationDataChart from '../components/charts/EducationDataChart';
import ExpenditureReportChart from '../components/charts/ExpenditureReportChart';
import FinancialReservesChart from '../components/charts/FinancialReservesChart';
import FiscalBalanceReportChart from '../components/charts/FiscalBalanceReportChart';
import HealthStatisticsChart from '../components/charts/HealthStatisticsChart';
import InfrastructureProjectsChart from '../components/charts/InfrastructureProjectsChart';
import InvestmentReportChart from '../components/charts/InvestmentReportChart';
import PersonnelExpensesChart from '../components/charts/PersonnelExpensesChart';
import RevenueReportChart from '../components/charts/RevenueReportChart';
import RevenueSourcesChart from '../components/charts/RevenueSourcesChart';

// Import newer chart components
import QuarterlyExecutionChart from '../components/charts/QuarterlyExecutionChart';
import ProgrammaticPerformanceChart from '../components/charts/ProgrammaticPerformanceChart';
import GenderBudgetingChart from '../components/charts/GenderBudgetingChart';
import WaterfallExecutionChart from '../components/charts/WaterfallExecutionChart';

// Import dynamic chart components
import DynamicChartLoader from '../components/charts/DynamicChartLoader';
import ComprehensiveChartGrid from '../components/charts/ComprehensiveChartGrid';

// Dashboard sections configuration
const DASHBOARD_SECTIONS = [
  {
    id: 'overview',
    title: 'Resumen General',
    description: 'Vista general del sistema de transparencia municipal',
    icon: Eye,
    color: 'blue'
  },
  {
    id: 'financial',
    title: 'Análisis Financiero',
    description: 'Análisis completo de la situación financiera municipal',
    icon: DollarSign,
    color: 'green'
  },
  {
    id: 'transparency',
    title: 'Transparencia & Auditoría',
    description: 'Auditorías, irregularidades y verificación de datos',
    icon: Shield,
    color: 'indigo'
  },
  {
    id: 'charts',
    title: 'Visualizaciones',
    description: 'Todas las 13 visualizaciones de datos financieros',
    icon: BarChart3,
    color: 'purple'
  },
  {
    id: 'operations',
    title: 'Operaciones',
    description: 'Contratos, licitaciones y gestión operativa',
    icon: Building,
    color: 'orange'
  },
  {
    id: 'services',
    title: 'Servicios Públicos',
    description: 'Salud, educación e infraestructura',
    icon: Heart,
    color: 'red'
  }
];

// Chart configuration for the visualization section
const CHART_METADATA = [
  {
    id: 'budget-execution',
    title: 'Ejecución Presupuestaria',
    description: 'Comparación entre presupuesto aprobado y ejecutado',
    icon: BarChart3,
    component: BudgetExecutionChartWrapper,
    category: 'financial'
  },
  {
    id: 'debt-report',
    title: 'Informe de Deuda',
    description: 'Análisis de la deuda municipal y sus componentes',
    icon: TrendingDown,
    component: DebtReportChart,
    category: 'financial'
  },
  {
    id: 'economic-report',
    title: 'Informe Económico',
    description: 'Indicadores económicos del municipio',
    icon: TrendingUp,
    component: EconomicReportChart,
    category: 'financial'
  },
  {
    id: 'education-data',
    title: 'Datos Educativos',
    description: 'Estadísticas educativas y presupuesto por nivel',
    icon: FileText,
    component: EducationDataChart,
    category: 'services'
  },
  {
    id: 'expenditure-report',
    title: 'Informe de Gastos',
    description: 'Desglose detallado de los gastos municipales',
    icon: DollarSign,
    component: ExpenditureReportChart,
    category: 'financial'
  },
  {
    id: 'financial-reserves',
    title: 'Reservas Financieras',
    description: 'Estado de las reservas financieras del municipio',
    icon: Wallet,
    component: FinancialReservesChart,
    category: 'financial'
  },
  {
    id: 'fiscal-balance',
    title: 'Balance Fiscal',
    description: 'Ingresos vs egresos y resultado fiscal',
    icon: ArrowUpDown,
    component: FiscalBalanceReportChart,
    category: 'financial'
  },
  {
    id: 'health-statistics',
    title: 'Estadísticas de Salud',
    description: 'Indicadores de salud pública y gastos en salud',
    icon: Heart,
    component: HealthStatisticsChart,
    category: 'services'
  },
  {
    id: 'infrastructure-projects',
    title: 'Proyectos de Infraestructura',
    description: 'Avance y presupuesto de proyectos de infraestructura',
    icon: Wrench,
    component: InfrastructureProjectsChart,
    category: 'services'
  },
  {
    id: 'investment-report',
    title: 'Informe de Inversiones',
    description: 'Análisis de inversiones realizadas por el municipio',
    icon: TrendingUp,
    component: InvestmentReportChart,
    category: 'financial'
  },
  {
    id: 'personnel-expenses',
    title: 'Gastos en Personal',
    description: 'Distribución de gastos en personal municipal',
    icon: Users,
    component: PersonnelExpensesChart,
    category: 'operations'
  },
  {
    id: 'revenue-report',
    title: 'Informe de Ingresos',
    description: 'Fuentes y evolución de los ingresos municipales',
    icon: TrendingUp,
    component: RevenueReportChart,
    category: 'financial'
  },
  {
    id: 'revenue-sources',
    title: 'Fuentes de Ingresos',
    description: 'Detalle por fuente de los ingresos municipales',
    icon: Package,
    component: RevenueSourcesChart,
    category: 'financial'
  },
  {
    id: 'quarterly-execution',
    title: 'Ejecución Trimestral',
    description: 'Tendencias trimestrales de ejecución presupuestaria',
    icon: Calendar,
    component: QuarterlyExecutionChart,
    category: 'financial'
  },
  {
    id: 'programmatic-performance',
    title: 'Rendimiento Programático',
    description: 'Indicadores de desempeño de programas municipales',
    icon: Activity,
    component: ProgrammaticPerformanceChart,
    category: 'performance'
  },
  {
    id: 'gender-budgeting',
    title: 'Presupuesto de Género',
    description: 'Análisis de perspectiva de género en el presupuesto',
    icon: Users,
    component: GenderBudgetingChart,
    category: 'social'
  },
  {
    id: 'waterfall-execution',
    title: 'Ejecución en Cascada',
    description: 'Visualización en cascada de la ejecución acumulativa',
    icon: BarChart3,
    component: WaterfallExecutionChart,
    category: 'financial'
  }
];

// Quick access links
const QUICK_ACCESS_LINKS = [
  {
    id: 'budget',
    title: 'Presupuesto Municipal',
    description: 'Ver el presupuesto municipal aprobado para el año en curso',
    icon: CreditCard,
    link: '/budget',
    color: 'green'
  },
  {
    id: 'expenses',
    title: 'Gastos y Erogaciones',
    description: 'Consultar cómo se están utilizando los recursos municipales',
    icon: TrendingUp,
    link: '/expenses',
    color: 'orange'
  },
  {
    id: 'contracts',
    title: 'Contratos y Licitaciones',
    description: 'Acceder a contratos firmados y licitaciones públicas',
    icon: Building,
    link: '/contracts',
    color: 'blue'
  },
  {
    id: 'documents',
    title: 'Biblioteca de Documentos',
    description: 'Explorar todos los documentos disponibles en el portal',
    icon: Archive,
    link: '/documents',
    color: 'purple'
  },
  {
    id: 'audits',
    title: 'Auditorías',
    description: 'Informes de auditoría y control interno',
    icon: Shield,
    link: '/audits',
    color: 'indigo'
  },
  {
    id: 'database',
    title: 'Base de Datos',
    description: 'Análisis detallado de datos por año fiscal',
    icon: Database,
    link: '/database',
    color: 'teal'
  }
];

const DashboardCompleto: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(() => {
    // Check URL hash on initial load
    const hash = window.location.hash.replace('#', '');
    if (hash && DASHBOARD_SECTIONS.some(section => section.id === hash)) {
      return hash;
    }
    return 'overview';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chartHeight, setChartHeight] = useState<number>(400);
  const [financialViewMode, setFinancialViewMode] = useState<'overview' | 'documents' | 'data' | 'charts' | 'debt'>('overview');
  const [financialSearchTerm, setFinancialSearchTerm] = useState<string>('');
  const [transparencyViewMode, setTransparencyViewMode] = useState<'overview' | 'audit' | 'irregularities' | 'reports'>('overview');

  // Multi-year data hook - preloads ALL years for instant switching
  const {
    selectedYear,
    setSelectedYear,
    currentData,
    allYearsData,
    availableYears,
    initialLoading: isLoading,
    backgroundLoading: isPreloading,
    refresh: refreshData
  } = useMultiYearData(new Date().getFullYear());

  // Extract current year data for easy access
  const currentBudget = currentData?.budget;
  const currentContracts = currentData?.contracts || [];
  const currentDocuments = currentData?.documents || [];
  const currentSalaries = currentData?.salaries;
  const currentTreasury = currentData?.treasury;
  const currentDebt = currentData?.debt;

  // Error state
  const error = currentData?.error || null;

  // Handle year change (instant, no loading)
  const handleYearChange = (year: number) => {
    console.log(`🔀 Year changed to: ${year}`);
    setSelectedYear(year);
    // Data is already preloaded, UI updates instantly
  };

  // Use year-specific data for summary cards
  const workingSummary = useMemo(() => ({
    totalBudget: currentBudget?.total_budget || 0,
    totalExecuted: currentBudget?.total_executed || 0,
    executionRate: currentBudget?.execution_rate || 0,
    totalContracts: currentContracts.length,
    totalDocuments: currentDocuments.length,
    averageCompletion: currentBudget?.execution_rate || 0
  }), [currentBudget, currentContracts, currentDocuments]);

  // Filter charts by category for the current section
  const filteredCharts = useMemo(() => {
    if (activeSection === 'charts') return CHART_METADATA;
    return CHART_METADATA.filter(chart => chart.category === activeSection);
  }, [activeSection]);

  // Effect to handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && DASHBOARD_SECTIONS.some(section => section.id === hash)) {
        setActiveSection(hash);
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial check in case hash was set before component mounted
    handleHashChange();

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando Dashboard Integral</h2>
          <p className="text-gray-600">Preparando toda la información municipal para {selectedYear}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Year Selection */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Completo
              </h1>
              <p className="mt-2 text-gray-600">
                Vista integral con todos los datos financieros y documentos organizados
              </p>
            </div>

            {/* Year Selector with Preloading Indicator */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ResponsiveYearSelector
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  availableYears={availableYears}
                  className="min-w-[200px]"
                />
                {isPreloading && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                onClick={refreshData}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Actualizar datos"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar información en el portal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {DASHBOARD_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const IconComponent = section.icon;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    // Update URL hash for direct linking
                    window.location.hash = section.id;
                  }}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Statistics Overview */}
      {workingSummary && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Presupuesto Total {selectedYear}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(workingSummary.totalBudget / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ejecutado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(workingSummary.totalExecuted / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Documentos</p>
                  <p className="text-2xl font-bold text-gray-900">{workingSummary.totalDocuments}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Ejecución</p>
                  <p className="text-2xl font-bold text-gray-900">{workingSummary.executionRate.toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Red Flag Analysis Section - Always Visible on Dashboard Completo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-700 p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">🚩 Análisis de Banderas Rojas</h2>
              <p className="text-red-700 dark:text-red-300">Detección automática de anomalías en datos municipales</p>
            </div>
          </div>

          <ChartAuditReport
            analysis="overview"
            height={500}
            interactive={true}
            showTitle={false}
            showDescription={false}
            year={selectedYear}
            className="bg-white dark:bg-dark-surface rounded-lg"
          />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceso Rápido a Información</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {QUICK_ACCESS_LINKS.map((link, index) => {
                const IconComponent = link.icon;

                return (
                  <Link
                    key={link.id}
                    to={link.link}
                    className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer block"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-${link.color}-100`}>
                          <IconComponent className={`h-6 w-6 text-${link.color}-600`} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{link.title}</h3>
                      <p className="text-gray-600 text-sm">{link.description}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Enhanced Summary Indicators Section (from MasterDashboard) */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Portal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <PieChart className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Indicadores Financieros</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Visualización de indicadores clave de la gestión financiera municipal
                </p>
                <Link to="/dashboard#financial" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                  Ver indicadores
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Activity className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Distribución de Gastos</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Análisis de cómo se distribuyen los gastos municipales por categoría
                </p>
                <Link to="/expenses" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                  Ver distribución
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Evolución Temporal</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Seguimiento de la evolución de ingresos y gastos a lo largo del tiempo
                </p>
                <Link to="/dashboard#charts" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                  Ver evolución
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        {(activeSection === 'charts' || filteredCharts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {activeSection === 'charts' && (
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Visualizaciones de Datos</h2>
                <div>
                  <label htmlFor="chart-height" className="block text-sm font-medium text-gray-700 mb-1">
                    Altura de Gráficos
                  </label>
                  <select
                    id="chart-height"
                    value={chartHeight}
                    onChange={(e) => setChartHeight(Number(e.target.value))}
                    className="rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={300}>Pequeño (300px)</option>
                    <option value={400}>Mediano (400px)</option>
                    <option value={500}>Grande (500px)</option>
                    <option value={600}>Extra Grande (600px)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {filteredCharts.map((chart, index) => {
                const ChartIcon = chart.icon;
                const ChartComponent = chart.component;

                return (
                  <motion.div
                    key={chart.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50">
                          <ChartIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {chart.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {chart.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <ChartComponent
                        height={chartHeight}
                        width="100%"
                        showTitle={false}
                        showDescription={false}
                        year={selectedYear}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Financial Section - Enhanced with detailed views */}
        {activeSection === 'financial' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Análisis Financiero Detallado</h2>
              
              {/* View Mode Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
                    { id: 'documents', label: 'Documentos', icon: <FileText className="h-4 w-4 mr-2" /> },
                    { id: 'data', label: 'Datos', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
                    { id: 'charts', label: 'Gráficos', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
                    { id: 'debt', label: 'Deuda', icon: <CreditCard className="h-4 w-4 mr-2" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFinancialViewMode(tab.id as any)}
                      className={`flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        financialViewMode === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <EnhancedFinancialContent viewMode={financialViewMode} selectedYear={selectedYear} />
          </motion.div>
        )}

        {/* Transparency & Audit Section */}
        {activeSection === 'transparency' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Auditoría y Transparencia</h2>
              
              {/* View Mode Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: 'Resumen', icon: <Shield className="h-4 w-4 mr-2" /> },
                    { id: 'audit', label: 'Auditoría', icon: <AlertTriangle className="h-4 w-4 mr-2" /> },
                    { id: 'irregularities', label: 'Irregularidades', icon: <AlertTriangle className="h-4 w-4 mr-2" /> },
                    { id: 'reports', label: 'Reportes', icon: <FileText className="h-4 w-4 mr-2" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTransparencyViewMode(tab.id as any)}
                      className={`flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        transparencyViewMode === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <EnhancedTransparencyContent viewMode={transparencyViewMode} selectedYear={selectedYear} />
          </motion.div>
        )}

        {/* Operations Section */}
        {activeSection === 'operations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Operaciones Municipales</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-orange-50 rounded-lg p-6">
                  <Package className="h-8 w-8 text-orange-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contratos</h3>
                  <p className="text-gray-600">Gestión de contratos municipales y seguimiento de ejecución</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <FileText className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Licitaciones</h3>
                  <p className="text-gray-600">Procesos de licitación pública y compras</p>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión Operativa</h3>
                  <p className="text-gray-600">Seguimiento de proyectos y operaciones diarias</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Services Section */}
        {activeSection === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Servicios Públicos</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-lg p-6">
                  <Heart className="h-8 w-8 text-red-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Salud</h3>
                  <p className="text-gray-600">Centros de salud, programas sanitarios y estadísticas médicas</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <Users className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Educación</h3>
                  <p className="text-gray-600">Instituciones educativas, matriculación y recursos</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <Building className="h-8 w-8 text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Infraestructura</h3>
                  <p className="text-gray-600">Obras públicas, mantenimiento y desarrollo urbano</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other sections content placeholder */}
        {activeSection !== 'overview' && activeSection !== 'charts' && activeSection !== 'financial' && activeSection !== 'transparency' && activeSection !== 'operations' && activeSection !== 'services' && filteredCharts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sección en Desarrollo
            </h3>
            <p className="text-gray-600">
              El contenido para "{DASHBOARD_SECTIONS.find(s => s.id === activeSection)?.title}" estará disponible próximamente.
            </p>
          </motion.div>
        )}
      </div>

      {/* System Status Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sistema de Transparencia Activo
              </h3>
              <p className="text-gray-600 max-w-3xl">
                Dashboard integral que unifica toda la información de transparencia municipal.
                Datos actualizados para el año {selectedYear}.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Sistema Activo</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Última actualización: {new Date().toLocaleDateString('es-AR')}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Transparency Content Component
const EnhancedTransparencyContent: React.FC<{ 
  viewMode: 'overview' | 'audit' | 'irregularities' | 'reports', 
  selectedYear: number 
}> = ({ viewMode, selectedYear }) => {
  // Mock data for transparency section
  const summary = {
    totalBudget: 330000000,
    totalExecuted: 323000000,
    executionRate: 97.9,
    totalContracts: 24,
    totalDocuments: 45,
    averageCompletion: 89.5
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock data for audit findings
  const auditData = {
    financial_irregularities: {
      salary_irregularities: [
        { official_name: 'Juan Pérez', role: 'Director', declared_salary: 800000, estimated_fair_salary: 500000, discrepancy_ratio: 1.6 },
        { official_name: 'María García', role: 'Subdirectora', declared_salary: 600000, estimated_fair_salary: 450000, discrepancy_ratio: 1.3 }
      ],
      budget_discrepancies: [
        { category: 'Viales', budgeted_amount: 100000000, actual_spent: 120000000, difference: 20000000, difference_percentage: 0.2 },
        { category: 'Limpieza', budgeted_amount: 50000000, actual_spent: 40000000, difference: -10000000, difference_percentage: -0.2 }
      ],
      summary: {
        total_irregularities: 2,
        high_salary_cases: 2,
        budget_discrepancies: 2
      }
    },
    infrastructure_projects: {
      flags: [
        { project_name: 'Ruta Provincial 60', budgeted_amount: 200000000, actual_spent: 250000000, delay_days: 120, irregularity_type: 'cost_overrun' },
        { project_name: 'Hospital Local', budgeted_amount: 150000000, actual_spent: 130000000, delay_days: 90, irregularity_type: 'delayed_completion' }
      ],
      summary: {
        flagged_projects: 2,
        total_budget: 350000000
      }
    },
    key_findings: [
      { finding_type: 'High Salary', severity: 'high', description: 'Funcionario con salario 60% superior al promedio del cargo', amount: 300000, related_entity: 'Dirección de Obras' },
      { finding_type: 'Budget Overrun', severity: 'medium', description: 'Proyecto con costo 20% superior al presupuestado', amount: 20000000, related_entity: 'Secretaría de Infraestructura' }
    ],
    timestamp: new Date().toISOString()
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Irregularidades</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {auditData.financial_irregularities.summary.total_irregularities + 
                    auditData.infrastructure_projects.summary.flagged_projects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Altos Salarios</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {auditData.financial_irregularities.summary.high_salary_cases}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Atrasados</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {auditData.infrastructure_projects.summary.flagged_projects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto Total</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(auditData.infrastructure_projects.summary.total_budget)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Hallazgos Clave</h3>
          
          <div className="space-y-4">
            {auditData.key_findings.map((finding, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{finding.description}</h4>
                    <p className="text-sm mt-1">{finding.related_entity}</p>
                  </div>
                  <span className="font-semibold">{formatCurrency(finding.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAudit = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Salarios Irregulares</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Funcionario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Salario Declarado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Salario Esperado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Diferencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {auditData.financial_irregularities.salary_irregularities.map((irregularity, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {irregularity.official_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {irregularity.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(irregularity.declared_salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(irregularity.estimated_fair_salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        {irregularity.discrepancy_ratio.toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Discrepancias Presupuestarias</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Presupuestado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Real
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Diferencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {auditData.financial_irregularities.budget_discrepancies.map((discrepancy, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {discrepancy.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(discrepancy.budgeted_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(discrepancy.actual_spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        discrepancy.difference > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {formatCurrency(Math.abs(discrepancy.difference))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        Math.abs(discrepancy.difference_percentage) > 0.2 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {Math.abs(discrepancy.difference_percentage * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderIrregularities = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Proyectos de Infraestructura Irregulares</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Presupuesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Gastado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Atraso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {auditData.infrastructure_projects.flags.map((project, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {project.project_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(project.budgeted_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(project.actual_spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {project.delay_days} días
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {project.irregularity_type === 'delayed_completion' ? 'Atraso' : 'Sobrecosto'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Informes de Transparencia</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informe de Transparencia 2024</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Detalle de la información pública disponible y cumplimiento de normativas
              </p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Ver informe completo
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informe de Auditoría Financiera</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Análisis de la situación financiera y posibles irregularidades detectadas
              </p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Ver informe completo
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Evaluación de Cumplimiento</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Análisis del cumplimiento de normativas de transparencia activa
              </p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Ver informe completo
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Información Importante
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Esta información es generada automáticamente mediante análisis de documentos oficiales del municipio.
                  Los hallazgos presentados son indicadores de posibles irregularidades que requieren investigación adicional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'audit' && renderAudit()}
      {viewMode === 'irregularities' && renderIrregularities()}
      {viewMode === 'reports' && renderReports()}
    </div>
  );
};

// Enhanced Financial Content Component
const EnhancedFinancialContent: React.FC<{ 
  viewMode: 'overview' | 'documents' | 'data' | 'charts' | 'debt', 
  selectedYear: number 
}> = ({ viewMode, selectedYear }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Mock financial data based on current year data
  const summary = {
    totalBudget: 330000000,
    totalExecuted: 323000000,
    executionRate: 97.9,
    totalContracts: 24,
    totalDocuments: 45,
    averageCompletion: 89.5
  };
  
  const formatCurrencyARS = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock category breakdown data
  const categoryBreakdown = [
    { name: 'Salarios', budgeted: 500000000, executed: 480000000, execution_rate: 96 },
    { name: 'Infraestructura', budgeted: 800000000, executed: 720000000, execution_rate: 90 },
    { name: 'Servicios Públicos', budgeted: 300000000, executed: 290000000, execution_rate: 97 },
    { name: 'Salud', budgeted: 200000000, executed: 180000000, execution_rate: 90 }
  ];

  // Mock debt data
  const debtData = {
    total_debt: 1500000000,
    debt_breakdown: [
      { type: 'Préstamo Nacional', amount: 1000000000, interest_rate: 9.5, due_date: '2030-12-31' },
      { type: 'Préstamo Provincial', amount: 500000000, interest_rate: 8.2, due_date: '2028-06-15' }
    ]
  };

  // Mock documents data
  const documents = [
    { id: '1', title: 'Presupuesto 2024', filename: 'presupuesto_2024.pdf', year: 2024, category: 'budget', type: 'pdf', size_mb: 2.3, url: '#', official_url: '#', verification_status: 'verified', processing_date: '2024-01-15' },
    { id: '2', title: 'Ejecución Presupuestaria Q1', filename: 'ejecucion_q1_2024.pdf', year: 2024, category: 'execution', type: 'pdf', size_mb: 1.8, url: '#', official_url: '#', verification_status: 'verified', processing_date: '2024-04-01' },
    { id: '3', title: 'Contratos Firmados', filename: 'contratos_2024.pdf', year: 2024, category: 'contracts', type: 'pdf', size_mb: 3.1, url: '#', official_url: '#', verification_status: 'pending', processing_date: '2024-04-15' }
  ];

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Documentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tamaño Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">7.2 MB</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Año</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedYear}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ejecutado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyARS(summary?.totalExecuted || 1650000000)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución Presupuestaria
          </h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de distribución de presupuesto por categorías</p>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Documentos Recientes
          </h3>
          <div className="space-y-4">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doc.filename}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size_mb.toFixed(1)} MB</span>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    return (
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredDocuments.length} de {documents.length} documentos
            </span>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {doc.filename}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(doc.processing_date).toLocaleDateString('es-AR')}</span>
                      <span className="mx-2">•</span>
                      <span>{doc.size_mb.toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.verification_status === 'verified' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {doc.verification_status === 'verified' ? 'Verificado' : 'Procesado'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Eye className="h-4 w-4" />
                    </button>
                    <a 
                      href={doc.url} 
                      download 
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No hay documentos que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderData = () => {
    const totalBudget = summary?.totalBudget || 2000000000;
    const totalExecuted = summary?.totalExecuted || 1650000000;
    const executionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Presupuesto Total</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrencyARS(totalBudget)}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ejecutado</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrencyARS(totalExecuted)}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${executionRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">% Ejecución</h3>
            <p className={`text-2xl font-bold ${
              executionRate >= 90 ? 'text-green-600' :
              executionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {executionRate.toFixed(1)}%
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {executionRate >= 90 ? 'Ejecución óptima' :
               executionRate >= 75 ? 'Ejecución buena' : 'Ejecución baja'}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Desglose por Categorías
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Presupuestado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ejecutado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    % Ejecución
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categoryBreakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS(item.budgeted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS(item.executed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2 dark:bg-gray-700">
                          <div 
                            className={`h-2 rounded-full ${
                              item.execution_rate >= 90 ? 'bg-green-600' :
                              item.execution_rate >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${item.execution_rate}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          item.execution_rate >= 90 ? 'text-green-600' :
                          item.execution_rate >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.execution_rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    return (
      <div className="space-y-8">
        {/* Header with Year Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Visualizaciones Completas - Año {selectedYear}
          </h2>
          <p className="text-gray-600 mb-4">
            Conjunto completo de 17 tipos de gráficos con datos consolidados de 2019-2025
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-semibold text-blue-900">Años Disponibles</div>
              <div className="text-blue-700">2019-2025</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-semibold text-green-900">Tipos de Gráficos</div>
              <div className="text-green-700">17 categorías</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-semibold text-purple-900">Año Actual</div>
              <div className="text-purple-700">{selectedYear}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="font-semibold text-orange-900">Anomalías</div>
              <div className="text-orange-700">Detectadas automáticamente</div>
            </div>
          </div>
        </div>

        {/* Financial Charts Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-green-600" />
            Análisis Financiero
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Execution */}
            <BudgetExecutionChartWrapper
              year={selectedYear}
              height={350}
            />

            {/* Revenue Analysis */}
            <RechartsWrapper
              csvUrl="/data/charts/Revenue_Report_consolidated_2019-2025.csv"
              selectedYear={selectedYear}
              title="Análisis de Ingresos"
              chartType="area"
              dataKey="year"
              valueKey={["total_revenue", "tax_revenue", "other_revenue"]}
              showAnomalies={true}
              height={350}
            />

            {/* Expenditure Report */}
            <ExpenditureReportChart
              year={selectedYear}
              height={350}
            />

            {/* Debt Report */}
            <DebtReportChart
              year={selectedYear}
              height={350}
            />
          </div>
        </div>

        {/* Economic & Performance Charts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Indicadores Económicos y Rendimiento
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Economic Report */}
            <EconomicReportChart
              year={selectedYear}
              height={350}
            />

            {/* Fiscal Balance */}
            <FiscalBalanceReportChart
              year={selectedYear}
              height={350}
            />

            {/* Financial Reserves */}
            <FinancialReservesChart
              year={selectedYear}
              height={350}
            />

            {/* Investment Report */}
            <InvestmentReportChart
              year={selectedYear}
              height={350}
            />
          </div>
        </div>

        {/* Social & Infrastructure Charts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-purple-600" />
            Servicios Sociales e Infraestructura
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Education Data */}
            <EducationDataChart
              year={selectedYear}
              height={350}
            />

            {/* Health Statistics */}
            <HealthStatisticsChart
              year={selectedYear}
              height={350}
            />

            {/* Infrastructure Projects */}
            <InfrastructureProjectsChart
              year={selectedYear}
              height={350}
            />

            {/* Personnel Expenses */}
            <PersonnelExpensesChart
              year={selectedYear}
              height={350}
            />
          </div>
        </div>

        {/* Advanced Analytics Charts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-indigo-600" />
            Analytics Avanzados
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quarterly Execution */}
            <QuarterlyExecutionChart
              year={selectedYear}
              height={350}
            />

            {/* Programmatic Performance */}
            <ProgrammaticPerformanceChart
              year={selectedYear}
              height={350}
            />

            {/* Gender Budgeting */}
            <GenderBudgetingChart
              year={selectedYear}
              height={350}
            />

            {/* Waterfall Execution */}
            <WaterfallExecutionChart
              year={selectedYear}
              height={350}
            />
          </div>
        </div>

        {/* Revenue Sources Detail */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <PiggyBank className="w-6 h-6 mr-2 text-green-600" />
            Fuentes de Ingresos Detalladas
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <RevenueSourcesChart
              year={selectedYear}
              height={400}
            />
          </div>
        </div>

        {/* Comprehensive Analysis */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-red-600" />
            Análisis Integral Multi-Año
          </h3>
          <div className="space-y-6">
            {/* Multi-year Budget Execution Trend */}
            <TimeSeriesChart
              csvUrl="/data/charts/Budget_Execution_consolidated_2019-2025.csv"
              selectedYear={null} // Show all years
              title="Tendencia de Ejecución Presupuestaria (2019-2025)"
              description="Evolución completa con detección de anomalías inter-anuales"
              height={450}
              dataKey="year"
              valueKey="executed_amount"
              showAnomalies={true}
              className="mb-6"
            />

            {/* Multi-year Revenue Comparison */}
            <RechartsWrapper
              csvUrl="/data/charts/Revenue_Report_consolidated_2019-2025.csv"
              selectedYear={null} // Show all years
              title="Comparación de Ingresos Multi-Año"
              description="Análisis completo de tendencias de ingresos"
              height={400}
              chartType="line"
              dataKey="year"
              valueKey={["total_revenue", "tax_revenue", "service_revenue"]}
              showAnomalies={true}
              showTrend={true}
              colors={["#3b82f6", "#10b981", "#f59e0b"]}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDebtView = () => {
    return (
      <div className="space-y-6">
        {/* Debt Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4">
                <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deuda Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyARS(debtData.total_debt)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
                <Scale className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Relación Deuda/PBI</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">15.2%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interés Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8.2%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debt Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Desglose de la Deuda
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo de Deuda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tasa de Interés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cuota Mensual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {debtData.debt_breakdown.map((debt, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {debt.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS(debt.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        debt.interest_rate > 10 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        debt.interest_rate > 8 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {debt.interest_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(debt.due_date).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS((debt.amount * (debt.interest_rate / 100)) / 12)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debt Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Composición de la Deuda
            </h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Gráfico de Composición de la Deuda</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasa de Interés Comparativa
            </h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Gráfico de Tasa de Interés Comparativa</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'documents' && renderDocuments()}
      {viewMode === 'data' && renderData()}
      {viewMode === 'charts' && renderCharts()}
      {viewMode === 'debt' && renderDebtView()}
    </div>
  );
};


export default DashboardCompleto;