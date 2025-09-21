import React from 'react';
import { AVAILABLE_YEARS, getYearConfig } from '../../utils/yearConfig';

interface PageYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[]; // Now optional, will use AVAILABLE_YEARS by default
  label?: string;
  showDataAvailability?: boolean; // Show data availability indicators
}

const PageYearSelector: React.FC<PageYearSelectorProps> = ({ 
  selectedYear, 
  onYearChange, 
  availableYears, 
  label = 'Año',
  showDataAvailability = true
}) => {
  // Use configured available years if not provided
  const yearsToShow = availableYears || AVAILABLE_YEARS.map(config => config.year);
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        title={showDataAvailability ? "Seleccionar año - algunos años pueden tener datos limitados" : undefined}
      >
        {yearsToShow.map((year) => {
          const config = getYearConfig(year);
          const displayLabel = showDataAvailability && config 
            ? config.label 
            : year.toString();
            
          return (
            <option key={year} value={year}>
              {displayLabel}
            </option>
          );
        })}
      </select>
      
      {showDataAvailability && (
        <div className="text-xs text-gray-500">
          {(() => {
            const config = getYearConfig(selectedYear);
            if (!config) return null;
            
            const indicators = [];
            if (config.hasDetailedBudget) indicators.push('💰');
            if (config.hasSalaryData) indicators.push('👥');
            if (config.hasDebtData) indicators.push('📊');
            if (config.hasDocuments) indicators.push('📄');
            
            return indicators.length > 0 ? (
              <span title="Datos disponibles: Presupuesto, Salarios, Deuda, Documentos">
                {indicators.join('')}
              </span>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default PageYearSelector;