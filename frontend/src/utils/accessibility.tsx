// Accessibility Utilities
// RTL support, reduced motion, and comprehensive accessibility features

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// RTL language detection
const RTL_LANGUAGES = ['ar', 'fa', 'he', 'ur', 'ku', 'dv'];

export const isRTLLanguage = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language.split('-')[0].toLowerCase());
};

// Reduced Motion Detection Hook
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

// RTL Direction Hook
export const useDirection = () => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const currentLanguage = i18n.language || 'es';
    const newDirection = isRTLLanguage(currentLanguage) ? 'rtl' : 'ltr';
    
    setDirection(newDirection);
    document.documentElement.dir = newDirection;
    document.documentElement.lang = currentLanguage;
    
    // Update CSS custom properties for RTL support
    document.documentElement.style.setProperty('--direction-factor', newDirection === 'rtl' ? '-1' : '1');
    document.documentElement.style.setProperty('--text-align', newDirection === 'rtl' ? 'right' : 'left');
    document.documentElement.style.setProperty('--text-align-opposite', newDirection === 'rtl' ? 'left' : 'right');
    
  }, [i18n.language]);

  return direction;
};

// High Contrast Detection Hook
export const useHighContrast = (): boolean => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    // Check for high contrast preference
    const checkHighContrast = () => {
      if (window.matchMedia) {
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        setPrefersHighContrast(highContrastQuery.matches);
        
        const handleChange = (event: MediaQueryListEvent) => {
          setPrefersHighContrast(event.matches);
        };

        if (highContrastQuery.addEventListener) {
          highContrastQuery.addEventListener('change', handleChange);
          return () => highContrastQuery.removeEventListener('change', handleChange);
        } else {
          highContrastQuery.addListener(handleChange);
          return () => highContrastQuery.removeListener(handleChange);
        }
      }
    };

    const cleanup = checkHighContrast();
    return cleanup;
  }, []);

  return prefersHighContrast;
};

// Screen Reader Detection
export const useScreenReader = () => {
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Detect screen reader by checking for common screen reader indicators
    const checkScreenReader = () => {
      // Check for screen reader specific CSS or accessibility APIs
      const hasScreenReader = 
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.navigator.userAgent.includes('VoiceOver') ||
        window.speechSynthesis !== undefined;
        
      setIsScreenReader(hasScreenReader);
    };

    checkScreenReader();
    
    // Also check when focus changes (screen readers often change focus)
    let focusCount = 0;
    const handleFocus = () => {
      focusCount++;
      // If there are many rapid focus changes, likely a screen reader
      if (focusCount > 10) {
        setIsScreenReader(true);
      }
    };

    document.addEventListener('focusin', handleFocus);
    setTimeout(() => {
      focusCount = 0; // Reset counter after 5 seconds
    }, 5000);

    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }, []);

  return isScreenReader;
};

// Color Scheme Detection Hook
export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return colorScheme;
};

// Comprehensive Accessibility Context Hook
export const useAccessibility = () => {
  const direction = useDirection();
  const prefersReducedMotion = useReducedMotion();
  const prefersHighContrast = useHighContrast();
  const isScreenReader = useScreenReader();
  const colorScheme = useColorScheme();
  const { i18n } = useTranslation();

  const accessibilityProps = useMemo(() => ({
    // Direction and internationalization
    dir: direction,
    lang: i18n.language || 'es',
    
    // Animation preferences
    'data-reduced-motion': prefersReducedMotion,
    'data-motion': prefersReducedMotion ? 'reduce' : 'auto',
    
    // Visual preferences
    'data-high-contrast': prefersHighContrast,
    'data-color-scheme': colorScheme,
    
    // Screen reader support
    'data-screen-reader': isScreenReader,
    
    // CSS classes for styling
    className: [
      direction === 'rtl' ? 'rtl' : 'ltr',
      prefersReducedMotion ? 'reduced-motion' : 'motion-auto',
      prefersHighContrast ? 'high-contrast' : 'standard-contrast',
      colorScheme === 'dark' ? 'dark' : 'light',
      isScreenReader ? 'screen-reader' : 'visual'
    ].join(' ')
  }), [direction, prefersReducedMotion, prefersHighContrast, isScreenReader, colorScheme, i18n.language]);

  return {
    direction,
    prefersReducedMotion,
    prefersHighContrast,
    isScreenReader,
    colorScheme,
    language: i18n.language || 'es',
    isRTL: direction === 'rtl',
    accessibilityProps
  };
};

// Accessibility-aware animation utilities
export const getAnimationClasses = (
  baseClasses: string,
  reducedMotionClasses: string = '',
  prefersReducedMotion: boolean = false
): string => {
  if (prefersReducedMotion) {
    return `${baseClasses} ${reducedMotionClasses}`.trim();
  }
  return baseClasses;
};

