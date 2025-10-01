/**
 * Spanish formatting utilities for financial data
 */

export const formatCurrencyARS = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumberARS = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export const formatQuarter = (quarter: string): string => {
  // Convert "Q1 2021" to "1er Trimestre 2021", etc.
  const [q, year] = quarter.split(' ');
  const quarterNum = parseInt(q.replace('Q', ''));
  
  const quarterNames = [
    '', '1er', '2do', '3er', '4to'
  ];
  
  return `${quarterNames[quarterNum]} Trimestre ${year}`;
};

export const formatMonth = (monthIndex: number): string => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return months[monthIndex];
};