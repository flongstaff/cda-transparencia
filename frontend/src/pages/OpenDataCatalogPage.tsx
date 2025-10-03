/**
 * OpenDataCatalogPage Component - Very Simple Version
 * Main page for browsing open data catalog with basic functionality
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Mock data categories - this would come from an API in a real implementation
const mockCategories = [
  {
    id: 'budget-financial',
    title: 'Presupuesto y Financiero',
    description: 'Documentos relacionados con presupuestos, ejecución financiera, estados contables',
    itemsCount: 45,
    lastUpdated: '2024-12-01',
    updateFrequency: 'monthly'
  },
  {
    id: 'procurement-contracts',
    title: 'Contrataciones y Licitaciones',
    description: 'Documentos sobre contratos, licitaciones, proveedores y adquisiciones',
    itemsCount: 32,
    lastUpdated: '2024-11-28',
    updateFrequency: 'weekly'
  },
  {
    id: 'personnel-salaries',
    title: 'Personal y Remuneraciones',
    description: 'Documentos sobre empleados municipales, salarios y declaraciones',
    itemsCount: 18,
    lastUpdated: '2024-11-15',
    updateFrequency: 'monthly'
  },
  {
    id: 'legal-regulatory',
    title: 'Legal y Reglamentario',
    description: 'Ordenanzas, resoluciones, decretos y documentos legales',
    itemsCount: 56,
    lastUpdated: '2024-12-01',
    updateFrequency: 'weekly'
  },
  {
    id: 'infrastructure-works',
    title: 'Infraestructura y Obras',
    description: 'Documentos sobre obras públicas, proyectos de infraestructura',
    itemsCount: 24,
    lastUpdated: '2024-11-20',
    updateFrequency: 'monthly'
  },
  {
    id: 'transparency-reporting',
    title: 'Transparencia y Reportes',
    description: 'Documentos de reporte, auditoría y transparencia activa',
    itemsCount: 38,
    lastUpdated: '2024-11-30',
    updateFrequency: 'monthly'
  }
];

const OpenDataCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories] = useState<any[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter categories based on search and selection
  const filteredCategories = categories.filter(category => {
    // Filter by search query
    const matchesSearch = 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 text-blue-600 mr-3">📊</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Catálogo de Datos Abiertos
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Conjuntos de datos reutilizables en formatos abiertos, alineados con las directrices de la AAIP
              </p>
            </div>
            
            {/* Compliance badges */}
            <div className="flex flex-col items-end">
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-1.5 rounded-full mb-2">
                <div className="h-4 w-4 mr-1">🛡️</div>
                Cumple AAIP
              </div>
              <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1.5 rounded-full">
                <div className="h-4 w-4 mr-1">🛡️</div>
                WCAG 2.1 AA
              </div>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
                  🔍
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar datos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Buscar en el catálogo de datos"
                />
              </div>
              
              {/* Category filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Filtrar por categoría"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </div>
              
              {/* Format filter */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Filtrar por formato"
                >
                  <option value="all">Todos los formatos</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              
              {/* Sort */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  aria-label="Ordenar resultados"
                >
                  <option value="name">Nombre (A-Z)</option>
                  <option value="date">Más reciente primero</option>
                  <option value="items">Mayor cantidad</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Catalog content */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {filteredCategories.length}{' '}
              {filteredCategories.length === 1 ? 'categoría' : 'categorías'} encontradas
            </h2>
          </div>
          
          {/* Categories grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/open-data/${category.id}`)}
              >
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
                    <div className="h-6 w-6">📁</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 mr-1">📄</div>
                    <span>{category.itemsCount} conjuntos</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 mr-1">📅</div>
                    <span>
                      Act: {new Date(category.lastUpdated).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 dark:border-dark-border pt-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
                        <div className="h-3 w-3 mr-1">🛡️</div>
                        Accesible
                      </div>
                    </div>
                    <button 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/open-data/${category.id}`);
                      }}
                      aria-label={`Ver datos de ${category.title}`}
                    >
                      Ver datos
                      <div className="w-4 h-4 ml-1">⬇️</div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance information */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <div className="h-5 w-5 mr-2">🛡️</div>
            Cumplimiento y Accesibilidad
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Este catálogo de datos abiertos se adhiere a las directrices de la Agencia de Acceso a la Información Pública (AAIP) 
            y cumple con los estándares de accesibilidad WCAG 2.1 AA.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Datos disponibles en múltiples formatos (CSV, JSON, Excel, PDF)
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Metadatos completos según estándares AAIP
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Actualización periódica según políticas municipales
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="ml-2 text-blue-700 dark:text-blue-300">
                Accesible para personas con discapacidad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const OpenDataCatalogPageWithErrorBoundary: React.FC = () => {
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
      <OpenDataCatalogPage />
    </ErrorBoundary>
  );
};

export default OpenDataCatalogPageWithErrorBoundary;