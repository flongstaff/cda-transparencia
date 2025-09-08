import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  FileText, 
  ExternalLink,
  AlertCircle,
  Loader2,
  Eye,
  Share2,
  Bookmark
} from 'lucide-react';

interface PDFViewerProps {
  url?: string;
  filename?: string;
  title?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  filename = 'document.pdf',
  title,
  onError,
  onLoad,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (url) {
      setLoading(true);
      setError(null);
      
      // Simulate loading delay
      const timer = setTimeout(() => {
        setLoading(false);
        setTotalPages(Math.floor(Math.random() * 20) + 1); // Simulate pages
        onLoad?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [url, onLoad]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.share && url) {
      navigator.share({
        title: title || filename,
        url: url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url || '');
    }
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setLoading(false);
    onError?.(errorMsg);
  };

  if (!url) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No se proporcionó URL del documento PDF</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* PDF Viewer Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {title || filename}
              </h3>
              {totalPages > 0 && (
                <p className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  ←
                </button>
                <span className="text-sm font-medium">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  →
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
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
                title="Rotar documento"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              
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
                title="Descargar PDF"
              >
                <Download className="w-4 h-4" />
              </button>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Abrir en nueva ventana"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="relative min-h-[600px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando documento PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
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
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir directamente
                </a>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="p-4">
            {/* PDF Embed */}
            <div 
              className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top left',
                minHeight: '600px'
              }}
            >
              <iframe
                src={`${url}#page=${currentPage}&zoom=${zoom}&rotate=${rotation}`}
                className="w-full h-[600px] border-0"
                title={title || filename}
                onLoad={() => setLoading(false)}
                onError={() => handleError('No se pudo cargar el documento PDF')}
              />
            </div>

            {/* Alternative fallback */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    ¿No se visualiza correctamente?
                  </p>
                  <p className="text-sm text-blue-700">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Haga clic aquí para abrir el documento en una nueva ventana
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Footer with metadata */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Documento PDF</span>
            {totalPages > 0 && (
              <span>{totalPages} página{totalPages !== 1 ? 's' : ''}</span>
            )}
            <span>Zoom: {zoom}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-500 hover:text-gray-700"
              title="Marcar documento"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <span className="text-xs">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PDFViewer;