import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Eye, 
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Grid,
  List,
  BookOpen,
  FileImage,
  FileX,
  Archive,
  Braces,
  FileSpreadsheet,
  Presentation,
  FileWord
} from 'lucide-react';
import PDFViewer from './PDFViewer';
import MarkdownViewer from './MarkdownViewer';
import ImageViewer from './ImageViewer';
import JSONViewer from './JSONViewer';
import ArchiveViewer from './ArchiveViewer';
import OfficeViewer from './OfficeViewer';
import TextViewer from './TextViewer';
import { useTransparencyData } from '../../hooks/useTransparencyData';
import { DocumentMetadata } from '../../types/documents';

interface Document {
  id: string;
  title: string;
  filename?: string;
  category: string;
  year: number;
  size_mb: string;
  url?: string;
  verification_status: string;
  processing_date: string;
  file_type?: string;
  content?: string;
}

interface UnifiedDocumentViewerProps {
  documentId?: string;
  documents?: Document[];
  showList?: boolean;
  defaultView?: 'grid' | 'list';
  className?: string;
}

const UnifiedDocumentViewer: React.FC<UnifiedDocumentViewerProps> = ({
  documentId,
  documents: propDocuments,
  showList = true,
  defaultView = 'grid',
  className = ''
}) => {
  const [documents, setDocuments] = useState<Document[]>(propDocuments || []);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(!propDocuments);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');

  // Load documents on mount
  useEffect(() => {
    const loadDocuments = async () => {
      if (propDocuments) {
        setDocuments(propDocuments);
        if (documentId) {
          const doc = propDocuments.find(d => d.id === documentId);
          if (doc) setSelectedDocument(doc);
        }
        return;
      }

      setLoading(true);
      try {
        // Use documents from useTransparencyData hook instead of API call
        const docs = [];
        setDocuments(docs);
        
        if (documentId) {
          const doc = docs.find(d => d.id === documentId);
          if (doc) {
            setSelectedDocument(doc);
          } else {
            setError(`Documento con ID "${documentId}" no encontrado`);
          }
        }
      } catch (err) {
        setError(`Error cargando documentos: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [documentId, propDocuments]);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesYear = yearFilter === 'all' || doc.year === yearFilter;
    
    return matchesSearch && matchesCategory && matchesYear;
  });

  // Get unique categories and years
  const categories = [...new Set(documents.map(doc => doc.category))];
  const years = [...new Set(documents.map(doc => doc.year))].sort((a, b) => b - a);

  const getFileIcon = (document: Document) => {
    const type = document.file_type?.toLowerCase() || '';
    const filename = document.filename?.toLowerCase() || '';
    
    // PDF files
    if (type.includes('pdf') || filename.endsWith('.pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    
    // Markdown files
    if (type.includes('markdown') || type.includes('md') || filename.endsWith('.md')) {
      return <BookOpen className="w-8 h-8 text-blue-500" />;
    }
    
    // Image files
    if (type.includes('image') || /\.(jpg|jpeg|png|gif|svg)$/.test(filename)) {
      return <FileImage className="w-8 h-8 text-green-500" />;
    }
    
    // Archive files
    if (type.includes('archive') || /\.(zip|rar|7z)$/.test(filename)) {
      return <Archive className="w-8 h-8 text-purple-500" />;
    }
    
    // JSON files
    if (type.includes('json') || filename.endsWith('.json')) {
      return <Braces className="w-8 h-8 text-yellow-500" />;
    }
    
    // Office files
    if (['doc', 'docx'].includes(type) || /\.(doc|docx)$/.test(filename)) {
      return <FileWord className="w-8 h-8 text-blue-500" />;
    }
    
    if (['xls', 'xlsx'].includes(type) || /\.(xls|xlsx)$/.test(filename)) {
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    }
    
    if (['ppt', 'pptx'].includes(type) || /\.(ppt|pptx)$/.test(filename)) {
      return <Presentation className="w-8 h-8 text-orange-500" />;
    }
    
    // Text files
    if (['txt', 'csv'].includes(type) || /\.(txt|csv)$/.test(filename)) {
      return <FileText className="w-8 h-8 text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />;
    }
    
    return <FileX className="w-8 h-8 text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />;
  };

  const getFileTypeDescription = (document: Document) => {
    const type = document.file_type?.toLowerCase() || '';
    const filename = document.filename?.toLowerCase() || '';
    
    if (type.includes('pdf') || filename.endsWith('.pdf')) return 'Documento PDF';
    if (type.includes('markdown') || type.includes('md') || filename.endsWith('.md')) return 'Documento Markdown';
    if (type.includes('image') || /\.(jpg|jpeg|png|gif|svg)$/.test(filename)) return 'Imagen';
    if (type.includes('archive') || /\.(zip|rar|7z)$/.test(filename)) return 'Archivo comprimido';
    if (type.includes('json') || filename.endsWith('.json')) return 'Documento JSON';
    if (['doc', 'docx'].includes(type) || /\.(doc|docx)$/.test(filename)) return 'Documento Word';
    if (['xls', 'xlsx'].includes(type) || /\.(xls|xlsx)$/.test(filename)) return 'Documento Excel';
    if (['ppt', 'pptx'].includes(type) || /\.(ppt|pptx)$/.test(filename)) return 'Presentación';
    if (['txt', 'csv'].includes(type) || /\.(txt|csv)$/.test(filename)) return 'Documento de texto';
    return 'Documento';
  };

  const handleDocumentSelect = async (document: Document) => {
    setSelectedDocument(document);
    
    // If document has no content and has URL, try to fetch it
    if (!document.content && document.url) {
      try {
        const response = await fetch(document.url);
        const content = await response.text();
        setSelectedDocument({ ...document, content });
      } catch (err) {
        console.error('Error fetching document content:', err);
      }
    }
  };

  const renderDocumentViewer = (document: Document) => {
    const type = document.file_type?.toLowerCase() || '';
    const filename = document.filename?.toLowerCase() || '';
    
    // PDF files
    if (type.includes('pdf') || filename.endsWith('.pdf')) {
      return (
        <PDFViewer
          url={document.url}
          filename={document.filename}
          title={document.title}
          className="w-full"
        />
      );
    }
    
    // Markdown files
    else if (type.includes('markdown') || type.includes('md') || filename.endsWith('.md')) {
      return (
        <MarkdownViewer
          content={document.content}
          url={document.url}
          filename={document.filename}
          title={document.title}
          className="w-full"
        />
      );
    }
    
    // Image files
    else if (type.includes('image') || /\.(jpg|jpeg|png|gif|svg)$/.test(filename)) {
      return (
        <ImageViewer
          document={document as DocumentMetadata}
          className="w-full"
        />
      );
    }
    
    // JSON files
    else if (type.includes('json') || filename.endsWith('.json')) {
      return (
        <JSONViewer
          document={document as DocumentMetadata}
          className="w-full"
        />
      );
    }
    
    // Archive files
    else if (type.includes('archive') || /\.(zip|rar|7z)$/.test(filename)) {
      return (
        <ArchiveViewer
          document={document as DocumentMetadata}
          className="w-full"
        />
      );
    }
    
    // Office files
    else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(type) || 
             /\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(filename)) {
      return (
        <OfficeViewer
          document={document as DocumentMetadata}
          className="w-full"
        />
      );
    }
    
    // Text files
    else if (['txt', 'csv'].includes(type) || /\.(txt|csv)$/.test(filename)) {
      return (
        <TextViewer
          document={document as DocumentMetadata}
          className="w-full"
        />
      );
    }
    
    // Generic fallback
    else {
      return (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-8 text-center">
          <div className="mb-4">
            {getFileIcon(document)}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
            {getFileTypeDescription(document)}
          </h3>
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-4">
            Este tipo de archivo no se puede previsualizar directamente.
          </p>
          <div className="space-x-3">
            {document.url && (
              <>
                <a
                  href={document.url}
                  download={document.filename}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </a>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir
                </a>
              </>
            )}
          </div>
        </div>
      );
    }
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => handleDocumentSelect(document)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getFileIcon(document)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary truncate">
            {document.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-1">
            {document.category} • {document.year}
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-1">
            {getFileTypeDescription(document)} • {document.size_mb} MB
          </p>
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              document.verification_status === 'verified'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {document.verification_status === 'verified' ? 'Verificado' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const DocumentListItem: React.FC<{ document: Document }> = ({ document }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => handleDocumentSelect(document)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-shrink-0">
            {getFileIcon(document)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary truncate">
              {document.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
              {document.category} • {getFileTypeDescription(document)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
          <span>{document.year}</span>
          <span>{document.size_mb} MB</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            document.verification_status === 'verified'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {document.verification_status === 'verified' ? 'Verificado' : 'Pendiente'}
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Cargando documentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Error</h3>
        <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">{error}</p>
      </div>
    );
  }

  if (selectedDocument && !showList) {
    return (
      <div className={className}>
        {renderDocumentViewer(selectedDocument)}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Document Viewer */}
      {selectedDocument && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
              {selectedDocument.title}
            </h2>
            <button
              onClick={() => setSelectedDocument(null)}
              className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary hover:text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary"
            >
              Cerrar vista
            </button>
          </div>
          {renderDocumentViewer(selectedDocument)}
        </div>
      )}

      {/* Document List */}
      {showList && (
        <div>
          {/* Filters */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <Search className="w-4 h-4 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los años</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-300 dark:border-dark-border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:bg-dark-background'} rounded-l-lg`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:bg-dark-background'} rounded-r-lg`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-3 text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </div>
          </div>

          {/* Document Grid/List */}
          {filteredDocuments.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-8 text-center">
              <FileX className="w-12 h-12 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
                No se encontraron documentos
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }>
              {filteredDocuments.map(document => (
                viewMode === 'grid' ? (
                  <DocumentCard key={document.id} document={document} />
                ) : (
                  <DocumentListItem key={document.id} document={document} />
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedDocumentViewer;