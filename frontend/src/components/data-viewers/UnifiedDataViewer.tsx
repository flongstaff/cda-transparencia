import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Database, 
  Table, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Search, 
  Filter, 
  Download,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import DatasetCard from './DatasetCard';
import PDFGallery from './PDFGallery';
import UnifiedSearch from '../search/UnifiedSearch';

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  formats: string[];
  size: string;
  lastUpdated: string;
  url: string;
  accessibility: {
    compliant: boolean;
    standards: string[];
  };
  source: string;
  license: string;
  tags: string[];
  updateFrequency: string;
  downloads: number;
}

interface PDFDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  lastUpdated: string;
  url: string;
  tags: string[];
  source: string;
  page: string;
}

interface UnifiedDataViewerProps {
  title?: string;
  description?: string;
  datasets?: Dataset[];
  documents?: PDFDocument[];
  showFilters?: boolean;
  showSearch?: boolean;
  defaultView?: 'grid' | 'table';
  maxPreviewItems?: number;
}

const UnifiedDataViewer: React.FC<UnifiedDataViewerProps> = ({
  title = "Visor de Datos Unificado",
  description = "Explora y accede a todos los conjuntos de datos y documentos disponibles en formato unificado",
  datasets,
  documents = [],
  showFilters = true,
  showSearch = true,
  defaultView = 'grid',
  maxPreviewItems = 12
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [currentView, setCurrentView] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20; // More efficient pagination

  // Get unique categories, formats and sources for filter dropdowns
  const categories = useMemo(() => 
    Array.from(new Set([
      ...datasets?.map(d => d.category) || [], 
      ...documents?.map(d => d.category) || []
    ])), [datasets, documents]
  );
  
  const formats = useMemo(() => 
    Array.from(new Set(datasets?.flatMap(d => d.formats) || [])), [datasets]
  );
  
  const sources = useMemo(() => 
    Array.from(new Set(datasets?.map(d => d.source) || [])), [datasets]
  );

  // Memoized filtering to prevent unnecessary recalculations
  const filteredResults = useMemo(() => {
    let filteredDs = datasets || [];
    let filteredDocs = documents || [];

    if (searchTerm) {
      filteredDs = filteredDs.filter(dataset =>
        dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      filteredDocs = filteredDocs.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filteredDs = filteredDs.filter(dataset => dataset.category === selectedCategory);
      filteredDocs = filteredDocs.filter(doc => doc.category === selectedCategory);
    }
    
    if (selectedFormat !== 'all') {
      filteredDs = filteredDs.filter(dataset => dataset.formats.includes(selectedFormat.toLowerCase()));
    }
    
    if (selectedSource !== 'all') {
      filteredDs = filteredDs.filter(dataset => dataset.source === selectedSource);
    }

    return { filteredDatasets: filteredDs, filteredDocuments: filteredDocs };
  }, [searchTerm, selectedCategory, selectedFormat, selectedSource, datasets, documents]);

  // Update filtered data when filters change
  useEffect(() => {
    setLoading(true);
    // Simulate loading time for large datasets
    const timer = setTimeout(() => {
      setFilteredDatasets(filteredResults.filteredDatasets);
      setFilteredDocuments(filteredResults.filteredDocuments);
      setCurrentPage(1); // Reset to first page when filters change
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [filteredResults]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDatasets = filteredDatasets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage);

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentDatasets.map((dataset) => (
        <DatasetCard 
          key={dataset.id} 
          dataset={dataset} 
          showDownloadButton={true}
          showDetailsLink={true}
        />
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-dark-background">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Título
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Formatos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tamaño
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actualizado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
          {currentDatasets.map((dataset) => (
            <tr key={dataset.id} className="hover:bg-gray-50 dark:hover:bg-dark-background transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  {dataset.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {dataset.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                  {dataset.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {dataset.formats.map((format, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
                      {format.toUpperCase()}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {dataset.size}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(dataset.lastUpdated)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <a
                    href={dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </a>
                  <a
                    href={dataset.url}
                    download
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </a>
                  <a
                    href={dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
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
  );

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              {title}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('grid')}
              className={`p-2 rounded-lg ${currentView === 'grid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-background'}`}
              title="Vista de cuadrícula"
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`p-2 rounded-lg ${currentView === 'table' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-background'}`}
              title="Vista de tabla"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>
        )}

        {/* Unified Search Component */}
        <div className="mb-6">
          <UnifiedSearch 
            allDatasets={datasets || []}
            allDocuments={documents || []}
            placeholder="Buscar en todos los datasets y documentos..."
            onSearch={(results) => {
              // Handle the search results
              // For now, we'll just update the filtered results
              setFilteredDatasets(results.filter(item => (item as Dataset).formats !== undefined) as Dataset[]);
              setFilteredDocuments(results.filter(item => (item as Dataset).formats === undefined) as PDFDocument[]);
            }}
          />
        </div>

        {/* Filters and Search */}
        {showSearch && showFilters && (
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                aria-label="Filtrar por categoría"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                aria-label="Filtrar por formato"
              >
                <option value="all">Todos los formatos</option>
                {formats.map(format => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                aria-label="Filtrar por fuente"
              >
                <option value="all">Todas las fuentes</option>
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {filteredDatasets.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-300">Conjuntos de datos</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {filteredDocuments.length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-300">Documentos PDF</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            {categories.length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-300">Categorías</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {sources.length}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-300">Fuentes</div>
        </div>
      </div>

      {/* Data View */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            Conjuntos de Datos
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredDatasets.length)} de {filteredDatasets.length} resultados
          </div>
        </div>
        
        {currentView === 'grid' ? renderGridView() : renderTableView()}
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-background'}`}
              >
                Anterior
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-background'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-background'}`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
        
        {filteredDatasets.length === 0 && !loading && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              No se encontraron datos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta con otros términos de búsqueda o categorías
            </p>
          </div>
        )}
      </div>

      {/* PDF Documents Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
          Documentos PDF
        </h3>
        
        <PDFGallery 
          documents={filteredDocuments} 
          maxDocuments={20}
        />
      </div>
    </div>
  );
};

export default UnifiedDataViewer;