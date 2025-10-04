/**
 * STANDARD CHART TEMPLATE
 *
 * Use this template for creating new charts or updating existing ones.
 * Ensures consistency across all chart components.
 *
 * Features:
 * - Props-based data (parent provides data via hooks)
 * - Responsive design (ResponsiveContainer)
 * - Loading states
 * - Error handling
 * - Tooltips and legends
 * - Proper TypeScript types
 * - Accessible colors
 */

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps
} from 'recharts';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatCurrencyARS } from '../../utils/formatters';

// ============================================================================
// TYPES
// ============================================================================

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartTemplateProps {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  className?: string;
  colorScheme?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6'  // Teal
];

const DEFAULT_HEIGHT = 400;

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {entry.name}:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatCurrencyARS(entry.value || 0)}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ChartTemplate: React.FC<ChartTemplateProps> = ({
  data,
  title,
  description,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  className = '',
  colorScheme = DEFAULT_COLORS,
  showLegend = true,
  showTooltip = true,
  formatValue = formatCurrencyARS
}) => {
  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando datos del gráfico...
          </p>
        </div>
      </motion.div>
    );
  }

  // ========================================================================
  // ERROR STATE
  // ========================================================================
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Error al cargar datos
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
      </motion.div>
    );
  }

  // ========================================================================
  // EMPTY STATE
  // ========================================================================
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <BarChart3 className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No hay datos disponibles
          </p>
        </div>
      </motion.div>
    );
  }

  // ========================================================================
  // CHART RENDER
  // ========================================================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}
    >
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="opacity-30"
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value.toString();
            }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          )}
          <Bar
            dataKey="value"
            fill={colorScheme[0]}
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Footer (optional data source info) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {data.length} registro{data.length !== 1 ? 's' : ''} •
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </p>
      </div>
    </motion.div>
  );
};

export default ChartTemplate;

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import ChartTemplate from './ChartTemplate';
import { useBudgetData } from '../../hooks/useUnifiedData';

const MyPage = () => {
  const { data, loading, error } = useBudgetData(2024);

  // Transform data to chart format
  const chartData = data?.categories?.map(cat => ({
    name: cat.name,
    value: cat.amount
  })) || [];

  return (
    <ChartTemplate
      data={chartData}
      title="Presupuesto por Categoría"
      description="Distribución del presupuesto municipal 2024"
      loading={loading}
      error={error}
      height={400}
      showLegend={true}
      showTooltip={true}
    />
  );
};
*/
