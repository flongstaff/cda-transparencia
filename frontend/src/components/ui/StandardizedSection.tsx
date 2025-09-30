import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface StandardizedSectionProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  className?: string;
  children: React.ReactNode;
}

/**
 * Standardized Section Component
 * Provides consistent styling for dashboard sections and content areas
 */
const StandardizedSection: React.FC<StandardizedSectionProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  color = 'blue',
  className = '',
  children
}) => {
  // Define color schemes for different section types
  const colorClasses = {
    blue: {
      textPrimary: 'text-blue-800 dark:text-blue-200',
      textSecondary: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-700',
      actionText: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      textPrimary: 'text-green-800 dark:text-green-200',
      textSecondary: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-700',
      actionText: 'text-green-600 dark:text-green-400'
    },
    orange: {
      textPrimary: 'text-orange-800 dark:text-orange-200',
      textSecondary: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-700',
      actionText: 'text-orange-600 dark:text-orange-400'
    },
    red: {
      textPrimary: 'text-red-800 dark:text-red-200',
      textSecondary: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-700',
      actionText: 'text-red-600 dark:text-red-400'
    },
    purple: {
      textPrimary: 'text-purple-800 dark:text-purple-200',
      textSecondary: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-700',
      actionText: 'text-purple-600 dark:text-purple-400'
    },
    gray: {
      textPrimary: 'text-gray-800 dark:text-gray-200',
      textSecondary: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      actionText: 'text-gray-600 dark:text-gray-400'
    }
  };

  const colors = colorClasses[color];
  
  // Section classes
  const sectionClasses = `
    bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border
    transition-all duration-300 hover:shadow-xl
    ${className}
  `.trim();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={sectionClasses}
    >
      {/* Section header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`p-2 rounded-lg ${colors.textSecondary} bg-gray-100 dark:bg-dark-surface-alt`}>
                {icon}
              </div>
            )}
            <div>
              <h2 className={`text-xl font-bold ${colors.textPrimary}`}>
                {title}
              </h2>
              {description && (
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Action button */}
          {actionText && onAction && (
            <button
              onClick={onAction}
              className={`flex items-center text-sm font-medium ${colors.actionText} hover:underline`}
            >
              {actionText}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
      
      {/* Section content */}
      <div className="p-6">
        {children}
      </div>
    </motion.section>
  );
};

export default StandardizedSection;