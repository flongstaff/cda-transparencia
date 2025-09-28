import React, { useState } from 'react';
import { TrendingUp, DollarSign, Percent, Calendar, FileText, Download } from 'lucide-react';
import ComprehensiveChart from '../components/charts/ComprehensiveChart';
import { useMasterData } from '../hooks/useMasterData';
import { formatCurrencyARS, formatPercentageARS } from '../utils/formatters';

interface BudgetExecutionProps {
  year?: number;
  className?: string;
}

const BudgetExecution: React.FC<BudgetExecutionProps> = ({ 
  year = new Date().getFullYear(),
  className = '' 
}) => {
  const [selectedYear, setSelectedYear] = useState(year);

  // 🚀 Use the unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Extract budget and financial data from the master data service
  const _budgetBreakdown = currentBudget?.categories || [];
  const financialOverview = currentBudget || {};

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  // Helper function to get available years for the selector
  const getAvailableYears = () => {
    // Use available years from the master data service
    return availableYears.map(year => ({
      year,
      label: year.toString()
    })).sort((a, b) => b.year - a.year);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos presupuestarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 dark:text-red-400">Error al cargar la ejecución presupuestaria</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 Ejecución Presupuestaria
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis de la ejecución del presupuesto municipal
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <select
                value={selectedYear}
                onChange={handleYearChange}
                title="Seleccionar año"
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {getAvailableYears().map((yearConfig) => (
                  <option key={yearConfig.year} value={yearConfig.year}>
                    {yearConfig.label}
                  </option>
                ))}
              </select>
            </div>
            


            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Presupuesto Total</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {financialOverview ? formatCurrencyARS(financialOverview.totalBudget || 0) : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Ejecutado</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {financialOverview ? formatCurrencyARS(financialOverview.totalExecuted || 0) : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Percent className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">% Ejecución</p>
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                  {financialOverview ? formatPercentageARS(financialOverview.executionRate || 0) : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Pendiente</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {financialOverview ? formatCurrencyARS((financialOverview.totalBudget || 0) - (financialOverview.totalExecuted || 0)) : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Execution Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <ComprehensiveChart
            type="budget"
            year={selectedYear}
            title={`Ejecución Presupuestaria ${selectedYear}`}
            variant="bar"
            showControls={true}
            className="h-96"
          />
        </div>

        {/* Budget Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <ComprehensiveChart
            type="budget"
            year={selectedYear}
            title={`Distribución del Presupuesto ${selectedYear}`}
            variant="pie"
            showControls={false}
            className="h-96"
          />
        </div>

        {/* Execution Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 col-span-full">
          <ComprehensiveChart
            type="budget"
            year={selectedYear}
            title={`Tendencia de Ejecución Trimestral ${selectedYear}`}
            variant="line"
            showControls={true}
            className="h-80"
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetExecution;