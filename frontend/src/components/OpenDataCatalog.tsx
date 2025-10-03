/**
 * OpenDataCatalog Component - Minimal Functional Version
 * Main catalog interface for open data with basic functionality
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OpenDataCatalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  // Mock data categories - in a real implementation, this would come from an API
  const categories = [
    {
      id: 'budget-financial',
      title: 'Presupuesto y Financiero',
      description: 'Documentos relacionados con presupuestos, ejecución financiera, estados contables',
      icon: 'DollarSign',
      itemsCount: 45,
      lastUpdated: '2024-12-01',
      updateFrequency: 'monthly',
      dataTypes: ['budget', 'financial', 'accounting'],
      datasets: [
        {
          id: 'budget-2025',
          title: 'Presupuesto 2025',
          description: 'Proyecto de presupuesto municipal para el ejercicio 2025 en formato estructurado',
          formats: ['csv', 'xlsx', 'json'],
          size: '2.4 MB',
          lastUpdated: '2024-12-01',
          accessibility: {
            compliant: true,
            standards: ['WCAG 2.1 AA']
          }
        }
      ]
    },
    {
      id: 'procurement-contracts',
      title: 'Contrataciones y Licitaciones',
      description: 'Documentos sobre contratos, licitaciones, proveedores y adquisiciones',
      icon: 'Building',
      itemsCount: 32,
      lastUpdated: '2024-11-28',
      updateFrequency: 'weekly',
      dataTypes: ['contract', 'procurement', 'tender'],
      datasets: [
        {
          id: 'contracts-2024',
          title: 'Contratos Públicos 2024',
          description: 'Base de datos de contratos públicos adjudicados en 2024',
          formats: ['csv', 'xlsx', 'json'],
          size: '3.2 MB',
          lastUpdated: '2024-11-28',
          accessibility: {
            compliant: true,
            standards: ['WCAG 2.1 AA']
          }
        }
      ]
    },
    {
      id: 'personnel-salaries',
      title: 'Personal y Remuneraciones',
      description: 'Documentos sobre empleados municipales, salarios y declaraciones',
      icon: 'Users',
      itemsCount: 18,
      lastUpdated: '2024-11-15',
      updateFrequency: 'monthly',
      dataTypes: ['personnel', 'salary', 'declaration'],
      datasets: [
        {
          id: 'salary-data-2024',
          title: 'Datos Salariales 2024',
          description: 'Información sobre remuneraciones del personal municipal en 2024',
          formats: ['csv', 'xlsx'],
          size: '1.8 MB',
          lastUpdated: '2024-11-15',
          accessibility: {
            compliant: true,
            standards: ['WCAG 2.1 AA']
          }
        }
      ]
    },
    {
      id: 'legal-regulatory',
      title: 'Legal y Reglamentario',
      description: 'Ordenanzas, resoluciones, decretos y documentos legales',
      icon: 'FileText',
      itemsCount: 56,
      lastUpdated: '2024-12-01',
      updateFrequency: 'weekly',
      dataTypes: ['ordinance', 'resolution', 'decree'],
      datasets: [
        {
          id: 'ordinances-2024',
          title: 'Ordenanzas Municipales 2024',
          description: 'Colección de ordenanzas municipales del año 2024',
          formats: ['pdf', 'json'],
          size: '8.3 MB',
          lastUpdated: '2024-12-01',
          accessibility: {
            compliant: true,
            standards: ['WCAG 2.1 AA']
          }
        }
      ]
    },
    {
      id: 'infrastructure-works',
      title: 'Infraestructura y Obras',
      description: 'Documentos sobre obras públicas, proyectos de infraestructura',
      icon: 'HardHat',
      itemsCount: 24,
      lastUpdated: '2024-11-20',
      updateFrequency: 'monthly',
      dataTypes: ['infrastructure', 'project', 'work'],
      datasets: [
        {
          id: 'public-works-registry',
          title: 'Registro de Obras Públicas',
          description: 'Catálogo de obras públicas ejecutadas y en curso',
          formats: ['csv', 'json'],
          size: '2.9 MB',
          lastUpdated: '2024-11-20',
          accessibility: {
            compliant: true,
            standards: ['WCAG 2.1 AA']
          }
        }
      ]
    },
    {
      id: 'transparency-reporting',
      title: 'Transparencia y Reportes',
      description: 'Documentos de reporte, auditoría y transparencia activa',
      icon: 'Shield',
      itemsCount: 38,
      lastUpdated: '2024-11-30',
      updateFrequency: 'monthly',
      dataTypes: ['report', 'audit', 'transparency'],
      datasets: [
        {
          id: 'audit-reports-2024',
          title: 'Reportes de Auditoría 2024',
          description: 'Informes de auditoría interna del año 2024',
          formats: ['pdf', 'json'],
          size: '4.2 MB',
          lastUpdated: '2024-11-30',
          accessibility: {
            compliant: true,
            standards: ['WCAG 2.1 AA']
          }
        }
      ]
    }
  ];

  // Filter categories based on search, category, and format
  const filteredCategories = categories.filter(category => {
    // Filter by search query
    const matchesSearch = 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.dataTypes && category.dataTypes.some(type => type.toLowerCase().includes(searchQuery.toLowerCase())));
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    
    // Filter by format
    let matchesFormat = true;
    if (selectedFormat !== 'all') {
      matchesFormat = category.datasets.some(dataset => 
        dataset.formats.includes(selectedFormat.toLowerCase())
      );
    }
    
    return matchesSearch && matchesCategory && matchesFormat;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (size) => {
    return size;
  };

  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'csv': return '📄';
      case 'json': return '🗄️';
      case 'xlsx': return '📊';
      case 'pdf': return '📄';
      case 'xml': return '📄';
      case 'txt': return '📄';
      case 'zip': return '📦';
      default: return '📄';
    }
  };

  const getFormatName = (format) => {
    switch (format.toLowerCase()) {
      case 'csv': return 'CSV';
      case 'json': return 'JSON';
      case 'xlsx': return 'Excel';
      case 'pdf': return 'PDF';
      case 'xml': return 'XML';
      case 'txt': return 'Texto';
      case 'zip': return 'ZIP';
      default: return format.toUpperCase();
    }
  };

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
                <div className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">🔍</div>
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
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {category.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
                        {category.itemsCount} conjuntos
                      </span>
                    </div>
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
                      Act: {formatDate(category.lastUpdated)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 mr-1">⏱️</div>
                    <span>Frec: {category.updateFrequency}</span>
                  </div>
                </div>
                
                {/* Dataset previews */}
                <div className="border-t border-gray-100 dark:border-dark-border pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Conjuntos de datos recientes:
                  </h4>
                  <ul className="space-y-2">
                    {category.datasets.slice(0, 2).map((dataset, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex justify-between items-start">
                        <span className="truncate mr-2">{dataset.title}</span>
                        <div className="flex space-x-1">
                          {dataset.formats.slice(0, 3).map((format, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center"
                            >
                              <div className="h-3 w-3 mr-1">{getFormatIcon(format)}</div>
                              {getFormatName(format)}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Accessibility status */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
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

        {/* PDF Catalog Section - Highlighted section for PDF documents */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <div className="h-6 w-6 mr-3">📄</div>
              Catálogo de Documentos PDF
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {(() => {
                let count = 0;
                categories.forEach(category => {
                  category.datasets.forEach(dataset => {
                    if (dataset.formats.includes('pdf')) {
                      count++;
                    }
                  });
                });
                return `${count} documentos PDF disponibles`;
              })()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const pdfDocs = [];
              categories.forEach(category => {
                category.datasets.forEach(dataset => {
                  if (dataset.formats.includes('pdf')) {
                    pdfDocs.push({ ...dataset, category: category.title, categoryId: category.id });
                  }
                });
              });
              
              return pdfDocs.map((doc, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mr-4">
                      <div className="h-6 w-6">📄</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {doc.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full">
                          PDF
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {doc.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {doc.formats.filter(f => f !== 'pdf').map((format, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                          >
                            {getFormatName(format)}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{doc.size}</span>
                        <span>Actualizado: {formatDate(doc.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
                      onClick={() => navigate(`/open-data/${doc.categoryId}`)}
                    >
                      Ver detalles
                      <div className="w-4 h-4 ml-1">⬇️</div>
                    </button>
                    <button 
                      className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                      onClick={() => {
                        // In a real implementation, this would construct the actual PDF URL
                        const pdfUrl = `/data/documents/${doc.id}.pdf`;
                        console.log(`Downloading PDF: ${pdfUrl}`);
                        // For now, just log. In a real implementation, we would download the PDF
                        alert(`In a real implementation, this would download the PDF for: ${doc.id}`);
                      }}
                    >
                      <div className="h-4 w-4 mr-1">📥</div>
                      Descargar PDF
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* AAIP Compliance Information */}
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

export default OpenDataCatalog;