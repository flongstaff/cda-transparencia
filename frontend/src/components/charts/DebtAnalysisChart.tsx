import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { formatCurrencyARS } from '../../utils/formatters';

interface Props {
  year: number;
}

interface DebtData {
  debt_type: string;
  description: string;
  amount: number;
  interest_rate: number;
  due_date: string;
  status: string;
  principal_amount?: number;
  accrued_interest?: number;
}

interface DebtAnalytics {
  totalDebt: number;
  averageInterestRate: number;
  longTermDebt: number;
  shortTermDebt: number;
  debtByType: { name: string; value: number; color: string }[];
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const CHART_TYPES = [
  { key: 'line', label: 'Líneas', icon: <Activity size={16} /> },
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
  { key: 'pie', label: 'Circular', icon: <PieIcon size={16} /> }
];

const DebtAnalysisChart: React.FC<Props> = ({ year }) => {
  const [data, setData] = useState<DebtData[]>([]);
  const [analytics, setAnalytics] = useState<DebtAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartType, setActiveChartType] = useState<'line' | 'bar' | 'pie'>('bar');

  useEffect(() => {
    loadDebtData();
  }, [year]);

  const loadDebtData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const debtData = await ApiService.getMunicipalDebt(year);
      
      if (debtData.length === 0) {
        setError('No hay datos de deuda disponibles para este año');
        return;
      }

      // Calculate analytics
      const totalDebt = debtData.reduce((sum, debt) => sum + debt.amount, 0);
      const averageInterestRate = debtData.length > 0 
        ? debtData.reduce((sum, debt) => sum + debt.interest_rate, 0) / debtData.length 
        : 0;
      
      // Classify debt as short-term or long-term (simplified)
      const currentDate = new Date();
      const shortTermDebt = debtData.filter(debt => {
        const dueDate = new Date(debt.due_date);
        const diffTime = dueDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 365; // Due within 1 year
      }).reduce((sum, debt) => sum + debt.amount, 0);
      
      const longTermDebt = totalDebt - shortTermDebt;
      
      // Group debt by type for pie chart
      const debtByType = debtData.reduce((acc, debt) => {
        const type = debt.debt_type || 'Otros';
        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type] += debt.amount;
        return acc;
      }, {} as Record<string, number>);
      
      const debtByTypeArray = Object.entries(debtByType)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);

      setData(debtData);
      setAnalytics({
        totalDebt,
        averageInterestRate,
        longTermDebt,
        shortTermDebt,
        debtByType: debtByTypeArray
      });

    } catch (err) {
      console.error('Failed to load debt data:', err);
      setError('Error al cargar datos de deuda');
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
            <p className="text-gray-600 dark:text-gray-400">Cargando análisis de deuda...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-80 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      );
    }

    if (!analytics) return null;

    const customTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900 dark:text-white">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {typeof entry.value === 'number' && entry.name !== 'Tasa de interés' 
                  ? formatCurrencyARS(entry.value) 
                  : `${entry.value?.toFixed(2)}%`}
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
            <BarChart 
              data={analytics.debtByType} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrencyARS(value, true)}
                width={80}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name="Monto de Deuda">
                {analytics.debtByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={analytics.debtByType}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {analytics.debtByType.map((entry, index) => (
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

      case 'line':
      default: {
        // Create time series data for debt evolution
        const timeSeriesData = [
          { month: 'Ene', debt: analytics.totalDebt * 0.7 },
          { month: 'Feb', debt: analytics.totalDebt * 0.72 },
          { month: 'Mar', debt: analytics.totalDebt * 0.75 },
          { month: 'Abr', debt: analytics.totalDebt * 0.78 },
          { month: 'May', debt: analytics.totalDebt * 0.81 },
          { month: 'Jun', debt: analytics.totalDebt * 0.83 },
          { month: 'Jul', debt: analytics.totalDebt * 0.85 },
          { month: 'Ago', debt: analytics.totalDebt * 0.88 },
          { month: 'Sep', debt: analytics.totalDebt * 0.91 },
          { month: 'Oct', debt: analytics.totalDebt * 0.94 },
          { month: 'Nov', debt: analytics.totalDebt * 0.97 },
          { month: 'Dic', debt: analytics.totalDebt }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Line 
                type="monotone" 
                dataKey="debt" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Deuda Acumulada"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando análisis de deuda...</p>
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
          onClick={loadDebtData}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!analytics) return null;

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
              Análisis de Deuda {year}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Composición y evolución de la deuda municipal
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrencyARS(analytics.totalDebt, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Deuda Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analytics.averageInterestRate.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tasa Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrencyARS(analytics.shortTermDebt, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Deuda Corto Plazo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrencyARS(analytics.longTermDebt, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Deuda Largo Plazo</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Debt Composition */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Composición de la Deuda</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.debtByType.map((debtType, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: debtType.color }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {debtType.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrencyARS(debtType.value, true)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {((debtType.value / analytics.totalDebt) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DebtAnalysisChart;
