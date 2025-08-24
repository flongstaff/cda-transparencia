import React, { useState, useEffect } from 'react';
import { ExternalLink, Archive, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface Document {
  filename: string;
  year: number;
  type: string;
  download_url: string;
  official_url: string;
  archive_url: string;
  verification_status: 'verified' | 'partial' | 'unverified';
  download_date: string;
}

interface DocumentViewerProps {
  searchQuery?: string;
  documentType?: string;
  year?: number;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  searchQuery = '', 
  documentType = 'all',
  year 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Error loading documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = documentType === 'all' || doc.type.includes(documentType);
    const matchesYear = !year || doc.year === year;
    return matchesSearch && matchesType && matchesYear;
  });

  const getDocumentCategory = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('licitacion')) return 'Licitaciones Públicas';
    if (name.includes('sueldos') || name.includes('escala')) return 'Información Salarial';
    if (name.includes('presupuesto') || name.includes('ordenanza')) return 'Presupuesto Municipal';
    if (name.includes('ejecucion') || name.includes('gastos')) return 'Ejecución Presupuestaria';
    if (name.includes('recursos')) return 'Recursos Municipales';
    if (name.includes('resolucion') || name.includes('disposicion')) return 'Normativa Legal';
    return 'Documentos Generales';
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" title="Verificado" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" title="Verificación Parcial" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" title="Sin Verificar" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando documentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              Documentos Oficiales Disponibles
            </h3>
            <p className="text-blue-600">
              Total: {filteredDocuments.length} documentos con fuentes verificadas
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Fuentes Oficiales Verificadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.map((doc, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-medium text-gray-900 mr-3">
                    {doc.filename}
                  </h4>
                  {getVerificationIcon(doc.verification_status)}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {getDocumentCategory(doc.filename)}
                  </span>
                  <span>Año: {doc.year}</span>
                  <span>Tipo: {doc.type.toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Descargado: {formatDate(doc.download_date)}
                </p>
              </div>
            </div>

            {/* Source Attribution */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-gray-800 mb-3 text-sm">
                🔍 Fuentes y Verificación
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fuente Oficial:</span>
                  <a
                    href={doc.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Portal de Transparencia
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Archivo Web:</span>
                  <a
                    href={doc.archive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-purple-600 hover:text-purple-800 text-sm"
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    Wayback Machine
                  </a>
                </div>
              </div>
            </div>

            {/* Actions - GitHub Compatible */}
            <div className="flex items-center space-x-3">
              {doc.primary_download ? (
                <a
                  href={doc.primary_download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar desde Sitio Oficial
                </a>
              ) : (
                <a
                  href={doc.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Información del Documento
                </a>
              )}
              
              <button
                onClick={() => window.open(doc.official_url, '_blank')}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver en Sitio Oficial
              </button>
              
              {doc.archive_download && (
                <button
                  onClick={() => window.open(doc.archive_download, '_blank')}
                  className="flex items-center px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archivo Web
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron documentos que coincidan con los criterios de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;