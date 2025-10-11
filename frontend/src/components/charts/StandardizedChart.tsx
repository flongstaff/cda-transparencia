import React, { useMemo } from 'react';
import { 
  BarChart,
  Bar,
  LineChart,
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
import { motion } from 'framer-motion';
import { 
  formatCurrencyARS, 
  formatPercentageARS, 
  formatDateARS 
} from '../../utils/formatters';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

// Define consistent color palette for all charts
const CHART_COLORS = {
  primary: '#2563eb',    // Blue for primary series
  secondary: '#10B981',   // Green for secondary series
  tertiary: '#f97316',   // Orange for tertiary series
  quaternary: '#8B5CF6',  // Purple for quaternary series
  quintenary: '#EC4899',  // Pink for quintenary series
  sextant: '#6B7280',    // Gray for sextant series
  septenary: '#14B8A6',   // Teal for septenary series
  octonary: '#F59E0B',    // Amber for octonary series
  danger: '#dc3545',     // Red for alerts/warnings
  success: '#28a745',    // Green for success/positive data
  warning: '#ffc107'     // Yellow for warnings
};

// Define chart types
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'combo';

// Props for the standardized chart component
interface StandardizedChartProps {
  data: any[];
  chartType: ChartType;
  xAxisKey: string;
  yAxisKeys: string[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  onDataPointClick?: (data: any) => void;
  valueFormatter?: (value: number) => string;
  animationDuration?: number;
  animationDelay?: number;
}

/**
 * Standardized Chart Component
 * Provides consistent styling and behavior for all chart types
 */
const StandardizedChart: React.FC<StandardizedChartProps> = ({
  data = [],
  chartType,
  xAxisKey,
  yAxisKeys,
  title,
  description,
  height = 400,
  className = '',
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  colors = Object.values(CHART_COLORS),
  onDataPointClick,
  valueFormatter = formatCurrencyARS,
  animationDuration = 800,
  animationDelay = 100
}) => {
  // Validate and process data
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // Ensure all yAxisKeys exist in data
    return data.map(item => {
      const processedItem = { ...item };
      
      // Process each yAxisKey value
      yAxisKeys.forEach(key => {
        if (processedItem[key] !== undefined && processedItem[key] !== null) {
          // Convert string numbers to actual numbers if needed
          if (typeof processedItem[key] === 'string' && !isNaN(Number(processedItem[key]))) {
            processedItem[key] = Number(processedItem[key]);
          }
        }
      });
      
      return processedItem;
    });
  }, [data, yAxisKeys]);

  // Format tooltip values
  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [valueFormatter(value), name];
    }
    return [value, name];
  };

  // Custom tooltip component with consistent styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-3"
        >
          <p className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
            {label || 'Datos'}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  {formatTooltipValue(entry.value, entry.name)[0]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom legend component with consistent styling
  const CustomLegend = ({ payload }: any) => {
    if (!payload || !showLegend) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render appropriate chart based on type with consistent styling
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-700" 
              />
            )}
            <XAxis 
              dataKey={xAxisKey}
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              height={60}
              angle={-45}
              textAnchor="end"
              interval={0}
              label={xAxisLabel ? { 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -10,
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              tickFormatter={(value) => valueFormatter(value).replace(/ARS/g, '').replace(/$/g, '').trim()}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            {yAxisKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={animationDuration}
                animationBegin={index * animationDelay}
                onClick={onDataPointClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {chartData.map((entry, entryIndex) => (
                  <Cell 
                    key={`cell-${entryIndex}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-700" 
              />
            )}
            <XAxis 
              dataKey={xAxisKey}
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              height={60}
              angle={-45}
              textAnchor="end"
              interval={0}
              label={xAxisLabel ? { 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -10,
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              tickFormatter={(value) => valueFormatter(value).replace(/ARS/g, '').replace(/$/g, '').trim()}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            {yAxisKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={animationDuration}
                animationBegin={index * animationDelay}
                onClick={onDataPointClick}
                className="cursor-pointer"
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-700" 
              />
            )}
            <XAxis 
              dataKey={xAxisKey}
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              height={60}
              angle={-45}
              textAnchor="end"
              interval={0}
              label={xAxisLabel ? { 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -10,
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              tickFormatter={(value) => valueFormatter(value).replace(/ARS/g, '').replace(/$/g, '').trim()}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            {yAxisKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.2}
                strokeWidth={2}
                animationDuration={animationDuration}
                animationBegin={index * animationDelay}
                onClick={onDataPointClick}
                className="cursor-pointer"
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        // For pie charts, we need to handle data differently
        {
          const pieData = chartData.length > 0 ? 
            chartData.map(item => ({
              name: item[xAxisKey],
              value: item[yAxisKeys[0]] || 0
            })).filter(item => item.value > 0) : [];

          return (
            <PieChart {...commonProps}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderColor: '#e5e7eb',
                  color: '#000',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          );
        }

      case 'combo':
        // Combo chart combines line and bar
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-700" 
              />
            )}
            <XAxis 
              dataKey={xAxisKey}
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              height={60}
              angle={-45}
              textAnchor="end"
              interval={0}
              label={xAxisLabel ? { 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -10,
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            <YAxis 
              yAxisId="left"
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              tickFormatter={(value) => valueFormatter(value).replace(/ARS/g, '').replace(/$/g, '').trim()}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                className: 'dark:fill-gray-300'
              } : undefined}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              domain={['auto', 'auto']}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            
            {/* Bars for first series */}
            {yAxisKeys.slice(0, 1).map((key, index) => (
              <Bar
                key={`bar-${key}`}
                yAxisId="left"
                dataKey={key}
                name={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={animationDuration}
                animationBegin={index * animationDelay}
                onClick={onDataPointClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
            
            {/* Lines for additional series */}
            {yAxisKeys.slice(1).map((key, index) => (
              <Line
                key={`line-${key}`}
                yAxisId="right"
                type="monotone"
                dataKey={key}
                name={key}
                stroke={colors[(index + 1) % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={animationDuration}
                animationBegin={(index + 1) * animationDelay}
                onClick={onDataPointClick}
                className="cursor-pointer"
              />
            ))}
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6 transition-all duration-300 hover:shadow-xl ${className}`}
    >
      {/* Chart header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600 dark:text-dark-text-secondary text-sm">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Chart container */}
      <div className="h-80 w-full max-w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart footer note if needed */}
      {chartData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-dark-text-tertiary">
            No hay datos disponibles para mostrar
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default StandardizedChart;