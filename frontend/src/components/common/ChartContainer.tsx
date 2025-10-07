/**
 * CHART CONTAINER COMPONENT
 *
 * Standard wrapper for all charts to ensure consistent design
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Info } from 'lucide-react';

interface ChartContainerProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  height?: number | string;
  className?: string;
  actions?: React.ReactNode;
  delay?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  icon: Icon,
  children,
  height = 'auto',
  className = '',
  actions,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {Icon && (
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex-shrink-0 ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {children}
      </div>
    </motion.div>
  );
};

/**
 * USAGE EXAMPLE:
 *
 * <ChartContainer
 *   title="Ejecución Presupuestaria"
 *   description="Comparación entre presupuesto aprobado y ejecutado"
 *   icon={BarChart3}
 *   height={400}
 *   delay={0.2}
 * >
 *   <UnifiedChart type="budget" year={2025} variant="bar" />
 * </ChartContainer>
 */

export default ChartContainer;
