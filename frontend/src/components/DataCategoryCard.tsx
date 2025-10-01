/**
 * DataCategoryCard Component
 * Displays individual data category with accessibility features
 */

import React from 'react';
import { Calendar, FileText, Download, Shield, BarChart3, Users, Building, DollarSign, Settings, HardHat, Heart, Megaphone, Gauge } from 'lucide-react';

interface DataCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  itemsCount: number;
  lastUpdated: string;
  updateFrequency: string;
  dataTypes: string[];
  datasets: DataItem[];
}

interface DataItem {
  id: string;
  title: string;
  description: string;
  formats: string[];
  size: string;
  lastUpdated: string;
  accessibility: {
    compliant: boolean;
    standards: string[];
  };
}

interface DataCategoryCardProps {
  category: DataCategory;
  icon: React.ReactNode;
  onCategoryClick: (categoryId: string) => void;
}

const DataCategoryCard: React.FC<DataCategoryCardProps> = ({ 
  category, 
  icon,
  onCategoryClick
}) => {
  // Format frequency for display
  const formatFrequency = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      'daily': 'Diaria',
      'weekly': 'Semanal',
      'monthly': 'Mensual',
      'quarterly': 'Trimestral',
      'annually': 'Anual',
      'as-needed': 'Según necesidad'
    };
    return frequencyMap[frequency] || frequency;
  };

  // Get icon for update frequency
  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return <BarChart3 className="w-4 h-4 mr-1" />;
      case 'weekly':
        return <BarChart3 className="w-4 h-4 mr-1" />;
      case 'monthly':
        return <Calendar className="w-4 h-4 mr-1" />;
      case 'quarterly':
        return <BarChart3 className="w-4 h-4 mr-1" />;
      case 'annually':
        return <Calendar className="w-4 h-4 mr-1" />;
      default:
        return <BarChart3 className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div 
      className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => onCategoryClick(category.id)}
      // ARIA role for clickable card
      role="button"
      tabIndex={0}
      aria-label={`Categoría: ${category.title}. ${category.itemsCount} datasets disponibles`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCategoryClick(category.id);
        }
      }}
    >
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {category.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FileText className="w-4 h-4 mr-1" />
            <span>{category.itemsCount} datasets</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            {getFrequencyIcon(category.updateFrequency)}
            <span>{formatFrequency(category.updateFrequency)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              Act: {new Date(category.lastUpdated).toLocaleDateString('es-AR')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {category.dataTypes.slice(0, 2).map((type, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full"
              >
                {type}
              </span>
            ))}
            {category.dataTypes.length > 2 && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
                +{category.dataTypes.length - 2}
              </span>
            )}
          </div>
        </div>

        {category.datasets && category.datasets.length > 0 && (
          <div className="border-t border-gray-100 dark:border-dark-border pt-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Datasets recientes:
            </h4>
            <ul className="space-y-2">
              {category.datasets.slice(0, 2).map((dataset, index) => (
                <li 
                  key={index} 
                  className="text-sm text-gray-700 dark:text-gray-300 flex justify-between items-start"
                >
                  <span className="truncate mr-2">{dataset.title}</span>
                  <div className="flex space-x-1">
                    {dataset.formats.slice(0, 2).map((format, fmtIndex) => (
                      <span 
                        key={fmtIndex} 
                        className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded"
                      >
                        {format.toUpperCase()}
                      </span>
                    ))}
                    {dataset.formats.length > 2 && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                        +{dataset.formats.length - 2}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {category.datasets.some(ds => ds.accessibility.compliant) ? (
              <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Accesible
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                No verificado
              </div>
            )}
          </div>
          <button 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              // In a real implementation, this would navigate to the category page
              console.log(`Viewing category: ${category.id}`);
            }}
            aria-label={`Ver detalles de la categoría ${category.title}`}
          >
            Ver datos
            <Download className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataCategoryCard;