import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface DocumentViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ pdfUrl, title, className = '' }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const zoomIn = () => {
    setScale(Math.min(scale * 1.2, 3.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale * 0.8, 0.3));
  };

  return (
    <div className={`bg-white rounded-lg shadow border ${className}`}>
      {title && (
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{title}</h3>
        </div>
      )}

      <div className="p-4">
        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              {pageNumber} / {numPages || 1}
            </span>

            <button
              onClick={goToNextPage}
              disabled={!numPages || pageNumber >= numPages}
              className="p-2 border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className="p-2 border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="border border-gray-300 dark:border-dark-border rounded overflow-auto" style={{ height: '600px' }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            error={
              <div className="flex items-center justify-center h-full text-red-500">
                <div className="text-center">
                  <p>Error al cargar el documento PDF</p>
                  <p className="text-sm mt-2">Verificar que la ruta del archivo sea correcta</p>
                </div>
              </div>
            }
            loading={
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                Cargando documento...
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;