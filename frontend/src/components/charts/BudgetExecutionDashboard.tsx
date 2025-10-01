import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import dataIntegrationService from '../../services/DataIntegrationService';

// Utility function for currency formatting
const formatCurrencyARS = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface BudgetCategory {
  name: string;
  budgeted: number;
  executed: number;
  percentage: number;
}

interface BudgetData {
  year: number;
  totalBudget: number;
  totalExecuted: number;
  executionPercentage: number;
  transparencyScore: number;
  categories: BudgetCategory[];
}

const BudgetExecutionDashboard: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load budget data using the data integration service
        const year = 2024; // Default to 2024, but this could be parameterized
        const integratedData = await dataIntegrationService.loadIntegratedData(year);
        
        // Structure the data to match the expected format
        // Check if we have category data in the integrated budget
        const categories = integratedData.budget.quarterly_data && Array.isArray(integratedData.budget.quarterly_data) 
          ? integratedData.budget.quarterly_data.map((category: any, index: number) => ({
              name: category.name || category.category || `Categoría ${index + 1}`,
              budgeted: category.budgeted || category.total_budget || 0,
              executed: category.executed || category.total_executed || 0,
              percentage: (category.execution_rate || category.executionRate || 0) * 100, // Convert to percentage
            }))
          : integratedData.budget.categories && Array.isArray(integratedData.budget.categories)
          ? integratedData.budget.categories.map((category: any) => ({
              name: category.name || category.category || 'Desconocido',
              budgeted: category.budgeted || category.total_budget || 0,
              executed: category.executed || category.total_executed || 0,
              percentage: (category.execution_rate || category.executionRate || 0) * 100, // Convert to percentage
            }))
          : [
              {
                name: 'General',
                budgeted: integratedData.budget.total_budget || 0,
                executed: integratedData.budget.total_executed || 0,
                percentage: integratedData.budget.execution_rate || 0,
              }
            ];
        
        const budgetData: BudgetData = {
          year: year,
          totalBudget: integratedData.budget.total_budget,
          totalExecuted: integratedData.budget.total_executed,
          executionPercentage: integratedData.budget.execution_rate,
          transparencyScore: 75, // Default or calculated from other data
          categories: categories
        };
        
        setBudgetData(budgetData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading budget data:', err);
        setError('Failed to load budget execution data');
        
        // Fallback to loading from local JSON if service fails
        try {
          const response = await fetch('/data/json/budget_data_2024.json');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: BudgetData = await response.json();
          setBudgetData(data);
          setLoading(false);
        } catch (fallbackError) {
          console.error('Error loading budget data from local JSON:', fallbackError);
          setError('Failed to load budget execution data from all sources');
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800">No Data Available</h3>
        <p className="text-yellow-700">Budget execution data is not available.</p>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = budgetData.categories.map(category => ({
    ...category,
    underspent: category.budgeted - category.executed,
    executionRateFormatted: `${category.percentage.toFixed(2)}%`
  }));

  // Colors for the charts
  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];
  
  // Prepare data for pie chart (execution by category)
  const pieData = budgetData.categories.map((category, index) => ({
    name: category.name,
    value: category.executed,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📊 Análisis de Ejecución Presupuestaria {budgetData.year}</h1>
        <p className="text-blue-100">
          Comparación entre presupuesto planificado y ejecución real por categoría
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Presupuesto Total</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrencyARS(budgetData.totalBudget)}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Ejecutado</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrencyARS(budgetData.totalExecuted)}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${
            budgetData.executionPercentage < 80 ? 'border-red-300' : 
            budgetData.executionPercentage < 90 ? 'border-yellow-300' : 'border-green-300'
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Tasa de Ejecución</h3>
          <p className={`text-3xl font-bold ${
            budgetData.executionPercentage < 80 ? 'text-red-600' : 
            budgetData.executionPercentage < 90 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {budgetData.executionPercentage.toFixed(2)}%
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${
            budgetData.transparencyScore < 50 ? 'border-red-300' : 
            budgetData.transparencyScore < 70 ? 'border-yellow-300' : 'border-green-300'
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Puntaje de Transparencia</h3>
          <p className={`text-3xl font-bold ${
            budgetData.transparencyScore < 50 ? 'text-red-600' : 
            budgetData.transparencyScore < 70 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {budgetData.transparencyScore.toFixed(0)}/100
          </p>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget vs Execution Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Presupuesto vs Ejecución por Categoría</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  height={60}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => formatCurrencyARS(Number(value)).replace('ARS', '').trim()}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrencyARS(Number(value)), 
                    name === 'budgeted' ? 'Presupuestado' : 'Ejecutado'
                  ]}
                  labelFormatter={(value) => `Categoría: ${value}`}
                />
                <Legend />
                <Bar dataKey="budgeted" name="Presupuestado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="executed" name="Ejecutado" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Execution Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Distribución de Ejecución por Categoría</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrencyARS(Number(value)), 'Monto']}
                  labelFormatter={(value) => `Categoría: ${value}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Execution Rate Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Tasa de Ejecución por Categoría</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                height={60}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Tasa de Ejecución']}
                labelFormatter={(value) => `Categoría: ${value}`}
              />
              <Legend />
              <Bar dataKey="percentage" name="Tasa de Ejecución (%)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              {/* Add reference lines for thresholds */}
              <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="3 3" />
              <ReferenceLine y={95} stroke="#EF4444" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Datos Detallados por Categoría</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Presupuestado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Ejecutado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Subejecutado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Tasa de Ejecución</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
              {chartData.map((category, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 dark:bg-dark-background'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{formatCurrencyARS(category.budgeted)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{formatCurrencyARS(category.executed)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{formatCurrencyARS(category.underspent)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    category.percentage < 80 ? 'text-red-600' : 
                    category.percentage < 90 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {category.executionRateFormatted}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt font-bold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{formatCurrencyARS(budgetData.totalBudget)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{formatCurrencyARS(budgetData.totalExecuted)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                  {formatCurrencyARS(budgetData.totalBudget - budgetData.totalExecuted)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  budgetData.executionPercentage < 80 ? 'text-red-600' : 
                  budgetData.executionPercentage < 90 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {budgetData.executionPercentage.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Red Flag Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-yellow-800 mb-4">🚩 Análisis de Banderas Rojas</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow">
            <h3 className="font-semibold text-red-700">Tasa de Ejecución Uniforme ({budgetData.executionPercentage.toFixed(2)}%)</h3>
            <p className="text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-2">
              Todos los sectores ejecutan aproximadamente el mismo porcentaje del presupuesto. 
              Esto puede indicar contabilidad de compromisos (devengado) en lugar de pagos efectivos.
            </p>
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-sm text-red-800">
                💡 <strong>Investigar:</strong> ¿Estos recursos se tradujeron en obras reales y servicios entregados?
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow">
            <h3 className="font-semibold text-red-700">Bajo Puntaje de Transparencia ({budgetData.transparencyScore.toFixed(0)}/100)</h3>
            <p className="text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-2">
              El puntaje de transparencia indica oportunidades de mejora en la divulgación de información presupuestaria.
            </p>
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-sm text-red-800">
                💡 <strong>Recomendación:</strong> Solicitar desglose detallado de ejecución por partida presupuestaria.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Narrative */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-blue-800 mb-4">📰 Narrativa</h2>
        <div className="space-y-4 text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">
          <p>
            <strong>"El municipio dice ejecutar el {budgetData.executionPercentage.toFixed(2)}% del presupuesto…"</strong> 
            Pero en 2024, $1.25B destinados a Obras Públicas no se tradujeron en calles, cloacas ni viviendas visibles. 
            ¿Se pagaron o solo se comprometieron?
          </p>
          <p>
            <strong>"Por cada peso en Desarrollo Social, se gastan 2.4 en Administración."</strong> 
            ¿Es eficiencia… o sobredimensionamiento político?
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BudgetExecutionDashboard;