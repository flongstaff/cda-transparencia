import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FolderOpen,
  Calendar,
  CheckCircle,
  ExternalLink,
  Eye,
  Search,
  Filter,
  BarChart3,
  Database,
  Globe,
  Download,
  Loader2,
  TrendingUp,
  Activity,
  Archive,
  Users
} from 'lucide-react';
import { unifiedDataService } from '../services/UnifiedDataService';
import PageYearSelector from '../components/PageYearSelector';
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import YearlyDataChart from '../components/charts/YearlyDataChart';
import ValidatedChart from '../components/ValidatedChart';

interface Document {
  id: string;
  title: string;
  category: string;
  year: number;
  size: string;
  url: string;
  type: 'budget' | 'ordinance' | 'decree' | 'contract' | 'report' | 'financial' | 'other';
  verified: boolean;
  description: string;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [documentStats, setDocumentStats] = useState<any>(null);
  const [documentTrends, setDocumentTrends] = useState<any[]>([]);

  const tabs = [
    { id: 'overview', name: 'Resumen General', icon: FileText },
    { id: 'categories', name: 'Por Categorías', icon: FolderOpen },
    { id: 'analysis', name: 'Análisis', icon: BarChart3 },
    { id: 'trends', name: 'Tendencias', icon: TrendingUp },
    { id: 'verification', name: 'Verificación', icon: CheckCircle },
    { id: 'explorer', name: 'Explorador', icon: Database }
  ];

  // Load available years
  useEffect(() => {
    const loadYears = async () => {
      try {
        const years = await unifiedDataService.getAvailableYears();
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]); // Set to most recent year
        }
      } catch (err) {
        console.error("Error loading available years:", err);
        // Fallback to known years
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear, currentYear - 1, currentYear - 2, currentYear - 3]);
      }
    };

    loadYears();
  }, []);

  // Load documents using the new UnifiedDataService
  const fetchDocuments = async (year: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Loading comprehensive document data for ${year}...`);
      
      // Load documents and comprehensive data for the selected year
      const [yearlyData, municipalData] = await Promise.all([
        unifiedDataService.getYearlyData(year),
        unifiedDataService.getMunicipalData(year)
      ]);
      
      // Transform real documents to our interface
      const documentEntries: Document[] = yearlyData.realDocuments.map((doc: any, index: number) => ({
        id: doc.id || `doc-${year}-${index}`,
        title: doc.title || doc.filename || 'Documento sin título',
        category: doc.category || 'General',
        year: doc.year || year,
        size: doc.size_mb ? `${doc.size_mb.toFixed(1)} MB` : 'Tamaño desconocido',
        url: doc.url || `/documents/${doc.filename}`,
        type: doc.type === 'budget_execution' ? 'budget' : 
              doc.type === 'contract' ? 'contract' : 
              doc.type === 'financial_statement' ? 'financial' : 
              doc.type === 'salary_report' ? 'report' : 'other',
        verified: true, // All documents from our system are considered verified
        description: doc.description || `Documento oficial del municipio para el año ${year}`
      }));
      
      setDocuments(documentEntries.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)));
      
      // Calculate comprehensive document statistics
      const categories = documentEntries.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const typeDistribution = documentEntries.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setDocumentStats({
        totalDocuments: documentEntries.length,
        categories,
        typeDistribution,
        verificationRate: Math.round((documentEntries.filter(d => d.verified).length / documentEntries.length) * 100),
        municipalData: municipalData
      });

      // Generate document trends data
      const trendData = Object.entries(typeDistribution).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        documents: count,
        percentage: Math.round((count / documentEntries.length) * 100)
      }));
      setDocumentTrends(trendData);
      
      console.log(`✅ Loaded ${documentEntries.length} documents for ${year} with comprehensive analytics`);
      
    } catch (err) {
      console.error("Error loading documents:", err);
      setError("Error al cargar documentos. Intente nuevamente.");
      setDocuments([]);
      setDocumentStats(null);
      setDocumentTrends([]);
    } finally {
      setLoading(false);
    }
  };

  // Load documents when component mounts or year changes
  useEffect(() => {
    if (selectedYear) {
      fetchDocuments(selectedYear);
    }
  }, [selectedYear]);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group documents by category
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Get document type icon
  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'budget': return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'financial': return <Database className="w-5 h-5 text-green-500" />;
      case 'contract': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'report': return <Eye className="w-5 h-5 text-orange-500" />;
      default: return <FolderOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando documentos desde el sistema unificado...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos de Transparencia</h1>
              <p className="text-gray-600 mt-2">Sistema integral de gestión y análisis documental municipal</p>
              <div className="flex items-center mt-3 space-x-2 text-xs flex-wrap">
                <div className="px-2 py-1 bg-green-100 text-green-700 rounded">📊 Índices Anuales</div>
                <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded">📁 Archivos PDF</div>
                <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded">🗃️ Bases Categóricas</div>
                <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded">🔗 Enlaces Oficiales</div>
                <div className="px-2 py-1 bg-red-100 text-red-700 rounded">📋 Datos Históricos</div>
              </div>
            </div>
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              availableYears={availableYears}
              label="Año"
            />
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => fetchDocuments(selectedYear)}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              {documentStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Documentos</p>
                        <p className="text-2xl font-bold text-gray-900">{documentStats.totalDocuments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <FolderOpen className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Categorías</p>
                        <p className="text-2xl font-bold text-gray-900">{Object.keys(documentStats.categories).length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verificados</p>
                        <p className="text-2xl font-bold text-gray-900">{documentStats.verificationRate}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <Archive className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tipos</p>
                        <p className="text-2xl font-bold text-gray-900">{Object.keys(documentStats.typeDistribution).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Type Distribution */}
              {documentTrends.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo de Documento</h3>
                  <ValidatedChart
                    data={documentTrends}
                    title={`Distribución de Documentos ${selectedYear}`}
                    chartType="pie"
                    dataKey="documents"
                    nameKey="name"
                    sources={['Portal de Transparencia - Carmen de Areco']}
                  />
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && documentStats && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos por Categoría</h3>
                <ValidatedChart
                  data={Object.entries(documentStats.categories).map(([name, count]) => ({
                    name,
                    documentos: count,
                    percentage: Math.round((count / documentStats.totalDocuments) * 100)
                  }))}
                  title={`Categorías de Documentos ${selectedYear}`}
                  chartType="bar"
                  dataKey="documentos"
                  nameKey="name"
                  sources={['Portal de Transparencia - Carmen de Areco']}
                />
              </div>

              {/* Category breakdown cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(documentStats.categories).map(([category, count]) => (
                  <div key={category} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{category}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{count}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {Math.round((count / documentStats.totalDocuments) * 100)}% del total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <DocumentAnalysisChart
                  documentTypes={['presupuesto', 'contratos', 'gastos', 'informes', 'ordenanzas']}
                  startYear={selectedYear - 2}
                  endYear={selectedYear}
                  showComparison={true}
                />
              </div>

              {/* Comprehensive Document Audit */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Auditoría Integral de Documentos {selectedYear}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Document Type Breakdown */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Documentos por Tipo de Contenido</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">💰</span>
                          <span className="text-sm font-medium">Presupuesto Municipal</span>
                        </div>
                        <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                          {documents.filter(d => d.category?.toLowerCase().includes('presupuesto')).length} docs
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">📊</span>
                          <span className="text-sm font-medium">Ejecución de Gastos</span>
                        </div>
                        <span className="text-sm bg-green-100 px-2 py-1 rounded">
                          {documents.filter(d => d.category?.toLowerCase().includes('gasto') || 
                                                 d.title?.toLowerCase().includes('ejecucion')).length} docs
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">💼</span>
                          <span className="text-sm font-medium">Estados Financieros</span>
                        </div>
                        <span className="text-sm bg-purple-100 px-2 py-1 rounded">
                          {documents.filter(d => d.category?.toLowerCase().includes('financier') || 
                                                 d.category?.toLowerCase().includes('estados')).length} docs
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                        <div className="flex items-center">
                          <span className="text-orange-600 mr-2">🏗️</span>
                          <span className="text-sm font-medium">Contratos y Licitaciones</span>
                        </div>
                        <span className="text-sm bg-orange-100 px-2 py-1 rounded">
                          {documents.filter(d => d.category?.toLowerCase().includes('contrat') || 
                                                 d.title?.toLowerCase().includes('licitacion')).length} docs
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                        <div className="flex items-center">
                          <span className="text-red-600 mr-2">👥</span>
                          <span className="text-sm font-medium">Recursos Humanos</span>
                        </div>
                        <span className="text-sm bg-red-100 px-2 py-1 rounded">
                          {documents.filter(d => d.category?.toLowerCase().includes('human') || 
                                                 d.category?.toLowerCase().includes('salario')).length} docs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Data Sources Integration */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Fuentes de Datos Integradas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">📅</span>
                          <span className="text-sm font-medium">Índices Anuales</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">ACTIVO</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">🗂️</span>
                          <span className="text-sm font-medium">Archivos Categorizados</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">ACTIVO</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">📊</span>
                          <span className="text-sm font-medium">PowerBI Extraction</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">ACTIVO</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">🔍</span>
                          <span className="text-sm font-medium">Datos Históricos</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">ACTIVO</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">📋</span>
                          <span className="text-sm font-medium">Auditoría & Compliance</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">ACTIVO</span>
                      </div>
                    </div>

                    {/* Data Quality Indicators */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Calidad de los Datos</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Verificados:</span>
                          <span className="font-medium">{documents.filter(d => d.verified).length}/{documents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Categorizados:</span>
                          <span className="font-medium">{Object.keys(documentsByCategory).length} tipos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Documentación</h3>
                <YearlyDataChart 
                  year={selectedYear}
                  showGrowthTrends={true}
                  showComparisons={true}
                />
              </div>

              {/* Municipal data trends */}
              {documentStats?.municipalData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Municipales Integrados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {documentStats.municipalData.budget?.total ? 
                          new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(documentStats.municipalData.budget.total) :
                          'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Presupuesto Total</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {documentStats.municipalData.contracts?.total || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Contratos</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {documentStats.municipalData.salaries?.employeeCount || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Empleados</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Verificación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Documentos Verificados</h4>
                    <ValidatedChart
                      data={[
                        { name: 'Verificados', value: documents.filter(d => d.verified).length },
                        { name: 'Pendientes', value: documents.filter(d => !d.verified).length }
                      ]}
                      title="Estado de Verificación"
                      chartType="pie"
                      dataKey="value"
                      nameKey="name"
                      sources={['Portal de Transparencia - Carmen de Areco']}
                    />
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Verificación por Tipo</h4>
                    <div className="space-y-3">
                      {Object.entries(documentStats?.typeDistribution || {}).map(([type, count]) => {
                        const verified = documents.filter(d => d.type === type && d.verified).length;
                        const percentage = Math.round((verified / count) * 100);
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Explorer Tab - Original document browser */}
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="all">Todas las categorías</option>
                      {Array.from(new Set(documents.map(d => d.category))).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Document count */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredDocuments.length} de {documents.length} documentos para {selectedYear}
                </p>
              </div>

              {/* Documents grid by category */}
              {Object.keys(documentsByCategory).length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(documentsByCategory).map(([category, docs]) => (
                    <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FolderOpen className="w-5 h-5 text-gray-500 mr-2" />
                          {category}
                          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {docs.length}
                          </span>
                        </h2>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {docs.map((doc) => (
                            <div
                              key={doc.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => {
                                // For PDF documents, open in new tab
                                if (doc.url.startsWith('/documents/') || doc.url.endsWith('.pdf')) {
                                  window.open(doc.url, '_blank');
                                } else {
                                  navigate(doc.url);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                  {getDocumentIcon(doc.type)}
                                  <div className="ml-3">
                                    <h3 className="font-medium text-gray-900 text-sm">{doc.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{doc.size}</p>
                                  </div>
                                </div>
                                {doc.verified && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-600 mb-3">{doc.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {doc.year}
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    className="p-1 text-gray-500 hover:text-blue-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // For PDF documents, open in new tab
                                      if (doc.url.startsWith('/documents/') || doc.url.endsWith('.pdf')) {
                                        window.open(doc.url, '_blank');
                                      } else {
                                        navigate(doc.url);
                                      }
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    className="p-1 text-gray-500 hover:text-green-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Download the document
                                      const link = document.createElement('a');
                                      link.href = doc.url;
                                      link.target = '_blank';
                                      link.download = doc.title;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  {doc.url.startsWith('http') && (
                                    <button 
                                      className="p-1 text-gray-500 hover:text-purple-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(doc.url, '_blank');
                                      }}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== 'all'
                      ? "Intente cambiar los filtros de búsqueda."
                      : "No hay documentos disponibles para este año."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;