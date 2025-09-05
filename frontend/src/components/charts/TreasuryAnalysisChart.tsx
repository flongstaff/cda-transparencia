import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { chartDataIntegrationService } from '../../services/ChartDataIntegrationService';
import { formatCurrencyARS } from '../../utils/formatters';

interface Props {
  year: number;
}

interface TreasuryData {
  date: string;
  description: string;
  category: string;
  amount: number;
  balance: number;
  debt_tracking: string;
}

interface TreasuryAnalytics {
  currentBalance: number;
  totalInflows: number;
  totalOutflows: number;
  netFlow: number;
  monthlyFlows: { month: string; inflow: number; outflow: number; balance: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const CHART_TYPES = [
  { key: 'line', label: 'Líneas', icon: <Activity size={16} /> },
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
  { key: 'area', label: 'Área', icon: <PieChart size={16} /> }
];

const TreasuryAnalysisChart: React.FC<Props> = ({ year }) => {
  const [data, setData] = useState<TreasuryData[]>([]);
  const [analytics, setAnalytics] = useState<TreasuryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartType, setActiveChartType] = useState<'line' | 'bar' | 'area'>('line');

  useEffect(() => {
    loadTreasuryData();
  }, [year]);

  const loadTreasuryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const treasuryData = await ApiService.getTreasuryMovements();
      
      if (treasuryData.length === 0) {
        setError('No hay datos de tesorería disponibles');
        return;
      }

      // Filter data for the selected year
      const yearData = treasuryData.filter(item => 
        new Date(item.date).getFullYear() === year
      );

      // Calculate analytics
      const totalInflows = yearData
        .filter(item => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0);
        
      const totalOutflows = Math.abs(yearData
        .filter(item => item.amount < 0)
        .reduce((sum, item) => sum + item.amount, 0));
        
      const currentBalance = yearData.length > 0 
        ? yearData[yearData.length - 1].balance 
        : 0;
        
      const netFlow = totalInflows - totalOutflows;

      // Group by month for monthly flow analysis
      const monthlyFlows: Record<string, { inflow: number; outflow: number }> = {};
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      yearData.forEach(item => {
        const date = new Date(item.date);
        const month = months[date.getMonth()];
        if (!monthlyFlows[month]) {
          monthlyFlows[month] = { inflow: 0, outflow: 0 };
        }
        if (item.amount > 0) {
          monthlyFlows[month].inflow += item.amount;
        } else {
          monthlyFlows[month].outflow += Math.abs(item.amount);
        }
      });

      const monthlyFlowsArray = months.map(month => ({
        month,
        inflow: monthlyFlows[month]?.inflow || 0,
        outflow: monthlyFlows[month]?.outflow || 0,
        balance: (monthlyFlows[month]?.inflow || 0) - (monthlyFlows[month]?.outflow || 0)
      }));

      // Group by category for breakdown
      const categoryBreakdown = yearData.reduce((acc, item) => {
        const category = item.category || 'Otros';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Math.abs(item.amount);
        return acc;
      }, {} as Record<string, number>);
      
      const categoryBreakdownArray = Object.entries(categoryBreakdown)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);

      setData(yearData);
      setAnalytics({
        currentBalance,
        totalInflows,
        totalOutflows,
        netFlow,
        monthlyFlows: monthlyFlowsArray,
        categoryBreakdown: categoryBreakdownArray
      });

    } catch (err) {
      console.error('Failed to load treasury data:', err);
      setError('Error al cargar datos de tesorería');
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
            <p className="text-gray-600 dark:text-gray-400">Cargando análisis de tesorería...</p>
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
                {entry.name}: {typeof entry.value === 'number' 
                  ? formatCurrencyARS(entry.value) 
                  : entry.value}
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
              data={analytics.monthlyFlows} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
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
              <Bar dataKey="inflow" fill="#10B981" name="Ingresos" />
              <Bar dataKey="outflow" fill="#EF4444" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={analytics.monthlyFlows}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="inflow"
                stackId="1"
                stroke="#10B981"
                fill="url(#inflowGradient)"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stackId="2"
                stroke="#EF4444"
                fill="url(#outflowGradient)"
                name="Egresos"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.monthlyFlows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                dataKey="inflow" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Ingresos"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="outflow" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Egresos"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Balance Mensual"
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando análisis de tesorería...</p>
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
          onClick={loadTreasuryData}
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
              Análisis de Tesorería {year}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Flujos de caja y movimientos de tesorería
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
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrencyARS(analytics.currentBalance, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Actual</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrencyARS(analytics.totalInflows, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrencyARS(analytics.totalOutflows, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Egresos Totales</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${analytics.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrencyARS(analytics.netFlow, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Flujo Neto</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Category Breakdown */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Desglose por Categoría</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.categoryBreakdown.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrencyARS(category.value, true)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {((category.value / (analytics.totalInflows + analytics.totalOutflows)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TreasuryAnalysisChart;
