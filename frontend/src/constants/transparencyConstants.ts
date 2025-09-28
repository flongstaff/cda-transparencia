// constants.ts
// Constants used throughout the transparency portal

export const APP_NAME = 'Portal de Transparencia del Municipio de Carmen de Areco';

export const APP_DESCRIPTION = 'Visualización de datos financieros y presupuestarios del Municipio de Carmen de Areco';

export const MUNICIPALITY_NAME = 'Carmen de Areco';

export const MUNICIPALITY_PROVINCE = 'Buenos Aires';

export const MUNICIPALITY_COUNTRY = 'Argentina';

export const SUPPORTED_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

export const FINANCIAL_CATEGORIES = [
  'Ingresos',
  'Gastos',
  'Posición Financiera',
  'Resultados Financieros'
];

export const REVENUE_SOURCES = [
  'Impuestos Provinciales',
  'Inmobiliario Rural',
  'Ingresos Brutos',
  'Recursos Ordinarios',
  'Fondo Vivienda Municipal',
  'Inmobiliario Rural Afectado',
  'Fondo Productivo Municipal',
  'Fondo Tendiend Redes',
  'Policia Comunal',
  'Segunda Oportunidad',
  'Recursos Afectados',
  'Plan NACER',
  'Fondo Solidario Pcial Soja',
  'Coparticipacion Fondo Educativo',
  'Fondo de Infraestructura',
  'Sistema de Atención Médica Organizada',
  'Plan Nacional de Obras Municipales',
  'Habitat Norte Interior Y Obras Y Vivienda',
  'Cuenta de Terceros',
  'Total Disponibilidades'
];

export const EXPENDITURE_PROGRAMS = [
  'Planificacion y desarrollo de politicas sociales',
  'Desarrollo Productivo en el Ambito Local',
  'Desarrollo de Políticas Sociales',
  'Desarrollo de Políticas de Educación',
  'Fondo Educativo',
  'Mantenimiento y ampliación de la red cloacal',
  'Mantenimiento y ampliación de la Red de agua pot',
  'Desarrollo de Políticas Culturales',
  'Desarrollo de Políticas Deportivas',
  'Desarrollo de Politicas de Turismo',
  'Servicios Urbanos',
  'Obras Infraestructura y Vivienda',
  'Obras Infraestructuras y Viviendas II',
  'Mantenimiento y reparacion de caminos',
  'Fondo de Pavimentacion Urbana Pcia. de Bs As',
  'Actividades Centrales',
  'Partidas no asignables a programas',
  'H.C.D. - Actividades Centrales'
];

export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
  '#a855f7', // purple-500
  '#0ea5e9', // sky-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#c026d3', // fuchsia-600
  '#0891b2'  // cyan-600
];

export const API_ENDPOINTS = {
  FINANCIAL: {
    BASE: '/api/financial',
    SUMMARY: (year: number) => `/api/financial/${year}/summary.json`,
    REVENUE_BY_SOURCE: (year: number) => `/api/financial/${year}/revenue_by_source.json`,
    EXPENDITURE_BY_PROGRAM: (year: number) => `/api/financial/${year}/expenditure_by_program.json`,
    CONSOLIDATED: (year: number) => `/api/financial/${year}/consolidated.json`
  },
  TRANSPARENCY: {
    BASE: '/api/transparency',
    INDEX: '/api/transparency/index.json',
    DOCUMENTS: '/api/transparency/documents.json'
  },
  STATISTICS: {
    BASE: '/api/statistics',
    INDEX: '/api/statistics/index.json'
  },
  TENDERS: {
    BASE: '/api/tenders',
    INDEX: '/api/tenders/index.json',
    LICITACIONES_2023: '/api/tenders/licencias_2023.json'
  }
};

export const DATA_CATEGORIES = {
  FINANCIAL: 'financial',
  TRANSPARENCY: 'transparency',
  STATISTICS: 'statistics',
  TENDERS: 'tenders'
};

export const FILE_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  PDF: 'pdf'
};

export default {
  APP_NAME,
  APP_DESCRIPTION,
  MUNICIPALITY_NAME,
  MUNICIPALITY_PROVINCE,
  MUNICIPALITY_COUNTRY,
  SUPPORTED_YEARS,
  FINANCIAL_CATEGORIES,
  REVENUE_SOURCES,
  EXPENDITURE_PROGRAMS,
  CHART_COLORS,
  API_ENDPOINTS,
  DATA_CATEGORIES,
  FILE_FORMATS
};