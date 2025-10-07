import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Database,
  Globe,
  Building,
  FileText
} from 'lucide-react';

interface DataSourcesIndicatorProps {
  activeSources: string[];
  externalData?: {
    rafam?: any;
    gba?: any;
    afip?: any;
    contrataciones?: any;
    boletinNacional?: any;
    boletinProvincial?: any;
    carmenOfficial?: any;
  };
  loading?: boolean;
  className?: string;
}

const sourceConfig = {
  local: {
    label: 'Archivos Locales (CSV/JSON/PDF)',
    icon: Database,
    type: 'local'
  },
  rafam: {
    label: 'RAFAM Buenos Aires',
    icon: Building,
    type: 'provincial',
    url: 'https://rafam.gba.gob.ar'
  },
  gba: {
    label: 'Buenos Aires Datos Abiertos',
    icon: Globe,
    type: 'provincial',
    url: 'https://datos.gba.gob.ar'
  },
  afip: {
    label: 'AFIP Datos Fiscales',
    icon: FileText,
    type: 'national',
    url: 'https://www.afip.gob.ar'
  },
  contrataciones: {
    label: 'Contrataciones Abiertas',
    icon: FileText,
    type: 'national',
    url: 'https://contrataciones.gob.ar'
  },
  boletinNacional: {
    label: 'Boletín Oficial Nacional',
    icon: FileText,
    type: 'national',
    url: 'https://www.boletinoficial.gob.ar'
  },
  boletinProvincial: {
    label: 'Boletín Oficial Provincial',
    icon: FileText,
    type: 'provincial',
    url: 'https://www.gba.gob.ar/boletin_oficial'
  },
  carmenOfficial: {
    label: 'Carmen de Areco Oficial',
    icon: Building,
    type: 'municipal',
    url: 'https://carmendeareco.gob.ar/transparencia'
  }
};

/**
 * DataSourcesIndicator - Displays active data sources with status indicators
 * Used across all pages to show which data sources are currently providing information
 */
export const DataSourcesIndicator: React.FC<DataSourcesIndicatorProps> = ({
  activeSources,
  externalData,
  loading = false,
  className = ''
}) => {
  const getSourceStatus = (sourceKey: string) => {
    if (sourceKey === 'local') return activeSources.includes('local');
    if (!externalData) return false;
    return !!(externalData as any)[sourceKey];
  };

  const activeCount = activeSources.length;
  const totalPossibleSources = Object.keys(sourceConfig).length;

  // Compact view - only show active sources
  const activeSourcesList = Object.entries(sourceConfig)
    .filter(([key]) => getSourceStatus(key))
    .slice(0, 6); // Limit to 6 for compact display

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-border shadow-sm ${className}`}
    >
      {/* Compact header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Fuentes
          </span>
          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-semibold rounded">
            {activeCount}/{totalPossibleSources}
          </span>
        </div>

        {/* Compact active sources list */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeSourcesList.map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div
                key={key}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded text-[10px] font-medium text-green-700 dark:text-green-300"
                title={config.label}
              >
                <CheckCircle className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">{config.label.split(' ')[0]}</span>
              </div>
            );
          })}
          {activeCount > 6 && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              +{activeCount - 6} más
            </span>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2 ml-auto">
          {loading && (
            <RefreshCw className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
          )}
          {activeCount > 1 && (
            <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">En vivo</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DataSourcesIndicator;
