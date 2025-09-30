/**
 * Multi-Year Revenue Page
 *
 * Comprehensive page showing revenue data across multiple years
 * Replicates the functionality from the previous version that showed different years data
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Activity,
  Layers,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import MultiYearRevenueChart from '../components/charts/MultiYearRevenueChart';
import ErrorBoundary from '../components/common/ErrorBoundary';
import RevenueSourcesChart from '../components/charts/RevenueSourcesChart';
import RevenueReportChart from '../components/charts/RevenueReportChart';
import UnifiedChart from '../components/charts/UnifiedChart';
import { useMultiYearData } from '../hooks/useMultiYearData';
import { formatCurrencyARS as formatCurrency, formatNumberARS as formatNumber, formatDateARS as formatDate } from '../utils/formatters';

interface YearComparisonData {
  year: number;
  totalRevenue: number;
  growth: number;
  categories: Record<string, number>;
  quality: number;
}

const MultiYearRevenue: React.FC = () => {
  const [selectedBaseYear, setSelectedBaseYear] = useState<number>(2023);
  const [selectedComparisonYear, setSelectedComparisonYear] = useState<number>(2024);
  const [showProjections, setShowProjections] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');

  const {
    trends,
    yearlyData,
    summary,
    loading,
    error,
    compareYears,
    getKPITrends,
    getDataForYear,
    getDataForCategory,
    getAvailableYears,
    getAvailableCategories,
    refreshData,
    getDataQualityStats
  } = useMultiYearData({
    categories: ['Ingresos', 'Recursos', 'Finanzas', 'Presupuesto'],
    autoLoad: true
  });

  const availableYears = getAvailableYears();
  const qualityStats = getDataQualityStats();

  // Process multi-year comparison data
  const yearComparisonData = useMemo(() => {
    const data: YearComparisonData[] = [];

    availableYears.forEach(year => {
      const yearData = getDataForYear(year);
      const revenueData = yearData.filter(point =>
        point.category.toLowerCase().includes('ingreso') ||
        point.category.toLowerCase().includes('recurso') ||
        point.indicator.toLowerCase().includes('ingreso')
      );

      const totalRevenue = revenueData.reduce((sum, point) => {
        return sum + (typeof point.value === 'number' ? point.value : 0);
      }, 0);

      // Calculate growth compared to previous year
      const prevYearData = data.find(d => d.year === year - 1);
      const growth = prevYearData
        ? ((totalRevenue - prevYearData.totalRevenue) / prevYearData.totalRevenue) * 100
        : 0;

      // Group by categories
      const categories: Record<string, number> = {};
      revenueData.forEach(point => {
        const category = point.category;
        categories[category] = (categories[category] || 0) + (typeof point.value === 'number' ? point.value : 0);
      });

      // Calculate data quality
      const avgConfidence = revenueData.reduce((sum, point) => sum + (point.confidence || 0.5), 0) / revenueData.length;

      data.push({
        year,
        totalRevenue,
        growth,
        categories,
        quality: avgConfidence
      });
    });

    return data.sort((a, b) => a.year - b.year);
  }, [yearlyData, availableYears, getDataForYear]);

  // Key performance indicators
  const kpiData = useMemo(() => {
    const latestYear = yearComparisonData[yearComparisonData.length - 1];
    const previousYear = yearComparisonData[yearComparisonData.length - 2];

    if (!latestYear || !previousYear) return null;

    const totalRevenue = latestYear.totalRevenue;
    const revenueGrowth = latestYear.growth;
    const avgGrowth = yearComparisonData.slice(1).reduce((sum, data) => sum + data.growth, 0) / (yearComparisonData.length - 1);

    // Find trend for main revenue indicators
    const revenueTrends = trends.filter(trend =>
      trend.category.toLowerCase().includes('ingreso') ||
      trend.indicator.toLowerCase().includes('ingreso')
    );

    return {
      totalRevenue,
      revenueGrowth,
      avgGrowth,
      categoriesCount: Object.keys(latestYear.categories).length,
      dataQuality: latestYear.quality,
      trendsCount: revenueTrends.length,
      projection: revenueTrends[0]?.projections?.nextYear || totalRevenue * 1.05
    };
  }, [yearComparisonData, trends]);

  // Revenue breakdown by category
  const categoryBreakdown = useMemo(() => {
    if (yearComparisonData.length === 0) return [];

    const latestYear = yearComparisonData[yearComparisonData.length - 1];
    const total = latestYear.totalRevenue;

    return Object.entries(latestYear.categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        trend: trends.find(t => t.category === category)?.trend || 'stable'
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [yearComparisonData, trends]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'volatile':
        return <Activity className="w-4 h-4 text-yellow-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'decreasing':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'volatile':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Ingresos Multi-Año
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary text-lg">
              Análisis temporal de los ingresos municipales desde {availableYears[0]} hasta {availableYears[availableYears.length - 1]}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
            <div className="flex rounded-lg border border-gray-300 dark:border-dark-border overflow-hidden">
              {(['overview', 'detailed', 'comparison'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-alt'
                  }`}
                >
                  {mode === 'overview' ? 'Resumen' : mode === 'detailed' ? 'Detallado' : 'Comparación'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className={`text-sm px-2 py-1 rounded-full ${getTrendColor('increasing')}`}>
                +{formatNumber(kpiData.revenueGrowth)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
              {formatCurrency(kpiData.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Ingresos Totales ({availableYears[availableYears.length - 1]})
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className={`text-sm px-2 py-1 rounded-full ${getTrendColor(kpiData.avgGrowth > 0 ? 'increasing' : 'decreasing')}`}>
                {kpiData.avgGrowth > 0 ? '+' : ''}{formatNumber(kpiData.avgGrowth)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
              {formatNumber(kpiData.avgGrowth)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Crecimiento Promedio Anual
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Layers className="w-8 h-8 text-purple-600" />
              <span className="text-sm px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                {kpiData.trendsCount} tendencias
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
              {kpiData.categoriesCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Categorías de Ingresos
            </div>
          </div>

          {showProjections && (
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
                <span className="text-sm px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  Proyección
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                {formatCurrency(kpiData.projection)}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Estimado {availableYears[availableYears.length - 1] + 1}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Chart */}
      <div className="mb-8">
        <ErrorBoundary>
          <MultiYearRevenueChart
            height={600}
            showFilters={viewMode === 'detailed'}
            showExport={true}
          />
        </ErrorBoundary>
      </div>

      {/* Additional Revenue Charts */}
      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Sources Chart */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
              Fuentes de Ingresos
            </h3>
            <div className="h-64">
              <ErrorBoundary>
                <RevenueSourcesChart
                  height={250}
                  chartType="pie"
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Revenue Report Chart */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
              Reporte de Ingresos
            </h3>
            <div className="h-64">
              <ErrorBoundary>
                <RevenueReportChart
                  height={250}
                  chartType="line"
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Trends with UnifiedChart */}
      {viewMode === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trends */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
              Tendencias de Ingresos
            </h3>
            <div className="h-64">
              <ErrorBoundary>
                <UnifiedChart
                  type="revenue"
                  year={availableYears[availableYears.length - 1]}
                  variant="line"
                  height={250}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
              Distribución de Ingresos
            </h3>
            <div className="h-64">
              <ErrorBoundary>
                <UnifiedChart
                  type="revenue"
                  year={availableYears[availableYears.length - 1]}
                  variant="bar"
                  height={250}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown and Trends */}
      {viewMode !== 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
              Distribución por Categoría ({availableYears[availableYears.length - 1]})
            </h3>
            <div className="space-y-4">
              {categoryBreakdown.slice(0, 8).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center mr-3">
                      {getTrendIcon(item.trend)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {item.category}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                        {formatNumber(item.percentage)}% del total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Year Comparison Table */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
              Comparación Año a Año
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border">
                    <th className="text-left py-2 font-medium text-gray-900 dark:text-dark-text-primary">Año</th>
                    <th className="text-right py-2 font-medium text-gray-900 dark:text-dark-text-primary">Total</th>
                    <th className="text-right py-2 font-medium text-gray-900 dark:text-dark-text-primary">Crecimiento</th>
                    <th className="text-center py-2 font-medium text-gray-900 dark:text-dark-text-primary">Calidad</th>
                  </tr>
                </thead>
                <tbody>
                  {yearComparisonData.slice(-5).map((data, index) => (
                    <tr key={data.year} className="border-b border-gray-100 dark:border-dark-border">
                      <td className="py-2 font-medium text-gray-900 dark:text-dark-text-primary">
                        {data.year}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-dark-text-primary">
                        {formatCurrency(data.totalRevenue)}
                      </td>
                      <td className="py-2 text-right">
                        <span className={`${
                          data.growth > 0 ? 'text-green-600' : data.growth < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {data.growth > 0 ? '+' : ''}{formatNumber(data.growth)}%
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center">
                          {data.quality > 0.8 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : data.quality > 0.6 ? (
                            <Info className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="ml-1 text-xs text-gray-600 dark:text-dark-text-secondary">
                            {formatNumber(data.quality * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Quality and Sources Info */}
      {qualityStats && (
        <div className="bg-gray-50 dark:bg-dark-surface-alt rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              Información de Calidad de Datos
            </h3>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-green-600 font-medium">
                {formatNumber(qualityStats.averageQuality * 100)}% Calidad Promedio
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-dark-text-secondary">Años con datos:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                {availableYears.length} años ({availableYears[0]} - {availableYears[availableYears.length - 1]})
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-dark-text-secondary">Completitud de datos:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                {formatNumber(qualityStats.dataCompleteness * 100)}%
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-dark-text-secondary">Última actualización:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                {formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiYearRevenue;