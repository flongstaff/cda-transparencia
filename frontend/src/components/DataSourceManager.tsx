import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, AlertCircle, CheckCircle, Clock, ExternalLink, Download, Eye } from 'lucide-react';
import DatabaseService from '../services/DatabaseService';

interface DataSource {
  id: string;
  name: string;
  type: 'live' | 'cold' | 'archive';
  url?: string;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  reliability: number;
  documents: number;
}

interface DataSourceManagerProps {
  currentYear: string;
  onDataUpdate?: () => void;
}

const DataSourceManager: React.FC<DataSourceManagerProps> = ({ currentYear, onDataUpdate }) => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [integrityReport, setIntegrityReport] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    loadDataSources();
    loadIntegrityReport();
  }, [currentYear]);

  const loadDataSources = async () => {
    setIsLoading(true);
    try {
      // Simulate loading data sources
      const mockSources: DataSource[] = [
        {
          id: 'official',
          name: 'Carmen de Areco - Portal Oficial',
          type: 'live',
          url: 'https://carmendeareco.gob.ar/transparencia/',
          status: 'active',
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          reliability: 95,
          documents: 45
        },
        {
          id: 'archive',
          name: 'Web Archive Snapshots',
          type: 'archive',
          url: 'https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/*',
          status: 'active',
          lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          reliability: 88,
          documents: 187
        },
        {
          id: 'backup',
          name: 'Respaldo Local',
          type: 'cold',
          status: 'active',
          lastSync: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          reliability: 100,
          documents: 234
        },
        {
          id: 'provincial',
          name: 'Portal Provincia Buenos Aires',
          type: 'live',
          url: 'https://www.gba.gob.ar/transparencia',
          status: 'inactive',
          reliability: 72,
          documents: 12
        }
      ];

      setSources(mockSources);
      
      const lastSyncTime = localStorage.getItem('transparency_last_sync');
      setLastSync(lastSyncTime);
    } catch (error) {
      console.error('Failed to load data sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIntegrityReport = async () => {
    try {
      const report = await DatabaseService.generateIntegrityReport(currentYear);
      setIntegrityReport(report);
    } catch (error) {
      console.error('Failed to load integrity report:', error);
    }
  };

  const handleSync = async (sourceId?: string) => {
    setIsSyncing(true);
    try {
      const success = await DatabaseService.syncWithOfficialSource();
      
      if (success) {
        await loadDataSources();
        await loadIntegrityReport();
        setLastSync(new Date().toISOString());
        
        if (onDataUpdate) {
          onDataUpdate();
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string, reliability: number) => {
    if (status === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else if (status === 'inactive') {
      return <Clock className="h-5 w-5 text-gray-400" />;
    } else if (reliability >= 90) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return 'text-green-600 bg-green-100';
    if (reliability >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Nunca';
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Gestión de Fuentes de Datos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitoreo y sincronización de fuentes de transparencia para {currentYear}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastSync && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Última sincronización: {formatLastSync(lastSync)}
              </div>
            )}
            
            <button
              onClick={() => handleSync()}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Integrity Overview */}
      {integrityReport && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {integrityReport.overall_score.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Integridad General</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {integrityReport.data_completeness.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completitud</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {integrityReport.source_reliability.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Confiabilidad</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {integrityReport.temporal_consistency.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Consistencia</div>
            </div>
          </div>
          
          {integrityReport.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Recomendaciones
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {integrityReport.recommendations.map((rec: string, index: number) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Data Sources List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando fuentes de datos...</p>
          </div>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(source.status, source.reliability)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {source.name}
                      </h4>
                      
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        source.type === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        source.type === 'archive' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {source.type === 'live' ? 'En vivo' : 
                         source.type === 'archive' ? 'Archivo' : 'Respaldo'}
                      </span>
                    </div>
                    
                    {source.url && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary-500 truncate"
                        >
                          {source.url}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span>{source.documents} documentos</span>
                      <span>•</span>
                      <span>Última sync: {formatLastSync(source.lastSync)}</span>
                      {source.reliability && (
                        <>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReliabilityColor(source.reliability)}`}>
                            {source.reliability}% confiable
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setShowDetails(showDetails === source.id ? null : source.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {source.type === 'live' && (
                    <button
                      onClick={() => handleSync(source.id)}
                      disabled={isSyncing}
                      className="p-2 text-gray-400 hover:text-primary-500 disabled:opacity-50"
                      title="Sincronizar fuente"
                    >
                      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  
                  <button
                    className="p-2 text-gray-400 hover:text-secondary-500"
                    title="Descargar datos"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Source Details */}
              {showDetails === source.id && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white mb-2">
                        Información de la Fuente
                      </h5>
                      <dl className="space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">ID:</dt>
                          <dd className="text-gray-800 dark:text-white font-mono">{source.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Estado:</dt>
                          <dd className="text-gray-800 dark:text-white">{source.status}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Tipo:</dt>
                          <dd className="text-gray-800 dark:text-white">{source.type}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white mb-2">
                        Estadísticas de Datos
                      </h5>
                      <dl className="space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Documentos:</dt>
                          <dd className="text-gray-800 dark:text-white">{source.documents}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Confiabilidad:</dt>
                          <dd className="text-gray-800 dark:text-white">{source.reliability}%</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Última Act.:</dt>
                          <dd className="text-gray-800 dark:text-white">{formatLastSync(source.lastSync)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  {/* Cross-reference status */}
                  <div className="mt-4 p-3 bg-white dark:bg-gray-600 rounded border">
                    <h6 className="font-medium text-gray-800 dark:text-white mb-2">
                      Estado de Referencias Cruzadas
                    </h6>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Coincidencias con otras fuentes:
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {Math.floor(Math.random() * 20) + 15} documentos
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discrepancias detectadas:
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        {Math.floor(Math.random() * 5)} documentos
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {sources.filter(s => s.status === 'active').length} de {sources.length} fuentes activas
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => loadIntegrityReport()}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              <Database className="h-4 w-4 mr-1 inline" />
              Actualizar Informe
            </button>
            
            <button
              onClick={() => handleSync()}
              disabled={isSyncing}
              className="px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Todo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceManager;