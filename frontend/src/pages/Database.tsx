import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Calendar,
  FileText,
  Eye,
  Database as DatabaseIcon,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Users
} from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import DocumentViewer from '../components/viewers/DocumentViewer2';
import PageYearSelector from '../components/forms/PageYearSelector';
import { formatFileSize } from '../utils/formatters';

const Database: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<unknown | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortField, setSortField] = useState<'title' | 'size' | 'date' | 'category'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use unified master data service
  const {
    masterData,
    currentDocuments,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories: dataCategories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  const documents = useMemo(() => {
    return currentDocuments || [];
  }, [currentDocuments]);

  const categories = useMemo(() => {
    return dataCategories || [];
  }, [dataCategories]);

  const documentTypes = useMemo(() => {
    if (!documents || documents.length === 0) return [];
    return [...new Set(documents.map((doc: Record<string, unknown>) => doc.type || 'Documento'))].sort();
  }, [documents]);

  const totalStats = useMemo(() => {
    if (!documents || documents.length === 0) return {
      totalDocuments: 0,
      totalSize: 0,
      yearsCovered: 0,
      categoriesCount: 0,
      verified: 0,
      integrityVerified: 0
    };
    return {
      totalDocuments: documents.length,
      totalSize: documents.reduce((sum: number, doc: any) => sum + (doc.size_mb || 0), 0),
      yearsCovered: new Set(documents.map((doc: Record<string, unknown>) => doc.year)).size,
      categoriesCount: categories.length,
      verified: documents.filter((doc: Record<string, unknown>) => doc.verified).length,
      integrityVerified: documents.filter((doc) => doc.integrity_verified).length
    };
  }, [documents, categories]);

  const filteredDocuments = useMemo(() => {
    const filtered = [...documents.filter((doc) => {
      const matchesSearch = searchTerm === '' || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    })];

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'size':
          aValue = a.size_mb;
          bValue = b.size_mb;
          break;
        case 'date':
          aValue = new Date(a.processing_date);
          bValue = new Date(b.processing_date);
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [documents, searchTerm, selectedCategory, selectedType, sortField, sortDirection]);

  // availableYears already comes from useMasterData hook

  const handleSort = (field: 'title' | 'size' | 'date' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Cargando base de datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  const totalDocs = totalDocuments ?? 0;
  const sources = dataSourcesActive ?? 0;
  const categoriesCount = categories.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <DatabaseIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">Base de Datos Municipal</h1>
                <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Búsqueda y exploración completa de documentos municipales</p>
              </div>
            </div>
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
              label="Año de los documentos"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow p-4 flex items-center">
            <FileText className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Documentos Totales</p>
              <p className="text-2xl font-semibold">
                {totalDocs.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl shadow p-4 flex items-center">
            <Users className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Categorías</p>
              <p className="text-2xl font-semibold">
                {categoriesCount}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl shadow p-4 flex items-center">
            <DollarSign className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Fuentes de Datos</p>
              <p className="text-2xl font-semibold">
                {sources}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar documentos por título, archivo o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar en la base de datos"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por categoría"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por tipo de archivo"
              >
                <option value="all">Todos los tipos</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 dark:text-dark-text-tertiary'}`}
                  title="Vista de cuadrícula"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 dark:text-dark-text-tertiary'}`}
                  title="Vista de lista"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  // Export functionality
                  const csvContent = [
                    ['Título', 'Categoría', 'Tipo', 'Tamaño', 'Año', 'Estado'],
                    ...filteredDocuments.map(doc => [
                      doc.title,
                      doc.category,
                      doc.type,
                      `${doc.size_mb.toFixed(1)} MB`,
                      doc.year,
                      doc.verified
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `base-de-datos-${selectedYear}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background"
                title="Exportar resultados a CSV"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Sorting Header */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              {filteredDocuments.length} de {totalStats.totalDocuments} documentos
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Ordenar por:</span>
              <div className="flex space-x-2">
                {(['title', 'size', 'date', 'category'] as const).map((field) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`flex items-center px-3 py-1 rounded text-sm ${ 
                      sortField === field
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:text-dark-text-secondary'
                    }`}
                  >
                    {{ 
                      title: 'Título',
                      size: 'Tamaño',
                      date: 'Fecha',
                      category: 'Categoría'
                    }[field]}
                    {sortField === field && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-2xl">
                      {document.type === 'pdf' ? '📄' : 
                       document.type === 'csv' ? '📊' : 
                       document.type === 'json' ? '🔷' : '📝'}
                    </div>
                    <div className="flex items-center space-x-1">
                      {document.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt px-2 py-1 rounded">
                        {document.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2 line-clamp-2">
                    {document.title}
                  </h3>
                  
                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary space-y-1 mb-4">
                    <div className="flex items-center">
                      <span className="capitalize">{document.category.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{formatFileSize(document.size_mb * 1024 * 1024)}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{document.year}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedDocument(document)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors"
                      title={`Ver documento ${document.title}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </button>
                    <a
                      href={document.url}
                      download
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt transition-colors"
                      title={`Descargar ${document.filename}`}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">
                          {document.type === 'pdf' ? '📄' : 
                           document.type === 'csv' ? '📊' : 
                           document.type === 'json' ? '🔷' : '📝'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary max-w-xs truncate">
                            {document.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary max-w-xs truncate">
                            {document.filename}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                      {document.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {document.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                      {formatFileSize(document.size_mb * 1024 * 1024)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                      {document.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${ 
                        document.verified 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {document.verified ? 'Verificado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedDocument(document)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 mr-4 flex items-center"
                        title="Ver documento"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                      <a
                        href={document.url}
                        download
                        className="text-green-600 dark:text-green-400 hover:text-green-900 flex items-center"
                        title="Descargar documento"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredDocuments.length === 0 && searchTerm && (
          <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">No hay documentos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
              No se encontraron documentos con los filtros seleccionados: "{searchTerm}"
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Document Viewer Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-50 dark:bg-dark-background dark:bg-dark-background0 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white dark:bg-dark-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white dark:bg-dark-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{selectedDocument.title}</h3>
                    <button
                      onClick={() => setSelectedDocument(null)}
                      className="text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary hover:text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary"
                      title="Cerrar visor de documentos"
                    >
                      ✕
                    </button>
                  </div>

                  <DocumentViewer
                    documents={[selectedDocument]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Database;
