import React, { useState, useEffect, useMemo } from 'react';
import { 
  ComposedChart, 
  BarChart, 
  Bar, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, AlertTriangle } from 'lucide-react';
import BaseChart from './BaseChart';

// Type definitions
interface ContractData {
  month: string;
  total_contracts: number;
  total_value: number;
  completion_rate: number;
  delay_rate: number;
  by_type: Record<string, number>;
  status_distribution: Record<string, number>;
  performance_metrics: {
    on_time: number;
    delayed: number;
    completed: number;
    in_progress: number;
  };
}

interface SummaryData {
  total_contracts: number;
  total_value: number;
  avg_completion_rate: number;
  avg_delay_rate: number;
  by_type: Record<string, number>;
}

// Chart view types
type ChartView = 'overview' | 'types' | 'status' | 'performance';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Tooltip payload interface
interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Generate realistic contract data (sync function)
const generateContractData = (): ContractData[] => {
  return MONTHS.map((month, index) => {
    const baseContracts = Math.floor(Math.random() * 15) + 10; // 10-25 contracts per month
    const baseValue = Math.floor(Math.random() * 5000000) + 2000000; // 2M-7M ARS per month
    
    return {
      month,
      total_contracts: baseContracts,
      total_value: baseValue,
      completion_rate: Math.random() * 0.3 + 0.7, // 70-100%
      delay_rate: Math.random() * 0.2, // 0-20%
      by_type: {
        'Obras Públicas': Math.floor(baseContracts * (Math.random() * 0.4 + 0.3)),
        'Servicios': Math.floor(baseContracts * (Math.random() * 0.3 + 0.2)),
        'Suministros': Math.floor(baseContracts * (Math.random() * 0.2 + 0.15)),
        'Consultoría': Math.floor(baseContracts * (Math.random() * 0.15 + 0.1))
      },
      status_distribution: {
        'En Proceso': Math.floor(baseContracts * 0.4),
        'Completado': Math.floor(baseContracts * 0.5),
        'Cancelado': Math.floor(baseContracts * 0.1)
      },
      performance_metrics: {
        on_time: Math.floor(baseContracts * (Math.random() * 0.7 + 0.2)),
        delayed: Math.floor(baseContracts * (Math.random() * 0.3)),
        completed: Math.floor(baseContracts * 0.5),
        in_progress: Math.floor(baseContracts * 0.4)
      }
    };
  });
};

// Format currency values
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

// Format percentage values
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Format tooltip values based on type
const formatTooltipValue = (value: number, name: string): string => {
  if (name.toLowerCase().includes('valor') || name.toLowerCase().includes('monto')) {
    return formatCurrency(value);
  }
  if (name.toLowerCase().includes('rate') || name.toLowerCase().includes('porcentaje')) {
    return formatPercentage(value);
  }
  return value.toString();
};

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="font-medium text-gray-800 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatTooltipValue(entry.value, entry.name)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Summary card component
const SummaryCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ReactNode 
}> = ({ title, value, subtitle, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);

// Loading skeleton component
const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6 animate-pulse"></div>
    <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
  </div>
);

// Error fallback component
const ErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
    <div className="text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
        Error al cargar el análisis de contratos
      </h3>
      <p className="text-red-700 dark:text-red-300 mb-4">
        No se pudo cargar el análisis de contratos. Por favor, inténtelo de nuevo.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);

interface ContractAnalysisChartProps {
  year: number;
}

