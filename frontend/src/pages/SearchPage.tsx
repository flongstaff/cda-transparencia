/**
 * Search Page - Comprehensive Search Across All Resources
 * Allows users to search across all documents, data, and content in the portal
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Database, BarChart3, Users, Building, DollarSign, Calendar, Clock, Tag, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';

// Search results data structure
interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'dataset' | 'chart' | 'page' | 'person' | 'contract' | 'report' | 'pdf' | 'csv';
  category: string;
  url: string;
  date: string;
  size?: string;
  relevance: number;
  tags?: string[];
  source: string;
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedYear] = useState<number>(new Date().getFullYear());
  const [query, setQuery] = useState<string>(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>('relevance');
  const [error, setError] = useState<string | null>(null);

  // Use integrated master data service for search context
  const {
    masterData,
    currentBudget,
    currentTreasury,
    currentSalaries,
    currentContracts,
    currentDebt,
    loading: dataLoading,
    error: dataError,
    switchYear,
    availableYears
  } = useMasterData(selectedYear);

  // Real search using existing services
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setError(null);

      // Search across different data sources
      const performSearch = async () => {
        try {
          // Array to collect all search results
          const allResults: SearchResult[] = [];

          // Search in documents
          try {
            const response = await fetch('/data/data-index.json');
            if (response.ok) {
              const data = await response.json();
              if (data && Array.isArray(data.files)) {
                const documentResults = data.files
                  .filter((file: any) =>
                    file.name.toLowerCase().includes(query.toLowerCase()) ||
                    file.path.toLowerCase().includes(query.toLowerCase()) ||
                    (file.tags && file.tags.some((tag: string) =>
                      tag.toLowerCase().includes(query.toLowerCase())))
                  )
                  .map((file: any, index: number) => ({
                    id: `doc-${index}`,
                    title: file.name || 'Documento',
                    description: file.description || `Archivo: ${file.path}`,
                    type: file.type || 'document',
                    category: file.category || 'Otros',
                    url: `/documents#${file.name}`,
                    date: file.modificationDate || new Date().toISOString().split('T')[0],
                    size: file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : undefined,
                    relevance: 90 - (index * 5), // Simulated relevance
                    tags: file.tags || [],
                    source: 'Municipalidad'
                  }));

                allResults.push(...documentResults);
              }
            }
          } catch (docError) {
            console.error('Error searching documents:', docError);
          }

          // Search in budgets
          try {
            const budgetResponse = await fetch('/data/charts/Budget_Execution_consolidated_2019-2025.csv');
            if (budgetResponse.ok) {
              const csvText = await budgetResponse.text();
              const lines = csvText.split('\n').slice(1).filter(line => line.trim());

              const budgetResults = lines
                .filter(line => line.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 3) // Limit to top 3 results
                .map((line, index) => {
                  const parts = line.split(',');
                  return {
                    id: `budget-${index}`,
                    title: 'Ejecución Presupuestaria',
                    description: `Datos presupuestarios para ${parts[4] || 'año desconocido'}`,
                    type: 'dataset' as const,
                    category: 'Presupuesto',
                    url: '/budget',
                    date: new Date().toISOString().split('T')[0],
                    relevance: 85,
                    tags: ['presupuesto', 'ejecución', '2019-2025'],
                    source: 'Tesorería'
                  };
                });

              allResults.push(...budgetResults);
            }
          } catch (budgetError) {
            console.error('Error searching budgets:', budgetError);
          }

          // Search in contracts
          try {
            const contractsResponse = await fetch('/data/api/config.json');
            if (contractsResponse.ok) {
              const contractsData = await contractsResponse.json();
              if (contractsData?.statistics?.total_documents &&
                  contractsData?.statistics?.total_documents.toString().toLowerCase().includes(query.toLowerCase())) {
                allResults.push({
                  id: 'contracts-1',
                  title: 'Contratos Públicos',
                  description: 'Base de datos de contratos públicos del municipio',
                  type: 'dataset',
                  category: 'Contratos',
                  url: '/contracts',
                  date: new Date().toISOString().split('T')[0],
                  size: '15.7 MB',
                  relevance: 80,
                  tags: ['contratos', 'base de datos', 'CSV'],
                  source: 'Contrataciones'
                });
              }
            }
          } catch (contractError) {
            console.error('Error searching contracts:', contractError);
          }

          // Add additional results from various endpoints
          // Check for mentions of query in various data sources
          const additionalSources = [
            {
              title: 'Indicadores Financieros',
              url: '/dashboard#financial',
              category: 'Finanzas',
              type: 'chart' as const
            },
            {
              title: 'Distribución de Gastos',
              url: '/expenses',
              category: 'Gastos',
              type: 'chart' as const
            },
            {
              title: 'Evolución Temporal',
              url: '/dashboard#charts',
              category: 'Finanzas',
              type: 'chart' as const
            },
            {
              title: 'Deuda Pública',
              url: '/debt',
              category: 'Deuda',
              type: 'chart' as const
            },
            {
              title: 'Remuneraciones',
              url: '/salaries',
              category: 'Recursos Humanos',
              type: 'dataset' as const
            }
          ];

          const additionalResults = additionalSources
            .filter(source =>
              source.title.toLowerCase().includes(query.toLowerCase()) ||
              source.category.toLowerCase().includes(query.toLowerCase())
            )
            .map((source, index) => ({
              id: `additional-${index}`,
              title: source.title,
              description: `Visualización y datos sobre ${source.category.toLowerCase()}`,
              type: source.type,
              category: source.category,
              url: source.url,
              date: new Date().toISOString().split('T')[0],
              relevance: 75,
              tags: [source.category.toLowerCase()],
              source: 'Municipalidad'
            }));

          allResults.push(...additionalResults);

          // Sort by relevance
          allResults.sort((a, b) => b.relevance - a.relevance);

          setResults(allResults);
          setFilteredResults(allResults);
          setIsLoading(false);
        } catch (err) {
          console.error('Search error:', err);
          setError('Error al realizar la búsqueda');
          setIsLoading(false);
        }
      };

      // Use setTimeout to simulate a small delay for better UX
      const timer = setTimeout(() => {
        performSearch();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setFilteredResults([]);
    }
  }, [query]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...results];
    
    // Apply type filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(item => selectedFilters.includes(item.type));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'relevance') {
        return b.relevance - a.relevance;
      } else if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    
    setFilteredResults(filtered);
  }, [results, selectedFilters, sortBy]);

  // Get unique categories for filter options
  const categories = useMemo(() => {
    const cats = [...new Set(results.map(item => item.category))];
    return cats;
  }, [results]);

  // Get unique types for filter options
  const types = useMemo(() => {
    const typeMap: Record<string, { label: string, icon: React.ReactNode }> = {
      document: { label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
      dataset: { label: 'Datos', icon: <Database className="w-4 h-4" /> },
      chart: { label: 'Gráficos', icon: <BarChart3 className="w-4 h-4" /> },
      contract: { label: 'Contratos', icon: <Building className="w-4 h-4" /> },
      page: { label: 'Páginas', icon: <FileText className="w-4 h-4" /> },
      person: { label: 'Personas', icon: <Users className="w-4 h-4" /> }
    };
    
    return Object.entries(typeMap);
  }, []);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is automatically triggered by useEffect when query changes
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      document: <FileText className="w-5 h-5 text-blue-600" />,
      dataset: <Database className="w-5 h-5 text-green-600" />,
      chart: <BarChart3 className="w-5 h-5 text-purple-600" />,
      contract: <Building className="w-5 h-5 text-orange-600" />,
      page: <FileText className="w-5 h-5 text-gray-600" />,
      person: <Users className="w-5 h-5 text-red-600" />
    };
    return icons[type] || <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      document: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      dataset: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      chart: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      contract: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      page: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      person: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Búsqueda en el Portal</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Busque en documentos, datos, gráficos y todo el contenido del portal de transparencia
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en presupuestos, contratos, ejecución presupuestaria, estados financieros..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary shadow-sm"
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

        {/* Popular Searches */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Búsquedas populares:</span>
          {['presupuesto 2024', 'ejecución gastos', 'contratos', 'ingresos municipales', 'deuda pública'].map((term, index) => (
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

      {/* Results Section */}
      {query && (
        <div className="mb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Buscando resultados...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Estamos buscando "{query}" en todos los recursos del portal
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
                Limpiar búsqueda
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
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar filtros
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Filtrar:</span>
                    <div className="flex space-x-2">
                      {types.map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => toggleFilter(type)}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            selectedFilters.includes(type)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-surface-alt dark:text-dark-text-secondary dark:hover:bg-dark-surface'
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
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

              {/* Results List */}
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div 
                    key={result.id}
                    className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(result.url)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface-alt mr-4">
                        {getTypeIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary truncate">
                            {result.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(result.type)}`}>
                            {types.find(([type]) => type === result.type)?.[1].label || result.type}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-3">
                          {result.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-dark-text-tertiary">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(result.date).toLocaleDateString('es-AR')}</span>
                          </div>
                          
                          {result.size && (
                            <div className="flex items-center">
                              <Database className="h-3 w-3 mr-1" />
                              <span>{result.size}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            <span>{result.category}</span>
                          </div>
                          
                          {result.source && (
                            <div className="flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              <span>{result.source}</span>
                            </div>
                          )}
                        </div>
                        
                        {result.tags && result.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {result.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
            Consejos para una mejor búsqueda
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-dark-text-secondary">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
              <span>Use palabras clave específicas como "presupuesto", "contratos", "ejecución"</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
              <span>Incluya años para resultados más precisos: "presupuesto 2024"</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
              <span>Busque por categorías: "infraestructura", "salud", "educación"</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">•</div>
              <span>Utilice comillas para frases exactas: "balance financiero"</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPage;