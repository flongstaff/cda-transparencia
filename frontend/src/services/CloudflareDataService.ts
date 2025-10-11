/**
 * CLOUDFLARE OPTIMIZED DATA SERVICE
 * 
 * Cloudflare-specific service leveraging Analytics Engine, Durable Objects, 
 * and other Cloudflare features for optimal performance, caching, and analytics.
 */

import { ProxyDataResponse } from './ProxyDataService';

declare global {
  var AnalyticsEngine: any;
  var CACHES: KVNamespace;
}

export interface CloudflareDataResponse {
  success: boolean;
  data: any;
  source: 'cloudflare-cached' | 'cloudflare-worker' | 'direct' | 'fallback';
  lastModified?: string;
  error?: string;
  responseTime?: number;
  cacheHit?: boolean;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  etag?: string;
  expiration: number;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

class CloudflareDataService {
  private static instance: CloudflareDataService;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for most data
  private readonly LONG_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours for static data
  private readonly WORKER_PROXY_URL = this.getWorkerProxyUrl();
  private analytics?: AnalyticsEngine;
  private kvNamespace?: KVNamespace;
  
  private constructor() {
    // Initialize Analytics Engine if available
    if (typeof AnalyticsEngine !== 'undefined') {
      this.analytics = AnalyticsEngine('TRANSPARENCY_ANALYTICS');
    }
  }

  public static getInstance(): CloudflareDataService {
    if (!CloudflareDataService.instance) {
      CloudflareDataService.instance = new CloudflareDataService();
    }
    return CloudflareDataService.instance;
  }

  /**
   * Determine the appropriate Cloudflare worker URL based on environment
   */
  private getWorkerProxyUrl(): string {
    // Use environment variable if available
    if (typeof window !== 'undefined' && process.env.VITE_API_URL) {
      return process.env.VITE_API_URL.replace('/api', ''); // Remove /api suffix to get base URL
    }
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname === 'cda-transparencia.org' || hostname.endsWith('github.io')) {
        // Use the deployed Cloudflare worker
        return 'https://cda-transparencia.flongstaff.workers.dev';
      }
    }
    
    // Fallback for development
    return 'http://localhost:8787'; // Standard local wrangler dev port
  }

  /**
   * Initialize KV Namespace for caching (requires Cloudflare Workers runtime)
   */
  setKVNamespace(kv: KVNamespace) {
    this.kvNamespace = kv;
  }

  /**
   * Get cache key for a file path
   */
  private getCacheKey(filePath: string): string {
    // Create a consistent cache key
    const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `data_cache:${normalizedPath}`;
  }

  /**
   * Try to get data from Cloudflare KV cache
   */
  async getCachedData(cacheKey: string): Promise<CacheEntry | null> {
    if (this.kvNamespace) {
      try {
        const cached = await this.kvNamespace.get(cacheKey, { type: 'json' });
        if (cached) {
          return cached as CacheEntry;
        }
      } catch (error) {
        console.warn('KV cache get failed:', error);
      }
    }
    
    // Fallback to localStorage for dev environment
    if (typeof localStorage !== 'undefined') {
      try {
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          // Check if expired
          if (Date.now() < cached.expiration) {
            return cached;
          } else {
            // Remove expired cache
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (error) {
        console.warn('Local cache get failed:', error);
      }
    }
    
    return null;
  }

  /**
   * Store data in Cloudflare KV cache
   */
  async setCachedData(cacheKey: string, data: any, ttlMs: number = this.CACHE_DURATION): Promise<void> {
    if (this.kvNamespace) {
      try {
        const cacheEntry: CacheEntry = {
          data,
          timestamp: Date.now(),
          expiration: Date.now() + ttlMs
        };
        
        await this.kvNamespace.put(cacheKey, JSON.stringify(cacheEntry), {
          expirationTtl: Math.floor(ttlMs / 1000) // Convert to seconds
        });
        return;
      } catch (error) {
        console.warn('KV cache set failed:', error);
      }
    }
    
    // Fallback to localStorage for dev environment
    if (typeof localStorage !== 'undefined') {
      try {
        const cacheEntry: CacheEntry = {
          data,
          timestamp: Date.now(),
          expiration: Date.now() + ttlMs
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      } catch (error) {
        console.warn('Local cache set failed:', error);
      }
    }
  }

  /**
   * Record analytics event using Cloudflare Analytics Engine
   */
  private recordAnalyticsEvent(event: AnalyticsEvent): void {
    if (this.analytics) {
      try {
        this.analytics.writeDataPoint({
          blobs: [event.event],
          doubles: [event.properties.responseTime || 1],
          indexes: [event.properties.source || 'unknown']
        });
      } catch (error) {
        console.warn('Analytics recording failed:', error);
      }
    }
    
    // Log for debugging in development
    console.log('Analytics event:', event);
  }

  /**
   * Fetch JSON data with Cloudflare optimizations
   */
  async fetchJson(filePath: string): Promise<CloudflareDataResponse> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(filePath);
    
    try {
      // Try to get from cache first
      const cached = await this.getCachedData(cacheKey);
      
      if (cached && Date.now() < cached.expiration) {
        console.log(`Cache hit for ${filePath}`);
        
        const responseTime = Date.now() - startTime;
        this.recordAnalyticsEvent({
          event: 'data_request',
          properties: {
            source: 'cloudflare-cached',
            filePath,
            responseTime,
            cacheHit: true
          },
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          data: cached.data,
          source: 'cloudflare-cached',
          cacheHit: true,
          responseTime
        };
      }

      // If not cached or expired, fetch from worker
      const workerUrl = `${this.WORKER_PROXY_URL}/api/data/${this.extractDataType(filePath)}`;
      console.log(`📥 Fetching from Cloudflare worker: ${workerUrl}`);
      
      const response = await fetch(workerUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Carmen-de-Areco-Transparency-Portal/Cloudflare'
        }
      });

      if (!response.ok) {
        throw new Error(`Worker fetch failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      // Determine appropriate cache TTL based on file type
      const ttl = this.getDataTypeTTL(filePath);
      
      // Store in cache for next time
      await this.setCachedData(cacheKey, data, ttl);
      
      this.recordAnalyticsEvent({
        event: 'data_request',
        properties: {
          source: 'cloudflare-worker',
          filePath,
          responseTime,
          cacheHit: false,
          size: JSON.stringify(data).length
        },
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data,
        source: 'cloudflare-worker',
        cacheHit: false,
        responseTime
      };

    } catch (error) {
      console.error(`❌ Cloudflare fetch error for ${filePath}:`, error);
      
      // Fallback to direct file access (for static assets)
      try {
        console.log(`Fallback to direct access for ${filePath}`);
        const directUrl = this.getDirectUrl(filePath);
        const response = await fetch(directUrl);
        
        if (!response.ok) {
          throw new Error(`Direct access failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        this.recordAnalyticsEvent({
          event: 'data_request',
          properties: {
            source: 'direct',
            filePath,
            responseTime,
            cacheHit: false,
            fallback: true
          },
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          data,
          source: 'direct',
          cacheHit: false,
          responseTime
        };
      } catch (fallbackError) {
        console.error(`❌ Direct access also failed for ${filePath}:`, fallbackError);
        
        // Last resort: try GitHub raw URL (though this might have CORS issues)
        try {
          console.log(`Final fallback to GitHub raw for ${filePath}`);
          const githubUrl = `https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/${filePath.startsWith('/') ? filePath.substring(1) : filePath}`;
          const response = await fetch(githubUrl);
          
          if (!response.ok) {
            throw new Error(`GitHub raw fallback failed: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          const responseTime = Date.now() - startTime;
          
          this.recordAnalyticsEvent({
            event: 'data_request',
            properties: {
              source: 'fallback',
              filePath,
              responseTime,
              cacheHit: false,
              fallback: true,
              finalFallback: true
            },
            timestamp: new Date().toISOString()
          });
          
          return {
            success: true,
            data,
            source: 'fallback',
            cacheHit: false,
            responseTime
          };
        } catch (finalError) {
          console.error(`❌ All methods failed for ${filePath}:`, finalError);
          
          // Return error response
          const responseTime = Date.now() - startTime;
          this.recordAnalyticsEvent({
            event: 'data_request_error',
            properties: {
              filePath,
              responseTime,
              error: finalError.message
            },
            timestamp: new Date().toISOString()
          });
          
          return {
            success: false,
            data: null,
            source: 'fallback',
            error: error.message,
            responseTime
          };
        }
      }
    }
  }

  /**
   * Extract data type from file path for API routing
   */
  private extractDataType(filePath: string): string {
    // Extract data type from path like 'data/consolidated/2024/budget.json' -> 'budget'
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    if (fileName.includes('budget')) return 'budget';
    if (fileName.includes('contracts')) return 'contracts';
    if (fileName.includes('salaries')) return 'salaries';
    if (fileName.includes('documents')) return 'documents';
    if (fileName.includes('treasury')) return 'treasury';
    if (fileName.includes('debt')) return 'debt';
    if (fileName.includes('summary')) return 'summary';
    if (fileName.includes('sitemap')) return 'sitemap';
    if (fileName.includes('main-data')) return 'main-data';
    if (fileName.includes('main')) return 'main'; // Additional check for 'main' in filename
    
    // Default to the second-to-last part as type (for paths like data/consolidated/2024/budget.json)
    return pathParts[pathParts.length - 2] || 'general';
  }

  /**
   * Get direct URL for static assets
   */
  private getDirectUrl(filePath: string): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // For deployed sites, use relative path which will be served from the same domain
      if (hostname === 'cda-transparencia.org' || hostname.endsWith('github.io')) {
        return filePath.startsWith('/') ? filePath : `/${filePath}`;
      }
    }
    
    // For development
    return `/src/${filePath}`;
  }

  /**
   * Determine TTL based on data type
   */
  private getDataTypeTTL(filePath: string): number {
    // Budget and financial data changes less frequently
    if (filePath.includes('budget') || filePath.includes('treasury') || filePath.includes('debt')) {
      return this.LONG_CACHE_DURATION;
    }
    
    // More dynamic data like contracts and personnel
    if (filePath.includes('contracts') || filePath.includes('salaries')) {
      return this.CACHE_DURATION;
    }
    
    // Default TTL
    return this.CACHE_DURATION;
  }

  /**
   * Fetch markdown file with Cloudflare optimizations
   */
  async fetchMarkdown(filePath: string): Promise<CloudflareDataResponse> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(filePath);
    
    try {
      // Try to get from cache first
      const cached = await this.getCachedData(cacheKey);
      
      if (cached && Date.now() < cached.expiration) {
        console.log(`Cache hit for markdown ${filePath}`);
        
        const responseTime = Date.now() - startTime;
        this.recordAnalyticsEvent({
          event: 'markdown_request',
          properties: {
            source: 'cloudflare-cached',
            filePath,
            responseTime,
            cacheHit: true
          },
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          data: cached.data,
          source: 'cloudflare-cached',
          cacheHit: true,
          responseTime
        };
      }

      // Fetch from worker
      const workerUrl = `${this.WORKER_PROXY_URL}/api/external-proxy/${encodeURIComponent(`https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/${filePath.startsWith('/') ? filePath.substring(1) : filePath}`)}`;
      
      const response = await fetch(workerUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'Carmen-de-Areco-Transparency-Portal/Cloudflare'
        }
      });

      if (!response.ok) {
        throw new Error(`Worker markdown fetch failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.text();
      const responseTime = Date.now() - startTime;
      
      // Store in cache for next time (shorter TTL for markdown files)
      await this.setCachedData(cacheKey, data, this.CACHE_DURATION / 2);
      
      this.recordAnalyticsEvent({
        event: 'markdown_request',
        properties: {
          source: 'cloudflare-worker',
          filePath,
          responseTime,
          cacheHit: false
        },
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data,
        source: 'cloudflare-worker',
        cacheHit: false,
        responseTime
      };

    } catch (error) {
      console.error(`❌ Cloudflare markdown fetch error for ${filePath}:`, error);
      
      // Direct access fallback
      try {
        const directUrl = this.getDirectUrl(filePath);
        const response = await fetch(directUrl);
        
        if (!response.ok) {
          throw new Error(`Direct markdown access failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.text();
        const responseTime = Date.now() - startTime;
        
        this.recordAnalyticsEvent({
          event: 'markdown_request',
          properties: {
            source: 'direct',
            filePath,
            responseTime,
            cacheHit: false,
            fallback: true
          },
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          data,
          source: 'direct',
          cacheHit: false,
          responseTime
        };
      } catch (fallbackError) {
        console.error(`❌ Direct markdown access also failed for ${filePath}:`, fallbackError);
        
        const responseTime = Date.now() - startTime;
        this.recordAnalyticsEvent({
          event: 'markdown_request_error',
          properties: {
            filePath,
            responseTime,
            error: fallbackError.message
          },
          timestamp: new Date().toISOString()
        });
        
        return {
          success: false,
          data: null,
          source: 'fallback',
          error: error.message,
          responseTime
        };
      }
    }
  }

  /**
   * Load comprehensive data for a specific year with Cloudflare optimizations
   */
  async loadYearData(year: number): Promise<CloudflareDataResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Loading comprehensive data for year ${year} through Cloudflare service`);

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
                consolidatedData.sources.push(`cloudflare:${pattern[key]}`);
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

            consolidatedData.sources.push('cloudflare:data/multi_source_report.json');
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
            consolidatedData.sources.push('cloudflare:frontend/src/data/comprehensive_data_index.json');
            foundData = true;
          }
        }
      }

      const responseTime = Date.now() - startTime;
      this.recordAnalyticsEvent({
        event: 'year_data_load',
        properties: {
          year,
          sources: consolidatedData.sources.length,
          responseTime,
          success: foundData
        },
        timestamp: new Date().toISOString()
      });

      return {
        success: foundData,
        data: consolidatedData,
        source: 'cloudflare-worker',
        responseTime
      };

    } catch (error) {
      console.error(`❌ Failed to load year data for ${year}:`, error);
      
      const responseTime = Date.now() - startTime;
      this.recordAnalyticsEvent({
        event: 'year_data_load_error',
        properties: {
          year,
          responseTime,
          error: error.message
        },
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        data: null,
        source: 'cloudflare-worker',
        error: (error as Error).message,
        responseTime
      };
    }
  }

  /**
   * Load all available data (multi-year) with Cloudflare optimizations
   */
  async loadAllData(): Promise<CloudflareDataResponse> {
    const startTime = Date.now();
    
    try {
      // Get years from the repository index first
      const indexResponse = await this.fetchJson('data/consolidated/index.json');
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
          source: 'Cloudflare Optimized Service',
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
      allData.summary.external_sources_active = 3; // Cloudflare + External APIs

      const responseTime = Date.now() - startTime;
      this.recordAnalyticsEvent({
        event: 'all_data_load',
        properties: {
          years: years.length,
          responseTime,
          success: true
        },
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: allData,
        source: 'cloudflare-worker',
        responseTime
      };

    } catch (error) {
      console.error('❌ Failed to load all data:', error);
      
      const responseTime = Date.now() - startTime;
      this.recordAnalyticsEvent({
        event: 'all_data_load_error',
        properties: {
          responseTime,
          error: error.message
        },
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        data: null,
        source: 'cloudflare-worker',
        error: (error as Error).message,
        responseTime
      };
    }
  }

  /**
   * Get available years from repository with caching
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      // Try to fetch the index file first (with caching)
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
      return [2020, 2021, 2022, 2023, 2024, 2025];
    } catch (error) {
      console.warn('Could not fetch data index, using default years');
      return [2020, 2021, 2022, 2023, 2024, 2025];
    }
  }

  /**
   * Invalidate cache for a specific file path
   */
  async invalidateCache(filePath: string): Promise<void> {
    const cacheKey = this.getCacheKey(filePath);
    
    if (this.kvNamespace) {
      try {
        await this.kvNamespace.delete(cacheKey);
        console.log(`✅ Cache invalidated for ${filePath}`);
        return;
      } catch (error) {
        console.warn('KV cache invalidation failed:', error);
      }
    }
    
    // Fallback: try localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(cacheKey);
        console.log(`✅ Local cache invalidated for ${filePath}`);
      } catch (error) {
        console.warn('Local cache invalidation failed:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<Record<string, any>> {
    try {
      // This is a simplified version - actual implementation would depend on KV namespace features
      return {
        service: 'Cloudflare Data Service',
        cacheEnabled: !!this.kvNamespace || typeof localStorage !== 'undefined',
        kvNamespace: !!this.kvNamespace,
        localStorage: typeof localStorage !== 'undefined',
        analyticsEnabled: !!this.analytics
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { error: error.message };
    }
  }
}

export const cloudflareDataService = CloudflareDataService.getInstance();
export default cloudflareDataService;