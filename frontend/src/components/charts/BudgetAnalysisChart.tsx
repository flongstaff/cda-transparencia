import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon, Activity, Loader2 } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { formatCurrencyARS } from '../../utils/formatters';

interface Props {
  year: number;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
}

interface BudgetData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  execution_percentage: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const CHART_TYPES = [
  { key: 'line', label: 'Líneas', icon: <Activity size={16} /> },
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
  { key: 'pie', label: 'Circular', icon: <PieIcon size={16} /> },
  { key: 'area', label: 'Área', icon: <TrendingUp size={16} /> }
];

const BudgetAnalysisChart: React.FC<Props> = ({ year, chartType = 'line' }) => {
  const [data, setData] = useState<BudgetData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartType, setActiveChartType] = useState(chartType);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    avgExecution: 0,
    trend: 'stable' as 'up' | 'down' | 'stable'
  });

  useEffect(() => {
    loadBudgetData();
  }, [year]);

  const loadBudgetData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load financial reports and operational expenses
      const [reports, expenses, feesRights] = await Promise.all([
        ApiService.getFinancialReports(year),
        ApiService.getOperationalExpenses(year),
        ApiService.getFeesRights(year)
      ]);

      // Transform data for charts
      const monthlyData: BudgetData[] = [];
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      // Group reports by quarter and extrapolate to months
      const quarterlyReports = reports.reduce((acc, report) => {
        const quarter = report.quarter || 1;
        if (!acc[quarter]) acc[quarter] = [];
        acc[quarter].push(report);
        return acc;
      }, {} as Record<number, typeof reports>);

      for (let month = 0; month < 12; month++) {
        const quarter = Math.floor(month / 3) + 1;
        const quarterReports = quarterlyReports[quarter] || [];
        const monthReport = quarterReports[0]; // Use first report of quarter

        const monthlyIncome = monthReport ? monthReport.income / 3 : 0; // Divide quarterly data by 3
        const monthlyExpenses = monthReport ? monthReport.expenses / 3 : 0;
        const balance = monthlyIncome - monthlyExpenses;
        const executionRate = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

        monthlyData.push({
          month: months[month],
          income: monthlyIncome,
          expenses: monthlyExpenses,
          balance: balance,
          execution_percentage: executionRate
        });
      }

      // Create category data for pie chart
      const expenseCategories = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Otros';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      const categoryArray: CategoryData[] = Object.entries(expenseCategories)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 categories

      // Calculate summary statistics
      const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
      const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
      const netBalance = totalIncome - totalExpenses;
      const avgExecution = monthlyData.length > 0 
        ? monthlyData.reduce((sum, d) => sum + d.execution_percentage, 0) / monthlyData.length 
        : 0;

      // Determine trend
      const firstHalf = monthlyData.slice(0, 6).reduce((sum, d) => sum + d.balance, 0);
      const secondHalf = monthlyData.slice(6).reduce((sum, d) => sum + d.balance, 0);
      const trend = secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'stable';

      setData(monthlyData);
      setCategoryData(categoryArray);
      setSummary({
        totalIncome,
        totalExpenses,
        netBalance,
        avgExecution,
        trend
      });

    } catch (err) {
      console.error('Failed to load budget data:', err);
      setError('Error al cargar datos presupuestarios');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando datos del presupuesto...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-80 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }

    const customTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900 dark:text-white">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {typeof entry.value === 'number' && entry.name !== 'Ejecución' 
                  ? formatCurrencyARS(entry.value) 
                  : `${entry.value?.toFixed(1)}%`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (activeChartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrencyARS(value, true)}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="income" fill="#3B82F6" name="Ingresos" />
              <Bar dataKey="expenses" fill="#EF4444" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrencyARS(value), 'Monto']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" className="text-sm" />
              <YAxis 
                className="text-sm"
                tickFormatter={(value) => formatCurrencyARS(value, true)}
              />
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <Tooltip content={customTooltip} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#3B82F6"
                fill="url(#incomeGradient)"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#EF4444"
                fill="url(#expenseGradient)"
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="currency"
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrencyARS(value, true)}
              />
              <YAxis 
                yAxisId="percentage"
                orientation="right"
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line 
                yAxisId="currency"
                type="monotone" 
                dataKey="income" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Ingresos"
                dot={{ r: 4 }}
              />
              <Line 
                yAxisId="currency"
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Gastos"
                dot={{ r: 4 }}
              />
              <Line 
                yAxisId="percentage"
                type="monotone" 
                dataKey="execution_percentage" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Ejecución %"
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Análisis Presupuestario {year}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Evolución de ingresos, gastos y ejecución presupuestaria
            </p>
          </div>
          
          {/* Chart type selector */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {CHART_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => setActiveChartType(type.key as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeChartType === type.key
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type.icon}
                <span className="ml-1 hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrencyARS(summary.totalIncome, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrencyARS(summary.totalExpenses, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Totales</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrencyARS(summary.netBalance, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance Neto</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.avgExecution.toFixed(1)}%
              </p>
              {summary.trend === 'up' ? (
                <TrendingUp className="ml-1 text-green-500" size={20} />
              ) : summary.trend === 'down' ? (
                <TrendingDown className="ml-1 text-red-500" size={20} />
              ) : (
                <div className="ml-1 w-5 h-5 bg-gray-400 rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ejecución Promedio</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>
    </motion.div>
  );
};

export default BudgetAnalysisChart;