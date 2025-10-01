import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Calendar,
  FileText,
  Eye,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import YearSelector from '../components/navigation/YearSelector';
import { formatFileSize } from '../utils/formatters';
import UnifiedDocumentViewer from '../components/viewers/UnifiedDocumentViewer';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Documents: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortField, setSortField] = useState<'title' | 'size' | 'date' | 'category'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState<boolean>(false);

  // 🚀 Use unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    currentDebt,
    loading: isLoading,
    error,
    totalDocuments,
    availableYears,
    categories: documentCategories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Access documents from the master data service
  const yearDocuments = useMemo(() => {
    if (currentDocuments && Array.isArray(currentDocuments)) {
      return currentDocuments;
    }
    return [];
  }, [currentDocuments]);

  // Use documentCategories from the master data if available, otherwise extract from documents
  const categories = useMemo(() => {
    if (documentCategories && documentCategories.length > 0) {
      return documentCategories;
    }
    // Fallback: extract categories from documents themselves
    return [...new Set(yearDocuments.map((doc) => doc.category))].sort();
  }, [documentCategories, yearDocuments]);

  const documentTypes = useMemo(() => [...new Set(yearDocuments.map((doc) => doc.type || 'unknown'))].sort(), [yearDocuments]);

  const totalStats = useMemo(() => ({
    totalDocuments: yearDocuments.length,
    totalSize: yearDocuments.reduce((sum, doc) => sum + (doc.size_mb || 0), 0),
    categoriesCount: categories.length,
    verified: yearDocuments.filter((doc) => doc.verified).length,
    integrityVerified: yearDocuments.filter((doc) => doc.audit_status === 'verified').length,
  }), [yearDocuments, categories]);

  const filteredDocuments = useMemo(() => {
    const filtered = yearDocuments.filter((doc) => {
      const matchesSearch =
        searchTerm === '' ||
        (doc.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.category?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesType = selectedType === 'all' || doc.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() ?? '';
          bValue = b.title?.toLowerCase() ?? '';
          break;
        case 'size':
          aValue = a.size_mb ?? 0;
          bValue = b.size_mb ?? 0;
          break;
        case 'date':
          aValue = new Date(a.processing_date);
          bValue = new Date(b.processing_date);
          break;
        case 'category':
          aValue = a.category?.toLowerCase() ?? '';
          bValue = b.category?.toLowerCase() ?? '';
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [yearDocuments, searchTerm, selectedCategory, selectedType, sortField, sortDirection]);

  const yearsToDisplay = availableYears.length > 0 
    ? availableYears 
    : [selectedYear];

  const _handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDocumentView = (doc: any) => {
    setSelectedDocument(doc);
    setShowDocumentViewer(true);
  };

  const handleCloseViewer = () => {
    setSelectedDocument(null);
    setShowDocumentViewer(false);
  };

  // Simple fallback icon function (keeps original behaviour)
  const getCategoryIcon = (category: string) => {
    const normalized = category.toLowerCase().replace(/[_\s]/g, '');
    switch (normalized) {
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
      case 'inversión': return '📈';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Cargando documentos…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
        <AlertCircle className="w-12 h-12 text-red-500 mr-4" />
        <p className="text-red-600 dark:text-red-400">{error || 'Error al cargar los documentos'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
              📄 Documentos de Transparencia
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              Accede a todos los documentos oficiales del municipio para el año {selectedYear}
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                {totalStats.totalDocuments} documentos disponibles
              </span>
            </p>
          </div>
          <YearSelector
            availableYears={yearsToDisplay}
            currentYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Total Documentos</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{totalStats.totalDocuments}</p>
              <p className="text-xs text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                Promedio: {(totalStats.totalSize / Math.max(totalStats.totalDocuments, 1)).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Verificados</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{totalStats.verified}</p>
              <p className="text-xs text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                {Math.round((totalStats.verified / Math.max(totalStats.totalDocuments, 1)) * 100)}% del total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Categorías</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{totalStats.categoriesCount}</p>
              <p className="text-xs text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Organizadas por tema</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Tamaño Total</p>
              <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{totalStats.totalSize.toFixed(1)} MB</p>
              <p className="text-xs text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Archivo digital</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Categories Summary */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-4">Documentos por Categoría</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => (
            <div
              key={category}
              className="flex items-center p-3 bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt transition-colors cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              <span className="text-2xl mr-3">{getCategoryIcon(category)}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{category.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{yearDocuments.filter(doc => doc.category === category).length} documentos</p>
              </div>
            </div>
          ))}
        </div>
        {categories.length > 8 && (
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-4 text-center">
            +{categories.length - 8} categorías más disponibles
          </p>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : `${getCategoryIcon(category)} ${category.replace(/_/g, ' ')}`}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Todos los tipos' : type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mr-2">
              {filteredDocuments.length} de {totalStats.totalDocuments}
            </span>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 dark:text-dark-text-tertiary'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 dark:text-dark-text-tertiary'}`}
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
              className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">{getCategoryIcon(doc.category)}</div>
                  <div className="flex items-center space-x-1">
                    {doc.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <span className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt px-2 py-1 rounded">
                      {doc.type?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2 line-clamp-2">{doc.title}</h3>

                <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary space-y-1 mb-4">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{formatFileSize(doc.size_mb * 1024 * 1024)}</span>
                  </div>
                  {doc.processing_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(doc.processing_date).toLocaleDateString('es-AR')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleDocumentView(doc)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </button>
                  <a
                    href={doc.url}
                    download
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt transition-colors"
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
        <div className="bg-white dark:bg-dark-surface rounded-xl-sm border border-gray-200 dark:border-dark-border overflow-hidden">
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
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-xl mr-3">{getCategoryIcon(doc.category)}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary max-w-xs truncate">{doc.title}</div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary max-xs truncate">{doc.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{doc.category.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {doc.type?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                    {formatFileSize(doc.size_mb * 1024 * 1024)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.verified ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDocumentView(doc)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 mr-4 flex items-center"
                      title="Ver documento"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </button>
                    <a
                      href={doc.url}
                      download
                      className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary hover:text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary flex items-center"
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

      {/* No results message */}
      {filteredDocuments.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">No hay documentos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
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

      {/* Unified Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Viewer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {selectedDocument.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  {selectedDocument.category} • {selectedDocument.type?.toUpperCase()}
                </p>
              </div>
              <button
                onClick={handleCloseViewer}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-alt"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 overflow-hidden">
              <ErrorBoundary>
                <UnifiedDocumentViewer
                  documents={[{
                    id: selectedDocument.id,
                    title: selectedDocument.title,
                    filename: selectedDocument.filename,
                    category: selectedDocument.category,
                    year: selectedYear,
                    size_mb: selectedDocument.size_mb,
                    url: selectedDocument.url,
                    verification_status: selectedDocument.verified ? 'verified' : 'pending',
                    processing_date: selectedDocument.processing_date,
                    file_type: selectedDocument.type
                  }]}
                  documentId={selectedDocument.id}
                  showList={false}
                  className="h-full"
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Data Sources Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mt-8">
        <div className="flex items-start">
          <FileText className="h-6 w-6 text-blue-500 mt-1 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Fuentes de Datos</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• <strong>Base de datos:</strong> Documentos verificados y procesados automáticamente</p>
              <p>• <strong>Archivos organizados:</strong> Análisis por categorías y exportaciones CSV</p>
              <p>• <strong>Portal oficial:</strong> Documentos públicos según Ley de Acceso a la Información</p>
              <p>• <strong>Verificación:</strong> Todos los documentos pasan por controles de integridad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;