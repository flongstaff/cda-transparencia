import React, { useState } from 'react';
import { RefreshCw, Database, Globe, Download, Archive } from 'lucide-react';

interface DataSourceSelectorProps {
  selectedSources: string[];
  onSourceChange: (sources: string[]) => void;
  onDataRefresh: () => void;
  className?: string;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ 
  selectedSources, 
  onSourceChange,
  onDataRefresh,
  className = '' 
}) => {
  const toggleSource = (sourceId: string) => {
    const newSelectedSources = selectedSources.includes(sourceId)
      ? selectedSources.filter(id => id !== sourceId)
      : [...selectedSources, sourceId];
    
    // Ensure at least one source is selected
    if (newSelectedSources.length > 0) {
      onSourceChange(newSelectedSources);
    }
  };

  const sources = [
    { id: 'database_local', name: 'Base de Datos Local', icon: <Database className="h-4 w-4" />, status: 'active' },
    { id: 'official_site', name: 'Sitio Oficial Municipal', icon: <Globe className="h-4 w-4" />, status: 'active' },
    { id: 'powerbi_live', name: 'PowerBI en Vivo', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'afip_padron', name: 'AFIP - Padrón', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'provincia_ba', name: 'Provincia de Buenos Aires', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'contrataciones_nacional', name: 'Contrataciones Nacionales', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'presupuesto_abierto', name: 'Presupuesto Abierto', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'tribunal_cuentas', name: 'Tribunal de Cuentas', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'indec', name: 'INDEC Estadísticas', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'boletin_oficial', name: 'Boletín Oficial', icon: <Globe className="h-4 w-4" />, status: 'pronto' },
    { id: 'archive', name: 'Archivo Web', icon: <Archive className="h-4 w-4" />, status: 'active' },
    { id: 'scraped', name: 'Datos Procesados', icon: <Download className="h-4 w-4" />, status: 'active' }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fuentes de datos:
            </span>
            
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => source.status === 'active' ? toggleSource(source.id) : null}
                  disabled={source.status === 'pronto'}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors relative ${
                    source.status === 'pronto' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                      : selectedSources.includes(source.id)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1.5">{source.icon}</span>
                  {source.name}
                  {source.status === 'pronto' && (
                    <span className="ml-1.5 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded dark:bg-amber-800 dark:text-amber-200">
                      Pronto
                    </span>
                  )}
                  {source.status === 'active' && selectedSources.includes(source.id) && (
                    <span className="ml-1.5 w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </button>
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