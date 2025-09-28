/** 
 * Chart Skeleton Component
 * Provides a loading state for charts with animated shimmer effect
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ChartSkeletonProps {
  height?: number;
  width?: string | number;
  className?: string;
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  height = 400, 
  width = '100%', 
  className = '' 
}) => {
  return (
    <motion.div 
      className={`animate-pulse ${className}`}
      data-testid="chart-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div 
        className="bg-gray-200 dark:bg-gray-700 rounded-lg"
        style={{ height, width }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div 
              className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
              data-testid="loader-icon"
            />
            <p className="text-gray-600 dark:text-gray-400">
              Cargando gráfico...
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartSkeleton;