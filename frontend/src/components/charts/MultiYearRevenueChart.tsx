/**
 * Multi-Year Revenue Chart Component
 *
 * Displays revenue data across multiple years with trends and comparisons
 * Replicates the functionality from the previous version showing different years data
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  Filter,
  Download,
  Info
} from 'lucide-react';
import { useMultiYearData } from '../../hooks/useMultiYearData';
import { formatCurrencyARS, formatNumberARS } from '../../utils/formatters';

// Create aliases to maintain backward compatibility
const formatCurrency = (amount: number, compact?: boolean | string): string => {
  // Handle cases where compact is passed as string 'compact'
  const isCompact = compact === true || compact === 'compact';
  return formatCurrencyARS(amount, isCompact);
};
const formatNumber = formatNumberARS;

interface MultiYearRevenueChartProps {
  height?: number;
  showFilters?: boolean;
  showExport?: boolean;
  compactMode?: boolean;
}

const MultiYearRevenueChart: React.FC<MultiYearRevenueChartProps> = ({
  height = 600,
  showFilters = true,
  showExport = true,
  compactMode = false
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [viewMode, setViewMode] = useState<'absolute' | 'percentage' | 'growth'>('absolute');

  const {
    trends,
    yearlyData,
    loading,
    error,
    getDataForCategory,
    getDataForIndicator,
    getTrendForIndicator,
    getAvailableYears,
    getAvailableCategories
  } = useMultiYearData({
    categories: ['Ingresos', 'Recursos', 'Finanzas'],
    autoLoad: true
  });

  const availableYears = getAvailableYears();
  const availableCategories = getAvailableCategories().filter(cat =>
    cat.toLowerCase().includes('ingreso') ||
    cat.toLowerCase().includes('recurso') ||
    cat.toLowerCase().includes('finanza')
  );

  // Initialize selections
  useEffect(() => {
    if (availableCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(availableCategories.slice(0, 3));
    }
    if (availableYears.length > 0 && selectedYears.length === 0) {
      setSelectedYears(availableYears.slice(-5)); // Last 5 years
    }
  }, [availableCategories, availableYears, selectedCategories.length, selectedYears.length]);

  // Process data for charts
  const chartData = useMemo(() => {
    const data: any[] = [];

    selectedYears.forEach(year => {
      const yearDataPoints = Array.from(yearlyData.get(year) || []);
      const yearEntry: any = { year };

      selectedCategories.forEach(category => {
        const categoryData = yearDataPoints.filter(point => point.category === category);
        const totalValue = categoryData.reduce((sum, point) => {
          return sum + (typeof point.value === 'number' ? point.value : 0);
        }, 0);

        yearEntry[category] = totalValue;
      });

      // Calculate totals
      yearEntry.total = selectedCategories.reduce((sum, cat) => sum + (yearEntry[cat] || 0), 0);
      data.push(yearEntry);
    });

    // Calculate growth rates if needed
    if (viewMode === 'growth') {
      data.forEach((entry, index) => {
        if (index > 0) {
          const prevEntry = data[index - 1];
          selectedCategories.forEach(category => {
            const current = entry[category] || 0;
            const previous = prevEntry[category] || 0;
            entry[`${category}_growth`] = previous > 0 ? ((current - previous) / previous) * 100 : 0;
          });
        }
      });
    }

    return data.sort((a, b) => a.year - b.year);
  }, [yearlyData, selectedYears, selectedCategories, viewMode]);

  // Process summary statistics
  const summaryStats = useMemo(() => {
    if (chartData.length === 0) return null;

    const latestYear = chartData[chartData.length - 1];
    const previousYear = chartData.length > 1 ? chartData[chartData.length - 2] : null;

    const stats = selectedCategories.map(category => {
      const trend = getTrendForIndicator(category, category);
      const latestValue = latestYear[category] || 0;
      const previousValue = previousYear?.[category] || 0;
      const growth = previousValue > 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0;

      return {
        category,
        latestValue,
        growth,
        trend: trend?.trend || 'stable',
        averageGrowth: trend?.averageGrowth || 0,
        projection: trend?.projections?.nextYear || latestValue
      };
    });

    return stats;
  }, [chartData, selectedCategories, getTrendForIndicator]);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const handleExport = () => {
    const csvContent = [
      ['Año', ...selectedCategories, 'Total'].join(','),
      ...chartData.map(row => [
        row.year,
        ...selectedCategories.map(cat => row[cat] || 0),
        row.total || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos-multi-año-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando datos multi-año...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <Info className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value, 'compact')} />
            <Tooltip
              formatter={(value: any) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Año ${label}`}
            />
            <Legend />
            {selectedCategories.map((category, index) => (
              <Bar
                key={category}
                dataKey={viewMode === 'growth' ? `${category}_growth` : category}
                fill={colors[index % colors.length]}
                name={category}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value, 'compact')} />
            <Tooltip
              formatter={(value: any) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Año ${label}`}
            />
            <Legend />
            {selectedCategories.map((category, index) => (
              <Area
                key={category}
                type="monotone"
                dataKey={viewMode === 'growth' ? `${category}_growth` : category}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                name={category}
              />
            ))}
          </AreaChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value, 'compact')} />
            <Tooltip
              formatter={(value: any) => [
                viewMode === 'growth' ? `${formatNumber(value)}%` : formatCurrency(value),
                ''
              ]}
              labelFormatter={(label) => `Año ${label}`}
            />
            <Legend />
            {selectedCategories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={viewMode === 'growth' ? `${category}_growth` : category}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={category}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
            Evolución de Ingresos Multi-Año
          </h3>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Análisis de tendencias de ingresos municipales a través de los años
          </p>
        </div>
        {showExport && (
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Summary Statistics */}
      {summaryStats && !compactMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summaryStats.slice(0, 3).map((stat, index) => (
            <div key={stat.category} className="bg-gray-50 dark:bg-dark-surface-alt rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                  {stat.category}
                </span>
                <div className="flex items-center">
                  {stat.growth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : stat.growth < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stat.growth > 0 ? 'text-green-600' : stat.growth < 0 ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {formatNumber(stat.growth)}%
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
                {formatCurrency(stat.latestValue)}
              </div>
              <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                Tendencia: {stat.trend === 'increasing' ? 'Creciente' :
                           stat.trend === 'decreasing' ? 'Decreciente' :
                           stat.trend === 'stable' ? 'Estable' : 'Volátil'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && !compactMode && (
        <div className="bg-gray-50 dark:bg-dark-surface-alt rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Tipo de Gráfico
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              >
                <option value="line">Línea</option>
                <option value="bar">Barras</option>
                <option value="area">Área</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Vista
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              >
                <option value="absolute">Valores Absolutos</option>
                <option value="growth">Crecimiento (%)</option>
              </select>
            </div>

            {/* Years Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Años ({selectedYears.length})
              </label>
              <select
                multiple
                value={selectedYears.map(String)}
                onChange={(e) => setSelectedYears(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                size={3}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Categorías ({selectedCategories.length})
              </label>
              <select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                size={3}
              >
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: compactMode ? height / 2 : height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Data Info */}
      {chartData.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 dark:text-dark-text-tertiary">
          Mostrando datos de {selectedYears.length} años y {selectedCategories.length} categorías.
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </div>
      )}
    </div>
  );
};

export default MultiYearRevenueChart;