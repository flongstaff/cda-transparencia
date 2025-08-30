import React, { useState } from 'react';
import PowerBIFinancialDashboard from '../components/powerbi/PowerBIFinancialDashboard';
import FinancialMindMap from '../components/powerbi/FinancialMindMap';
import DataComparisonDashboard from '../components/powerbi/DataComparisonDashboard';

const ComprehensiveFinancialAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mindmap');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
                📊 Análisis Financiero Completo
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Visualización avanzada de datos financieros del municipio de Carmen de Areco
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {new Date().toLocaleDateString('es-AR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'mindmap', label: 'Mapa Financiero', icon: '🧠' },
              { id: 'powerbi', label: 'Dashboard Power BI', icon: '📊' },
              { id: 'comparison', label: 'Comparación de Datos', icon: '🔄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'mindmap' && (
          <div>
            <FinancialMindMap />
          </div>
        )}

        {activeTab === 'powerbi' && (
          <div>
            <PowerBIFinancialDashboard />
          </div>
        )}

        {activeTab === 'comparison' && (
          <div>
            <DataComparisonDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveFinancialAnalysis;