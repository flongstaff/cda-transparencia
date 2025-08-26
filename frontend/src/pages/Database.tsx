import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, Download, ExternalLink, ChevronDown, ChevronUp, Inbox, Archive, Globe, Database as DatabaseIcon } from 'lucide-react';
import DataSourcesIntegration from '../components/DataSourcesIntegration';
import DataIntegrityDashboard from '../components/DataIntegrityDashboard';
import DocumentViewer from '../components/DocumentViewer';
import ApiService from '../services/ApiService';

const Database: React.FC = () => {
  const [activeView, setActiveView] = useState<'database' | 'integrity' | 'sources'>('database');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [realRecords, setRealRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Available years for filtering
  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  // Category filters
  const categoryFilters = [
    { id: 'all', name: 'Todas las categorías' },
    { id: 'licitation', name: 'Licitaciones' },
    { id: 'declaration', name: 'Declaraciones' },
    { id: 'presupuesto', name: 'Presupuesto' },
    { id: 'finanzas', name: 'Finanzas' },
    { id: 'resolution', name: 'Resoluciones' },
    { id: 'tributario', name: 'Tributario' }
  ];

  // Status filters
  const statusFilters = [
    { id: 'all', name: 'Todos los estados' },
    { id: 'active', name: 'Activo' },
    { id: 'in-process', name: 'En proceso' },
    { id: 'finished', name: 'Finalizado' },
    { id: 'published', name: 'Publicado' },
    { id: 'in-investigation', name: 'En investigación' }
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all data types from API
        const [
          declarations,
          tenders,
          revenues,
          expenses,
          debts,
          investments
        ] = await Promise.all([
          ApiService.getPropertyDeclarations(),
          ApiService.getPublicTenders(),
          ApiService.getFeesRights(),
          ApiService.getOperationalExpenses(),
          ApiService.getMunicipalDebt(),
          ApiService.getInvestmentsAssets()
        ]);

        // Transform API data to unified format
        const apiRecords = [
          // Property Declarations
          ...declarations.map((declaration: any) => ({
            id: `DDJJ-${declaration.year}-${declaration.id}`,
            title: `Declaración Jurada Patrimonial - ${declaration.official_name}`,
            type: 'Declaración',
            status: declaration.status === 'published' ? 'Publicado' : 'Pendiente',
            date: declaration.declaration_date,
            amount: 'N/A',
            department: 'Recursos Humanos',
            documents: [{ name: `DDJJ-${declaration.year}.pdf`, type: 'pdf' }],
            category: 'declaration',
            source: 'https://carmendeareco.gob.ar/transparencia/'
          })),
          
          // Public Tenders
          ...tenders.map((tender: any) => ({
            id: `LIC-${tender.year}-${tender.id}`,
            title: tender.title,
            type: 'Licitación',
            status: tender.status === 'active' ? 'Activo' : 'Finalizado',
            date: tender.award_date,
            amount: tender.budget ? `${parseFloat(tender.budget).toLocaleString()}` : 'A determinar',
            department: 'Obras Públicas',
            documents: [{ name: tender.document, type: 'pdf' }],
            category: 'licitation',
            source: 'https://carmendeareco.gob.ar/transparencia/'
          })),
          
          // Revenue data
          ...revenues.map((revenue: any) => ({
            id: `REV-${revenue.year}-${revenue.id}`,
            title: `Ingresos ${revenue.category} - ${revenue.year}`,
            type: 'Ingresos',
            status: 'Publicado',
            date: `${revenue.year}-12-31`,
            amount: `${parseFloat(revenue.revenue).toLocaleString()}`,
            department: 'Hacienda',
            documents: [{ name: `revenue-${revenue.year}.pdf`, type: 'pdf' }],
            category: 'finanzas',
            source: 'https://carmendeareco.gob.ar/transparencia/'
          })),
          
          // Expenses data
          ...expenses.map((expense: any) => ({
            id: `EXP-${expense.year}-${expense.id}`,
            title: `Gastos ${expense.category} - ${expense.year}`,
            type: 'Gastos',
            status: 'Publicado',
            date: `${expense.year}-12-31`,
            amount: `${parseFloat(expense.amount).toLocaleString()}`,
            department: 'Hacienda',
            documents: [{ name: `expenses-${expense.year}.pdf`, type: 'pdf' }],
            category: 'finanzas',
            source: 'https://carmendeareco.gob.ar/transparencia/'
          })),
          
          // Debt data
          ...debts.map((debt: any) => ({
            id: `DEBT-${debt.year}-${debt.id}`,
            title: `Deuda ${debt.debt_type} - ${debt.year}`,
            type: 'Deuda',
            status: debt.status === 'active' ? 'Activo' : 'Finalizado',
            date: debt.due_date,
            amount: `${parseFloat(debt.amount).toLocaleString()}`,
            department: 'Hacienda',
            documents: [{ name: `debt-${debt.year}.pdf`, type: 'pdf' }],
            category: 'finanzas',
            source: 'https://carmendeareco.gob.ar/transparencia/'
          })),
          
          // Investments data
          ...investments.map((investment: any) => ({
            id: `INV-${investment.year}-${investment.id}`,
            title: `${investment.asset_type} - ${investment.description}`,
            type: 'Inversión',
            status: 'Publicado',
            date: `${investment.year}-12-31`,
            amount: `${parseFloat(investment.value).toLocaleString()}`,
            department: 'Obras Públicas',
            documents: [{ name: `investment-${investment.year}.pdf`, type: 'pdf' }],
            category: 'presupuesto',
            source: 'https://carmendeareco.gob.ar/transparencia/'
          }))
        ];
        
        setRealRecords(apiRecords);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data from server');
        // Fallback to mock data if API fails
        setRealRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleRecordExpansion = (id: string) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  // Filter records based on search query and filters
  const filteredRecords = realRecords.filter(record => {
    const matchesSearch = 
      searchQuery === '' || 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === 'all' || 
      record.category === activeCategory;
    
    const matchesStatus = 
      activeStatus === 'all' || 
      record.status === activeStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Activo':
        return 'bg-success-100 text-success-700';
      case 'En proceso':
        return 'bg-primary-100 text-primary-700';
      case 'Finalizado':
        return 'bg-gray-100 text-gray-700';
      case 'Publicado':
        return 'bg-secondary-100 text-secondary-700';
      case 'En investigación':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch(type) {
      case 'pdf':
        return <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
      case 'xlsx':
        return <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando base de datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar base de datos</h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
            Base de Datos Pública
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Acceda a expedientes, licitaciones, auditorías y documentación legal del municipio
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'database', name: 'Documentos', icon: DatabaseIcon },
                { id: 'integrity', name: 'Integridad de Datos', icon: FileText },
                { id: 'sources', name: 'Fuentes de Datos', icon: Globe }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as any)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                      activeView === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {activeView === 'database' && (
          <>
            {/* Search Interface for Real Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <div className="md:flex md:items-center md:justify-between gap-4">
                <div className="relative md:w-1/2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar documentos oficiales, licitaciones, presupuestos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="pdf">PDFs</option>
                    <option value="xlsx">Hojas de Cálculo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Real Document Viewer with Official Sources */}
            <DocumentViewer 
              searchQuery={searchQuery}
              documentType={activeCategory}
            />
          </>
        )}

        {activeView === 'database-old' && (
          <>
            {/* Search and filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="relative md:w-1/2">
                  <input
                    type="text"
                    placeholder="Buscar por título, número de expediente, licitación..."
                    className="w-full py-3 pl-10 pr-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={20} className="text-gray-400" />
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center md:w-1/2 md:justify-end space-x-4">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                    >
                      {categoryFilters.map(filter => (
                        <option key={filter.id} value={filter.id}>{filter.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={activeStatus}
                      onChange={(e) => setActiveStatus(e.target.value)}
                    >
                      {statusFilters.map(filter => (
                        <option key={filter.id} value={filter.id}>{filter.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150">
                    <Filter size={18} className="mr-2" />
                    Más Filtros
                  </button>
                </div>
              </div>
              
              <div className="mt-4 md:flex md:items-center md:space-x-4">
                <div className="md:w-1/4 mb-4 md:mb-0">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  />
                </div>
                
                <div className="md:w-1/4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                    Resultados ({filteredRecords.length})
                  </h2>
                  <button className="inline-flex items-center py-2 px-4 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150">
                    <Download size={18} className="mr-2" />
                    Exportar
                  </button>
                </div>
              </div>
              
              {filteredRecords.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record) => (
                    <li key={record.id} className="transition duration-150">
                      <div 
                        className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 ${expandedRecord === record.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                      >
                        <div className="md:flex md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {record.id}
                              </span>
                              <span className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                            
                            <h3 className="font-medium text-gray-800 dark:text-white mb-1">
                              {record.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-1">
                              <span>{record.type}</span>
                              <span>•</span>
                              <span>{new Date(record.date).toLocaleDateString('es-AR')}</span>
                              <span>•</span>
                              <span>{record.department}</span>
                              {record.amount !== 'N/A' && (
                                <>
                                  <span>•</span>
                                  <span>{record.amount}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex items-center">
                            <button 
                              className="inline-flex items-center py-2 px-3 text-primary-500 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition duration-150"
                              onClick={() => toggleRecordExpansion(record.id)}
                              aria-expanded={expandedRecord === record.id}
                            >
                              {expandedRecord === record.id ? (
                                <>
                                  <ChevronUp size={18} className="mr-1" />
                                  Contraer
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={18} className="mr-1" />
                                  Expandir
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {expandedRecord === record.id && (
                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Documentos ({record.documents.length})
                            </h4>
                            
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {record.documents.map((doc: any, index: number) => (
                                <li key={index}>
                                  <a 
                                    href="#" 
                                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150"
                                  >
                                    {getDocumentIcon(doc.type)}
                                    <span className="ml-3 text-gray-700 dark:text-gray-300">{doc.name}</span>
                                    <Download size={16} className="ml-auto text-gray-400 hover:text-primary-500" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                            
                            <div className="mt-4 flex justify-end">
                              <a 
                                href={record.source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 font-medium"
                              >
                                Ver expediente completo
                                <ExternalLink size={14} className="ml-1" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                    <Inbox size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Pruebe con diferentes términos de búsqueda o ajuste los filtros para encontrar lo que está buscando.
                  </p>
                </div>
              )}
              
              {filteredRecords.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando <span className="font-medium">{filteredRecords.length}</span> de <span className="font-medium">{realRecords.length}</span> resultados
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button className="px-3 py-2 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium">
                      1
                    </button>
                    
                    <button className="px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                      2
                    </button>
                    
                    <button className="p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeView === 'integrity' && (
          <DataIntegrityDashboard />
        )}

        {activeView === 'sources' && (
          <DataSourcesIntegration />
        )}
      </motion.section>

      {/* Statistics Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h2 className="font-heading text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Estadísticas de la Base de Datos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg mb-3">
              <DatabaseIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {realRecords.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Documentos Totales</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg mb-3">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              5
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Fuentes Activas</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mb-3">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              89
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Archivos Web</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg mb-3">
              <ExternalLink className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              95%
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Integridad de Datos</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">
            Referencias Externas
          </h4>
          <div className="space-y-2">
            <a 
              href="https://carmendeareco.gob.ar/transparencia/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Sitio Oficial de Transparencia
            </a>
            <a 
              href="https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archivo Web (Wayback Machine)
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Database;