/**
 * Simple Year Selector - No dependencies, just plain React
 */
import React from 'react';
import { Calendar } from 'lucide-react';

interface SimpleYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  className?: string;
}

const SimpleYearSelector: React.FC<SimpleYearSelectorProps> = ({
  selectedYear,
  onYearChange,
  availableYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025],
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    onYearChange(year);
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <select
        value={selectedYear}
        onChange={handleChange}
        className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg
                   text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
        aria-label="Seleccionar año"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SimpleYearSelector;
