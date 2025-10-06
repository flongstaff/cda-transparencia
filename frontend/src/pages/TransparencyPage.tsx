import React from 'react';
import MainDataDisplay from '../components/MainDataDisplay';

const TransparencyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Portal de Transparencia</h1>
            <p className="mt-2 text-gray-600">
              Acceso a datos públicos del Municipio de Carmen de Areco
            </p>
          </div>
        </div>
      </div>
      
      <main>
        <MainDataDisplay />
      </main>
    </div>
  );
};

export default TransparencyPage;