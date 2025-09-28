import React, { useMemo, useCallback } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AVAILABLE_YEARS, getYearConfig, type YearDataConfig } from '../../utils/yearConfig';

interface PageYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  label?: string;
  showDataAvailability?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'badge';
  className?: string;
  'aria-label'?: string;
}

const PageYearSelector: React.FC<PageYearSelectorProps> = React.memo(({
  selectedYear,
  onYearChange,
  availableYears,
  label = 'Year',
  showDataAvailability = true,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  'aria-label': ariaLabel
}) => {
  // Memoize years to show to prevent unnecessary recalculations
  const yearsToShow = useMemo(() => {
    if (availableYears) {
      return availableYears;
    }
    return AVAILABLE_YEARS.map(config => config.year).sort((a, b) => b - a);
  }, [availableYears]);

  // Memoize year configurations to prevent recalculation
  const yearConfigs = useMemo(() => {
    const configs = new Map<number, YearDataConfig>();
    yearsToShow.forEach(year => {
      const config = getYearConfig(year);
      if (config) configs.set(year, config);
    });
    return configs;
  }, [yearsToShow]);

  // Memoized change handler to prevent unnecessary re-renders
  const handleYearChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(event.target.value);
    if (newYear !== selectedYear && !disabled) {
      onYearChange(newYear);
    }
  }, [selectedYear, onYearChange, disabled]);

  // Memoized data indicators
  const dataIndicators = useMemo(() => {
    if (!showDataAvailability) return null;

    const config = yearConfigs.get(selectedYear);
    if (!config) return null;

  }, [yearConfigs, selectedYear, showDataAvailability]);

  // Size-based styling
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          label: 'text-xs font-medium',
          select: 'px-2 py-1 text-xs',
          indicators: 'text-xs'
        };
      case 'lg':
        return {
          label: 'text-base font-medium',
          select: 'px-4 py-2 text-base',
          indicators: 'text-sm'
        };
      default:
        return {
          label: 'text-sm font-medium',
          select: 'px-3 py-1.5 text-sm',
          indicators: 'text-xs'
        };
    }
  }, [size]);

  // Variant-based styling
  const variantClasses = useMemo(() => {
    switch (variant) {
      case 'minimal':
        return 'border-0 bg-transparent focus:ring-1 focus:ring-offset-0';
      case 'badge':
        return 'rounded-full bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-300';
      default:
        return 'border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  }, [variant]);

  const selectId = `year-selector-${React.useId()}`;
  const labelId = `year-label-${React.useId()}`;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          className={`${sizeClasses.label} text-gray-700 dark:text-gray-300`}
        >
          {label}:
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={selectedYear}
          onChange={handleYearChange}
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          aria-label={ariaLabel || `Select year, currently ${selectedYear}`}
          aria-describedby={showDataAvailability ? `${selectId}-indicators` : undefined}
          className={`
            ${sizeClasses.select} ${variantClasses}
            appearance-none cursor-pointer
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            pr-8
          `}
          title={showDataAvailability ? "Select year - some years may have limited data" : undefined}
        >
          {yearsToShow.map((year) => {
            const config = yearConfigs.get(year);
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

        {/* Custom dropdown icon */}
        <ChevronDownIcon
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {showDataAvailability && dataIndicators && (
        <div
          id={`${selectId}-indicators`}
          className={`${sizeClasses.indicators} text-gray-500 flex items-center space-x-1`}
          role="status"
          aria-label="Data availability"
        >
          {dataIndicators.map(({ icon, label, available }) => (
            <span
              key={label}
              className={`
                transition-opacity duration-200
                ${available ? 'opacity-100' : 'opacity-30'}
              `}
              title={`${label}: ${available ? 'Available' : 'Not available'}`}
              aria-label={`${label}: ${available ? 'Available' : 'Not available'}`}
            >
              {icon}
            </span>
          ))}
        </div>
      )}

      {/* Screen reader only description */}
      <div className="sr-only" id={`${selectId}-description`}>
        {showDataAvailability && dataIndicators && (
          <span>
            Data available for {selectedYear}: {
              dataIndicators
                .filter(({ available }) => available)
                .map(({ label }) => label)
                .join(', ') || 'None'
            }
          </span>
        )}
      </div>
    </div>
  );
});

PageYearSelector.displayName = 'PageYearSelector';

export default PageYearSelector;