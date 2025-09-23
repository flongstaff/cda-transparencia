/**
 * Services Index - Consolidated exports for all services
 * All API calls now go through ConsolidatedApiService for consistency
 */

// Primary service - all API calls go through this
export { consolidatedApiService } from './ConsolidatedApiService';

// Document data services for organizing and fetching data from Markdown/JSON files
export { documentDataService } from './DocumentDataService';
export { enhancedDocumentDataService } from './EnhancedDocumentDataService';
export { unifiedResourceService } from './UnifiedResourceService';

// Essential supporting services
//export { default as yearlyDataService } from './YearlyDataService';
//export { default as markdownService } from './MarkdownDataService';

// Backward compatibility aliases - all point to ConsolidatedApiService
export { consolidatedApiService as apiService } from './ConsolidatedApiService';
export { consolidatedApiService as dataService } from './ConsolidatedApiService';
export { consolidatedApiService as unifiedDataService } from './ConsolidatedApiService';

// Type exports
export type { MunicipalData, BudgetData, Document } from './ConsolidatedApiService';
export type { DocumentMetadata, CategoryData, YearlyData } from './DocumentDataService';
export type { 
  DocumentMetadata as EnhancedDocumentMetadata,
  CategoryData as EnhancedCategoryData,
  YearlyData as EnhancedYearlyData,
  DocumentServiceError,
  SupportedFileType
} from './EnhancedDocumentDataService';
export type { 
  DocumentMetadata as UnifiedDocumentMetadata,
  DocumentServiceError as UnifiedDocumentServiceError
} from './UnifiedResourceService';