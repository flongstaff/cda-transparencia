/**
 * Universal Document Viewer Component
 * Component that can display any supported document type with appropriate viewer
 */

import React, { useState, useEffect } from 'react';
import {
  File,
  FileText,
  FileImage,
  Archive,
  Braces,
  FileSpreadsheet,
  Presentation,
  Download,
  ExternalLink,
  Eye,
  Code,
  AlertCircle,
  Loader2,
  Share2
} from 'lucide-react';
import { DocumentMetadata, SupportedFileType } from '../../types/documents';

// Import all document viewers
import PDFViewer from './PDFViewer';
import MarkdownViewer from './MarkdownViewer';
import ImageViewer from './ImageViewer';
import JSONViewer from './JSONViewer';
import ArchiveViewer from './ArchiveViewer';
import OfficeViewer from './OfficeViewer';
import TextViewer from './TextViewer';
import FallbackViewer from './FallbackViewer';

interface UniversalDocumentViewerProps {
  document: DocumentMetadata;
  onDownload?: () => void;
  onOpen?: () => void;
  onShare?: () => void;
  className?: string;
}

const UniversalDocumentViewer: React.FC<UniversalDocumentViewerProps> = ({
  document,
  onDownload,
  onOpen,
  onShare,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerType, setViewerType] = useState<'pdf' | 'markdown' | 'image' | 'json' | 'archive' | 'office' | 'text' | 'fallback'>('fallback');

  useEffect(() => {
    if (document.url) {
      setLoading(true);
      setError(null);
      
      // Determine appropriate viewer based on file type
      const fileType = document.file_type?.toLowerCase() || '';
      
      if (fileType === 'pdf') {
        setViewerType('pdf');
      } else if (fileType === 'md' || fileType === 'markdown') {
        setViewerType('markdown');
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileType)) {
        setViewerType('image');
      } else if (fileType === 'json') {
        setViewerType('json');
      } else if (['zip', 'rar', '7z'].includes(fileType)) {
        setViewerType('archive');
      } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType)) {
        setViewerType('office');
      } else if (['txt', 'csv'].includes(fileType)) {
        setViewerType('text');
      } else {
        setViewerType('fallback');
      }
      
      setLoading(false);
    }
  }, [document.url, document.file_type]);

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

  const renderViewer = () => {
    switch (viewerType) {
      case 'pdf':
        return (
          <PDFViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
      
      case 'markdown':
        return (
          <MarkdownViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
      
      case 'image':
        return (
          <ImageViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
      
      case 'json':
        return (
          <JSONViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
      
      case 'archive':
        return (
          <ArchiveViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
      
      case 'office':
        return (
          <OfficeViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
      
      case 'text':
        return (
          <TextViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
      
      default:
        return (
          <FallbackViewer
            document={document}
            onDownload={handleDownload}
            onOpen={handleOpen}
            onShare={handleShare}
            className="w-full"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Determinando tipo de visor para el documento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
          Error al determinar el visor
        </h3>
        <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-4">{error}</p>
        <div className="space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-dark-border p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            {getFileIcon(document.file_type)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary truncate">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                {getFileTypeDescription(document.file_type)} • {document.size_mb} MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary hover:text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg"
                title="Compartir documento"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                title="Descargar documento"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpen}
                className="p-2 text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary hover:text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg"
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
        {renderViewer()}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-dark-border px-4 py-3 bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
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

// Helper function to get file icon
const _getFileIcon = (fileType: SupportedFileType) => {
  switch (fileType) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <FileImage className="w-5 h-5 text-green-500" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive className="w-5 h-5 text-purple-500" />;
    case 'json':
      return <Braces className="w-5 h-5 text-yellow-500" />;
    case 'doc':
    case 'docx':
      return <FileWord className="w-5 h-5 text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    case 'ppt':
    case 'pptx':
      return <Presentation className="w-5 h-5 text-orange-500" />;
    case 'txt':
    case 'csv':
    case 'md':
    case 'markdown':
      return <FileText className="w-5 h-5 text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />;
    default:
      return <File className="w-5 h-5 text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />;
  }
};

// Helper function to get file type description
const _getFileTypeDescription = (fileType: SupportedFileType) => {
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

export default UniversalDocumentViewer;