import React from 'react';
import { FileText, Download, Eye, ExternalLink } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  filename: string;
  year: number;
  category: string;
  type: string;
  size_mb: number;
  url: string;
  official_url: string;
  verification_status: string;
  processing_date: string;
}

interface DocumentViewerProps {
  documents: Document[];
  onDocumentSelect?: (document: Document) => void;
  showList?: boolean;
  defaultView?: 'grid' | 'list';
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  onDocumentSelect,
  showList = true,
  defaultView = 'grid',
  className = ''
}) => {
  const getFileIcon = (document: Document) => {
    const type = document.type?.toLowerCase() || '';
    const filename = document.filename?.toLowerCase() || '';
    
    if (type.includes('pdf') || filename.endsWith('.pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const getFileTypeDescription = (document: Document) => {
    const type = document.type?.toLowerCase() || '';
    const filename = document.filename?.toLowerCase() || '';
    
    if (type.includes('pdf') || filename.endsWith('.pdf')) return 'Documento PDF';
    return 'Documento';
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer dark:bg-gray-800 dark:border-gray-700"
      onClick={() => onDocumentSelect?.(document)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getFileIcon(document)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate dark:text-white">
            {document.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            {document.category} • {document.year}
          </p>
          <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
            {getFileTypeDescription(document)} • {document.size_mb.toFixed(1)} MB
          </p>
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              document.verification_status === 'verified'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {document.verification_status === 'verified' ? 'Verificado' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentListItem: React.FC<{ document: Document }> = ({ document }) => (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer dark:bg-gray-800 dark:border-gray-700"
      onClick={() => onDocumentSelect?.(document)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-shrink-0">
            {getFileIcon(document)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate dark:text-white">
              {document.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {document.category} • {getFileTypeDescription(document)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <span>{document.year}</span>
          <span>{document.size_mb.toFixed(1)} MB</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            document.verification_status === 'verified'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {document.verification_status === 'verified' ? 'Verificado' : 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );

  if (!showList) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${
          defaultView === 'list' ? 'hidden' : 'grid'
        }`}>
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>

        <div className={`space-y-3 ${
          defaultView === 'grid' ? 'hidden' : 'block'
        }`}>
          {documents.map((document) => (
            <DocumentListItem key={document.id} document={document} />
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay documentos disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron documentos para mostrar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;