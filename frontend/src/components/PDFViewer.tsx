import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentUrl: string;
  pdfPath?: string;
  documentId?: number;
  markdownContent?: string;
  officialUrl?: string;
  archiveUrl?: string;
  verificationStatus?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentUrl,
  pdfPath,
  documentId,
  markdownContent,
  officialUrl,
  archiveUrl,
  verificationStatus
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pdf' | 'markdown' | 'info'>('pdf');
  const [documentData, setDocumentData] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && documentUrl) {
      setIsLoading(true);
      setError(null);
      
      // For demonstration, we'll use a timeout to simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false);
        setTotalPages(Math.floor(Math.random() * 50) + 10); // Random page count for demo
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, documentUrl]);

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
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNumber = parseInt(e.target.value);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDownload = () => {
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = `${documentTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const getPDFViewerUrl = () => {
    // For demonstration, we'll use PDF.js viewer or a similar approach
    // In production, you would integrate with a proper PDF viewer library
    
    if (documentUrl.startsWith('http')) {
      // External URL - use iframe with PDF viewer
      return `${documentUrl}#page=${currentPage}&zoom=${zoom}&rotate=${rotation}`;
    } else {
      // Local file - construct viewer URL
      return `/pdfjs/web/viewer.html?file=${encodeURIComponent(documentUrl)}#page=${currentPage}&zoom=${zoom/100}&rotate=${rotation}`;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando documento PDF...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Conectando con: {documentUrl.includes('carmendeareco.gob.ar') ? 'Sitio Oficial' : 'Archivo Local'}
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <X size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Error al cargar el documento</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.open(documentUrl, '_blank')}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
            >
              Abrir en nueva ventana
            </button>
          </div>
        </div>
      );
    }

    // For demo purposes, we'll show a PDF-like interface
    // In production, you would use a proper PDF viewer library like PDF.js
    return (
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto">
        <div className="flex items-center justify-center min-h-full p-4">
          <div 
            className="bg-white shadow-2xl max-w-4xl w-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
              minHeight: '800px'
            }}
          >
            {/* PDF Content Simulation */}
            <div className="p-8 space-y-6">
              <div className="text-center border-b border-gray-300 pb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {documentTitle}
                </h1>
                <p className="text-gray-600">
                  Municipalidad de Carmen de Areco
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Página {currentPage} de {totalPages}
                </p>
              </div>
              
              {/* Simulated content based on document type */}
              {documentTitle.toLowerCase().includes('presupuesto') && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Ejecución Presupuestaria {currentYear}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-300 p-4 rounded">
                      <h3 className="font-medium text-gray-700">Ingresos Totales</h3>
                      <p className="text-2xl font-bold text-green-600">$1.500.000.000</p>
                    </div>
                    <div className="border border-gray-300 p-4 rounded">
                      <h3 className="font-medium text-gray-700">Gastos Ejecutados</h3>
                      <p className="text-2xl font-bold text-blue-600">$1.420.000.000</p>
                    </div>
                  </div>
                  
                  {/* Table simulation */}
                  <div className="mt-6">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Categoría</th>
                          <th className="border border-gray-300 p-2 text-right">Presupuestado</th>
                          <th className="border border-gray-300 p-2 text-right">Ejecutado</th>
                          <th className="border border-gray-300 p-2 text-right">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2">Salud</td>
                          <td className="border border-gray-300 p-2 text-right">$420.000.000</td>
                          <td className="border border-gray-300 p-2 text-right">$398.000.000</td>
                          <td className="border border-gray-300 p-2 text-right">94.8%</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2">Educación</td>
                          <td className="border border-gray-300 p-2 text-right">$330.000.000</td>
                          <td className="border border-gray-300 p-2 text-right">$312.000.000</td>
                          <td className="border border-gray-300 p-2 text-right">94.5%</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2">Infraestructura</td>
                          <td className="border border-gray-300 p-2 text-right">$270.000.000</td>
                          <td className="border border-gray-300 p-2 text-right">$258.000.000</td>
                          <td className="border border-gray-300 p-2 text-right">95.6%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {documentTitle.toLowerCase().includes('licitación') && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Proceso de Licitación</h2>
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium text-gray-700 mb-2">Datos del Proceso</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>N° de Expediente:</strong> LIC-2024-045
                      </div>
                      <div>
                        <strong>Fecha de Apertura:</strong> 15/12/2024
                      </div>
                      <div>
                        <strong>Presupuesto Oficial:</strong> $25.000.000
                      </div>
                      <div>
                        <strong>Estado:</strong> En evaluación
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer with page info */}
              <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4 mt-8">
                <p>Documento oficial - Municipalidad de Carmen de Areco</p>
                <p>Generado desde el Portal de Transparencia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col bg-black ${isFullscreen ? 'bg-opacity-100' : 'bg-opacity-75'}`}
    >
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              {documentTitle}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fuente: {documentUrl.includes('carmendeareco.gob.ar') ? 'Sitio Oficial Municipal' : 
                     documentUrl.includes('web.archive.org') ? 'Web Archive' : 'Archivo Local'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              title="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-12 text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
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

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
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

        {/* Navigation Controls */}
        {!isLoading && !error && (
          <div className="flex items-center justify-center space-x-4 px-4 pb-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Página</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={handlePageInput}
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">de {totalPages}</span>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default PDFViewer;