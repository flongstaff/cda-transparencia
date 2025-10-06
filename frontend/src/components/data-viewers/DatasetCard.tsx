import React from 'react';
import { FileText, Download, Eye, Calendar, Database, Shield, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  formats: string[];
  size: string;
  lastUpdated: string;
  url: string;
  accessibility: {
    compliant: boolean;
    standards: string[];
  };
  source: string;
  license: string;
  tags: string[];
  updateFrequency: string;
  downloads: number;
}

interface DatasetCardProps {
  dataset: Dataset;
  onClick?: () => void;
  showDownloadButton?: boolean;
  showDetailsLink?: boolean;
}

const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  onClick,
  showDownloadButton = true,
  showDetailsLink = true
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMM yyyy', { locale: es });
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'csv': return '📄';
      case 'json': return '🗄️';
      case 'xlsx': return '📊';
      case 'pdf': return '📄';
      case 'xml': return '📄';
      case 'txt': return '📄';
      case 'zip': return '📦';
      default: return '📄';
    }
  };

  const getFormatName = (format: string) => {
    switch (format.toLowerCase()) {
      case 'csv': return 'CSV';
      case 'json': return 'JSON';
      case 'xlsx': return 'Excel';
      case 'pdf': return 'PDF';
      case 'xml': return 'XML';
      case 'txt': return 'Texto';
      case 'zip': return 'ZIP';
      default: return format.toUpperCase();
    }
  };

  return (
    <div 
      className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start mb-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1 truncate">
              {dataset.title}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
              {dataset.category}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {dataset.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FileText className="h-4 w-4 mr-1" />
          <span>{dataset.formats.length} formatos</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Act: {formatDate(dataset.lastUpdated)}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Download className="h-4 w-4 mr-1" />
          <span>{dataset.downloads} descargas</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <span>{dataset.updateFrequency}</span>
        </div>
      </div>
      
      {/* Format tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {dataset.formats.map((format, idx) => (
          <span 
            key={idx} 
            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center"
          >
            <span className="mr-1">{getFormatIcon(format)}</span>
            {getFormatName(format)}
          </span>
        ))}
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {dataset.tags.slice(0, 3).map((tag, index) => (
          <span 
            key={index} 
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full"
          >
            {tag}
          </span>
        ))}
        {dataset.tags.length > 3 && (
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
            +{dataset.tags.length - 3} más
          </span>
        )}
      </div>
      
      {/* Accessibility status */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {dataset.accessibility.compliant ? (
              <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Accesible
              </div>
            ) : (
              <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                No accesible
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {showDetailsLink && (
              <button 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(dataset.url, '_blank');
                }}
                aria-label={`Ver detalles de ${dataset.title}`}
              >
                Detalles
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            )}
            {showDownloadButton && (
              <button 
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = dataset.url;
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Descargar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetCard;