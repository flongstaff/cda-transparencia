/**
 * OPTIMIZED DATA SERVICE
 *
 * Efficiently loads only the data needed for specific components
 * Uses consolidated datasets and avoids loading unnecessary data
 * Designed for low resource usage and fast page loads
 */

import githubDataService from './GitHubDataService';
import externalAPIsService from './ExternalDataAdapter';
import type { GitHubDataResponse } from './GitHubDataService';

export interface OptimizedDataResponse {
  success: boolean;
  data: any;
  source: 'github' | 'external' | 'consolidated' | 'cache';
  dataType: 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget';
  lastModified?: string;
  error?: string;
}

export interface DataRequest {
  year: number;
  dataType: 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget';
  componentType?: string; // e.g., 'chart', 'table', 'gallery', 'viewer'
  specificFields?: string[]; // Only load specific fields if needed
}

class OptimizedDataService {
  private static instance: OptimizedDataService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

  private constructor() {}

  public static getInstance(): OptimizedDataService {
    if (!OptimizedDataService.instance) {
      OptimizedDataService.instance = new OptimizedDataService();
    }
    return OptimizedDataService.instance;
  }

  /**
   * Load data optimized for a specific component
   */
  async loadData(request: DataRequest): Promise<OptimizedDataResponse> {
    const cacheKey = `optimized:${request.year}:${request.dataType}:${request.componentType || 'generic'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`📦 Using cached optimized data for ${request.dataType} (${request.year})`);
      return {
        success: true,
        data: cached.data,
        source: 'cache',
        dataType: request.dataType
      };
    }

    try {
      console.log(`🚀 Loading optimized data for ${request.dataType} (${request.year})...`);

      // First, try to get data from the consolidated year data
      const consolidatedResponse = await githubDataService.loadYearData(request.year);
      
      if (consolidatedResponse.success && consolidatedResponse.data) {
        const consolidatedData = consolidatedResponse.data;
        let extractedData: any = null;
        const source = 'consolidated';

        // Extract only the specific data type needed
        switch (request.dataType) {
          case 'budget':
            extractedData = consolidatedData.financial_overview || consolidatedData.budget || null;
            break;
            
          case 'financial':
            // For financial data, combine budget, treasury, and debt
            extractedData = {
              budget: consolidatedData.budget || null,
              treasury: consolidatedData.treasury || null,
              debt: consolidatedData.debt || null
            };
            break;
            
          case 'contracts':
            extractedData = consolidatedData.contracts || [];
            break;
            
          case 'salaries':
            extractedData = consolidatedData.salaries || [];
            break;
            
          case 'documents':
            extractedData = consolidatedData.documents || [];
            break;
            
          case 'treasury':
            extractedData = consolidatedData.treasury || null;
            break;
            
          case 'debt':
            extractedData = consolidatedData.debt || null;
            break;
        }

        // If we found the specific data type, return it
        if (extractedData) {
          this.cache.set(cacheKey, {
            data: extractedData,
            timestamp: Date.now()
          });

          return {
            success: true,
            data: extractedData,
            source: 'consolidated',
            dataType: request.dataType,
            lastModified: consolidatedResponse.lastModified
          };
        }
      }

      // If consolidated data didn't have what we need, try specific files
      const specificData = await this.loadSpecificDataType(request);
      
      if (specificData.success) {
        this.cache.set(cacheKey, {
          data: specificData.data,
          timestamp: Date.now()
        });

        return {
          success: true,
          data: specificData.data,
          source: specificData.source,
          dataType: request.dataType,
          lastModified: specificData.lastModified
        };
      }

      // If all else fails, try external APIs
      const externalData = await this.loadExternalDataType(request);
      
      if (externalData.success) {
        this.cache.set(cacheKey, {
          data: externalData.data,
          timestamp: Date.now()
        });

        return {
          success: true,
          data: externalData.data,
          source: 'external',
          dataType: request.dataType,
          lastModified: externalData.lastModified
        };
      }

      // No data found
      return {
        success: false,
        data: null,
        source: 'github',
        dataType: request.dataType,
        error: 'No data found for requested type and year'
      };

    } catch (error) {
      console.error(`❌ Error loading optimized data for ${request.dataType} (${request.year}):`, error);

      // Return cached data if available, even if expired
      if (cached) {
        console.log(`📦 Using expired cache for ${request.dataType} (${request.year})`);
        return {
          success: true,
          data: cached.data,
          source: 'cache',
          dataType: request.dataType
        };
      }

      return {
        success: false,
        data: null,
        source: 'github',
        dataType: request.dataType,
        error: (error as Error).message
      };
    }
  }

  /**
   * Load specific data type from individual files
   */
  private async loadSpecificDataType(request: DataRequest): Promise<OptimizedDataResponse> {
    try {
      let filePath = '';
      
      // Determine the file path based on data type
      switch (request.dataType) {
        case 'budget':
          filePath = `data/consolidated/${request.year}/budget.json`;
          break;
          
        case 'contracts':
          filePath = `data/consolidated/${request.year}/contracts.json`;
          break;
          
        case 'salaries':
          filePath = `data/consolidated/${request.year}/salaries.json`;
          break;
          
        case 'documents':
          filePath = `data/consolidated/${request.year}/documents.json`;
          break;
          
        case 'treasury':
          filePath = `data/consolidated/${request.year}/treasury.json`;
          break;
          
        case 'debt':
          filePath = `data/consolidated/${request.year}/debt.json`;
          break;
          
        case 'financial':
          // For financial data, we'll load the summary which contains all financial info
          filePath = `data/consolidated/${request.year}/summary.json`;
          break;
          
        default:
          throw new Error(`Unsupported data type: ${request.dataType}`);
      }

      const response = await githubDataService.fetchJson(filePath);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          source: 'github',
          dataType: request.dataType,
          lastModified: response.lastModified
        };
      } else {
        throw new Error(`Failed to load ${filePath}: ${response.error}`);
      }

    } catch (error) {
      console.warn(`⚠️ Specific data type loading failed for ${request.dataType}:`, error);
      return {
        success: false,
        data: null,
        source: 'github',
        dataType: request.dataType,
        error: (error as Error).message
      };
    }
  }

  /**
   * Load data from external APIs
   */
  private async loadExternalDataType(request: DataRequest): Promise<OptimizedDataResponse> {
    try {
      console.log(`🌐 Loading external data for ${request.dataType} (${request.year})...`);

      let externalData: any = null;

      switch (request.dataType) {
        case 'budget':
        case 'financial': {
          // Try Carmen de Areco data
          const carmenResponse = await externalAPIsService.getCarmenDeArecoData();
          if (carmenResponse.success) {
            externalData = carmenResponse.data;
          }
          break;
        }
          
        case 'contracts': {
          // Try contracts data
          const contractsResponse = await externalAPIsService.getContractData();
          if (contractsResponse.success) {
            externalData = contractsResponse.data;
          }
          break;
        }
          
        case 'salaries': {
          // Try salary data
          const salariesResponse = await externalAPIsService.getSalaryData();
          if (salariesResponse.success) {
            externalData = salariesResponse.data;
          }
          break;
        }
          
        case 'documents': {
          // Try document data
          const documentsResponse = await externalAPIsService.getDocumentData();
          if (documentsResponse.success) {
            externalData = documentsResponse.data;
          }
          break;
        }
          
        case 'treasury': {
          // Try treasury data
          const treasuryResponse = await externalAPIsService.getTreasuryData();
          if (treasuryResponse.success) {
            externalData = treasuryResponse.data;
          }
          break;
        }
          
        case 'debt': {
          // Try debt data
          const debtResponse = await externalAPIsService.getDebtData();
          if (debtResponse.success) {
            externalData = debtResponse.data;
          }
          break;
        }
      }

      if (externalData) {
        return {
          success: true,
          data: externalData,
          source: 'external',
          dataType: request.dataType,
          lastModified: new Date().toISOString()
        };
      } else {
        throw new Error('No external data available');
      }

    } catch (error) {
      console.warn(`⚠️ External data loading failed for ${request.dataType}:`, error);
      return {
        success: false,
        data: null,
        source: 'external',
        dataType: request.dataType,
        error: (error as Error).message
      };
    }
  }

  /**
   * Load data for a specific chart component
   */
  async loadChartData(chartType: string, year: number, options?: { 
    specificFields?: string[]; 
    aggregation?: 'sum' | 'average' | 'count' 
  }): Promise<OptimizedDataResponse> {
    const request: DataRequest = {
      year,
      dataType: this.getChartDataType(chartType),
      componentType: 'chart',
      specificFields: options?.specificFields
    };

    return this.loadData(request);
  }

  /**
   * Load data for a specific table component
   */
  async loadTableData(tableType: string, year: number, options?: { 
    specificFields?: string[]; 
    pageSize?: number; 
    pageNumber?: number 
  }): Promise<OptimizedDataResponse> {
    const request: DataRequest = {
      year,
      dataType: this.getTableDataType(tableType),
      componentType: 'table',
      specificFields: options?.specificFields
    };

    return this.loadData(request);
  }

  /**
   * Load data for a specific gallery component
   */
  async loadGalleryData(galleryType: string, year: number, options?: { 
    maxItems?: number; 
    categories?: string[] 
  }): Promise<OptimizedDataResponse> {
    const request: DataRequest = {
      year,
      dataType: this.getGalleryDataType(galleryType),
      componentType: 'gallery'
    };

    return this.loadData(request);
  }

  /**
   * Load data for a specific viewer component
   */
  async loadViewerData(viewerType: string, year: number, options?: { 
    searchQuery?: string; 
    filters?: Record<string, any> 
  }): Promise<OptimizedDataResponse> {
    const request: DataRequest = {
      year,
      dataType: this.getViewerDataType(viewerType),
      componentType: 'viewer'
    };

    return this.loadData(request);
  }

  /**
   * Helper methods to map component types to data types
   */
  private getChartDataType(chartType: string): 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget' {
    const chartTypeMap: Record<string, 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget'> = {
      'budget-execution': 'budget',
      'budget-analysis': 'budget',
      'debt-report': 'debt',
      'treasury-analysis': 'treasury',
      'contracts-analysis': 'contracts',
      'salary-analysis': 'salaries',
      'document-analysis': 'documents',
      'financial-overview': 'financial',
      'revenue-sources': 'financial',
      'expenditure-report': 'financial',
      'fiscal-balance': 'financial'
    };
    
    return chartTypeMap[chartType] || 'financial';
  }

  private getTableDataType(tableType: string): 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget' {
    const tableTypeMap: Record<string, 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget'> = {
      'budget-execution-table': 'budget',
      'contracts-table': 'contracts',
      'salaries-table': 'salaries',
      'documents-table': 'documents',
      'treasury-table': 'treasury',
      'debt-table': 'debt'
    };
    
    return tableTypeMap[tableType] || 'financial';
  }

  private getGalleryDataType(galleryType: string): 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget' {
    const galleryTypeMap: Record<string, 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget'> = {
      'documents-gallery': 'documents',
      'pdf-gallery': 'documents',
      'reports-gallery': 'documents'
    };
    
    return galleryTypeMap[galleryType] || 'documents';
  }

  private getViewerDataType(viewerType: string): 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget' {
    const viewerTypeMap: Record<string, 'financial' | 'documents' | 'contracts' | 'salaries' | 'treasury' | 'debt' | 'budget'> = {
      'data-viewer': 'financial',
      'document-viewer': 'documents',
      'pdf-viewer': 'documents'
    };
    
    return viewerTypeMap[viewerType] || 'financial';
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Optimized data service cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      lastCleared: new Date().toISOString()
    };
  }
}

export const optimizedDataService = OptimizedDataService.getInstance();
export default optimizedDataService;