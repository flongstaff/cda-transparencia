
import { githubDataService } from './GitHubDataService';
import externalAPIsService from "./ExternalDataAdapter";

export interface SyncResult {
  source: string;
  status: 'success' | 'failed' | 'partial';
  documents_synced: number;
  documents_updated: number;
  documents_failed: number;
  errors: string[];
  duration: number;
  timestamp: string;
}

export interface SyncReport {
  total_sources: number;
  successful_sources: number;
  failed_sources: number;
  partial_sources: number;
  total_documents: number;
  documents_synced: number;
  documents_updated: number;
  documents_failed: number;
  sync_rate: number;
  results: SyncResult[];
  start_time: string;
  end_time: string;
  duration: number;
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';
const GITHUB_API_BASE = 'https://api.github.com/repositories/1031806468/contents';

// Available data paths from the repository
export const GITHUB_DATA_PATHS = {
  // Core data files
  dataInventory: '/data/data_inventory.json',
  multiSourceReport: '/data/multi_source_report.json',

  // Document inventory
  documentInventory: '/data/organized_documents/document_inventory.json',
  completeFileInventory: '/data/organized_documents/complete_file_inventory.csv',
  inventorySummary: '/data/organized_documents/inventory_summary.json',

  // Analysis data
  detailedInventory: '/data/organized_analysis/detailed_inventory.json',
  analysisSummary: '/data/organized_analysis/inventory_summary.json',

  // Financial data
  budgetAnalysis: '/data/organized_analysis/financial_oversight/budget_analysis',
  debtMonitoring: '/data/organized_analysis/financial_oversight/debt_monitoring',
  salaryOversight: '/data/organized_analysis/financial_oversight/salary_oversight',

  // Year-based documents (2000-2025)
  yearlyDocuments: (year: number) => `/data/organized_documents/${year}`,

  // Validation reports
  validationReports: '/data/validation_reports'
};

async function fetchGitHubJson(relativePath: string): Promise<any | null> {
  try {
    const url = `${GITHUB_RAW_BASE}${relativePath}`;
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      console.warn(`Failed to fetch GitHub JSON from ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.warn(`Error fetching GitHub JSON from ${relativePath}:`, error);
    return null;
  }
}

async function fetchGitHubAPI(path: string): Promise<any | null> {
  try {
    const url = `${GITHUB_API_BASE}${path}`;
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      console.warn(`Failed to fetch from GitHub API ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.warn(`Error fetching from GitHub API ${path}:`, error);
    return null;
  }
}

export class DataSyncService {
  private static instance: DataSyncService;
  private syncHistory: SyncReport[] = [];

  private constructor() {}

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  // Synchronize all data sources
  public async synchronizeAllSources(): Promise<SyncReport> {
    const startTime = Date.now();
    const sources = [
      { name: 'multi_source_report', loader: this.syncMultiSourceReport.bind(this) },
      { name: 'organized_data', loader: this.syncOrganizedData.bind(this) },
      { name: 'external_apis', loader: this.syncExternalApis.bind(this) },
      { name: 'github_repository', loader: this.syncGitHubRepository.bind(this) },
      { name: 'local_files', loader: this.syncLocalFiles.bind(this) },
      { name: 'carmen_de_areco_data', loader: this.syncCarmenDeArecoData.bind(this) },
      { name: 'buenos_aires_data', loader: this.syncBuenosAiresData.bind(this) },
      { name: 'national_data', loader: this.syncNationalData.bind(this) },
      { name: 'civil_society_data', loader: this.syncCivilSocietyData.bind(this) }
    ];

    const results: SyncResult[] = [];
    let totalDocuments = 0;
    let documentsSynced = 0;
    let documentsUpdated = 0;
    let documentsFailed = 0;
    let successfulSources = 0;
    let failedSources = 0;
    let partialSources = 0;

    // Sync each source
    for (const source of sources) {
      try {
        const result = await source.loader();
        results.push(result);
        totalDocuments += result.documents_synced + result.documents_updated;
        documentsSynced += result.documents_synced;
        documentsUpdated += result.documents_updated;
        documentsFailed += result.documents_failed;

        if (result.status === 'success') {
          successfulSources++;
        } else if (result.status === 'failed') {
          failedSources++;
        } else {
          partialSources++;
        }
      } catch (error) {
        console.error(`Error syncing source ${source.name}:`, error);
        results.push({
          source: source.name,
          status: 'failed',
          documents_synced: 0,
          documents_updated: 0,
          documents_failed: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          duration: 0,
          timestamp: new Date().toISOString()
        });
        failedSources++;
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    const report: SyncReport = {
      total_sources: sources.length,
      successful_sources: successfulSources,
      failed_sources: failedSources,
      partial_sources: partialSources,
      total_documents: totalDocuments,
      documents_synced: documentsSynced,
      documents_updated: documentsUpdated,
      documents_failed: documentsFailed,
      sync_rate: totalDocuments > 0 ? ((documentsSynced + documentsUpdated) / totalDocuments) * 100 : 0,
      results,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      duration
    };

    // Store in history
    this.syncHistory.push(report);

    return report;
  }

  // Sync multi-source report
  private async syncMultiSourceReport(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Load multi-source report
      const data = await fetchGitHubJson('/data/multi_source_report.json');
      if (!data) {
        throw new Error('Failed to load multi-source report');
      }
      
      // Process documents
      if (data.sources) {
        Object.entries(data.sources).forEach(([sourceType, sourceData]: [string, any]) => {
          if (sourceData.documents && Array.isArray(sourceData.documents)) {
            sourceData.documents.forEach((doc: any) => {
              try {
                // Count documents
                if (doc && doc.id) {
                  documentsSynced++;
                }
              } catch (error) {
                errors.push(`Document processing failed: ${doc.title}`);
                documentsFailed++;
              }
            });
          }
        });
      }

      return {
        source: 'multi_source_report',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'multi_source_report',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Sync organized data
  private async syncOrganizedData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Load organized data files
      const dataFiles = [
        '/data/organized_documents/json/budget_data.json',
        '/data/organized_documents/json/debt_data.json',
        '/data/organized_documents/json/salary_data.json',
        '/data/organized_documents/json/audit_data.json',
        '/data/organized_documents/json/financial_overview.json'
      ];

      for (const file of dataFiles) {
        try {
          const data = await fetchGitHubJson(file); // Use fetchGitHubJson
          if (data) { // Check if data was successfully fetched
            // Process documents from organized data
            if (Array.isArray(data.documents)) { // Check if it's an array
              data.documents.forEach((doc: any) => {
                try {
                  // Count document
                  if (doc && doc.id) {
                    documentsSynced++;
                  } else {
                    documentsFailed++;
                  }
                } catch (error) {
                  errors.push(`Document verification failed: ${doc.title}`);
                  documentsFailed++;
                }
              });
            }
          } else {
            errors.push(`Failed to load ${file}: Data not found or error during fetch`);
          }
        } catch (error) {
          errors.push(`Failed to load ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        source: 'organized_data',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'organized_data',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Sync external APIs
  private async syncExternalApis(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Get data from external APIs service
      const externalResults = await externalAPIsService.loadAllExternalData();
      
      // Process Carmen de Areco data
      if (externalResults.carmenDeAreco.success && externalResults.carmenDeAreco.data) {
        const cdaData = externalResults.carmenDeAreco.data;
        if (cdaData.links && Array.isArray(cdaData.links)) {
          documentsSynced += cdaData.links.length;
        }
      } else {
        errors.push('Carmen de Areco data sync failed');
        documentsFailed++;
      }
      
      // Process Buenos Aires Province data
      if (externalResults.buenosAires.success && externalResults.buenosAires.data) {
        const gbaData = externalResults.buenosAires.data;
        if (gbaData.links && Array.isArray(gbaData.links)) {
          documentsSynced += gbaData.links.length;
        }
      } else {
        errors.push('Buenos Aires Province data sync failed');
        documentsFailed++;
      }
      
      // Process National budget data
      if (externalResults.nationalBudget.success && externalResults.nationalBudget.data) {
        const natData = externalResults.nationalBudget.data;
        if (natData.result?.results) {
          documentsSynced += natData.result.results.length;
        }
      } else {
        errors.push('National data sync failed');
        documentsFailed++;
      }

      // Process comparative data
      for (const comp of externalResults.comparative) {
        if (comp.success) {
          documentsSynced++;
        } else {
          documentsFailed++;
        }
      }

      // Process civil society data
      for (const org of externalResults.civilSociety) {
        if (org.success) {
          documentsSynced++;
        } else {
          documentsFailed++;
        }
      }

      return {
        source: 'external_apis',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'external_apis',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Sync GitHub repository
  private async syncGitHubRepository(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Sync with GitHub repository
      const files = [
        '/frontend/src/data/comprehensive_data_index.json', // Use relative path for fetchGitHubJson
        '/data/multi_source_report.json',
        '/data/organized_analysis/detailed_inventory.json'
      ];

      for (const file of files) {
        try {
          const data = await fetchGitHubJson(file); // Use fetchGitHubJson
          if (data) { // Check if data was successfully fetched
            // Process documents from GitHub data
            if (Array.isArray(data.documents)) { // Check if it's an array
              data.documents.forEach((doc: any) => {
                try {
                  // Count document
                  if (doc && doc.id) {
                    documentsSynced++;
                  } else {
                    documentsFailed++;
                  }
                } catch (error) {
                  errors.push(`Document verification failed: ${doc.title}`);
                  documentsFailed++;
                }
              });
            }
          } else {
            errors.push(`Failed to sync GitHub file ${file}: Data not found or error during fetch`);
          }
        } catch (error) {
          errors.push(`Failed to sync GitHub file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        source: 'github_repository',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'github_repository',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Sync local files
  private async syncLocalFiles(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Sync local data files
      const localFiles = [
        `/data/data_index_${new Date().getFullYear()}.json`,
        '/data/markdown_documents/index.json',
        '/data/organized_pdfs/inventory.json'
      ];

      for (const file of localFiles) {
        try {
          const data = await fetchGitHubJson(file); // Use fetchGitHubJson
          if (data) { // Check if data was successfully fetched
                        // Process documents from local files
                        if (data.data_sources && typeof data.data_sources === 'object') { // Check if it's an object
                          Object.entries(data.data_sources).forEach(([category, categoryData]: [string, any]) => {
                            if (categoryData.documents && Array.isArray(categoryData.documents)) {
                              categoryData.documents.forEach((doc: any) => {
                                try {
                                  // Count document
                                  if (doc && doc.id) {
                                    documentsSynced++;
                                  } else {
                                    documentsFailed++;
                                  }
                                } catch (error) {
                                  errors.push(`Document verification failed: ${doc.title}`);
                                  documentsFailed++;
                                }
                              });
                            }
                          });
                        }          } else {
            errors.push(`Failed to sync local file ${file}: Data not found or error during fetch`);
          }
        } catch (error) {
          errors.push(`Failed to sync local file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        source: 'local_files',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'local_files',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Sync Carmen de Areco specific data
  private async syncCarmenDeArecoData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Get Carmen de Areco specific data from external APIs
      const cdaSpecificData = await externalAPIsService.getCarmenDeArecoSpecificData();
      
      // Process each data type
      if (cdaSpecificData.budget.success) {
        documentsSynced++;
      } else {
        errors.push('Carmen de Areco budget data sync failed');
        documentsFailed++;
      }
      
      if (cdaSpecificData.contracts.success) {
        documentsSynced++;
      } else {
        errors.push('Carmen de Areco contracts data sync failed');
        documentsFailed++;
      }
      
      if (cdaSpecificData.declarations.success) {
        documentsSynced++;
      } else {
        errors.push('Carmen de Areco declarations data sync failed');
        documentsFailed++;
      }
      
      if (cdaSpecificData.ordinances.success) {
        documentsSynced++;
      } else {
        errors.push('Carmen de Areco ordinances data sync failed');
        documentsFailed++;
      }
      
      if (cdaSpecificData.official_bulletin.success) {
        documentsSynced++;
      } else {
        errors.push('Carmen de Areco official bulletin data sync failed');
        documentsFailed++;
      }

      return {
        source: 'carmen_de_areco_data',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'carmen_de_areco_data',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Sync Buenos Aires Province data
  private async syncBuenosAiresData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Attempt to sync with Buenos Aires Province data sources
      const gbaResults = await fetchGitHubJson('/data/gba_transparency_data.json');
      
      if (gbaResults) {
        // Process GBA data if available locally
        if (Array.isArray(gbaResults.documents)) {
          documentsSynced += gbaResults.documents.length;
        }
      } else {
        // If no local data, try external APIs
        const externalResults = await externalAPIsService.loadAllExternalData();
        if (externalResults.buenosAires.success) {
          documentsSynced++;
        } else {
          errors.push('Buenos Aires Province data sync failed');
          documentsFailed++;
        }
      }

      return {
        source: 'buenos_aires_data',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'buenos_aires_data',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Sync National data
  private async syncNationalData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Attempt to sync with national data sources
      const nationalResults = await externalAPIsService.loadAllExternalData();
      
      if (nationalResults.nationalBudget.success) {
        documentsSynced++;
      } else {
        errors.push('National budget data sync failed');
        documentsFailed++;
      }
      
      if (nationalResults.geographic.success) {
        documentsSynced++;
      } else {
        errors.push('National geographic data sync failed');
        documentsFailed++;
      }

      return {
        source: 'national_data',
        status: errors.length === 0 ? 'success' : 'partial',
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'national_data',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Sync Civil Society data
  private async syncCivilSocietyData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    try {
      // Attempt to sync with civil society sources
      const civilSocietyResults = await externalAPIsService.getCivilSocietyData();
      
      for (const org of civilSocietyResults) {
        if (org.success) {
          documentsSynced++;
        } else {
          documentsFailed++;
        }
      }

      return {
        source: 'civil_society_data',
        status: 'success', // All organizations are attempted, so we consider it success regardless of individual failures
        documents_synced: documentsSynced,
        documents_updated: documentsUpdated,
        documents_failed: documentsFailed,
        errors: [],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'civil_society_data',
        status: 'failed',
        documents_synced: 0,
        documents_updated: 0,
        documents_failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get sync history
  public getSyncHistory(): SyncReport[] {
    return this.syncHistory;
  }

  // Get latest sync report
  public getLatestSyncReport(): SyncReport | null {
    return this.syncHistory.length > 0 ? this.syncHistory[this.syncHistory.length - 1] : null;
  }

  // Clear sync history
  public clearSyncHistory() {
    this.syncHistory = [];
  }

  // New methods for comprehensive data access
  public async getDocumentInventory(): Promise<any | null> {
    return await fetchGitHubJson(GITHUB_DATA_PATHS.documentInventory);
  }

  public async getDataInventory(): Promise<any | null> {
    return await fetchGitHubJson(GITHUB_DATA_PATHS.dataInventory);
  }

  public async getMultiSourceReport(): Promise<any | null> {
    return await fetchGitHubJson(GITHUB_DATA_PATHS.multiSourceReport);
  }

  public async getYearlyDocuments(year: number): Promise<any | null> {
    const path = GITHUB_DATA_PATHS.yearlyDocuments(year);
    return await fetchGitHubAPI(path);
  }

  public async getAnalysisSummary(): Promise<any | null> {
    return await fetchGitHubJson(GITHUB_DATA_PATHS.analysisSummary);
  }

  public async getInventorySummary(): Promise<any | null> {
    return await fetchGitHubJson(GITHUB_DATA_PATHS.inventorySummary);
  }

  // Get all available years with documents
  public async getAvailableYears(): Promise<number[]> {
    try {
      const documentsDir = await fetchGitHubAPI('/data/organized_documents');
      if (documentsDir && Array.isArray(documentsDir)) {
        const years = documentsDir
          .filter((item: any) => item.type === 'dir' && /^\d{4}$/.test(item.name))
          .map((item: any) => parseInt(item.name))
          .sort((a: number, b: number) => b - a); // Sort descending (newest first)
        return years;
      }
      return [];
    } catch (error) {
      console.warn('Error fetching available years:', error);
      return [];
    }
  }

  // Get comprehensive data for a specific year
  public async getComprehensiveYearData(year: number): Promise<any> {
    try {
      const [
        documents,
        inventory,
        multiSource,
        analysis
      ] = await Promise.all([
        this.getYearlyDocuments(year),
        this.getDocumentInventory(),
        this.getMultiSourceReport(),
        this.getAnalysisSummary()
      ]);

      return {
        year,
        documents,
        inventory: inventory?.filter?.((doc: any) => doc.year === year) || [],
        multiSource,
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching comprehensive data for year ${year}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const dataSyncService = DataSyncService.getInstance();
