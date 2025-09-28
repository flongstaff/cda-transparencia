/**
 * Bar Chart Component with Color Coding and Conditional Styling
 * Displays financial data with visual indicators for anomalies and execution rates
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import useCsvData from '../../hooks/useCsvData';
import { formatCurrencyARS, getColorForExecutionRate, calculateExecutionRate } from '../../utils/parseCsv';

interface BarChartDataPoint {
  name: string;
  budgeted?: number;
  executed?: number;
  execution_rate?: number;
  color?: string;
  [key: string]: unknown;
}

interface BarChartComponentProps {
  csvUrl: string;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  dataKey?: string;
  compareMode?: boolean; // Show budgeted vs executed comparison
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  csvUrl,
  title = "Distribución Presupuestaria",
  showLegend = true,
  showGrid = true,
  dataKey = "budgeted",
  compareMode = false
}) => {
  // Use the CSV parsing hook
  const { data, loading, error } = useCsvData<BarChartDataPoint>(csvUrl);

  // Process data for charting with color coding
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point) => {
      const name = point.name || 'Sin nombre';
      const budgeted = point.budgeted || 0;
      const executed = point.executed || 0;
      const executionRate = point.execution_rate !== undefined 
        ? point.execution_rate 
        : calculateExecutionRate(budgeted, executed);

      return {
        ...point,
        name,
        budgeted,
        executed,
        execution_rate: executionRate,
        // Color based on execution rate
        color: getColorForExecutionRate(executionRate)
      };
    });
  }, [data]);

  // Custom tooltip with color coding
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      payload: BarChartDataPoint;
      value: number;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const executionRate = dataPoint.execution_rate || 0;
      
      return (
        <div className="bg-white dark:bg-dark-surface p-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-dark-text-primary">{label}</p>
          
          {compareMode ? (
            <>
              <p className="text-sm" style={{ color: getColorForExecutionRate(executionRate) }}>
                Presupuestado: {formatCurrencyARS(dataPoint.budgeted || 0)}
              </p>
              <p className="text-sm" style={{ color: getColorForExecutionRate(executionRate) }}>
                Ejecutado: {formatCurrencyARS(dataPoint.executed || 0)}
              </p>
              <p className="text-sm font-medium">
                Tasa de Ejecución: {(executionRate * 100).toFixed(1)}%
              </p>
              
              {executionRate < 0.5 && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 text-xs">
                  ⚠️ Ejecución muy baja
                </div>
              )}
              {executionRate > 1.2 && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 text-xs">
                  ℹ️ Ejecución alta
                </div>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: dataPoint.color }}>
              Valor: {formatCurrencyARS(payload[0].value || 0)}
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
          {compareMode ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
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
              <Bar 
                dataKey="budgeted" 
                name="Presupuestado" 
                fill="#3b82f6"
              />
              <Bar 
                dataKey="executed" 
                name="Ejecutado" 
                fill="#10b981"
              />
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
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
              <Bar dataKey={dataKey} name={title}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      {/* Color legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span>Ejecución baja (&lt;50%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
          <span>Ejecución moderada (50-75%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>Ejecución buena (75-100%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          <span>Ejecución alta (&gt;120%)</span>
        </div>
      </div>
    </div>
  );
};

export default BarChartComponent;