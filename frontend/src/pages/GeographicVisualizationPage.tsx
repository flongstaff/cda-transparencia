/***
 * Geographic Visualization Page for Carmen de Areco Transparency Portal
 * Integrates geographic visualization components with interactive features
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Filter,
  Calendar,
  Download,
  Eye,
  RefreshCw,
  Layers,
  Search,
  BarChart3,
  TrendingUp,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Globe,
  Target,
  Navigation,
  Map as MapIcon,
  Info,
  Sliders
} from 'lucide-react';
import { useDashboardData } from '../hooks/useUnifiedData';
import { YearSelector } from '../components/common/YearSelector';
import { DataSourcesIndicator } from '../components/common/DataSourcesIndicator';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Import geographic components
import GeographicInfrastructureProjectsMap from '../components/geo/GeographicInfrastructureProjectsMap';
import GeographicInfrastructureProjectsVisualization from '../components/geo/GeographicInfrastructureProjectsVisualization';
import InfrastructureProjectsChart from '../components/charts/InfrastructureProjectsChart';

interface GeographicVisualizationPageProps {
  initialYear?: number;
  municipality?: string;
}

const GeographicVisualizationPage: React.FC<GeographicVisualizationPageProps> = ({
  initialYear = new Date().getFullYear(),
  municipality = 'Carmen de Areco'
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeTab, setActiveTab] = useState<'map' | 'visualization' | 'stats'>('map');
  const [projectType, setProjectType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [costRange, setCostRange] = useState<[number, number]>([0, 100000000]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Use unified data service
  const {
    data: dashboardData,
    externalData,
    sources,
    activeSources,
    loading,
    error,
    refetch,
    availableYears,
    liveDataEnabled
  } = useDashboardData(selectedYear);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Project type options
  const projectTypes = [
    { id: 'all', label: 'Todos' },
    { id: 'construction', label: 'Construcción' },
    { id: 'repair', label: 'Reparación' },
    { id: 'maintenance', label: 'Mantenimiento' },
    { id: 'public-space', label: 'Espacios Públicos' },
    { id: 'transport', label: 'Transporte' },
    { id: 'water', label: 'Agua' },
    { id: 'electricity', label: 'Electricidad' }
  ];

  // Status options
  const statusOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'planned', label: 'Planificado' },
    { id: 'in-progress', label: 'En Progreso' },
    { id: 'completed', label: 'Completado' },
    { id: 'delayed', label: 'Retrasado' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MapPin className="w-8 h-8 mr-3 text-blue-600" />
                Visualización Geográfica - {municipality}
              </h1>
              <p className="mt-2 text-gray-600">
                Localización de proyectos de infraestructura y gasto público en el territorio
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <YearSelector
                selectedYear={selectedYear}
                availableYears={availableYears}
                onChange={handleYearChange}
                label="Año de consulta"
                className="min-w-[200px]"
              />
            </div>
          </div>

          {/* Data Sources Indicator */}
          <div className="mt-6">
            <DataSourcesIndicator
              activeSources={activeSources}
              externalData={externalData}
              loading={loading}
              className="w-full"
            />
          </div>

          {/* Search and Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="flex-1 pl-3 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {projectTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 pl-3 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Costo:</span>
              <select
                className="flex-1 pl-3 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>0 - 10M ARS</option>
                <option>10M - 50M ARS</option>
                <option>50M - 100M ARS</option>
                <option>100M+ ARS</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Mapa Interactivo
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'visualization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Visualización 3D
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Estadísticas
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'map' && 'Mapa de Proyectos de Infraestructura'}
              {activeTab === 'visualization' && 'Visualización Geográfica 3D'}
              {activeTab === 'stats' && 'Estadísticas Geográficas'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'map' && 'Localización de proyectos en el mapa de Carmen de Areco'}
              {activeTab === 'visualization' && 'Visualización 3D de proyectos con Deck.gl'}
              {activeTab === 'stats' && 'Estadísticas geográficas de proyectos'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Cargando datos geográficos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error en el Sistema</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {!loading && !error && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === 'map' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-green-600" />
                      Mapa Interactivo de Proyectos
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver leyenda
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <ErrorBoundary
                    fallback={(error) => (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-96 flex items-center justify-center">
                        <p className="text-sm text-red-600">Error al cargar el mapa geográfico: {error?.message || 'Mapa no disponible'}</p>
                      </div>
                    )}
                  >
                    <GeographicInfrastructureProjectsMap 
                      year={selectedYear} 
                      height={600}
                      showTitle={false}
                      showDescription={false}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            )}

            {activeTab === 'visualization' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                      Visualización 3D de Proyectos
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <Sliders className="h-3 w-3 mr-1" />
                        Ajustes
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <ErrorBoundary
                    fallback={(error) => (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-96 flex items-center justify-center">
                        <p className="text-sm text-red-600">Error al cargar la visualización 3D: {error?.message || 'Visualización no disponible'}</p>
                      </div>
                    )}
                  >
                    <GeographicInfrastructureProjectsVisualization 
                      year={selectedYear} 
                      height={600}
                      showTitle={false}
                      showDescription={false}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Project Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Proyectos Totales</p>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg mr-4">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Presupuesto Total</p>
                        <p className="text-2xl font-bold text-gray-900">ARS 850M</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                        <Target className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">En Ejecución</p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg mr-4">
                        <CheckCircle className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completados</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Distribution Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Distribución de Proyectos
                  </h3>
                  <ErrorBoundary
                    fallback={(error) => (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-64 flex items-center justify-center">
                        <p className="text-sm text-red-600">Error al cargar el gráfico: {error?.message || 'Gráfico no disponible'}</p>
                      </div>
                    )}
                  >
                    <InfrastructureProjectsChart 
                      selectedYear={selectedYear} 
                      height={400}
                    />
                  </ErrorBoundary>
                </div>

                {/* Geographic Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Distribución Geográfica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Por Barrio/Zona</h4>
                      <div className="space-y-2">
                        {['Centro', 'Noroeste', 'Sureste', 'Norte', 'Sur', 'Este', 'Oeste'].map((zone, index) => (
                          <div key={zone} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{zone}</span>
                            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.random() * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 10) + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Por Tipo de Proyecto</h4>
                      <div className="space-y-2">
                        {projectTypes.filter(t => t.id !== 'all').map((type, index) => (
                          <div key={type.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{type.label}</span>
                            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.random() * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 8) + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualización Geográfica</h3>
              <p className="text-gray-600 text-sm">
                Mapa interactivo de proyectos de infraestructura municipales con datos geoespaciales.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capas Disponibles</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 text-green-600 mr-2" />
                  <span>Proyectos de Infraestructura</span>
                </li>
                <li className="flex items-center">
                  <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Presupuesto por Proyecto</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                  <span>Estado de Cumplimiento</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    <span>Exportar datos geográficos</span>
                  </button>
                </li>
                <li>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    <span>Actualizar mapa</span>
                  </button>
                </li>
                <li>
                  <a href="/reports" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Ver informes</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 Visualización Geográfica - {municipality}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrap with error boundary for production safety
const GeographicVisualizationPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">
                  Error al Cargar la Visualización Geográfica
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Ocurrió un error al cargar la visualización geográfica. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 p-2 rounded">
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
      <GeographicVisualizationPage />
    </ErrorBoundary>
  );
};

export default GeographicVisualizationPageWithErrorBoundary;