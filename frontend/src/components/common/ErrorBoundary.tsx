/**
 * Error Boundary Component
 * Component to catch JavaScript errors anywhere in the child component tree
 */

import React, { ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home, Github } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo: ErrorInfo }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleReload = (): void => {
    // Reload the page
    window.location.reload();
  };

  handleGoHome = (): void => {
    // Navigate to home
    window.location.href = '/';
  };

  handleReportIssue = (): _void => {
    // Open GitHub issues
    window.open('https://github.com/flongstaff/cda-transparencia/issues', '_blank');
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Algo salió mal</h2>
                  <p className="text-red-700">Se ha producido un error inesperado en la aplicación</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Detalles del error:</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-mono">
                    {this.state.error?.message || 'Error desconocido'}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-3">
                      <summary className="text-sm text-gray-500 cursor-pointer">
                        Pila de seguimiento
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar página
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir a inicio
                </button>
                
                <button
                  onClick={this.handleReportIssue}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center justify-center"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Reportar problema
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Si el problema persiste, por favor reporte el error en nuestro repositorio de GitHub 
                  incluyendo los detalles mostrados arriba.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;