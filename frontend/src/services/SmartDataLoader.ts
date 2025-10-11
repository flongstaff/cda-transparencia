/**
 * Smart Data Loader
 *
 * Implements intelligent data loading with:
 * - On-demand fetching (only load what's needed)
 * - Shared cache across pages
 * - Progressive loading for large datasets
 * - Background prefetching of likely-needed data
 * - IndexedDB persistence for offline support
 */

import dataCachingService from './DataCachingService';

export interface LoadingPriority {
  immediate: string[]; // Load right now
  high: string[]; // Load after immediate
  low: string[]; // Prefetch in background
}

export interface DataRequest {
  sourceId: string;
  params?: Record<string, any>;
  priority: 'immediate' | 'high' | 'low';
  sourceType?: string;
}

export interface LoaderStats {
  requestsInFlight: number;
  queuedRequests: number;
  cacheHitRate: number;
  bytesLoaded: number;
  requestsCompleted: number;
}

class SmartDataLoader {
  private static instance: SmartDataLoader;
  private requestQueue: Map<string, DataRequest[]> = new Map();
  private activeRequests: Set<string> = new Set();
  private db: IDBDatabase | null = null;
  private readonly MAX_CONCURRENT_REQUESTS = 6;
  private readonly DB_NAME = 'cda-transparency-cache';
  private readonly DB_VERSION = 1;
  private stats: LoaderStats = {
    requestsInFlight: 0,
    queuedRequests: 0,
    cacheHitRate: 0,
    bytesLoaded: 0,
    requestsCompleted: 0
  };

  private constructor() {
    this.initializeDB();
  }

  public static getInstance(): SmartDataLoader {
    if (!SmartDataLoader.instance) {
      SmartDataLoader.instance = new SmartDataLoader();
    }
    return SmartDataLoader.instance;
  }

  /**
   * Initialize IndexedDB for persistent caching
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[SMART LOADER] IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('data-cache')) {
          const store = db.createObjectStore('data-cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('sourceType', 'sourceType', { unique: false });
        }
      };
    });
  }

  /**
   * Load data with intelligent caching and prioritization
   */
  public async load<T = any>(
    sourceId: string,
    params?: Record<string, any>,
    options?: {
      priority?: 'immediate' | 'high' | 'low';
      sourceType?: string;
      forceRefresh?: boolean;
    }
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey(sourceId, params);
    const priority = options?.priority || 'immediate';
    const sourceType = options?.sourceType || 'general';

    // Check memory cache first
    if (!options?.forceRefresh) {
      const memoryCache = dataCachingService.get(sourceId, params);
      if (memoryCache) {
        console.log(`[SMART LOADER] Memory cache hit: ${cacheKey}`);
        return memoryCache;
      }

      // Check IndexedDB cache
      const dbCache = await this.getFromDB(cacheKey);
      if (dbCache) {
        console.log(`[SMART LOADER] IndexedDB cache hit: ${cacheKey}`);
        // Promote to memory cache
        dataCachingService.set(sourceId, dbCache, params, sourceType);
        return dbCache;
      }
    }

    // Data not in cache, fetch it
    console.log(`[SMART LOADER] Cache miss, fetching: ${cacheKey} (priority: ${priority})`);

    if (priority === 'immediate') {
      return await this.fetchData<T>(sourceId, params, sourceType);
    } else {
      // Queue for later
      this.queueRequest({ sourceId, params, priority, sourceType });
      this.processQueue();
      return null;
    }
  }

  /**
   * Batch load multiple data sources
   */
  public async loadBatch(requests: DataRequest[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    // Sort by priority
    const sorted = requests.sort((a, b) => {
      const priorityOrder = { immediate: 0, high: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Load immediate priority items first
    const immediate = sorted.filter(r => r.priority === 'immediate');
    const immediateResults = await Promise.all(
      immediate.map(r => this.load(r.sourceId, r.params, {
        priority: r.priority,
        sourceType: r.sourceType
      }))
    );
    immediate.forEach((req, idx) => {
      const key = this.generateCacheKey(req.sourceId, req.params);
      results.set(key, immediateResults[idx]);
    });

    // Queue the rest
    sorted
      .filter(r => r.priority !== 'immediate')
      .forEach(r => this.queueRequest(r));

    this.processQueue();

    return results;
  }

  /**
   * Fetch data from source
   */
  private async fetchData<T = any>(
    sourceId: string,
    params?: Record<string, any>,
    sourceType?: string
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey(sourceId, params);
    this.activeRequests.add(cacheKey);
    this.stats.requestsInFlight++;

    try {
      let data: any = null;

      // Determine data source and fetch accordingly
      if (sourceId.startsWith('/data/')) {
        // Local data file
        data = await this.fetchLocal(sourceId);
      } else if (sourceId.startsWith('http')) {
        // External API
        data = await this.fetchExternal(sourceId, params);
      } else {
        // Assume it's a local path
        data = await this.fetchLocal(`/data/${sourceId}`);
      }

      if (data) {
        // Store in both memory and IndexedDB
        dataCachingService.set(sourceId, data, params, sourceType);
        await this.saveToDB(cacheKey, data, sourceType);

        this.stats.bytesLoaded += JSON.stringify(data).length;
      }

      this.stats.requestsCompleted++;
      return data;
    } catch (error) {
      console.error(`[SMART LOADER] Error fetching ${sourceId}:`, error);
      return null;
    } finally {
      this.activeRequests.delete(cacheKey);
      this.stats.requestsInFlight--;
    }
  }

  /**
   * Fetch from local data files
   */
  private async fetchLocal(path: string): Promise<any> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else if (contentType?.includes('text/csv')) {
        const text = await response.text();
        return this.parseCSV(text);
      } else {
        return await response.text();
      }
    } catch (error) {
      console.warn(`[SMART LOADER] Failed to fetch local: ${path}`, error);
      return null;
    }
  }

  /**
   * Fetch from external APIs
   */
  private async fetchExternal(url: string, params?: Record<string, any>): Promise<any> {
    try {
      const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
      const response = await fetch(url + queryString, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[SMART LOADER] Failed to fetch external: ${url}`, error);
      return null;
    }
  }

  /**
   * Parse CSV data
   */
  private parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        const cleanValue = value.replace(/[$,\s%]/g, '');

        if (cleanValue && !isNaN(parseFloat(cleanValue))) {
          row[header] = parseFloat(cleanValue);
        } else {
          row[header] = value;
        }
      });

      data.push(row);
    }

    return data;
  }

  /**
   * Queue a data request for later processing
   */
  private queueRequest(request: DataRequest): void {
    const priority = request.priority;

    if (!this.requestQueue.has(priority)) {
      this.requestQueue.set(priority, []);
    }

    this.requestQueue.get(priority)!.push(request);
    this.stats.queuedRequests++;
  }

  /**
   * Process queued requests with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.activeRequests.size >= this.MAX_CONCURRENT_REQUESTS) {
      return;
    }

    // Process high priority first, then low
    for (const priority of ['high', 'low']) {
      const queue = this.requestQueue.get(priority);
      if (!queue || queue.length === 0) continue;

      while (queue.length > 0 && this.activeRequests.size < this.MAX_CONCURRENT_REQUESTS) {
        const request = queue.shift()!;
        this.stats.queuedRequests--;

        // Fire and forget - don't wait for completion
        this.fetchData(request.sourceId, request.params, request.sourceType)
          .then(() => this.processQueue());
      }
    }
  }

  /**
   * Prefetch data that's likely to be needed
   */
  public prefetch(sourceIds: string[], sourceType?: string): void {
    console.log(`[SMART LOADER] Prefetching ${sourceIds.length} sources`);

    sourceIds.forEach(sourceId => {
      this.queueRequest({
        sourceId,
        priority: 'low',
        sourceType: sourceType || 'general'
      });
    });

    this.processQueue();
  }

  /**
   * Prefetch data for a specific page
   */
  public prefetchPageData(pageName: string, year?: number): void {
    const dataSources = this.getPageDataSources(pageName, year);
    this.prefetch(dataSources, pageName);
  }

  /**
   * Get data sources for a page
   */
  private getPageDataSources(pageName: string, year?: number): string[] {
    const y = year || new Date().getFullYear();

    const commonSources = [
      `/data/api/enhanced_summary.json`,
      `/data/main.json`
    ];

    const pageSpecificSources: Record<string, string[]> = {
      budget: [`/data/api/financial/${y}/consolidated.json`, `/data/charts/Budget_Execution_consolidated_2019-2025.csv`, `/data/main.json`],
      treasury: [`/data/api/financial/${y}/consolidated.json`, `/data/main.json`],
      debt: [`/data/api/financial/${y}/consolidated.json`, `/data/main.json`],
      expenses: [`/data/api/financial/${y}/expenditure_by_program.json`, `/data/charts/Expenditure_Report_consolidated_2019-2025.csv`, `/data/main.json`],
      salaries: [`/data/api/financial/${y}/consolidated.json`, `/data/main.json`],
      contracts: [`/data/api/documents.json`, `/data/main.json`],
      documents: [`/data/api/documents.json`, `/data/api/pdf_metadata.json`]
    };

    return [...commonSources, ...(pageSpecificSources[pageName.toLowerCase()] || [])];
  }

  /**
   * Save data to IndexedDB
   */
  private async saveToDB(key: string, data: any, sourceType?: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data-cache'], 'readwrite');
      const store = transaction.objectStore('data-cache');

      const entry = {
        key,
        data,
        timestamp: Date.now(),
        sourceType: sourceType || 'general',
        size: JSON.stringify(data).length
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data from IndexedDB
   */
  private async getFromDB(key: string): Promise<any | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['data-cache'], 'readonly');
      const store = transaction.objectStore('data-cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Check if cache is still valid (within 24 hours)
          const age = Date.now() - result.timestamp;
          if (age < 24 * 60 * 60 * 1000) {
            resolve(result.data);
          } else {
            // Expired, delete it
            this.deleteFromDB(key);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  }

  /**
   * Delete data from IndexedDB
   */
  private async deleteFromDB(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data-cache'], 'readwrite');
      const store = transaction.objectStore('data-cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached data
   */
  public async clearAllCache(): Promise<void> {
    // Clear memory cache
    dataCachingService.clear();

    // Clear IndexedDB
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data-cache'], 'readwrite');
      const store = transaction.objectStore('data-cache');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[SMART LOADER] All cache cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get loader statistics
   */
  public getStats(): LoaderStats {
    const cacheStats = dataCachingService.getStats();
    this.stats.cacheHitRate = dataCachingService.getHitRatio();
    return { ...this.stats };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(sourceId: string, params?: Record<string, any>): string {
    if (!params) return sourceId;

    const paramsStr = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${sourceId}?${paramsStr}`;
  }

  /**
   * Warm up cache with essential data
   */
  public async warmUpCache(): Promise<void> {
    console.log('[SMART LOADER] Warming up cache with essential data...');

    const currentYear = new Date().getFullYear();
    const essentialData = [
      `/data/api/enhanced_summary.json`,
      `/data/main.json`,
      `/data/api/index.json`,
      `/data/multi_source_report.json`
    ];

    // Load essential data immediately
    await this.loadBatch(
      essentialData.map(sourceId => ({
        sourceId,
        priority: 'immediate' as const,
        sourceType: 'essential'
      }))
    );

    // Prefetch current year data
    this.prefetchPageData('budget', currentYear);
    this.prefetchPageData('expenses', currentYear);

    console.log('[SMART LOADER] Cache warm-up complete');
  }
}

const smartDataLoader = SmartDataLoader.getInstance();

export { SmartDataLoader };
export { smartDataLoader };
export default smartDataLoader;
