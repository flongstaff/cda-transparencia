import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our translations
interface Translations {
  [key: string]: string | Translations;
}

// Define the context type
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

// Default translations
const defaultTranslations: Record<string, Translations> = {
  es: {
    contact: {
      title: 'Contáctanos',
      description: '¿Tienes preguntas sobre transparencia municipal? Estamos aquí para ayudarte.',
      info: {
        title: 'Información de Contacto',
        address: {
          title: 'Dirección',
          value: 'Calle Principal 123, Carmen de Areco, Buenos Aires'
        },
        phone: {
          title: 'Teléfono',
          value: '+54 11 1234-5678'
        },
        email: {
          title: 'Correo Electrónico',
          value: 'transparencia@carmendeareco.gob.ar'
        },
        hours: {
          title: 'Horario de Atención',
          value: 'Lunes a Viernes, 8:00 AM - 4:00 PM'
        }
      },
      follow: {
        title: 'Síguenos'
      },
      form: {
        title: 'Envíanos un Mensaje',
        name: 'Nombre',
        email: 'Correo Electrónico',
        subject: 'Asunto',
        message: 'Mensaje',
        send: 'Enviar Mensaje',
        success: '¡Gracias por tu mensaje! Te contactaremos pronto.'
      }
    }
  },
  en: {
    contact: {
      title: 'Contact Us',
      description: 'Do you have questions about municipal transparency? We are here to help you.',
      info: {
        title: 'Contact Information',
        address: {
          title: 'Address',
          value: 'Main Street 123, Carmen de Areco, Buenos Aires'
        },
        phone: {
          title: 'Phone',
          value: '+54 11 1234-5678'
        },
        email: {
          title: 'Email',
          value: 'transparency@carmendeareco.gob.ar'
        },
        hours: {
          title: 'Office Hours',
          value: 'Monday to Friday, 8:00 AM - 4:00 PM'
        }
      },
      follow: {
        title: 'Follow Us'
      },
      form: {
        title: 'Send Us a Message',
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        send: 'Send Message',
        success: 'Thank you for your message! We will contact you soon.'
      }
    }
  }
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('es');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: string | Translations = defaultTranslations[language];
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Translations)[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;