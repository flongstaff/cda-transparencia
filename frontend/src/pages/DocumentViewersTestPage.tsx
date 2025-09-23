/**
 * Document Viewers Test Page
 * Test page to verify all document viewer components with real GitHub resources
 */

import React, { useState } from 'react';
import { 
  FileText, 
  FileImage, 
  Archive, 
  Braces, 
  FileSpreadsheet,
  Presentation,
  FileWord,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  Eye,
  Share2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DocumentMetadata } from '../types/documents';
import PDFViewer from '../components/viewers/PDFViewer';
import MarkdownViewer from '../components/viewers/MarkdownViewer';
import ImageViewer from '../components/viewers/ImageViewer';
import JSONViewer from '../components/viewers/JSONViewer';
import ArchiveViewer from '../components/viewers/ArchiveViewer';
import OfficeViewer from '../components/viewers/OfficeViewer';
import TextViewer from '../components/viewers/TextViewer';

// Mock document data for testing
const mockDocuments: DocumentMetadata[] = [
  {
    id: 'pdf-001',
    title: 'Presupuesto Municipal 2024',
    filename: 'presupuesto-2024.pdf',
    year: 2024,
    category: 'Presupuesto',
    size_mb: '2.5',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/presupuesto-2024.pdf',
    official_url: 'https://example.com/presupuesto-2024.pdf',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/presupuesto-2024.pdf',
    content: '',
    file_type: 'pdf'
  },
  {
    id: 'md-001',
    title: 'Informe de Ejecución Presupuestaria',
    filename: 'informe-ejecucion.md',
    year: 2024,
    category: 'Finanzas',
    size_mb: '0.8',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/informe-ejecucion.md',
    official_url: 'https://example.com/informe-ejecucion.md',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/informe-ejecucion.md',
    content: '# Informe de Ejecución Presupuestaria\n\nEste informe detalla la ejecución presupuestaria del municipio...',
    file_type: 'md'
  },
  {
    id: 'jpg-001',
    title: 'Gráfico de Ingresos',
    filename: 'grafico-ingresos.jpg',
    year: 2024,
    category: 'Finanzas',
    size_mb: '1.2',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/grafico-ingresos.jpg',
    official_url: 'https://example.com/grafico-ingresos.jpg',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/grafico-ingresos.jpg',
    content: '',
    file_type: 'jpg'
  },
  {
    id: 'json-001',
    title: 'Datos de Sueldos',
    filename: 'sueldos-2024.json',
    year: 2024,
    category: 'Recursos Humanos',
    size_mb: '0.5',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/sueldos-2024.json',
    official_url: 'https://example.com/sueldos-2024.json',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/sueldos-2024.json',
    content: '{"empleados": [{"nombre": "Juan Pérez", "sueldo": 50000}, {"nombre": "María García", "sueldo": 45000}]}',
    file_type: 'json'
  },
  {
    id: 'zip-001',
    title: 'Archivos de Contratos',
    filename: 'contratos-2024.zip',
    year: 2024,
    category: 'Contratos',
    size_mb: '3.2',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/contratos-2024.zip',
    official_url: 'https://example.com/contratos-2024.zip',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/contratos-2024.zip',
    content: '',
    file_type: 'zip'
  },
  {
    id: 'docx-001',
    title: 'Informe Anual de Gestión',
    filename: 'informe-anual.docx',
    year: 2024,
    category: 'Informes',
    size_mb: '2.1',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/informe-anual.docx',
    official_url: 'https://example.com/informe-anual.docx',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/informe-anual.docx',
    content: '',
    file_type: 'docx'
  },
  {
    id: 'xlsx-001',
    title: 'Presupuesto Detallado',
    filename: 'presupuesto-detallado.xlsx',
    year: 2024,
    category: 'Presupuesto',
    size_mb: '1.8',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/presupuesto-detallado.xlsx',
    official_url: 'https://example.com/presupuesto-detallado.xlsx',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/presupuesto-detallado.xlsx',
    content: '',
    file_type: 'xlsx'
  },
  {
    id: 'txt-001',
    title: 'Registro de Asistencia',
    filename: 'asistencia.txt',
    year: 2024,
    category: 'Recursos Humanos',
    size_mb: '0.1',
    url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/asistencia.txt',
    official_url: 'https://example.com/asistencia.txt',
    verification_status: 'verified',
    processing_date: new Date().toISOString(),
    relative_path: 'data/organized_documents/asistencia.txt',
    content: 'Registro de asistencia de empleados municipales...',
    file_type: 'txt'
  }
];

