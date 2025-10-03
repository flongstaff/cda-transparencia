/**
 * AccessibilityToolbar Component - Ultra Simple Version
 * Provides basic accessibility enhancement tools
 */

import React, { useState, useEffect } from 'react';

const AccessibilityToolbar: React.FC = () => {
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<number>(100);

  // Apply high contrast class to document
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', JSON.stringify(highContrast));
  }, [highContrast]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    localStorage.setItem('accessibility-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Apply text size to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}%`;
    localStorage.setItem('accessibility-text-size', JSON.stringify(textSize));
  }, [textSize]);

  const increaseTextSize = () => {
    if (textSize < 150) {
      setTextSize(prev => prev + 10);
    }
  };

  const decreaseTextSize = () => {
    if (textSize > 80) {
      setTextSize(prev => prev - 10);
    }
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setDarkMode(false);
    setTextSize(100);
  };

  return (
    <div className="mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <div>
            <button
              className="flex items-center text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 text-sm font-medium"
              aria-label="Herramientas de accesibilidad"
            >
              <span className="mr-2">⚙️</span>
              Accesibilidad
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-1.5 rounded ${highContrast ? 'bg-blue-600 text-white' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-pressed={highContrast}
              title={highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
              aria-label={highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
            >
              {highContrast ? <span className="text-lg">☀️</span> : <span className="text-lg">🌓</span>}
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded ${darkMode ? 'bg-blue-600 text-white' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-pressed={darkMode}
              title={darkMode ? "Desactivar modo oscuro" : "Activar modo oscuro"}
              aria-label={darkMode ? "Desactivar modo oscuro" : "Activar modo oscuro"}
            >
              {darkMode ? <span className="text-lg">🌙</span> : <span className="text-lg">☀️</span>}
            </button>
            
            <button
              onClick={decreaseTextSize}
              disabled={textSize <= 80}
              className={`p-1.5 rounded ${textSize <= 80 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-label="Reducir tamaño de texto"
            >
              <span className="text-lg">➖</span>
            </button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300 mx-1 min-w-[36px] text-center">
              {textSize}%
            </span>
            
            <button
              onClick={increaseTextSize}
              disabled={textSize >= 150}
              className={`p-1.5 rounded ${textSize >= 150 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-alt'}`}
              aria-label="Aumentar tamaño de texto"
            >
              <span className="text-lg">➕</span>
            </button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="highContrastToggle"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-describedby="highContrastDescription"
              />
              <label 
                htmlFor="highContrastToggle" 
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Modo de alto contraste
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkModeToggle"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-describedby="darkModeDescription"
              />
              <label 
                htmlFor="darkModeToggle" 
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Modo oscuro
              </label>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                onClick={resetAccessibility}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                aria-label="Restablecer configuración de accesibilidad"
              >
                Restablecer
              </button>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
              <span className="mr-2">📘</span>
              Consejos de Accesibilidad
            </h4>
            <ul className="mt-2 text-xs text-blue-700 dark:text-blue-300 list-disc pl-5 space-y-1">
              <li>Use el teclado para navegar: Tab y Shift+Tab para moverse entre elementos</li>
              <li>Los elementos interactivos tienen indicadores de foco visibles</li>
              <li>El contenido se puede ampliar hasta 200% sin pérdida de funcionalidad</li>
              <li>El contraste de color cumple con las pautas WCAG 2.1 AA</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-center text-xs text-green-700 dark:text-green-300">
          <span className="mr-1">🛡️</span>
          <span>Este sitio cumple con los estándares WCAG 2.1 AA y las directrices de la AAIP</span>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;