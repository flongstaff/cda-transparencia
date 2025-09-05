/**
 * Services Index - Consolidated exports for all services
 */

// Core Services
export { default as unifiedDataService } from './UnifiedDataService';
export { default as apiClient } from './ApiClient';
export { default as chartService } from './ChartService';

// Type exports
export type { MunicipalData, DocumentData } from './UnifiedDataService';
export type { ApiConfig, RequestOptions } from './ApiClient';
export type { ChartDataPoint, TimeSeriesPoint, ComparisonData } from './ChartService';

// Legacy compatibility exports (redirect to consolidated services)
export { unifiedDataService as dataService };
export { unifiedDataService as apiService };
export { unifiedDataService as yearlyDataService };