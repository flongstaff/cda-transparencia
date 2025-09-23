/**
 * Text Viewer Component
 * Component to display text documents with search and syntax highlighting
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  ExternalLink,
  Eye, 
  Code, 
  AlertCircle,
  Loader2,
  Search,
  Share2
} from 'lucide-react';
import { DocumentMetadata, SupportedFileType } from '../../types/documents';

interface TextViewerProps {
  document: DocumentMetadata;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
}

const TextViewer: React.FC<TextViewerProps> = ({
  document,
  onError,
  onLoad,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [searchTerm, setSearchTerm] = useState('');
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (document.url) {
      setLoading(true);
      setError(null);
      
      fetch(document.url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          setTextContent(text);
          setLineCount(text.split('\n').length);
          setLoading(false);
          onLoad?.();
        })
        .catch(err => {
          const errorMsg = `Error cargando texto: ${err.message}`;
          setError(errorMsg);
          setLoading(false);
          onError?.(errorMsg);
        });
    }
  }, [document.url, onLoad, onError]);

  const highlightSearchTerm = (text: string, term: string): string => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(textContent);
  };

  const handleDownload = () => {
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = document.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: textContent.substring(0, 100) + '...'
      });
    } else {
      handleCopyContent();
    }
  };

  const handleOpen = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const getFileTypeDescription = (fileType: SupportedFileType): string => {
    switch (fileType) {
      case 'txt':
        return 'Documento de texto';
      case 'csv':
        return 'Documento CSV';
      default:
        return 'Documento de texto';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Cargando documento de texto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar el documento
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
          <button
            onClick={handleOpen}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir directamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500">
                {getFileTypeDescription(document.file_type)} • {document.size_mb} MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'rendered'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Vista renderizada"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'raw'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Código fuente"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Compartir documento"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyContent}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Copiar contenido"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                title="Descargar texto"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpen}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Abrir en nueva ventana"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'rendered' ? (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: highlightSearchTerm(textContent.replace(/\n/g, '<br>'), searchTerm)
            }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg p-4 overflow-auto max-h-96">
            {highlightSearchTerm(textContent, searchTerm)}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {getFileTypeDescription(document.file_type)}
            </span>
            <span>{lineCount} líneas</span>
            <span>Modo: {viewMode === 'rendered' ? 'Renderizado' : 'Código fuente'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {searchTerm && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Búsqueda activa: "{searchTerm}"
              </span>
            )}
            <span className="text-xs">
              {new Date(document.processing_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextViewer;