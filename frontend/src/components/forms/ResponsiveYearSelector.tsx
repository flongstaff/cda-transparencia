/**
 * Responsive Year Selector
 * Non-refreshing year selector that updates data via context/state
 * without causing page reloads or collapsing information
 */

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResponsiveYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

const ResponsiveYearSelector: React.FC<ResponsiveYearSelectorProps> = ({
  selectedYear,
  onYearChange,
  availableYears,
  disabled = false,
  compact = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [years, setYears] = useState<number[]>([]);

  // Generate year range if not provided
  useEffect(() => {
    if (availableYears && availableYears.length > 0) {
      setYears(availableYears.sort((a, b) => b - a)); // Sort descending
    } else {
      // Default to 2019-2025 range (as per the CSV data)
      const currentYear = new Date().getFullYear();
      const startYear = 2019;
      const endYear = Math.max(currentYear, 2025);
      const yearRange = [];
      for (let year = endYear; year >= startYear; year--) {
        yearRange.push(year);
      }
      setYears(yearRange);
    }
  }, [availableYears]);

  const handleYearSelect = (year: number) => {
    if (year !== selectedYear && !disabled) {
      onYearChange(year);
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.year-selector-dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative year-selector-dropdown ${className}`}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-4 py-2 text-left
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${compact ? 'px-3 py-1 text-sm' : 'px-4 py-2'}
        `}
      >
        <div className="flex items-center space-x-2">
          <Calendar className={`text-gray-500 dark:text-gray-400 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span className={`font-medium text-gray-900 dark:text-gray-100 ${compact ? 'text-sm' : ''}`}>
            {selectedYear}
          </span>
        </div>
        <div className="flex items-center">
          {isOpen ? (
            <ChevronUp className={`text-gray-500 dark:text-gray-400 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          ) : (
            <ChevronDown className={`text-gray-500 dark:text-gray-400 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="py-1">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={`
                    w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                    focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                    transition-colors duration-150 ease-in-out
                    ${year === selectedYear
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-900 dark:text-gray-100'
                    }
                    ${compact ? 'px-3 py-1 text-sm' : 'px-4 py-2'}
                  `}
                >
                  {year}
                  {year === selectedYear && (
                    <span className="ml-2 text-blue-500 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResponsiveYearSelector;