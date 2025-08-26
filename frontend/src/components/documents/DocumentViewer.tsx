import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Search, Filter, Calendar, Hash, CheckCircle } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface DocumentMetadata {
  filename: string;
  year: number;
  category: string;
  type: string;
  size_bytes: number;
  sha256_hash: string;
  processing_date: string;
  official_url?: string;
  archive_url?: string;
  verification_status: 'verified' | 'partial' | 'unverified';
  path: string;
  content?: string;
}

interface DocumentViewerProps {
  documents: DocumentMetadata[];
  selectedSources?: string[];
  onSourceChange?: (sources: string[]) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents, selectedSources = ['processed_documents'], onSourceChange }) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Get unique years and categories for filters
  const availableYears = [...new Set(documents.map(doc => doc.year.toString()))].sort().reverse();
  const availableCategories = [...new Set(documents.map(doc => doc.category))].sort();

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || doc.year.toString() === selectedYear;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesYear && matchesCategory;
  });

  // Load document content based on selected sources
  const loadDocumentContent = async (document: DocumentMetadata) => {
    setIsLoading(true);
    try {
      let contentToDisplay = '';

      // Try different sources based on user selection
      for (const source of selectedSources) {
        switch (source) {
          case 'processed_documents':
            try {
              const response = await fetch(`http://localhost:3000/api/documents/${document.category}/${document.filename}/content`);
              if (response.ok) {
                const data = await response.json();
                contentToDisplay += `# 📄 Documento Procesado: ${document.filename}\n\n`;
                contentToDisplay += `## 🛡️ Verificación SHA256\n\`${document.sha256_hash}\`\n\n`;
                contentToDisplay += data.content;
                contentToDisplay += '\n\n---\n\n';
              }
            } catch (e) {
              console.log('Processed document not available:', e);
            }
            break;

          case 'official_site':
            contentToDisplay += `# 🌐 Documento Oficial\n\n`;
            contentToDisplay += `**Fuente**: [Sitio Oficial](${document.official_url})\n\n`;
            contentToDisplay += `Para ver el documento oficial, haga clic en el enlace de arriba.\n\n`;
            contentToDisplay += `**Estado**: ${document.verification_status === 'verified' ? '✅ Verificado' : '⚠️ Pendiente'}\n\n`;
            contentToDisplay += '---\n\n';
            break;

          case 'web_archive':
            contentToDisplay += `# 🗄️ Archivo Web\n\n`;
            contentToDisplay += `**Fuente**: [Wayback Machine](${document.archive_url})\n\n`;
            contentToDisplay += `Copia histórica del documento preservada en el archivo web.\n\n`;
            contentToDisplay += `**Fecha de procesamiento**: ${document.processing_date}\n\n`;
            contentToDisplay += '---\n\n';
            break;

          case 'database_local':
            contentToDisplay += `# 💾 Base de Datos Local\n\n`;
            contentToDisplay += `**Metadatos del documento**:\n\n`;
            contentToDisplay += `- **Archivo**: ${document.filename}\n`;
            contentToDisplay += `- **Año**: ${document.year}\n`;
            contentToDisplay += `- **Categoría**: ${document.category}\n`;
            contentToDisplay += `- **Tamaño**: ${(document.size_bytes / 1024).toFixed(2)} KB\n`;
            contentToDisplay += `- **Estado de verificación**: ${document.verification_status}\n`;
            contentToDisplay += `- **Hash SHA256**: \`${document.sha256_hash}\`\n\n`;
            contentToDisplay += '---\n\n';
            break;
        }
      }

      if (!contentToDisplay) {
        throw new Error('No sources selected or available');
      }

      setDocumentContent(contentToDisplay);
    } catch (error) {
      console.error('Error loading document:', error);
      setDocumentContent(`# ⚠️ Error de carga\n\n## ${document.filename}\n\n**No se pudo cargar el contenido del documento.**\n\nPor favor:\n1. Seleccione al menos una fuente de datos\n2. Verifique la conexión a internet\n3. Intente con una fuente diferente\n\n## Fuentes disponibles\n\n- [Sitio Oficial](https://carmendeareco.gob.ar/transparencia/)\n- [Archivo Web](https://web.archive.org/web/*/https://carmendeareco.gob.ar/transparencia/)\n\n## Información del documento\n\n- **Año**: ${document.year}\n- **Categoría**: ${document.category}\n- **SHA256**: ${document.sha256_hash}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'financial_data': 'bg-blue-100 text-blue-800',
      'tenders': 'bg-green-100 text-green-800',
      'salaries': 'bg-purple-100 text-purple-800',
      'reports': 'bg-orange-100 text-orange-800',
      'declarations': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Document List Panel */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Library</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.map((doc) => (
            <div
              key={`${doc.filename}-${doc.year}`}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedDocument?.filename === doc.filename ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => {
                setSelectedDocument(doc);
                loadDocumentContent(doc);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900 truncate">{doc.filename}</h3>
                  {getVerificationIcon(doc.verification_status)}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                  {doc.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{doc.year}</span>
                </span>
                <span>{formatFileSize(doc.size_bytes)}</span>
                <span className="flex items-center space-x-1">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">{doc.sha256_hash.substring(0, 8)}...</span>
                </span>
              </div>

              {doc.official_url && (
                <div className="mt-2 flex items-center space-x-2">
                  <a
                    href={doc.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Official Source</span>
                  </a>
                  {doc.archive_url && (
                    <a
                      href={doc.archive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Archive</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Content Panel */}
      <div className="w-1/2 flex flex-col">
        {selectedDocument ? (
          <>
            {/* Document Header */}
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{selectedDocument.filename}</h1>
                <div className="flex space-x-2">
                  {selectedDocument.official_url && (
                    <a
                      href={selectedDocument.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Official Source</span>
                    </a>
                  )}
                  <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-1 text-sm">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Year:</span>
                  <span className="ml-2 font-medium">{selectedDocument.year}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getCategoryColor(selectedDocument.category)}`}>
                    {selectedDocument.category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-medium">{formatFileSize(selectedDocument.size_bytes)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="ml-2 flex items-center space-x-1">
                    {getVerificationIcon(selectedDocument.verification_status)}
                    <span className="font-medium capitalize">{selectedDocument.verification_status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <MarkdownRenderer content={documentContent} />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Document</h3>
              <p className="text-gray-500">Choose a document from the list to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;