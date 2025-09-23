import { filterDocumentsByYear } from './documentProcessor';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';

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

export interface MultiSourceData {
  sources?: Record<string, any>;
  external_apis?: {
    web_sources?: any;
    multi_source?: any;
  };
  financial?: any;
  governance?: any;
  analysis?: any;
  metadata?: {
    total_documents?: number;
  };
}

export interface StructuredData {
  budget: Record<string, any> | null;
  debt: Record<string, any> | null;
  salaries: Record<string, any> | null;
  audit: Record<string, any> | null;
  financial: Record<string, any> | null;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  filename: string;
  size_mb: number;
  url: string;
  year: number;
  verified: boolean;
  processing_date: string;
  integrity_verified: boolean;
  source: string;
}

export interface UnifiedData {
  multi_source: MultiSourceData | null;
  structured: StructuredData;
  documents: Document[];
  metadata: {
    last_updated: string;
    data_sources: number;
    total_documents: number;
    year_coverage: number[];
  };
}

// Main data loader that integrates all official processed local/GitHub files with online external resources
export class UnifiedDataLoader {
  private static instance: UnifiedDataLoader;
  private cache = new Map<string, { data: UnifiedData; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): UnifiedDataLoader {
    if (!UnifiedDataLoader.instance) {
      UnifiedDataLoader.instance = new UnifiedDataLoader();
    }
    return UnifiedDataLoader.instance;
  }

