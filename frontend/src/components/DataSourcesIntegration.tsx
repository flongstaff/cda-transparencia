import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Archive, 
  Database, 
  Globe, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  url: string;
  type: 'official' | 'archive' | 'local' | 'backup';
  status: 'active' | 'inactive' | 'error';
  documents: number;
  lastUpdated: string;
  reliability: 'high' | 'medium' | 'low';
  lastSync?: string;
  syncStatus?: 'syncing' | 'success' | 'failed';
}

const DataSourcesIntegration: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [syncingSource, setSyncingSource] = useState<string | null>(null);

  const dataSources: DataSource[] = [
    {
      id: 'official-site',
      name: 'Sitio Oficial - Carmen de Areco',
      url: 'https://carmendeareco.gob.ar/transparencia/',
      type: 'official',
      status: 'active',
      documents: 156,
      lastUpdated: '2025-01-22',
      reliability: 'high',
      lastSync: '2025-01-22T14:30:00Z',
      syncStatus: 'success'
    },
    {
      id: 'web-archive-nov',
      name: 'Archivo Web - Noviembre 2024',
      url: '/data/source_materials/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241111014916/',
      type: 'archive',
      status: 'active',
      documents: 89,
      lastUpdated: '2024-11-11',
      reliability: 'high',
      lastSync: '2025-01-20T09:15:00Z',
      syncStatus: 'success'
    },
    {
      id: 'web-archive-dec',
      name: 'Archivo Web - Diciembre 2024',
      url: '/data/source_materials/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241212115813/',
      type: 'archive',
      status: 'active',
      documents: 7,
      lastUpdated: '2024-12-12',
      reliability: 'high',
      lastSync: '2025-01-20T09:15:00Z',
      syncStatus: 'success'
    },
    {
      id: 'local-collection',
      name: 'Colección Local de Documentos',
      url: '/data/source_materials/',
      type: 'local',
      status: 'active',
      documents: 708,
      lastUpdated: '2025-01-22',
      reliability: 'high',
      lastSync: '2025-01-22T10:45:00Z',
      syncStatus: 'success'
    },
    {
      id: 'wayback-machine',
      name: 'Wayback Machine',
      url: 'https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/',
      type: 'backup',
      status: 'active',
      documents: 45,
      lastUpdated: '2024-12-12',
      reliability: 'medium',
      lastSync: '2025-01-15T16:20:00Z',
      syncStatus: 'success'
    }
  ];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'official': return <Globe className="w-5 h-5" />;
      case 'archive': return <Archive className="w-5 h-5" />;
      case 'local': return <Database className="w-5 h-5" />;
      case 'backup': return <Shield className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSyncStatusIcon = (status: string | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case 'syncing': 
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success': 
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': 
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: 
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const syncSource = async (sourceId: string) => {
    setSyncingSource(sourceId);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update source status
      const source = dataSources.find(s => s.id === sourceId);
      if (source) {
        source.syncStatus = 'success';
        source.lastSync = new Date().toISOString();
      }
    } catch (error) {
      console.error('Sync failed:', error);
      const source = dataSources.find(s => s.id === sourceId);
      if (source) {
        source.syncStatus = 'failed';
      }
    } finally {
      setSyncingSource(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Integración de Fuentes de Datos
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Sistema de múltiples fuentes para garantizar la disponibilidad y integridad de documentos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Fuentes Disponibles
          </h3>
          
          {dataSources.map((source) => (
            <motion.div
              key={source.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedSource === source.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => setSelectedSource(source.id)}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getSourceIcon(source.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {source.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {source.documents} documentos disponibles
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      {getStatusIcon(source.status)}
                      <span className="text-gray-500 dark:text-gray-400">
                        Actualizado: {new Date(source.lastUpdated).toLocaleDateString('es-AR')}
                      </span>
                      {source.lastSync && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            Sincronizado: {new Date(source.lastSync).toLocaleDateString('es-AR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReliabilityColor(source.reliability)}`}>
                    {source.reliability === 'high' ? 'Alta' : 
                     source.reliability === 'medium' ? 'Media' : 'Baja'} confiabilidad
                  </span>
                  {source.syncStatus && (
                    <div className="flex items-center">
                      {getSyncStatusIcon(source.syncStatus)}
                      {syncingSource === source.id && (
                        <span className="ml-1 text-xs text-blue-500">Sincronizando...</span>
                      )}
                    </div>
                  )}
                  {source.type === 'official' && (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Source Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Detalles de la Fuente
          </h3>
          
          {selectedSource ? (
            <div className="space-y-4">
              {(() => {
                const source = dataSources.find(s => s.id === selectedSource);
                if (!source) return null;
                
                return (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        {source.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tipo: {source.type === 'official' ? 'Sitio Oficial' :
                              source.type === 'archive' ? 'Archivo Web' :
                              source.type === 'local' ? 'Colección Local' : 'Respaldo'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        URL: <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {source.url}
                        </a>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Documentos
                        </span>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {source.documents}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Estado
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(source.status)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {source.status === 'active' ? 'Activo' : 
                             source.status === 'inactive' ? 'Inactivo' : 'Error'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex space-x-2">
                        {source.type === 'official' && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition duration-150"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Visitar Sitio</span>
                          </a>
                        )}
                        <button 
                          className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-150"
                          onClick={() => console.log('View documents for', source.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver Documentos</span>
                        </button>
                        <button 
                          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 disabled:opacity-50"
                          onClick={() => syncSource(source.id)}
                          disabled={syncingSource === source.id}
                        >
                          {syncingSource === source.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span>{syncingSource === source.id ? 'Sincronizando...' : 'Sincronizar'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Selecciona una fuente para ver los detalles
            </p>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Total de Documentos
          </h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            708
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            Fuentes Activas
          </h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            5
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Archivos Web
          </h4>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            89
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
            Integridad de Datos
          </h4>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            95%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesIntegration;