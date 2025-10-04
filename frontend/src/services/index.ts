/**
 * Services Index - Export all services for easy importing
 * Provides unified access to all data services in the application
 */

// Main data services
export { default as dataService, productionDataService } from './dataService';
export { default as EnhancedDataService } from './EnhancedDataService';
export { default as githubDataService } from './GitHubDataService';
export { default as externalAPIsService } from "./ExternalDataAdapter";
export { default as AuditService } from './AuditService';
export { default as masterDataService } from './MasterDataService';
export { default as RealDataService, realDataService } from './RealDataService';
export { dataSyncService } from './DataSyncService';
export { default as UnifiedTransparencyService } from './UnifiedTransparencyService';

// Service interfaces and types
export type { 
  UnifiedTransparencyData 
} from './UnifiedTransparencyService';
export type { 
  ExternalDataResponse, 
  DataSource 
} from "./ExternalDataAdapter";
export type { 
  GitHubDataResponse, 
  RepositoryConfig 
} from './GitHubDataService';
export type { 
  SyncResult, 
  SyncReport 
} from './DataSyncService';
export type { 
  Document, 
  UnifiedDataState 
} from './MasterDataService';
export type { 
  RealDataResponse, 
  RealDataSources 
} from './RealDataService';