// ARIA Live Region Hook for Dynamic Content
export const useAriaLive = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  useEffect(() => {
    if (!message) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Screen reader only
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Clean up after message is announced
    const cleanup = setTimeout(() => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    }, 1000);

    return () => {
      clearTimeout(cleanup);
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [message, politeness]);
};

// Focus Management Utilities
export const focusManagement = {
  // Trap focus within a container
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  // Return focus to previous element
  returnFocus: (previousElement: HTMLElement | null) => {
    return () => {
      if (previousElement && typeof previousElement.focus === 'function') {
        previousElement.focus();
      }
    };
  },

  // Focus first error in form
  focusFirstError: (container: HTMLElement) => {
    const errorElement = container.querySelector('[aria-invalid="true"], .error');
    if (errorElement && typeof (errorElement as HTMLElement).focus === 'function') {
      (errorElement as HTMLElement).focus();
    }
  }
};

// Skip Link Component for Keyboard Navigation
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const { prefersReducedMotion } = useAccessibility();
  
  return (
    <a
      href={href}
      className={getAnimationClasses(
        'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg transition-all',
        'focus:transition-none',
        prefersReducedMotion
      )}
      onFocus={(e) => {
        // Ensure skip link is visible when focused
        e.currentTarget.scrollIntoView({ block: 'nearest' });
      }}
    >
      {children}
    </a>
  );
};

// Accessible Button Component with enhanced keyboard support
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = ''
}) => {
  const { prefersReducedMotion, prefersHighContrast } = useAccessibility();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current';
  
  const highContrastClasses = prefersHighContrast ? 'border-2 border-current' : '';
  const reducedMotionClasses = prefersReducedMotion ? 'transition-none' : '';

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${highContrastClasses} ${reducedMotionClasses} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onKeyDown={(e) => {
        // Enhanced keyboard support
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) {
            onClick();
          }
        }
      }}
    >
      {children}
    </button>
  );
};

// RTL-aware spacing utilities
export const rtlSpacing = {
  marginLeft: (isRTL: boolean, value: string) => isRTL ? { marginRight: value } : { marginLeft: value },
  marginRight: (isRTL: boolean, value: string) => isRTL ? { marginLeft: value } : { marginRight: value },
  paddingLeft: (isRTL: boolean, value: string) => isRTL ? { paddingRight: value } : { paddingLeft: value },
  paddingRight: (isRTL: boolean, value: string) => isRTL ? { paddingLeft: value } : { paddingRight: value },
  textAlign: (isRTL: boolean) => isRTL ? { textAlign: 'right' as const } : { textAlign: 'left' as const },
  float: (isRTL: boolean, direction: 'left' | 'right') => {
    const floatDirection = direction === 'left' ? (isRTL ? 'right' : 'left') : (isRTL ? 'left' : 'right');
    return { float: floatDirection as const };
  }
};

// Chart accessibility enhancements
export const chartAccessibility = {
  // Generate accessible description for chart data
  generateChartDescription: (
    chartType: string,
    data: any[],
    language: string = 'es'
  ): string => {
    const translations = {
      es: {
        chart: 'gráfico',
        showing: 'mostrando',
        dataPoints: 'puntos de datos',
        highest: 'el más alto',
        lowest: 'el más bajo',
        average: 'promedio',
        total: 'total'
      },
      en: {
        chart: 'chart',
        showing: 'showing',
        dataPoints: 'data points',
        highest: 'highest',
        lowest: 'lowest',
        average: 'average',
        total: 'total'
      }
    };

    const t = translations[language as keyof typeof translations] || translations.en;
    
    if (!data || data.length === 0) {
      return `${chartType} ${t.chart} - Sin datos disponibles`;
    }

    const values = data.map(item => typeof item.value === 'number' ? item.value : item.amount || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);

    return `${chartType} ${t.chart} ${t.showing} ${data.length} ${t.dataPoints}. ${t.total}: ${total.toLocaleString()}, ${t.average}: ${average.toLocaleString()}, ${t.highest}: ${highest.toLocaleString()}, ${t.lowest}: ${lowest.toLocaleString()}.`;
  },

  // Create accessible table alternative for chart data
  createDataTable: (data: any[], headers: string[]): HTMLTableElement => {
    const table = document.createElement('table');
    table.className = 'sr-only'; // Screen reader only
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Datos del gráfico en formato de tabla');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      th.setAttribute('scope', 'col');
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    
    data.forEach(item => {
      const row = document.createElement('tr');
      Object.values(item).forEach(value => {
        const td = document.createElement('td');
        td.textContent = String(value);
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    return table;
  }
};

export default {
  useAccessibility,
  useReducedMotion,
  useDirection,
  useHighContrast,
  useScreenReader,
  useColorScheme,
  useAriaLive,
  focusManagement,
  rtlSpacing,
  chartAccessibility,
  getAnimationClasses,
  SkipLink,
  AccessibleButton
};