import React from 'react';
import { Link } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';
import ErrorBoundary from '../components/common/ErrorBoundary';

const NotFoundPage: React.FC = () => {
  // Add basic data integration for consistency (though not actively used)
  const { masterData } = useMasterData(new Date().getFullYear());

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">404</h1>
      <p className="text-2xl font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-4">Página no encontrada</p>
      <p className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-2">Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
};


// Wrap with error boundary for production safety
const NotFoundPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                      {error.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md"
                  >
                    Recargar
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <NotFoundPage />
    </ErrorBoundary>
  );
};

export default NotFoundPageWithErrorBoundary;
