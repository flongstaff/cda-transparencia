import React from 'react';
import { createRoot } from 'react-dom/client';
import TestDataIntegration from './components/TestDataIntegration';

// Simple test page to verify data integration
const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prueba de Integración de Datos</h1>
          <p className="text-gray-600 mt-2">
            Esta página verifica que todos los datos históricos y fuentes estén correctamente integradas
          </p>
        </header>
        
        <main>
          <TestDataIntegration />
        </main>
      </div>
    </div>
  );
};

// Render the test page
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestPage />);
} else {
  console.error('No se encontró el contenedor #root');
}