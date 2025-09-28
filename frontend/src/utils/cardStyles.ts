/**
 * Utility functions for consistent card styling with dark mode support
 */

import { clsx } from 'clsx';

export interface CardStyleOptions {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

export const getCardClasses = (options: CardStyleOptions = {}) => {
  const {
    variant = 'default',
    size = 'md',
    interactive = false,
    color = 'gray'
  } = options;

  // Base classes for all cards with proper dark mode support
  const baseClasses = [
    'rounded-xl',
    'border',
    'transition-all',
    'duration-300',
    'bg-white',
    'dark:bg-gray-800'
  ];

  // Variant styles
  const variantClasses = {
    default: [
      'shadow-sm',
      'border-gray-200',
      'dark:border-gray-700'
    ],
    elevated: [
      'shadow-lg',
      'border-gray-200',
      'dark:border-gray-700',
      'hover:shadow-xl'
    ],
    outlined: [
      'shadow-none',
      'border-2',
      'border-gray-300',
      'dark:border-gray-600'
    ],
    gradient: [
      'shadow-lg',
      'border-0',
      'bg-gradient-to-br',
      'from-white',
      'to-gray-50',
      'dark:from-gray-800',
      'dark:to-gray-900'
    ]
  };

  // Size classes
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  // Interactive classes
  const interactiveClasses = interactive ? [
    'cursor-pointer',
    'hover:shadow-md',
    'hover:scale-[1.02]',
    'active:scale-[0.98]',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    'dark:focus:ring-offset-gray-800'
  ] : [];

  // Color accent classes
  const colorClasses = {
    blue: 'border-l-4 border-l-blue-500 dark:border-l-blue-400',
    green: 'border-l-4 border-l-green-500 dark:border-l-green-400',
    orange: 'border-l-4 border-l-orange-500 dark:border-l-orange-400',
    red: 'border-l-4 border-l-red-500 dark:border-l-red-400',
    purple: 'border-l-4 border-l-purple-500 dark:border-l-purple-400',
    gray: ''
  };

  return clsx([
    ...baseClasses,
    ...variantClasses[variant],
    sizeClasses[size],
    ...interactiveClasses,
    colorClasses[color]
  ]);
};

export const getTextClasses = (type: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
  const textClasses = {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    tertiary: 'text-gray-500 dark:text-gray-500'
  };

  return textClasses[type];
};

export const getIconContainerClasses = (color: string = 'blue') => {
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  };

  return clsx([
    'p-2',
    'rounded-lg',
    colorMap[color as keyof typeof colorMap] || colorMap.gray
  ]);
};

export const getGradientBackgroundClasses = (color: string = 'blue') => {
  const gradientMap = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700/30',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700/30',
    orange: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700/30',
    red: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700/30',
    purple: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700/30',
    gray: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700/30'
  };

  return gradientMap[color as keyof typeof gradientMap] || gradientMap.gray;
};

export const getSectionClasses = (color: string = 'blue') => {
  return clsx([
    'rounded-xl',
    'p-6',
    'border',
    getGradientBackgroundClasses(color)
  ]);
};

export const getMetricClasses = () => {
  return 'bg-white dark:bg-gray-700/50 rounded-lg p-4';
};

export const getLoadingClasses = () => {
  return clsx([
    getCardClasses({ variant: 'elevated', size: 'lg' }),
    'flex',
    'items-center',
    'justify-center',
    'min-h-[200px]'
  ]);
};

export const getErrorClasses = () => {
  return clsx([
    getCardClasses({ variant: 'elevated', size: 'lg', color: 'red' }),
    'border-red-200',
    'dark:border-red-700'
  ]);
};