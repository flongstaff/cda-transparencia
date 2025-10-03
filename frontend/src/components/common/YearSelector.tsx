import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';

interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
  onChange: (year: number) => void;
  className?: string;
  label?: string;
}

/**
 * YearSelector - Standardized year selection component
 * Used across all pages for consistent year filtering
 */
export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  availableYears,
  onChange,
  className = '',
  label = 'Año'
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </label>
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onChange(Number(e.target.value))}
          className="appearance-none bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors cursor-pointer"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({availableYears.length} años disponibles)
      </span>
    </div>
  );
};

export default YearSelector;