const ContractAnalysisChart: React.FC<ContractAnalysisChartProps> = ({ year }) => {
  const [data, setData] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<ChartView>('overview');

  // Load contract analysis data
  const loadContractAnalysis = () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call
      // const response = await fetch(`/api/contracts/${year}`);
      // const contractData = await response.json();
      
      // For now, generate mock data synchronously
      const contractData = generateContractData();
      setData(contractData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el análisis de contratos');
    } finally {
      setLoading(false);
    }
  };

  // Debounce year changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadContractAnalysis();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [year]);

  // Memoize summary data calculation
  const summaryData = useMemo<SummaryData | null>(() => {
    if (data.length === 0) {
      return null;
    }

    return {
      total_contracts: data.reduce((sum, month) => sum + month.total_contracts, 0),
      total_value: data.reduce((sum, month) => sum + month.total_value, 0),
      avg_completion_rate: data.reduce((sum, month) => sum + month.completion_rate, 0) / data.length,
      avg_delay_rate: data.reduce((sum, month) => sum + month.delay_rate, 0) / data.length,
      by_type: data.reduce((acc, month) => {
        Object.entries(month.by_type).forEach(([type, value]) => {
          acc[type] = (acc[type] || 0) + value;
        });
        return acc;
      }, {} as Record<string, number>)
    };
  }, [data]);

  // Memoize chart data transformations
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formatted_value: formatCurrency(item.total_value),
      formatted_completion_rate: formatPercentage(item.completion_rate),
      formatted_delay_rate: formatPercentage(item.delay_rate)
    }));
  }, [data]);

  // Render chart based on active view
  const renderChart = () => {
    switch (activeChart) {
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height={400} aria-label="Gráfico de contratos por mes">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis 
                yAxisId="left" 
                tickFormatter={formatCurrency}
                width={80}
                stroke="#6B7280"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 1]}
                tickFormatter={formatPercentage}
                width={60}
                stroke="#6B7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="total_value" 
                name="Valor Total" 
                fill={COLORS[0]}
                radius={[4, 4, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="completion_rate" 
                name="Tasa de Finalización" 
                stroke={COLORS[1]} 
                strokeWidth={3}
                dot={{ r: 6, fill: COLORS[1] }}
                activeDot={{ r: 8, stroke: COLORS[1], strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="delay_rate" 
                name="Tasa de Retraso" 
                stroke={COLORS[2]} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: COLORS[2] }}
                activeDot={{ r: 6, stroke: COLORS[2], strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'types':
        const typeData = Object.entries(summaryData?.by_type || {}).map(([name, value]) => ({ name, value }));
        return (
          <ResponsiveContainer width="100%" height={400} aria-label="Distribución por tipo de contrato">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                dataKey="value"
                nameKey="name"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Monto']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'status':
        const statusData = chartData.map(item => ({
          month: item.month,
          'En Proceso': item.status_distribution['En Proceso'] || 0,
          'Completado': item.status_distribution['Completado'] || 0,
          'Cancelado': item.status_distribution['Cancelado'] || 0
        }));
        return (
          <ResponsiveContainer width="100%" height={400} aria-label="Distribución por estado de contrato">
            <BarChart
              data={statusData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="En Proceso" name="En Proceso" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Completado" name="Completado" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cancelado" name="Cancelado" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={400} aria-label="Métricas de rendimiento de contratos">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis 
                domain={[0, 1]}
                tickFormatter={formatPercentage}
                width={60}
                stroke="#6B7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="completion_rate" 
                name="Tasa de Finalización" 
                stroke={COLORS[0]} 
                fill="url(#colorCompletion)"
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="delay_rate" 
                name="Tasa de Retraso" 
                stroke={COLORS[2]} 
                fill="url(#colorDelay)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Tipo de gráfico no soportado
          </div>
        );
    }
  };

  // Handle retry
  const handleRetry = () => {
    loadContractAnalysis();
  };

  // Render loading skeleton
  if (loading) {
    return <ChartSkeleton />;
  }

  // Render error fallback
  if (error) {
    return <ErrorFallback onRetry={handleRetry} />;
  }

  // Render fallback if no summary data
  if (!summaryData) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No se pudo calcular el resumen.
      </div>
    );
  }

  return (
    <BaseChart
      title={`Análisis de Contratos ${year}`}
      subtitle={`Datos de contrataciones municipales para el año ${year}`}
      loading={loading}
      error={error}
      onRetry={handleRetry}
      controls={
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4" /> },
            { key: 'types', label: 'Tipos', icon: <PieChartIcon className="h-4 w-4" /> },
            { key: 'status', label: 'Estado', icon: <Activity className="h-4 w-4" /> },
            { key: 'performance', label: 'Rendimiento', icon: <TrendingUp className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key as ChartView)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeChart === tab.key
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveChart(tab.key as ChartView);
                }
              }}
              tabIndex={0}
              aria-label={`Ver gráfico de ${tab.label.toLowerCase()}`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Contratos"
          value={summaryData.total_contracts.toLocaleString()}
          subtitle="Contratos registrados este año"
          icon={<BarChart3 className="h-6 w-6" />}
        />
        <SummaryCard
          title="Valor Total"
          value={formatCurrency(summaryData.total_value)}
          subtitle="Monto total de contrataciones"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <SummaryCard
          title="Finalización"
          value={formatPercentage(summaryData.avg_completion_rate)}
          subtitle="Tasa promedio de finalización"
          icon={<PieChartIcon className="h-6 w-6" />}
        />
        <SummaryCard
          title="Retrasos"
          value={formatPercentage(summaryData.avg_delay_rate)}
          subtitle="Tasa promedio de retrasos"
          icon={<Activity className="h-6 w-6" />}
        />
      </div>

      {/* Chart */}
      <div className="h-96">
        {renderChart()}
      </div>

      {/* Chart Description */}
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        {activeChart === 'overview' && (
          <p>
            Este gráfico muestra la evolución mensual del valor total de contratos y las tasas de finalización y retraso. 
            Permite identificar patrones estacionales y evaluar el desempeño general de las contrataciones.
          </p>
        )}
        {activeChart === 'types' && (
          <p>
            La distribución por tipos de contrato revela cómo se asignan los recursos entre diferentes categorías de servicios. 
            Esto ayuda a entender las prioridades de inversión del municipio.
          </p>
        )}
        {activeChart === 'status' && (
          <p>
            El estado de los contratos muestra cuántos están en proceso, completados o cancelados. 
            Esta información es crucial para la gestión y seguimiento de compromisos.
          </p>
        )}
        {activeChart === 'performance' && (
          <p>
            Las métricas de rendimiento comparan las tasas de finalización y retraso a lo largo del tiempo. 
            Un buen desempeño se refleja en altas tasas de finalización y bajas tasas de retraso.
          </p>
        )}
      </div>
    </BaseChart>
  );
};

export default ContractAnalysisChart;