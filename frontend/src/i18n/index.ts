import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

// Language resources
const resources = {
  es: {
    translation: esTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

// i18n configuration
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Language detection options
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    
    // Fallback language
    fallbackLng: 'es',
    
    // Default namespace
    defaultNS: 'translation',
    
    // Key separator (set to false to use nested keys)
    keySeparator: '.',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format, lng) => {
        // Custom formatting for numbers and dates
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value);
        }
        
        if (format === 'number') {
          return new Intl.NumberFormat(lng, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(value);
        }
        
        if (format === 'percentage') {
          return new Intl.NumberFormat(lng, {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }).format(value / 100);
        }
        
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(new Date(value));
        }
        
        if (format === 'datetime') {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(value));
        }
        
        return value;
      },
    },
    
    // Development options
    debug: process.env.NODE_ENV === 'development',
    
    // React options
    react: {
      useSuspense: false, // We handle loading states manually
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    },
    
    // Load path for additional namespaces (if needed in the future)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Return objects for missing keys in development
    returnObjects: process.env.NODE_ENV === 'development',
    
    // Return empty string for missing keys in production
    returnEmptyString: process.env.NODE_ENV === 'production',
    
    // Pluralization
    pluralSeparator: '_',
    
    // Context separator
    contextSeparator: '_',
    
    // Post processing
    postProcess: ['interval'],
  });

// Export additional utilities
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18n.language || 'es';
};

export const getSupportedLanguages = () => {
  return Object.keys(resources);
};

export const isLanguageSupported = (lng: string) => {
  return lng in resources;
};

// Format number with locale
export const formatNumber = (value: number, locale?: string) => {
  const lng = locale || getCurrentLanguage();
  return new Intl.NumberFormat(lng, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format currency with locale
export const formatCurrency = (value: number, locale?: string, currency = 'ARS') => {
  const lng = locale || getCurrentLanguage();
  return new Intl.NumberFormat(lng, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage with locale
export const formatPercentage = (value: number, locale?: string) => {
  const lng = locale || getCurrentLanguage();
  return new Intl.NumberFormat(lng, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Format date with locale
export const formatDate = (value: string | Date, locale?: string) => {
  const lng = locale || getCurrentLanguage();
  return new Intl.DateTimeFormat(lng, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
};

// Format datetime with locale
export const formatDateTime = (value: string | Date, locale?: string) => {
  const lng = locale || getCurrentLanguage();
  return new Intl.DateTimeFormat(lng, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

// Compact number formatting (1K, 1M, etc.)
export const formatCompactNumber = (value: number, locale?: string) => {
  const lng = locale || getCurrentLanguage();
  
  if (typeof Intl.NumberFormat === 'function' && 'formatToParts' in Intl.NumberFormat.prototype) {
    try {
      return new Intl.NumberFormat(lng, {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    } catch (e) {
      // Fallback for unsupported browsers
    }
  }
  
  // Manual compact formatting for older browsers
  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return formatNumber(value, locale);
};

// Translation helper with typed keys
export const t = i18n.t.bind(i18n);

// Hook for language change detection
export const useLanguageChangeEffect = (callback: (language: string) => void) => {
  React.useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      callback(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [callback]);
};

// Type definitions for better TypeScript support
export type SupportedLanguage = keyof typeof resources;

export interface TranslationOptions {
  lng?: SupportedLanguage;
  interpolation?: Record<string, any>;
  defaultValue?: string;
  count?: number;
  context?: string;
}

export default i18n;