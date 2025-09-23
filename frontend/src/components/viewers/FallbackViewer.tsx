/**
 * Fallback Viewer Component
 * Universal viewer for all file types with appropriate fallback mechanisms
 */

import React from 'react';
import {
  File,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  Share2,
  FileText,
  FileImage,
  Archive,
  Braces,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import { DocumentMetadata, SupportedFileType } from '../../types/documents';

interface FallbackViewerProps {
  document: DocumentMetadata;
  error?: string;
  onDownload?: () => void;
  onOpen?: () => void;
  onShare?: () => void;
  className?: string;
}

const FallbackViewer: React.FC<FallbackViewerProps> = ({
  document,
  error,
  onDownload,
  onOpen,
  onShare,
  className = ''
}) => {
  const getFileIcon = (fileType: SupportedFileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-12 h-12 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FileImage className="w-12 h-12 text-green-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-12 h-12 text-purple-500" />;
      case 'json':
        return <Braces className="w-12 h-12 text-yellow-500" />;
      case 'doc':
      case 'docx':
        return <FileWord className="w-12 h-12 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-12 h-12 text-orange-500" />;
      case 'txt':
      case 'csv':
      case 'md':
      case 'markdown':
        return <FileText className="w-12 h-12 text-gray-500" />;
      default:
        return <File className="w-12 h-12 text-gray-500" />;
    }
  };

  const getFileTypeDescription = (fileType: SupportedFileType) => {
    switch (fileType) {
      case 'pdf':
        return 'Documento PDF';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'Imagen';
      case 'zip':
      case 'rar':
      case '7z':
        return 'Archivo comprimido';
      case 'json':
        return 'Documento JSON';
      case 'doc':
      case 'docx':
        return 'Documento de Word';
      case 'xls':
      case 'xlsx':
        return 'Documento de Excel';
      case 'ppt':
      case 'pptx':
        return 'Presentación de PowerPoint';
      case 'txt':
        return 'Documento de texto';
      case 'csv':
        return 'Documento CSV';
      case 'md':
      case 'markdown':
        return 'Documento Markdown';
      default:
        return 'Documento';
    }
  };

  const getSoftwareRecommendations = (fileType: SupportedFileType) => {
    switch (fileType) {
      case 'pdf':
        return 'Adobe Reader, Foxit Reader, Google Chrome, Firefox';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'Navegador web, Photoshop, GIMP, Paint';
      case 'zip':
      case 'rar':
      case '7z':
        return 'WinRAR, 7-Zip, PeaZip, Navegador web';
      case 'json':
        return 'Visual Studio Code, Sublime Text, Notepad++, Navegador web';
      case 'doc':
      case 'docx':
        return 'Microsoft Word, Google Docs, LibreOffice Writer';
      case 'xls':
      case 'xlsx':
        return 'Microsoft Excel, Google Sheets, LibreOffice Calc';
      case 'ppt':
      case 'pptx':
        return 'Microsoft PowerPoint, Google Slides, LibreOffice Impress';
      case 'txt':
      case 'csv':
      case 'md':
      case 'markdown':
        return 'Bloc de notas, Notepad++, Visual Studio Code, Sublime Text';
      default:
        return 'Software compatible con el tipo de archivo';
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (document.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (navigator.share && document.url) {
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
    if (onOpen) {
      onOpen();
    } else if (document.url) {
      window.open(document.url, '_blank');
    }
  };

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

      {/* Content */}
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

      {/* Footer */}
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

export default FallbackViewer;