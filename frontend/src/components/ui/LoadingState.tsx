import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  retry?: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  type?: 'spinner' | 'skeleton' | 'full-page';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  retry,
  children,
  size = 'md',
  message = 'Cargando datos...',
  type = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (isLoading) {
    if (type === 'full-page') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
          <Loader2 className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`} />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`} />
        {message && (
          <span className="ml-2 text-gray-600 dark:text-gray-400">{message}</span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg 
              className="w-5 h-5 text-red-600 dark:text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">
              Error al cargar datos
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm mb-3">
              {error}
            </p>
            {retry && (
              <button
                onClick={retry}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingState;