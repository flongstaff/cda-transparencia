/**
 * Year configuration and data availability management
 */

export interface YearDataConfig {
  year: number;
  hasDetailedBudget: boolean;
  hasSalaryData: boolean;
  hasDebtData: boolean;
  hasDocuments: boolean;
  dataIndex: string;
  label: string;
}

/**
 * Configuration for available years and their data completeness
 */
export const AVAILABLE_YEARS: YearDataConfig[] = [
  {
    year: 2025,
    hasDetailedBudget: false,
    hasSalaryData: false,
    hasDebtData: false,
    hasDocuments: true,
    dataIndex: '/frontend/src/data/data_index_2025.json',
    label: '2025 (Planificación)'
  },
  {
    year: 2024,
    hasDetailedBudget: true,
    hasSalaryData: true,
    hasDebtData: true,
    hasDocuments: true,
    dataIndex: '/frontend/src/data/data_index_2024.json',
    label: '2024 (Completo)'
  },
  {
    year: 2023,
    hasDetailedBudget: false, // Changed to false since no organized budget data exists
    hasSalaryData: false, // Changed to false since no organized salary data exists
    hasDebtData: false, // Changed to false since no organized debt data exists
    hasDocuments: true,
    dataIndex: '/frontend/src/data/data_index_2023.json',
    label: '2023 (Histórico)'
  },
  {
    year: 2022,
    hasDetailedBudget: false, // Changed to false since no organized budget data exists
    hasSalaryData: false, // Changed to false since no organized salary data exists
    hasDebtData: false, // Changed to false since no organized debt data exists
    hasDocuments: true,
    dataIndex: '/frontend/src/data/data_index_2022.json',
    label: '2022 (Histórico)'
  }
];

/**
 * Default year with most complete data
 */
export const DEFAULT_YEAR = 2024;

/**
 * Get available years as array of numbers
 */
export function getAvailableYears(): number[] {
  return AVAILABLE_YEARS.map(config => config.year);
}

/**
 * Get year configuration
 */
export function getYearConfig(year: number): YearDataConfig | null {
  return AVAILABLE_YEARS.find(config => config.year === year) || null;
}

/**
 * Check if year has specific data type
 */
export function hasDataType(year: number, dataType: 'budget' | 'salary' | 'debt' | 'documents'): boolean {
  const config = getYearConfig(year);
  if (!config) return false;
  
  switch (dataType) {
    case 'budget': return config.hasDetailedBudget;
    case 'salary': return config.hasSalaryData;
    case 'debt': return config.hasDebtData;
    case 'documents': return config.hasDocuments;
    default: return false;
  }
}

/**
 * Get fallback year for specific data type
 */
export function getFallbackYear(requestedYear: number, dataType: 'budget' | 'salary' | 'debt' | 'documents'): number {
  // First try to find the requested year
  if (hasDataType(requestedYear, dataType)) {
    return requestedYear;
  }
  
  // Find the closest year with that data type
  const availableYearsWithData = AVAILABLE_YEARS
    .filter(config => {
      switch (dataType) {
        case 'budget': return config.hasDetailedBudget;
        case 'salary': return config.hasSalaryData;
        case 'debt': return config.hasDebtData;
        case 'documents': return config.hasDocuments;
        default: return false;
      }
    })
    .sort((a, b) => Math.abs(a.year - requestedYear) - Math.abs(b.year - requestedYear));
  
  return availableYearsWithData[0]?.year || DEFAULT_YEAR;
}

/**
 * Get data URLs for a specific year
 */
export function getDataUrls(year: number) {
  const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';
  
  const hasOrganizedBudgetData = hasDataType(year, 'budget');
  const hasOrganizedSalaryData = hasDataType(year, 'salary');
  const hasOrganizedDebtData = hasDataType(year, 'debt');
  
  return {
    // Use organized data if available (only for 2024), otherwise use data index to derive information
    budget: hasOrganizedBudgetData
      ? `${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`
      : `${GITHUB_RAW_BASE}/frontend/src/data/data_index_${year}.json`,
    
    salary: hasOrganizedSalaryData
      ? `${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/salary_oversight/salary_data_${year}.json`
      : `${GITHUB_RAW_BASE}/frontend/src/data/data_index_${year}.json`,
    
    debt: hasOrganizedDebtData
      ? `${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/debt_monitoring/debt_data_${year}.json`
      : `${GITHUB_RAW_BASE}/frontend/src/data/data_index_${year}.json`,
    
    dataIndex: isYearSupported(year) ? `${GITHUB_RAW_BASE}/frontend/src/data/data_index_${year}.json` : null,
    
    // Common data sources
    multiSource: `${GITHUB_RAW_BASE}/data/multi_source_report.json`,
    inventory: `${GITHUB_RAW_BASE}/data/organized_analysis/inventory_summary.json`,
    auditResults: `${GITHUB_RAW_BASE}/data/organized_analysis/audit_cycles/enhanced_audits/enhanced_audit_results.json`
  };
}

/**
 * Validate if a year is supported
 */
export function isYearSupported(year: number): boolean {
  return AVAILABLE_YEARS.some(config => config.year === year);
}

/**
 * Get the most appropriate year for a page based on data requirements
 */
export function getBestYearForPage(requestedYear: number, pageDataRequirements: string[] = []): number {
  if (!isYearSupported(requestedYear)) {
    return DEFAULT_YEAR;
  }
  
  // If no specific requirements, return the requested year
  if (pageDataRequirements.length === 0) {
    return requestedYear;
  }
  
  // Check if requested year has all required data types
  const hasAllRequiredData = pageDataRequirements.every(requirement => 
    hasDataType(requestedYear, requirement as any)
  );
  
  if (hasAllRequiredData) {
    return requestedYear;
  }
  
  // Find best alternative year
  const scoredYears = AVAILABLE_YEARS.map(config => {
    const score = pageDataRequirements.reduce((acc, requirement) => {
      switch (requirement) {
        case 'budget': return acc + (config.hasDetailedBudget ? 1 : 0);
        case 'salary': return acc + (config.hasSalaryData ? 1 : 0);
        case 'debt': return acc + (config.hasDebtData ? 1 : 0);
        case 'documents': return acc + (config.hasDocuments ? 1 : 0);
        default: return acc;
      }
    }, 0);
    
    return { year: config.year, score, distance: Math.abs(config.year - requestedYear) };
  }).sort((a, b) => {
    // First sort by score (descending), then by distance (ascending)
    if (b.score !== a.score) return b.score - a.score;
    return a.distance - b.distance;
  });
  
  return scoredYears[0]?.year || DEFAULT_YEAR;
}