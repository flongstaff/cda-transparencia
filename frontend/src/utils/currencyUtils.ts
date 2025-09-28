// currencyUtils.ts
// Utility functions for formatting currency values

/**
 * Formats a number as Argentine Peso currency
 * @param value - The numeric value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats a number as a percentage
 * @param value - The numeric value to format (as decimal, e.g., 0.95 for 95%)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Formats a large number with thousands separators
 * @param value - The numeric value to format
 * @returns Formatted number string with thousands separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Converts a value to millions for easier reading
 * @param value - The numeric value to convert
 * @returns Value in millions
 */
export const toMillions = (value: number): number => {
  return value / 1000000;
};

/**
 * Formats a value in millions with appropriate suffix
 * @param value - The numeric value to format
 * @returns Formatted string with "M" suffix for millions
 */
export const formatMillions = (value: number): string => {
  const millions = toMillions(value);
  return `${formatNumber(millions)}M`;
};

export default {
  formatCurrency,
  formatPercentage,
  formatNumber,
  toMillions,
  formatMillions
};