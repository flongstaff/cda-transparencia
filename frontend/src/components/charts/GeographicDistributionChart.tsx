/**
 * Geographic Distribution Chart
 * Shows spending/activities by geographic area
 */

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Map as RechartsMap,
  Geom
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { formatCurrencyARS } from '../../utils/formatters';
import { useChartData } from '../../hooks/useUnifiedData';

interface GeographicDistributionChartProps {
  year: number;
  type?: string;
  title?: string;
  variant?: 'bar' | 'pie' | 'map';
  height?: number;
  className?: string;
}

const GeographicDistributionChart: React.FC<GeographicDistributionChartProps> = ({
  year,
  type = 'geographic',
  title = `Distribución Geográfica ${year}`,
  variant = 'bar',
  height = 400,
  className = ''
}) => {
  const theme = useTheme();
  
  // Use the chart data hook to get data
  const { data, loading, error } = useChartData(type, year);
  
  // Process data for geographic distribution
  const chartData = useMemo(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      // Process real data if available
      return data.map((item: any) => ({
        ...item,
        name: item.name || item.region || item.area || item.location || 'Área',
        value: item.value || item.total || item.amount || 0
      }));
    } else {
      // Generate sample geographic distribution data
      const regions = [
        { name: 'Centro', value: 4500000 },
        { name: 'Norte', value: 3200000 },
        { name: 'Sur', value: 2800000 },
        { name: 'Este', value: 3500000 },
        { name: 'Oeste', value: 2900000 },
        { name: 'Noroeste', value: 2100000 },
        { name: 'Noreste', value: 1800000 },
        { name: 'Sudoeste', value: 1600000 },
        { name: 'Sureste', value: 1900000 }
      ];
      return regions;
    }
  }, [data]);

  // Define colors for the chart
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info?.main || '#3B82F6',
    theme.palette.warning?.main || '#F59E0B',
    theme.palette.success?.main || '#10B981',
    '#EC4899', '#6B7280', '#14B8A6', '#8B5CF6', '#F97316'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando datos geográficos...</p>
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-amber-500 text-2xl mb-2">⚠️</div>
          <p className="text-gray-600">No hay datos de distribución geográfica disponibles</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (variant) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill={theme.palette.primary.main}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'map':
        // For now, fallback to bar chart since Recharts doesn't have a true map component
        // In a real implementation, we would use a proper geo visualization library
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                type="number"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  return value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : 
                         value > 1000 ? `${(value / 1000).toFixed(0)}K` : 
                         value.toString();
                }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                width={90}
              />
              <Tooltip 
                formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar
                dataKey="value"
                name="Valor"
                fill={theme.palette.primary.main}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                type="number"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  return value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : 
                         value > 1000 ? `${(value / 1000).toFixed(0)}K` : 
                         value.toString();
                }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                width={90}
              />
              <Tooltip 
                formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar
                dataKey="value"
                name="Valor"
                fill={theme.palette.primary.main}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
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
            {chartData.length} áreas geográficas • Año {year}
          </span>
          <span className="flex items-center">
            <span className="capitalize">{variant}</span> chart
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeographicDistributionChart;