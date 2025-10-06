/**
 * Data Connectivity Test Page
 * Tests all data services and displays current system status
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Database, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataConnectivityTest from '@components/debug/DataConnectivityTest';
import ErrorBoundary from '@components/common/ErrorBoundary';

const DataConnectivityTestPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Test de Conectividad de Datos - Portal de Transparencia</title>
        <meta name="description" content="Página de prueba para verificar el funcionamiento de todos los servicios de datos" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            to="/completo"
            className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al Dashboard
          </Link>
        </div>

        <div className="flex items-center">
          <Database className="w-8 h-8 text-blue-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
              Test de Conectividad de Datos
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary text-lg">
              Verificación del funcionamiento de todos los servicios de datos del portal
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ¿Qué se está probando?
        </h2>
        <ul className="text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Servicio de Datos Maestros (useMasterData)</li>
          <li>• Servicio Multi-Año (useMultiYearData)</li>
          <li>• Servicio de Datos Unificados (useUnifiedData)</li>
          <li>• Acceso a archivos CSV consolidados</li>
          <li>• Acceso a APIs JSON</li>
        </ul>
      </div>

      {/* Test Component */}
      <DataConnectivityTest />

      {/* Additional Info */}
      <div className="mt-8 bg-gray-50 dark:bg-dark-surface-alt rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-3">
          Interpretación de Resultados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3"></div>
            <div>
              <strong className="text-green-700 dark:text-green-400">Éxito:</strong>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                El servicio está funcionando correctamente y devolviendo datos.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3"></div>
            <div>
              <strong className="text-red-700 dark:text-red-400">Error:</strong>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                El servicio tiene problemas o no puede acceder a los datos.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 mr-3"></div>
            <div>
              <strong className="text-yellow-700 dark:text-yellow-400">Cargando:</strong>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                El servicio está procesando la solicitud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const DataConnectivityTestPageWithErrorBoundary: React.FC = () => {
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
      <DataConnectivityTestPage />
    </ErrorBoundary>
  );
};

export default DataConnectivityTestPageWithErrorBoundary;