/**
 * PROXY DATA SERVICE
 * 
 * This service fetches data through the backend proxy server instead of 
 * directly from GitHub raw URLs to avoid CORS issues.
 */

import { GitHubDataResponse } from './GitHubDataService';

export interface ProxyDataResponse {
  success: boolean;
  data: any;
  source: 'proxy' | 'cache';
  lastModified?: string;
  error?: string;
}

class ProxyDataService {
  private static instance: ProxyDataService;
  private cache = new Map<string, { data: any; timestamp: number; etag?: string }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
  private readonly PROXY_BASE_URL = this.getProxyBaseUrl();

  private constructor() {}

  public static getInstance(): ProxyDataService {
    if (!ProxyDataService.instance) {
      ProxyDataService.instance = new ProxyDataService();
    }
    return ProxyDataService.instance;
  }

  /**
   * Determine the proxy base URL based on environment
   */
  private getProxyBaseUrl(): string {
    if (typeof window !== 'undefined') {
      // In browser environment
      const hostname = window.location.hostname;
      
      // For production (cda-transparencia.org) or GitHub Pages
      if (hostname === 'cda-transparencia.org' || hostname.endsWith('github.io')) {
        return 'https://carmen-transparency-proxy.fly.dev'; // Use the Fly.io deployed proxy
      }
      
      // For local development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3002'; // Default proxy port
      }
    }
    
