import React from 'react';
import { motion } from 'framer-motion';

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  noData?: boolean;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  children,
  className = '',
  loading = false,
  error = null,
  noData = false
}) => {
  // If loading, show loading state
  if (loading) {
    return (
      <motion.div 
        className={`chart-container ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
        
        <div className="chart-loading">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-dark-text-secondary">Cargando datos...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <motion.div 
        className={`chart-container ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
        
        <div className="chart-error">
          <p className="text-red-800 dark:text-red-200">Error al cargar datos: {error}</p>
        </div>
      </motion.div>
    );
  }

  // If no data, show no data state
  if (noData) {
    return (
      <motion.div 
        className={`chart-container ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">No hay datos disponibles para mostrar</p>
        </div>
      </motion.div>
    );
  }

  // Normal chart display
  return (
    <motion.div 
      className={`chart-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
            {description}
          </p>
        )}
      </div>
      
      <div className="chart-content">
        {children}
      </div>
    </motion.div>
  );
};

export default ChartWrapper;