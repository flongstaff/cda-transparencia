import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface DataPoint {
  year?: number;
  name?: string;
  value: number;
  [key: string]: any;
}

interface YearlyDataChartProps {
  data: DataPoint[];
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  height?: number;
  colors?: string[];
  showComparison?: boolean;
  comparisonData?: DataPoint[];
  formatValue?: (value: number) => string;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const YearlyDataChart: React.FC<YearlyDataChartProps> = ({
  data,
  title,
  type,
  xAxisDataKey = 'year',
  yAxisDataKey = 'value',
  height = 400,
  colors = COLORS,
  showComparison = false,
  comparisonData = [],
  formatValue = (value: number) => value.toLocaleString()
}) => {
  const getChartIcon = () => {
    switch (type) {
      case 'line': return <TrendingUp className="h-5 w-5" />;
      case 'bar': return <BarChart3 className="h-5 w-5" />;
      case 'pie': return <PieChartIcon className="h-5 w-5" />;
      case 'area': return <Activity className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={xAxisDataKey} 
                className="text-sm text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                className="text-sm text-gray-600 dark:text-gray-400"
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={(value: any) => [formatValue(Number(value)), yAxisDataKey]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yAxisDataKey} 
                stroke={colors[0]} 
                strokeWidth={3}
                dot={{ fill: colors[0], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
              {showComparison && comparisonData.length > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="comparison" 
                  data={comparisonData}
                  stroke={colors[1]} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: colors[1], strokeWidth: 2, r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={xAxisDataKey} 
                className="text-sm text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                className="text-sm text-gray-600 dark:text-gray-400"
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={(value: any) => [formatValue(Number(value)), yAxisDataKey]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey={yAxisDataKey} 
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
              {showComparison && (
                <Bar 
                  dataKey="comparison" 
                  fill={colors[1]}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={xAxisDataKey} 
                className="text-sm text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                className="text-sm text-gray-600 dark:text-gray-400"
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={(value: any) => [formatValue(Number(value)), yAxisDataKey]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={yAxisDataKey} 
                stroke={colors[0]} 
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey={yAxisDataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatValue(Number(value)), 'Monto']}
                contentStyle={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              {getChartIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Datos por año • {data.length} registros
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }}></div>
              <span>Principal</span>
            </div>
            {showComparison && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[1] }}></div>
                <span>Comparación</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {renderChart()}
      </div>
    </motion.div>
  );
};

export default YearlyDataChart;