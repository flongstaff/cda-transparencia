/**
 * DataFormatSelector Component
 * Format selection controls with accessibility features
 */

import React from 'react';
import { Download } from 'lucide-react';

interface DataFormatSelectorProps {
  formats: string[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}

const DataFormatSelector: React.FC<DataFormatSelectorProps> = ({ 
  formats, 
  selectedFormat, 
  onFormatChange 
}) => {
  // Common formats with readable names
  const formatDisplayNames: Record<string, string> = {
    'csv': 'CSV',
    'json': 'JSON',
    'xlsx': 'Excel',
    'xls': 'Excel',
    'pdf': 'PDF',
    'txt': 'Texto',
    'xml': 'XML',
    'rss': 'RSS'
  };

  const getFormatDisplayName = (format: string) => {
    return formatDisplayNames[format.toLowerCase()] || format.toUpperCase();
  };

  // Get unique formats with counts for display options
  const formatOptions = ['all', ...formats];

  return (
    <select
      value={selectedFormat}
      onChange={(e) => onFormatChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
      aria-label="Filtrar por formato de archivo"
    >
      <option value="all">Todos los formatos</option>
      {formats.map((format) => (
        <option key={format} value={format}>
          {getFormatDisplayName(format)}
        </option>
      ))}
    </select>
  );
};

export default DataFormatSelector;