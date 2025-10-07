/**
 * Base Chart Component - Displays chart data using Recharts
 * Supports various chart types and handles responsive design
 */

import React, { useMemo, memo } from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ScatterChart,
  ComposedChart,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter
} from 'recharts';
import { formatCurrencyARS, formatPercentage, formatNumberARS, formatQuarter } from '../../utils/spanishFormatter';

// Centralized function for formatting X-axis labels
const formatXAxisLabel = (value: any, dataPoint?: any): string => {
  // Format quarterly data using the utility function
  if (typeof value === 'string' && value.startsWith('Q') && (value.includes(' ') || value.length <= 3)) {
    // Handle combined format like "Q1 2021"
    if (value.includes(' ')) {
      return formatQuarter(value);
    }
    // Handle separate quarter and year values
    else if (dataPoint && dataPoint.year) {
      return formatQuarter(`${value} ${dataPoint.year}`);
    }
    // Handle standalone quarter format
    else {
      return formatQuarter(value);
    }
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

// Chart types supported
export type SupportedChartType = 
  'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'composed';

// Props for the base chart component
interface BaseChartProps {
  data: Record<string, unknown>[] | null | undefined;
  chartType: SupportedChartType;
  xAxisKey: string;
  yAxisKeys: string[];
  title?: string;
  description?: string;
  height?: number;
  width?: number;
  colors?: string[];
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  onDataPointClick?: (data: Record<string, unknown>) => void;
}

// Default colors for charts
const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#0000ff', '#ff00ff', '#00ffff', '#ffff00', '#800080'
];

const BaseChart: React.FC<BaseChartProps> = memo(({
  data,
  chartType,
  xAxisKey,
  yAxisKeys,
  title,
  description,
  height = 400,
  width = '100%',
  colors = DEFAULT_COLORS,
  className = '',
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  responsive = true,
  xAxisLabel,
  yAxisLabel,
  onDataPointClick
}) => {
  // Memoize chart data to prevent unnecessary re-renders and filter out null values
  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Filter out null/undefined entries and entries without required properties
    return data.filter(item => item != null && typeof item === 'object');
  }, [data]);
  
  // Memoize chart configuration
  const chartConfig = useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    height,
    width
  }), [height, width]);
  
  // Render appropriate chart based on type
  const renderChart = () => {
    // If no data, show a message instead of trying to render the chart
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p>No hay datos disponibles para mostrar</p>
          </div>
        </div>
      );
    }
    
    const commonProps = {
      width: chartConfig.width,
      height: chartConfig.height,
      margin: chartConfig.margin,
      onClick: onDataPointClick,
      className
    };
    
    // Custom tooltip to better format values in Spanish
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white dark:bg-dark-surface p-2 border border-gray-200 dark:border-dark-border rounded shadow-sm">
            <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {
                  // Format based on the type of data
                  isNaN(entry.value) || entry.value === null ? entry.value :
                  // Check if this looks like currency (large numbers)
                  entry.value > 1000 ? formatCurrencyARS(entry.value) :
                  // Check if this looks like a percentage (1-100 range)
                  entry.value > 0 && entry.value <= 100 && entry.name.toLowerCase().includes('rate') ? formatPercentage(entry.value) :
                  // Otherwise format as number
                  formatNumberARS(entry.value)
                }
              </p>
            ))}
          </div>
        );
      }
      return null;
    };
    

    // Render chart based on type
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxisKey} 
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              tick={{ fill: '#333' }}
              className="dark:tick-fill-gray-300"
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              tick={{ fill: '#333' }}
              tickFormatter={(value) => {
                // Format large numbers as currency or percentage based on value and context
                if (value > 1000) return `${(value / 1000000).toFixed(0)}M`;
                else if (value > 0 && value <= 100 && yAxisLabel?.toLowerCase().includes('percentage')) return `${value}%`;
                else return value;
              }}
              className="dark:tick-fill-gray-300"
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                activeDot={{ onClick: onDataPointClick }}
                name={key}
              />
            ))}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={chartData} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxisKey} 
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              tick={{ fill: '#333' }}
              className="dark:tick-fill-gray-300"
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              tick={{ fill: '#333' }}
              tickFormatter={(value) => {
                // Format large numbers as currency or percentage based on value and context
                if (value > 1000) return `${(value / 1000000).toFixed(0)}M`;
                else if (value > 0 && value <= 100 && yAxisLabel?.toLowerCase().includes('percentage')) return `${value}%`;
                else return value;
              }}
              className="dark:tick-fill-gray-300"
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={key}
                onClick={onDataPointClick}
              />
            ))}
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={chartData} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxisKey} 
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              tick={{ fill: '#333' }}
              className="dark:tick-fill-gray-300"
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              tick={{ fill: '#333' }}
              tickFormatter={(value) => {
                // Format large numbers as currency or percentage based on value and context
                if (value > 1000) return `${(value / 1000000).toFixed(0)}M`;
                else if (value > 0 && value <= 100 && yAxisLabel?.toLowerCase().includes('percentage')) return `${value}%`;
                else return value;
              }}
              className="dark:tick-fill-gray-300"
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
                name={key}
                onClick={onDataPointClick}
              />
            ))}
          </AreaChart>
        );
      
      case 'pie': {
        return (
          <PieChart width={chartConfig.width} height={chartConfig.height}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKeys[0] || 'value'}
              nameKey={xAxisKey}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
          </PieChart>
        );
      }
      
      case 'scatter':
        return (
          <ScatterChart data={chartData} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxisKey} 
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              tick={{ fill: '#333' }}
              className="dark:tick-fill-gray-300"
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              tick={{ fill: '#333' }}
              tickFormatter={(value) => {
                // Format large numbers as currency or percentage based on value and context
                if (value > 1000) return `${(value / 1000000).toFixed(0)}M`;
                else if (value > 0 && value <= 100 && yAxisLabel?.toLowerCase().includes('percentage')) return `${value}%`;
                else return value;
              }}
              className="dark:tick-fill-gray-300"
            />
            {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Scatter
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={key}
                onClick={onDataPointClick}
              />
            ))}
          </ScatterChart>
        );
      
      case 'composed': {
        return (
          <ComposedChart data={chartData} {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxisKey} 
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              tick={{ fill: '#333' }}
              className="dark:tick-fill-gray-300"
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              tick={{ fill: '#333' }}
              tickFormatter={(value) => {
                // Format large numbers as currency or percentage based on value and context
                if (value > 1000) return `${(value / 1000000).toFixed(0)}M`;
                else if (value > 0 && value <= 100 && yAxisLabel?.toLowerCase().includes('percentage')) return `${value}%`;
                else return value;
              }}
              className="dark:tick-fill-gray-300"
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => {
              // Alternate between line and bar for composed chart
              const ChartComponent = index % 2 === 0 ? Line : Bar;
              return (
                <ChartComponent
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  name={key}
                  onClick={onDataPointClick}
                />
              );
            })}
          </ComposedChart>
        );
      }
      
      default:
        return null;
    }
  };
  
  // Render chart element
  const chartContent = renderChart();
  
  // Validate chart content and data before wrapping in responsive container
  const isValidChartContent = chartContent && React.isValidElement(chartContent);
  const hasValidData = chartData && Array.isArray(chartData) && chartData.length > 0;
  
  // Wrap in responsive container if needed, but only if we have valid content and data
  const chartElement = isValidChartContent && hasValidData ? (
    responsive ? (
      <ResponsiveContainer width="100%" height={chartConfig.height}>
        {chartContent}
      </ResponsiveContainer>
    ) : chartContent
  ) : (
    <div className="flex items-center justify-center h-full w-full p-8">
      <p className="text-gray-500 dark:text-gray-400 text-center">
        No hay datos disponibles para mostrar
      </p>
    </div>
  );
  
  return (
    <div className={`chart-container ${className} w-full max-w-full`}>
      {title && <h3 className="chart-title">{title}</h3>}
      {description && <p className="chart-description">{description}</p>}
      <div className="chart-wrapper w-full max-w-full overflow-x-auto">
        {chartElement}
      </div>
    </div>
  );
});

BaseChart.displayName = 'BaseChart';

export default BaseChart;