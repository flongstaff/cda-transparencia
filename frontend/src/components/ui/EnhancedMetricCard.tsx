import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface EnhancedMetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  updatedAt?: string;
  priority?: 'primary' | 'secondary' | 'tertiary';
  className?: string;
  onClick?: () => void;
}

const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  updatedAt,
  priority = 'secondary',
  className = '',
  onClick
}) => {
  // Determine card size based on priority
  const getSizeClasses = () => {
    switch (priority) {
      case 'primary':
        return 'p-6';
      case 'secondary':
        return 'p-5';
      case 'tertiary':
        return 'p-4';
      default:
        return 'p-5';
    }
  };

  // Determine value text size based on priority
  const getValueSize = () => {
    switch (priority) {
      case 'primary':
        return 'text-3xl';
      case 'secondary':
        return 'text-2xl';
      case 'tertiary':
        return 'text-xl';
      default:
        return 'text-2xl';
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${getSizeClasses()} ${className} transition-all duration-300 hover:shadow-md cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className={`${getValueSize()} font-bold text-gray-900 dark:text-white mb-1`}>
        {value}
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {description}
      </p>
      
      {updatedAt && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Actualizado: {updatedAt}
        </div>
      )}
    </div>
  );
};

export default EnhancedMetricCard;