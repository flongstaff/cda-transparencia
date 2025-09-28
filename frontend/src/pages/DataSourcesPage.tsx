import React, { useState } from 'react';
import { 
  Database, 
  Globe, 
  FileText, 
  ExternalLink, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Mock data for demonstration
const mockDataSources = {
  local: [
    {
      id: 1,
      name: 'Ejecución Presupuestaria',
      type: 'PDF',
      category: 'Finanzas',
      updateFrequency: 'Trimestral',
      lastUpdated: '2025-06-30',
      path: '/data/local/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf',
      description: 'Documentos oficiales de ejecución presupuestaria por categoría económica',
      verificationStatus: 'verified'
    },
    {
      id: 2,
      name: 'Declaraciones Patrimoniales',
      type: 'JSON',
      category: 'Recursos Humanos',
      updateFrequency: 'Anual',
      lastUpdated: '2025-01-15',
      path: '/data/organized_documents/json/declaraciones_patrimoniales.json',
      description: 'Declaraciones patrimoniales de funcionarios municipales',
      verificationStatus: 'verified'
    },
    {
      id: 3,
      name: 'Contratos Municipales',
      type: 'CSV',
      category: 'Contrataciones',
      updateFrequency: 'Mensual',
      lastUpdated: '2025-09-01',
      path: '/data/organized_documents/contratos_municipales.csv',
      description: 'Registro de todos los contratos municipales con detalles de proveedores',
      verificationStatus: 'pending'
    }
  ],
  external: [
    {
      id: 101,
      name: 'Datos Abiertos Provincia Buenos Aires',
      type: 'API',
      category: 'Gobierno Provincial',
      updateFrequency: 'Diaria',
      lastUpdated: '2025-09-25',
      path: 'https://datos.gob.ar/organization/provincia-de-buenos-aires',
      description: 'Datos oficiales de la Provincia de Buenos Aires',
      verificationStatus: 'verified',
      origin: 'datos.gob.ar'
    },
    {
      id: 102,
      name: 'Presupuesto Abierto Nacional',
      type: 'API',
      category: 'Gobierno Nacional',
      updateFrequency: 'Mensual',
      lastUpdated: '2025-09-20',
      path: 'https://www.presupuestoabierto.gob.ar',
      description: 'Portal nacional de transparencia presupuestaria',
      verificationStatus: 'verified',
      origin: 'presupuestoabierto.gob.ar'
    },
    {
      id: 103,
      name: 'Contrataciones Argentina',
      type: 'API',
      category: 'Contrataciones',
      updateFrequency: 'Diaria',
      lastUpdated: '2025-09-25',
      path: 'https://contrataciones.gov.ar',
      description: 'Sistema nacional de contrataciones públicas',
      verificationStatus: 'verified',
      origin: 'contrataciones.gov.ar'
    }
  ]
};

const DataSourcesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [expandedSource, setExpandedSource] = useState<number | null>(null);

  // Combine all data sources
  const allDataSources = [...mockDataSources.local, ...mockDataSources.external];
  
  // Filter data sources
  let filteredSources = allDataSources;
  
  if (searchTerm) {
    filteredSources = filteredSources.filter(source => 
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (filterCategory !== 'all') {
    filteredSources = filteredSources.filter(source => source.category === filterCategory);
  }
  
  if (filterType !== 'all') {
    filteredSources = filteredSources.filter(source => source.type === filterType);
  }
  
  if (filterVerification !== 'all') {
    filteredSources = filteredSources.filter(source => source.verificationStatus === filterVerification);
  }
  
  // Get unique categories and types for filters
  const uniqueCategories = Array.from(new Set(allDataSources.map(source => source.category)));
  const uniqueTypes = Array.from(new Set(allDataSources.map(source => source.type)));
  const _verificationStatuses = ['all', 'verified', 'pending'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fuentes de Datos
        </h1>
        <p className="text-gray-600">
          Transparencia sobre el origen y verificación de todos los datos utilizados
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Fuentes</p>
              <p className="text-2xl font-bold">{allDataSources.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Verificadas</p>
              <p className="text-2xl font-bold">
                {allDataSources.filter(s => s.verificationStatus === 'verified').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Externas</p>
              <p className="text-2xl font-bold">{mockDataSources.external.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar fuentes de datos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verificación</label>
          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="verified">Verificada</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {filteredSources.map((source) => (
          <div key={source.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setExpandedSource(expandedSource === source.id ? null : source.id)}
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <div className="flex items-center">
                {source.id < 100 ? (
                  <Database className="h-5 w-5 text-blue-500 mr-3" />
                ) : (
                  <Globe className="h-5 w-5 text-green-500 mr-3" />
                )}
                <div className="text-left">
                  <h4 className="text-lg font-medium">{source.name}</h4>
                  <p className="text-sm text-gray-500">
                    {source.category} • {source.type} • {source.updateFrequency}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  source.verificationStatus === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {source.verificationStatus === 'verified' ? 'Verificada' : 'Pendiente'}
                </span>
                {expandedSource === source.id ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>
            
            {expandedSource === source.id && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2">Detalles</h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex">
                        <span className="w-32 text-gray-500">Categoría:</span>
                        <span>{source.category}</span>
                      </li>
                      <li className="flex">
                        <span className="w-32 text-gray-500">Tipo:</span>
                        <span>{source.type}</span>
                      </li>
                      <li className="flex">
                        <span className="w-32 text-gray-500">Frecuencia:</span>
                        <span>{source.updateFrequency}</span>
                      </li>
                      <li className="flex">
                        <span className="w-32 text-gray-500">Última actualización:</span>
                        <span>{new Date(source.lastUpdated).toLocaleDateString('es-AR')}</span>
                      </li>
                      <li className="flex">
                        <span className="w-32 text-gray-500">Origen:</span>
                        <span>{source.id >= 100 ? source.origin : 'Local'}</span>
                      </li>
                    </ul>
                    
                    <p className="mt-4 text-gray-600">{source.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Acciones</h5>
                    <div className="space-y-2">
                      <a 
                        href={source.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {source.id >= 100 ? 'Visitar Fuente' : 'Descargar Documento'}
                      </a>
                      
                      <button className="flex items-center text-gray-600 hover:text-gray-800">
                        <Download className="h-4 w-4 mr-2" />
                        Verificación Completa
                      </button>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="font-medium">Proceso de Verificación</span>
                        </div>
                        <p className="text-sm mt-1">
                          {source.id >= 100 
                            ? 'Fuente verificada contra datos oficiales del gobierno provincial/nacional'
                            : 'Documento verificado contra fuentes oficiales y validado por auditoría interna'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Source-specific details */}
                <div className="mt-6">
                  <h5 className="font-medium mb-2">Ejemplo de Datos</h5>
                  {source.category === 'Finanzas' && (
                    <div className="bg-gray-50 p-4 rounded border">
                      <p className="text-sm text-gray-600">
                        Ejemplo de estructura de datos financieros:
                      </p>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify({
                          id: 'ejemplo',
                          year: 2023,
                          category: 'Personal',
                          budgeted: 1450000000,
                          executed: 1425000000,
                          execution_rate: 98.3,
                          source: source.name
                        }, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {source.category === 'Contrataciones' && (
                    <div className="bg-gray-50 p-4 rounded border">
                      <p className="text-sm text-gray-600">
                        Ejemplo de estructura de datos de contrataciones:
                      </p>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify({
                          id: 'ejemplo',
                          title: 'Contrato de Ejemplo',
                          vendor: 'Proveedor S.A.',
                          amount: 50000000,
                          date: '2023-03-15',
                          status: 'completed',
                          source: source.name
                        }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data Integrity Information */}
      <div className="mt-8 bg-white rounded-lg shadow border p-6">
        <h3 className="text-xl font-semibold mb-4">Integridad de los Datos</h3>
        
        <div className="prose max-w-none">
          <p>
            Esta sección proporciona transparencia sobre las fuentes de datos utilizadas en el portal de transparencia de Carmen de Areco.
          </p>
          
          <h4 className="font-medium mt-4">Fuentes Locales</h4>
          <p>
            Los datos locales provienen de documentos oficiales del municipio, incluyendo ejecución presupuestaria, contratos, declaraciones patrimoniales y otros registros oficiales.
          </p>
          
          <h4 className="font-medium mt-4">Fuentes Externas</h4>
          <p>
            Los datos externos provienen de fuentes oficiales del gobierno provincial y nacional, incluyendo el portal de datos abiertos de la Provincia de Buenos Aires y sistemas nacionales de transparencia.
          </p>
          
          <h4 className="font-medium mt-4">Proceso de Verificación</h4>
          <p>
            Todos los datos son verificados cruzando fuentes locales con datos oficiales externos para garantizar la precisión y transparencia. Cuando se detectan discrepancias, se indican claramente en la sección de Audits y Discrepancias.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesPage;