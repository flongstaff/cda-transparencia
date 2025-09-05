import React, { ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface BaseChartProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}

const BaseChart: React.FC<BaseChartProps> = ({
  title,
  subtitle,
  loading = false,
  error = null,
  controls,
  children,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando gráfico...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400 font-medium">Error al cargar el gráfico</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {controls && (
            <div className="flex items-center">
              {controls}
            </div>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default BaseChart;