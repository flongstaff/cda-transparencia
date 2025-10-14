/**
 * DATA SOURCE INTEGRATION
 *
 * Unified system for fetching data from multiple sources:
 * 1. Local OCR-extracted data (DocStrange processed PDFs)
 * 2. Consolidated JSON files
 * 3. External APIs (RAFAM, GBA, AFIP, etc.)
 * 4. Backend processing results
 *
 * Works seamlessly in both local development and production
 */

import { dataPathResolver } from '../config/dataPathConfig';
import { externalAPIsService } from './ExternalDataAdapter';
import smartDataLoader from './SmartDataLoader';
import dataCachingService from './DataCachingService';

export interface DataSourceResult {
  success: boolean;
  data: any;
  source: 'local' | 'ocr' | 'external' | 'backend';
  timestamp: string;
  cached: boolean;
  metadata?: {
    processingMethod?: string;
    extractionDate?: string;
    dataQuality?: 'high' | 'medium' | 'low';
  };
}

export interface IntegrationOptions {
  preferLocal?: boolean;
  includeExternal?: boolean;
  useCache?: boolean;
  timeout?: number;
}

class DataSourceIntegration {
  private static instance: DataSourceIntegration;
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  private constructor() {}

  public static getInstance(): DataSourceIntegration {
    if (!DataSourceIntegration.instance) {
      DataSourceIntegration.instance = new DataSourceIntegration();
    }
    return DataSourceIntegration.instance;
  }

  /**
   * Get budget data from all available sources
   */
  public async getBudgetData(year: number, options: IntegrationOptions = {}): Promise<DataSourceResult[]> {
    const results: DataSourceResult[] = [];

    // 1. Try consolidated JSON (primary source)
    try {
      const consolidatedPath = dataPathResolver.getConsolidatedPath(year, 'budget.json');
      const data = await smartDataLoader.load(consolidatedPath);

      if (data) {
        results.push({
          success: true,
          data,
          source: 'local',
          timestamp: new Date().toISOString(),
          cached: true,
          metadata: { dataQuality: 'high' }
        });
      }
    } catch (error) {
      console.warn('[DATA INTEGRATION] Consolidated budget not found:', error);
    }

    // 2. Try OCR-extracted data
    try {
      const ocrData = await this.getOCRBudgetData(year);
      if (ocrData.success) {
        results.push(ocrData);
      }
    } catch (error) {
      console.warn('[DATA INTEGRATION] OCR budget not found:', error);
    }

    // 3. Try external APIs (if enabled)
    if (options.includeExternal !== false) {
      try {
        const externalData = await this.getExternalBudgetData(year);
        if (externalData.success) {
          results.push(externalData);
        }
      } catch (error) {
        console.warn('[DATA INTEGRATION] External budget data unavailable:', error);
      }
    }

    return results;
  }

  /**
   * Get OCR-extracted budget data
   */
  private async getOCRBudgetData(year: number): Promise<DataSourceResult> {
    // Load OCR extraction index
    const indexPath = dataPathResolver.getOCRIndex();
    const index = await smartDataLoader.load(indexPath);

    if (!index || !index.extractions) {
      return {
        success: false,
        data: null,
        source: 'ocr',
        timestamp: new Date().toISOString(),
        cached: false
      };
    }

    // Find budget-related extractions
    const budgetExtractions = index.extractions.filter((ext: any) =>
      ext.file_name.toLowerCase().includes('presupuesto') ||
      ext.file_name.toLowerCase().includes('budget') ||
      ext.file_name.toLowerCase().includes('ejecucion')
    );

    if (budgetExtractions.length === 0) {
      return {
        success: false,
        data: null,
        source: 'ocr',
        timestamp: new Date().toISOString(),
        cached: false
      };
    }

    // Load the most recent extraction
    const latestExtraction = budgetExtractions[0];
    const ocrPath = dataPathResolver.getOCRPath(latestExtraction.url.split('/').pop());
    const ocrData = await smartDataLoader.load(ocrPath);

    return {
      success: true,
      data: ocrData,
      source: 'ocr',
      timestamp: latestExtraction.extraction_timestamp,
      cached: true,
      metadata: {
        processingMethod: latestExtraction.processing_method || 'docstrange',
        extractionDate: latestExtraction.extraction_timestamp,
        dataQuality: latestExtraction.structured_data_available ? 'high' : 'medium'
      }
    };
  }

  /**
   * Get external budget data from APIs
   */
  private async getExternalBudgetData(year: number): Promise<DataSourceResult> {
    try {
      // Fetch from RAFAM (Provincial budget system)
      const rafamData = await externalAPIsService.getRAFAMData('270', year);

      return {
        success: rafamData.success,
        data: rafamData.data,
        source: 'external',
        timestamp: rafamData.timestamp,
        cached: rafamData.cached,
        metadata: {
          dataQuality: 'medium'
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'external',
        timestamp: new Date().toISOString(),
        cached: false
      };
    }
  }

  /**
   * Get treasury/financial data
   */
  public async getTreasuryData(year: number, options: IntegrationOptions = {}): Promise<DataSourceResult[]> {
    const results: DataSourceResult[] = [];

    // 1. Consolidated JSON
    try {
      const path = dataPathResolver.getConsolidatedPath(year, 'treasury.json');
      const data = await smartDataLoader.load(path);

      if (data) {
        results.push({
          success: true,
          data,
          source: 'local',
          timestamp: new Date().toISOString(),
          cached: true,
          metadata: { dataQuality: 'high' }
        });
      }
    } catch (error) {
      console.warn('[DATA INTEGRATION] Consolidated treasury not found');
    }

    // 2. OCR data from financial reports
    try {
      const ocrData = await this.getOCRFinancialData(year, 'recursos');
      if (ocrData.success) {
        results.push(ocrData);
      }
    } catch (error) {
      console.warn('[DATA INTEGRATION] OCR treasury not found');
    }

    return results;
  }

  /**
   * Get OCR-extracted financial data by type
   */
  private async getOCRFinancialData(year: number, type: string): Promise<DataSourceResult> {
    const indexPath = dataPathResolver.getOCRIndex();
    const index = await smartDataLoader.load(indexPath);

    if (!index || !index.extractions) {
      return {
        success: false,
        data: null,
        source: 'ocr',
        timestamp: new Date().toISOString(),
        cached: false
      };
    }

    // Find relevant extractions
    const extractions = index.extractions.filter((ext: any) =>
      ext.file_name.toLowerCase().includes(type.toLowerCase())
    );

    if (extractions.length === 0) {
      return {
        success: false,
        data: null,
        source: 'ocr',
        timestamp: new Date().toISOString(),
        cached: false
      };
    }

    const extraction = extractions[0];
    const ocrPath = dataPathResolver.getOCRPath(extraction.url.split('/').pop());
    const data = await smartDataLoader.load(ocrPath);

    return {
      success: true,
      data,
      source: 'ocr',
      timestamp: extraction.extraction_timestamp,
      cached: true,
      metadata: {
        processingMethod: extraction.processing_method,
        extractionDate: extraction.extraction_timestamp,
        dataQuality: extraction.structured_data_available ? 'high' : 'medium'
      }
    };
  }

  /**
   * Get all available OCR extractions
   */
  public async getAllOCRExtractions(): Promise<any[]> {
    try {
      const indexPath = dataPathResolver.getOCRIndex();
      const index = await smartDataLoader.load(indexPath);
      return index?.extractions || [];
    } catch (error) {
      console.error('[DATA INTEGRATION] Failed to load OCR index:', error);
      return [];
    }
  }

  /**
   * Merge data from multiple sources with priority
   */
  public mergeDataSources(results: DataSourceResult[]): any {
    if (results.length === 0) return null;

    // Priority order: local > ocr > external
    const priorityOrder = ['local', 'ocr', 'external', 'backend'];

    const sortedResults = results
      .filter(r => r.success)
      .sort((a, b) => {
        return priorityOrder.indexOf(a.source) - priorityOrder.indexOf(b.source);
      });

    if (sortedResults.length === 0) return null;

    // Use primary source as base
    const primaryData = sortedResults[0].data;

    // Enrich with data from other sources
    const enrichedData = {
      ...primaryData,
      _metadata: {
        primarySource: sortedResults[0].source,
        sources: sortedResults.map(r => ({
          type: r.source,
          timestamp: r.timestamp,
          quality: r.metadata?.dataQuality
        })),
        lastUpdated: new Date().toISOString()
      }
    };

    return enrichedData;
  }

  /**
   * Check data availability for a year
   */
  public async checkDataAvailability(year: number): Promise<{
    consolidated: boolean;
    ocr: boolean;
    external: boolean;
  }> {
    const availability = {
      consolidated: false,
      ocr: false,
      external: false
    };

    // Check consolidated
    try {
      const path = dataPathResolver.getConsolidatedPath(year, 'summary.json');
      const data = await smartDataLoader.load(path);
      availability.consolidated = !!data;
    } catch (error) {
      // Not available
    }

    // Check OCR
    try {
      const extractions = await this.getAllOCRExtractions();
      availability.ocr = extractions.length > 0;
    } catch (error) {
      // Not available
    }

    // Check external
    try {
      const rafam = await externalAPIsService.getRAFAMData('270', year);
      availability.external = rafam.success;
    } catch (error) {
      // Not available
    }

    return availability;
  }

  /**
   * Prefetch all data for a year
   */
  public async prefetchYearData(year: number): Promise<void> {
    console.log(`[DATA INTEGRATION] Prefetching data for year ${year}`);

    const prefetchPromises = [
      // Consolidated data
      smartDataLoader.load(dataPathResolver.getConsolidatedPath(year, 'budget.json')),
      smartDataLoader.load(dataPathResolver.getConsolidatedPath(year, 'treasury.json')),
      smartDataLoader.load(dataPathResolver.getConsolidatedPath(year, 'expenses.json')),
      smartDataLoader.load(dataPathResolver.getConsolidatedPath(year, 'summary.json')),

      // OCR index
      smartDataLoader.load(dataPathResolver.getOCRIndex()),
    ];

    await Promise.allSettled(prefetchPromises);
    console.log(`[DATA INTEGRATION] Prefetch completed for year ${year}`);
  }
}

export const dataSourceIntegration = DataSourceIntegration.getInstance();
export default dataSourceIntegration;
