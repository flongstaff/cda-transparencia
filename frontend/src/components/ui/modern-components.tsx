import React, { createContext, useContext, useState } from 'react';
import { motion } from 'framer-motion';

interface ModernTabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const ModernTabsContext = createContext<ModernTabsContextValue | undefined>(undefined);

interface ModernTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'boxed' | 'underlined';
}

export const ModernTabs: React.FC<ModernTabsProps> = ({ 
  value, 
  onValueChange, 
  children, 
  className = '',
  variant = 'default'
}) => {
  return (
    <ModernTabsContext.Provider value={{ value, onValueChange }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </ModernTabsContext.Provider>
  );
};

interface ModernTabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'boxed' | 'underlined';
}

export const ModernTabsList: React.FC<ModernTabsListProps> = ({ 
  children, 
  className = '',
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'flex space-x-1 border-b border-gray-200',
    boxed: 'flex space-x-1',
    underlined: 'flex space-x-1 border-b border-gray-200'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

interface ModernTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const ModernTabsTrigger: React.FC<ModernTabsTriggerProps> = ({ 
  value, 
  children, 
  className = '',
  icon 
}) => {
  const context = useContext(ModernTabsContext);
  if (!context) throw new Error('ModernTabsTrigger must be used within ModernTabs');

  const isActive = context.value === value;

  const baseClasses = "px-4 py-3 text-sm font-medium flex items-center transition-colors whitespace-nowrap";
  
  const variantClasses = isActive 
    ? 'text-blue-600 border-b-2 border-blue-600' 
    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300';
  
  const activeBoxedClasses = isActive 
    ? 'bg-blue-600 text-white' 
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  
  const activeUnderlinedClasses = isActive 
    ? 'text-blue-600 border-b-2 border-blue-600' 
    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300';

  const finalClasses = `relative ${baseClasses} ${
    isActive ? variantClasses : 'border-transparent'
  } ${className}`;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={finalClasses}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

interface ModernTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const ModernTabsContent: React.FC<ModernTabsContentProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const context = useContext(ModernTabsContext);
  if (!context) throw new Error('ModernTabsContent must be used within ModernTabs');

  if (context.value !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Modern Card Component
interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className = '',
  title,
  description,
  icon,
  footer 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {(title || description) && (
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-start">
            {icon && <div className="flex-shrink-0 mr-4">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
          </div>
        </div>
      )}
      <div className={`p-6 ${!title && !description ? '' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

// Modern Stat Card Component
interface ModernStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  iconColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  className?: string;
}

export const ModernStatCard: React.FC<ModernStatCardProps> = ({ 
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'blue',
  trend,
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[iconColor]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% {trend.label}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// Modern Chart Container
interface ModernChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  height?: number | string;
  className?: string;
}

export const ModernChartContainer: React.FC<ModernChartContainerProps> = ({ 
  title,
  description,
  children,
  icon,
  height = 'auto',
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          {icon && <div className="mr-3">{icon}</div>}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6" style={{ height }}>
        {children}
      </div>
    </motion.div>
  );
};