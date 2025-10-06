/**
 * Time Series Chart Component using Recharts
 * Displays multi-year data with corruption/anomaly highlighting
 * Uses enhanced CSV data loading with caching
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import chartDataService from '../../services/charts/ChartDataService';
import { formatCurrencyARS, formatPercentage, formatNumberARS, formatQuarter } from '../../utils/spanishFormatter';
import useResponsive from '../../hooks/useResponsive';
import ResponsiveChartWrapper from './ResponsiveChartWrapper';

// Centralized function for formatting X-axis labels
const formatXAxisLabel = (value: any): string => {
  // Format quarterly data using the utility function
  if (typeof value === 'string' && value.startsWith('Q') && (value.includes(' ') || value.length <= 3)) {
    return formatQuarter(value);
  }
  // Format monthly data like "Jan 2021" -> "Ene 2021" (Spanish)
  else if (typeof value === 'string' && /^[A-Za-z]{3} \d{4}$/.test(value)) {
    const [month, year] = value.split(' ');
    const monthMap: Record<string, string> = {
      'Jan': 'Ene',
      'Feb': 'Feb',
      'Mar': 'Mar',
      'Apr': 'Abr',
      'May': 'May',
      'Jun': 'Jun',
      'Jul': 'Jul',
      'Aug': 'Ago',
      'Sep': 'Sep',
      'Oct': 'Oct',
      'Nov': 'Nov',
      'Dec': 'Dic'
    };
    return `${monthMap[month] || month} ${year}`;
  }
  return value;
};

interface TimeSeriesChartProps {
  type: string; // Chart type for service (e.g., 'Budget_Execution', 'Personnel_Expenses', etc.)
  year?: number;
  title?: string;
  description?: string;
  height?: number;
  dataKey?: string;
  valueKey?: string;
  showAnomalies?: boolean;
  className?: string;
}

interface TimeSeriesData {
  year: number;
  [key: string]: any;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  type,
  year,
  title = "Time Series Analysis",
  description,
  height = 400,
  dataKey = "year",
  valueKey = "value",
  showAnomalies = true,
  className = ""
}) => {
  const [chartData, setChartData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile, isTablet, isDesktop } = useResponsive();

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

      setChartData(filteredData as TimeSeriesData[]);
    }
  }, [rawData, isLoading, isError, queryError, year]);

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
      
      // Format label for display in tooltip (Spanish)
      let formattedLabel = label;
      if (typeof label === 'string' && label.startsWith('Q') && label.includes(' ')) {
        const [quarter, year] = label.split(' ');
        const quarterNum = parseInt(quarter.replace('Q', ''));
        const quarterNames = ['', '1er', '2do', '3er', '4to'];
        formattedLabel = `${quarterNames[quarterNum]} Trimestre ${year}`;
      } else if (typeof label === 'string' && label.startsWith('Q')) {
        const quarterNum = parseInt(label.replace('Q', ''));
        const quarterNames = ['', '1er', '2do', '3er', '4to'];
        formattedLabel = `${quarterNames[quarterNum]} Trimestre`;
      } else if (typeof label === 'string' && /^[A-Za-z]{3} \d{4}$/.test(label)) {
        const [month, year] = label.split(' ');
        const monthMap: Record<string, string> = {
          'Jan': 'Ene',
          'Feb': 'Feb',
          'Mar': 'Mar',
          'Apr': 'Abr',
          'May': 'May',
          'Jun': 'Jun',
          'Jul': 'Jul',
          'Aug': 'Ago',
          'Sep': 'Sep',
          'Oct': 'Oct',
          'Nov': 'Nov',
          'Dec': 'Dic'
        };
        formattedLabel = `${monthMap[month] || month} ${year}`;
      }

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {`${dataKey}: ${formattedLabel}`}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            {`${valueKey}: ${typeof value === 'number' ? value.toLocaleString('es-AR') : value}`}
          </p>
          {isAnomaly && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Anomalía detectada</span>
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
          <TrendingDown className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No hay datos disponibles</p>
          <p className="text-gray-500 text-sm">
            {year ? `para el año ${year}` : 'para el período seleccionado'}
          </p>
        </div>
      </div>
    );
  }

  const anomalies = showAnomalies ? calculateAnomalies(chartData) : [];
  const hasAnomalies = anomalies.length > 0;

  // Calculate trend
  const firstValue = parseFloat(chartData[0]?.[valueKey]) || 0;
  const lastValue = parseFloat(chartData[chartData.length - 1]?.[valueKey]) || 0;
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
      <div className="w-full">
        <ResponsiveChartWrapper height={height}>
          <LineChart 
            data={data} 
            margin={{ 
              top: 5, 
              right: 30, 
              left: 20, 
              bottom: isMobile ? 40 : 5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={dataKey}
              stroke="#6b7280"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              height={isMobile ? 50 : 30}
              tickFormatter={formatXAxisLabel}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              tickFormatter={(value) => {
                if (typeof value === 'number' && value > 1000000) {
                  return `$${(value / 1000000).toFixed(1)}M`;
                } else if (typeof value === 'number' && value > 1000) {
                  return `$${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: isMobile ? 15 : 5,
                fontSize: isMobile ? '10px' : '12px'
              }}
            />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke="#3b82f6"
              strokeWidth={isMobile ? 1.5 : 2}
              dot={isMobile ? { r: 3 } : <CustomDot />}
              activeDot={{ 
                r: isMobile ? 4 : 6, 
                stroke: '#3b82f6', 
                strokeWidth: 2 
              }}
            />

            {/* Reference line for average if showing anomalies */}
            {showAnomalies && data.length > 0 && (
              <ReferenceLine
                y={data.reduce((sum, d) => sum + (parseFloat(d[valueKey]) || 0), 0) / data.length}
                stroke="#9ca3af"
                strokeDasharray={isMobile ? "3 3" : "5 5"}
                label={isMobile ? { value: 'Promedio', position: 'top' } : "Average"}
              />
            )}
          </LineChart>
        </ResponsiveChartWrapper>
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