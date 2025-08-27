import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, DollarSign, FileText, Calendar, Filter, Download, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import ValidatedChart from '../components/ValidatedChart';
import ComprehensiveVisualization from '../components/charts/ComprehensiveVisualization';
import FinancialDataTable from '../components/tables/FinancialDataTable';
import DataSourceSelector from '../components/data-sources/DataSourceSelector';
import ApiService, { FinancialReport } from '../services/ApiService';
import { formatCurrencyARS } from '../utils/formatters';

// Data sources for validation
const financialDataSources = ['https://carmendeareco.gob.ar/transparencia/'];

const FinancialDashboard: React.FC = () => {
  const [activeYear, setActiveYear] = useState('2025');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<FinancialReport | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>(['database_local', 'official_site']);
  
  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  const loadFinancialDataForYear = async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getFinancialReports(parseInt(year));
      setFinancialData(data);
    } catch (err) {
      console.error('Failed to load financial data for year:', year, err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Load financial data when year or sources change
  // useEffect(() => {
  //   void loadFinancialDataForYear(activeYear);
  // }, [activeYear, selectedSources]);

  const handleSourceChange = (newSelectedSources: string[]) => {
    setSelectedSources(newSelectedSources);
  };

  const handleDataRefresh = () => {
    loadFinancialDataForYear(activeYear);
  };

  const formatCurrency = (value: number) => formatCurrencyARS(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // Transform API data for display
  const transformedFinancialData = financialData?.map((report, index) => ({
    id: report.id,
    year: report.year,
    quarter: report.quarter,
    report_type: report.report_type,
    income: report.income,
    expenses: report.expenses,
    balance: report.balance,
    execution_percentage: report.execution_percentage,
    name: `Q${report.quarter} ${report.year}`,
    value: Math.round(report.income / 1000000), // Convert to millions for chart
    amount: report.income,
    percentage: report.execution_percentage,
    source: financialDataSources[0],
    lastVerified: new Date().toISOString(),
    color: ['#0056b3', '#28a745', '#ffc107', '#dc3545', '#20c997', '#6f42c1'][index] || '#fd7e14'
  })) || [];

  const totalBudget = transformedFinancialData.reduce((sum, item) => sum + item.income, 0);
  const totalExecuted = transformedFinancialData.reduce((sum, item) => sum + item.expenses, 0);
  const executionPercentage = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar datos</h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={() => loadFinancialDataForYear(activeYear)}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              📊 Panel Financiero Integral
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Visión completa de la situación financiera del municipio
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <div className="relative">
              <select
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year} {loading && activeYear === year ? '(Cargando...)' : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
              </div>
            </div>

            <button className="inline-flex items-center py-2 px-4 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150">
              <Download size={18} className="mr-2" />
              Exportar Datos
            </button>
          </div>
        </div>

        {/* Data Source Selector */}
        <div className="mb-6">
          <DataSourceSelector
            selectedSources={selectedSources}
            onSourceChange={handleSourceChange}
            onDataRefresh={handleDataRefresh}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Resumen General', icon: BarChart3 },
              { id: 'budget', name: 'Presupuesto', icon: PieChart },
              { id: 'revenue', name: 'Ingresos', icon: TrendingUp },
              { id: 'expenses', name: 'Gastos', icon: DollarSign },
              { id: 'reports', name: 'Reportes', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </motion.section>

      {activeTab === 'overview' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FinancialOverview />
        </motion.div>
      )}

      {activeTab === 'budget' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Budget Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Análisis Presupuestario {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={transformedFinancialData}
                chartType="bar"
                title={`Presupuesto vs Ejecución ${activeYear}`}
                sources={financialDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Budget Execution Table */}
          <FinancialDataTable
            data={transformedFinancialData}
            columns={[
              { key: 'quarter', header: 'Trimestre', sortable: true },
              { key: 'report_type', header: 'Tipo de Reporte', sortable: true },
              { key: 'income', header: 'Presupuesto', sortable: true, format: 'currency' },
              { key: 'expenses', header: 'Ejecutado', sortable: true, format: 'currency' },
              { key: 'balance', header: 'Balance', sortable: true, format: 'currency' },
              { key: 'execution_percentage', header: '% Ejecución', sortable: true, format: 'percentage' }
            ]}
            title={`Ejecución Presupuestaria ${activeYear}`}
            loading={loading}
            error={error}
            onRowClick={(row) => setSelectedItem(row)}
            onExport={() => console.log('Export budget data')}
          />
        </motion.div>
      )}

      {activeTab === 'revenue' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Revenue Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Análisis de Ingresos {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={[
                  { name: 'Impuestos', value: 45000000, color: '#3B82F6' },
                  { name: 'Derechos', value: 25000000, color: '#10B981' },
                  { name: 'Multas', value: 10000000, color: '#F59E0B' },
                  { name: 'Transferencias', value: 15000000, color: '#8B5CF6' },
                  { name: 'Otros', value: 5000000, color: '#EC4899' }
                ]}
                chartType="pie"
                title={`Composición de Ingresos ${activeYear}`}
                sources={financialDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Tendencia de Ingresos {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={transformedFinancialData.map(item => ({
                  name: `Q${item.quarter}`,
                  value: Math.round(item.income / 1000000),
                  ingresos: Math.round(item.income / 1000000),
                  ejecutado: Math.round(item.expenses / 1000000)
                }))}
                chartType="line"
                title={`Tendencia de Ingresos Trimestral ${activeYear}`}
                sources={financialDataSources}
                showValidation={true}
              />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'expenses' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Expense Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Distribución de Gastos por Categoría {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={[
                  { name: 'Personal', value: 35000000, color: '#3B82F6' },
                  { name: 'Servicios', value: 20000000, color: '#10B981' },
                  { name: 'Mantenimiento', value: 15000000, color: '#F59E0B' },
                  { name: 'Inversiones', value: 25000000, color: '#8B5CF6' },
                  { name: 'Administración', value: 5000000, color: '#EC4899' }
                ]}
                chartType="pie"
                title={`Distribución de Gastos ${activeYear}`}
                sources={financialDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Expense Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Tendencia de Gastos {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={transformedFinancialData.map(item => ({
                  name: `Q${item.quarter}`,
                  value: Math.round(item.income / 1000000),
                  presupuestado: Math.round(item.income / 1000000),
                  ejecutado: Math.round(item.expenses / 1000000)
                }))}
                chartType="area"
                title={`Tendencia de Gastos Trimestral ${activeYear}`}
                sources={financialDataSources}
                showValidation={true}
              />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'reports' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Financial Reports Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Reportes Financieros {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <FinancialDataTable
                data={transformedFinancialData}
                columns={[
                  { key: 'quarter', header: 'Trimestre', sortable: true },
                  { key: 'report_type', header: 'Tipo de Reporte', sortable: true },
                  { key: 'income', header: 'Ingresos', sortable: true, format: 'currency' },
                  { key: 'expenses', header: 'Gastos', sortable: true, format: 'currency' },
                  { key: 'balance', header: 'Balance', sortable: true, format: 'currency' },
                  { key: 'execution_percentage', header: '% Ejecución', sortable: true, format: 'percentage' }
                ]}
                title={`Reportes Financieros ${activeYear}`}
                loading={loading}
                error={error}
                onRowClick={(row) => setSelectedItem(row)}
                onExport={() => console.log('Export financial reports')}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FinancialDashboard;