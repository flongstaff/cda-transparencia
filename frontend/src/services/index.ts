/**
 * Services Index - Export all services for easy importing
 * Provides unified access to all data services in the application
 *
 * Updated: 2025-10-13 - Cleaned up obsolete services
 */

// ===== CORE DATA SERVICES =====
// export { default as unifiedDataService } from './UnifiedDataService'; // File not found, using masterDataService instead
export { default as chartDataService } from './ChartDataService';
export { default as smartDataLoader } from './SmartDataLoader';
export { default as dataIntegrationService } from './DataIntegrationService';
export { default as ocrDataService } from './OCRDataService';

// ===== EXTERNAL DATA SERVICES =====
export { externalAPIsService } from './ExternalAPIsService';
export { default as githubDataService } from './GitHubDataService';
export { default as cloudflareDataService } from './CloudflareDataService';

// ===== INFRASTRUCTURE SERVICES =====
export { default as dataCachingService } from './DataCachingService';
export { default as yearSpecificDataService } from './YearSpecificDataService';
export { default as productionDataManager } from './ProductionDataManager';

// ===== UTILITY SERVICES =====
export { default as dataValidationService } from './DataValidationService';
export { default as dataNormalizationService } from './DataNormalizationService';
export { default as dataAuditService } from './DataAuditService';
export { default as simpleAnomalyDetectionService } from './SimpleAnomalyDetectionService';
export { default as dataSourceIndicatorsService } from './DataSourceIndicatorsService';

// ===== DOMAIN-SPECIFIC SERVICES =====
export { default as carmenScraperService } from './CarmenScraperService';
export { default as officialDocumentService } from './OfficialDocumentService';
export { default as osintDataService } from './OSINTDataService';

// ===== FEATURE SERVICES =====
export { default as documentAnalysisService } from './documentAnalysisService';
export { default as semanticSearchService } from './semanticSearchService';
export { default as advancedSearchService } from './advancedSearchService';
export { default as monitoringService } from './monitoringService';
export { default as openDataService } from './openDataService';
export { default as privacyService } from './privacyService';
export { default as routingService } from './routingService';
export { default as resourceService } from './resourceService';

// ===== LEGACY SERVICES (to be phased out) =====
export { default as unifiedTransparencyService } from './UnifiedTransparencyService';
export { default as masterDataService } from './MasterDataService';

// Note: The following services have been removed as obsolete/duplicate:
// - ComprehensiveDataService (replaced by UnifiedDataService)
// - comprehensiveDataIntegrationService (replaced by DataIntegrationService)
// - EnhancedDataIntegrationService (duplicate)
// - ComprehensiveExternalDataIntegrationService (replaced by ExternalDataAdapter)
// - MultiYearDataService (replaced by YearSpecificDataService)
// - yearDataService (duplicate)
// - dataService (too generic, replaced by specific services)
// - ApiService (obsolete)
// - CachedExternalDataService (replaced by DataCachingService + ExternalDataAdapter)
// - ProxyDataService (not needed)
// - DataSyncService (unused)
// - DataAnonymizationService (not implemented)
// - AuditService (merged with DataAuditService)
