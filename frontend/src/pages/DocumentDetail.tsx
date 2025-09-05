import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ExternalLink, Calendar, Hash, CheckCircle, Eye, Database, ArrowLeft } from 'lucide-react';
import MarkdownRenderer from '../components/documents/MarkdownRenderer';
import { unifiedDataService } from '../services/UnifiedDataService';

interface DocumentMetadata {
  id: number;
  title: string;
  year: number;
  category: string;
  created_at: string;
  official_url?: string;
  archive_url?: string;
  verification_status: 'verified' | 'partial' | 'unverified';
  sha256_hash: string;
  size_bytes?: number;
  content?: string; // Processed content
  markdown_path?: string; // Path to markdown content if available
  data_sources?: string[]; // Array of data sources
}

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentMetadata | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [contentSource, setContentSource] = useState<'processed' | 'official' | 'archive' | 'metadata'>('processed');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDocument(parseInt(id));
    }
  }, [id]);

  const loadDocument = async (documentId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use UnifiedDataService for all document data
      const fetchedDocument = await apiService.getRealDocumentById(String(documentId));
      if (fetchedDocument && fetchedDocument.document) {
        // Map fetched data to DocumentMetadata interface
        const mappedDocument: DocumentMetadata = {
          id: fetchedDocument.document.id,
          title: fetchedDocument.document.title,
          year: fetchedDocument.document.year,
          category: fetchedDocument.document.category,
          created_at: fetchedDocument.document.processing_date || new Date().toISOString(), // Use processing_date or current date
          official_url: fetchedDocument.document.official_url,
          archive_url: fetchedDocument.document.archive_url,
          verification_status: fetchedDocument.document.verification_status || 'unverified',
          sha256_hash: fetchedDocument.document.sha256_hash || 'N/A',
          size_bytes: fetchedDocument.document.size_mb ? fetchedDocument.document.size_mb * 1024 * 1024 : undefined, // Convert MB to bytes
          markdown_path: fetchedDocument.document.markdown_path,
          data_sources: fetchedDocument.document.data_sources,
        };
        setDocument(mappedDocument);
        // Load initial content based on default source
        loadDocumentContent(mappedDocument, contentSource);
      } else {
        setError('Document not found.');
        setDocument(null);
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError('No se pudo cargar el documento. Por favor, intente nuevamente.');
      setDocument(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocumentContent = async (doc: DocumentMetadata, source: 'processed' | 'official' | 'archive' | 'metadata' = 'processed') => {
    setIsLoading(true);
    setContentSource(source);
    
    try {
      let contentToDisplay = '';

      switch (source) {
        case 'processed':
          contentToDisplay = `# 📄 Contenido Procesado (No Disponible)\n\n`;
          contentToDisplay += `## 🛡️ Verificación SHA256\n${doc.sha256_hash}\n\n`;
          contentToDisplay += `> **Nota**: El contenido procesado de este documento no está disponible actualmente. Por favor, consulte la fuente oficial o el archivo web.\n\n`;
          break;

        case 'official':
          contentToDisplay = `# 🌐 Fuente Oficial

`;
          contentToDisplay += `**Documento**: ${doc.title}

`;
          if (doc.official_url) {
            const isPdf = doc.official_url.toLowerCase().endsWith('.pdf');
            if (isPdf) {
              contentToDisplay += `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(doc.official_url)}&embedded=true" width="100%" height="600px" style="border: none;"></iframe>\n\n`;
              contentToDisplay += `**Enlace oficial**: [Abrir en nueva pestaña](${doc.official_url})\n\n`;
            } else {
              contentToDisplay += `**Enlace oficial**: [Ver documento](${doc.official_url})\n\n`;
              contentToDisplay += `Haga clic en el enlace para acceder al documento en el sitio oficial del municipio.\n\n`;
            }
          } else {
            contentToDisplay += `**Enlace oficial**: No disponible\n\n`;
          }
          contentToDisplay += `**Estado de verificación**: ${doc.verification_status === 'verified' ? '✅ Verificado' : doc.verification_status === 'partial' ? '⚠️ Parcialmente verificado' : '❌ No verificado'}\n\n`;
          contentToDisplay += `---\n\n`;
          contentToDisplay += `## Información del Documento\n\n`;
          contentToDisplay += `- **Nombre**: ${doc.title}\n`;
          contentToDisplay += `- **Año**: ${doc.year}\n`;
          contentToDisplay += `- **Categoría**: ${doc.category}\n`;
          contentToDisplay += `- **Estado de Verificación**: ${doc.verification_status}\n`;
          contentToDisplay += `- **Fecha de Procesamiento**: ${new Date(doc.created_at).toLocaleDateString('es-AR')}\n`;
          break;

        case 'archive':
          contentToDisplay = `# 🗄️ Archivo Web (Wayback Machine)

`;
          contentToDisplay += `**Documento**: ${doc.title}

`;
          if (doc.archive_url) {
            const isPdf = doc.archive_url.toLowerCase().endsWith('.pdf');
            if (isPdf) {
              contentToDisplay += `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(doc.archive_url)}&embedded=true" width="100%" height="600px" style="border: none;"></iframe>\n\n`;
              contentToDisplay += `**Enlace al archivo**: [Abrir en nueva pestaña](${doc.archive_url})\n\n`;
            } else {
              contentToDisplay += `**Enlace al archivo**: [Ver en Wayback Machine](${doc.archive_url})\n\n`;
              contentToDisplay += `Este enlace lleva a una copia histórica del documento preservada en el Archive.org.\n\n`;
            }
          } else {
            contentToDisplay += `**Enlace al archivo**: No disponible\n\n`;
          }
          contentToDisplay += `**Fecha de procesamiento**: ${new Date(doc.created_at).toLocaleDateString('es-AR')}\n\n`;
          contentToDisplay += `---

`;
          contentToDisplay += `## Información del Documento

`;
          contentToDisplay += `- **Nombre**: ${doc.title}
`;
          contentToDisplay += `- **Año**: ${doc.year}
`;
          contentToDisplay += `- **Categoría**: ${doc.category}
`;
          contentToDisplay += `- **Hash SHA256**: \`${doc.sha256_hash}\`
`;
          break;

        case 'metadata':
          contentToDisplay = `# 💾 Metadatos del Documento

`;
          contentToDisplay += `## Información Detallada

`;
          contentToDisplay += `- **ID**: ${doc.id}
`;
          contentToDisplay += `- **Nombre del archivo**: ${doc.title}
`;
          contentToDisplay += `- **Año**: ${doc.year}
`;
          contentToDisplay += `- **Categoría**: ${doc.category}
`;
          if (doc.size_bytes) {
            contentToDisplay += `- **Tamaño**: ${(doc.size_bytes / 1024).toFixed(2)} KB (${doc.size_bytes} bytes)
`;
          }
          contentToDisplay += `- **Estado de verificación**: ${doc.verification_status}
`;
          contentToDisplay += `- **Hash SHA256**: \`${doc.sha256_hash}\`
`;
          contentToDisplay += `- **Fecha de procesamiento**: ${new Date(doc.created_at).toLocaleString('es-AR')}
`;
          if (doc.official_url) {
            contentToDisplay += `- **Fuente oficial**: [Enlace](${doc.official_url})
`;
          }
          if (doc.archive_url) {
            contentToDisplay += `- **Archivo web**: [Enlace](${doc.archive_url})
`;
          }
          break;
      }

      setDocumentContent(contentToDisplay);
    } catch (error) {
      console.error('Error loading document content:', error);
      setDocumentContent(`# ⚠️ Error de carga

## ${doc.title}

**No se pudo cargar el contenido del documento.**

Por favor intente nuevamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Desconocido';
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
        return <Eye className="w-4 h-4" />;
      case 'official':
        return <ExternalLink className="w-4 h-4" />;
      case 'archive':
        return <Database className="w-4 h-4" />;
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

  const handleDownload = async () => {
    if (document && document.official_url) {
      try {
        // Use unifiedDataService for document downloads
        // Or, if the backend serves the file directly, just open the URL
        window.open(document.official_url, '_blank');
      } catch (error) {
        console.error('Error downloading document:', error);
        alert('No se pudo descargar el documento.');
      }
    } else {
      alert('No hay URL oficial disponible para descargar este documento.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">Error</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver a Documentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">Documento no encontrado</h3>
          <p className="text-gray-500 mt-2">El documento solicitado no existe o no está disponible.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver a Documentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Documentos
          </button>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{document.year}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(document.category)}`}>
                    {document.category}
                  </span>
                  <div className="flex items-center">
                    {getVerificationIcon(document.verification_status)}
                    <span className="ml-1">
                      {document.verification_status === 'verified' ? 'Verificado' : 
                       document.verification_status === 'partial' ? 'Parcialmente verificado' : 'No verificado'}
                    </span>
                  </div>
                  {document.size_bytes && (
                    <div>
                      Tamaño: {formatFileSize(document.size_bytes)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                {document.official_url && (
                  <a
                    href={document.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Fuente oficial
                  </a>
                )}
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Document Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Content Source Selector */}
              <div className="bg-gray-100 border-b border-gray-200 p-3">
                <div className="flex flex-wrap gap-2">
                  {(['processed', 'official', 'archive', 'metadata'] as const).map((source) => (
                    <button
                      key={source}
                      className={`flex items-center space-x-1 py-1.5 px-3 rounded text-sm ${
                        contentSource === source
                          ? 'bg-white border border-gray-300 text-gray-900'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => loadDocumentContent(document, source)}
                    >
                      {getSourceIcon(source)}
                      <span>{getSourceLabel(source)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Content Display */}
              <div className="p-6 min-h-[500px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <MarkdownRenderer content={documentContent} />
                )}
              </div>
            </div>
          </div>

          {/* Document Metadata Sidebar */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Documento</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{document.id}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre del archivo</h3>
                  <p className="mt-1 text-sm text-gray-900">{document.title}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Año</h3>
                  <p className="mt-1 text-sm text-gray-900">{document.year}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(document.category)}`}>
                      {document.category}
                    </span>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado de verificación</h3>
                  <div className="mt-1 flex items-center text-sm">
                    {getVerificationIcon(document.verification_status)}
                    <span className="ml-1 text-gray-900">
                      {document.verification_status === 'verified' ? 'Verificado' : 
                       document.verification_status === 'partial' ? 'Parcialmente verificado' : 'No verificado'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Hash SHA256</h3>
                  <p className="mt-1 text-sm text-gray-900 font-mono break-words">
                    {document.sha256_hash}
                  </p>
                </div>
                
                {document.size_bytes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tamaño</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatFileSize(document.size_bytes)}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de procesamiento</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(document.created_at).toLocaleString('es-AR')}
                  </p>
                </div>
                
                {document.official_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fuente oficial</h3>
                    <a
                      href={document.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver documento
                    </a>
                  </div>
                )}
                
                {document.archive_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Archivo web</h3>
                    <a
                      href={document.archive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      Ver en Wayback Machine
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;