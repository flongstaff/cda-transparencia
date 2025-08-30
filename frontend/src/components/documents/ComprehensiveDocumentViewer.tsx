import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Eye, Search, Filter, Calendar, 
  ExternalLink, AlertTriangle, CheckCircle, Clock,
  Database, Globe, Archive, RefreshCw, BarChart3,
  Shield, Verified, AlertCircle
} from 'lucide-react';
import ApiService from '../../services/ApiService';

interface Document {
  id: string;
  year: number;
  title: string;
  description: string;
  category: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'html';
  size: number;
  lastModified: string;
  officialUrl: string;
  archiveUrl?: string;
  localPath?: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  extractedData?: {
    summary: string;
    keyFindings: string[];
    amounts: Array<{
      description: string;
      amount: number;
      category: string;
    }>;
    anomalies: string[];
  };
  metadata: {
    author: string;
    createdDate: string;
    hash: string;
    digitalSignature?: boolean;
  };
}

interface ComprehensiveDocumentViewerProps {
  year?: number;
  category?: string;
  enableAudit?: boolean;
}

const ComprehensiveDocumentViewer: React.FC<ComprehensiveDocumentViewerProps> = ({
  year = new Date().getFullYear(),
  category = 'all',
  enableAudit = true
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'audit'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'status'>('date');
  
  const availableYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);
  const categories = [
    'all', 'presupuesto', 'gastos', 'contratos', 'ordenanzas', 'informes', 
    'licitaciones', 'declaraciones', 'estados-financieros'
  ];

  useEffect(() => {
    loadDocuments();
  }, [year]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory, sortBy]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Mock document loading - would integrate with real API
      const mockDocuments = generateMockDocuments(year);
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    const filtered = documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return b.size - a.size;
        case 'status':
          return a.verificationStatus.localeCompare(b.verificationStatus);
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  };

  const generateMockDocuments = (year: number): Document[] => {
    const categories = ['presupuesto', 'gastos', 'contratos', 'ordenanzas', 'informes'];
    const types = ['pdf', 'xlsx', 'docx'] as const;
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `doc-${year}-${i}`,
      year,
      title: `Documento ${categories[i % categories.length]} ${year} - ${String(i + 1).padStart(3, '0')}`,
      description: `Documentación oficial de ${categories[i % categories.length]} correspondiente al año ${year}`,
      category: categories[i % categories.length],
      type: types[i % types.length],
      size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
      lastModified: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      officialUrl: `https://carmendeareco.gob.ar/transparencia/${year}/${categories[i % categories.length]}/doc-${i + 1}.${types[i % types.length]}`,
      archiveUrl: `https://web.archive.org/web/20241201120000/carmendeareco.gob.ar/transparencia/${year}/doc-${i + 1}.${types[i % types.length]}`,
      localPath: `/data/documents/${year}/${categories[i % categories.length]}/doc-${i + 1}.${types[i % types.length]}`,
      verificationStatus: ['verified', 'pending', 'failed'][Math.floor(Math.random() * 3)] as 'verified' | 'pending' | 'failed',
      extractedData: {
        summary: `Resumen del documento ${i + 1} de ${categories[i % categories.length]} para el año ${year}`,
        keyFindings: [
          `Hallazgo clave 1 del documento ${i + 1}`,
          `Elemento importante identificado`,
          `Dato relevante para la transparencia`
        ],
        amounts: [
          {
            description: `Gasto principal documento ${i + 1}`,
            amount: Math.floor(Math.random() * 10000000) + 100000,
            category: categories[i % categories.length]
          }
        ],
        anomalies: Math.random() > 0.7 ? [`Posible anomalía detectada en documento ${i + 1}`] : []
      },
      metadata: {
        author: 'Carmen de Areco - Secretaría de Hacienda',
        createdDate: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        hash: `sha256-${Math.random().toString(36).substr(2, 64)}`,
        digitalSignature: Math.random() > 0.3
      }
    }));
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'xlsx':
        return '📊';
      case 'docx':
        return '📝';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Documentos {year}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {filteredDocuments.length} documentos disponibles
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {['grid', 'list', 'audit'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {mode === 'audit' ? 'Auditoría' : mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas las categorías' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Fecha</option>
            <option value="name">Nombre</option>
            <option value="size">Tamaño</option>
            <option value="status">Estado</option>
          </select>
        </div>
      </div>

      {/* Document Grid/List View */}
      {viewMode !== 'audit' && (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedDocument(doc)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {doc.category}
                    </p>
                  </div>
                </div>
                {getStatusIcon(doc.verificationStatus)}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {doc.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(doc.size)}</span>
                <span>{new Date(doc.lastModified).toLocaleDateString('es-AR')}</span>
              </div>
              
              {doc.extractedData?.anomalies && doc.extractedData.anomalies.length > 0 && (
                <div className="mt-3 flex items-center text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {doc.extractedData.anomalies.length} anomalía(s) detectada(s)
                </div>
              )}
              
              <div className="mt-4 flex items-center space-x-2">
                <button className="flex items-center text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </button>
                <button className="flex items-center text-xs text-green-600 hover:text-green-800 dark:text-green-400">
                  <Download className="h-3 w-3 mr-1" />
                  Descargar
                </button>
                <button className="flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Original
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Audit View */}
      {viewMode === 'audit' && enableAudit && (
        <div className="space-y-6">
          {/* Audit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Verificados</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {filteredDocuments.filter(d => d.verificationStatus === 'verified').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {filteredDocuments.filter(d => d.verificationStatus === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Con Anomalías</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {filteredDocuments.filter(d => d.extractedData?.anomalies && d.extractedData.anomalies.length > 0).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Con Firma Digital</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {filteredDocuments.filter(d => d.metadata.digitalSignature).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Auditoría Detallada de Documentos
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Anomalías
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Firma Digital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDocuments.slice(0, 20).map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{getTypeIcon(doc.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.category} • {formatFileSize(doc.size)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(doc.verificationStatus)}
                          <span className={`ml-2 text-sm ${
                            doc.verificationStatus === 'verified' 
                              ? 'text-green-700 dark:text-green-400'
                              : doc.verificationStatus === 'pending'
                              ? 'text-yellow-700 dark:text-yellow-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}>
                            {doc.verificationStatus === 'verified' ? 'Verificado' : 
                             doc.verificationStatus === 'pending' ? 'Pendiente' : 'Falló'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.extractedData?.anomalies && doc.extractedData.anomalies.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {doc.extractedData.anomalies.length} anomalía(s)
                          </span>
                        ) : (
                          <span className="text-gray-400">Sin anomalías</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.metadata.digitalSignature ? (
                          <Verified className="h-5 w-5 text-green-500" />
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 mr-4"
                        >
                          Revisar
                        </button>
                        <a
                          href={doc.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        >
                          Ver Original
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedDocument.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {selectedDocument.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Document metadata and actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Información del Documento</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Categoría:</span>
                      <span className="capitalize">{selectedDocument.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tamaño:</span>
                      <span>{formatFileSize(selectedDocument.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Última modificación:</span>
                      <span>{new Date(selectedDocument.lastModified).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado:</span>
                      <div className="flex items-center">
                        {getStatusIcon(selectedDocument.verificationStatus)}
                        <span className="ml-1 capitalize">{selectedDocument.verificationStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Datos Extraídos</h3>
                  {selectedDocument.extractedData && (
                    <div className="space-y-3">
                      {selectedDocument.extractedData.amounts.map((amount, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-300">{amount.description}</p>
                          <p className="font-semibold text-lg">
                            {new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: 'ARS'
                            }).format(amount.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-end space-x-3">
                  <a
                    href={selectedDocument.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Ver Original
                  </a>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveDocumentViewer;