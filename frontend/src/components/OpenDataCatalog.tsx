/**
 * OpenDataCatalog Component
 * Main catalog interface for open data following AAIP guidelines
 * Implements accessibility features per WCAG 2.1 AA standards
 */

import React, { useState, useEffect } from 'react';
import { Database, Download, Calendar, RefreshCw, Filter, Search, FileText, BarChart3, Users, Building, DollarSign, Settings, HardHat, Shield, Heart, Megaphone, Gauge } from 'lucide-react';
import DataCategoryCard from './DataCategoryCard';
import DataFormatSelector from './DataFormatSelector';
import AccessibilityToolbar from './AccessibilityToolbar';
import { useData } from '../contexts/DataContext';

interface DataCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  itemsCount: number;
  lastUpdated: string;
  updateFrequency: string;
  dataTypes: string[];
  datasets: DataItem[];
}

interface DataItem {
  id: string;
  title: string;
  description: string;
  formats: string[];
  size: string;
  lastUpdated: string;
  accessibility: {
    compliant: boolean;
    standards: string[];
  };
}

const OpenDataCatalog: React.FC = () => {
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('name');
  const { state } = useData();

  useEffect(() => {
    // Load the categories from the data file
    fetch('/data/categories-structure.json')
      .then(response => response.json())
      .then(data => {
        setCategories(data.categories);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading categories:', error);
        setLoading(false);
      });
  }, []);

  // Filter categories based on search and selection
  const filteredCategories = categories.filter(category => {
    // Filter by search query
    const matchesSearch = 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.dataTypes.some(type => type.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    
    // Filter by format if selected
    let matchesFormat = selectedFormat === 'all';
    if (selectedFormat !== 'all') {
      matchesFormat = category.datasets.some(dataset => 
        dataset.formats.includes(selectedFormat.toLowerCase())
      );
    }
    
    return matchesSearch && matchesCategory && matchesFormat;
  });

  // Sort the categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOption === 'name') {
      return a.title.localeCompare(b.title);
    } else if (sortOption === 'date') {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    } else if (sortOption === 'items') {
      return b.itemsCount - a.itemsCount;
    }
    return 0;
  });

  // Get all unique formats across all datasets
  const allFormats = Array.from(
    new Set(
      categories.flatMap(category => 
        category.datasets.flatMap(dataset => dataset.formats)
      )
    )
  );

  // Get all category IDs for filter options
  const categoryOptions = [
    { id: 'all', title: 'Todas las categorías' },
    ...categories.map(cat => ({ id: cat.id, title: cat.title }))
  ];

  const getIconByCategory = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'BarChart3': <BarChart3 className="w-6 h-6" />,
      'Building': <Building className="w-6 h-6" />,
      'FileText': <FileText className="w-6 h-6" />,
      'DollarSign': <DollarSign className="w-6 h-6" />,
      'Gavel': <BarChart3 className="w-6 h-6" />, // Placeholder for Gavel
      'Settings': <Settings className="w-6 h-6" />,
      'Users': <Users className="w-6 h-6" />,
      'HardHat': <HardHat className="w-6 h-6" />,
      'Shield': <Shield className="w-6 h-6" />,
      'Heart': <Heart className="w-6 h-6" />,
      'Megaphone': <Megaphone className="w-6 h-6" />,
      'Gauge': <Gauge className="w-6 h-6" />
    };
    
    return iconMap[iconName] || <Database className="w-6 h-6" />;
  };

  return (
    <div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      // ARIA landmark to identify the main content region
      role="main"
      aria-label="Catálogo de Datos Abiertos"
    >
      {/* Skip link for keyboard users */}
      <a 
        href="#catalog-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded z-50"
      >
        Saltar al contenido del catálogo
      </a>
      
      {/* Accessibility toolbar */}
      <AccessibilityToolbar />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Database className="w-8 h-8 mr-3 text-blue-600" />
              Catálogo de Datos Abiertos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Datos públicos municipales disponibles en formatos abiertos y reutilizables
            </p>
          </div>
          
          {/* Compliance badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-1.5 rounded-full mb-2">
              <Shield className="w-4 h-4 mr-1" />
              Cumple AAIP
            </div>
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1.5 rounded-full">
              <Shield className="w-4 h-4 mr-1" />
              WCAG 2.1 AA
            </div>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                {categoryOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.title}</option>
                ))}
              </select>
            </div>
            
            {/* Format filter */}
            <div>
              <DataFormatSelector 
                formats={allFormats}
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
              />
            </div>
            
            {/* Sort */}
            <div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                aria-label="Ordenar resultados"
              >
                <option value="name">A-Z</option>
                <option value="date">Más reciente</option>
                <option value="items">Mayor cantidad</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700 dark:text-gray-300">Cargando datos abiertos...</span>
        </div>
      )}

      {/* Catalog content */}
      {!loading && (
        <div id="catalog-content">
          {sortedCategories.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron datos
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No hay datos que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {sortedCategories.length}{' '}
                  {sortedCategories.length === 1 ? 'categoría' : 'categorías'} encontradas
                </h2>
              </div>
              
              {/* Categories grid */}
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                // ARIA to indicate this is a list of data categories
                role="list"
                aria-label="Lista de categorías de datos"
              >
                {sortedCategories.map((category) => (
                  <div 
                    key={category.id} 
                    role="listitem"
                  >
                    <DataCategoryCard
                      category={category}
                      icon={getIconByCategory(category.icon)}
                      onCategoryClick={() => setSelectedCategory(category.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Compliance information */}
      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
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
  );
};

export default OpenDataCatalog;