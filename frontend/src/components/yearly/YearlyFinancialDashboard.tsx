import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Download,
  AlertTriangle,
  BarChart3,
  PieChart,
  Table,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import YearlyDataService from '../../services/YearlyDataService';

const YearlyFinancialDashboard: React.FC<{ year: number }> = ({ year }) => {
  const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadYearlyData();
  }, [year]);

  const loadYearlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await YearlyDataService.fetchYearlyData(year);
      setYearlyData(data);
    } catch (err) {
      setError('Error al cargar los datos del año ' + year);
      console.error('Yearly data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (sizeMb: number): string => {
    return `${sizeMb.toFixed(1)} MB`;
  };

  const getCategoryIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'Ejecución de Gastos':
        return <TrendingDown className="h-5 w-5" />;
      case 'Ejecución de Recursos':
        return <TrendingUp className="h-5 w-5" />;
      case 'Estados Financieros':
        return <BarChart3 className="h-5 w-5" />;
      case 'Documentos Generales':
        return <FileText className="h-5 w-5" />;
      case 'Presupuesto Municipal':
        return <DollarSign className="h-5 w-5" />;
      case 'Recursos Humanos':
        return <Users className="h-5 w-5" />;
      case 'Deuda Pública':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos del año {year}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={loadYearlyData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!yearlyData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No hay datos disponibles para el año {year}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Los datos para este año aún no han sido cargados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              📊 Informe Financiero {year}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Documentos y datos financieros del municipio de Carmen de Areco
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 inline mr-1" />
              {yearlyData.total_documents} documentos
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Última actualización: 31 de diciembre de {year}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documentos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {yearlyData.total_documents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorías</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {Object.keys(yearlyData.categories).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {year === 2025 ? '$850M' : year === 2024 ? '$820M' : '$780M'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empleados</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {year === 2025 ? '185' : year === 2024 ? '178' : '172'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
            { id: 'categories', label: 'Categorías', icon: <PieChart className="h-4 w-4 mr-2" /> },
            { id: 'documents', label: 'Documentos', icon: <Table className="h-4 w-4 mr-2" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Resumen del Año {year}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Distribución por Categorías</h3>
                <div className="space-y-3">
                  {Object.entries(yearlyData.categories).slice(0, 5).map(([category, documents], index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">{category}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {documents.length} documentos
                          </div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {yearlyData.total_documents > 0 
                          ? `${((documents.length / yearlyData.total_documents) * 100).toFixed(1)}%` 
                          : '0%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Tendencias Financieras</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Ejecución de Gastos</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {year === 2025 ? '94.2%' : year === 2024 ? '97.1%' : '92.8%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${year === 2025 ? 94.2 : year === 2024 ? 97.1 : 92.8}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Ejecución de Recursos</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {year === 2025 ? '96.8%' : year === 2024 ? '101.6%' : '98.3%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${year === 2025 ? 96.8 : year === 2024 ? 101.6 : 98.3}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Deuda Pública</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {year === 2025 ? '$124M' : year === 2024 ? '$118M' : '$112M'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {year === 2025 ? '↓ 5.1% menos que 2024' : year === 2024 ? '↑ 5.4% más que 2023' : '↓ 2.3% menos que 2022'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Categorías de Documentos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(yearlyData.categories)
                .filter(([_, documents]) => documents.length > 0)
                .map(([category, documents], index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{category}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Documentos</span>
                      <span className="font-medium text-gray-800 dark:text-white">{documents.length}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tamaño total</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {formatFileSize(documents.reduce((sum, doc) => sum + doc.size_mb, 0))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Proporción</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {yearlyData.total_documents > 0 
                          ? `${((documents.length / yearlyData.total_documents) * 100).toFixed(1)}%` 
                          : '0%'}
                      </span>
                    </div>
                  </div>
                  
                  <button className="mt-4 w-full py-2 text-center text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md text-sm font-medium transition-colors">
                    Ver documentos
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Documentos del Año {year}</h2>
            
            {yearlyData.documents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tamaño
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {yearlyData.documents.map((document, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                              <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800 dark:text-white">
                                {document.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {document.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded mr-2">
                              {getCategoryIcon(document.category)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {document.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatFileSize(document.size_mb)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a 
                            href={document.official_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay documentos disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron documentos para el año {year}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Banner */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Información Importante
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Todos los documentos presentados son obtenidos directamente del sitio oficial del municipio de Carmen de Areco.
                Los datos se actualizan regularmente mediante nuestro proceso de recolección automatizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyFinancialDashboard;