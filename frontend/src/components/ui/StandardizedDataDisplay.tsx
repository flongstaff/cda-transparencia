import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StandardizedDataDisplayProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: number; // Percentage change
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

/**
 * Standardized Data Display Component
 * Provides consistent styling for displaying key metrics and data points
 */
const StandardizedDataDisplay: React.FC<StandardizedDataDisplayProps> = ({
  title,
  value,
  unit,
  description,
  trend,
  trendLabel = 'vs mes anterior',
  icon,
  color = 'blue',
  size = 'md',
  className = '',
  onClick
}) => {
  // Define size configurations
  const sizeConfig = {
    sm: {
      container: 'p-3',
      title: 'text-xs',
      value: 'text-lg',
      icon: 'w-4 h-4',
      trend: 'text-xs'
    },
    md: {
      container: 'p-4',
      title: 'text-sm',
      value: 'text-xl',
      icon: 'w-5 h-5',
      trend: 'text-sm'
    },
    lg: {
      container: 'p-5',
      title: 'text-base',
      value: 'text-2xl',
      icon: 'w-6 h-6',
      trend: 'text-base'
    }
  };

  const config = sizeConfig[size];
  
  // Define color schemes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendNeutral: 'text-gray-600 dark:text-gray-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-800 dark:text-green-200',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendNeutral: 'text-gray-600 dark:text-gray-400'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-700',
      text: 'text-orange-800 dark:text-orange-200',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendNeutral: 'text-gray-600 dark:text-gray-400'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendNeutral: 'text-gray-600 dark:text-gray-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-800 dark:text-purple-200',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendNeutral: 'text-gray-600 dark:text-gray-400'
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      trendPositive: 'text-green-600 dark:text-green-400',
      trendNegative: 'text-red-600 dark:text-red-400',
      trendNeutral: 'text-gray-600 dark:text-gray-400'
    }
  };

  const colors = colorClasses[color];
  
  // Determine trend icon and color
  const getTrendInfo = () => {
    if (trend === undefined || trend === null) {
      return { icon: null, colorClass: colors.trendNeutral };
    }
    
    if (trend > 0) {
      return { icon: <TrendingUp className="w-4 h-4 inline mr-1" />, colorClass: colors.trendPositive };
    } else if (trend < 0) {
      return { icon: <TrendingDown className="w-4 h-4 inline mr-1" />, colorClass: colors.trendNegative };
    } else {
      return { icon: <Minus className="w-4 h-4 inline mr-1" />, colorClass: colors.trendNeutral };
    }
  };

  const trendInfo = getTrendInfo();
  
  // Container classes
  const containerClasses = `
    ${colors.bg}
    ${colors.border} border rounded-xl transition-all duration-300
    ${onClick ? 'hover:shadow-md cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${containerClasses} ${config.container}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${colors.text} ${config.title}`}>
              {title}
            </h3>
            
            {icon && (
              <div className={`${colors.text} ${config.icon} opacity-70`}>
                {icon}
              </div>
            )}
          </div>
          
          <div className="mt-2 flex items-baseline">
            <span className={`font-bold ${colors.text} ${config.value}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className={`ml-2 ${config.trend} font-medium ${colors.trendNeutral}`}>
                {unit}
              </span>
            )}
          </div>
          
          {/* Trend information */}
          {trend !== undefined && trend !== null && (
            <div className={`mt-2 flex items-center ${config.trend} font-medium ${trendInfo.colorClass}`}>
              {trendInfo.icon}
              <span>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="ml-1 font-normal">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
          
          {description && (
            <p className={`mt-2 ${config.trend} text-gray-600 dark:text-dark-text-secondary`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StandardizedDataDisplay;