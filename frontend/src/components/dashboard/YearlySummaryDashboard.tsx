import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, BarChart3, Users, FileText, DollarSign, Activity, Loader2, AlertCircle } from 'lucide-react';
import YearlyDataChart from '../charts/YearlyDataChart';
import YearlyDataService, { YearlyComparisonData, YearlyDataPoint } from '../../services/YearlyDataService';

interface YearlySummaryDashboardProps {
  dataType: 'salaries' | 'financial' | 'tenders' | 'documents' | 'all';
  title: string;
  startYear?: number;
  endYear?: number;
  showComparison?: boolean;
}

const YearlySummaryDashboard: React.FC<YearlySummaryDashboardProps> = ({
  dataType,
  title,
  startYear = 2018,
  endYear = 2025,
  showComparison = true
}) => {
  const [data, setData] = useState<YearlyComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  useEffect(() => {
    loadData();
  }, [dataType, startYear, endYear]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let yearlyData: YearlyComparisonData;
      
      switch (dataType) {
        case 'salaries':
          yearlyData = await YearlyDataService.getSalaryDataByYear(startYear, endYear);
          break;
        case 'financial':
          yearlyData = await YearlyDataService.getFinancialDataByYear(startYear, endYear);
          break;
        case 'tenders':
          yearlyData = await YearlyDataService.getPublicTenderDataByYear(startYear, endYear);
          break;
        case 'documents':
          yearlyData = await YearlyDataService.getDocumentDataByYear(startYear, endYear);
          break;
        default:
          // For 'all', we'll show financial data as the primary indicator
          yearlyData = await YearlyDataService.getFinancialDataByYear(startYear, endYear);
      }
      
      setData(yearlyData);
    } catch (err) {
      console.error('Error loading yearly data:', err);
      setError('Error al cargar los datos. Algunos años pueden no tener información disponible.');
    } finally {
      setLoading(false);
    }
  };

  const getIconForDataType = () => {
    switch (dataType) {
      case 'salaries': return <Users className="h-6 w-6" />;
      case 'financial': return <DollarSign className="h-6 w-6" />;
      case 'tenders': return <FileText className="h-6 w-6" />;
      case 'documents': return <FileText className="h-6 w-6" />;
      default: return <BarChart3 className="h-6 w-6" />;
    }
  };

  const formatValue = (value: number): string => {
    if (dataType === 'documents') {
      return value.toString();
    }
    return YearlyDataService.formatValueForDisplay(value, dataType);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'down': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const availableYears = Array.from(
    { length: endYear - startYear + 1 }, 
    (_, i) => startYear + i
  ).reverse();

  const selectedYearData = data?.data.find(d => d.year === selectedYear);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando datos de {title.toLowerCase()}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-700 p-8">
        <div className="flex items-center justify-center text-center">
          <div>
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error al cargar datos
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Sin datos disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No hay datos de {title.toLowerCase()} para el período {startYear}-{endYear}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Acumulado
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(data.statistics.total)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {startYear} - {endYear}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              {getIconForDataType()}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Promedio Anual
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(data.statistics.average)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Por año
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Crecimiento
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.statistics.growth > 0 ? '+' : ''}{data.statistics.growth.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Último año
              </p>
            </div>
            <div className={`p-3 rounded-lg ${getTrendColor(data.statistics.trend)}`}>
              {getTrendIcon(data.statistics.trend)}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Años con Datos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.data.filter(d => d.value > 0).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                de {endYear - startYear + 1} total
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Year Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Explorar por Año
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona un año para ver los detalles específicos
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Year Details */}
      {selectedYearData && selectedYearData.value > 0 && (
        <motion.div
          key={selectedYear}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detalles de {selectedYear}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYearData.description}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Valor Principal</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatValue(selectedYearData.value)}
              </p>
            </div>
            
            {selectedYearData.count !== undefined && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Cantidad</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {selectedYearData.count.toLocaleString()}
                </p>
              </div>
            )}
            
            {selectedYearData.average !== undefined && selectedYearData.average > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Promedio</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatValue(selectedYearData.average)}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Yearly Trend Chart */}
      <YearlyDataChart
        data={data.data}
        title={`Evolución de ${title} (${startYear}-${endYear})`}
        type="line"
        xAxisDataKey="year"
        yAxisDataKey="value"
        height={400}
        formatValue={formatValue}
      />

      {/* Additional Bar Chart for Comparison */}
      <YearlyDataChart
        data={data.data}
        title={`Comparación por Año - ${title}`}
        type="bar"
        xAxisDataKey="year"
        yAxisDataKey="value"
        height={350}
        formatValue={formatValue}
      />
    </div>
  );
};

export default YearlySummaryDashboard;