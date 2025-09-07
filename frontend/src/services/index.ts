/**
 * Services Index - Consolidated exports for all services
 * All API calls now go through ConsolidatedApiService for consistency
 */

// Primary service - all API calls go through this
export { consolidatedApiService } from './ConsolidatedApiService';
export { default as consolidatedApiService } from './ConsolidatedApiService';

// Essential supporting services
export { default as yearlyDataService } from './YearlyDataService';
export { default as chartService } from './ChartService';
export { default as markdownService } from './MarkdownDataService';
export { default as apiClient } from './ApiClient';

// Backward compatibility aliases - all point to ConsolidatedApiService
export { consolidatedApiService as apiService } from './ConsolidatedApiService';
export { consolidatedApiService as dataService } from './ConsolidatedApiService';
export { consolidatedApiService as unifiedDataService } from './ConsolidatedApiService';

// Type exports
export type { MunicipalData, BudgetData, Document } from './ConsolidatedApiService';