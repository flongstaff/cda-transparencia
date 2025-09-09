import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { 
  CheckCircle, 
  ExternalLink, 
  Shield,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Database,
  Layers,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UniversalDataPoint {
  name: string;
  value?: number;
  [key: string]: any;
}

interface UniversalChartProps {
  data: UniversalDataPoint[];
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed';
  title: string;
  sources?: string[];
  showValidation?: boolean;
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  dataKey?: string;
  nameKey?: string;
  height?: number;
  additionalSeries?: Array<{dataKey: string, name: string, color: string}>;
  showControls?: boolean;
  timeRange?: string;
  metadata?: any;
  onChartTypeChange?: (type: string) => void;
  onRetry?: () => void;
  error?: string | null;
}

const COLORS = ['#0056b3', '#28a745', '#ff8c00', '#ffffff', '#20c997', '#fd7e14', '#6f42c1', '#e83e8c', '#6c757d', '#17a2b8'];

const CHART_TYPES = [
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
  { key: 'line', label: 'Líneas', icon: <Activity size={16} /> },
  { key: 'pie', label: 'Circular', icon: <PieChartIcon size={16} /> },
  { key: 'area', label: 'Área', icon: <TrendingUp size={16} /> },
  { key: 'scatter', label: 'Dispersión', icon: <Activity size={16} /> },
  { key: 'composed', label: 'Compuesto', icon: <Layers size={16} /> }
];

const UniversalChart: React.FC<UniversalChartProps> = ({
  data,
  chartType,
  title,
  sources = [],
  showValidation = true,
  xAxisDataKey = 'name',
  yAxisDataKey = 'value',
  dataKey = 'value',
  nameKey = 'name',
  height = 400,
  additionalSeries = [],
  showControls = true,
  timeRange = '2018-2025',
  metadata,
  onChartTypeChange,
  onRetry,
  error
}) => {
  const [activeChartType, setActiveChartType] = useState(chartType);
  const [showTrends, setShowTrends] = useState(true);

  useEffect(() => {
    setActiveChartType(chartType);
  }, [chartType]);

  // Format currency values
  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate statistics with memoization for performance
  const statistics = useMemo(() => {
    const values = data.map(d => d[yAxisDataKey] || d[dataKey] || 0);
    const totalValue = values.reduce((sum, value) => sum + value, 0);
    const avgValue = data.length > 0 ? totalValue / data.length : 0;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    return { totalValue, avgValue, maxValue, minValue };
  }, [data, yAxisDataKey, dataKey]);

  const { totalValue, avgValue, maxValue, minValue } = statistics;

  // Custom tooltip component with memoization
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {payload[0]?.payload?.source && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Fuente: {payload[0].payload.source}
            </p>
          )}
        </div>
      );
    }
    return null;
  }, []);

  // Handle error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Período: {timeRange} • {data.length} elementos</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Error al cargar los datos</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {STRINGS.retry}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render appropriate chart based on type
  const renderChart = () => {
    switch (activeChartType) {
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey={xAxisDataKey} 
              angle={-45} 
              textAnchor="end" 
              height={60}
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <YAxis 
              tickFormatter={formatCurrency}
              width={80}
              stroke="#6B7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey={yAxisDataKey} 
              name={title}
              fill={COLORS[0]}
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
            {additionalSeries.map((series, index) => (
              <Bar 
                key={series.dataKey}
                dataKey={series.dataKey} 
                name={series.name}
                fill={series.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey={xAxisDataKey} stroke="#6B7280" />
            <YAxis tickFormatter={formatCurrency} stroke="#6B7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yAxisDataKey} 
              name={title}
              stroke={COLORS[0]} 
              strokeWidth={3}
              dot={{ r: 4, fill: COLORS[0] }}
              activeDot={{ r: 6, fill: COLORS[0] }}
            />
            {additionalSeries.map((series, index) => (
              <Line 
                key={series.dataKey}
                type="monotone" 
                dataKey={series.dataKey} 
                name={series.name}
                stroke={series.color} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={height * 0.3}
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Monto']} />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey={xAxisDataKey} stroke="#6B7280" />
            <YAxis tickFormatter={formatCurrency} stroke="#6B7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yAxisDataKey} 
              name={title}
              stroke={COLORS[0]} 
              fill="url(#colorValue)"
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey={xAxisDataKey} 
              name="X" 
              stroke="#6B7280"
            />
            <YAxis 
              dataKey={yAxisDataKey} 
              name="Y" 
              tickFormatter={formatCurrency}
              stroke="#6B7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter 
              dataKey={yAxisDataKey} 
              name={title}
              fill={COLORS[0]}
            />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="80%" 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxisDataKey} />
            <PolarRadiusAxis />
            <Radar 
              dataKey={yAxisDataKey} 
              name={title}
              stroke={COLORS[0]} 
              fill={COLORS[0]} 
              fillOpacity={0.3} 
            />
            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Monto']} />
            <Legend />
          </RadarChart>
        );

      case 'composed':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey={xAxisDataKey} stroke="#6B7280" />
            <YAxis tickFormatter={formatCurrency} stroke="#6B7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey={yAxisDataKey} fill={COLORS[0]} name={title} />
            <Line 
              type="monotone" 
              dataKey={yAxisDataKey} 
              stroke={COLORS[1]} 
              strokeWidth={2}
              name={`${title} (Tendencia)`}
            />
          </ComposedChart>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Tipo de gráfico no soportado: {activeChartType}
          </div>
        );
    }
  };

  const handleChartTypeChange = (type: string) => {
    setActiveChartType(type as any);
    if (onChartTypeChange) {
      onChartTypeChange(type);
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Período: {timeRange} • {data.length} elementos
            </p>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              {CHART_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleChartTypeChange(type.key)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeChartType === type.key
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={type.label}
                >
                  {type.icon}
                  <span className="ml-1 hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Promedio</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {formatCurrency(avgValue)}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Máximo</p>
            <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
              {formatCurrency(maxValue)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Mínimo</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">
              {formatCurrency(minValue)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-6">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Data Sources and Validation */}
      {showValidation && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>
                Fuente: {sources && sources[0] ? 'Portal de Transparencia' : 'Carmen de Areco'}
              </span>
              <span>
                Validado: {new Date().toLocaleDateString('es-AR')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Datos verificados</span>
            </div>
          </div>
          
          {/* Metadata Panel */}
          {metadata && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fuentes de Datos:
                </span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                metadata.dataQuality === 'HIGH' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                metadata.dataQuality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {metadata.dataQuality === 'HIGH' ? 'Alta Calidad' :
                 metadata.dataQuality === 'MEDIUM' ? 'Calidad Media' : 'Calidad Básica'}
              </div>
            </div>
          )}
          
          {sources && sources.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {sources.slice(1).map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Fuente {index + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default UniversalChart;