// Argentina-specific formatting utilities

/**
 * Format currency in Argentine Pesos
 */
export const formatCurrencyARS = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format numbers with Argentine locale
 */
export const formatNumberARS = (number: number): string => {
  return new Intl.NumberFormat('es-AR').format(number);
};

/**
 * Format dates in Argentine format
 */
export const formatDateARS = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

/**
 * Format dates with time in Argentine format
 */
export const formatDateTimeARS = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format percentages with Argentine locale
 */
export const formatPercentageARS = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Format large numbers with units (K, M, B)
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return formatNumberARS(num);
};

/**
 * Format file sizes
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format relative time in Spanish
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const intervals = [
    { label: 'año', seconds: 31536000 },
    { label: 'mes', seconds: 2592000 },
    { label: 'semana', seconds: 604800 },
    { label: 'día', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `hace ${count} ${interval.label}${count > 1 ? 's' : ''}`;
    }
  }
  
  return 'hace unos momentos';
};

/**
 * Format government document numbers
 */
export const formatDocumentNumber = (type: string, number: string | number): string => {
  switch (type.toLowerCase()) {
    case 'resolucion':
    case 'resolución':
      return `Resolución N° ${number}`;
    case 'ordenanza':
      return `Ordenanza N° ${number}`;
    case 'decreto':
      return `Decreto N° ${number}`;
    case 'licitacion':
    case 'licitación':
      return `Licitación N° ${number}`;
    default:
      return `${type} N° ${number}`;
  }
};

/**
 * Validate Argentine CUIT/CUIL
 */
export const validateCUIT = (cuit: string): boolean => {
  const cleanCuit = cuit.replace(/[^\d]/g, '');
  if (cleanCuit.length !== 11) return false;
  
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * multipliers[i];
  }
  
  const remainder = sum % 11;
  const verifier = remainder < 2 ? remainder : 11 - remainder;
  
  return verifier === parseInt(cleanCuit[10]);
};

/**
 * Format CUIT/CUIL with dashes
 */
export const formatCUIT = (cuit: string): string => {
  const cleanCuit = cuit.replace(/[^\d]/g, '');
  if (cleanCuit.length === 11) {
    return `${cleanCuit.slice(0, 2)}-${cleanCuit.slice(2, 10)}-${cleanCuit.slice(10)}`;
  }
  return cuit;
};

/**
 * Format budget execution percentage with context
 */
export const formatBudgetExecution = (executed: number, planned: number): string => {
  const percentage = (executed / planned) * 100;
  const status = percentage >= 95 ? 'excelente' : 
                 percentage >= 85 ? 'buena' : 
                 percentage >= 70 ? 'regular' : 'baja';
  
  return `${formatPercentageARS(percentage)} (${status})`;
};

/**
 * Get month name in Spanish
 */
export const getMonthNameES = (monthIndex: number): string => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return months[monthIndex] || '';
};

/**
 * Get day name in Spanish
 */
export const getDayNameES = (dayIndex: number): string => {
  const days = [
    'domingo', 'lunes', 'martes', 'miércoles', 
    'jueves', 'viernes', 'sábado'
  ];
  return days[dayIndex] || '';
};

/**
 * Format fiscal year for Argentina (January to December)
 */
export const formatFiscalYear = (year: number): string => {
  return `Ejercicio Fiscal ${year}`;
};

/**
 * Format tender status in Spanish
 */
export const formatTenderStatus = (status: string): { text: string; color: string } => {
  const statusMap: Record<string, { text: string; color: string }> = {
    'draft': { text: 'Borrador', color: 'gray' },
    'published': { text: 'Publicado', color: 'blue' },
    'active': { text: 'Activo', color: 'green' },
    'closed': { text: 'Cerrado', color: 'yellow' },
    'awarded': { text: 'Adjudicado', color: 'purple' },
    'cancelled': { text: 'Cancelado', color: 'red' },
    'completed': { text: 'Finalizado', color: 'green' }
  };
  
  return statusMap[status.toLowerCase()] || { text: status, color: 'gray' };
};