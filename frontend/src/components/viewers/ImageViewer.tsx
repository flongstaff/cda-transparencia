/**
 * Image Viewer Component
 * Component to display image documents with zoom, rotation, and download controls
 */

import React, { useState, useEffect } from 'react';
import { 
  FileImage, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ExternalLink,
  AlertCircle,
  Loader2,
  Eye,
  Share2
} from 'lucide-react';
import { DocumentMetadata } from '../../types/documents';

interface ImageViewerProps {
  document: DocumentMetadata;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  document,
  onError,
  onLoad,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (document.url) {
      setLoading(true);
      setError(null);
      
      // Preload image
      const img = new Image();
      img.onload = () => {
        setLoading(false);
        onLoad?.();
      };
      img.onerror = () => {
        const errorMsg = 'Error al cargar la imagen';
        setError(errorMsg);
        setLoading(false);
        onError?.(errorMsg);
      };
      img.src = document.url;
    }
  }, [document.url, onLoad, onError]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
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

  const _handleError = (errorMsg: string) => {
    setError(errorMsg);
    setLoading(false);
    onError?.(errorMsg);
  };

  const handleOpen = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  if (!document.url) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No se proporcionó URL de la imagen</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Image Viewer Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <FileImage className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500">
                {document.file_type.toUpperCase()} • {document.size_mb} MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 rounded-l-lg"
                title="Reducir zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 py-2 text-sm font-medium border-x border-gray-300 min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 rounded-r-lg"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleRotate}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Rotar imagen"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Compartir imagen"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Pantalla completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                title="Descargar imagen"
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

      {/* Image Content Area */}
      <div className="relative min-h-[600px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando imagen...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error al cargar la imagen
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
          </div>
        )}

        {!loading && !error && (
          <div className="p-4 flex justify-center">
            <div 
              className="overflow-auto max-w-full max-h-[70vh]"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top left'
              }}
            >
              <img
                src={document.url}
                alt={document.title}
                className="max-w-full max-h-[70vh] object-contain"
                onLoad={() => setLoading(false)}
                onError={() => {
                  const errorMsg = 'Error al cargar la imagen';
                  setError(errorMsg);
                  setLoading(false);
                  onError?.(errorMsg);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Footer with metadata */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <FileImage className="w-4 h-4 mr-1" />
              Imagen {document.file_type.toUpperCase()}
            </span>
            <span>Zoom: {zoom}%</span>
            <span>Rotación: {rotation}°</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-500 hover:text-gray-700"
              title="Marcar imagen"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <span className="text-xs">
              {new Date(document.processing_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;