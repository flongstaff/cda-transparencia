import React from 'react';
import { getAvailableYears, DEFAULT_YEAR } from '../../utils/yearConfig';

interface SimpleYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
}

const SimpleYearSelector: React.FC<SimpleYearSelectorProps> = ({
  selectedYear,
  onYearChange,
  className = '',
  disabled = false,
  showLabel = true
}) => {
  const availableYears = getAvailableYears().sort((a, b) => b - a);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(event.target.value, 10);
    if (!isNaN(newYear) && newYear !== selectedYear) {
      onYearChange(newYear);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <label htmlFor="year-selector" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Año:
        </label>
      )}
      <select
        id="year-selector"
        value={selectedYear}
        onChange={handleChange}
        disabled={disabled}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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