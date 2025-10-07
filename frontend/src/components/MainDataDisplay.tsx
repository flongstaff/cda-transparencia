import React from 'react';
import { useMainData } from '../hooks/useMainData';
import { BarChart3, PieChart, Database, FileText, TrendingUp } from 'lucide-react';
import { ChartContainer } from './common/ChartContainer';
import UnifiedChart from './charts/UnifiedChart';

import TimeSeriesChart from './charts/TimeSeriesChart';

const MainDataDisplay: React.FC = () => {
  const { data, loading, error } = useMainData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 ml-2">Error</h3>
        </div>
        <div className="mt-2 text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800 ml-2">Sin datos</h3>
        </div>
        <div className="mt-2 text-yellow-700">
          <p>No se pudieron cargar los datos principales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
          <p className="mt-1 text-gray-600">{data.description}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>Publicado por: {data.publisher.name}</span>
            <span className="mx-2">•</span>
            <span>Licencia: {data.license}</span>
          </div>
        </div>
        
        {/* Data Visualization Charts */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Visualización de Datos
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Dataset Distribution Chart */}
            <ChartContainer
              title="Distribución por Tema"
              description="Clasificación de conjuntos de datos por tema principal"
              icon={PieChart}
              height={350}
            >
              <UnifiedChart
                type="dataset_themes"
                year={new Date().getFullYear()}
                height={300}
              />
            </ChartContainer>
            
            {/* Data Format Distribution Chart */}
            <ChartContainer
              title="Formatos de Datos"
              description="Distribución por formato de archivo"
              icon={FileText}
              height={350}
            >
              <UnifiedChart
                type="data_formats"
                year={new Date().getFullYear()}
                title="Formatos de Datos"
                height={300}
              />
            </ChartContainer>
          </div>
          
          {/* Dataset Growth Over Time */}
          <ChartContainer
            title="Crecimiento de Datos"
            description="Evolución histórica de conjuntos de datos publicados"
            icon={TrendingUp}
            height={400}
          >
            <TimeSeriesChart
              type="dataset_growth"
              year={null}
              title="Crecimiento de Conjuntos de Datos"
              height={350}
            />
          </ChartContainer>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.dataset.map((dataset) => (
              <div key={dataset.identifier} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{dataset.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{dataset.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {dataset.theme.map((theme, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {theme}
                    </span>
                  ))}
                  {dataset.superTheme.map((superTheme, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {superTheme}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  {dataset.distribution.map((dist, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{dist.title}</span>
                      <div className="flex space-x-2">
                        <a 
                          href={dist.accessURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver
                        </a>
                        <a 
                          href={dist.downloadURL} 
                          download
                          className="text-green-600 hover:text-green-800"
                        >
                          Descargar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Comprehensive Data Catalog Analysis */}
        <div className="p-6">
          <ChartContainer
            title="Análisis Integral del Catálogo de Datos"
            description="Visión completa del estado y calidad del catálogo de datos abiertos"
            icon={Database}
            height={450}
          >
            <UnifiedChart
              type="comprehensive_data_catalog"
              year={new Date().getFullYear()}
              title="Catálogo de Datos"
              height={400}
            />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default MainDataDisplay;