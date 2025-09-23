/**
 * Currency Formatting Utility
 * Utility functions for formatting currency values
 */

export const formatCurrency = (amount: number): string => {
  // Format as Argentine pesos
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatCurrencyWithDecimals = (amount: number): string => {
  // Format as Argentine pesos with decimals
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatLargeNumber = (amount: number): string => {
  // Format large numbers with appropriate suffixes
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};

export default {
  formatCurrency,
  formatCurrencyWithDecimals,
  formatLargeNumber
};