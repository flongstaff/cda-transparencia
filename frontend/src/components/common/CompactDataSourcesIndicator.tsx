/**
 * Compact Data Sources Indicator
 *
 * A space-efficient component for displaying active data sources
 * Shows a summary badge that expands to show details
 */

import React, { useState } from 'react';
import { Database, Check, X, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';

export interface DataSource {
  name: string;
  active: boolean;
  type: 'local' | 'external';
  category?: 'municipal' | 'provincial' | 'national' | 'civil_society';
  lastUpdate?: Date;
  url?: string;
}

interface CompactDataSourcesIndicatorProps {
  sources: DataSource[];
  liveDataEnabled?: boolean;
  lastUpdate?: string;
  compact?: boolean;
  className?: string;
}

const CompactDataSourcesIndicator: React.FC<CompactDataSourcesIndicatorProps> = ({
  sources,
  liveDataEnabled = false,
  lastUpdate,
  compact = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeSources = sources.filter(s => s.active);
  const localSources = activeSources.filter(s => s.type === 'local');
  const externalSources = activeSources.filter(s => s.type === 'external');

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'municipal':
        return 'text-blue-600 dark:text-blue-400';
      case 'provincial':
        return 'text-green-600 dark:text-green-400';
      case 'national':
        return 'text-purple-600 dark:text-purple-400';
      case 'civil_society':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'municipal':
        return 'Municipal';
      case 'provincial':
        return 'Provincial';
      case 'national':
        return 'Nacional';
      case 'civil_society':
        return 'Sociedad Civil';
      default:
        return 'General';
    }
  };

  if (!compact) {
    // Full display mode
    return (
      <div className={`bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
              Fuentes de Datos
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {activeSources.length} / {sources.length}
            </span>
            {liveDataEnabled && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                <RefreshCw className="w-3 h-3" />
                En vivo
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {sources.map((source, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-dark-background rounded-md"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {source.active ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                )}
                <span className={`text-sm truncate ${source.active ? 'text-gray-900 dark:text-dark-text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                  {source.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {source.category && (
                  <span className={`text-xs font-medium ${getCategoryColor(source.category)}`}>
                    {getCategoryBadge(source.category)}
                  </span>
                )}
                {source.url && source.active && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {lastUpdate && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última actualización: {lastUpdate}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Compact mode
  return (
    <div className={`bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-background transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
            Fuentes
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            {activeSources.length}/{sources.length}
          </span>
          {liveDataEnabled && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              <RefreshCw className="w-3 h-3" />
              Live
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-2">
          {/* Local sources */}
          {localSources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Locales ({localSources.length})
              </p>
              <div className="space-y-1">
                {localSources.map((source, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {source.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External sources */}
          {externalSources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Externas ({externalSources.length})
              </p>
              <div className="grid grid-cols-1 gap-1">
                {externalSources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs group">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        {source.name}
                      </span>
                    </div>
                    {source.category && (
                      <span className={`text-xs font-medium ${getCategoryColor(source.category)} flex-shrink-0`}>
                        {getCategoryBadge(source.category)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastUpdate && (
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Actualizado: {lastUpdate}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactDataSourcesIndicator;
