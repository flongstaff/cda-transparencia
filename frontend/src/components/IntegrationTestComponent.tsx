/**
 * Integration Test Component
 * Component to run and display results of integration tests
 */

import React, { useState, useEffect } from 'react';
import { IntegrationTestSuite } from '../services/IntegrationTestSuite';

const IntegrationTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runIntegrationTests();
  }, []);

  const runIntegrationTests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await IntegrationTestSuite.runAllTests();
      setTestResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred during tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Running integration tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!testResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background p-4">
        <div className="text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">No test results available</p>
        </div>
      </div>
    );
  }

  const { passed, failed, results } = testResults;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tests de Integración</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Resultados de las pruebas de integración entre los diferentes servicios del portal de transparencia
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Resumen de Pruebas</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verificación del funcionamiento conjunto de servicios y componentes
              </p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <div className="text-center">
                <div className={`text-3xl font-bold ${passed > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                  {passed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Exitosos</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${failed > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                  {failed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fallidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {results.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${(passed / results.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>{passed} pruebas exitosas</span>
              <span>{failed} pruebas fallidas</span>
            </div>
          </div>
        </div>

        {/* Test Results List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles de Pruebas</h3>
          {results.map((test: any, index: number) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-dark-surface rounded-lg shadow p-5 border ${
                test.status === 'pass' 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  test.status === 'pass' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {test.status === 'pass' ? '✓' : '✕'}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{test.name}</h4>
                  <p className={`mt-1 text-sm ${
                    test.status === 'pass' ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {test.details}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Run Tests Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={runIntegrationTests}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-300 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Volver a ejecutar pruebas
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestComponent;