import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import DocumentViewer from '../components/viewers/DocumentViewer2';

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useMasterData();

  if (isLoading) return <p className="text-center py-8">Cargando documento…</p>;
  if (isError) return <p className="text-center text-red-600 py-8">Error: {error}</p>;

  const doc = data?.documents?.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Documento no encontrado.</p>
        <Link to="/documents" className="text-blue-600 hover:underline">
          ← Volver a documentos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center mb-4">
        <Link to="/documents" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">{doc.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {doc.category} • {doc.type.toUpperCase()} • {formatFileSize((doc.size_mb || 0) * 1024 * 1024)}
      </p>

      {/* Viewer – assumes the component can handle PDFs, images, etc. */}
      <DocumentViewer url={doc.url} type={doc.type} />

      <div className="mt-6 flex space-x-4">
        {doc.url && (
          <a
            href={doc.url}
            download
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-1" />
            Descargar
          </a>
        )}
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver en nueva pestaña
        </a>
      </div>
    </div>
  );
};

export default DocumentDetail;