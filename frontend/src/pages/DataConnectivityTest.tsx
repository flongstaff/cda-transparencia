/**
 * Data Connectivity Test Page
 * Tests all data services and displays current system status
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Database, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataConnectivityTest from '../components/debug/DataConnectivityTest';

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

export default DataConnectivityTestPage;