import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { unifiedDataService } from '../../services/UnifiedDataService';

interface BudgetCategory {
  name: string;
  budgeted: number;
  executed: number;
  percentage: number;
  color: string;
}

interface BudgetExecutionData {
  year: number;
  totalBudget: number;
  totalExecuted: number;
  executionPercentage: number;
  transparencyScore: number;
  categories: BudgetCategory[];
  quarterlyData: Array<{
    quarter: string;
    budgeted: number;
    executed: number;
    percentage: number;
  }>;
  historicalData: Array<{
    year: number;
    totalBudget: number;
    totalExecuted: number;
    executionPercentage: number;
    transparencyScore: number;
  }>;
}

const BudgetExecutionDashboard: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetExecutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'historical'>('overview');

  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

  useEffect(() => {
    loadBudgetData();
  }, [selectedYear]);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulated data based on your analysis
      const mockData: BudgetExecutionData = {
        year: selectedYear,
        totalBudget: 5000000000,
        totalExecuted: 3750000000,
        executionPercentage: 75.0,
        transparencyScore: selectedYear >= 2023 ? 40 : 68, // Reflecting the decline you found
        categories: [
          {
            name: "Gastos de Personal",
            budgeted: 2150670000,
            executed: 1890000000,
            percentage: 87.9,
            color: "#3B82F6"
          },
          {
            name: "Gastos Corrientes",
            budgeted: 1250000000,
            executed: 937500000,
            percentage: 75.0,
            color: "#10B981"
          },
          {
            name: "Gastos de Capital",
            budgeted: 875000000,
            executed: 656250000,
            percentage: 75.0,
            color: "#F59E0B"
          },
          {
            name: "Servicio de Deuda",
            budgeted: 375000000,
            executed: 281250000,
            percentage: 75.0,
            color: "#EF4444"
          },
          {
            name: "Transferencias",
            budgeted: 350000000,
            executed: 0,
            percentage: 0,
            color: "#8B5CF6"
          }
        ],
        quarterlyData: [
          { quarter: "Q1", budgeted: 1250000000, executed: 937500000, percentage: 75.0 },
          { quarter: "Q2", budgeted: 1250000000, executed: 937500000, percentage: 75.0 },
          { quarter: "Q3", budgeted: 1250000000, executed: 937500000, percentage: 75.0 },
          { quarter: "Q4", budgeted: 1250000000, executed: 937500000, percentage: 75.0 }
        ],
        historicalData: [
          { year: 2025, totalBudget: 5200000000, totalExecuted: 3900000000, executionPercentage: 75.0, transparencyScore: 42 },
          { year: 2024, totalBudget: 5000000000, totalExecuted: 3750000000, executionPercentage: 75.0, transparencyScore: 40 },
          { year: 2023, totalBudget: 4800000000, totalExecuted: 3600000000, executionPercentage: 75.0, transparencyScore: 41 },
          { year: 2022, totalBudget: 4500000000, totalExecuted: 3375000000, executionPercentage: 75.0, transparencyScore: 45 },
          { year: 2021, totalBudget: 4200000000, totalExecuted: 3150000000, executionPercentage: 75.0, transparencyScore: 52 },
          { year: 2020, totalBudget: 4000000000, totalExecuted: 3000000000, executionPercentage: 75.0, transparencyScore: 58 },
          { year: 2019, totalBudget: 3800000000, totalExecuted: 2850000000, executionPercentage: 75.0, transparencyScore: 68 }
        ]
      };

      setBudgetData(mockData);
    } catch (err) {
      setError('Error al cargar datos presupuestarios');
      console.error('Budget data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos presupuestarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button 
          onClick={loadBudgetData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No hay datos presupuestarios disponibles</h3>
        <p className="text-gray-500">No se encontraron datos para el año {selectedYear}</p>
      </div>
    );
  }

  // Prepare data for charts
  const categoryChartData = budgetData.categories.map(category => ({
    name: category.name,
    Presupuestado: category.budgeted / 1000000,
    Ejecutado: category.executed / 1000000,
    percentage: category.percentage
  }));

  const quarterlyChartData = budgetData.quarterlyData.map(quarter => ({
    name: quarter.quarter,
    Presupuestado: quarter.budgeted / 1000000,
    Ejecutado: quarter.executed / 1000000,
    percentage: quarter.percentage
  }));

  const historicalExecutionData = budgetData.historicalData.map(year => ({
    name: year.year.toString(),
    Ejecución: year.executionPercentage,
    Transparencia: year.transparencyScore
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Ejecución Presupuestaria</h1>
          <p className="mt-2 text-gray-600">
            Análisis detallado de la ejecución presupuestaria del municipio de Carmen de Areco
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetData.totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ejecutado</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetData.totalExecuted)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <PieChartIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">% Ejecución</p>
              <p className={`text-2xl font-bold ${budgetData.executionPercentage >= 85 ? 'text-green-600' : budgetData.executionPercentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {formatPercentage(budgetData.executionPercentage)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transparencia</p>
              <p className={`text-2xl font-bold ${budgetData.transparencyScore >= 80 ? 'text-green-600' : budgetData.transparencyScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {formatPercentage(budgetData.transparencyScore)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
            { id: 'detailed', label: 'Detallado', icon: <PieChartIcon className="h-4 w-4 mr-2" /> },
            { id: 'historical', label: 'Histórico', icon: <TrendingUp className="h-4 w-4 mr-2" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === tab.id
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

      {/* Overview View */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Desglose por Categorías (Millones ARS)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}M`, '']}
                    labelFormatter={(name) => name}
                  />
                  <Legend />
                  <Bar dataKey="Presupuestado" fill="#3B82F6" name="Presupuestado" />
                  <Bar dataKey="Ejecutado" fill="#10B981" name="Ejecutado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Execution Percentage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Porcentaje de Ejecución por Categoría
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="name"
                  >
                    {budgetData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {/* Quarterly Execution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ejecución Trimestral (Millones ARS)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quarterlyChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}M`, '']}
                    labelFormatter={(name) => name}
                  />
                  <Legend />
                  <Bar dataKey="Presupuestado" fill="#3B82F6" name="Presupuestado" />
                  <Bar dataKey="Ejecutado" fill="#10B981" name="Ejecutado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Detail Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalle por Categorías Presupuestarias
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Presupuestado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ejecutado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Ejecución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diferencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgetData.categories.map((category, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(category.budgeted)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(category.executed)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.percentage >= 85 
                            ? 'bg-green-100 text-green-800' 
                            : category.percentage >= 70 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentage(category.percentage)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(category.budgeted - category.executed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Historical View */}
      {viewMode === 'historical' && (
        <div className="space-y-6">
          {/* Historical Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendencia Histórica de Ejecución y Transparencia
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historicalExecutionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Ejecución" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="% Ejecución"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Transparencia" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="% Transparencia"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Datos Históricos de Ejecución Presupuestaria
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Presupuesto Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ejecutado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Ejecución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score Transparencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgetData.historicalData.map((yearData, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {yearData.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(yearData.totalBudget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(yearData.totalExecuted)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          yearData.executionPercentage >= 85 
                            ? 'bg-green-100 text-green-800' 
                            : yearData.executionPercentage >= 70 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentage(yearData.executionPercentage)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          yearData.transparencyScore >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : yearData.transparencyScore >= 60 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentage(yearData.transparencyScore)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Critical Alert */}
      {budgetData.transparencyScore < 50 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Alerta de Transparencia Crítica
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  El índice de transparencia ha caído a {formatPercentage(budgetData.transparencyScore)}, 
                  lo que indica una disminución significativa en la disponibilidad de información pública.
                </p>
                <p className="mt-1">
                  Se han identificado {formatCurrency(169828314.90)} en obras públicas no ejecutadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetExecutionDashboard;