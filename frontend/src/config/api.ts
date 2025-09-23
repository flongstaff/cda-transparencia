/**
 * API Configuration for Carmen de Areco Transparency Portal
 * Live data sources for financial transparency investigation
 */

// Primary live data sources
export const API_ENDPOINTS = {
  // Official government API endpoints
  CARMENDEARECO_API: 'https://api.carmendeareco.gob.ar',
  BOLETIN_OFICIAL_BA: 'https://www.gba.gob.ar/boletin_oficial',
  
  // Provincial transparency sources
  PROVINCIA_BA_API: 'https://www.gba.gob.ar/transparencia/datos_abiertos',
  SINBA_API: 'https://sinba.gba.gov.ar/api',
  
  // Municipal financial data
  PRESUPUESTO_ENDPOINT: '/api/presupuesto',
  GASTOS_ENDPOINT: '/api/gastos',
  INGRESOS_ENDPOINT: '/api/ingresos',
  CONTRATOS_ENDPOINT: '/api/contratos',
  SALARIOS_ENDPOINT: '/api/salarios',
  DOCUMENTOS_ENDPOINT: '/api/documentos',
  
  // Cross-reference verification endpoints
  CROSS_REFERENCE_ENDPOINT: '/api/cross-reference',
  INTEGRITY_CHECK_ENDPOINT: '/api/integrity'
} as const;

// Data source priorities for transparency investigation
export const DATA_SOURCE_PRIORITY = {
  // Primary: Official municipal sources
  OFFICIAL_MUNICIPAL: 1,
  
  // Secondary: Provincial oversight sources  
  PROVINCIAL_OVERSIGHT: 2,
  
  // Tertiary: Cross-reference validation
  CROSS_REFERENCE: 3,
  
  // Archive: Historical documentation
  HISTORICAL_ARCHIVE: 4
} as const;

// Time ranges for investigation (15 years of data)
export const INVESTIGATION_TIMEFRAME = {
  START_YEAR: 2009,
  END_YEAR: 2025,
  CURRENT_YEAR: new Date().getFullYear(),
  
  // Key periods of interest for investigation
  CRITICAL_PERIODS: [
    { start: '2009-01-01', end: '2015-12-31', label: 'Período Crítico 1' },
    { start: '2016-01-01', end: '2019-12-31', label: 'Período Crítico 2' }, 
    { start: '2020-01-01', end: '2023-12-31', label: 'Período Crítico 3' },
    { start: '2024-01-01', end: '2025-12-31', label: 'Período Actual' }
  ]
} as const;

// Categories for financial analysis
export const FINANCIAL_CATEGORIES = {
  GASTOS: {
    PERSONAL: 'gastos_personal',
    OPERATIVOS: 'gastos_operativos', 
    INVERSION: 'gastos_inversion',
    DEUDA: 'gastos_deuda',
    TRANSFERENCIAS: 'gastos_transferencias'
  },
  
  INGRESOS: {
    IMPUESTOS: 'ingresos_impuestos',
    TASAS: 'ingresos_tasas',
    TRANSFERENCIAS: 'ingresos_transferencias',
    OTROS: 'ingresos_otros'
  },
  
  CONTRATOS: {
    OBRAS_PUBLICAS: 'contratos_obras',
    SERVICIOS: 'contratos_servicios',
    SUMINISTROS: 'contratos_suministros',
    CONSULTORIA: 'contratos_consultoria'
  }
} as const;

// API request configuration
export const API_CONFIG = {
  TIMEOUT: 15000,
  RETRIES: 3,
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Transparency-Portal': 'Carmen-de-Areco-Investigation'
  },
  
  // Rate limiting for respectful data access
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    BURST_LIMIT: 10
  }
} as const;

// Get data for specific year range
export const getYearRangeParams = (startYear?: number, endYear?: number) => {
  return {
    start_year: (startYear || INVESTIGATION_TIMEFRAME.START_YEAR).toString(),
    end_year: (endYear || INVESTIGATION_TIMEFRAME.CURRENT_YEAR).toString()
  };
};