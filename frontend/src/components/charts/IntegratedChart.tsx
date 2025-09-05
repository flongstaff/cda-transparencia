import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { integratedBackendService } from '../../services/IntegratedBackendService';
import { Loader2, TrendingUp, AlertTriangle, BarChart3, PieChart, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IntegratedChartProps {
  type: 'transparency' | 'budget' | 'corruption' | 'comprehensive' | 'dashboard';
  years?: number[];
  height?: number;
  title?: string;
  showControls?: boolean;
}

const IntegratedChart: React.FC<IntegratedChartProps> = ({
  type,
  years = [2024, 2023, 2022, 2021, 2020],
  height = 400,
  title,
  showControls = true
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line');
  const [selectedYears, setSelectedYears] = useState<number[]>(years);

  useEffect(() => {
    loadData();
  }, [type, selectedYears]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (type === 'dashboard') {
        // Load comprehensive dashboard data
        const [antiCorruption, advancedFraud, systemHealth] = await Promise.all([
          integratedBackendService.getAntiCorruptionDashboard(),
          integratedBackendService.getAdvancedFraudDashboard(),
          integratedBackendService.getSystemHealth(),
        ]);

        setDashboardData({ antiCorruption, advancedFraud, systemHealth });
        
        // Create comprehensive chart data
        const comprehensiveChart = await integratedBackendService.getChartData('comprehensive', selectedYears);
        setChartData(comprehensiveChart);
      } else {
        const data = await integratedBackendService.getChartData(type, selectedYears);
        setChartData(data);
      }
    } catch (err) {
      console.error('Error loading integrated chart data:', err);
      setError('Error loading chart data');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: type !== 'dashboard' ? {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Año',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: type === 'transparency' ? 'Puntuación (0-100)' : 'Valor',
        },
        min: 0,
        max: type === 'transparency' ? 100 : undefined,
      },
    } : {},
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const renderChart = () => {
    if (!chartData) return null;

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'doughnut': {
        if (type === 'transparency' && chartData.datasets[0]?.data?.length > 0) {
          const latest = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
          const doughnutData = {
            labels: ['Transparencia Actual', 'Margen de Mejora'],
            datasets: [{
              data: [latest, 100 - latest],
              backgroundColor: ['rgb(34, 197, 94)', 'rgb(229, 231, 235)'],
              borderColor: ['rgb(21, 128, 61)', 'rgb(156, 163, 175)'],
              borderWidth: 2,
            }],
          };
          return <Doughnut data={doughnutData} options={{ ...chartOptions, scales: {} }} />;
        }
        return <Line data={chartData} options={chartOptions} />;
      }
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-600">Cargando datos integrados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Error al cargar los datos</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
            <button 
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {/* Header with Controls */}
      {showControls && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title || `Análisis ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </h3>
            <p className="text-sm text-gray-600">
              Datos integrados del sistema anti-corrupción
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {/* Chart Type Selector */}
            <div className="flex rounded-lg border border-gray-200">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-l-lg ${
                  chartType === 'line' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 ${
                  chartType === 'bar' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('doughnut')}
                className={`p-2 rounded-r-lg ${
                  chartType === 'doughnut' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <PieChart className="h-4 w-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Stats (if dashboard type) */}
      {type === 'dashboard' && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.antiCorruption?.transparency_metrics?.overall_score || 'N/A'}
            </div>
            <div className="text-sm text-green-800">Puntuación Transparencia</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.antiCorruption?.red_flags?.high_priority_alerts || 0}
            </div>
            <div className="text-sm text-red-800">Alertas de Alta Prioridad</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.systemHealth?.status === 'healthy' ? '✓' : '✗'}
            </div>
            <div className="text-sm text-blue-800">Estado del Sistema</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>

      {/* Data Summary */}
      {chartData && chartData.datasets && chartData.datasets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Años analizados:</span> {selectedYears.join(', ')} | 
            <span className="font-medium ml-2">Fuente:</span> Sistema Integrado Anti-Corrupción |
            <span className="font-medium ml-2">Última actualización:</span> {new Date().toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedChart;