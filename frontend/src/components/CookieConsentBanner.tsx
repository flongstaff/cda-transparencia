/**
 * CookieConsentBanner Component
 * Displays cookie consent banner following AAIP guidelines
 */

import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield } from 'lucide-react';

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    
    setPreferences(allPreferences);
    localStorage.setItem('cookie-consent', JSON.stringify(allPreferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
    
    // Reload to apply consent
    window.location.reload();
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    
    setPreferences(minimalPreferences);
    localStorage.setItem('cookie-consent', JSON.stringify(minimalPreferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleCustomize = () => {
    // In a real implementation, this would open a customization modal
    // For now, we'll just accept necessary cookies only
    handleRejectAll();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start">
            <Cookie className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                Uso de Cookies
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Utilizamos cookies técnicamente necesarias para el funcionamiento del portal. 
                No utilizamos cookies de seguimiento o publicidad. 
                Al continuar navegando, acepta nuestro uso de cookies.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                  Necesarias: Siempre activas
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                  Analíticas: No utilizadas
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                  Marketing: No utilizadas
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Aceptar todas
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Rechazar todas
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomize}
                className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface-alt text-sm font-medium transition-colors whitespace-nowrap"
              >
                Personalizar
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border text-xs text-gray-500 dark:text-gray-400">
          <p>
            Esta política de cookies se adhiere a las directrices de la Agencia de Acceso a la Información Pública (AAIP) 
            y la Ley 25.326 de Protección de Datos Personales. 
            El portal solo utiliza cookies técnicamente necesarias para su funcionamiento.
          </p>
          <p className="mt-1">
            Para más información, consulte nuestra <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;