    // Default fallback
    return 'http://localhost:3002';
  }

  /**
   * Get proxy URL for file
   */
  private getProxyUrl(filePath: string): string {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `${this.PROXY_BASE_URL}/api/external/proxy?url=${encodeURIComponent(`https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/${cleanPath}`)}`;
  }

  /**
   * Alternative: Fetch from local data when possible (for deployed site)
   */
  private getLocalUrl(filePath: string): string {
    // For deployed sites, check if the data is available as static assets
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // If it's our deployed site, try to use the path directly
      if (hostname === 'cda-transparencia.org' || hostname.endsWith('github.io')) {
        // Ensure the path starts with / for the deployed site
        return filePath.startsWith('/') ? filePath : `/${filePath}`;
      }
    }
    
    // For development
    return `/src/${filePath}`;
  }

  /**
   * Fetch JSON file through proxy or from local assets
   */
  async fetchJson(filePath: string): Promise<ProxyDataResponse> {
    const cacheKey = `json:${filePath}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`Cache hit for ${filePath}`);
      return {
        success: true,
        data: cached.data,
        source: 'cache'
      };
    }

    try {
      // First try to fetch from local assets (for deployed site)
      let response: Response | null = null;
      let sourceType: 'proxy' | 'local' = 'local';

      // Determine URL based on environment and file path
      let urlToUse = this.getLocalUrl(filePath);
      
      // If it's a consolidated data file, we can try the local path first
      if (filePath.startsWith('data/consolidated/') || 
          filePath.startsWith('data/organized_analysis/')) {
        try {
          console.log(`📥 Attempting to fetch from local assets: ${urlToUse}`);
          response = await fetch(urlToUse);
          
          if (!response.ok) {
            console.log(`Local fetch failed (${response.status}), falling back to proxy`);
            // If local fetch fails, try proxy
            urlToUse = this.getProxyUrl(filePath);
            response = await fetch(urlToUse, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
              }
            });
            sourceType = 'proxy';
          }
        } catch (localError) {
          console.log(`Local fetch error, falling back to proxy:`, localError);
          // Fallback to proxy
          urlToUse = this.getProxyUrl(filePath);
          response = await fetch(urlToUse, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
            }
          });
          sourceType = 'proxy';
        }
      } else {
        // For other files, use proxy directly
        urlToUse = this.getProxyUrl(filePath);
        response = await fetch(urlToUse, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
          }
        });
        sourceType = 'proxy';
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const lastModified = response.headers.get('last-modified') || new Date().toISOString();

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        etag: response.headers.get('etag') || undefined
      });

      return {
        success: true,
        data,
        source: sourceType,
        lastModified
      };

    } catch (error) {
      console.error(`❌ Proxy fetch error for ${filePath}:`, error);

      // Return cached data if available, even if expired
      if (cached) {
        console.log(`📦 Using expired cache for ${filePath}`);
        return {
          success: true,
          data: cached.data,
          source: 'cache'
        };
      }

      return {
        success: false,
        data: null,
        source: 'proxy',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch markdown file through proxy
   */
  async fetchMarkdown(filePath: string): Promise<ProxyDataResponse> {
    const cacheKey = `md:${filePath}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return {
        success: true,
        data: cached.data,
        source: 'cache'
      };
    }

    try {
      const url = this.getProxyUrl(filePath);
      console.log(`📥 Fetching Markdown from proxy: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const lastModified = response.headers.get('last-modified') || new Date().toISOString();

      this.cache.set(cacheKey, {
        data: text,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: text,
        source: 'proxy',
        lastModified
      };

    } catch (error) {
      console.error(`❌ Proxy markdown fetch error for ${filePath}:`, error);

      if (cached) {
        return {
          success: true,
          data: cached.data,
          source: 'cache'
        };
      }

      return {
        success: false,
        data: null,
        source: 'proxy',
        error: (error as Error).message
      };
    }
  }

  /**
   * Load comprehensive data for a specific year using proxy
   */
  async loadYearData(year: number): Promise<ProxyDataResponse> {
    try {
      console.log(`🚀 Loading comprehensive data for year ${year} through proxy`);

      // Try multiple data source patterns to find the right files
      const dataPatterns = [
        // Primary pattern - consolidated data
        {
          budget: `data/consolidated/${year}/budget.json`,
          contracts: `data/consolidated/${year}/contracts.json`,
          salaries: `data/consolidated/${year}/salaries.json`,
          documents: `data/consolidated/${year}/documents.json`,
          treasury: `data/consolidated/${year}/treasury.json`,
          summary: `data/consolidated/${year}/summary.json`
        },
        // Analysis pattern
        {
          budget: `data/organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`,
          contracts: `data/organized_analysis/financial_oversight/contract_monitoring/contracts_data_${year}.json`,
          salaries: `data/organized_analysis/financial_oversight/salary_oversight/salary_data_${year}.json`,
          documents: `data/organized_analysis/document_analysis/documents_data_${year}.json`,
          treasury: `data/organized_analysis/financial_oversight/treasury_monitoring/treasury_data_${year}.json`,
          summary: `data/organized_analysis/financial_oversight/annual_summary_${year}.json`
        }
      ];

      // Try each pattern until we find data
      const consolidatedData: any = {
        year,
        budget: null,
        contracts: [],
        salaries: [],
        documents: [],
        treasury: null,
        debt: null,
        summary: null,
        sources: [],
        lastUpdated: new Date().toISOString()
      };

      let foundData = false;

      for (const pattern of dataPatterns) {
        const fileKeys = Object.keys(pattern) as Array<keyof typeof pattern>;
        const filePromises = fileKeys.map(key => this.fetchJson(pattern[key]));

        try {
          const results = await Promise.allSettled(filePromises);

          // Check if any data was successfully loaded
          const hasSuccess = results.some(result =>
            result.status === 'fulfilled' && result.value.success
          );

          if (hasSuccess) {
            // Process successful results
            results.forEach((result, index) => {
              const key = fileKeys[index];
              if (result.status === 'fulfilled' && result.value.success) {
                const data = result.value.data;
                consolidatedData[key] = data;
                consolidatedData.sources.push(`proxy:${pattern[key]}`);
                foundData = true;
              }
            });

            // If we found data, break out of the loop
            if (foundData) {
              break;
            }
          }
        } catch (patternError) {
          console.warn(`Pattern failed for year ${year}:`, patternError);
          // Continue to next pattern
        }
      }

      // If no data found, try to get from multi-source report as fallback
      if (!foundData) {
        console.log(`No specific year data found for ${year}, trying multi-source report...`);
        const multiSourceResponse = await this.fetchJson('data/multi_source_report.json');

        if (multiSourceResponse.success && multiSourceResponse.data) {
          const multiSourceData = multiSourceResponse.data;

          // Extract year-specific data from multi-source report
          if (multiSourceData.sources) {
            // Budget data
            if (multiSourceData.sources.budget?.structured_data?.[year]) {
              consolidatedData.budget = multiSourceData.sources.budget.structured_data[year];
              foundData = true;
            }

            // Contracts data
            if (multiSourceData.sources.contracts?.structured_data?.[year]) {
              consolidatedData.contracts = multiSourceData.sources.contracts.structured_data[year].contracts || [];
              foundData = true;
            }

            // Salaries data
            if (multiSourceData.sources.salaries?.structured_data?.[year]) {
              consolidatedData.salaries = multiSourceData.sources.salaries.structured_data[year].salaries || [];
              foundData = true;
            }

            // Documents data
            if (multiSourceData.sources.documents?.structured_data?.[year]) {
              consolidatedData.documents = multiSourceData.sources.documents.structured_data[year].documents || [];
              foundData = true;
            }

            // Treasury data
            if (multiSourceData.sources.treasury?.structured_data?.[year]) {
              consolidatedData.treasury = multiSourceData.sources.treasury.structured_data[year];
              foundData = true;
            }

            // Debt data
            if (multiSourceData.sources.debt?.structured_data?.[year]) {
              consolidatedData.debt = multiSourceData.sources.debt.structured_data[year];
              foundData = true;
            }

            consolidatedData.sources.push('proxy:data/multi_source_report.json');
          }

          // Multi-year summary data
          if (multiSourceData.multi_year_summary) {
            const yearSummary = multiSourceData.multi_year_summary.find((y: any) => y.year === year);
            if (yearSummary) {
              consolidatedData.summary = yearSummary;
              foundData = true;
            }
          }
        }
      }

      // If still no data, try to get from comprehensive data index
      if (!foundData) {
        console.log(`No multi-source data for ${year}, trying comprehensive index...`);
        const indexResponse = await this.fetchJson('frontend/src/data/comprehensive_data_index.json');

        if (indexResponse.success && indexResponse.data) {
          const indexData = indexResponse.data;

          // Try to extract year data from comprehensive index
          if (indexData.financial_data?.[year]) {
            consolidatedData.budget = indexData.financial_data[year];
            consolidatedData.sources.push('proxy:frontend/src/data/comprehensive_data_index.json');
            foundData = true;
          }
        }
      }

      return {
        success: foundData,
        data: consolidatedData,
        source: 'proxy',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Failed to load year data for ${year}:`, error);
      return {
        success: false,
        data: null,
        source: 'proxy',
        error: (error as Error).message
      };
    }
  }

  /**
   * Load all available data (multi-year) through proxy
   */
  async loadAllData(): Promise<ProxyDataResponse> {
    try {
      // Get years from the repository index first
      const indexResponse = await this.fetchJson('data/index.json');
      let years = [2020, 2021, 2022, 2023, 2024, 2025];

      if (indexResponse.success) {
        const availableYears = indexResponse.data?.availableYears;
        if (Array.isArray(availableYears) && availableYears.length > 0) {
          years = availableYears;
        }
      }

      const yearDataResults = await Promise.allSettled(
        years.map(year => this.loadYearData(year))
      );

      const allData = {
        byYear: {} as Record<number, any>,
        summary: {
          total_documents: 0,
          years_covered: [] as number[],
          categories: [] as string[],
          audit_completion_rate: 0,
          external_sources_active: 0,
          last_updated: new Date().toISOString()
        },
        external_validation: [],
        metadata: {
          source: 'Proxy Server',
          repository: 'flongstaff/cda-transparencia',
          branch: 'main',
          fetched_at: new Date().toISOString()
        }
      };

      const categoriesSet = new Set<string>();
      let totalDocuments = 0;

      yearDataResults.forEach((result, index) => {
        const year = years[index];

        if (result.status === 'fulfilled' && result.value.success) {
          const yearData = result.value.data;
          allData.byYear[year] = yearData;
          allData.summary.years_covered.push(year);

          if (yearData.documents) {
            totalDocuments += yearData.documents.length;
            yearData.documents.forEach((doc: any) => {
              if (doc.category) categoriesSet.add(doc.category);
            });
          }
        }
      });

      allData.summary.total_documents = totalDocuments;
      allData.summary.categories = Array.from(categoriesSet);
      allData.summary.audit_completion_rate = allData.summary.years_covered.length > 0 ?
        Math.round((allData.summary.years_covered.length / years.length) * 100) : 0;
      allData.summary.external_sources_active = 3; // Proxy + External APIs

      return {
        success: true,
        data: allData,
        source: 'proxy',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to load all data:', error);
      return {
        success: false,
        data: null,
        source: 'proxy',
        error: (error as Error).message
      };
    }
  }

  /**
   * Get available years from repository
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      // Try to fetch the index file first
      const indexResponse = await this.fetchJson('data/consolidated/index.json');
      if (indexResponse.success && indexResponse.data?.availableYears) {
        return indexResponse.data.availableYears;
      }

      // Try to get available years from the multi_source_report.json
      const multiSourceResponse = await this.fetchJson('data/multi_source_report.json');
      if (multiSourceResponse.success && multiSourceResponse.data?.multi_year_summary) {
        return multiSourceResponse.data.multi_year_summary.map((item: any) => item.year).filter((year: number) => year);
      }

      // Default years if index is not available
      return [2020, 2021, 2022, 2023, 2024];
    } catch (error) {
      console.warn('Could not fetch data index, using default years');
      return [2020, 2021, 2022, 2023, 2024];
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Proxy data service cache cleared');
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

export const proxyDataService = ProxyDataService.getInstance();
export default proxyDataService;