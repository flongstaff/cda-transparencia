import { useState, useCallback, useEffect, useMemo } from 'react';
import { DEFAULT_YEAR, getAvailableYears, isYearSupported, getBestYearForPage } from '../utils/yearConfig';

interface UseYearSelectionOptions {
  initialYear?: number;
  pageDataRequirements?: string[];
  onYearChange?: (year: number) => void;
  validateYear?: (year: number) => boolean;
}

interface UseYearSelectionReturn {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
  isYearValid: boolean;
  resetToDefault: () => void;
  resetToBestYear: () => void;
}

/**
 * Custom hook for managing year selection state with validation and best practices
 *
 * @param options Configuration options for year selection
 * @returns Year selection state and control functions
 */
export function useYearSelection({
  initialYear,
  pageDataRequirements = [],
  onYearChange,
  validateYear
}: UseYearSelectionOptions = {}): UseYearSelectionReturn {
  // Determine the best initial year
  const bestInitialYear = useMemo(() => {
    if (initialYear && isYearSupported(initialYear)) {
      return getBestYearForPage(initialYear, pageDataRequirements);
    }
    return getBestYearForPage(DEFAULT_YEAR, pageDataRequirements);
  }, [initialYear, pageDataRequirements]);

  const [selectedYear, setSelectedYearState] = useState<number>(bestInitialYear);

  // Memoize available years to prevent recalculation
  const availableYears = useMemo(() => getAvailableYears(), []);

  // Validate current year
  const isYearValid = useMemo(() => {
    if (validateYear) {
      return validateYear(selectedYear);
    }
    return isYearSupported(selectedYear);
  }, [selectedYear, validateYear]);

  // Memoized setter with validation
  const setSelectedYear = useCallback((year: number) => {
    // Validate the year before setting
    const isValid = validateYear ? validateYear(year) : isYearSupported(year);

    if (!isValid) {
      console.warn(`Invalid year selected: ${year}. Using default year: ${DEFAULT_YEAR}`);
      year = DEFAULT_YEAR;
    }

    setSelectedYearState(year);

    // Call external change handler if provided
    if (onYearChange) {
      onYearChange(year);
    }
  }, [validateYear, onYearChange]);

  // Reset to default year
  const resetToDefault = useCallback(() => {
    setSelectedYear(DEFAULT_YEAR);
  }, [setSelectedYear]);

  // Reset to best year for current page requirements
  const resetToBestYear = useCallback(() => {
    const bestYear = getBestYearForPage(selectedYear, pageDataRequirements);
    setSelectedYear(bestYear);
  }, [selectedYear, pageDataRequirements, setSelectedYear]);

  // Update year if initial year changes (useful for URL params)
  useEffect(() => {
    if (initialYear && initialYear !== selectedYear && isYearSupported(initialYear)) {
      const bestYear = getBestYearForPage(initialYear, pageDataRequirements);
      setSelectedYear(bestYear);
    }
  }, [initialYear, selectedYear, pageDataRequirements, setSelectedYear]);

  return {
    selectedYear,
    setSelectedYear,
    availableYears,
    isYearValid,
    resetToDefault,
    resetToBestYear
  };
}

export default useYearSelection;