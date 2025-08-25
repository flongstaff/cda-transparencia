import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, FileText, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PDFViewer from './PDFViewer';

interface Document {
  id: string;
  title: string;
  type: 'budget' | 'contract' | 'report' | 'resolution' | 'declaration';
  category: string;
  date: string;
  size: string;
  pages?: number;
  url: string;
  description?: string;
  metadata?: {
    amount?: number;
    status?: string;
    department?: string;
    year?: number;
  };
}

interface DocumentExplorerProps {
  documents: Document[];
  relatedData?: any;
  onDocumentSelect?: (document: Document) => void;
}

const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  documents,
  relatedData,
  onDocumentSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [pdfViewer, setPdfViewer] = useState({ isOpen: false, document: null as Document | null });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'split'>('split');

  // Filter documents based on search and filters
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [documents, searchTerm, selectedType, selectedCategory]);

  // Group documents by category
  const groupedDocuments = useMemo(() => {
    return filteredDocuments.reduce((groups, doc) => {
      const category = doc.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(doc);
      return groups;
    }, {} as Record<string, Document[]>);
  }, [filteredDocuments]);

  // Generate chart data based on selected document
  const chartData = useMemo(() => {
    if (!selectedDocument || !relatedData) return null;

    if (selectedDocument.type === 'budget') {
      return {
        type: 'budget',
        data: [
          { name: 'Salud', value: 450000000, color: '#dc3545' },
          { name: 'Educación', value: 330000000, color: '#28a745' },
          { name: 'Infraestructura', value: 270000000, color: '#0056b3' },
          { name: 'Seguridad', value: 225000000, color: '#ffc107' },
          { name: 'Administración', value: 180000000, color: '#20c997' },
          { name: 'Otros', value: 75000000, color: '#6f42c1' }
        ]
      };
    }

    if (selectedDocument.type === 'contract') {
      return {
        type: 'contract',
        data: [
          { month: 'Ene', awards: 3, amount: 45000000 },
          { month: 'Feb', awards: 2, amount: 28000000 },
          { month: 'Mar', awards: 4, amount: 67000000 },
          { month: 'Abr', awards: 5, amount: 89000000 },
          { month: 'May', awards: 3, amount: 52000000 },
          { month: 'Jun', awards: 6, amount: 125000000 }
        ]
      };
    }

    return null;
  }, [selectedDocument, relatedData]);

  const getTypeColor = (type: string) => {
    const colors = {
      budget: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      contract: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      report: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      resolution: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      declaration: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      budget: 'Presupuesto',
      contract: 'Contrato',
      report: 'Informe',
      resolution: 'Resolución',
      declaration: 'Declaración'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
    if (onDocumentSelect) {
      onDocumentSelect(doc);
    }
  };

  const handleViewPDF = (doc: Document) => {
    setPdfViewer({ isOpen: true, document: doc });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
              Explorador de Documentos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Busca, visualiza y analiza documentos con datos interactivos
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Vista:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'list' | 'grid' | 'split')}
              className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1"
            >
              <option value="list">Lista</option>
              <option value="grid">Cuadrícula</option>
              <option value="split">Dividida</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="budget">Presupuestos</option>
            <option value="contract">Contratos</option>
            <option value="report">Informes</option>
            <option value="resolution">Resoluciones</option>
            <option value="declaration">Declaraciones</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todas las categorías</option>
            {Array.from(new Set(documents.map(d => d.category))).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex ${viewMode === 'split' ? 'divide-x divide-gray-200 dark:divide-gray-700' : ''}`}>
        {/* Document List */}
        <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} ${viewMode === 'split' ? 'max-h-96 overflow-y-auto' : ''}`}>
          {Object.keys(groupedDocuments).length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No se encontraron documentos que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(groupedDocuments).map(([category, categoryDocs]) => (
                <div key={category}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-6 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      {expandedCategories.has(category) ? (
                        <ChevronDown size={16} className="mr-2 text-gray-500" />
                      ) : (
                        <ChevronRight size={16} className="mr-2 text-gray-500" />
                      )}
                      <span className="font-medium text-gray-800 dark:text-white">{category}</span>
                      <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        {categoryDocs.length}
                      </span>
                    </div>
                  </button>

                  {/* Category Documents */}
                  {expandedCategories.has(category) && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {categoryDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                            selectedDocument?.id === doc.id ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500' : ''
                          }`}
                          onClick={() => handleDocumentSelect(doc)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full mr-2 ${getTypeColor(doc.type)}`}>
                                  {getTypeLabel(doc.type)}
                                </span>
                                {doc.metadata?.status && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {doc.metadata.status}
                                  </span>
                                )}
                              </div>
                              
                              <h4 className="font-medium text-gray-800 dark:text-white mb-1 truncate">
                                {doc.title}
                              </h4>
                              
                              {doc.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                  {doc.description}
                                </p>
                              )}
                              
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                                <span className="flex items-center">
                                  <Calendar size={12} className="mr-1" />
                                  {new Date(doc.date).toLocaleDateString('es-AR')}
                                </span>
                                <span>{doc.size}</span>
                                {doc.pages && <span>{doc.pages} páginas</span>}
                                {doc.metadata?.department && <span>{doc.metadata.department}</span>}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewPDF(doc);
                                }}
                                className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                                title="Vista previa"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle download
                                }}
                                className="p-1.5 text-gray-400 hover:text-secondary-500 transition-colors"
                                title="Descargar"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart/Visualization Panel */}
        {viewMode === 'split' && (
          <div className="w-1/2 p-6">
            {selectedDocument ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                    Análisis: {selectedDocument.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualización de datos relacionados con el documento seleccionado
                  </p>
                </div>

                {chartData ? (
                  <div className="space-y-6">
                    {chartData.type === 'budget' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Distribución Presupuestaria
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={chartData.data}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {chartData.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(0)}M`, 'Monto']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {chartData.type === 'contract' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Adjudicaciones Mensuales
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={chartData.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(0)}M`, 'Monto']} />
                            <Bar dataKey="amount" fill="#0056b3" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Document Metadata */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Información del Documento
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                          <span className="text-gray-800 dark:text-white">{getTypeLabel(selectedDocument.type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                          <span className="text-gray-800 dark:text-white">{selectedDocument.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                          <span className="text-gray-800 dark:text-white">{new Date(selectedDocument.date).toLocaleDateString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tamaño:</span>
                          <span className="text-gray-800 dark:text-white">{selectedDocument.size}</span>
                        </div>
                        {selectedDocument.metadata?.amount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                            <span className="text-gray-800 dark:text-white">
                              ${selectedDocument.metadata.amount.toLocaleString('es-AR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No hay datos de visualización disponibles para este documento.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Selecciona un documento para ver su análisis</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewer.isOpen && pdfViewer.document && (
        <PDFViewer
          isOpen={pdfViewer.isOpen}
          onClose={() => setPdfViewer({ isOpen: false, document: null })}
          documentTitle={pdfViewer.document.title}
          documentUrl={pdfViewer.document.url}
        />
      )}
    </div>
  );
};

export default DocumentExplorer;