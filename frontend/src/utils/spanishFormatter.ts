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

export const formatQuarter = (quarter: string, year?: number): string => {
  // Handle different formats:
  // "Q1 2021" -> "1er Trimestre 2021"
  // "Q1" -> "1er Trimestre" or "1er Trimestre 2021" if year is provided
  // "Q4 2021" -> "4to Trimestre 2021"
  
  if (quarter.includes(' ')) {
    // Format with year: "Q1 2021"
    const [q, yearStr] = quarter.split(' ');
    const quarterNum = parseInt(q.replace('Q', ''));
    
    const quarterNames = [
      '', '1er', '2do', '3er', '4to'
    ];
    
    return `${quarterNames[quarterNum]} Trimestre ${yearStr}`;
  } else if (year) {
    // Format with provided year: "Q1" + 2021
    const quarterNum = parseInt(quarter.replace('Q', ''));
    
    const quarterNames = [
      '', '1er', '2do', '3er', '4to'
    ];
    
    return `${quarterNames[quarterNum]} Trimestre ${year}`;
  } else {
    // Format without year: "Q1"
    const quarterNum = parseInt(quarter.replace('Q', ''));
    
    const quarterNames = [
      '', '1er', '2do', '3er', '4to'
    ];
    
    return `${quarterNames[quarterNum]} Trimestre`;
  }
};

export const formatMonth = (monthIndex: number): string => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return months[monthIndex];
};