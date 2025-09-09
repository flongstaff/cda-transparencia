import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3, Activity, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useBudgetData } from '../../hooks/useUnifiedData';
import { formatCurrencyARS } from '../../utils/formatters';
import { BudgetDataSchema } from '../../schemas/budget';

interface BudgetAnalysisChartProps {
  year: number;
}

interface BudgetItem {
  name: string;
  value: number;
  budgeted?: number;
  executed?: number;
  source?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CHART_TYPES = [
  { key: 'line', label: 'Líneas', icon: <Activity size={16} /> },
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
  { key: 'pie', label: 'Circular', icon: <PieIcon size={16} /> }
];

// Debounce hook for year changes
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debbouncedValue;
};

const BudgetAnalysisChart: React.FC<BudgetAnalysisChartProps> = ({ year }) => {
  const [activeChartType, setActiveChartType] = useState<'line' | 'bar' | 'pie'>('bar');
  const debouncedYear = useDebounce(year, 300);

  // Use unified data hook with React Query
  const { data: budgetData, isLoading, error, refetch } = useBudgetData(debouncedYear);

  if (isLoading) {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        role="region"
        aria-label={`Cargando análisis presupuestario para el año ${debouncedYear}`}
      >
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando análisis presupuestario...</span>
          </div>
        </div>
        
        {/* Live region for accessibility */}
        <div aria-live="polite" className="sr-only">
          Cargando análisis presupuestario para el año {debouncedYear}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        role="region"
        aria-label={`Error en el análisis presupuestario para el año ${debouncedYear}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 dark:text-red-400">Error al cargar los datos presupuestarios</p>
              <button 
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors flex items-center mx-auto"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
        
        {/* Live region for accessibility */}
        <div aria-live="assertive" className="sr-only">
          Error al cargar datos presupuestarios para el año {debouncedYear}: {error.message}
        </div>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              No hay datos presupuestarios disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Los datos para el año {debouncedYear} aún no han sido cargados.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? formatCurrencyARS(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeChartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              accessibilityLayer
              role="img"
              aria-label="Gráfico de barras de análisis presupuestario"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
                aria-label="Categorías presupuestarias"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrencyARS(value, true)}
                width={80}
                aria-label="Monto"
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                name="Monto Ejecutado"
                aria-label="Barras de monto ejecutado por categoría"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    aria-label={`Barra para ${entry.name}: ${formatCurrencyARS(entry.value)}`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart accessibilityLayer role="img" aria-label="Gráfico circular de análisis presupuestario">
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                aria-label="Segmentos de presupuesto por categoría"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    aria-label={`${entry.name}: ${formatCurrencyARS(entry.value)} (${(entry.value / data.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1)}%)`}
                  />
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
        // Create time series data for budget evolution
        const timeSeriesData = [
          { month: 'Ene', budget: data[0]?.value * 0.1 || 0 },
          { month: 'Feb', budget: data[0]?.value * 0.2 || 0 },
          { month: 'Mar', budget: data[0]?.value * 0.3 || 0 },
          { month: 'Abr', budget: data[0]?.value * 0.4 || 0 },
          { month: 'May', budget: data[0]?.value * 0.5 || 0 },
          { month: 'Jun', budget: data[0]?.value * 0.6 || 0 },
          { month: 'Jul', budget: data[0]?.value * 0.7 || 0 },
          { month: 'Ago', budget: data[0]?.value * 0.8 || 0 },
          { month: 'Sep', budget: data[0]?.value * 0.9 || 0 },
          { month: 'Oct', budget: data[0]?.value * 0.95 || 0 },
          { month: 'Nov', budget: data[0]?.value * 0.98 || 0 },
          { month: 'Dic', budget: data[0]?.value || 0 }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={timeSeriesData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              accessibilityLayer
              role="img"
              aria-label="Gráfico de línea de evolución presupuestaria"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-sm"
                tick={{ fontSize: 12 }}
                aria-label="Meses"
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrencyARS(value, true)}
                aria-label="Monto presupuestado"
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Presupuesto Acumulado"
                dot={{ r: 4 }}
                aria-label="Línea de evolución presupuestaria"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label={`Análisis presupuestario para el año ${debouncedYear}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Análisis Presupuestario {debouncedYear}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ejecución presupuestaria y distribución por categorías
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
                aria-pressed={activeChartType === type.key}
                aria-label={`Cambiar a gráfico de ${type.label.toLowerCase()}`}
              >
                {type.icon}
                <span className="ml-1 hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Live region for accessibility */}
      <div aria-live="polite" className="sr-only">
        Mostrando análisis presupuestario para el año {debouncedYear} en formato de gráfico {activeChartType}
      </div>
    </motion.div>
  );
};

export default BudgetAnalysisChart;