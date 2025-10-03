/**
 * Documents Page - Unified Data Integration
 * Displays all documents from all sources: PDFs, JSON metadata
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
  Database,
  ExternalLink,
  RefreshCw,
  Eye,
  File,
  Folder,
  Archive,
  BookOpen
} from 'lucide-react';

import { useDocumentsData } from '../hooks/useUnifiedData';
import PageYearSelector from '../components/forms/PageYearSelector';
import ErrorBoundary from '../components/common/ErrorBoundary';

interface Document {
  id: string;
  title: string;
  url: string;
  year: number;
  category: string;
  source: string;
  type: string;
  size?: number;
  date?: string;
  description?: string;
}

const DocumentsUnified: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'sources'>('grid');

  // Use unified data service
  const {
    data: documentsData,
    sources,
    loading,
    error,
    refetch,
    availableYears,
    dataInventory
  } = useDocumentsData(selectedYear);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'budget':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'contracts':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'reports':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'ordinances':
        return <Archive className="h-4 w-4 text-orange-600" />;
      default:
        return <Folder className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documentsData?.filter((doc: Document) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesYear = doc.year === selectedYear;
    
    return matchesSearch && matchesCategory && matchesYear;
  }) || [];

  const categories = Array.from(new Set(documentsData?.map((doc: Document) => doc.category) || []));

  const renderDocumentGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDocuments.map((doc: Document, index: number) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {getDocumentIcon(doc.type)}
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {doc.year} • {doc.category}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {doc.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {doc.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              {getCategoryIcon(doc.category)}
              <span className="ml-1 capitalize">{doc.category}</span>
            </div>
            {doc.size && (
              <span>{formatFileSize(doc.size)}</span>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Documento
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDocumentList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Año
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDocuments.map((doc: Document) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getDocumentIcon(doc.type)}
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.title}
                      </div>
                      {doc.description && (
                        <div className="text-sm text-gray-500">
                          {doc.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getCategoryIcon(doc.category)}
                    <span className="ml-2 text-sm text-gray-900 capitalize">
                      {doc.category}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doc.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Download className="h-4 w-4" />
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSources = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Fuentes de Documentos
        </h3>
        
        <div className="space-y-4">
          {sources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  source.type === 'pdf' ? 'bg-red-100' :
                  source.type === 'json' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {source.type === 'pdf' && <FileText className="h-4 w-4 text-red-600" />}
                  {source.type === 'json' && <Database className="h-4 w-4 text-blue-600" />}
                  {source.type === 'external' && <ExternalLink className="h-4 w-4 text-gray-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{source.path}</p>
                  <p className="text-sm text-gray-500 capitalize">{source.type} • {source.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                  Activo
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {dataInventory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Archive className="h-5 w-5 mr-2 text-purple-600" />
            Inventario de Documentos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{dataInventory.pdf.length}</p>
              <p className="text-sm text-gray-500">Documentos PDF</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dataInventory.json.length}</p>
              <p className="text-sm text-gray-500">Metadatos JSON</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{categories.length}</p>
              <p className="text-sm text-gray-500">Categorías</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{filteredDocuments.length}</p>
              <p className="text-sm text-gray-500">Documentos {selectedYear}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`Documentos ${selectedYear} - Portal de Transparencia Carmen de Areco`}</title>
        <meta name="description" content={`Documentos municipales de Carmen de Areco para el año ${selectedYear}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-blue-600" />
                  Documentos Municipales
                </h1>
                <p className="mt-2 text-gray-600">
                  Acceso a todos los documentos oficiales y reportes municipales
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <PageYearSelector
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  availableYears={availableYears}
                  size="md"
                  label="Año de consulta"
                  showDataAvailability={true}
                />
                
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('sources')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'sources' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Database className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Cargando documentos...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error al cargar documentos</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'grid' && renderDocumentGrid()}
              {viewMode === 'list' && renderDocumentList()}
              {viewMode === 'sources' && renderSources()}
            </motion.div>
          )}

          {/* Results Summary */}
          {!loading && !error && (
            <div className="mt-8 text-center text-gray-500">
              <p>
                Mostrando {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} 
                {searchTerm && ` para "${searchTerm}"`}
                {selectedCategory !== 'all' && ` en la categoría "${selectedCategory}"`}
                {' '}del año {selectedYear}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


// Wrap with error boundary for production safety
const DocumentsUnifiedWithErrorBoundary: React.FC = () => {
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
      <DocumentsUnified />
    </ErrorBoundary>
  );
};

export default DocumentsUnifiedWithErrorBoundary;
