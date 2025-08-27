import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface SafeComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorMessage?: string;
}

const SafeComponent: React.FC<SafeComponentProps> = ({ 
  children, 
  fallback,
  errorMessage = "Lo sentimos, ocurrió un error al cargar este componente. Puedes intentar recargar la página o continuar navegando en otras secciones del portal."
}) => {
  const defaultFallback = (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error al cargar el contenido
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {errorMessage}
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Recargar página
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default SafeComponent;