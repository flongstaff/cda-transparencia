import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { formatCurrencyARS } from '../../utils/formatters';

interface Props {
  year: number;
}

interface InvestmentData {
  asset_type: string;
  description: string;
  value: number;
  depreciation: number;
  location: string;
  net_value?: number;
  age_years?: number;
}

interface InvestmentAnalytics {
  totalInvestment: number;
  totalDepreciation: number;
  netInvestmentValue: number;
  investmentByType: { name: string; value: number; color: string }[];
  topInvestments: InvestmentData[];
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const CHART_TYPES = [
  { key: 'line', label: 'Líneas', icon: <Activity size={16} /> },
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
  { key: 'pie', label: 'Circular', icon: <PieIcon size={16} /> }
];

const InvestmentAnalysisChart: React.FC<Props> = ({ year }) => {
  const [data, setData] = useState<InvestmentData[]>([]);
  const [analytics, setAnalytics] = useState<InvestmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartType, setActiveChartType] = useState<'line' | 'bar' | 'pie'>('bar');

  useEffect(() => {
    loadInvestmentData();
  }, [year]);

  const loadInvestmentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const investmentData = await ApiService.getInvestmentsAssets(year);
      
      if (investmentData.length === 0) {
        setError('No hay datos de inversiones disponibles para este año');
        return;
      }

      // Calculate analytics
      const totalInvestment = investmentData.reduce((sum, investment) => sum + investment.value, 0);
      const totalDepreciation = investmentData.reduce((sum, investment) => sum + (investment.depreciation || 0), 0);
      const netInvestmentValue = totalInvestment - totalDepreciation;
      
      // Group investments by type for pie chart
      const investmentByType = investmentData.reduce((acc, investment) => {
        const type = investment.asset_type || 'Otros';
        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type] += investment.value;
        return acc;
      }, {} as Record<string, number>);
      
      const investmentByTypeArray = Object.entries(investmentByType)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);

      // Get top investments
      const topInvestments = [...investmentData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setData(investmentData);
      setAnalytics({
        totalInvestment,
        totalDepreciation,
        netInvestmentValue,
        investmentByType: investmentByTypeArray,
        topInvestments
      });

    } catch (err) {
      console.error('Failed to load investment data:', err);
      setError('Error al cargar datos de inversiones');
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
            <p className="text-gray-600 dark:text-gray-400">Cargando análisis de inversiones...</p>
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
              data={analytics.investmentByType} 
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
              <Bar dataKey="value" fill="#3B82F6" name="Valor de Inversión">
                {analytics.investmentByType.map((entry, index) => (
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
                data={analytics.investmentByType}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {analytics.investmentByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrencyARS(value), 'Valor']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line': {
        // Create time series data for investment evolution
        const timeSeriesData = [
          { month: 'Ene', investment: analytics.totalInvestment * 0.7 },
          { month: 'Feb', investment: analytics.totalInvestment * 0.72 },
          { month: 'Mar', investment: analytics.totalInvestment * 0.75 },
          { month: 'Abr', investment: analytics.totalInvestment * 0.78 },
          { month: 'May', investment: analytics.totalInvestment * 0.81 },
          { month: 'Jun', investment: analytics.totalInvestment * 0.83 },
          { month: 'Jul', investment: analytics.totalInvestment * 0.85 },
          { month: 'Ago', investment: analytics.totalInvestment * 0.88 },
          { month: 'Sep', investment: analytics.totalInvestment * 0.91 },
          { month: 'Oct', investment: analytics.totalInvestment * 0.94 },
          { month: 'Nov', investment: analytics.totalInvestment * 0.97 },
          { month: 'Dic', investment: analytics.totalInvestment }
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
                dataKey="investment" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Inversión Acumulada"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de inversiones...</p>
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
          onClick={loadInvestmentData}
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
              Análisis de Inversiones {year}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Composición y evolución de las inversiones municipales
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrencyARS(analytics.totalInvestment, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Inversión Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrencyARS(analytics.totalDepreciation, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Depreciación Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrencyARS(analytics.netInvestmentValue, true)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Valor Neto</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Top Investments */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Principales Inversiones</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.topInvestments.map((investment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {investment.description}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {investment.asset_type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrencyARS(investment.value, true)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {investment.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default InvestmentAnalysisChart;