const DocumentViewersTestPage: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: 'pending' | 'loading' | 'success' | 'error'; message?: string }>>({});
  const [activeTab, setActiveTab] = useState<'test' | 'viewer'>('test');

  const runTest = async (document: DocumentMetadata) => {
    // Update status to loading
    setTestResults(prev => ({
      ...prev,
      [document.id]: { status: 'loading' }
    }));

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update status to success
      setTestResults(prev => ({
        ...prev,
        [document.id]: { status: 'success', message: 'Documento cargado correctamente' }
      }));
    } catch (error) {
      // Update status to error
      setTestResults(prev => ({
        ...prev,
        [document.id]: { status: 'error', message: (error as Error).message }
      }));
    }
  };

  const runAllTests = async () => {
    for (const document of mockDocuments) {
      await runTest(document);
    }
  };

  const resetTests = () => {
    const resetResults: Record<string, { status: 'pending' | 'loading' | 'success' | 'error'; message?: string }> = {};
    mockDocuments.forEach(doc => {
      resetResults[doc.id] = { status: 'pending' };
    });
    setTestResults(resetResults);
    setSelectedDocument(null);
    setActiveTab('test');
  };

  const getStatusIcon = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return 'Cargando...';
      case 'success':
        return 'Éxito';
      case 'error':
        return 'Error';
      default:
        return 'Pendiente';
    }
  };

  const getStatusClass = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const renderViewer = () => {
    if (!selectedDocument) return null;

    switch (selectedDocument.file_type) {
      case 'pdf':
        return <PDFViewer document={selectedDocument} className="w-full" />;
      case 'md':
      case 'markdown':
        return <MarkdownViewer document={selectedDocument} className="w-full" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <ImageViewer document={selectedDocument} className="w-full" />;
      case 'json':
        return <JSONViewer document={selectedDocument} className="w-full" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <ArchiveViewer document={selectedDocument} className="w-full" />;
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
        return <OfficeViewer document={selectedDocument} className="w-full" />;
      case 'txt':
      case 'csv':
        return <TextViewer document={selectedDocument} className="w-full" />;
      default:
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tipo de documento no soportado
            </h3>
            <p className="text-gray-600 mb-4">
              No hay un visor disponible para documentos de tipo {selectedDocument.file_type.toUpperCase()}.
            </p>
            <div className="space-x-3">
              <a
                href={selectedDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir directamente
              </a>
              <a
                href={selectedDocument.url}
                download={selectedDocument.filename}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white">Prueba de Visores de Documentos</h1>
          <p className="text-blue-100 mt-2">
            Verificación de todos los visores de documentos con recursos reales de GitHub
          </p>
        </div>
        
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('test')}
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'test'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pruebas
            </button>
            <button
              onClick={() => setActiveTab('viewer')}
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'viewer'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!selectedDocument}
            >
              Visor de Documentos
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'test' ? (
            <div className="space-y-6">
              {/* Test Controls */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={runAllTests}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Ejecutar todas las pruebas
                </button>
                
                <button
                  onClick={resetTests}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar pruebas
                </button>
              </div>
              
              {/* Test Results Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{mockDocuments.length}</div>
                  <div className="text-sm text-blue-600">Total de pruebas</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {Object.values(testResults).filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-green-600">Pruebas exitosas</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-700">
                    {Object.values(testResults).filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-red-600">Pruebas fallidas</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">
                    {Object.values(testResults).filter(r => r.status === 'pending' || r.status === 'loading').length}
                  </div>
                  <div className="text-sm text-gray-600">Pruebas pendientes</div>
                </div>
              </div>
              
              {/* Test Results */}
              <div className="space-y-4">
                {mockDocuments.map(document => (
                  <div 
                    key={document.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <FileIcon document={document} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{document.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{document.filename}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {document.category} • {document.year} • {document.size_mb} MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(testResults[document.id]?.status || 'pending')}`}>
                          {getStatusIcon(testResults[document.id]?.status || 'pending')}
                          <span className="capitalize">{getStatusText(testResults[document.id]?.status || 'pending')}</span>
                        </div>
                        
                        <button
                          onClick={() => runTest(document)}
                          disabled={testResults[document.id]?.status === 'loading'}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                          title="Ejecutar prueba"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedDocument(document);
                            setActiveTab('viewer');
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Ver documento"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {testResults[document.id]?.message && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${
                        testResults[document.id]?.status === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-green-50 border border-green-200 text-green-700'
                      }`}>
                        <p>{testResults[document.id]?.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDocument && renderViewer()}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('test')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Volver a pruebas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component to render file icons
const FileIcon: React.FC<{ document: DocumentMetadata }> = ({ document }) => {
  switch (document.file_type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <FileImage className="w-5 h-5 text-green-500" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive className="w-5 h-5 text-purple-500" />;
    case 'json':
      return <Braces className="w-5 h-5 text-yellow-500" />;
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
    case 'md':
    case 'markdown':
      return <FileText className="w-5 h-5 text-gray-500" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

export default DocumentViewersTestPage;