import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Download,
  RefreshCw,
  Play,
  Loader
} from 'lucide-react';
import PowerBIDataService from '../../services/PowerBIDataService';

interface PowerBIDataset {
  name: string;
  id: string;
  table_count: number;
}

interface PowerBITable {
  name: string;
  column_count: number;
  row_count: number;
}

interface PowerBIRecord {
  source: string;
  data: Record<string, any>;
}

interface PowerBIReport {
  report_date: string;
  summary: {
    datasets_extracted: number;
    tables_extracted: number;
    records_extracted: number;
    records_saved: number;
  };
}

const PowerBIDataDashboard: React.FC = () => {
  const [datasets, setDatasets] = useState<PowerBIDataset[]>([]);
  const [tables, setTables] = useState<PowerBITable[]>([]);
  const [records, setRecords] = useState<PowerBIRecord[]>([]);
  const [report, setReport] = useState<PowerBIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Power BI data is available
      const isAvailable = await PowerBIDataService.isDataAvailable();
      
      if (!isAvailable) {
        setError('Los datos de Power BI aún no han sido extraídos. Por favor, ejecute el proceso de extracción primero.');
        return;
      }
      
      // Load all data concurrently
      const [datasetsData, tablesData, recordsData, reportData] = await Promise.all([
        PowerBIDataService.fetchDatasets(),
        PowerBIDataService.fetchTables(),
        PowerBIDataService.fetchRecords(100),
        PowerBIDataService.fetchReport()
      ]);
      
      setDatasets(datasetsData);
      setTables(tablesData);
      setRecords(recordsData);
      setReport(reportData);
    } catch (err) {
      setError('Error al cargar los datos de Power BI');
      console.error('Power BI data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  const triggerExtraction = async () => {
    try {
      setExtracting(true);
      setError(null);
      
      const result = await PowerBIDataService.triggerExtraction();
      
      if (result.success) {
        // Reload data after successful extraction
        loadData();
      } else {
        setError(result.message || 'Error al ejecutar la extracción de datos de Power BI');
      }
    } catch (err) {
      setError('Error al conectar con el servidor para la extracción de datos');
      console.error('Extraction error:', err);
    } finally {
      setExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de Power BI...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={triggerExtraction}
              disabled={extracting}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                extracting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              <Play className={`h-4 w-4 mr-2 ${extracting ? 'animate-spin' : ''}`} />
              {extracting ? 'Extrayendo...' : 'Ejecutar Extracción'}
            </button>
          </div>
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
              📊 Datos de Power BI
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Visualización y análisis de datos financieros del municipio
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={triggerExtraction}
              disabled={extracting}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                extracting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              <Play className={`h-4 w-4 mr-2 ${extracting ? 'animate-spin' : ''}`} />
              {extracting ? 'Extrayendo...' : 'Ejecutar Extracción'}
            </button>
            <button
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
        
        {report && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Última actualización: {new Date(report.report_date).toLocaleDateString('es-AR')}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Datasets</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {report.summary.datasets_extracted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Table className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tablas</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {report.summary.tables_extracted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registros</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {report.summary.records_extracted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Guardados</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {report.summary.records_saved}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
            { id: 'datasets', label: 'Datasets', icon: <Database className="h-4 w-4 mr-2" /> },
            { id: 'tables', label: 'Tablas', icon: <Table className="h-4 w-4 mr-2" /> },
            { id: 'records', label: 'Registros', icon: <FileText className="h-4 w-4 mr-2" /> }
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
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Vista General de Datos</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Datasets Disponibles</h3>
                <div className="space-y-3">
                  {datasets.slice(0, 5).map((dataset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{dataset.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {dataset.table_count} tablas
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        ID: {dataset.id.substring(0, 8)}...
                      </div>
                    </div>
                  ))}
                  {datasets.length > 5 && (
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                      + {datasets.length - 5} más
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Tablas Principales</h3>
                <div className="space-y-3">
                  {tables.slice(0, 5).map((table, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{table.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {table.column_count} columnas
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        {table.row_count} filas
                      </div>
                    </div>
                  ))}
                  {tables.length > 5 && (
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                      + {tables.length - 5} más
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Datasets de Power BI</h2>
            
            {datasets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tablas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {datasets.map((dataset, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {dataset.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {dataset.id.substring(0, 12)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            {dataset.table_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay datasets disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron datasets en los datos de Power BI.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Tablas de Power BI</h2>
            
            {tables.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Columnas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Filas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tables.map((table, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {table.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {table.column_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {table.row_count}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay tablas disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron tablas en los datos de Power BI.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Registros de Power BI</h2>
            
            {records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fuente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Datos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {records.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {record.source.substring(0, 50)}...
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md overflow-x-auto max-h-32">
                              {JSON.stringify(record.data, null, 2)}
                            </pre>
                          </div>
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
                  No hay registros disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron registros en los datos de Power BI.
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
                Estos datos se extraen directamente del reporte de Power BI del municipio de Carmen de Areco.
                La información se actualiza regularmente mediante nuestro proceso de extracción automatizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIDataDashboard;