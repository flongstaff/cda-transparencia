/**
 * Time Series Chart Component using Recharts
 * Displays multi-year data with corruption/anomaly highlighting
 * Uses enhanced CSV data loading with caching
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import useCsvData from '../../hooks/useCsvData';

interface TimeSeriesChartProps {
  csvUrl: string;
  selectedYear?: number;
  title?: string;
  description?: string;
  height?: number;
  dataKey: string;
  valueKey: string;
  showAnomalies?: boolean;
  className?: string;
}

interface TimeSeriesData {
  year: number;
  [key: string]: any;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  csvUrl,
  selectedYear,
  title = "Time Series Analysis",
  description,
  height = 400,
  dataKey = "year",
  valueKey = "value",
  showAnomalies = true,
  className = ""
}) => {
  const { data, loading, error } = useCsvData<TimeSeriesData>(csvUrl, {}, selectedYear);

  // Calculate anomalies (values that are 50% higher/lower than average)
  const calculateAnomalies = (data: TimeSeriesData[]) => {
    if (!data || data.length < 3) return [];

    const values = data.map(d => parseFloat(d[valueKey]) || 0).filter(v => v > 0);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const threshold = average * 0.5; // 50% threshold

    return data.filter(d => {
      const value = parseFloat(d[valueKey]) || 0;
      return value > average + threshold || value < average - threshold;
    });
  };

  // Custom tooltip with anomaly detection
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isAnomaly = anomalies.some(a => a[dataKey] === label);

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {`${dataKey}: ${label}`}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            {`${valueKey}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
          </p>
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

  // Custom dot for anomalies
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
          <p className="text-gray-600 dark:text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-2 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-red-600 dark:text-red-400 font-medium">Error loading chart data</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-2 text-center">
          <TrendingDown className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No data available</p>
          <p className="text-gray-500 text-sm">
            {selectedYear ? `for year ${selectedYear}` : 'for the selected period'}
          </p>
        </div>
      </div>
    );
  }

  const anomalies = showAnomalies ? calculateAnomalies(data) : [];
  const hasAnomalies = anomalies.length > 0;

  // Calculate trend
  const firstValue = parseFloat(data[0]?.[valueKey]) || 0;
  const lastValue = parseFloat(data[data.length - 1]?.[valueKey]) || 0;
  const trend = lastValue > firstValue ? 'up' : 'down';
  const trendPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue * 100) : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <div className="flex items-center space-x-2">
            {trend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(1)}%
            </span>
          </div>
        </div>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        )}
        {hasAnomalies && (
          <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>{anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={dataKey}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => {
                if (typeof value === 'number' && value > 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (typeof value === 'number' && value > 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />

            {/* Reference line for average if showing anomalies */}
            {showAnomalies && data.length > 0 && (
              <ReferenceLine
                y={data.reduce((sum, d) => sum + (parseFloat(d[valueKey]) || 0), 0) / data.length}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label="Average"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly details */}
      {hasAnomalies && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Detected Anomalies:</h4>
          <div className="space-y-1">
            {anomalies.slice(0, 3).map((anomaly, index) => (
              <div key={index} className="text-xs text-red-700 dark:text-red-300">
                {anomaly[dataKey]}: {typeof anomaly[valueKey] === 'number'
                  ? anomaly[valueKey].toLocaleString()
                  : anomaly[valueKey]
                }
              </div>
            ))}
            {anomalies.length > 3 && (
              <div className="text-xs text-red-600 dark:text-red-400">
                +{anomalies.length - 3} more anomalies
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSeriesChart;