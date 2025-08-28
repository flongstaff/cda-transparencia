import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, BarChart3, Users, FileText, DollarSign, Activity, Loader2, AlertCircle } from 'lucide-react';
import YearlyDataChart from '../charts/YearlyDataChart';
import { EnhancedApiService } from '../../services/EnhancedApiService';

// Define the interfaces directly
interface YearlyDataPoint {
  year: number;
  value: number;
  growth?: number;
  metadata?: Record<string, any>;
}

interface YearlyComparisonData {
  dataPoints: YearlyDataPoint[];
  totalGrowth: number;
  averageGrowth: number;
  bestYear: YearlyDataPoint;
  worstYear: YearlyDataPoint;
  trends: string[];
}

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

  const generateMockYearlyData = async (dataType: string): Promise<YearlyComparisonData> => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    
    const dataPoints: YearlyDataPoint[] = years.map(year => {
      let baseValue;
      switch (dataType) {
        case 'salaries':
          baseValue = 150000000 + (year - startYear) * 15000000;
          break;
        case 'financial':
          baseValue = 2000000000 + (year - startYear) * 100000000;
          break;
        case 'tenders':
          baseValue = 45 + (year - startYear) * 3;
          break;
        case 'documents':
          baseValue = 350 + (year - startYear) * 25;
          break;
        default:
          baseValue = 1000000 + (year - startYear) * 100000;
      }
      
      const randomFactor = 0.8 + Math.random() * 0.4;
      const value = Math.round(baseValue * randomFactor);
      
      return {
        year,
        value,
        growth: year > startYear ? Math.round((Math.random() - 0.5) * 20) : 0
      };
    });

    const totalGrowth = dataPoints.length > 1 
      ? Math.round(((dataPoints[dataPoints.length - 1].value / dataPoints[0].value) - 1) * 100)
      : 0;
      
    const averageGrowth = Math.round(totalGrowth / Math.max(1, dataPoints.length - 1));
    
    const bestYear = dataPoints.reduce((best, current) => 
      current.value > best.value ? current : best
    );
    
    const worstYear = dataPoints.reduce((worst, current) => 
      current.value < worst.value ? current : worst
    );

    return {
      dataPoints,
      totalGrowth,
      averageGrowth,
      bestYear,
      worstYear,
      trends: ['Tendencia al crecimiento', 'Volatilidad moderada']
    };
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let yearlyData: YearlyComparisonData;
      
      if (dataType === 'documents') {
        // Try to get real document statistics
        try {
          const enhancedApi = EnhancedApiService.getInstance();
          const stats = await enhancedApi.getRealDocumentStatistics();
          
          if (stats.by_year) {
            const dataPoints: YearlyDataPoint[] = Object.entries(stats.by_year)
              .filter(([year, count]) => {
                const yearNum = parseInt(year);
                return yearNum >= startYear && yearNum <= endYear && count > 0;
              })
              .map(([year, count]) => ({
                year: parseInt(year),
                value: count as number,
                growth: 0
              }))
              .sort((a, b) => a.year - b.year);

            if (dataPoints.length > 0) {
              const totalGrowth = dataPoints.length > 1 
                ? Math.round(((dataPoints[dataPoints.length - 1].value / dataPoints[0].value) - 1) * 100)
                : 0;
                
              yearlyData = {
                dataPoints,
                totalGrowth,
                averageGrowth: Math.round(totalGrowth / Math.max(1, dataPoints.length - 1)),
                bestYear: dataPoints.reduce((best, current) => current.value > best.value ? current : best),
                worstYear: dataPoints.reduce((worst, current) => current.value < worst.value ? current : worst),
                trends: ['Datos reales de documentos municipales']
              };
            } else {
              yearlyData = await generateMockYearlyData(dataType);
            }
          } else {
            yearlyData = await generateMockYearlyData(dataType);
          }
        } catch (error) {
          console.warn('Failed to load real document data, using mock');
          yearlyData = await generateMockYearlyData(dataType);
        }
      } else {
        yearlyData = await generateMockYearlyData(dataType);
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
    if (dataType === 'documents' || dataType === 'tenders') {
      return value.toString();
    }
    
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <span className="ml-2 text-red-600 dark:text-red-400">
            {error || 'Error al cargar los datos'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="text-blue-600 dark:text-blue-400 mr-3">
            {getIconForDataType()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {startYear} - {endYear}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatValue(data.dataPoints[data.dataPoints.length - 1].value)}
          </div>
          <div className="flex items-center text-sm">
            {getTrendIcon(data.totalGrowth > 0 ? 'up' : data.totalGrowth < 0 ? 'down' : 'stable')}
            <span className={`ml-1 ${
              data.totalGrowth > 0 ? 'text-green-600' : 
              data.totalGrowth < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {data.totalGrowth > 0 ? '+' : ''}{data.totalGrowth}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <YearlyDataChart 
          data={data.dataPoints}
          dataType={dataType}
          height={300}
        />
      </div>

      {/* Summary Stats */}
      {showComparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">Mejor Año</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.bestYear.year}
            </div>
            <div className="text-sm text-green-600">
              {formatValue(data.bestYear.value)}
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">Crecimiento Promedio</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.averageGrowth > 0 ? '+' : ''}{data.averageGrowth}%
            </div>
            <div className="text-sm text-blue-600">Anual</div>
          </motion.div>

          <motion.div 
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Años</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.dataPoints.length}
            </div>
            <div className="text-sm text-gray-600">Disponibles</div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default YearlySummaryDashboard;