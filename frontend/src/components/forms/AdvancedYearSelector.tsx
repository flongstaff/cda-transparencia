import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronDownIcon,
  CalendarIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AVAILABLE_YEARS, getYearConfig, DEFAULT_YEAR, type YearDataConfig } from '../../utils/yearConfig';

interface AdvancedYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  label?: string;
  showDataAvailability?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dropdown' | 'tabs' | 'cards';
  className?: string;
  placeholder?: string;
  showDescription?: boolean;
  allowCustomYear?: boolean;
  minYear?: number;
  maxYear?: number;
  'aria-label'?: string;
}

interface YearOption {
  year: number;
  config: YearDataConfig | null;
  isAvailable: boolean;
  completeness: number;
}

const AdvancedYearSelector: React.FC<AdvancedYearSelectorProps> = React.memo(({
  selectedYear,
  onYearChange,
  availableYears,
  label = 'Seleccionar Año',
  showDataAvailability = true,
  disabled = false,
  size = 'md',
  variant = 'dropdown',
  className = '',
  placeholder = 'Seleccionar año...',
  showDescription = true,
  allowCustomYear = false,
  minYear = 2018,
  maxYear = new Date().getFullYear() + 1,
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Process available years with metadata
  const yearOptions = useMemo((): YearOption[] => {
    const years = availableYears || AVAILABLE_YEARS.map(config => config.year);

    return years.map(year => {
      const config = getYearConfig(year);
      const completeness = config ? [
        config.hasDetailedBudget,
        config.hasSalaryData,
        config.hasDebtData,
        config.hasDocuments
      ].filter(Boolean).length / 4 : 0;

      return {
        year,
        config,
        isAvailable: !!config,
        completeness
      };
    }).sort((a, b) => b.year - a.year);
  }, [availableYears]);

  // Filter years based on search query
  const filteredYears = useMemo(() => {
    if (!searchQuery.trim()) return yearOptions;

    const query = searchQuery.toLowerCase();
    return yearOptions.filter(option =>
      option.year.toString().includes(query) ||
      option.config?.label.toLowerCase().includes(query)
    );
  }, [yearOptions, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current && variant === 'dropdown') {
      searchInputRef.current.focus();
    }
  }, [isOpen, variant]);

  // Handle year selection
  const handleYearSelect = useCallback((year: number) => {
    if (!disabled && year !== selectedYear) {
      onYearChange(year);
      setIsOpen(false);
      setSearchQuery('');
    }
  }, [disabled, selectedYear, onYearChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  }, [disabled, isOpen]);

  // Get selected year option
  const selectedOption = useMemo(() =>
    yearOptions.find(option => option.year === selectedYear),
    [yearOptions, selectedYear]
  );

  // Size-based classes
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-3 py-1.5 text-sm',
          dropdown: 'text-sm',
          option: 'px-3 py-2 text-sm'
        };
      case 'lg':
        return {
          button: 'px-4 py-3 text-base',
          dropdown: 'text-base',
          option: 'px-4 py-3 text-base'
        };
      default:
        return {
          button: 'px-3 py-2 text-sm',
          dropdown: 'text-sm',
          option: 'px-3 py-2.5 text-sm'
        };
    }
  }, [size]);

  const renderDataIndicators = (option: YearOption) => {
    if (!showDataAvailability || !option.config) return null;

    const indicators = [
      { icon: '💰', available: option.config.hasDetailedBudget, label: 'Presupuesto' },
      { icon: '👥', available: option.config.hasSalaryData, label: 'Salarios' },
      { icon: '📊', available: option.config.hasDebtData, label: 'Deuda' },
      { icon: '📄', available: option.config.hasDocuments, label: 'Documentos' }
    ];

    return (
      <div className="flex items-center space-x-1 ml-2">
        {indicators.map(({ icon, available, label }) => (
          <span
            key={label}
            className={`text-xs transition-opacity ${available ? 'opacity-100' : 'opacity-30'}`}
            title={`${label}: ${available ? 'Disponible' : 'No disponible'}`}
          >
            {icon}
          </span>
        ))}
        <div className="w-12 bg-gray-200 rounded-full h-1.5 ml-2">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${option.completeness * 100}%` }}
          />
        </div>
      </div>
    );
  };

  if (variant === 'tabs') {
    return (
      <div className={`${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {yearOptions.slice(0, 6).map((option) => (
            <button
              key={option.year}
              onClick={() => handleYearSelect(option.year)}
              disabled={disabled || !option.isAvailable}
              className={`
                ${sizeClasses.button} rounded-lg border transition-all duration-200
                ${selectedYear === option.year
                  ? 'bg-blue-600 text-white border-blue-600'
                  : option.isAvailable
                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }
                focus:ring-2 focus:ring-blue-500 focus:outline-none
              `}
            >
              <div className="flex items-center space-x-2">
                <span>{option.year}</span>
                {selectedYear === option.year && <CheckIcon className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`${className}`}>
        {label && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {label}
          </h3>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {yearOptions.slice(0, 6).map((option) => (
            <button
              key={option.year}
              onClick={() => handleYearSelect(option.year)}
              disabled={disabled || !option.isAvailable}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedYear === option.year
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : option.isAvailable
                  ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                }
                focus:ring-2 focus:ring-blue-500 focus:outline-none
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-gray-900">
                  {option.year}
                </span>
                {selectedYear === option.year && (
                  <CheckIcon className="w-5 h-5 text-blue-600" />
                )}
              </div>
              {option.config && (
                <p className="text-sm text-gray-600 mb-2">
                  {option.config.label}
                </p>
              )}
              {renderDataIndicators(option)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || `Año seleccionado: ${selectedYear}`}
        className={`
          ${sizeClasses.button}
          w-full bg-white border border-gray-300 rounded-lg shadow-sm
          flex items-center justify-between
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      >
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">
            {selectedOption?.config?.label || selectedYear}
          </span>
          {renderDataIndicators(selectedOption!)}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {allowCustomYear && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar año..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {filteredYears.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500">
                <InformationCircleIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No se encontraron años</p>
              </div>
            ) : (
              filteredYears.map((option) => (
                <button
                  key={option.year}
                  onClick={() => handleYearSelect(option.year)}
                  disabled={!option.isAvailable}
                  className={`
                    ${sizeClasses.option}
                    w-full text-left flex items-center justify-between
                    hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                    ${selectedYear === option.year ? 'bg-blue-50 text-blue-700' : ''}
                    ${!option.isAvailable ? 'text-gray-400 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{option.year}</span>
                      {selectedYear === option.year && (
                        <CheckIcon className="w-4 h-4 text-blue-600" />
                      )}
                      {!option.isAvailable && (
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    {showDescription && option.config && (
                      <p className="text-xs text-gray-500 mt-1">
                        {option.config.label}
                      </p>
                    )}
                  </div>
                  {renderDataIndicators(option)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

AdvancedYearSelector.displayName = 'AdvancedYearSelector';

export default AdvancedYearSelector;