/**
 * Comprehensive PDF Viewer
 * Displays real Carmen de Areco documents with multiple viewing options
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Eye, 
  Calendar,
  FolderOpen,
  Link,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import ComprehensiveDataService, { DocumentLink } from '../../services/ComprehensiveDataService';

interface ComprehensivePDFViewerProps {
  documentId?: string;
  year?: number;
  category?: string;
  showComparison?: boolean;
}

export const ComprehensivePDFViewer: React.FC<ComprehensivePDFViewerProps> = ({
  documentId,
  year,
  category,
  showComparison = false
}) => {
  const [documents, setDocuments] = useState<DocumentLink[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'viewer' | 'comparison'>('list');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const dataService = ComprehensiveDataService.getInstance();

  useEffect(() => {
    loadDocuments();
  }, [year, category]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let docs: DocumentLink[] = [];
      
      if (documentId) {
        // Load specific document
        const allDocs = await dataService.getAllDocuments();
        const doc = allDocs.find(d => d.id === documentId);
        if (doc) {
          docs = [doc];
          setSelectedDocument(doc);
          setViewMode('viewer');
        }
      } else if (year) {
        docs = await dataService.getDocumentsByYear(year);
      } else if (category) {
        docs = await dataService.getDocumentsByCategory(category);
      } else {
        docs = await dataService.getAllDocuments();
      }

      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = async (document: DocumentLink) => {
    setSelectedDocument(document);
    setViewMode('viewer');

    if (showComparison) {
      try {
        const comparison = await dataService.compareDataSources(document.id);
        setComparisonData(comparison);
      } catch (error) {
        console.error('Error loading comparison:', error);
      }
    }
  };

  const handleViewComparison = async () => {
    if (!selectedDocument) return;
    
    setViewMode('comparison');
    
    try {
      const comparison = await dataService.compareDataSources(selectedDocument.id);
      setComparisonData(comparison);
    } catch (error) {
      console.error('Error loading comparison:', error);
      setError('Error loading data comparison');
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDocumentIcon = (docType: DocumentLink['document_type']) => {
    switch (docType) {
      case 'budget_execution': return <BarChart3 className="w-4 h-4 text-green-600" />;
      case 'financial_statement': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'debt_report': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'salary_report': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'tender': return <FolderOpen className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: DocumentLink['verification_status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Visor Integral de Documentos</h1>
            <p className="text-blue-100">
              Carmen de Areco - Documentos Oficiales y Verificados
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{documents.length}</div>
            <div className="text-blue-100">Documentos</div>
          </div>
        </div>
      </div>

      {/* View Mode Controls */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'list', label: 'Lista de Documentos', icon: FolderOpen },
          { id: 'viewer', label: 'Visor PDF', icon: Eye, disabled: !selectedDocument },
          { id: 'comparison', label: 'Comparación de Datos', icon: BarChart3, disabled: !selectedDocument }
        ].map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            onClick={() => id === 'comparison' ? handleViewComparison() : setViewMode(id as any)}
            disabled={disabled}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === id
                ? 'bg-white text-blue-600 shadow-sm'
                : disabled 
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 cursor-pointer'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleDocumentSelect(document)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getDocumentIcon(document.document_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {document.title}
                      </h3>
                      {getStatusBadge(document.verification_status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {document.year}
                      </span>
                      <span>{document.category}</span>
                      <span>{document.file_size_mb.toFixed(1)} MB</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs text-gray-500">Fuentes:</span>
                      {document.data_sources.slice(0, 2).map((source, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {source.includes('transparency') ? 'Sitio Oficial' : 
                           source.includes('live_scrape') ? 'Descarga Directa' :
                           source.includes('markdown') ? 'Procesado' : 'API'}
                        </span>
                      ))}
                      {document.data_sources.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{document.data_sources.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInNewTab(document.direct_pdf_url);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Abrir PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInNewTab(document.official_url);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Ver en sitio oficial"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'viewer' && selectedDocument && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Document Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDocument.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{selectedDocument.category}</span>
                  <span>{selectedDocument.year}</span>
                  <span>{selectedDocument.file_size_mb.toFixed(1)} MB</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openInNewTab(selectedDocument.direct_pdf_url)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir PDF</span>
                </button>
                
                <button
                  onClick={() => openInNewTab(selectedDocument.official_url)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Link className="w-4 h-4" />
                  <span>Sitio Oficial</span>
                </button>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="h-screen">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedDocument.direct_pdf_url)}&embedded=true`}
              className="w-full h-full border-0"
              title={selectedDocument.title}
            />
          </div>
        </div>
      )}

      {viewMode === 'comparison' && selectedDocument && comparisonData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Comparación de Fuentes de Datos
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* PDF Data */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Datos del Documento PDF</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(comparisonData.pdf_data || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-blue-700">{key}:</span>
                    <span className="font-medium">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PowerBI Data */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Datos de PowerBI</h3>
              <div className="space-y-2 text-sm">
                <div className="text-green-700">
                  Puntos de datos: {comparisonData.powerbi_data?.length || 0}
                </div>
                {comparisonData.powerbi_data?.slice(0, 5).map((point: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-green-700">{point.category}:</span>
                    <span className="font-medium">{point.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Match Score */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Puntaje de Coincidencia:</span>
              <div className={`text-2xl font-bold ${
                comparisonData.match_score >= 90 ? 'text-green-600' :
                comparisonData.match_score >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {comparisonData.match_score.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Discrepancies */}
          {comparisonData.discrepancies?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Discrepancias Encontradas</h3>
              <div className="space-y-3">
                {comparisonData.discrepancies.map((discrepancy: any, index: number) => (
                  <div 
                    key={index}
                    className={`border-l-4 pl-4 py-2 ${
                      discrepancy.significance === 'high' ? 'border-red-500 bg-red-50' :
                      discrepancy.significance === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-gray-500 bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{discrepancy.field}</div>
                    <div className="text-sm text-gray-600">
                      PDF: {typeof discrepancy.pdf_value === 'number' ? discrepancy.pdf_value.toLocaleString() : discrepancy.pdf_value} | 
                      PowerBI: {typeof discrepancy.powerbi_value === 'number' ? discrepancy.powerbi_value.toLocaleString() : discrepancy.powerbi_value}
                    </div>
                    <div className="text-sm font-medium">
                      Diferencia: {typeof discrepancy.difference === 'number' ? discrepancy.difference.toLocaleString() : discrepancy.difference}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComprehensivePDFViewer;