/**
 * Office Viewer Component
 * Component to display office documents (Word, Excel, PowerPoint) with appropriate fallbacks
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation,
  Download, 
  ExternalLink,
  Eye, 
  AlertCircle,
  Loader2,
  Share2,
  FileText
} from 'lucide-react';
import { DocumentMetadata, SupportedFileType } from '../../types/documents';

interface OfficeViewerProps {
  document: DocumentMetadata;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
}

const OfficeViewer: React.FC<OfficeViewerProps> = ({
  document,
  onError,
  onLoad,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'fallback'>('preview');

  useEffect(() => {
    if (document.url) {
      setLoading(true);
      setError(null);
      
      // Simulate loading delay
      const timer = setTimeout(() => {
        setLoading(false);
        onLoad?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [document.url, onLoad]);

  const getFileIcon = (fileType: SupportedFileType) => {
    switch (fileType) {
      case 'doc':
      case 'docx':
        return <FileWord className="w-12 h-12 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-12 h-12 text-orange-500" />;
      default:
        return <FileText className="w-12 h-12 text-gray-500" />;
    }
  };

  const getFileTypeDescription = (fileType: SupportedFileType) => {
    switch (fileType) {
      case 'doc':
      case 'docx':
        return 'Documento de Word';
      case 'xls':
      case 'xlsx':
        return 'Documento de Excel';
      case 'ppt':
      case 'pptx':
        return 'Presentación de PowerPoint';
      default:
        return 'Documento de Office';
    }
  };

  const getSoftwareRecommendations = (fileType: SupportedFileType) => {
    switch (fileType) {
      case 'doc':
      case 'docx':
        return 'Microsoft Word, Google Docs, LibreOffice Writer';
      case 'xls':
      case 'xlsx':
        return 'Microsoft Excel, Google Sheets, LibreOffice Calc';
      case 'ppt':
      case 'pptx':
        return 'Microsoft PowerPoint, Google Slides, LibreOffice Impress';
      default:
        return 'Microsoft Office, Google Workspace, LibreOffice';
    }
  };

  const handleDownload = () => {
    if (document.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.share && document.url) {
      navigator.share({
        title: document.title,
        url: document.url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(document.url || '');
    }
  };

  const handleOpen = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setLoading(false);
    onError?.(errorMsg);
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Cargando documento de Office...</p>
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
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir directamente
          </a>
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
            {getFileIcon(document.file_type)}
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
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Vista previa"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('fallback')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'fallback'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Fallback"
              >
                <FileText className="w-4 h-4" />
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
                onClick={handleDownload}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                title="Descargar documento"
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

      {/* Content Area */}
      <div className="relative min-h-[500px]">
        {viewMode === 'preview' ? (
          <div className="p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                {getFileIcon(document.file_type)}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {getFileTypeDescription(document.file_type)}
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Este documento está en formato {document.file_type.toUpperCase()} y no puede ser visualizado 
                directamente en el navegador. Para ver su contenido, descargue el archivo y ábralo con 
                una aplicación compatible.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                <h4 className="font-medium text-gray-900 mb-3">Aplicaciones recomendadas:</h4>
                <p className="text-gray-700">{getSoftwareRecommendations(document.file_type)}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar documento
                </button>
                
                <button
                  onClick={handleOpen}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir directamente
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fallback para {getFileTypeDescription(document.file_type)}
              </h3>
              <p className="text-gray-600 mb-4">
                No hay un visor nativo disponible para este tipo de documento.
              </p>
              <div className="space-x-3">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </button>
                <button
                  onClick={handleOpen}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              {getFileIcon(document.file_type)}
              <span className="ml-1">{getFileTypeDescription(document.file_type)}</span>
            </span>
            <span>{document.size_mb} MB</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs">
              {new Date(document.processing_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeViewer;