/**
 * Data Sources Configuration
 * Centralized configuration for all data sources in the transparency portal
 */

export interface DataSourceConfig {
  id: string;
  name: string;
  type: 'json' | 'csv' | 'pdf' | 'api';
  category: 'budget' | 'revenue' | 'expenses' | 'treasury' | 'personnel' | 'general' | 'documents';
  path: string;
  description: string;
  enabled: boolean;
  years?: number[];
  updateFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface DataCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  sources: string[];
}

/**
 * All available data sources
 */
export const DATA_SOURCES: DataSourceConfig[] = [
  // OCR Extracted Documents
  {
    id: 'ocr-extraction-index',
    name: 'OCR Extraction Index',
    type: 'json',
    category: 'documents',
    path: '/data/ocr_extracted/extraction_index.json',
    description: 'Index of all OCR-extracted PDF documents',
    enabled: true
  },

  // Master Data Index
  {
    id: 'master-data-index',
    name: 'Master Data Index',
    type: 'json',
    category: 'general',
    path: '/data/master_data_index.json',
    description: 'Consolidated index of all available data',
    enabled: true
  },

  // Consolidated Data by Year
  {
    id: 'consolidated-2025',
    name: 'Datos Consolidados 2025',
    type: 'json',
    category: 'general',
    path: '/data/consolidated/2025/summary.json',
    description: 'Resumen consolidado de datos 2025',
    enabled: true,
    years: [2025],
    updateFrequency: 'monthly'
  },
  {
    id: 'consolidated-2024',
    name: 'Datos Consolidados 2024',
    type: 'json',
    category: 'general',
    path: '/data/consolidated/2024/summary.json',
    description: 'Resumen consolidado de datos 2024',
    enabled: true,
    years: [2024],
    updateFrequency: 'monthly'
  },
  {
    id: 'consolidated-2023',
    name: 'Datos Consolidados 2023',
    type: 'json',
    category: 'general',
    path: '/data/consolidated/2023/summary.json',
    description: 'Resumen consolidado de datos 2023',
    enabled: true,
    years: [2023],
    updateFrequency: 'yearly'
  },

  // Budget Data
  {
    id: 'budget-2025',
    name: 'Presupuesto 2025',
    type: 'json',
    category: 'budget',
    path: '/data/consolidated/2025/presupuesto.json',
    description: 'Presupuesto municipal 2025',
    enabled: true,
    years: [2025]
  },
  {
    id: 'budget-2024',
    name: 'Presupuesto 2024',
    type: 'json',
    category: 'budget',
    path: '/data/consolidated/2024/presupuesto.json',
    description: 'Presupuesto municipal 2024',
    enabled: true,
    years: [2024]
  },

  // Expenses Data
  {
    id: 'expenses-2025',
    name: 'Gastos 2025',
    type: 'json',
    category: 'expenses',
    path: '/data/consolidated/2025/gastos.json',
    description: 'Ejecución de gastos 2025',
    enabled: true,
    years: [2025],
    updateFrequency: 'monthly'
  },
  {
    id: 'expenses-2024',
    name: 'Gastos 2024',
    type: 'json',
    category: 'expenses',
    path: '/data/consolidated/2024/gastos.json',
    description: 'Ejecución de gastos 2024',
    enabled: true,
    years: [2024],
    updateFrequency: 'monthly'
  },
  {
    id: 'expenses-2023',
    name: 'Gastos 2023',
    type: 'json',
    category: 'expenses',
    path: '/data/consolidated/2023/gastos.json',
    description: 'Ejecución de gastos 2023',
    enabled: true,
    years: [2023]
  },

  // Revenue Data
  {
    id: 'revenue-2025',
    name: 'Recursos 2025',
    type: 'json',
    category: 'revenue',
    path: '/data/consolidated/2025/recursos.json',
    description: 'Ejecución de recursos 2025',
    enabled: true,
    years: [2025],
    updateFrequency: 'monthly'
  },
  {
    id: 'revenue-2024',
    name: 'Recursos 2024',
    type: 'json',
    category: 'revenue',
    path: '/data/consolidated/2024/recursos.json',
    description: 'Ejecución de recursos 2024',
    enabled: true,
    years: [2024],
    updateFrequency: 'monthly'
  },
  {
    id: 'revenue-2023',
    name: 'Recursos 2023',
    type: 'json',
    category: 'revenue',
    path: '/data/consolidated/2023/recursos.json',
    description: 'Ejecución de recursos 2023',
    enabled: true,
    years: [2023]
  },

  // Treasury Data
  {
    id: 'treasury-2024',
    name: 'Tesorería 2024',
    type: 'json',
    category: 'treasury',
    path: '/data/consolidated/2024/tesoreria.json',
    description: 'Situación económico-financiera 2024',
    enabled: true,
    years: [2024]
  },
  {
    id: 'treasury-2023',
    name: 'Tesorería 2023',
    type: 'json',
    category: 'treasury',
    path: '/data/consolidated/2023/tesoreria.json',
    description: 'Situación económico-financiera 2023',
    enabled: true,
    years: [2023]
  },

  // Personnel Data
  {
    id: 'personnel-2024',
    name: 'Personal 2024',
    type: 'json',
    category: 'personnel',
    path: '/data/consolidated/2024/personal.json',
    description: 'Datos de personal municipal 2024',
    enabled: true,
    years: [2024]
  },
  {
    id: 'personnel-2023',
    name: 'Personal 2023',
    type: 'json',
    category: 'personnel',
    path: '/data/consolidated/2023/personal.json',
    description: 'Datos de personal municipal 2023',
    enabled: true,
    years: [2023]
  },

  // Chart Data (CSV)
  {
    id: 'chart-budget-execution',
    name: 'Ejecución Presupuestaria (Todos los años)',
    type: 'csv',
    category: 'budget',
    path: '/data/charts/budget_execution_all_years.csv',
    description: 'Datos de ejecución presupuestaria para gráficos',
    enabled: true,
    years: [2021, 2022, 2023, 2024, 2025]
  },
  {
    id: 'chart-revenue-expenses',
    name: 'Recursos vs Gastos',
    type: 'csv',
    category: 'general',
    path: '/data/charts/revenue_vs_expenses.csv',
    description: 'Comparación de recursos y gastos por año',
    enabled: true,
    years: [2021, 2022, 2023, 2024, 2025]
  },
  {
    id: 'chart-document-distribution',
    name: 'Distribución de Documentos',
    type: 'csv',
    category: 'documents',
    path: '/data/charts/document_type_distribution.csv',
    description: 'Distribución de documentos por tipo',
    enabled: true
  }
];

/**
 * Data categories
 */
export const DATA_CATEGORIES: DataCategory[] = [
  {
    id: 'budget',
    name: 'Presupuesto',
    icon: 'BarChart3',
    description: 'Presupuesto municipal y ejecución',
    sources: ['budget-2025', 'budget-2024', 'chart-budget-execution']
  },
  {
    id: 'expenses',
    name: 'Gastos',
    icon: 'TrendingDown',
    description: 'Ejecución de gastos municipales',
    sources: ['expenses-2025', 'expenses-2024', 'expenses-2023']
  },
  {
    id: 'revenue',
    name: 'Recursos',
    icon: 'TrendingUp',
    description: 'Ejecución de recursos municipales',
    sources: ['revenue-2025', 'revenue-2024', 'revenue-2023']
  },
  {
    id: 'treasury',
    name: 'Tesorería',
    icon: 'DollarSign',
    description: 'Situación económico-financiera',
    sources: ['treasury-2024', 'treasury-2023']
  },
  {
    id: 'personnel',
    name: 'Personal',
    icon: 'Users',
    description: 'Información de personal municipal',
    sources: ['personnel-2024', 'personnel-2023']
  },
  {
    id: 'documents',
    name: 'Documentos',
    icon: 'FileText',
    description: 'Documentos oficiales y reportes',
    sources: ['ocr-extraction-index', 'chart-document-distribution']
  },
  {
    id: 'general',
    name: 'General',
    icon: 'Database',
    description: 'Datos generales y consolidados',
    sources: ['master-data-index', 'consolidated-2025', 'consolidated-2024', 'consolidated-2023']
  }
];

/**
 * Get data source by ID
 */
export const getDataSource = (id: string): DataSourceConfig | undefined => {
  return DATA_SOURCES.find(source => source.id === id);
};

/**
 * Get data sources by category
 */
export const getDataSourcesByCategory = (category: string): DataSourceConfig[] => {
  return DATA_SOURCES.filter(source => source.category === category && source.enabled);
};

/**
 * Get data sources by year
 */
export const getDataSourcesByYear = (year: number): DataSourceConfig[] => {
  return DATA_SOURCES.filter(source =>
    source.enabled && source.years && source.years.includes(year)
  );
};

/**
 * Get all enabled data sources
 */
export const getEnabledDataSources = (): DataSourceConfig[] => {
  return DATA_SOURCES.filter(source => source.enabled);
};

/**
 * Get category by ID
 */
export const getCategory = (id: string): DataCategory | undefined => {
  return DATA_CATEGORIES.find(cat => cat.id === id);
};

/**
 * Get all available years from data sources
 */
export const getAvailableYears = (): number[] => {
  const years = new Set<number>();
  DATA_SOURCES.forEach(source => {
    if (source.years) {
      source.years.forEach(year => years.add(year));
    }
  });
  return Array.from(years).sort((a, b) => b - a); // Descending order
};

export default {
  DATA_SOURCES,
  DATA_CATEGORIES,
  getDataSource,
  getDataSourcesByCategory,
  getDataSourcesByYear,
  getEnabledDataSources,
  getCategory,
  getAvailableYears
};
