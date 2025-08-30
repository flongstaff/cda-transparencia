import React from 'react';
import { Calendar } from 'lucide-react';

interface PageYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  label?: string;
}

const PageYearSelector: React.FC<PageYearSelectorProps> = ({
  selectedYear,
  onYearChange,
  availableYears = Array.from({ length: 9 }, (_, i) => new Date().getFullYear() - i).reverse(),
  label = "Año"
}) => {
  return (
    <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
      <Calendar size={16} className="text-gray-500" />
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <select 
        value={selectedYear} 
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="text-sm font-semibold text-blue-600 bg-transparent border-none outline-none cursor-pointer"
      >
        {availableYears.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
};

export default PageYearSelector;