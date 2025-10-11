/**
 * Improved Bar Chart Component with Better Design, UX/UI and Proper Spacing
 * Displays financial data with visual indicators for anomalies and execution rates
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import chartDataService from '../../services/charts/ChartDataService';
import { formatCurrencyARS, getColorForExecutionRate, calculateExecutionRate } from '../../utils/parseCsv';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface BarChartDataPoint {
  name: string;
  budgeted?: number;
  executed?: number;
  execution_rate?: number;
  color?: string;
  [key: string]: unknown;
}

interface ImprovedBarChartComponentProps {
  type?: string; // Chart type for service (e.g., 'Budget_Execution', 'Personnel_Expenses', etc.)
  year?: number;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  dataKey?: string;
  compareMode?: boolean; // Show budgeted vs executed comparison
}

const ImprovedBarChartComponent: React.FC<ImprovedBarChartComponentProps> = ({
  type = 'Budget_Execution',
  year,
  title = "Distribución Presupuestaria",
  showLegend = true,
  showGrid = true,
  dataKey = "budgeted",
  compareMode = false
}) => {
  const [chartData, setChartData] = useState<BarChartDataPoint[]>([]);
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

      // Process data for charting with color coding
      const processedData = filteredData.map((point: Record<string, unknown>) => {
        const name = point.name || point.Name || point.descripcion || point.Descripcion || 'Sin nombre';
        const budgeted = parseFloat(point.budgeted || point.Budgeted || point.presupuestado || point.Presupuestado || 0);
        const executed = parseFloat(point.executed || point.Executed || point.ejecutado || point.Ejecutado || 0);
        const executionRate = point.execution_rate !== undefined 
          ? parseFloat(point.execution_rate as string) || 0
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

      setChartData(processedData);
    }
  }, [rawData, isLoading, isError, queryError, year]);

  // Custom tooltip with better styling
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
        <div className="bg-white dark:bg-dark-surface p-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">{label}</p>
          
          {compareMode ? (
            <>
              <p className="text-sm text-gray-700 dark:text-dark-text-secondary">
                Presupuestado: <span className="font-medium" style={{ color: '#3B82F6' }}>{formatCurrencyARS(dataPoint.budgeted || 0)}</span>
              </p>
              <p className="text-sm text-gray-700 dark:text-dark-text-secondary">
                Ejecutado: <span className="font-medium" style={{ color: '#10B981' }}>{formatCurrencyARS(dataPoint.executed || 0)}</span>
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-text-primary mt-1">
                Tasa de Ejecución: {(executionRate * 100).toFixed(1)}%
              </p>
              
              {executionRate < 0.5 && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-700">
                  ⚠️ Ejecución muy baja
                </div>
              )}
              {executionRate > 1.2 && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-700">
                  ℹ️ Ejecución alta
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-700 dark:text-dark-text-secondary">
              Valor: <span className="font-medium" style={{ color: dataPoint.color }}>{formatCurrencyARS(payload[0].value || 0)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border flex flex-col h-full">
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {title}
            </h3>
          )}
        </div>
        
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-dark-text-secondary">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
          {title}
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error al cargar datos: {error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
          {title}
        </h3>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">No hay datos disponibles para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border h-full flex flex-col">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 self-start">
          {title}
        </h3>
      )}
      
      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {compareMode ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />}
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                className="dark:stroke-gray-300 dark:fill-gray-300"
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                className="dark:stroke-gray-300 dark:fill-gray-300"
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar 
                dataKey="budgeted" 
                name="Presupuestado" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3B82F6" />
                ))}
              </Bar>
              <Bar 
                dataKey="executed" 
                name="Ejecutado" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#10B981" />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />}
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                className="dark:stroke-gray-300 dark:fill-gray-300"
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                className="dark:stroke-gray-300 dark:fill-gray-300"
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
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
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
    </div>
  );
};

export default ImprovedBarChartComponent;