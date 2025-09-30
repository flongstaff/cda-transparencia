import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface StandardizedCardProps {
  title: string;
  description: string;
  value?: string | number;
  valueUnit?: string;
  trend?: number; // Positive/negative trend indicator
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  highlight?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Standardized Card Component
 * Provides consistent styling for dashboard cards and information displays
 */
const StandardizedCard: React.FC<StandardizedCardProps> = ({
  title,
  description,
  value,
  valueUnit,
  trend,
  icon,
  color = 'blue',
  highlight = false,
  onClick,
  className = '',
  children
}) => {
  // Define color schemes for different card types
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      textPrimary: 'text-blue-800 dark:text-blue-200',
      textSecondary: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-800/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      highlightBorder: 'border-blue-500 dark:border-blue-500',
      highlightShadow: 'shadow-blue-100 dark:shadow-blue-900/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      textPrimary: 'text-green-800 dark:text-green-200',
      textSecondary: 'text-green-700 dark:text-green-300',
      iconBg: 'bg-green-100 dark:bg-green-800/30',
      iconColor: 'text-green-600 dark:text-green-400',
      highlightBorder: 'border-green-500 dark:border-green-500',
      highlightShadow: 'shadow-green-100 dark:shadow-green-900/30'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-700',
      textPrimary: 'text-orange-800 dark:text-orange-200',
      textSecondary: 'text-orange-700 dark:text-orange-300',
      iconBg: 'bg-orange-100 dark:bg-orange-800/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      highlightBorder: 'border-orange-500 dark:border-orange-500',
      highlightShadow: 'shadow-orange-100 dark:shadow-orange-900/30'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-700',
      textPrimary: 'text-red-800 dark:text-red-200',
      textSecondary: 'text-red-700 dark:text-red-300',
      iconBg: 'bg-red-100 dark:bg-red-800/30',
      iconColor: 'text-red-600 dark:text-red-400',
      highlightBorder: 'border-red-500 dark:border-red-500',
      highlightShadow: 'shadow-red-100 dark:shadow-red-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      textPrimary: 'text-purple-800 dark:text-purple-200',
      textSecondary: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-800/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      highlightBorder: 'border-purple-500 dark:border-purple-500',
      highlightShadow: 'shadow-purple-100 dark:shadow-purple-900/30'
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      textPrimary: 'text-gray-800 dark:text-gray-200',
      textSecondary: 'text-gray-700 dark:text-gray-300',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      iconColor: 'text-gray-600 dark:text-gray-400',
      highlightBorder: 'border-gray-500 dark:border-gray-500',
      highlightShadow: 'shadow-gray-100 dark:shadow-gray-900/30'
    }
  };

  const colors = colorClasses[color];
  
  // Determine card classes based on props
  const cardClasses = `
    ${colors.bg}
    ${colors.border} ${highlight ? `${colors.highlightBorder} border-2 ${colors.highlightShadow} shadow-lg` : 'border'}
    rounded-xl p-5 transition-all duration-300
    ${onClick ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5' : ''}
    ${className}
  `.trim();

  // Trend indicator
  const renderTrend = () => {
    if (trend === undefined || trend === null) return null;
    
    return (
      <div className={`flex items-center text-xs font-medium ${
        trend > 0 ? 'text-green-600 dark:text-green-400' : 
        trend < 0 ? 'text-red-600 dark:text-red-400' : 
        'text-gray-600 dark:text-gray-400'
      }`}>
        <span>{trend > 0 ? '+' : ''}{trend}{trend !== 0 ? '%' : ''}</span>
        {trend > 0 && <span className="ml-1">↗</span>}
        {trend < 0 && <span className="ml-1">↘</span>}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -5 } : {}}
      className={cardClasses}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          {icon && (
            <div className={`${colors.iconBg} ${colors.iconColor} p-2 rounded-lg`}>
              {icon}
            </div>
          )}
          <div>
            <h3 className={`font-semibold text-gray-900 dark:text-dark-text-primary ${highlight ? 'text-lg' : 'text-base'}`}>
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
              {description}
            </p>
          </div>
        </div>
        
        {onClick && (
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        )}
      </div>

      {/* Value display */}
      {(value !== undefined || value !== null) && (
        <div className="mb-3">
          <div className="flex items-baseline">
            <span className={`font-bold ${
              highlight ? 'text-3xl' : 'text-2xl'
            } text-gray-900 dark:text-dark-text-primary`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {valueUnit && (
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                {valueUnit}
              </span>
            )}
          </div>
          {renderTrend()}
        </div>
      )}

      {/* Children content */}
      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default StandardizedCard;