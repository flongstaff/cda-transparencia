import React, { useState, useEffect, useMemo } from 'react';
import { Search, Database, FileText, Filter, X, Calendar, Download, Eye, ExternalLink } from 'lucide-react';
import { Dataset, PDFDocument } from '../../types';

interface UnifiedSearchProps {
  allDatasets: Dataset[];
  allDocuments: PDFDocument[];
  placeholder?: string;
  onSearch?: (results: (Dataset | PDFDocument)[]) => void;
}

const UnifiedSearch: React.FC<UnifiedSearchProps> = ({
  allDatasets,
  allDocuments,
  placeholder = "Buscar en todos los datos...",
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Dataset | PDFDocument)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    source: 'all',
    category: 'all',
    format: 'all'
  });

  // Combined data for searching
  const allData = useMemo(() => [...allDatasets, ...allDocuments], [allDatasets, allDocuments]);

  // Filter options
  const sources = useMemo(() => 
    Array.from(new Set(allData.map(item => (item as any).source).filter(Boolean))), 
    [allData]
  );
  
  const categories = useMemo(() => 
    Array.from(new Set(allData.map(item => item.category))), 
    [allData]
  );
  
  const formats = useMemo(() => 
    Array.from(new Set(allData.flatMap(item => 
      (item as any).formats ? (item as any).formats : [] as string[]
    ))), 
    [allData]
  );

  // Perform search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      if (onSearch) onSearch([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    const timer = setTimeout(() => {
      let results = allData.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Apply filters
      if (filters.source !== 'all') {
        results = results.filter(item => (item as any).source === filters.source);
      }
      
      if (filters.category !== 'all') {
        results = results.filter(item => item.category === filters.category);
      }
      
      if (filters.format !== 'all' && results.some(item => (item as any).formats)) {
        results = results.filter(item => 
          (item as any).formats && (item as any).formats.includes(filters.format)
        );
      }

      setSearchResults(results);
      setIsSearching(false);
      if (onSearch) onSearch(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters, allData, onSearch]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      source: 'all',
      category: 'all',
      format: 'all'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDataset = (item: Dataset | PDFDocument): item is Dataset => {
    return (item as Dataset).formats !== undefined;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
          aria-label="Buscar en todos los datos"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center">
          <Filter className="h-4 w-4 text-gray-500 mr-1" />
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
          >
            <option value="all">Todas las fuentes</option>
            {sources.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <select
            value={filters.format}
            onChange={(e) => handleFilterChange('format', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
          >
            <option value="all">Todos los formatos</option>
            {formats.map(format => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        
        {(filters.source !== 'all' || filters.category !== 'all' || filters.format !== 'all') && (
          <button
            onClick={clearFilters}
            className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (searchTerm || searchResults.length > 0) && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-dark-border">
            <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
              {isSearching 
                ? 'Buscando...' 
                : `${searchResults.length} ${searchResults.length === 1 ? 'resultado' : 'resultados'}`}
            </p>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`} 
                  className="p-3 hover:bg-gray-50 dark:hover:bg-dark-background transition-colors cursor-pointer"
                  onClick={() => {
                    // In a real implementation, this would navigate to the item
                    window.open(item.url, '_blank');
                  }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3">
                      {isDataset(item) ? (
                        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                          {item.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {isDataset(item) ? 'Dataset' : 'PDF'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {isDataset(item) && (
                          <>
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
                              {(item as Dataset).source}
                            </span>
                            <div className="mx-2">•</div>
                            <div className="flex flex-wrap gap-1">
                              {(item as Dataset).formats.map((format, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                                >
                                  {format.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                        {!isDataset(item) && (
                          <>
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
                              {(item as PDFDocument).source}
                            </span>
                          </>
                        )}
                        <div className="mx-2">•</div>
                        <span>{item.category}</span>
                        <div className="mx-2">•</div>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(item.lastUpdated)}
                        </span>
                      </div>
                      
                      <div className="flex items-center mt-2 space-x-3">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </a>
                        <a
                          href={item.url}
                          download
                          className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </a>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !isSearching && searchTerm ? (
            <div className="p-6 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                No se encontraron resultados
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;