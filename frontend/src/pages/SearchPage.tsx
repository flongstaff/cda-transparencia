/**
 * Search Page - Comprehensive Search Across All Resources
 * Allows users to search across all documents, data, and content in the portal
 * Enhanced with AI-powered semantic search capabilities
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Database, FileText } from 'lucide-react';
import SearchWithAI from '../components/SearchWithAI';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { UnifiedDataViewer } from '../components/data-viewers';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedSource, setSelectedSource] = useState<'all' | 'municipal' | 'national'>('all');
  const [selectedTheme, setSelectedTheme] = useState<string[]>([]);

  // Get search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
      setQuery(q);
    }
  }, []);

  // Simple handler to receive results from SearchWithAI component
  const handleResults = (results: any[]) => {
    setResults(results);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
            🔍 Búsqueda Integral
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Busque en 1,414 recursos: 201 PDFs municipales + 1,213 datasets (22 municipales, 1,191 nacionales)
          </p>
        </div>

        {/* Search Input */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en documentos, presupuestos, contratos, datos abiertos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface-alt text-gray-900 dark:text-dark-text-primary"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Año
                </label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                >
                  <option value="">Todos los años</option>
                  {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  <Database className="inline h-4 w-4 mr-1" />
                  Fuente
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                >
                  <option value="all">Todas las fuentes</option>
                  <option value="municipal">Solo municipal</option>
                  <option value="national">Solo nacional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Tipo
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="pdfs">Solo PDFs</option>
                  <option value="datasets">Solo Datasets</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* AI-Powered Search */}
        <div className="mb-8">
          <SearchWithAI onResults={handleResults} />
        </div>

        {/* Unified Data Viewer with Search Results */}
        <div className="mb-8">
          <ErrorBoundary>
            <UnifiedDataViewer
              title="Resultados de Búsqueda"
              description="Explore todos los documentos y datasets que coinciden con su búsqueda"
              searchTerm={searchTerm}
              year={selectedYear}
              source={selectedSource}
              showSearch={false}
              defaultTab="all"
              maxPDFs={50}
              maxDatasets={100}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const SearchPageWithErrorBoundary: React.FC = () => {
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
      <SearchPage />
    </ErrorBoundary>
  );
};

export default SearchPageWithErrorBoundary;