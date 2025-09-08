import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  BarChart3,
  Activity,
  TrendingUp,
  Loader2,
  AlertCircle,
  Database,
  Eye,
  Filter,
  Grid,
  List,
  Search
} from 'lucide-react';
import { consolidatedApiService } from '../services/ConsolidatedApiService';
import UnifiedDocumentViewer from '../components/viewers/UnifiedDocumentViewer';
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import YearlyDataChart from '../components/charts/YearlyDataChart';

interface Document {
  id: string;
  title: string;
  category: string;
  year: number;
  size_mb: string;
  url?: string;
  file_type?: string;
  document_type?: string;
  verification_status: string;
  processing_date: string;
  content?: string;
  integrity_verified: boolean;
  filename: string;
}

interface DocumentStats {
  total: number;
  verified: number;
  categories: { [key: string]: number };
  years: { [key: number]: number };
  sizes: { small: number; medium: number; large: number };
  types: { [key: string]: number };
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [activeTab, setActiveTab] = useState<string>('documents');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, selectedCategory, selectedYear, selectedType]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const docs = await consolidatedApiService.getDocuments();
      setDocuments(docs);
      calculateStats(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Error cargando documentos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs: Document[]) => {
    const stats: DocumentStats = {
      total: docs.length,
      verified: docs.filter(d => d.integrity_verified || d.verification_status === 'verified').length,
      categories: {},
      years: {},
      sizes: { small: 0, medium: 0, large: 0 },
      types: {}
    };

    docs.forEach(doc => {
      // Categories
      stats.categories[doc.category] = (stats.categories[doc.category] || 0) + 1;
      
      // Years
      stats.years[doc.year] = (stats.years[doc.year] || 0) + 1;
      
      // Sizes
      const size = parseFloat(doc.size_mb || '0');
      if (size < 1) stats.sizes.small++;
      else if (size < 10) stats.sizes.medium++;
      else stats.sizes.large++;
      
      // Types
      const type = doc.file_type || doc.document_type || 'unknown';
      stats.types[type] = (stats.types[type] || 0) + 1;
    });

    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...documents];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.category.toLowerCase().includes(searchLower) ||
        (doc.content && doc.content.toLowerCase().includes(searchLower))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(doc => doc.year === selectedYear);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => 
        (doc.file_type || doc.document_type || 'unknown') === selectedType
      );
    }

    setFilteredDocuments(filtered);
  };

  const getCategories = () => {
    return ['all', ...Array.from(new Set(documents.map(doc => doc.category)))];
  };

  const getYears = () => {
    const years = Array.from(new Set(documents.map(doc => doc.year))).sort((a, b) => b - a);
    return ['all', ...years];
  };

  const getTypes = () => {
    const types = Array.from(new Set(documents.map(doc => doc.file_type || doc.document_type || 'unknown')));
    return ['all', ...types];
  };

  const tabs = [
    { id: 'documents', label: 'Documentos', icon: <FileText className="w-5 h-5" /> },
    { id: 'analytics', label: 'Análisis', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'statistics', label: 'Estadísticas', icon: <TrendingUp className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando Documentos</h2>
          <p className="text-gray-600">Obteniendo la información más reciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDocuments}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Portal de Documentos
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Acceso completo a documentos municipales de transparencia
                </p>
              </div>

              {stats && (
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-500">Documentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                    <div className="text-sm text-gray-500">Verificados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(stats.categories).length}
                    </div>
                    <div className="text-sm text-gray-500">Categorías</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros y Búsqueda
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getCategories().map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Todas las categorías' : category}
                    </option>
                  ))}
                </select>

                {/* Year Filter */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getYears().map(year => (
                    <option key={year} value={year}>
                      {year === 'all' ? 'Todos los años' : year}
                    </option>
                  ))}
                </select>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getTypes().map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'Todos los tipos' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredDocuments.length} de {documents.length} documentos
                </p>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Vista:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-l-lg`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-r-lg`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Viewer */}
            <UnifiedDocumentViewer
              documents={filteredDocuments}
              showList={true}
              defaultView={viewMode}
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
            />
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Análisis de Documentos
                </h3>
                <DocumentAnalysisChart 
                  documents={documents}
                  height={300}
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Datos por Año
                </h3>
                <YearlyDataChart 
                  documents={documents}
                  height={300}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Documents */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total Documentos</p>
                  </div>
                </div>
              </div>

              {/* Verified Documents */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                    <p className="text-sm text-gray-500">Verificados</p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <Database className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.categories).length}</p>
                    <p className="text-sm text-gray-500">Categorías</p>
                  </div>
                </div>
              </div>

              {/* Years */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.years).length}</p>
                    <p className="text-sm text-gray-500">Años Cubiertos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Categories Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Categoría</h3>
                <div className="space-y-3">
                  {Object.entries(stats.categories)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate">{category}</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Years Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Año</h3>
                <div className="space-y-3">
                  {Object.entries(stats.years)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .slice(0, 10)
                    .map(([year, count]) => (
                    <div key={year} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{year}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Tamaño</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pequeño (&lt; 1MB)</span>
                    <span className="text-sm font-medium text-gray-900">{stats.sizes.small}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mediano (1-10MB)</span>
                    <span className="text-sm font-medium text-gray-900">{stats.sizes.medium}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Grande (&gt; 10MB)</span>
                    <span className="text-sm font-medium text-gray-900">{stats.sizes.large}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Documents;