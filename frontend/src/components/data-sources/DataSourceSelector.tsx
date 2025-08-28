import React from 'react';
import { RefreshCw, Database, Globe, Download, Archive, CheckCircle } from 'lucide-react';

interface DataSourceSelectorProps {
  onDataRefresh: () => void;
  className?: string;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ 
  onDataRefresh,
  className = '' 
}) => {
  // Always use all available sources
  const allSources = [
    { id: 'database_local', name: 'Base de Datos Local', icon: <Database className="h-4 w-4" />, status: 'active' },
    { id: 'official_site', name: 'Sitio Oficial Municipal', icon: <Globe className="h-4 w-4" />, status: 'active' },
    { id: 'archive', name: 'Archivo Web', icon: <Archive className="h-4 w-4" />, status: 'active' },
    { id: 'scraped', name: 'Datos Procesados', icon: <Download className="h-4 w-4" />, status: 'active' }
  ];

  // Filter to only show active sources
  const activeSources = allSources.filter(source => source.status === 'active');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fuentes de datos:
            </span>
            
            <div className="flex flex-wrap gap-2">
              {activeSources.map((source) => (
                <div
                  key={source.id}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                >
                  <span className="mr-1.5">{source.icon}</span>
                  {source.name}
                  <CheckCircle className="ml-1.5 h-3 w-3 text-green-500" />
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={onDataRefresh}
            className="inline-flex items-center px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Actualizar
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </div>
      </div>
    </div>
  );
};

export default DataSourceSelector;