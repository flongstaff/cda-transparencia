/**
 * Unified Transparency Service - Single point of access for all transparency data
 * Combines data fetching, auditing, and optimization for production use
 */

import DataService from './dataService';
import AuditService from './AuditService';
import EnhancedDataService from './EnhancedDataService';
import externalAPIsService from "./ExternalDataAdapter";

// Unified interfaces
export interface UnifiedTransparencyData {
  // Financial data by year
  financialData: {
    [year: number]: {
      budget: any;
      contracts: any[];
      salaries: any[];
      treasury: any;
      debt: any;
      documents: any[];
    };
  };
  
  // Audit information
  audit: {
    discrepancies: any[];
    summary: any;
    flags: any[];
    external_datasets: any[];
  };
  
  // Documents across all years
  documents: {
    all: any[];
    byYear: Record<number, any[]>;
    byCategory: Record<string, any[]>;
    byType: Record<string, any[]>;
  };
  
  // Metadata and status
  metadata: {
    last_updated: string;
    total_documents: number;
    available_years: number[];
    categories: string[];
    data_sources_active: number;
    coverage_percentage: number;
  };
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

class UnifiedTransparencyService {
  private static instance: UnifiedTransparencyService;
  private cache = new Map<string, { data: any; timestamp: number; expires: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly LONG_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  public static getInstance(): UnifiedTransparencyService {
    if (!UnifiedTransparencyService.instance) {
      UnifiedTransparencyService.instance = new UnifiedTransparencyService();
    }
    return UnifiedTransparencyService.instance;
  }

  /**
   * Get comprehensive transparency data for a specific year or all years
   */
  public async getTransparencyData(targetYear?: number): Promise<UnifiedTransparencyData> {
    try {
      const cacheKey = targetYear ? `transparency-data-${targetYear}` : 'transparency-data-all';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() < cached.expires) {
        console.log(`Cache hit for ${cacheKey}`);
        return cached.data;
      }

      // Show loading state
      const loadingData: UnifiedTransparencyData = {
        financialData: {},
        audit: {
          discrepancies: [],
          summary: {},
          flags: [],
          external_datasets: []
        },
        documents: {
          all: [],
          byYear: {},
          byCategory: {},
          byType: {}
        },
        metadata: {
          last_updated: new Date().toISOString(),
          total_documents: 0,
          available_years: [],
          categories: [],
          data_sources_active: 0,
          coverage_percentage: 0
        },
        loading: true,
          error: null
      };

      // Fetch all required data in parallel
      const [
        allYearsData,
        auditResults,
        auditSummary,
        dataFlags,
        externalDatasets,
        documentsData,
        externalData
      ] = await Promise.all([
        EnhancedDataService.getAllYears(),
        AuditService.getAuditResults(),
        AuditService.getAuditSummary(),
        AuditService.getDataFlags(),
        AuditService.getExternalDatasets(),
        this.fetchAllDocuments(),
        externalAPIsService.loadAllExternalData().catch(() => ({ 
          carmenDeAreco: { success: false, data: null },
          buenosAires: { success: false, data: null },
          nationalBudget: { success: false, data: null },
          geographic: { success: false, data: null },
          comparative: [],
          civilSociety: [],
          summary: { total_sources: 0, successful_sources: 0, failed_sources: 0, cache_hits: 0, last_updated: new Date().toISOString() }
        }))
      ]);

      // Process financial data by year
      const financialData: { [year: number]: any } = {};
      const availableYears: number[] = [];
      
      for (const yearData of allYearsData) {
        const year = yearData.year;
        availableYears.push(year);
        
        // Skip if we're filtering by a specific year
        if (targetYear && year !== targetYear) {
          continue;
        }
        
        // Fetch detailed data for this year
        const [
          budgetData,
          contractsData,
          salariesData,
          treasuryData,
          debtData,
          yearDocuments
        ] = await Promise.all([
          EnhancedDataService.getBudget(year),
          EnhancedDataService.getContracts(year),
          EnhancedDataService.getSalaries(year),
          EnhancedDataService.getTreasury(year),
          EnhancedDataService.getDebt(year),
          EnhancedDataService.getDocuments(year)
        ]);
        
        financialData[year] = {
          budget: budgetData,
          contracts: contractsData,
          salaries: salariesData,
          treasury: treasuryData,
          debt: debtData,
          documents: yearDocuments
        };
      }
      
      // If no years were found in allYearsData, try to get data for the target year directly
      if (Object.keys(financialData).length === 0 && targetYear) {
        const [
          budgetData,
          contractsData,
          salariesData,
          treasuryData,
          debtData,
          yearDocuments
        ] = await Promise.all([
          EnhancedDataService.getBudget(targetYear),
          EnhancedDataService.getContracts(targetYear),
          EnhancedDataService.getSalaries(targetYear),
          EnhancedDataService.getTreasury(targetYear),
          EnhancedDataService.getDebt(targetYear),
          EnhancedDataService.getDocuments(targetYear)
        ]);
        
        financialData[targetYear] = {
          budget: budgetData,
          contracts: contractsData,
          salaries: salariesData,
          treasury: treasuryData,
          debt: debtData,
          documents: yearDocuments
        };
        availableYears.push(targetYear);
      }

      // Process documents for indexing
      const documentsByYear: Record<number, any[]> = {};
      const documentsByCategory: Record<string, any[]> = {};
      const documentsByType: Record<string, any[]> = {};
      
      // Process all documents
      for (const doc of documentsData) {
        const year = doc.year || new Date().getFullYear();
        const category = doc.category || 'general';
        const type = doc.type || 'unknown';
        
        // By year
        if (!documentsByYear[year]) documentsByYear[year] = [];
        documentsByYear[year].push(doc);
        
        // By category
        if (!documentsByCategory[category]) documentsByCategory[category] = [];
        documentsByCategory[category].push(doc);
        
        // By type
        if (!documentsByType[type]) documentsByType[type] = [];
        documentsByType[type].push(doc);
      }

      // Integrate external data to enhance audit capabilities
      const integratedExternalDatasets = [
        ...externalDatasets,
        ...(externalData.carmenDeAreco.success ? [{ source: 'Carmen de Areco', data: externalData.carmenDeAreco.data }] : []),
        ...(externalData.buenosAires.success ? [{ source: 'Buenos Aires Province', data: externalData.buenosAires.data }] : []),
        ...(externalData.nationalBudget.success ? [{ source: 'National Budget', data: externalData.nationalBudget.data }] : [])
      ];

      // Create final unified data structure
      const unifiedData: UnifiedTransparencyData = {
        financialData,
        audit: {
          discrepancies: auditResults,
          summary: {
            ...auditSummary,
            external_sources: integratedExternalDatasets.length,
            comparative_municipalities: externalData.comparative.filter((comp: any) => comp.success).length,
            civil_society_sources: externalData.civilSociety.filter((org: any) => org.success).length,
          },
          flags: dataFlags,
          external_datasets: integratedExternalDatasets
        },
        documents: {
          all: documentsData,
          byYear: documentsByYear,
          byCategory: documentsByCategory,
          byType: documentsByType
        },
        metadata: {
          last_updated: new Date().toISOString(),
          total_documents: documentsData.length,
          available_years: availableYears,
          categories: Object.keys(documentsByCategory),
          data_sources_active: 5 + externalData.summary.successful_sources, // Include external sources
          coverage_percentage: Math.round((availableYears.length / 8) * 100) // 2018-2025 = 8 years
        },
        loading: false,
        error: null
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: unifiedData,
        timestamp: Date.now(),
        expires: Date.now() + (targetYear ? this.CACHE_DURATION : this.LONG_CACHE_DURATION)
      });

      return unifiedData;
    } catch (error) {
      console.error('Error getting transparency data:', error);
      
      // Return error state
      return {
        financialData: {},
        audit: {
          discrepancies: [],
          summary: {},
          flags: [],
          external_datasets: []
        },
        documents: {
          all: [],
          byYear: {},
          byCategory: {},
          byType: {}
        },
        metadata: {
          last_updated: new Date().toISOString(),
          total_documents: 0,
          available_years: [],
          categories: [],
          data_sources_active: 0,
          coverage_percentage: 0
        },
        loading: false,
        error: (error as Error).message || 'Failed to load transparency data'
      };
    }
  }

  /**
   * Get audit-specific data with external validation
   */
  public async getAuditData(): Promise<any> {
    const cacheKey = 'audit-data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }

    try {
      const [
        discrepancies,
        summary,
        flags,
        externalDatasets,
        externalData
      ] = await Promise.all([
        AuditService.getAuditResults(),
        AuditService.getAuditSummary(),
        AuditService.getDataFlags(),
        AuditService.getExternalDatasets(),
        externalAPIsService.loadAllExternalData().catch(() => ({ 
          carmenDeAreco: { success: false, data: null },
          buenosAires: { success: false, data: null },
          nationalBudget: { success: false, data: null },
          geographic: { success: false, data: null },
          comparative: [],
          civilSociety: [],
          summary: { total_sources: 0, successful_sources: 0, failed_sources: 0, cache_hits: 0, last_updated: new Date().toISOString() }
        }))
      ]);

      const integratedExternalDatasets = [
        ...externalDatasets,
        ...(externalData.carmenDeAreco.success ? [{ source: 'Carmen de Areco', data: externalData.carmenDeAreco.data }] : []),
        ...(externalData.buenosAires.success ? [{ source: 'Buenos Aires Province', data: externalData.buenosAires.data }] : []),
        ...(externalData.nationalBudget.success ? [{ source: 'National Budget', data: externalData.nationalBudget.data }] : [])
      ];

      const auditData = {
        discrepancies,
        summary: {
          ...summary,
          external_sources: integratedExternalDatasets.length,
          comparative_municipalities: externalData.comparative.filter((comp: any) => comp.success).length,
          civil_society_sources: externalData.civilSociety.filter((org: any) => org.success).length,
        },
        flags,
        external_datasets: integratedExternalDatasets,
        last_updated: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: auditData,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return auditData;
    } catch (error) {
      console.error('Error getting audit data:', error);
      return {
        discrepancies: [],
        summary: {},
        flags: [],
        external_datasets: [],
        error: (error as Error).message
      };
    }
  }

  /**
   * Get documents with advanced filtering and search
   */
  public async getDocuments(filters?: {
    year?: number;
    category?: string;
    type?: string;
    search?: string;
  }): Promise<any[]> {
    try {
      const allDocuments = await this.fetchAllDocuments();
      let filteredDocuments = [...allDocuments];

      // Apply filters
      if (filters?.year) {
        filteredDocuments = filteredDocuments.filter(doc => doc.year === filters.year);
      }
      
      if (filters?.category) {
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.category?.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }
      
      if (filters?.type) {
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.type?.toLowerCase().includes(filters.type!.toLowerCase())
        );
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.title?.toLowerCase().includes(searchTerm) ||
          doc.filename?.toLowerCase().includes(searchTerm) ||
          doc.description?.toLowerCase().includes(searchTerm)
        );
      }

      return filteredDocuments;
    } catch (error) {
      console.error('Error getting filtered documents:', error);
      return [];
    }
  }

  /**
   * Prefetch data for better performance
   */
  public async prefetchData(): Promise<void> {
    try {
      console.log('Prefetching transparency data...');
      
      // Start fetching data without waiting for results
      const prefetchPromises = [
        this.getTransparencyData(),
        this.getAuditData(),
        EnhancedDataService.getAllYears(),
        this.fetchAllDocuments()
      ];

      // Wait for all prefetch operations to complete
      await Promise.all(prefetchPromises);
      
      console.log('Prefetching completed');
    } catch (error) {
      console.error('Error during prefetch:', error);
    }
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.cache.clear();
    EnhancedDataService.clearCache();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): any {
    return {
      unified_service: {
        size: this.cache.size,
        keys: Array.from(this.cache.keys())
      },
      enhanced_data_service: EnhancedDataService.getCacheStats()
    };
  }

  // Private helper methods
  
  private async fetchAllDocuments(): Promise<any[]> {
    try {
      // Try to get from the comprehensive data index in frontend/src/data first
      const comprehensiveIndex = await EnhancedDataService.fetchJson<any>(
        '/data/comprehensive_data_index.json',
        'comprehensive-data-index'
      );
      
      if (comprehensiveIndex && Array.isArray(comprehensiveIndex.documents)) {
        return comprehensiveIndex.documents;
      }
      
      // Try to get from organized documents
      try {
        const organizedIndex = await EnhancedDataService.fetchJson<any>(
          '/data/organized_documents/json/comprehensive_data_index.json',
          'organized-comprehensive-data-index'
        );
        
        if (organizedIndex?.documents?.carmen_export?.documents) {
          return organizedIndex.documents.carmen_export.documents;
        }
      } catch (orgIndexError) {
        console.warn('Organized comprehensive data index not available:', orgIndexError);
      }
      
      // Fallback to multi-source report
      const multiSourceReport = await EnhancedDataService.fetchJson<any>(
        '/data/multi_source_report.json',
        'multi-source-report'
      );
      
      if (multiSourceReport?.sources) {
        const allDocuments: any[] = [];
        Object.values(multiSourceReport.sources).forEach((source: any) => {
          if (source.documents && Array.isArray(source.documents)) {
            allDocuments.push(...source.documents);
          }
        });
        return allDocuments;
      }
      
      // Fallback to data index files
      const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
      const documents: any[] = [];
      
      for (const year of years) {
        try {
          const yearDocuments = await EnhancedDataService.getDocuments(year);
          if (Array.isArray(yearDocuments)) {
            documents.push(...yearDocuments);
          }
        } catch (yearError) {
          console.warn(`Could not fetch documents for year ${year}:`, yearError);
          continue;
        }
      }
      
      // If we still don't have documents, try to get from the data index files directly
      if (documents.length === 0) {
        for (const year of years) {
          try {
            const dataIndex = await EnhancedDataService.fetchJson<any>(
              `/data/organized_documents/json/data_index_${year}.json`,
              `data-index-${year}`
            );
            
            if (dataIndex && dataIndex.data_sources) {
              // Extract documents from different data source categories
              Object.values(dataIndex.data_sources).forEach((source: any) => {
                if (source.documents) {
                  if (Array.isArray(source.documents)) {
                    documents.push(...source.documents.map(doc => ({...doc, year})));
                  } else if (typeof source === 'object' && source.document) {
                    documents.push({...source, year});
                  }
                }
              });
            }
          } catch (indexError) {
            console.warn(`Could not fetch data index for year ${year}:`, indexError);
            continue;
          }
        }
      }
      
      return documents;
    } catch (error) {
      console.error('Error fetching all documents:', error);
      return [];
    }
  }
}

export default UnifiedTransparencyService.getInstance();

// Export individual services for backward compatibility
export { dataService, AuditService, EnhancedDataService };