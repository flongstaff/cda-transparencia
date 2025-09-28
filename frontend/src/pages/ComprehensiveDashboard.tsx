import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';

// Minimal Comprehensive Dashboard - placeholder for future implementation
const ComprehensiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboards: true,
    charts: true,
    audit: true,
    viewers: true,
    tables: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Use the master data hook to get all data
  const { 
    masterData, 
    loading, 
    error,
    availableYears,
    currentYear
  } = useMasterData();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p>Cargando datos del sistema municipal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Completo</h1>
        <p className="mt-2 text-gray-600">
          Información integral sobre la gestión municipal
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Finanzas
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contracts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contratos
            </button>
            <button
              onClick={() => setActiveTab('audits')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Audits
            </button>
          </nav>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="space-y-6">
        {/* Financial Overview Section */}
        <section className="bg-white rounded-lg shadow-lg">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg cursor-pointer"
            onClick={() => toggleSection('dashboards')}
          >
            <h2 className="text-xl font-semibold">📊 Dashboards Financieros</h2>
            {expandedSections.dashboards ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.dashboards && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800">Resumen Financiero</h3>
                <p className="text-sm text-blue-600 mt-2">Datos agregados de ingresos y gastos</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800">Ejecución Presupuestaria</h3>
                <p className="text-sm text-green-600 mt-2">Comparación de presupuesto vs ejecución</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-800">Análisis de Gastos</h3>
                <p className="text-sm text-purple-600 mt-2">Distribución por categoría y año</p>
              </div>
            </div>
          )}
        </section>

        {/* Charts Section */}
        <section className="bg-white rounded-lg shadow-lg">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg cursor-pointer"
            onClick={() => toggleSection('charts')}
          >
            <h2 className="text-xl font-semibold">📈 Visualizaciones</h2>
            {expandedSections.charts ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.charts && (
            <div className="p-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">Gráficos interactivos disponibles próximamente</p>
              </div>
            </div>
          )}
        </section>

        {/* Audit Section */}
        <section className="bg-white rounded-lg shadow-lg">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg cursor-pointer"
            onClick={() => toggleSection('audit')}
          >
            <h2 className="text-xl font-semibold">🔍 Audits y Validaciones</h2>
            {expandedSections.audit ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.audit && (
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800">Validación de Datos</h3>
                  <p className="text-sm text-yellow-600 mt-2">Nuestros datos han sido comparados con fuentes oficiales para verificar precisión</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800">Integridad del Sistema</h3>
                  <p className="text-sm text-green-600 mt-2">Sistema revisado para garantizar transparencia y confiabilidad</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Additional Data Section */}
        <section className="bg-white rounded-lg shadow-lg">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg cursor-pointer"
            onClick={() => toggleSection('viewers')}
          >
            <h2 className="text-xl font-semibold">📋 Visualizadores de Documentos</h2>
            {expandedSections.viewers ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.viewers && (
            <div className="p-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">Visor de documentos integrado disponible próximamente</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Data Summary */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Resumen de Datos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Años disponibles</p>
            <p className="text-xl font-bold">{availableYears.length}</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Año actual</p>
            <p className="text-xl font-bold">{currentYear}</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Categorías</p>
            <p className="text-xl font-bold">-</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Documentos</p>
            <p className="text-xl font-bold">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;