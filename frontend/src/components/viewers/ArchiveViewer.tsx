/**
 * Archive Viewer Component
 * Component to display archive files (ZIP, RAR, 7Z) with content listing
 */

import React, { useState, useEffect } from 'react';
import {
  Archive,
  Download,
  ExternalLink,
  Eye,
  AlertCircle,
  Loader2,
  Share2,
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  Braces,
  Code,
  File
} from 'lucide-react';
import { DocumentMetadata } from '../../types/documents';

interface ArchiveEntry {
  name: string;
  size: string;
  type: 'file' | 'directory';
  path: string;
  modified: string;
}

interface ArchiveViewerProps {
  document: DocumentMetadata;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
}

const ArchiveViewer: React.FC<ArchiveViewerProps> = ({
  document,
  onError,
  onLoad,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ArchiveEntry; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    if (document.url) {
      setLoading(true);
      setError(null);
      
      // Simulate loading archive contents
      const timer = setTimeout(() => {
        try {
          // Generate mock archive entries
          const mockEntries: ArchiveEntry[] = [
            { name: 'document.pdf', size: '2.4 MB', type: 'file', path: 'document.pdf', modified: '2024-01-15' },
            { name: 'images', size: '5.2 MB', type: 'directory', path: 'images/', modified: '2024-01-10' },
            { name: 'data.json', size: '156 KB', type: 'file', path: 'data.json', modified: '2024-01-12' },
            { name: 'README.md', size: '2.1 KB', type: 'file', path: 'README.md', modified: '2024-01-08' },
            { name: 'sources', size: '3.8 MB', type: 'directory', path: 'sources/', modified: '2024-01-05' },
            { name: 'budget.xlsx', size: '1.2 MB', type: 'file', path: 'budget.xlsx', modified: '2024-01-18' },
            { name: 'presentation.pptx', size: '850 KB', type: 'file', path: 'presentation.pptx', modified: '2024-01-20' },
            { name: 'contract.docx', size: '420 KB', type: 'file', path: 'contract.docx', modified: '2024-01-22' }
          ];
          
          setArchiveEntries(mockEntries);
          setLoading(false);
          onLoad?.();
        } catch (err) {
          const errorMsg = `Error cargando contenido del archivo: ${(err as Error).message}`;
          setError(errorMsg);
          setLoading(false);
          onError?.(errorMsg);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [document.url, onLoad, onError]);

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

  const requestSort = (key: keyof ArchiveEntry) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEntries = [...archiveEntries].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getFileIcon = (entry: ArchiveEntry) => {
    if (entry.type === 'directory') {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    
    const ext = entry.name.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FileImage className="w-5 h-5 text-green-500" />;
      case 'json':
        return <Braces className="w-5 h-5 text-yellow-500" />;
      case 'md':
        return <FileText className="w-5 h-5 text-blue-500" />;
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
        return <FileText className="w-5 h-5 text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />;
      case 'js':
      case 'ts':
      case 'tsx':
        return <Code className="w-5 h-5 text-yellow-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />;
    }
  };

  const getFileTypeDescription = (entry: ArchiveEntry) => {
    if (entry.type === 'directory') {
      return 'Directorio';
    }
    
    const ext = entry.name.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return 'Documento PDF';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'Imagen';
      case 'json':
        return 'Documento JSON';
      case 'md':
        return 'Documento Markdown';
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
      case 'js':
      case 'ts':
      case 'tsx':
        return 'Archivo de código';
      default:
        return 'Documento';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Analizando contenido del archivo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
          Error al cargar el archivo
        </h3>
        <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-4">{error}</p>
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
            className="px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background inline-flex items-center"
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
      {/* Archive Viewer Header */}
      <div className="border-b border-gray-200 dark:border-dark-border p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <Archive className="w-6 h-6 text-purple-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary truncate">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                Archivo {document.file_type.toUpperCase()} • {document.size_mb} MB • {archiveEntries.length} elementos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary hover:text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg"
                title="Compartir archivo"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                title="Descargar archivo"
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

      {/* Archive Content Area */}
      <div className="relative min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Analizando contenido del archivo...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
                Error al analizar el archivo
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-4">{error}</p>
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
                  className="px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Descargar directamente
                </a>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="p-4">
            <div className="border border-gray-300 dark:border-dark-border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        Nombre
                        {sortConfig.key === 'name' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt"
                      onClick={() => requestSort('size')}
                    >
                      <div className="flex items-center">
                        Tamaño
                        {sortConfig.key === 'size' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt"
                      onClick={() => requestSort('modified')}
                    >
                      <div className="flex items-center">
                        Modificado
                        {sortConfig.key === 'modified' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                  {sortedEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-5 w-5">
                            {getFileIcon(entry)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{entry.name}</div>
                            <div className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{getFileTypeDescription(entry)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                        {entry.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                        {entry.modified}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900">
                          Extraer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info box */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center">
                <Archive className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Contenido del archivo
                  </p>
                  <p className="text-sm text-blue-700">
                    Este archivo contiene {archiveEntries.length} elementos. 
                    Para acceder al contenido, descargue el archivo y extráigalo localmente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Archive Footer with metadata */}
      <div className="border-t border-gray-200 dark:border-dark-border px-4 py-3 bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
          <div className="flex items-center space-x-4">
            <span>Archivo {document.file_type.toUpperCase()}</span>
            <span>{archiveEntries.length} elementos</span>
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

export default ArchiveViewer;