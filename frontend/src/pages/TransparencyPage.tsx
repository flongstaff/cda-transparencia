// TransparencyPage.tsx
// Main transparency page component for Carmen de Areco Transparency Portal

import React, { useState } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import ErrorBoundary from '../components/common/ErrorBoundary';

const TransparencyPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2019);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  return (
    <div className="transparency-page">
      <header className="page-header">
        <h1>Portal de Transparencia del Municipio de Carmen de Areco</h1>
        <div className="year-selector">
          <label htmlFor="year-select">Seleccionar Año:</label>
          <select id="year-select" value={selectedYear} onChange={handleYearChange}>
            <option value={2019}>2019</option>
            <option value={2020}>2020</option>
            <option value={2021}>2021</option>
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </header>

      <main className="page-main">
        <AnalyticsDashboard />
      </main>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} Municipio de Carmen de Areco - Todos los derechos reservados</p>
        <p>Los datos presentados son extraídos directamente de los informes oficiales del municipio</p>
      </footer>
    </div>
  );
};


// Wrap with error boundary for production safety
const TransparencyPageWithErrorBoundary: React.FC = () => {
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
      <TransparencyPage />
    </ErrorBoundary>
  );
};

export default TransparencyPageWithErrorBoundary;