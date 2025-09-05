import React, { useState } from 'react';
import { FileText, Download, ExternalLink, X } from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  original_path: string;
  document_type: string;
  category: string;
  year: number;
  file_size: number;
  file_hash: string;
  verification_status: 'verified' | 'pending' | 'failed' | 'partial';
  official_url?: string;
  archive_url?: string;
  markdown_available: boolean;
  verification_status_badge: string;
  display_category: string;
  file_size_formatted: string;
  created_at: string;
  updated_at: string;
}

interface SimpleDocumentViewerProps {
  document: Document;
  onClose: () => void;
}

const SimpleDocumentViewer: React.FC<SimpleDocumentViewerProps> = ({ document, onClose }) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'info'>('info');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVerificationStatusText = (status: string): string => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Falló';
      case 'partial': return 'Parcial';
      default: return status;
    }
  };

  const getVerificationStatusClass = (status: string): string => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {document.filename}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'info' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('info')}
          >
            Información
          </button>
          {document.official_url && (
            <button
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'pdf' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setViewMode('pdf')}
            >
              Ver PDF
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'info' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Detalles del Documento</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nombre:</span>
                      <span className="font-medium">{document.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Categoría:</span>
                      <span className="font-medium">{document.display_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Año:</span>
                      <span className="font-medium">{document.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium">{document.document_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tamaño:</span>
                      <span className="font-medium">{document.file_size_formatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusClass(document.verification_status)}`}>
                        {getVerificationStatusText(document.verification_status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Fuentes</h3>
                  <div className="space-y-3">
                    {document.official_url && (
                      <a
                        href={document.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Fuente Oficial</p>
                          <p className="text-xs text-gray-500 truncate">{document.official_url}</p>
                        </div>
                      </a>
                    )}
                    
                    {document.archive_url && (
                      <a
                        href={document.archive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-purple-500 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Archivo Web</p>
                          <p className="text-xs text-gray-500 truncate">Wayback Machine</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Verificación</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${document.verification_status === 'verified' ? 'bg-green-500' : document.verification_status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {document.verification_status === 'verified' 
                      ? 'Documento verificado oficialmente' 
                      : document.verification_status === 'pending'
                      ? 'Documento pendiente de verificación'
                      : 'Documento no verificado'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Hash SHA-256: {document.file_hash}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  Visualizando documento oficial desde la fuente original
                </p>
              </div>
              <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden">
                {document.official_url ? (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.official_url)}&embedded=true`}
                    className="w-full h-full"
                    title={`Documento: ${document.filename}`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No hay fuente disponible para visualizar el documento</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          {document.official_url && (
            <a
              href={document.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDocumentViewer;