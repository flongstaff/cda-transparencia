/**
 * All Charts Dashboard - Displays all 13 chart types
 * Shows comprehensive financial visualization of municipal data
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasterData } from '../hooks/useMasterData';
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
  Package
} from 'lucide-react';

// Import all 13 chart components
import BudgetExecutionChart from '../components/charts/BudgetExecutionChart';
import DebtReportChart from '../components/charts/DebtReportChart';
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

// Chart metadata with icons and descriptions
const CHART_METADATA = [
  {
    id: 'budget-execution',
    title: 'Ejecución Presupuestaria',
    description: 'Comparación entre presupuesto aprobado y ejecutado',
    icon: BarChart3,
    component: BudgetExecutionChart
  },
  {
    id: 'debt-report',
    title: 'Informe de Deuda',
    description: 'Análisis de la deuda municipal y sus componentes',
    icon: TrendingDown,
    component: DebtReportChart
  },
  {
    id: 'economic-report',
    title: 'Informe Económico',
    description: 'Indicadores económicos del municipio',
    icon: TrendingUp,
    component: EconomicReportChart
  },
  {
    id: 'education-data',
    title: 'Datos Educativos',
    description: 'Estadísticas educativas y presupuesto por nivel',
    icon: FileText,
    component: EducationDataChart
  },
  {
    id: 'expenditure-report',
    title: 'Informe de Gastos',
    description: 'Desglose detallado de los gastos municipales',
    icon: DollarSign,
    component: ExpenditureReportChart
  },
  {
    id: 'financial-reserves',
    title: 'Reservas Financieras',
    description: 'Estado de las reservas financieras del municipio',
    icon: Wallet,
    component: FinancialReservesChart
  },
  {
    id: 'fiscal-balance',
    title: 'Balance Fiscal',
    description: 'Ingresos vs egresos y resultado fiscal',
    icon: ArrowUpDown,
    component: FiscalBalanceReportChart
  },
  {
    id: 'health-statistics',
    title: 'Estadísticas de Salud',
    description: 'Indicadores de salud pública y gastos en salud',
    icon: Heart,
    component: HealthStatisticsChart
  },
  {
    id: 'infrastructure-projects',
    title: 'Proyectos de Infraestructura',
    description: 'Avance y presupuesto de proyectos de infraestructura',
    icon: Wrench,
    component: InfrastructureProjectsChart
  },
  {
    id: 'investment-report',
    title: 'Informe de Inversiones',
    description: 'Análisis de inversiones realizadas por el municipio',
    icon: TrendingUp,
    component: InvestmentReportChart
  },
  {
    id: 'personnel-expenses',
    title: 'Gastos en Personal',
    description: 'Distribución de gastos en personal municipal',
    icon: Users,
    component: PersonnelExpensesChart
  },
  {
    id: 'revenue-report',
    title: 'Informe de Ingresos',
    description: 'Fuentes y evolución de los ingresos municipales',
    icon: TrendingUp,
    component: RevenueReportChart
  },
  {
    id: 'revenue-sources',
    title: 'Fuentes de Ingresos',
    description: 'Detalle por fuente de los ingresos municipales',
    icon: Package,
    component: RevenueSourcesChart
  }
];

const AllChartsDashboard: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartHeight, setChartHeight] = useState<number>(400);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Use integrated master data service
  const {
    masterData,
    currentBudget,
    currentTreasury,
    currentSalaries,
    currentContracts,
    currentDebt,
    loading,
    error,
    switchYear,
    availableYears
  } = useMasterData(selectedYear);

  // Filter charts based on selection
  const filteredCharts = selectedChart 
    ? CHART_METADATA.filter(chart => chart.id === selectedChart)
    : CHART_METADATA;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Panel de Visualización Completo
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Todas las 13 visualizaciones de datos financieros del municipio
              </p>
            </div>
            
            {/* Controls */}
            <div className="mt-4 md:mt-0 flex space-x-4">
              <div>
                <label htmlFor="chart-height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Altura de Gráficos
                </label>
                <select
                  id="chart-height"
                  value={chartHeight}
                  onChange={(e) => setChartHeight(Number(e.target.value))}
                  className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={300}>Pequeño (300px)</option>
                  <option value={400}>Mediano (400px)</option>
                  <option value={500}>Grande (500px)</option>
                  <option value={600}>Extra Grande (600px)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="chart-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filtrar Gráficos
                </label>
                <select
                  id="chart-filter"
                  value={selectedChart || ''}
                  onChange={(e) => setSelectedChart(e.target.value || null)}
                  className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Mostrar Todos</option>
                  {CHART_METADATA.map(chart => (
                    <option key={chart.id} value={chart.id}>
                      {chart.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gráficos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">13</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Años de Datos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2019-2025</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipos de Datos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">13</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visualizaciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Completas</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                      <ChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {chart.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Datos actualizados hasta 2025 • Portal de Transparencia Municipal de Carmen de Areco
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            Este panel muestra todas las 13 visualizaciones de datos financieros disponibles
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllChartsDashboard;