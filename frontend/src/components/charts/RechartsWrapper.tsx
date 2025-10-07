/**
 * Comprehensive Recharts Wrapper Component
 * Supports multiple chart types with anomaly detection and multi-year data
 * Uses enhanced CSV data loading with responsive year selector integration
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import chartDataService from '../../services/charts/ChartDataService';

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter';

interface RechartsWrapperProps {
  type: string; // Chart type for service (e.g., 'Budget_Execution', 'Personnel_Expenses', etc.)
  year?: number;
  title?: string;
  description?: string;
  height?: number;
  chartType?: ChartType;
  dataKey: string;
  valueKey: string | string[];
  categoryKey?: string;
  showAnomalies?: boolean;
  showTrend?: boolean;
  showReference?: boolean;
  colors?: string[];
  className?: string;
}

interface ChartData {
  [key: string]: any;
}

const RechartsWrapper: React.FC<RechartsWrapperProps> = ({
  type,
  year,
  title = "Data Visualization",
  description,
  height = 400,
  chartType = 'line',
  dataKey,
  valueKey,
  categoryKey,
  showAnomalies = true,
  showTrend = true,
  showReference = false,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  className = ""
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load chart data using React Query
  const { data: rawData, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', type, year],
    queryFn: () => chartDataService.loadChartData(type),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Update component state when data changes
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      setError(null);
    } else if (isError) {
      setLoading(false);
      setError(queryError?.message || 'Error loading chart data');
    } else if (rawData) {
      setLoading(false);
      setError(null);

      // Filter data by year if specified
      let filteredData = rawData;
      if (year && Array.isArray(rawData)) {
        filteredData = rawData.filter((item: Record<string, unknown>) => {
          const itemYear = item.year || item.Year || item.YEAR || item.año || item.Año;
          return itemYear && parseInt(String(itemYear)) === year;
        });
      }

      setChartData(filteredData);
    }
  }, [rawData, isLoading, isError, queryError, year]);

  // Calculate anomalies for line and bar charts
  const calculateAnomalies = (data: ChartData[], valueKey: string) => {
    if (!data || data.length < 3) return [];

    const values = data.map(d => parseFloat(d[valueKey]) || 0).filter(v => v > 0);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const threshold = average * 0.5; // 50% threshold

    return data.filter(d => {
      const value = parseFloat(d[valueKey]) || 0;
      return value > average + threshold || value < average - threshold;
    });
  };

  // Calculate trend for supported chart types
  const calculateTrend = (data: ChartData[], valueKey: string) => {
    if (!data || data.length < 2) return { direction: 'stable', percent: 0 };

    const firstValue = parseFloat(data[0]?.[valueKey]) || 0;
    const lastValue = parseFloat(data[data.length - 1]?.[valueKey]) || 0;

    if (firstValue === 0) return { direction: 'stable', percent: 0 };

    const percent = ((lastValue - firstValue) / firstValue) * 100;
    const direction = percent > 5 ? 'up' : percent < -5 ? 'down' : 'stable';

    return { direction, percent };
  };

  // Custom tooltip with anomaly detection
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const primaryValue = payload[0].value;
      const isAnomaly = anomalies.some(a => a[dataKey] === label);

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {`${dataKey}: ${label}`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-blue-600 dark:text-blue-400">
              {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
          {isAnomaly && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Anomaly detected</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot for anomalies in line charts
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isAnomaly = anomalies.some(a => a[dataKey] === payload[dataKey]);

    if (isAnomaly) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos del gráfico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-2 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-red-600 dark:text-red-400 font-medium">Error cargando datos del gráfico</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-2 text-center">
          <Info className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No hay datos disponibles</p>
          <p className="text-gray-500 text-sm">
            {year ? `para el año ${year}` : 'para el período seleccionado'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate anomalies and trends
  const primaryValueKey = Array.isArray(valueKey) ? valueKey[0] : valueKey;
  const anomalies = showAnomalies ? calculateAnomalies(chartData, primaryValueKey) : [];
  const trend = showTrend ? calculateTrend(chartData, primaryValueKey) : null;
  const hasAnomalies = anomalies.length > 0;

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={dataKey} stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Array.isArray(valueKey) ? (
              valueKey.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={index === 0 ? <CustomDot /> : false}
                  activeDot={{ r: 6 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={valueKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
              />
            )}
            {showReference && data.length > 0 && (
              <ReferenceLine
                y={data.reduce((sum, d) => sum + (parseFloat(d[primaryValueKey]) || 0), 0) / data.length}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label="Average"
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={dataKey} stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Array.isArray(valueKey) ? (
              valueKey.map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
              ))
            ) : (
              <Bar dataKey={valueKey} fill={colors[0]} />
            )}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={dataKey} stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Array.isArray(valueKey) ? (
              valueKey.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={valueKey}
                stroke={colors[0]}
                fill={colors[0]}
              />
            )}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={primaryValueKey}
              nameKey={categoryKey || dataKey}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.3, 120)}
              fill={colors[0]}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={dataKey} stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis dataKey={primaryValueKey} stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter dataKey={primaryValueKey} fill={colors[0]} />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          {trend && (
            <div className="flex items-center space-x-2">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <div className="w-5 h-5" />
              )}
              <span className={`text-sm font-medium ${
                trend.direction === 'up' ? 'text-green-600' :
                trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend.percent >= 0 ? '+' : ''}{trend.percent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        )}
        {hasAnomalies && (
          <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>Se detectaron {anomalies.length} anomalia{anomalies.length === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Anomaly details */}
      {hasAnomalies && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Anomalías Detectadas:</h4>
          <div className="space-y-1">
            {anomalies.slice(0, 3).map((anomaly, index) => (
              <div key={index} className="text-xs text-red-700 dark:text-red-300">
                {anomaly[dataKey]}: {typeof anomaly[primaryValueKey] === 'number'
                  ? anomaly[primaryValueKey].toLocaleString()
                  : anomaly[primaryValueKey]
                }
              </div>
            ))}
            {anomalies.length > 3 && (
              <div className="text-xs text-red-600 dark:text-red-400">
                +{anomalies.length - 3} más
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RechartsWrapper;