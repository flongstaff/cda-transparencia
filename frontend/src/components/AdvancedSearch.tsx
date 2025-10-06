/**
 * AdvancedSearch Component
 * Enhanced search with faceted filtering, clustering, and advanced search options
 * Follows AAIP guidelines for transparency and user awareness
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, SlidersHorizontal, FolderTree, Sparkles, Info, Clock, BarChart3, FileText, Database, Building, DollarSign, Users, X, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { advancedSearchService, FacetFilters, ClusteringResult } from '../services/advancedSearchService';
import { semanticSearchService, SearchResponse, SearchResult } from '../services/semanticSearchService';
import { useData } from '../contexts/DataContext';

interface AdvancedSearchProps {
  onResults?: (results: any[]) => void;
  compact?: boolean;
}

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface ActiveFilter {
  category: string;
  value: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onResults, compact = false }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<ActiveFilter[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>('relevance');
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [facetFilters, setFacetFilters] = useState<FacetFilters | null>(null);
  const [showFacets, setShowFacets] = useState<boolean>(true);
  const [clusters, setClusters] = useState<ClusteringResult | null>(null);
  const [showClusters, setShowClusters] = useState<boolean>(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { state } = useData();

  // Get suggestions as user types
  useEffect(() => {
    if (query.length > 2) {
      const timer = setTimeout(() => {
        semanticSearchService.getSuggestions(query)
          .then(setSuggestions)
          .catch(() => setSuggestions([]));
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Get facet filters when query or filters change
  useEffect(() => {
    if (query.trim() || selectedFilters.length > 0) {
      fetchFacetFilters();
    }
  }, [query, selectedFilters]);

  // Fetch facet filters
  const fetchFacetFilters = async () => {
    try {
      const filters: Record<string, any> = {};
      selectedFilters.forEach(filter => {
        if (filter.category) {
          filters[filter.category] = filter.value;
        }
      });

      const response = await advancedSearchService.getFacetFilters(
        query,
        filters.category,
        filters.year ? parseInt(filters.year) : undefined,
        filters.type,
        filters.source
      );
      
      setFacetFilters(response);
    } catch (err) {
      console.error('Facet filters error:', err);
    }
  };

  // Perform search when query changes
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setResults([]);
      setFilteredResults([]);
    }
  }, [query, selectedFilters, sortBy]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build filter object from selected filters
      const filters: Record<string, any> = {};
      selectedFilters.forEach(filter => {
        if (filter.category) {
          filters[filter.category] = filter.value;
        }
      });

      const searchResponse: SearchResponse = await advancedSearchService.advancedSearch(query, {
        size: 20,
        filters,
        sortBy,
        sortOrder: sortBy === 'date' ? 'desc' : 'desc'
      });

      // Format results with transparency information
      const formattedResults = searchResponse.results.map(result => ({
        ...result,
        formattedDate: new Date(result.date || result.lastModified || result.indexedAt).toLocaleDateString('es-AR'),
        highlightedContent: result.highlight?.content ? result.highlight.content.join(' ... ') : result.content?.substring(0, 200) + '...',
        highlightedTitle: result.highlight?.title ? result.highlight.title[0] : result.title,
        aiExplanation: result.aiMethod ? 
          `Resultados generados usando ${result.aiMethod}` : 
          'Resultados generados con técnicas de búsqueda avanzada'
      }));
      
      setResults(formattedResults);
      setFilteredResults(formattedResults);
      
      // Set AI explanation from response
      setAiExplanation(searchResponse.aiUsage?.explained ? 
        `Resultados generados usando búsqueda avanzada (${searchResponse.aiUsage?.method})` : 
        'Resultados generados con técnicas de búsqueda avanzada');
      
      // Get search stats for transparency
      semanticSearchService.getSearchStats().then(setSearchStats);

      if (onResults) {
        onResults(formattedResults);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error al realizar la búsqueda');
      setResults([]);
      setFilteredResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get document clusters
  const loadClusters = async () => {
    if (!results || results.length === 0) return;

    try {
      const clusterResult = await advancedSearchService.getDocumentClusters(query, {});
      const formattedClusters = advancedSearchService.formatClusters(clusterResult);
      setClusters(formattedClusters);
      setShowClusters(true);
    } catch (err) {
      console.error('Clustering error:', err);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...results];
    
    // Apply filters
    selectedFilters.forEach(filter => {
      filtered = filtered.filter(item => {
        if (filter.category === 'category') {
          return item.category === filter.value;
        } else if (filter.category === 'year') {
          return item.year?.toString() === filter.value || 
                 (item.lastModified && new Date(item.lastModified).getFullYear().toString() === filter.value);
        } else if (filter.category === 'type') {
          return item.type === filter.value;
        } else if (filter.category === 'source') {
          return item.source === filter.value;
        } else if (filter.category === 'tag') {
          return item.tags && item.tags.includes(filter.value);
        }
        return true;
      });
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'relevance') {
        return b.score - a.score;
      } else if (sortBy === 'date') {
        return new Date(b.lastModified || b.indexedAt).getTime() - new Date(a.lastModified || a.indexedAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    
    setFilteredResults(filtered);
  }, [results, selectedFilters, sortBy]);

  const toggleFilter = (category: string, value: string) => {
    const filterExists = selectedFilters.some(f => f.category === category && f.value === value);
    
    if (filterExists) {
      setSelectedFilters(prev => prev.filter(f => !(f.category === category && f.value === value)));
    } else {
      setSelectedFilters(prev => [...prev, { category, value }]);
    }
  };

  const removeFilter = (category: string, value: string) => {
    setSelectedFilters(prev => prev.filter(f => !(f.category === category && f.value === value)));
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      pdf: <FileText className="w-5 h-5 text-red-600" />,
      document: <FileText className="w-5 h-5 text-blue-600" />,
      spreadsheet: <Database className="w-5 h-5 text-green-600" />,
      csv: <Database className="w-5 h-5 text-purple-600" />,
      json: <Database className="w-5 h-5 text-yellow-600" />,
      xml: <Database className="w-5 h-5 text-pink-600" />,
      webpage: <FileText className="w-5 h-5 text-gray-600" />,
      contract: <Building className="w-5 h-5 text-orange-600" />,
      budget: <DollarSign className="w-5 h-5 text-green-600" />,
      expense: <DollarSign className="w-5 h-5 text-red-600" />,
      ordinance: <FileText className="w-5 h-5 text-indigo-600" />,
      decree: <FileText className="w-5 h-5 text-teal-600" />
    };
    return icons[type] || <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      document: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      spreadsheet: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      csv: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      json: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      xml: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200',
      webpage: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      contract: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      budget: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      expense: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      ordinance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
      decree: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (compact) {
    return (
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en transparencia..."
              className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary shadow-sm"
              onFocus={() => query.length > 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        </form>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                onClick={() => selectSuggestion(suggestion)}
              >
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-800 dark:text-gray-200">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Search className="w-8 h-8 mr-3 text-blue-600" />
            Búsqueda Avanzada en el Portal
            <span className="ml-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Búsqueda Inteligente
            </span>
          </h1>
          
          {/* AI Transparency Badge */}
          <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1.5 rounded-full">
            <Info className="w-4 h-4 mr-1" />
            Búsqueda Avanzada
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Busque en documentos, datos, gráficos y todo el contenido del portal de transparencia usando lenguaje natural y filtros avanzados
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: ¿Cuánto se gastó en infraestructura en 2024? o presupuesto educación"
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary shadow-sm"
              onFocus={() => query.length > 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        </form>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                onClick={() => selectSuggestion(suggestion)}
              >
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-800 dark:text-gray-200">{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {/* Popular Searches */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Consultas populares:</span>
          {['presupuesto 2024', 'ejecución gastos', 'contratos', 'ingresos municipales', 'deuda pública', 'licitaciones 2024'].map((term, index) => (
            <button
              key={index}
              onClick={() => setQuery(term)}
              className="text-sm px-3 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface hover:shadow-sm transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* AI Transparency Notice */}
      {query && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Sistema de Búsqueda Inteligente</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                {aiExplanation || "Esta búsqueda utiliza procesamiento de lenguaje natural para entender su consulta y encontrar resultados relevantes incluso si no contienen las mismas palabras exactas."}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                <Clock className="h-3 w-3 inline mr-1" />
                Los resultados se generan sin almacenar su consulta personalmente. 
                <a href="/privacy" className="ml-1 underline hover:text-blue-800">Más sobre privacidad</a>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:w-1/4 ${showFacets ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filtros
              </h3>
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowFacets(!showFacets)}
              >
                {showFacets ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {selectedFilters.length > 0 && (
              <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtros activos ({selectedFilters.length})
                  </span>
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Limpiar todo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.map((filter, index) => (
                    <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                      {filter.label || filter.value}
                      <button 
                        onClick={() => removeFilter(filter.category, filter.value)}
                        className="ml-1 text-blue-600 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            {facetFilters?.formattedFacets?.categories && facetFilters.formattedFacets.categories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Categorías
                </h4>
                <div className="space-y-1">
                  {facetFilters.formattedFacets.categories.slice(0, 10).map((cat: any) => (
                    <div key={cat.id} className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.some(f => f.category === 'category' && f.value === cat.id)}
                          onChange={() => toggleFilter('category', cat.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate">{cat.label}</span>
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Year Filter */}
            {facetFilters?.formattedFacets?.years && facetFilters.formattedFacets.years.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Año
                </h4>
                <div className="space-y-1">
                  {facetFilters.formattedFacets.years.slice(0, 10).map((year: any) => (
                    <div key={year.id} className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.some(f => f.category === 'year' && f.value === year.id)}
                          onChange={() => toggleFilter('year', year.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{year.label}</span>
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {year.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Type Filter */}
            {facetFilters?.formattedFacets?.types && facetFilters.formattedFacets.types.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Database className="w-4 h-4 mr-1" />
                  Tipo
                </h4>
                <div className="space-y-1">
                  {facetFilters.formattedFacets.types.slice(0, 10).map((type: any) => (
                    <div key={type.id} className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.some(f => f.category === 'type' && f.value === type.id)}
                          onChange={() => toggleFilter('type', type.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {type.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Filter */}
            {facetFilters?.formattedFacets?.sources && facetFilters.formattedFacets.sources.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  Fuente
                </h4>
                <div className="space-y-1">
                  {facetFilters.formattedFacets.sources.slice(0, 10).map((source: any) => (
                    <div key={source.id} className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.some(f => f.category === 'source' && f.value === source.id)}
                          onChange={() => toggleFilter('source', source.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{source.label}</span>
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {source.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clustering Section */}
            {results.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <FolderTree className="w-4 h-4 mr-1" />
                  Agrupación de Resultados
                </h4>
                <button
                  onClick={loadClusters}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <FolderTree className="w-4 h-4 mr-1" />
                  Agrupar resultados
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:w-3/4">
          {query && (
            <div className="mb-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Buscando con inteligencia...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analizando "{query}" con nuestro sistema de búsqueda avanzada
                  </p>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                      Error en la búsqueda
                    </h3>
                  </div>
                  <p className="mt-2 text-red-700 dark:text-red-300">
                    {error}
                  </p>
                  <button
                    onClick={() => setQuery('')}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Nueva búsqueda
                  </button>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No hay resultados para "{query}". Intente con otros términos de búsqueda.
                  </p>
                  <button
                    onClick={() => setQuery('')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Nueva búsqueda
                  </button>
                </div>
              ) : (
                <>
                  {/* Filters and Sorting */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                        {filteredResults.length} resultado{filteredResults.length !== 1 ? 's' : ''}
                      </span>
                      
                      {selectedFilters.length > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <SlidersHorizontal className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Ordenar:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary px-2 py-1"
                        >
                          <option value="relevance">Relevancia</option>
                          <option value="date">Fecha</option>
                          <option value="title">Título</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Clusters Display */}
                  {showClusters && clusters && clusters.clusters.length > 0 && (
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <FolderTree className="w-5 h-5 mr-2 text-blue-600" />
                          Grupos de Documentos Similares
                        </h3>
                        <button 
                          onClick={() => setShowClusters(false)}
                          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Ocultar
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {clusters.clusters.map((cluster, index) => (
                          <div key={cluster.id} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {cluster.name}
                              </h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {cluster.documents.length} documentos
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {cluster.documents.slice(0, 4).map((doc, docIndex) => (
                                <div 
                                  key={docIndex}
                                  className="p-3 border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-alt transition-colors cursor-pointer"
                                  onClick={() => {
                                    if (doc.url) {
                                      window.open(doc.url, '_blank');
                                    } else {
                                      navigate(`/search/result/${doc.id}`);
                                    }
                                  }}
                                >
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 p-2 rounded bg-gray-50 dark:bg-dark-surface-alt mr-3">
                                      {getTypeIcon(doc.type || 'document')}
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                                        {doc.title}
                                      </h5>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {doc.formattedDate}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {cluster.documents.length > 4 && (
                                <div className="flex items-center justify-center p-3 border border-dashed border-gray-300 dark:border-dark-border rounded-lg text-gray-500 dark:text-gray-400 text-sm">
                                  +{cluster.documents.length - 4} más...
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Results List */}
                  <div className="space-y-4">
                    {filteredResults.map((result, index) => (
                      <div 
                        key={result.id || index}
                        className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          // Navigate to the result URL if available, otherwise to a detail page
                          if (result.url) {
                            window.open(result.url, '_blank');
                          } else {
                            // Navigate to a search result detail page
                            navigate(`/search/result/${result.id}`);
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface-alt mr-4">
                            {getTypeIcon(result.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 
                                className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary truncate"
                                dangerouslySetInnerHTML={{ __html: result.highlightedTitle }}
                              />
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(result.type)}`}>
                                {result.type}
                              </span>
                            </div>
                            
                            <p 
                              className="text-gray-600 dark:text-dark-text-secondary text-sm mb-3"
                              dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
                            />
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-dark-text-tertiary">
                              <div className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                <span>{result.category}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{result.formattedDate}</span>
                              </div>
                              
                              {result.year && (
                                <div className="flex items-center">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  <span>{result.year}</span>
                                </div>
                              )}
                              
                              {result.source && (
                                <div className="flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  <span>{result.source}</span>
                                </div>
                              )}
                            </div>
                            
                            {result.tags && result.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {result.tags.map((tag: string, tagIndex: number) => (
                                  <span 
                                    key={tagIndex} 
                                    className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-shrink-0 ml-4 text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Relevancia</div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {result.score ? Math.round(result.score * 100) + '%' : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Processing Information */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                          Procesado con búsqueda avanzada • {result.processingTime}ms
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredResults.length > 10 && (
                    <div className="mt-8 flex items-center justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de{' '}
                        <span className="font-medium">{filteredResults.length}</span> resultados
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 rounded-md bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary text-sm hover:bg-gray-200 dark:hover:bg-dark-surface">
                          Anterior
                        </button>
                        <button className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">
                          1
                        </button>
                        <button className="px-3 py-1 rounded-md bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary text-sm hover:bg-gray-200 dark:hover:bg-dark-surface">
                          2
                        </button>
                        <button className="px-3 py-1 rounded-md bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary text-sm hover:bg-gray-200 dark:hover:bg-dark-surface">
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!query && (
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                Consejos para una mejor búsqueda avanzada
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
                  <span>Formule preguntas como \"¿Cuánto se gastó en infraestructura en 2024?\"</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
                  <span>Haga búsquedas conceptuales: \"contratos sospechosos\", \"gasto en salud\"</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
                  <span>Combine años y temas: \"presupuesto 2023 educación\", \"licitaciones 2024\"</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
                  <span>Use los filtros para restringir los resultados por categoría, año o tipo</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;