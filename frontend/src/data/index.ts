// Central Data Index for Carmen de Areco Transparency Portal
// This file organizes all data sources and provides typed exports

// Financial Data
export { budgetData, executionData } from './budget-data';
export { financialSummaryData } from './financial-summary';
export { statisticsData } from './statistics-comprehensive';

// Municipal Officials and Personnel
export { officials } from './officials';

export { performanceMetrics } from './performance';

// Documents and Transparency
export { documents } from './documents';
export { documentSources } from './document-sources';
export { resolutions } from './resolutions-all';

// Tender and Contract Data
export { tenders } from './tenders-data';

// Timeline and Events
export { timeline } from './timeline';


// Yearly Data - TypeScript exports
export * from './data-2022';
export * from './data-2023';
export * from './data-2024';
export * from './data-2025';

// Yearly Data - JSON indices (async loading)
export const loadYearlyIndex = async (year: number) => {
  try {
    const response = await fetch(`/src/data/data_index_${year}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Could not load yearly index for ${year}:`, error);
    return null;
  }
};

// Comprehensive Data Index (async loading)
export const loadComprehensiveIndex = async () => {
  try {
    const response = await fetch('/src/data/comprehensive_data_index.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Could not load comprehensive index:', error);
    return null;
  }
};

// Municipal Information
export { municipalities } from './municipalities';
export { generalMunicipalData } from './general-municipal';

// Analysis and Cross-Reference
export { crossReferenceAnalysis } from './cross-reference-analysis';

// Data Registry - Maps data type to its source
export const DATA_REGISTRY = {
  // Financial
  budget: {
    source: './budget-data',
    exports: ['budgetData', 'executionData'],
    description: 'Municipal budget and execution data',
    years: [2022, 2023, 2024, 2025]
  },
  financial: {
    source: './financial-summary', 
    exports: ['financialSummaryData'],
    description: 'Financial summary and indicators',
    years: [2022, 2023, 2024, 2025]
  },
  statistics: {
    source: './statistics-comprehensive',
    exports: ['statisticsData'], 
    description: 'Comprehensive municipal statistics',
    years: [2022, 2023, 2024, 2025]
  },
  
  // Personnel
  officials: {
    source: './officials',
    exports: ['officials'],
    description: 'Municipal officials data',
    years: [2022, 2023, 2024, 2025]
  },

  performance: {
    source: './performance',
    exports: ['performanceMetrics'],
    description: 'Performance metrics for officials',
    years: [2022, 2023, 2024, 2025]
  },
  
  // Documents
  documents: {
    source: './documents',
    exports: ['documents'],
    description: 'Municipal documents and publications',
    years: [2022, 2023, 2024, 2025]
  },
  documentSources: {
    source: './document-sources',
    exports: ['documentSources'],
    description: 'Document source configurations',
    years: [2022, 2023, 2024, 2025]
  },
  resolutions: {
    source: './resolutions-all',
    exports: ['resolutions'],
    description: 'Municipal resolutions and ordinances',
    years: [2022, 2023, 2024, 2025]
  },
  
  // Contracts and Tenders
  tenders: {
    source: './tenders-data',
    exports: ['tenders'],
    description: 'Public tender and contract data',
    years: [2022, 2023, 2024, 2025]
  },
  
  // Events and Timeline
  timeline: {
    source: './timeline',
    exports: ['timeline'],
    description: 'Timeline of municipal events',
    years: [2022, 2023, 2024, 2025]
  },

  
  // Yearly Consolidated
  yearly: {
    source: './data-[year]',
    exports: ['data[YEAR]'],
    description: 'Consolidated yearly data',
    years: [2022, 2023, 2024, 2025]
  },
  
  // Municipal Info
  municipalities: {
    source: './municipalities',
    exports: ['municipalities'], 
    description: 'Municipality information and comparisons',
    years: [2022, 2023, 2024, 2025]
  },
  general: {
    source: './general-municipal',
    exports: ['generalMunicipalData'],
    description: 'General municipal data and metadata',
    years: [2022, 2023, 2024, 2025]
  },
  
  // Analysis
  crossReference: {
    source: './cross-reference-analysis',
    exports: ['crossReferenceAnalysis'],
    description: 'Cross-reference analysis and correlations',
    years: [2022, 2023, 2024, 2025]
  }
} as const;

// Helper functions for data access
export const getDataByYear = (dataType: keyof typeof DATA_REGISTRY, year: number) => {
  switch (dataType) {
    case 'yearly':
      switch (year) {
        case 2022: return data2022;
        case 2023: return data2023; 
        case 2024: return data2024;
        case 2025: return data2025;
        default: return null;
      }
    default:
      // For other data types, filter by year if the data supports it
      return null;
  }
};

export const getAvailableYears = (): number[] => {
  return [2022, 2023, 2024, 2025];
};

export const getDataTypes = (): Array<keyof typeof DATA_REGISTRY> => {
  return Object.keys(DATA_REGISTRY) as Array<keyof typeof DATA_REGISTRY>;
};

export const getDataSourceInfo = (dataType: keyof typeof DATA_REGISTRY) => {
  return DATA_REGISTRY[dataType];
};

// Export all data registry for external use
export { DATA_REGISTRY as default };