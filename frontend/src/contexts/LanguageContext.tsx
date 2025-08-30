import React, { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translation function that just returns default Spanish text or the key
const translations: Record<string, string> = {
  'header.title': 'Portal de Transparencia',
  'header.subtitle': 'Carmen de Areco',
  'home.title': 'Portal de Transparencia',
  'home.description': 'Acceso a información pública municipal',
  'header.nav.home': 'Inicio',
  'header.nav.about': 'Acerca de',
  'home.viewMore': 'Ver más'
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback context to prevent crashes
    return {
      language: 'es',
      setLanguage: () => {},
      t: (key: string) => translations[key] || key
    };
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const t = (key: string): string => {
    return translations[key] || key;
  };

  const value = {
    language: 'es',
    setLanguage: () => {}, // No-op function
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};