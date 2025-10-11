import React from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Download, ExternalLink } from 'lucide-react';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
    tension?: number;
  }[];
}

interface DataVisualizationProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  data: ChartData | null | undefined;
  height?: number;
  onExport?: () => void;
  showExport?: boolean;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  type,
  title,
  data,
  height = 300,
  onExport,
  showExport = false
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: type !== 'pie' && type !== 'doughnut' ? {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    } : {}
  };

  // Handle null or undefined data
  const validData = data || {
    labels: [],
    datasets: []
  };

  const chartComponents = {
    bar: <Bar data={validData} options={chartOptions} height={height} />,
    line: <Line data={validData} options={chartOptions} height={height} />,
    pie: <Pie data={validData} options={chartOptions} height={height} />,
    doughnut: <Doughnut data={validData} options={chartOptions} height={height} />
  };

  return (
    <div className="relative bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">{title}</h3>
        {showExport && (
          <div className="flex space-x-2">
            <button
              onClick={onExport}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center"
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </button>
            <button className="text-sm border border-gray-300 hover:border-gray-400 dark:border-gray-600 text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-lg flex items-center">
              <ExternalLink className="h-3 w-3 mr-1" />
            </button>
          </div>
        )}
      </div>
      <div style={{ height: `${height}px` }}>
        {chartComponents[type]}
      </div>
    </div>
  );
};

export default DataVisualization;