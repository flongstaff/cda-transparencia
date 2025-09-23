/**
 * GitHub Resources Test Page
 * Test page to verify GitHub resource loading with real resources
 */

import React from 'react';
import GitHubResourceTest from '../components/testing/GitHubResourceTest';

const GitHubResourcesTestPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white">Prueba de Recursos de GitHub</h1>
          <p className="text-blue-100 mt-2">
            Verificación de carga de recursos desde el repositorio de GitHub
          </p>
        </div>
        
        <div className="p-6">
          <GitHubResourceTest />
        </div>
      </div>
    </div>
  );
};

export default GitHubResourcesTestPage;