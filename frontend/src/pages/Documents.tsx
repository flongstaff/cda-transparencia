import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  BarChart3,
  Activity,
  Download,
  Eye,
  Filter,
  Grid,
  List,
  Search,
  ExternalLink,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Archive
} from 'lucide-react';
import { useUnifiedData } from '../hooks/useUnifiedData';
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatFileSize } from '../utils/formatters';
import { getDocumentIcon } from '../utils/documentUtils';

const Documents: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data, isLoading, isError, error } = useUnifiedData({ year: selectedYear });

  const filteredDocuments = useMemo(() => {
    if (!data) return [];
    return data.documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    if (!data) return {
      total: 0,
      verified: 0,
      verificationRate: 0,
      totalSizeMB: 0,
      categories: {},
      uniqueCategories: 0,
      averageSize: 0
    };

    const verified = data.documents.filter(doc => doc.verified).length;
    const totalSize = data.documents.reduce((sum, doc) => sum + doc.size_mb, 0);
    const categoryStats = data.documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: data.documents.length,
      verified: verified,
      verificationRate: data.documents.length > 0 ? Math.round((verified / data.documents.length) * 100) : 0,
      totalSizeMB: totalSize,
      categories: categoryStats,
      uniqueCategories: Object.keys(categoryStats).length,
      averageSize: data.documents.length > 0 ? totalSize / data.documents.length : 0
    };
  }, [data]);

  const categories = useMemo(() => {
    if (!data) return ['all'];
    const cats = data.documents.map(doc => doc.category);
    return ['all', ...Array.from(new Set(cats)).sort()];
  }, [data]);

  const availableYears = useMemo(() => {
    if (!data) return [];
    return data.metadata.year_coverage;
  }, [data]);

  const getCategoryIcon = (category: string) => {
    const normalizedCat = category.toLowerCase().replace(/[_\s]/g, '');
    
    switch (normalizedCat) {
      case 'contrataciones': return '📝';
      case 'declaracionespatrimoniales': return '💼';
      case 'documentosgenerales': return '📄';
      case 'ejecuciondegastos': return '💰';
      case 'ejecucionderecursos': return '📊';
      case 'estadosfinancieros': return '📈';
      case 'presupuestomunicipal': return '🏛️';
      case 'recursoshumanos': return '👥';
      case 'saludpublica': return '🏥';
      case 'budget': return '💰';
      case 'salaries': return '👥';
      case 'revenue': return '📈';
      case 'treasury': return '🏛️';
      case 'gender': return '⚖️';
      case 'declarations': return '📋';
      case 'financial': return '📊';
      case 'newsletter': return '📰';
      case 'inversión': return '📈'; // Added for consistency with Investments page
      default: return '📄';
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📄 Documentos de Transparencia
            </h1>
            <p className="text-gray-600">
              Accede a todos los documentos oficiales del municipio para el año {selectedYear}
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                {stats.total} documentos disponibles
              </span>
            </p>
          </div>
          <PageYearSelector
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Documentos</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.total}</p>
              <p className="text-xs text-gray-400">Promedio: {stats.averageSize.toFixed(1)} MB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verificados</p>
              <p className="text-2xl font-semibold text-green-600">{stats.verified}</p>
              <p className="text-xs text-gray-400">{stats.verificationRate}% del total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categorías</p>
              <p className="text-2xl font-semibold text-purple-600">{stats.uniqueCategories}</p>
              <p className="text-xs text-gray-400">Organizadas por tema</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Database className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tamaño Total</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.totalSizeMB.toFixed(1)} MB</p>
              <p className="text-xs text-gray-400">Archivo digital</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Categories Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos por Categoría</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(stats.categories).slice(0, 8).map(([category, count]) => (
            <div 
              key={category} 
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              <span className="text-2xl mr-3">{getCategoryIcon(category)}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {category.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">{count} documentos</p>
              </div>
            </div>
          ))}
        </div>
        {Object.keys(stats.categories).length > 8 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            +{Object.keys(stats.categories).length - 8} categorías más disponibles
          </p>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : `${getCategoryIcon(category)} ${category.replace(/_/g, ' ')}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">
              {filteredDocuments.length} de {stats.total}
            </span>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">{getCategoryIcon(doc.category)}</div>
                  <div className="flex items-center space-x-1">
                    {doc.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {doc.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {doc.title}
                </h3>
                
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <div className="flex items-center">
                    <Archive className="h-4 w-4 mr-2" />
                    <span className="capitalize">{doc.category.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{doc.size_mb.toFixed(1)} MB</span>
                  </div>
                  {doc.processing_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(doc.processing_date).toLocaleDateString('es-AR')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </a>
                  <a
                    href={doc.url}
                    download
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
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
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">{getDocumentIcon(doc.type as any)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {doc.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {doc.filename}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(doc.size_mb * 1024 * 1024)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.processing_date 
                        ? new Date(doc.processing_date).toLocaleDateString('es-AR')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver documento"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={doc.url}
                          download
                          className="text-gray-600 hover:text-gray-900"
                          title="Descargar documento"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis de Documentos</h2>
        <DocumentAnalysisChart year={selectedYear} />
      </div>

      {filteredDocuments.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron documentos con los filtros seleccionados: "{searchTerm}"
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Data Sources Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Database className="h-6 w-6 text-blue-500 mt-1 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Fuentes de Datos
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                • <strong>Base de datos:</strong> Documentos verificados y procesados automáticamente
              </p>
              <p>
                • <strong>Archivos organizados:</strong> Análisis por categorías y exportaciones CSV
              </p>
              <p>
                • <strong>Portal oficial:</strong> Documentos públicos según Ley de Acceso a la Información
              </p>
              <p>
                • <strong>Verificación:</strong> Todos los documentos pasan por controles de integridad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
