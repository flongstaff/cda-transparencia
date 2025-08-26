import React, { useState, useEffect } from 'react';
import { Database, Globe, Download, Archive } from 'lucide-react';

interface DataSourceOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface DataSourceManagerProps {
  selectedSources: string[];
  onSourceChange: (sources: string[]) => void;
  onDataRefresh: () => void;
  className?: string;
}

const DataSourceManager: React.FC<DataSourceManagerProps> = ({ 
  selectedSources, 
  onSourceChange,
  onDataRefresh,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableSources, setAvailableSources] = useState<DataSourceOption[]>([
    {
      id: 'database_local',
      name: 'Datos Descargados',
      description: 'Datos almacenados localmente',
      icon: <Database className="h-5 w-5" />,
      enabled: true
    },
    {
      id: 'official_site',
      name: 'Sitio Oficial',
      description: 'Datos del portal oficial en tiempo real',
      icon: <Globe className="h-5 w-5" />,
      enabled: true
    },
    {
      id: 'archive',
      name: 'Archivo',
      description: 'Datos históricos archivados',
      icon: <Archive className="h-5 w-5" />,
      enabled: true
    },
    {
      id: 'scraped',
      name: 'Datos Web',
      description: 'Datos recolectados automáticamente',
      icon: <Download className="h-5 w-5" />,
      enabled: true
    }
  ]);

  const toggleSource = (sourceId: string) => {
    const newSelectedSources = selectedSources.includes(sourceId)
      ? selectedSources.filter(id => id !== sourceId)
      : [...selectedSources, sourceId];
    
    // Ensure at least one source is selected
    if (newSelectedSources.length > 0) {
      onSourceChange(newSelectedSources);
    }
  };

  const toggleAllSources = () => {
    if (selectedSources.length === availableSources.length) {
      // If all are selected, deselect all except the first one
      onSourceChange([availableSources[0].id]);
    } else {
      // If not all are selected, select all
      onSourceChange(availableSources.map(source => source.id));
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-gray-800 dark:text-white">
            Fuentes de Datos
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            {isExpanded ? 'Ocultar' : 'Ver opciones'}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {availableSources.map((source) => (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSources.includes(source.id)
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {source.icon}
              <span className="ml-2">{source.name}</span>
              {selectedSources.includes(source.id) && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {isExpanded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSources.length} de {availableSources.length} fuentes seleccionadas
              </span>
              <button
                onClick={toggleAllSources}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
              >
                {selectedSources.length === availableSources.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>

            <div className="space-y-2">
              {availableSources.map((source) => (
                <div 
                  key={source.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {source.icon}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {source.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {source.description}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={() => toggleSource(source.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </div>
          <button
            onClick={onDataRefresh}
            className="inline-flex items-center px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Actualizar Datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceManager;