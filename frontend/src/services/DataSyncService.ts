
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
      { name: 'local_files', loader: this.syncLocalFiles.bind(this) }
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
    
    // if (!USE_API) { // USE_API is imported from useComprehensiveData
    return {
      source: 'external_apis',
      status: 'failed',
      documents_synced: 0,
      documents_updated: 0,
      documents_failed: 0,
      errors: ['External API synchronization is disabled'],
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
    
    // TODO: Implement proper API sync logic
    /*
    const result = null; // Placeholder for now
    if (!result) {
      throw new Error(`External API sync failed: No data received`);
    }
    
    const errors: string[] = [];
    let documentsSynced = 0;
    const documentsUpdated = 0;
    let documentsFailed = 0;

    if (result.success && result.documents) {
      result.documents.forEach((doc: any) => {
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
    */
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
