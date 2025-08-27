import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Search, Calendar, Hash, CheckCircle } from 'lucide-react';
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

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents, selectedSources = ['processed_documents'] }) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | number>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [contentSource, setContentSource] = useState<'processed' | 'official' | 'archive' | 'metadata'>('processed');

  // Get unique years and categories for filters
  const availableYears = [...new Set(documents.map(doc => doc.year))].sort((a, b) => b - a);
  const availableCategories = [...new Set(documents.map(doc => doc.category))].sort();

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || doc.year === selectedYear;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesYear && matchesCategory;
  });

  // Load document content based on selected sources
  const loadDocumentContent = async (document: DocumentMetadata, source: 'processed' | 'official' | 'archive' | 'metadata' = 'processed') => {
    setIsLoading(true);
    setContentSource(source);
    
    try {
      let contentToDisplay = '';

      switch (source) {
        case 'processed':
          try {
            // Try to load processed markdown content
            const response = await fetch(`http://localhost:3000/api/documents/${document.category}/${document.filename}/content`);
            if (response.ok) {
              const data = await response.json();
              contentToDisplay = `# 📄 Documento Procesado: ${document.filename}\n\n`;
              contentToDisplay += `## 🛡️ Verificación SHA256\n\`${document.sha256_hash}\`\n\n`;
              contentToDisplay += data.content || 'Contenido no disponible.';
            } else {
              // Fallback content if API is not available
              contentToDisplay = `# 📄 Documento: ${document.filename}\n\n`;
              contentToDisplay += `## 🛡️ Verificación SHA256\n\`${document.sha256_hash}\`\n\n`;
              contentToDisplay += `> **Nota**: Contenido procesado no disponible en este momento.\n\n`;
              contentToDisplay += `## Información del Documento\n\n`;
              contentToDisplay += `- **Nombre**: ${document.filename}\n`;
              contentToDisplay += `- **Año**: ${document.year}\n`;
              contentToDisplay += `- **Categoría**: ${document.category}\n`;
              contentToDisplay += `- **Tamaño**: ${(document.size_bytes / 1024).toFixed(2)} KB\n`;
              contentToDisplay += `- **Estado de Verificación**: ${document.verification_status}\n`;
              contentToDisplay += `- **Fecha de Procesamiento**: ${new Date(document.processing_date).toLocaleDateString('es-AR')}\n\n`;
            }
          } catch (e) {
            console.log('Processed document not available:', e);
            // Fallback content
            contentToDisplay = `# 📄 Documento: ${document.filename}\n\n`;
            contentToDisplay += `## 🛡️ Verificación SHA256\n\`${document.sha256_hash}\`\n\n`;
            contentToDisplay += `> **Nota**: Contenido procesado no disponible.\n\n`;
            contentToDisplay += `## Información del Documento\n\n`;
            contentToDisplay += `- **Nombre**: ${document.filename}\n`;
            contentToDisplay += `- **Año**: ${document.year}\n`;
            contentToDisplay += `- **Categoría**: ${document.category}\n`;
            contentToDisplay += `- **Tamaño**: ${(document.size_bytes / 1024).toFixed(2)} KB\n`;
            contentToDisplay += `- **Estado de Verificación**: ${document.verification_status}\n`;
            contentToDisplay += `- **Fecha de Procesamiento**: ${new Date(document.processing_date).toLocaleDateString('es-AR')}\n\n`;
          }
          break;

        case 'official':
          contentToDisplay = `# 🌐 Fuente Oficial\n\n`;
          contentToDisplay += `**Documento**: ${document.filename}\n\n`;
          if (document.official_url) {
            contentToDisplay += `**Enlace oficial**: [Ver documento](${document.official_url})\n\n`;
            contentToDisplay += `Haga clic en el enlace para acceder al documento en el sitio oficial del municipio.\n\n`;
          } else {
            contentToDisplay += `**Enlace oficial**: No disponible\n\n`;
          }
          contentToDisplay += `**Estado de verificación**: ${document.verification_status === 'verified' ? '✅ Verificado' : document.verification_status === 'partial' ? '⚠️ Parcialmente verificado' : '❌ No verificado'}\n\n`;
          contentToDisplay += `---\n\n`;
          contentToDisplay += `## Información del Documento\n\n`;
          contentToDisplay += `- **Nombre**: ${document.filename}\n`;
          contentToDisplay += `- **Año**: ${document.year}\n`;
          contentToDisplay += `- **Categoría**: ${document.category}\n`;
          contentToDisplay += `- **Tamaño**: ${(document.size_bytes / 1024).toFixed(2)} KB\n`;
          contentToDisplay += `- **Estado de Verificación**: ${document.verification_status}\n`;
          contentToDisplay += `- **Fecha de Procesamiento**: ${new Date(document.processing_date).toLocaleDateString('es-AR')}\n`;
          break;

        case 'archive':
          contentToDisplay = `# 🗄️ Archivo Web (Wayback Machine)\n\n`;
          contentToDisplay += `**Documento**: ${document.filename}\n\n`;
          if (document.archive_url) {
            contentToDisplay += `**Enlace al archivo**: [Ver en Wayback Machine](${document.archive_url})\n\n`;
            contentToDisplay += `Este enlace lleva a una copia histórica del documento preservada en el Archive.org.\n\n`;
          } else {
            contentToDisplay += `**Enlace al archivo**: No disponible\n\n`;
          }
          contentToDisplay += `**Fecha de procesamiento**: ${new Date(document.processing_date).toLocaleDateString('es-AR')}\n\n`;
          contentToDisplay += `---\n\n`;
          contentToDisplay += `## Información del Documento\n\n`;
          contentToDisplay += `- **Nombre**: ${document.filename}\n`;
          contentToDisplay += `- **Año**: ${document.year}\n`;
          contentToDisplay += `- **Categoría**: ${document.category}\n`;
          contentToDisplay += `- **Tamaño**: ${(document.size_bytes / 1024).toFixed(2)} KB\n`;
          contentToDisplay += `- **Hash SHA256**: \`${document.sha256_hash}\`\n`;
          break;

        case 'metadata':
          contentToDisplay = `# 💾 Metadatos del Documento\n\n`;
          contentToDisplay += `## Información Detallada\n\n`;
          contentToDisplay += `- **Nombre del archivo**: ${document.filename}\n`;
          contentToDisplay += `- **Año**: ${document.year}\n`;
          contentToDisplay += `- **Categoría**: ${document.category}\n`;
          contentToDisplay += `- **Tipo de archivo**: ${document.type}\n`;
          contentToDisplay += `- **Tamaño**: ${(document.size_bytes / 1024).toFixed(2)} KB (${document.size_bytes} bytes)\n`;
          contentToDisplay += `- **Estado de verificación**: ${document.verification_status}\n`;
          contentToDisplay += `- **Hash SHA256**: \`${document.sha256_hash}\`\n`;
          contentToDisplay += `- **Fecha de procesamiento**: ${new Date(document.processing_date).toLocaleString('es-AR')}\n`;
          if (document.official_url) {
            contentToDisplay += `- **Fuente oficial**: [Enlace](${document.official_url})\n`;
          }
          if (document.archive_url) {
            contentToDisplay += `- **Archivo web**: [Enlace](${document.archive_url})\n`;
          }
          contentToDisplay += `\n## Rutas de Acceso\n\n`;
          contentToDisplay += `- **Ruta local**: \`${document.path}\`\n`;
          break;
      }

      setDocumentContent(contentToDisplay);
    } catch (error) {
      console.error('Error loading document:', error);
      setDocumentContent(`# ⚠️ Error de carga\n\n## ${document.filename}\n\n**No se pudo cargar el contenido del documento.**\n\nPor favor:\n1. Verifique la conexión a internet\n2. Intente con una fuente diferente\n\n## Información del documento\n\n- **Año**: ${document.year}\n- **Categoría**: ${document.category}\n- **SHA256**: ${document.sha256_hash}`);
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
    const colors: Record<string, string> = {
      'financial_data': 'bg-blue-100 text-blue-800',
      'tenders': 'bg-green-100 text-green-800',
      'salaries': 'bg-purple-100 text-purple-800',
      'reports': 'bg-orange-100 text-orange-800',
      'declarations': 'bg-pink-100 text-pink-800',
      'budget': 'bg-indigo-100 text-indigo-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'processed':
        return <FileText className="w-4 h-4" />;
      case 'official':
        return <ExternalLink className="w-4 h-4" />;
      case 'archive':
        return <Hash className="w-4 h-4" />;
      case 'metadata':
        return <Hash className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'processed':
        return 'Contenido Procesado';
      case 'official':
        return 'Fuente Oficial';
      case 'archive':
        return 'Archivo Web';
      case 'metadata':
        return 'Metadatos';
      default:
        return 'Documento';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Document List Panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Biblioteca de Documentos</h2>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Todos los años</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Todas las categorías</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div
                  key={`${doc.filename}-${doc.year}`}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedDocument?.filename === doc.filename && selectedDocument?.year === doc.year 
                      ? 'bg-blue-50 border-blue-200' 
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedDocument(doc);
                    loadDocumentContent(doc, contentSource);
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 text-sm truncate">{doc.filename}</h3>
                      {getVerificationIcon(doc.verification_status)}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{doc.year}</span>
                    </span>
                    <span>{formatFileSize(doc.size_bytes)}</span>
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
                        <span>Fuente oficial</span>
                      </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-center">
                <div>
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron documentos</h3>
                  <p className="text-gray-500 text-sm">
                    Intente ajustar los filtros de búsqueda
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Content Panel */}
        <div className="w-1/2 flex flex-col">
          {selectedDocument ? (
            <>
              {/* Document Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-lg font-bold text-gray-900 truncate flex-1 mr-2">{selectedDocument.filename}</h1>
                  <div className="flex space-x-2">
                    {selectedDocument.official_url && (
                      <a
                        href={selectedDocument.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button 
                      className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center space-x-1 text-xs"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Año:</span>
                    <span className="ml-1 font-medium">{selectedDocument.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Categoría:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getCategoryColor(selectedDocument.category)}`}>
                      {selectedDocument.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tamaño:</span>
                    <span className="ml-1 font-medium">{formatFileSize(selectedDocument.size_bytes)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Verificación:</span>
                    <div className="ml-1 flex items-center space-x-1">
                      {getVerificationIcon(selectedDocument.verification_status)}
                      <span className="font-medium text-xs">
                        {selectedDocument.verification_status === 'verified' ? 'Verificado' : 
                         selectedDocument.verification_status === 'partial' ? 'Parcial' : 'No verificado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Source Selector */}
              <div className="bg-gray-100 border-b border-gray-200 p-2">
                <div className="flex space-x-1">
                  {(['processed', 'official', 'archive', 'metadata'] as const).map((source) => (
                    <button
                      key={source}
                      className={`flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded text-xs ${
                        contentSource === source
                          ? 'bg-white border border-gray-300 text-gray-900'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => loadDocumentContent(selectedDocument, source)}
                    >
                      {getSourceIcon(source)}
                      <span>{getSourceLabel(source)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-white">
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
              <div className="text-center p-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Seleccionar un Documento</h3>
                <p className="text-gray-500 max-w-xs">
                  Elija un documento de la lista para ver su contenido
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;