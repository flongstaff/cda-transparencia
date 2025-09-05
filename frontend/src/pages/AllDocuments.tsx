import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, Filter, Calendar, ExternalLink, CheckCircle, AlertCircle, Loader2, FolderOpen } from 'lucide-react';
import { unifiedDataService } from '../services/UnifiedDataService';
import SimpleDocumentViewer from '../components/documents/SimpleDocumentViewer';

interface Document {
  id: string;
  filename: string;
  original_path: string;
  markdown_path?: string;
  document_type: string;
  category: string;
  year: number;
  file_size: number;
  file_hash: string;
  verification_status: 'verified' | 'pending' | 'failed' | 'partial';
  official_url?: string;
  archive_url?: string;
  markdown_available: boolean;
  verification_status_badge: string;
  display_category: string;
  file_size_formatted: string;
  created_at: string;
  updated_at: string;
}

const AllDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'status'>('date');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const documents = await unifiedDataService.getAllDocuments();
      setDocuments(documents);
      setFilteredDocuments(documents);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Error al cargar los documentos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort documents
  useEffect(() => {
    let filtered = [...documents];
    
    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.display_category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(doc => doc.year.toString() === selectedYear);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.document_type === selectedType);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return b.file_size - a.file_size;
        case 'status':
          return a.verification_status.localeCompare(b.verification_status);
        default:
          return 0;
      }
    });
    
    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedYear, selectedCategory, selectedType, sortBy]);

  // Get unique years, categories, and types for filters
  const availableYears = [...new Set(documents.map(doc => doc.year))].sort((a, b) => b - a);
  const availableCategories = [...new Set(documents.map(doc => doc.category))].sort();
  const availableTypes = [...new Set(documents.map(doc => doc.document_type))].sort();

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'presupuesto': 'bg-blue-100 text-blue-800',
      'gastos': 'bg-green-100 text-green-800',
      'contratos': 'bg-purple-100 text-purple-800',
      'ordenanzas': 'bg-orange-100 text-orange-800',
      'informes': 'bg-indigo-100 text-indigo-800',
      'licitaciones': 'bg-pink-100 text-pink-800',
      'declaraciones': 'bg-teal-100 text-teal-800',
      'estados-financieros': 'bg-cyan-100 text-cyan-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-red-800">Error</h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={loadDocuments}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Documentos</h1>
          <p className="text-gray-600 mt-2">
            Acceda a todos los documentos de transparencia del municipio de Carmen de Areco
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los años</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Fecha</option>
                <option value="name">Nombre</option>
                <option value="size">Tamaño</option>
                <option value="status">Estado</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </p>
          </div>
        </div>

        {/* Document Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900 text-sm truncate">{doc.filename}</h3>
                  </div>
                  {getVerificationIcon(doc.verification_status)}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                    {doc.display_category}
                  </span>
                  <span className="text-xs text-gray-500">{doc.file_size_formatted}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{doc.year}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {doc.official_url && (
                      <a
                        href={doc.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-500 hover:text-blue-500 rounded hover:bg-blue-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {doc.markdown_available && (
                      <button
                        className="p-1.5 text-gray-500 hover:text-green-500 rounded hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {doc.official_url && (
                    <a
                      href={doc.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Descargar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
            <p className="text-gray-500">
              {searchTerm || selectedYear !== 'all' || selectedCategory !== 'all'
                ? "Intente ajustar los filtros de búsqueda"
                : "No hay documentos disponibles en este momento"}
            </p>
          </div>
        )}

        {/* Document Viewer Modal */}
        {selectedDocument && (
          <SimpleDocumentViewer 
            document={selectedDocument} 
            onClose={() => setSelectedDocument(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default AllDocuments;