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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Fuentes de Datos Activas
          </h3>
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
            {activeCount} / {totalPossibleSources}
          </span>
        </div>
        {loading && (
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {Object.entries(sourceConfig).map(([key, config]) => {
          const isActive = getSourceStatus(key);
          const Icon = config.icon;

          return (
            <motion.div
              key={key}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex-shrink-0">
                {isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                )}
              </div>

              <Icon
                className={`w-3.5 h-3.5 flex-shrink-0 ${
                  isActive
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              />

              <span
                className={`text-xs font-medium flex-1 ${
                  isActive
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-500 dark:text-gray-500'
                }`}
              >
                {config.label}
              </span>

              {isActive && config.url && (
                <a
                  href={config.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                  title={`Visitar ${config.label}`}
                >
                  <ExternalLink className="w-3 h-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Status summary */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-green-600 dark:text-green-400">
                {activeSources.filter(s => s !== 'local').length}
              </span>{' '}
              fuentes externas activas
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Última actualización: {new Date().toLocaleTimeString('es-AR')}
            </span>
          </div>
          {activeCount > 1 && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-3 h-3" />
              Datos en vivo
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DataSourcesIndicator;
