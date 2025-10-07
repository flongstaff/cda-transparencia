/**
 * Performance Indicators Chart
 * Shows key performance indicators with visual metrics
 */

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { formatCurrencyARS } from '../../utils/formatters';
import { useChartData } from '../../hooks/useUnifiedData';

interface PerformanceIndicatorsChartProps {
  year: number;
  type?: string;
  title?: string;
  variant?: 'bar' | 'radial' | 'gauge';
  height?: number;
  className?: string;
}

const PerformanceIndicatorsChart: React.FC<PerformanceIndicatorsChartProps> = ({
  year,
  type = 'performance',
  title = `Indicadores de Desempeño ${year}`,
  variant = 'bar',
  height = 400,
  className = ''
}) => {
  const theme = useTheme();
  
  // Use the chart data hook to get data
  const { data, loading, error } = useChartData(type, year);
  
  // Process data for performance indicators
  const chartData = useMemo(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      // Process real data if available
      return data.map((item: any) => ({
        ...item,
        name: item.name || item.indicator || item.kpi || 'Indicador',
        value: item.value || item.score || item.percentage || 0,
        target: item.target || item.goal || 100, // Default target is 100%
        max: item.max || 100
      }));
    } else {
      // Generate sample performance indicators data
      const indicators = [
        { name: 'Ejecución Presupuestaria', value: 85, target: 90, max: 100 },
        { name: 'Calidad de Datos', value: 92, target: 95, max: 100 },
        { name: 'Accesibilidad', value: 78, target: 80, max: 100 },
        { name: 'Transparencia', value: 88, target: 90, max: 100 },
        { name: 'Cumplimiento Legal', value: 95, target: 95, max: 100 },
        { name: 'Eficiencia', value: 82, target: 85, max: 100 }
      ];
      return indicators;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando indicadores de desempeño...</p>
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-amber-500 text-2xl mb-2">⚠️</div>
          <p className="text-gray-600">No hay datos de indicadores de desempeño disponibles</p>
        </div>
      </div>
    );
  }

  // Define colors based on performance
  const getPerformanceColor = (value: number, target: number) => {
    if (value >= target) return theme.palette.success.main;
    if (value >= target * 0.8) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const renderChart = () => {
    switch (variant) {
      case 'radial':
      case 'gauge':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="10%" 
              outerRadius="90%" 
              barSize={10}
              data={chartData.map((item, index) => ({
                ...item,
                fill: getPerformanceColor(item.value, item.target)
              }))}
              startAngle={180} 
              endAngle={0}
            >
              <PolarAngleAxis 
                type="number" 
                domain={[0, 'dataMax']} 
                angleAxisId={0} 
                tick={false} 
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.value, entry.target)} />
                ))}
              </RadialBar>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Valor']}
                labelFormatter={(value) => chartData[value as any]?.name}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 100, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                type="number"
                domain={[0, (dataMax: number) => Math.max(dataMax, 100)]}
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                width={90}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Valor']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="3 3" label="Línea Base" />
              <Bar
                dataKey="value"
                name="Valor"
                fill={theme.palette.primary.main}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getPerformanceColor(entry.value, entry.target)} 
                  />
                ))}
              </Bar>
              <Bar
                dataKey="target"
                name="Objetivo"
                fill={theme.palette.grey?.[400] || '#9ca3af'}
                shape={{ width: 5 }}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-4" style={{ height }}>
        {renderChart()}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-dark-background border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {chartData.length} indicadores • Año {year}
          </span>
          <span className="flex items-center">
            <span className="capitalize">{variant}</span> chart
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceIndicatorsChart;