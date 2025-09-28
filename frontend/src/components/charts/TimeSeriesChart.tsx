/**
 * Time Series Chart Component
 * Displays financial data over time with anomaly detection and color coding
 */

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useCsvData from '../../hooks/useCsvData';
import { formatCurrencyARS, getColorForExecutionRate } from '../../utils/parseCsv';

interface TimeSeriesDataPoint {
  year: string;
  budgeted?: number;
  executed?: number;
  execution_rate?: number;
  [key: string]: any;
}

interface TimeSeriesChartProps {
  csvUrl: string;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  csvUrl,
  title = "Evolución Presupuestaria",
  height = 400,
  showLegend = true,
  showGrid = true
}) => {
  // Use the CSV parsing hook
  const { data, loading, error } = useCsvData<TimeSeriesDataPoint>(csvUrl);

  // Process data for charting
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point, index) => {
      const year = point.year || `Año ${index + 1}`;
      const budgeted = point.budgeted || 0;
      const executed = point.executed || 0;
      const executionRate = point.execution_rate !== undefined 
        ? point.execution_rate 
        : (budgeted > 0 ? executed / budgeted : 0);

      return {
        year,
        budgeted,
        executed,
        execution_rate: executionRate,
        // Color coding based on execution rate
        budgetedColor: getColorForExecutionRate(executionRate),
        executedColor: getColorForExecutionRate(executionRate)
      };
    });
  }, [data]);

  // Custom tooltip with color coding
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const executionRate = dataPoint.execution_rate || 0;
      
      return (
        <div className="bg-white dark:bg-dark-surface p-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-dark-text-primary">{`Año: ${label}`}</p>
          <p className="text-sm" style={{ color: dataPoint.budgetedColor }}>
            Presupuestado: {formatCurrencyARS(dataPoint.budgeted || 0)}
          </p>
          <p className="text-sm" style={{ color: dataPoint.executedColor }}>
            Ejecutado: {formatCurrencyARS(dataPoint.executed || 0)}
          </p>
          <p className="text-sm">
            Tasa de Ejecución: {(executionRate * 100).toFixed(1)}%
          </p>
          {executionRate < 0.5 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ⚠️ Ejecución baja
            </p>
          )}
          {executionRate > 1.2 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ℹ️ Ejecución alta
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error al cargar datos: {error.message}</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
          {title}
        </h3>
      )}
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="budgeted"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              name="Presupuestado"
            />
            <Line
              type="monotone"
              dataKey="executed"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              name="Ejecutado"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Anomaly indicators */}
      <div className="mt-4 flex flex-wrap gap-2">
        {chartData.some(point => point.execution_rate < 0.5) && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
            ⚠️ Ejecución baja detectada
          </span>
        )}
        {chartData.some(point => point.execution_rate > 1.2) && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            ℹ️ Ejecución alta detectada
          </span>
        )}
      </div>
    </div>
  );
};

export default TimeSeriesChart;