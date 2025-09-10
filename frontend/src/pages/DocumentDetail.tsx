import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Hash, 
  CheckCircle, 
  AlertTriangle,
  Database,
  ExternalLink,
  Download,
  Eye,
  Share2,
  BookOpen,
  Activity,
  Clock
} from 'lucide-react';
import UnifiedDocumentViewer from '../components/viewers/UnifiedDocumentViewer';
import { useTransparencyData } from '../hooks/useTransparencyData';

interface Document {
  id: string;
  title: string;
  filename: string;
  category: string;
  year: number;
  size_mb: string;
  url?: string;
  verification_status: string;
  processing_date: string;
  file_type?: string;
  document_type?: string;
  content?: string;
  financial_data?: any;
  integrity_verified: boolean;
  sha256_hash?: string;
  data_sources?: string[];
}

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDocumentData();
    }
  }, [id]);

  const loadDocumentData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const [allDocuments] = await Promise.all([
        // Use unified data instead of API call
      ]);

      // Find the specific document
      const foundDocument = allDocuments.find(doc => doc.id === id);
      
      if (!foundDocument) {
        setError('Documento no encontrado');
        return;
      }

      setDocument(foundDocument);

      // Get related documents (same category or year)
      const related = allDocuments.filter(doc => 
        doc.id !== id && (
          doc.category === foundDocument.category || 
          doc.year === foundDocument.year
        )
      ).slice(0, 6);

      setRelatedDocuments(related);

    } catch (err) {
      console.error('Error loading document:', err);
      setError('Error cargando el documento. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document?.title || 'Documento de Transparencia',
        text: `Documento: ${document?.title || 'Sin título'}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatFileSize = (sizeStr: string): string => {
    const size = parseFloat(sizeStr || '0');
    if (size < 1) return `${(size * 1024).toFixed(0)} KB`;
    return `${size.toFixed(1)} MB`;
  };

  const getVerificationIcon = (status: string, verified: boolean) => {
    if (verified || status === 'verified') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getVerificationText = (status: string, verified: boolean) => {
    if (verified || status === 'verified') {
      return 'Documento Verificado';
    }
    return 'Verificación Pendiente';
  };

  const getVerificationColor = (status: string, verified: boolean) => {
    if (verified || status === 'verified') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Documento no encontrado'}</p>
          <button
            onClick={() => navigate('/documents')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Documentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {document.title}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {document.year}
                  </span>
                  <span className="flex items-center">
                    <Database className="w-4 h-4 mr-1" />
                    {document.category}
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {formatFileSize(document.size_mb)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Compartir documento"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {document.url && (
                <>
                  <a
                    href={document.url}
                    download={document.filename}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                    title="Descargar documento"
                  >
                    <Download className="w-5 h-5" />
                  </a>

                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    title="Abrir en nueva ventana"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Document Viewer */}
          <div className="lg:col-span-3">
            <UnifiedDocumentViewer
              documentId={document.id}
              documents={[document]}
              showList={false}
              className="mb-8"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Document Metadata */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Documento
              </h3>

              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado de Verificación</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerificationColor(document.verification_status, document.integrity_verified)}`}>
                      {getVerificationIcon(document.verification_status, document.integrity_verified)}
                      <span className="ml-2">{getVerificationText(document.verification_status, document.integrity_verified)}</span>
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Categoría</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.category}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Año</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.year}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo de Archivo</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {document.file_type || document.document_type || 'No especificado'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Tamaño</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatFileSize(document.size_mb)}</dd>
                </div>

                {document.processing_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de Procesamiento</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(document.processing_date).toLocaleDateString('es-ES')}
                    </dd>
                  </div>
                )}

                {document.sha256_hash && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Hash SHA256</dt>
                    <dd className="mt-1 text-xs text-gray-700 font-mono break-all">
                      {document.sha256_hash}
                    </dd>
                  </div>
                )}

                {document.data_sources && document.data_sources.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fuentes de Datos</dt>
                    <dd className="mt-1">
                      {document.data_sources.map((source, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                        >
                          {source}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Financial Data */}
            {document.financial_data && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Datos Financieros
                </h3>
                <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(document.financial_data, null, 2)}
                </pre>
              </motion.div>
            )}

            {/* Related Documents */}
            {relatedDocuments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Documentos Relacionados
                </h3>
                <div className="space-y-3">
                  {relatedDocuments.map((relDoc) => (
                    <motion.div
                      key={relDoc.id}
                      whileHover={{ x: 4 }}
                      className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/documents/${relDoc.id}`)}
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {relDoc.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {relDoc.category} • {relDoc.year}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/documents')}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver todos los documentos →
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;