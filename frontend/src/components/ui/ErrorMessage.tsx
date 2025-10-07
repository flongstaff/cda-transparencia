import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  retryText?: string;
  goHome?: () => void;
  showHomeButton?: boolean;
  details?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Ocurrió un error al cargar los datos',
  retry,
  retryText = 'Reintentar',
  goHome,
  showHomeButton = true,
  details
}) => {
  const handleGoHome = () => {
    if (goHome) {
      goHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 max-w-2xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            No se pudieron cargar los datos
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {message}
          </p>
          
          {(details || process.env.NODE_ENV === 'development') && (
            <details className="mb-4">
              <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
                Detalles técnicos
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded">
                {details || 'No hay detalles adicionales disponibles'}
              </pre>
            </details>
          )}
          
          <div className="flex flex-wrap gap-3">
            {retry && (
              <button
                onClick={retry}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryText}
              </button>
            )}
            
            {showHomeButton && (
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-red-700 text-gray-700 dark:text-red-300 rounded-lg hover:bg-gray-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;