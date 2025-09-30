import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import FlaggedDashboard from '../components/dashboard/FlaggedDashboard';
import YearSelector from '../components/navigation/YearSelector';

/**
 * Flagged Analysis Page
 * Displays the flagged dashboard with year selection
 */

const FlaggedAnalysisPage: React.FC = () => {
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

export default FlaggedAnalysisPage;