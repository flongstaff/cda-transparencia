import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ScatterChart, Scatter, RadialBarChart, RadialBar
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon, Activity, Target } from 'lucide-react';

interface DataPoint {
  name: string;
  value: number;
  year?: number;
  category?: string;
  trend?: number;
  comparison?: number;
  [key: string]: any;
}

interface ComprehensiveVisualizationProps {
  data: DataPoint[];
  title: string;
  type?: 'overview' | 'trends' | 'comparison' | 'distribution';
  timeRange?: string;
  showControls?: boolean;
  height?: number;
}

const COLORS = [
  '#0056b3', '#28a745', '#ffc107', '#dc3545', '#20c997', 
  '#6f42c1', '#fd7e14', '#e83e8c', '#6c757d', '#17a2b8'
];

const ComprehensiveVisualization: React.FC<ComprehensiveVisualizationProps> = ({
  data,
  title,
  type = 'overview',
  timeRange = '2018-2025',
  showControls = true,
  height = 400
}) => {
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie' | 'area' | 'composed' | 'scatter'>('bar');
  const [showTrends, setShowTrends] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [activeChart, data]);

  const formatValue = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return `${value.toFixed(0)}`;
  };

  const formatTooltip = (value: any, name: string) => [
    formatValue(Number(value)), 
    name
  ];

  // Calculate statistics
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const avgValue = data.length > 0 ? totalValue / data.length : 0;
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  // Prepare data for different chart types
  const pieData = data.slice(0, 8).map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  const timeSeriesData = data.map((item, index) => ({
    ...item,
    period: item.year || index + 1,
    growth: index > 0 ? ((item.value - data[index - 1].value) / data[index - 1].value * 100) : 0
  }));

  const renderChart = () => {
    const commonProps = {
      data: activeChart === 'pie' ? pieData : timeSeriesData,
      key: animationKey
    };

    switch (activeChart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis 
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0056b3"
                strokeWidth={3}
                dot={{ fill: '#0056b3', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#0056b3' }}
                name="Valor"
              />
              {showTrends && (
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#28a745"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Crecimiento %"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#0056b3"
                name="Valor"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={height * 0.3}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis 
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stackId="1"
                stroke="#0056b3"
                fill="#0056b3"
                fillOpacity={0.3}
                name="Valor"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis 
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#0056b3" name="Valor" radius={[2, 2, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#28a745" 
                strokeWidth={3}
                name="Tendencia"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                name="Período"
              />
              <YAxis 
                dataKey="value"
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                name="Valor"
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Scatter
                dataKey="value"
                fill="#0056b3"
                name="Valores"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Período: {timeRange} • {data.length} elementos
            </p>
          </div>

          {showControls && (
            <div className="flex items-center space-x-2">
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                {[
                  { key: 'bar', icon: BarChart3, label: 'Barras' },
                  { key: 'line', icon: TrendingUp, label: 'Líneas' },
                  { key: 'pie', icon: PieIcon, label: 'Torta' },
                  { key: 'area', icon: Activity, label: 'Área' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveChart(key as any)}
                    className={`p-2 ${
                      activeChart === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    title={label}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {formatValue(totalValue)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Promedio</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {formatValue(avgValue)}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Máximo</p>
            <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
              {formatValue(maxValue)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Mínimo</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">
              {formatValue(minValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {data.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay datos disponibles para mostrar</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with additional options */}
      {showControls && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showTrends}
                onChange={(e) => setShowTrends(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mostrar tendencias
              </span>
            </label>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Última actualización: {new Date().toLocaleString('es-AR')}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ComprehensiveVisualization;
