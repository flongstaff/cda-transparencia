import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import FlaggedDashboard from '../components/dashboard/FlaggedDashboard';
import YearSelector from '../components/navigation/YearSelector';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useMasterData } from '../hooks/useMasterData';

/**
 * Flagged Analysis Page
 * Displays the flagged dashboard with year selection
 */

const FlaggedAnalysisPage: React.FC = () => {
  const { data, loading, error } = useMasterData();

  const { state, setYear } = useData();
  const [selectedYear, setSelectedYear] = useState<number>(state.selectedYear || new Date().getFullYear());

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setYear(year);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Análisis de Alertas Financieras
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Identificación de posibles irregularidades y áreas de mejora en la gestión financiera
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <YearSelector 
                onYearChange={handleYearChange} 
                currentYear={selectedYear}
                availableYears={[2019, 2020, 2021, 2022, 2023, 2024, 2025]}
              />
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                🔴 Alta: Requiere atención inmediata
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                🟡 Media: Requiere seguimiento
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🟢 Baja: Observación general
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Alertas Detectadas para {selectedYear}
          </h2>
          
          <FlaggedDashboard selectedYear={selectedYear} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Metodología de Detección de Alertas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">🔍 Ejecución Presupuestaria</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Monitoreo de diferencias significativas entre presupuesto planificado y ejecutado
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">🏢 Contrataciones Públicas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Detección de concentraciones temporales o proveedores repetidos en licitaciones
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">👥 Perspectiva de Género</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Evaluación del cumplimiento real del presupuesto con perspectiva de género
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const FlaggedAnalysisPageWithErrorBoundary: React.FC = () => {
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
      <FlaggedAnalysisPage />
    </ErrorBoundary>
  );
};

export default FlaggedAnalysisPageWithErrorBoundary;