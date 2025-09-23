/**
 * Document Detail Page
 * Page to display detailed information about a specific document
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  ExternalLink,
  Eye, 
  Code, 
  AlertCircle,
  Loader2,
  Share2,
  ChevronLeft,
  Calendar,
  DollarSign,
  Users,
  Building,
  TrendingUp,
  Activity,
  Shield
} from 'lucide-react';
import { unifiedResourceService } from '../../services/UnifiedResourceService';
import { DocumentMetadata, SupportedFileType } from '../../types/documents';
import UniversalDocumentViewer from '@components/viewers/UniversalDocumentViewer.tsx';
import FallbackViewer from '@components/viewers/FallbackViewer.tsx';

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setError('ID de documento no especificado');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // In a real implementation, this would fetch the document by ID
        // For now, we'll use mock data
        const mockDocument: DocumentMetadata = {
          id: id,
          title: `Documento ${id}`,
          filename: `${id}.pdf`,
          year: 2024,
          category: 'Finanzas',
          size_mb: '2.5',
          url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/presupuesto-2024.pdf',
          official_url: 'https://example.com/presupuesto-2024.pdf',
          verification_status: 'verified',
          processing_date: new Date().toISOString(),
          relative_path: `data/organized_documents/${id}.pdf`,
          content: '',
          file_type: 'pdf'
        };

        setDocument(mockDocument);
        setLoading(false);
      } catch (err) {
        const errorMsg = `Error cargando documento: ${(err as Error).message}`;
        setError(errorMsg);
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  const handleDownload = () => {
    if (document?.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.share && document?.url) {
      navigator.share({
        title: document.title,
        url: document.url
      });
    } else {
      navigator.clipboard.writeText(document?.url || '');
    }
  };

  const handleOpen = () => {
    if (document?.url) {
      window.open(document.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar el documento
          </h3>
          <p className="text-gray-600 mb-4">{error || 'Documento no encontrado'}</p>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
            <Link
              to="/documents"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver a documentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
                title="Volver atrás"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{document.title}</h1>
                <p className="text-blue-100">
                  {document.category} • {document.year} • {document.size_mb} MB
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleShare}
                  className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
                  title="Compartir documento"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDownload}
                  className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
                  title="Descargar documento"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={handleOpen}
                  className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
                  title="Abrir en nueva ventana"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Metadata */}
        <div className="border-b border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-900">Fecha de procesamiento</h3>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(document.processing_date).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-900">Estado de verificación</h3>
              </div>
              <p className="text-sm text-gray-600">
                {document.verification_status === 'verified' ? 'Verificado' : 'Pendiente'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <FileText className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-900">Tipo de archivo</h3>
              </div>
              <p className="text-sm text-gray-600">
                {document.file_type.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="p-6">
          {document.url ? (
            <UniversalDocumentViewer
              document={document}
              onDownload={handleDownload}
              onOpen={handleOpen}
              onShare={handleShare}
              className="w-full"
            />
          ) : (
            <FallbackViewer
              document={document}
              error="No se proporcionó URL del documento"
              onDownload={handleDownload}
              onOpen={handleOpen}
              onShare={handleShare}
              className="w-full"
            />
          )}
        </div>

        {/* Related Documents */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos relacionados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="w-6 h-6 text-gray-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Documento relacionado {index}</h4>
                    <p className="text-sm text-gray-500 mt-1">Descripción breve del documento</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Finanzas
                      </span>
                      <span className="text-xs text-gray-500 ml-2">2024</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;