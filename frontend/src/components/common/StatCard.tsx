/**
 * STANDARD STAT CARD COMPONENT
 *
 * Consistent design for all stat cards across all pages
 * Ensures proper typography, spacing, and responsive design
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'orange' | 'gray' | 'pink';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  delay?: number;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-600 dark:text-green-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-600 dark:text-red-400'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    text: 'text-orange-600 dark:text-orange-400'
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-600 dark:text-gray-400'
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/20',
    icon: 'text-pink-600 dark:text-pink-400',
    text: 'text-pink-600 dark:text-pink-400'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'blue',
  trend,
  delay = 0,
  className = ''
}) => {
  const colors = colorClasses[iconColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Title - Small, medium weight */}
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>

          {/* Value - Large, bold */}
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2 break-words">
            {value}
          </p>

          {/* Subtitle - Extra small, lighter */}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon - Always visible, proper size */}
        <div className={`p-3 ${colors.bg} rounded-lg flex-shrink-0 ml-4`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className={`flex items-center text-sm ${
            trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4 mr-1 flex-shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1 flex-shrink-0" />
            )}
            <span className="font-medium">{typeof trend.value === 'number' ? Math.abs(trend.value) : trend.value}%</span>
            {trend.label && (
              <span className="ml-1 text-gray-600 dark:text-gray-400">{trend.label}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * USAGE EXAMPLE:
 *
 * <StatCard
 *   title="Presupuesto Total"
 *   value={formatCurrencyARS(1500000)}
 *   subtitle="Año 2025"
 *   icon={DollarSign}
 *   iconColor="blue"
 *   trend={{ value: 15.5, direction: 'up', label: 'vs año anterior' }}
 *   delay={0.1}
 * />
 */

export default StatCard;
