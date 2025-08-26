import React, { useState, useEffect } from 'react';
import { Check, Globe, Archive, FileText, Database, AlertCircle, Info, Loader2 } from 'lucide-react';

export interface DataSource {
  id: string;
  name: string;
  description: string;
  type: 'official' | 'archive' | 'processed' | 'database';
  url?: string;
  status: 'active' | 'inactive' | 'error' | 'loading';
  lastUpdate?: string;
  recordCount?: number;
  icon: React.ReactNode;
}

interface DataSourceSelectorProps {
  selectedSources: string[];
  onSourceChange: (selectedSources: string[]) => void;
  onDataRefresh?: () => void;
  className?: string;
}

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
  const [isOpen, setIsOpen] = useState(false);

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
    { id: 'database_local', name: 'Datos Descargados', icon: <Database className="h-4 w-4" /> },
    { id: 'official_site', name: 'Sitio Oficial', icon: <Globe className="h-4 w-4" /> },
    { id: 'archive', name: 'Archivo', icon: <Archive className="h-4 w-4" /> },
    { id: 'scraped', name: 'Datos Web', icon: <Download className="h-4 w-4" /> }
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
                  onClick={() => toggleSource(source.id)}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedSources.includes(source.id)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1.5">{source.icon}</span>
                  {source.name}
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