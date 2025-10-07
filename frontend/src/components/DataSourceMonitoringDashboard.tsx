import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Globe, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Minus,
  RefreshCw
} from 'lucide-react';

// Define types for our data sources
interface DataSource {
  id: string;
  name: string;
  url: string;
  type: 'api' | 'scraping' | 'rss';
  format: 'json' | 'xml' | 'html' | 'csv';
  enabled: boolean;
  priority: number;
  cacheMinutes: number;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  responseTime?: number;
  lastChecked?: string;
  error?: string;
  dataPoints?: number;
  lastModified?: string;
}

const DataSourceMonitoringDashboard: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Load data source statuses on component mount
  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data sources for demonstration
      // In a real implementation, this would call the externalAPIsService to check actual sources
      const mockSources: DataSource[] = [
        {
          id: 'carmen-official',
          name: 'Carmen de Areco Official Portal',
          url: 'https://carmendeareco.gob.ar',
          type: 'scraping',
          format: 'html',
          enabled: true,
          priority: 1,
          cacheMinutes: 60,
          status: 'operational',
          responseTime: 120,
          lastChecked: new Date().toISOString(),
          dataPoints: 45
        },
        {
          id: 'carmen-transparency',
          name: 'Carmen de Areco Transparency Portal',
          url: 'https://carmendeareco.gob.ar/transparencia',
          type: 'scraping',
          format: 'html',
          enabled: true,
          priority: 1,
          cacheMinutes: 30,
          status: 'operational',
          responseTime: 150,
          lastChecked: new Date().toISOString(),
          dataPoints: 24
        },
        {
          id: 'rafam',
          name: 'RAFAM - Buenos Aires Economic Data',
          url: 'https://www.rafam.ec.gba.gov.ar/',
          type: 'scraping',
          format: 'html',
          enabled: true,
          priority: 1,
          cacheMinutes: 180,
          status: 'operational',
          responseTime: 230,
          lastChecked: new Date().toISOString(),
          dataPoints: 8
        },
        {
          id: 'datos-argentina',
          name: 'Datos Argentina',
          url: 'https://datos.gob.ar/api/3/',
          type: 'api',
          format: 'json',
          enabled: true,
          priority: 1,
          cacheMinutes: 60,
          status: 'degraded',
          responseTime: 850,
          lastChecked: new Date().toISOString(),
          error: 'Slow response time'
        },
        {
          id: 'presupuesto-abierto',
          name: 'Presupuesto Abierto Nacional',
          url: 'https://www.presupuestoabierto.gob.ar/sici/api',
          type: 'api',
          format: 'json',
          enabled: true,
          priority: 2,
          cacheMinutes: 120,
          status: 'operational',
          responseTime: 320,
          lastChecked: new Date().toISOString(),
          dataPoints: 12
        },
        {
          id: 'georef',
          name: 'API Georef Argentina',
          url: 'https://apis.datos.gob.ar/georef/api',
          type: 'api',
          format: 'json',
          enabled: true,
          priority: 1,
          cacheMinutes: 1440,
          status: 'operational',
          responseTime: 95,
          lastChecked: new Date().toISOString(),
          dataPoints: 1
        }
      ];

      setDataSources(mockSources);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error loading data sources:', err);
      setError('Error al cargar el estado de las fuentes de datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDataSources();
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'api':
        return <Server className="h-4 w-4" />;
      case 'scraping':
        return <Globe className="h-4 w-4" />;
      case 'rss':
        return <FileText className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Group sources by status
  const operationalSources = dataSources.filter(source => source.status === 'operational');
  const degradedSources = dataSources.filter(source => source.status === 'degraded');
  const downSources = dataSources.filter(source => source.status === 'down');
  const unknownSources = dataSources.filter(source => !source.status || source.status === 'unknown');

  if (loading && dataSources.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando monitoreo de fuentes de datos...</h2>
          <p className="text-gray-600">Verificando conectividad con todas las fuentes externas</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Database className="h-8 w-8 mr-3 text-blue-600" />
                Monitoreo de Fuentes de Datos
              </h1>
              <p className="text-gray-600 mt-1">
                Estado en tiempo real de todas las fuentes de datos externas integradas
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Última actualización: {lastRefreshed.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
          
          {/* System Status Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-100 text-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">Sistema Operativo</span>
              </div>
            </div>
            
            <div className="bg-blue-100 text-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">
                  {operationalSources.length} Fuentes Operativas
                </span>
              </div>
            </div>
            
            <div className="bg-yellow-100 text-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium">
                  {degradedSources.length} Fuentes Degradadas
                </span>
              </div>
            </div>
            
            <div className="bg-red-100 text-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium">
                  {downSources.length} Fuentes Fuera de Servicio
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Sources Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Server className="h-5 w-5 mr-2 text-blue-600" />
              Fuentes de Datos Integradas ({dataSources.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitoreo en tiempo real de todas las fuentes de datos externas
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuente de Datos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo de Respuesta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Verificación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataSources.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(source.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {source.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {source.url}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {source.type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {source.format.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {source.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(source.status)}`}>
                        {getStatusIcon(source.status)} {source.status === 'operational' ? 'Operativo' : 
                                                       source.status === 'degraded' ? 'Degradado' :
                                                       source.status === 'down' ? 'Fuera de servicio' : 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {source.responseTime ? `${source.responseTime}ms` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {source.lastChecked ? new Date(source.lastChecked).toLocaleTimeString() : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leyenda de Estados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">Operativo - Fuente disponible y funcionando correctamente</span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">Degradado - Fuente disponible pero con problemas menores</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-gray-700">Fuera de servicio - Fuente no disponible temporalmente</span>
            </div>
            <div className="flex items-center">
              <Minus className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Desconocido - Estado no verificado recientemente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceMonitoringDashboard;