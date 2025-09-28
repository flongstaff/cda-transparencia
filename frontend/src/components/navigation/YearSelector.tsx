import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useMasterData } from '../../hooks/useMasterData';

interface YearSelectorProps {
  onYearChange: (year: number) => void;
  currentYear?: number;
  availableYears?: number[];
}

const YearSelector: React.FC<YearSelectorProps> = ({ 
  onYearChange, 
  currentYear: externalYear,
  availableYears: externalAvailableYears
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(externalYear || new Date().getFullYear());
  
  // Use master data to get available years if not provided externally
  const { availableYears: masterAvailableYears } = useMasterData();
  const yearsToUse = externalAvailableYears || masterAvailableYears;

  // Update local state when external year changes
  useEffect(() => {
    if (externalYear && externalYear !== selectedYear) {
      setSelectedYear(externalYear);
    }
  }, [externalYear]);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    onYearChange(year);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full md:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200 max-w-[200px]"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{selectedYear}</span>
          <span className="sm:hidden">Año {selectedYear}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 ml-2" />
        ) : (
          <ChevronDown className="h-5 w-5 ml-2" />
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute z-10 mt-2 w-full md:w-48 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
          role="menu"
        >
          <div className="py-1">
            {yearsToUse && yearsToUse.length > 0 ? (
              yearsToUse
                .sort((a, b) => b - a) // Sort years in descending order
                .map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      year === selectedYear
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    role="menuitem"
                  >
                    {year}
                  </button>
                ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Cargando años...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default YearSelector;