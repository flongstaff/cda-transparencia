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

// Chart types supported
export type SupportedChartType = 
  'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'composed';

// Props for the base chart component
interface BaseChartProps {
  data: Record<string, unknown>[];
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
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => data || [], [data]);
  
  // Memoize chart configuration
  const chartConfig = useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    height,
    width
  }), [height, width]);
  
  // Render appropriate chart based on type
  const renderChart = () => {
    const commonProps = {
      width: chartConfig.width,
      height: chartConfig.height,
      margin: chartConfig.margin,
      onClick: onDataPointClick,
      className
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
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            {showTooltip && <Tooltip />}
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
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={key}
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
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
                name={key}
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
            {showTooltip && <Tooltip />}
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
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Scatter
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={key}
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
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            {showTooltip && <Tooltip />}
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
  
  // Wrap in responsive container if needed
  const chartElement = responsive ? (
    <ResponsiveContainer width="100%" height={chartConfig.height}>
      {renderChart()}
    </ResponsiveContainer>
  ) : renderChart();
  
  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className="chart-title">{title}</h3>}
      {description && <p className="chart-description">{description}</p>}
      <div className="chart-wrapper">
        {chartElement}
      </div>
    </div>
  );
});

BaseChart.displayName = 'BaseChart';

export default BaseChart;