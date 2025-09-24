/**
 * Data Integration Helper for Carmen de Areco Transparency Data
 * This utility helps integrate and migrate between different data loading approaches
 */

import { enhancedUnifiedDataLoader, UnifiedData } from './EnhancedUnifiedDataLoader';

/**
 * Migrate from old unified data loader to enhanced unified data loader
 * This function provides a compatibility layer for existing code
 */
export const migrateToEnhancedLoader = async (year?: number): Promise<UnifiedData> => {
  // For now, we'll directly use the enhanced loader
  // In a real implementation, this might handle migration logic
  return await enhancedUnifiedDataLoader.loadUnifiedData(year);
};

/**
 * Get unified data with better structure and integration
 * This function provides a cleaner interface for accessing all data sources
 */
export const getUnifiedData = async (year?: number): Promise<UnifiedData> => {
  return await enhancedUnifiedDataLoader.loadUnifiedData(year);
};

/**
 * Get structured data specifically for charts and visualizations
 */
export const getStructuredChartData = async (year?: number): Promise<UnifiedData['structured']> => {
  const data = await enhancedUnifiedDataLoader.loadUnifiedData(year);
  return data.structured;
};

/**
 * Get document list with metadata for display
 */
export const getDocumentList = async (year?: number): Promise<UnifiedData['documents']> => {
  const data = await enhancedUnifiedDataLoader.loadUnifiedData(year);
  return data.documents;
};

/**
 * Get metadata about the data sources
 */
export const getDataMetadata = async (year?: number): Promise<UnifiedData['metadata']> => {
  const data = await enhancedUnifiedDataLoader.loadUnifiedData(year);
  return data.metadata;
};

