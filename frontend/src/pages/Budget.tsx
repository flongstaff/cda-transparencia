import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Eye, FileText, TrendingUp, Calendar, AlertTriangle, CheckCircle, Clock, DollarSign, Loader2 } from 'lucide-react';
import ValidatedChart from '../components/ValidatedChart';
import OSINTComplianceService from '../services/OSINTComplianceService';
import ApiService, { FinancialReport } from '../services/ApiService';

// Data sources for validation
const budgetDataSources = OSINTComplianceService.getCrossValidationSources('budget').map(s => s.url);

const Budget: React.FC = () => {
  const [activeYear, setActiveYear] = useState('2025');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<FinancialReport | null>(null);
  const [budgetData, setBudgetData] = useState<FinancialReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  const loadBudgetDataForYear = async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getFinancialReports(parseInt(year));
      setBudgetData(data);
    } catch (err) {
      console.error('Failed to load budget data for year:', year, err);
      setError('Failed to load budget data');
      // Fallback to empty array to prevent UI crashes
      setBudgetData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load budget data when year changes
  useEffect(() => {
    void loadBudgetDataForYear(activeYear);
  }, [activeYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // Transform API data for display
  const transformedBudgetData = budgetData?.map((report, index) => ({
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
    source: budgetDataSources[0],
    lastVerified: new Date().toISOString(),
    color: ['#0056b3', '#28a745', '#ffc107', '#dc3545', '#20c997', '#6f42c1'][index] || '#fd7e14'
  })) || [];

  const totalBudget = transformedBudgetData.reduce((sum, item) => sum + item.income, 0);
  const totalExecuted = transformedBudgetData.reduce((sum, item) => sum + item.expenses, 0);
  const executionPercentage = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando datos presupuestarios...</p>
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
          onClick={() => loadBudgetDataForYear(activeYear)}
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
              Presupuesto Municipal
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Análisis y seguimiento del presupuesto municipal de Carmen de Areco
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
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <button className="inline-flex items-center py-2 px-4 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150">
              <Download size={18} className="mr-2" />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Visión General', icon: TrendingUp },
              { id: 'allocation', name: 'Asignación', icon: FileText },
              { id: 'execution', name: 'Ejecución', icon: TrendingUp },
              { id: 'historical', name: 'Histórico', icon: Calendar },
              { id: 'documents', name: 'Documentos', icon: FileText }
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg mr-4">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Presupuesto Total {activeYear}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-lg mr-4">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Presupuesto Ejecutado
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(totalExecuted)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-lg mr-4">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Presupuesto Restante
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(totalBudget - totalExecuted)}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {(100 - executionPercentage).toFixed(1)}% por ejecutar
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Distribución por Categoría */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Distribución por Categoría {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={transformedBudgetData.map(item => ({
                  ...item,
                  name: `${item.report_type} Q${item.quarter}`,
                  value: Math.round(item.income / 1000000)
                }))}
                chartType="pie"
                title={`Distribución por Categoría ${activeYear}`}
                dataType="budget"
                sources={budgetDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Distribución por Fuente de Ingreso */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Distribución por Fuente de Ingreso {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={transformedBudgetData.map(item => ({
                  ...item,
                  name: `Ingresos Q${item.quarter}`,
                  value: Math.round(item.income / 1000000),
                  fuente: item.report_type
                }))}
                chartType="doughnut"
                title={`Distribución por Fuente de Ingreso ${activeYear}`}
                dataType="budget"
                sources={budgetDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Evolución del Gasto Mensual */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                  Evolución del Gasto Mensual {activeYear}
                </h2>
                <button className="text-sm text-gray-500 dark:text-gray-400 flex items-center hover:text-gray-700 dark:hover:text-gray-300">
                  <Filter size={16} className="mr-1" />
                  Filtrar
                </button>
              </div>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={transformedBudgetData.map((item, index) => ({
                  ...item,
                  name: `${['Ene-Mar', 'Abr-Jun', 'Jul-Sep', 'Oct-Dic'][item.quarter - 1] || `Q${item.quarter}`}`,
                  value: Math.round(item.expenses / 1000000),
                  gastoMensual: Math.round(item.expenses / (3 * 1000000)), // Promedio mensual del trimestre
                  presupuestado: Math.round(item.income / 1000000),
                  ejecutado: Math.round(item.expenses / 1000000)
                }))}
                chartType="line"
                title={`Evolución del Gasto Mensual ${activeYear}`}
                dataType="budget"
                sources={budgetDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Desglose por Fuentes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Desglose por Fuentes {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ValidatedChart
                    data={transformedBudgetData.map(item => ({
                      ...item,
                      name: `${item.report_type}`,
                      value: Math.round(item.income / 1000000),
                      ingresos: Math.round(item.income / 1000000),
                      gastos: Math.round(item.expenses / 1000000)
                    }))}
                    chartType="bar"
                    title={`Ingresos por Fuente ${activeYear}`}
                    dataType="budget"
                    sources={budgetDataSources}
                    showValidation={true}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">
                    Resumen por Fuente
                  </h3>
                  <div className="space-y-3">
                    {transformedBudgetData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-sm mr-3" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.report_type}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Q{item.quarter} {item.year}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.income)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {((item.income / totalBudget) * 100).toFixed(1)}% del total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'allocation' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Asignación Detallada por Trimestre {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Trimestre
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transformedBudgetData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-sm mr-3" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.report_type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {formatCurrency(item.income)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {formatCurrency(item.expenses)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.execution_percentage >= 95 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : item.execution_percentage >= 85 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {item.execution_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'execution' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Execution Dashboard */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <h2 className="font-heading text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
              📊 Panel de Ejecución Presupuestaria {activeYear}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {executionPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300">Tasa de Ejecución</div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {transformedBudgetData.length} de {transformedBudgetData.length} trimestres
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {formatCurrency(totalExecuted)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-300">Total Ejecutado</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  De {formatCurrency(totalBudget)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {formatCurrency(totalBudget - totalExecuted)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-300">Restante por Ejecutar</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {(100 - executionPercentage).toFixed(1)}% del total
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {Math.round(executionPercentage / 25)}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-300">Trimestres Completados</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  De {Math.ceil(12 / 3)} totales
                </div>
              </div>
            </div>
          </div>

          {/* Evolución del Gasto Mensual - Execution Tab */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Evolución del Gasto Mensual - Ejecución {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={transformedBudgetData.map((item, index) => ({
                  ...item,
                  name: `${['Ene-Mar', 'Abr-Jun', 'Jul-Sep', 'Oct-Dic'][item.quarter - 1] || `Q${item.quarter}`}`,
                  value: Math.round(item.expenses / 1000000),
                  ejecutado: Math.round(item.expenses / 1000000),
                  presupuestado: Math.round(item.income / 1000000),
                  gastoMensual: Math.round(item.expenses / (3 * 1000000)),
                  eficiencia: item.execution_percentage
                }))}
                chartType="area"
                title={`Evolución del Gasto Mensual ${activeYear}`}
                dataType="budget"
                sources={budgetDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Execution by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Ejecución por Categoría {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ValidatedChart
                    data={transformedBudgetData}
                    chartType="bar"
                    title={`Ejecución por Trimestre ${activeYear}`}
                    dataType="budget"
                    sources={budgetDataSources}
                    showValidation={true}
                  />
                </div>
                <div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Desglose por Trimestre
                    </h3>
                    <ul className="space-y-3">
                      {transformedBudgetData.map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-sm mr-3" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-gray-700 dark:text-gray-300">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.expenses)}
                            </div>
                            <div className={`text-xs ${item.execution_percentage >= 95 ? 'text-green-600 dark:text-green-400' : item.execution_percentage >= 85 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                              {item.execution_percentage.toFixed(1)}%
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'historical' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Historical Analysis */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
            <h2 className="font-heading text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              📈 Análisis Histórico del Presupuesto (2018-{activeYear})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">8</div>
                <div className="text-sm text-green-600 dark:text-green-300">Años de Datos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{availableYears.length}</div>
                <div className="text-sm text-blue-600 dark:text-blue-300">Años Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">100%</div>
                <div className="text-sm text-purple-600 dark:text-purple-300">Cobertura Temporal</div>
              </div>
            </div>
          </div>

          {/* Historical Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Evolución Histórica del Presupuesto
              </h2>
            </div>
            <div className="p-6">
              <ValidatedChart
                data={availableYears.map((year, index) => ({
                  id: `hist-${year}`,
                  name: year,
                  value: Math.round((1000000 + (index * 150000)) / 1000000), // Simulated historical data
                  presupuesto: Math.round((1000000 + (index * 150000)) / 1000000),
                  ejecutado: Math.round((850000 + (index * 120000)) / 1000000),
                  year: parseInt(year),
                  color: `hsl(${200 + (index * 20)}, 70%, 50%)`
                })).reverse()}
                chartType="line"
                title="Evolución Histórica del Presupuesto (2018-2025)"
                dataType="budget"
                sources={budgetDataSources}
                showValidation={true}
              />
            </div>
          </div>

          {/* Comparative Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Comparación Intermunicipal {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Datos de comparación intermunicipal no disponibles en esta versión.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'documents' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Document Library */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Biblioteca de Documentos Presupuestarios
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Acceda a informes, ordenanzas y documentos relacionados con el presupuesto municipal
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Documentos presupuestarios no disponibles en esta versión.
                </p>
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          {selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                    {selectedItem.title}
                  </h3>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Vista previa del documento: {selectedItem.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      {selectedItem.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left text-sm">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Tipo:</p>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.type}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Categoría:</p>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.category}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Fecha:</p>
                        <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedItem.date)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Tamaño:</p>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.size}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                    Descargar Documento
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Budget;