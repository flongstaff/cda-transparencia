import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, 
  FolderOpen, 
  Calendar, 
  CheckCircle, 
  ExternalLink, 
  Eye, 
  Search, 
  Filter, 
  BarChart3,
  Database,
  Globe,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import ComprehensivePDFViewer from '../components/documents/ComprehensivePDFViewer';
import ComprehensiveDataService, { DocumentLink } from '../services/ComprehensiveDataService';

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [documents, setDocuments] = useState<DocumentLink[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<DocumentLink | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'viewer' | 'comparison'>('list');
  const [stats, setStats] = useState<any>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const dataService = ComprehensiveDataService.getInstance();

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  useEffect(() => {
    if (documentId) {
      loadSpecificDocument(documentId);
    }
  }, [documentId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const allDocs = await dataService.getAllDocuments();
      setDocuments(allDocs);
      
      const years = await dataService.getAvailableYears();
      const categories = await dataService.getAvailableCategories();
      
      setAvailableYears(years);
      setAvailableCategories(categories);
      
      console.log(`✅ Loaded ${allDocs.length} comprehensive documents`);
      console.log(`📅 Available years: ${years.join(', ')}`);
      console.log(`📂 Available categories: ${categories.join(', ')}`);
      
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const comprehensiveStats = await dataService.getComprehensiveStats();
      setStats(comprehensiveStats);
      console.log('📊 Comprehensive stats loaded:', comprehensiveStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSpecificDocument = async (docId: string) => {
    try {
      const allDocs = await dataService.getAllDocuments();
      const doc = allDocs.find(d => d.id === docId);
      if (doc) {
        setSelectedDocument(doc);
        setViewMode('viewer');
      }
    } catch (error) {
      console.error('Error loading specific document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesYear = selectedYear === 'all' || doc.year === selectedYear;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesYear && matchesCategory && matchesSearch;
  });

  const handleDocumentSelect = (document: DocumentLink) => {
    setSelectedDocument(document);
    setViewMode('viewer');
    navigate(`/documents/${document.id}`);
  };

  const getDocumentTypeIcon = (docType: DocumentLink['document_type']) => {
    switch (docType) {
      case 'budget_execution': return <BarChart3 className="w-5 h-5 text-green-600" />;
      case 'financial_statement': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'debt_report': return <FileText className="w-5 h-5 text-red-600" />;
      case 'salary_report': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'tender': return <FolderOpen className="w-5 h-5 text-orange-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDocumentTypeBadge = (docType: DocumentLink['document_type']) => {
    const badges = {
      budget_execution: 'bg-green-100 text-green-800',
      financial_statement: 'bg-blue-100 text-blue-800',
      debt_report: 'bg-red-100 text-red-800',
      salary_report: 'bg-purple-100 text-purple-800',
      tender: 'bg-orange-100 text-orange-800',
      ordinance: 'bg-gray-100 text-gray-800'
    };

    return badges[docType] || badges.ordinance;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we have a selected document or we're viewing a specific document
  if (viewMode !== 'list' || documentId) {
    return (
      <ComprehensivePDFViewer
        documentId={documentId || selectedDocument?.id}
        showComparison={viewMode === 'comparison'}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portal de Documentos</h1>
            <p className="text-blue-100">
              Carmen de Areco - Documentos Oficiales Verificados
            </p>
          </div>
          {stats && (
            <div className="text-right">
              <div className="text-4xl font-bold">{stats.total_documents}</div>
              <div className="text-blue-100">Documentos Totales</div>
              <div className="text-sm text-blue-200 mt-1">
                Score: {stats.transparency_score}% | {stats.year_range}
              </div>
            </div>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.verified_documents}</div>
              <div className="text-blue-100 text-sm">Verificados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.years_covered}</div>
              <div className="text-blue-100 text-sm">Años</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.categories_count}</div>
              <div className="text-blue-100 text-sm">Categorías</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total_file_size_mb.toFixed(0)} MB</div>
              <div className="text-blue-100 text-sm">Tamaño Total</div>
            </div>
          </div>
        )}
      </div>

      {/* Data Sources Info */}
      {stats?.data_sources && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Fuentes de Datos Integradas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Sitio Oficial</span>
              </div>
              <div className="text-sm text-gray-600">
                {stats.data_sources.live_scrape_count} documentos descargados directamente
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="font-medium">Documentos Procesados</span>
              </div>
              <div className="text-sm text-gray-600">
                {stats.data_sources.markdown_count} documentos en formato markdown
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="font-medium">API Backend</span>
              </div>
              <div className="text-sm text-gray-600">
                {stats.data_sources.api_count} documentos vía API
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Documentos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="Buscar por título o categoría..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los años</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredDocuments.length} de {documents.length} documentos
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.map((document) => (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleDocumentSelect(document)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getDocumentTypeIcon(document.document_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {document.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDocumentTypeBadge(document.document_type)}`}>
                        {document.document_type.replace('_', ' ')}
                      </span>
                      {document.verification_status === 'verified' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {document.year}
                      </span>
                      <span>{document.category}</span>
                      <span>{document.file_size_mb.toFixed(1)} MB</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Fuentes:</span>
                      {document.data_sources.slice(0, 3).map((source, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {source.includes('transparency') ? 'Oficial' : 
                           source.includes('live_scrape') ? 'Descarga' :
                           source.includes('markdown') ? 'Procesado' : 'API'}
                        </span>
                      ))}
                      {document.data_sources.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{document.data_sources.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(document.direct_pdf_url, '_blank');
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Ver PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(document.official_url, '_blank');
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Sitio oficial"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDocument(document);
                      setViewMode('comparison');
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    title="Comparar datos"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron documentos
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default Documents;