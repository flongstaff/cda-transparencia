import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentUrl?: string;
  pdfPath?: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentUrl,
  pdfPath
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentTitle;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              {documentTitle}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vista previa del documento PDF
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-12 text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Acercar"
            >
              <ZoomIn size={18} />
            </button>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Rotar"
            >
              <RotateCw size={18} />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Descargar"
            >
              <Download size={18} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF Viewer Area */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
          {/* PDF Content */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Cargando documento...</p>
                </div>
              </div>
            )}

            {/* PDF Preview Placeholder */}
            <div 
              className="bg-white shadow-lg max-w-full max-h-full overflow-auto"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              {/* Simulated PDF content */}
              <div className="w-96 h-128 p-8 border border-gray-300">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                  
                  <div className="space-y-2">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="h-3 bg-gray-200 rounded" style={{
                        width: `${Math.random() * 30 + 70}%`
                      }}></div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      {Array.from({ length: 15 }, (_, i) => (
                        <div key={i} className="h-3 bg-gray-200 rounded" style={{
                          width: `${Math.random() * 40 + 60}%`
                        }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Página {currentPage} de XX
                </span>
                
                <button
                  onClick={handleNextPage}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Vista previa - Funcionalidad en desarrollo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;