  // Main data loading method that integrates all sources
  public async loadUnifiedData(year?: number): Promise<UnifiedData> {
    const cacheKey = `unified-${year || 'all'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Load all data sources concurrently
      const [
        multiSourceData,
        organizedData,
        externalApiData,
        githubData,
        localData
      ] = await Promise.allSettled([
        this.loadMultiSourceReport(),
        this.loadOrganizedData(),
        this.loadExternalApiData(),
        this.loadGitHubData(),
        this.loadLocalData(year) // Pass year parameter
      ]);

      // Process and merge all data sources
      const processedData = this.processDataSources({
        multiSource: multiSourceData.status === 'fulfilled' ? multiSourceData.value : null,
        organized: organizedData.status === 'fulfilled' ? organizedData.value : null,
        externalApi: externalApiData.status === 'fulfilled' ? externalApiData.value : null,
        github: githubData.status === 'fulfilled' ? githubData.value : null,
        local: localData.status === 'fulfilled' ? localData.value : null
      });

      // Apply year filter if specified
      if (year) {
        processedData.documents = filterDocumentsByYear(processedData.documents, year);
        processedData.metadata.total_documents = processedData.documents.length;
      }

      // Cache the result
      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() });

      return processedData;
    } catch (error) {
      console.error('Error loading unified data:', error);
      throw error;
    }
  }

  // Load multi-source report (main hub)
  private async loadMultiSourceReport(): Promise<MultiSourceData | null> {
    try {
      const data = await fetchGitHubJson('/data/multi_source_report.json');
      if (data) {
        return {
          ...data,
          source: 'multi_source_report',
          last_updated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Multi-source report not available:', error);
    }
    return null;
  }

  // Load organized data (structured JSON files)
  private async loadOrganizedData(): Promise<{ structured: StructuredData; documents: Document[] }> {
    const structuredData: StructuredData = {
      budget: null,
      debt: null,
      salaries: null,
      audit: null,
      financial: null
    };

    const documents: Document[] = [];

    try {
      // Load budget data
      structuredData.budget = await fetchGitHubJson('/data/organized_documents/json/budget_data.json');
    } catch (error) {
      console.warn('Budget data not available:', error);
    }

    try {
      // Load debt data
      structuredData.debt = await fetchGitHubJson('/data/organized_documents/json/debt_data.json');
    } catch (error) {
      console.warn('Debt data not available:', error);
    }

    try {
      // Load salary data
      structuredData.salaries = await fetchGitHubJson('/data/organized_documents/json/salary_data.json');
    } catch (error) {
      console.warn('Salary data not available:', error);
    }

    try {
      // Load audit data
      structuredData.audit = await fetchGitHubJson('/data/organized_documents/json/audit_data.json');
    } catch (error) {
      console.warn('Audit data not available:', error);
    }

    try {
      // Load financial overview
      structuredData.financial = await fetchGitHubJson('/data/organized_documents/json/financial_overview.json');
    } catch (error) {
      console.warn('Financial overview not available:', error);
    }

    try {
      // Load detailed inventory
      const inventory = await fetchGitHubJson('/data/organized_analysis/detailed_inventory.json');
      if (inventory && inventory.documents) {
        documents.push(...inventory.documents.map((doc: any) => ({
          ...doc,
          source: 'organized_inventory',
          verified: true,
          processing_date: new Date().toISOString()
        })));
      }
    } catch (error) {
      console.warn('Detailed inventory not available:', error);
    }

    return {
      structured: structuredData,
      documents,
      source: 'organized_data',
      last_updated: new Date().toISOString()
    };
  }

  // Load external API data
  private async loadExternalApiData(): Promise<MultiSourceData | null> {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/transparency';
    const USE_API = import.meta.env.VITE_USE_API === 'true';

    if (!USE_API) {
      return null;
    }

    try {
      // Assuming /data/dashboard is an API endpoint, not a static JSON file on GitHub
      // If it's a static JSON, use fetchGitHubJson('/data/dashboard.json')
      const response = await fetch(`${API_BASE}/data/dashboard`); 
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return {
            ...result.data,
            source: 'external_api',
            last_updated: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.warn('External API not available:', error);
    }
    return null;
  }

  // Load GitHub repository data
  private async loadGitHubData(): Promise<MultiSourceData | null> {
    try {
      // Load comprehensive data index directly using fetchGitHubJson
      const data = await fetchGitHubJson('/frontend/src/data/comprehensive_data_index.json');
      if (data) {
        return {
          comprehensive: data,
          source: 'github_repository',
          last_updated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('GitHub data not available:', error);
    }
    return null;
  }

  // Load local data files
  private async loadLocalData(year: number): Promise<{ documents: Document[] }> { // Accept year parameter
    const documents: Document[] = [];

    try {
      // Load local data index
      const dataIndex = await fetchGitHubJson(`/data/data_index_${year}.json`); // Use year parameter
      if (dataIndex) {
        // Process documents from data index
        if (dataIndex.data_sources) {
          Object.entries(dataIndex.data_sources).forEach(([category, categoryData]: [string, any]) => {
            if (categoryData.documents && Array.isArray(categoryData.documents)) {
              documents.push(...categoryData.documents.map((doc: any) => ({
                ...doc,
                category,
                source: 'local_data_index',
                verified: true,
                processing_date: new Date().toISOString()
              })));
            }
          });
        }
      }
    } catch (error) {
      console.warn('Local data index not available:', error);
    }

    return {
      documents,
      source: 'local_files',
      last_updated: new Date().toISOString()
    };
  }

  // Process and merge all data sources
  private processDataSources(sources: {
    multiSource: MultiSourceData | null;
    organized: { structured: StructuredData; documents: Document[] } | null;
    externalApi: MultiSourceData | null;
    github: MultiSourceData | null;
    local: { documents: Document[] } | null;
  }): UnifiedData {
    const allDocuments: Document[] = [];
    const allStructuredData: StructuredData = {
      budget: null,
      debt: null,
      salaries: null,
      audit: null,
      financial: null
    };

    // Process multi-source report documents
    if (sources.multiSource?.sources) {
      Object.entries(sources.multiSource.sources).forEach(([sourceType, sourceData]: [string, any]) => {
        if (sourceData.documents && Array.isArray(sourceData.documents)) {
          allDocuments.push(...sourceData.documents.map((doc: any) => ({
            ...doc,
            source: 'multi_source',
            source_type: sourceType,
            verified: true,
            processing_date: new Date().toISOString()
          })));
        }
      });
    }

    // Process organized data
    if (sources.organized) {
      // Add structured data
      Object.assign(allStructuredData, sources.organized.structured);

      // Add organized documents
      allDocuments.push(...sources.organized.documents);
    }

    // Process external API data
    if (sources.externalApi) {
      // Add external API documents
      if (sources.externalApi.documents) {
        allDocuments.push(...sources.externalApi.documents.map((doc: any) => ({
          ...doc,
          source: 'external_api',
          verified: true,
          processing_date: new Date().toISOString()
        })));
      }

      // Merge structured data
      if (sources.externalApi.financial) {
        Object.assign(allStructuredData, sources.externalApi.financial);
      }
    }

    // Process GitHub data
    if (sources.github) {
      // Add GitHub documents
      if (sources.github.documents) {
        allDocuments.push(...sources.github.documents.map((doc: any) => ({
          ...doc,
          source: 'github_repository',
          verified: true,
          processing_date: new Date().toISOString()
        })));
      }

      // Add year-specific data
      if (sources.github.year_specific) {
        Object.assign(allStructuredData, sources.github.year_specific);
      }
    }

    // Process local data
    if (sources.local) {
      // Add local documents
      allDocuments.push(...sources.local.documents);
    }

    // Remove duplicates and ensure all documents have required fields
    const uniqueDocuments = this.deduplicateDocuments(allDocuments);

    // Calculate metadata
    const metadata = {
      last_updated: new Date().toISOString(),
      data_sources: Object.values(sources).filter(s => s !== null).length,
      total_documents: uniqueDocuments.length,
      year_coverage: this.getAllYears(uniqueDocuments)
    };

    return {
      multi_source: sources.multiSource,
      structured: allStructuredData,
      documents: uniqueDocuments,
      metadata
    };
  }

  // Remove duplicate documents
  private deduplicateDocuments(documents: Document[]): Document[] {
    const seen = new Set();
    return documents.filter(doc => {
      const key = `${doc.title || doc.filename || doc.id}-${doc.category || 'general'}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Get all years covered by documents
  private getAllYears(documents: Document[]): number[] {
    const years = new Set<number>();
    documents.forEach(doc => {
      if (doc.year) {
        years.add(doc.year);
      } else if (doc.processing_date) {
        const year = new Date(doc.processing_date).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort();
  }

  // Clear cache
  public clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const unifiedDataLoader = UnifiedDataLoader.getInstance();
