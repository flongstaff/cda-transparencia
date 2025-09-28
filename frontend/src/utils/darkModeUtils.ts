/**
 * Comprehensive dark mode utilities for consistent theming across the application
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const lightTheme: ThemeColors = {
  primary: 'rgb(37 99 235)', // blue-600
  secondary: 'rgb(99 102 241)', // indigo-500
  accent: 'rgb(14 165 233)', // sky-500
  background: 'rgb(255 255 255)', // white
  surface: 'rgb(249 250 251)', // gray-50
  border: 'rgb(229 231 235)', // gray-200
  text: {
    primary: 'rgb(17 24 39)', // gray-900
    secondary: 'rgb(75 85 99)', // gray-600
    tertiary: 'rgb(107 114 128)', // gray-500
  },
  status: {
    success: 'rgb(34 197 94)', // green-500
    warning: 'rgb(245 158 11)', // amber-500
    error: 'rgb(239 68 68)', // red-500
    info: 'rgb(59 130 246)', // blue-500
  },
};

export const darkTheme: ThemeColors = {
  primary: 'rgb(59 130 246)', // blue-500
  secondary: 'rgb(129 140 248)', // indigo-400
  accent: 'rgb(56 189 248)', // sky-400
  background: 'rgb(17 24 39)', // gray-900
  surface: 'rgb(31 41 55)', // gray-800
  border: 'rgb(55 65 81)', // gray-700
  text: {
    primary: 'rgb(243 244 246)', // gray-100
    secondary: 'rgb(156 163 175)', // gray-400
    tertiary: 'rgb(107 114 128)', // gray-500
  },
  status: {
    success: 'rgb(34 197 94)', // green-500
    warning: 'rgb(245 158 11)', // amber-500
    error: 'rgb(239 68 68)', // red-500
    info: 'rgb(59 130 246)', // blue-500
  },
};

/**
 * Get theme-aware classes for common UI elements
 */
export const getThemeClasses = {
  // Card variants
  card: {
    base: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/25',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600',
    surface: 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50',
  },

  // Text variants
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    tertiary: 'text-gray-500 dark:text-gray-500',
    muted: 'text-gray-400 dark:text-gray-600',
  },

  // Input variants
  input: {
    base: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
    focused: 'ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400',
    error: 'border-red-500 dark:border-red-400 ring-red-500 dark:ring-red-400',
  },

  // Button variants
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    outlined: 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  },

  // Status variants
  status: {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  },

  // Icon containers
  iconContainer: {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  },

  // Gradient backgrounds
  gradient: {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    orange: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    purple: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    gray: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50',
  },

  // Interactive states
  interactive: {
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
    active: 'active:bg-gray-100 dark:active:bg-gray-700',
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },

  // Navigation elements
  nav: {
    link: 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400',
    activeLink: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    dropdown: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/25',
  },

  // Modal and overlay elements
  overlay: {
    backdrop: 'bg-black/50 dark:bg-black/70',
    modal: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    header: 'border-b border-gray-200 dark:border-gray-700',
    footer: 'border-t border-gray-200 dark:border-gray-700',
  },
};

/**
 * Get CSS custom properties for dynamic theming
 */
export const getCSSProperties = (theme: ThemeColors) => ({
  '--color-primary': theme.primary,
  '--color-secondary': theme.secondary,
  '--color-accent': theme.accent,
  '--color-background': theme.background,
  '--color-surface': theme.surface,
  '--color-border': theme.border,
  '--color-text-primary': theme.text.primary,
  '--color-text-secondary': theme.text.secondary,
  '--color-text-tertiary': theme.text.tertiary,
  '--color-success': theme.status.success,
  '--color-warning': theme.status.warning,
  '--color-error': theme.status.error,
  '--color-info': theme.status.info,
});

/**
 * Utility function to get theme-aware color based on current mode
 */
export const getThemeColor = (lightColor: string, darkColor: string, isDark: boolean) => {
  return isDark ? darkColor : lightColor;
};

/**
 * Helper to combine multiple theme classes
 */
export const combineThemeClasses = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get responsive breakpoint-aware classes
 */
export const getResponsiveClasses = {
  searchBar: {
    mobile: 'w-full',
    tablet: 'md:w-96',
    desktop: 'lg:w-[500px]',
    large: 'xl:w-[600px]',
  },
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3',
    large: 'xl:grid-cols-4',
  },
  spacing: {
    mobile: 'p-4',
    tablet: 'md:p-6',
    desktop: 'lg:p-8',
  },
};

/**
 * Animation classes for enhanced UX
 */
export const getAnimationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideDown: 'animate-in slide-in-from-top-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
};

export default {
  lightTheme,
  darkTheme,
  getThemeClasses,
  getCSSProperties,
  getThemeColor,
  combineThemeClasses,
  getResponsiveClasses,
  getAnimationClasses,
};