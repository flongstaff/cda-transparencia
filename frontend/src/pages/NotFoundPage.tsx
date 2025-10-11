import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  // Add basic data integration for consistency (though not actively used)
  const { masterData } = useMasterData(new Date().getFullYear());
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if we're on a custom domain and on the wrong path
    const isCustomDomain = window.location.hostname !== 'flongstaff.github.io' && 
                          window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';
    
    // If we're on a custom domain but the path starts with /cda-transparencia/, redirect to the root equivalent
    if (isCustomDomain && window.location.pathname.startsWith('/cda-transparencia/')) {
      setIsRedirecting(true);
      // Redirect to the correct path on custom domain
      const newPath = window.location.pathname.replace('/cda-transparencia/', '/');
      const fullUrl = `${window.location.origin}${newPath}${window.location.search}${window.location.hash}`;
      console.log(`[NotFoundPage] Redirecting from GitHub Pages path to custom domain path: ${fullUrl}`);
      window.location.replace(fullUrl);
    }
    
    // If we're on GitHub Pages and on root path, redirect to the subpath
    if (!isCustomDomain && window.location.pathname === '/') {
      const githubPagesPath = '/cda-transparencia/';
      console.log(`[NotFoundPage] Redirecting to GitHub Pages path: ${githubPagesPath}`);
      window.location.replace(githubPagesPath);
    }
    
    // When landing on the 404 page, we want to ensure back navigation goes to a valid page
    // Add an event listener for popstate to handle back button
    const handlePopState = () => {
      // If user tries to navigate back from the 404 page, 
      // go to the home page instead to prevent DNS issues
      navigate('/');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  // If we're redirecting, show a simple message
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">Redirigiendo...</h1>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          Redirigiendo a la versión correcta del sitio
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-dark-text-primary mb-4">404</h1>
      <p className="text-2xl font-medium text-gray-600 dark:text-dark-text-secondary mt-4">
        Página no encontrada
      </p>
      <p className="text-gray-500 dark:text-dark-text-tertiary mt-2 max-w-md">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleGoHome}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>
        
        <button 
          onClick={handleReload}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Recargar página
        </button>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-dark-text-tertiary">
        <p>¿Llegaste aquí desde un enlace externo? Por favor repórtalo para que podamos corregirlo.</p>
      </div>
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
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Recargar
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Volver al Inicio
                  </Link>
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