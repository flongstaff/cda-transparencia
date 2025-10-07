/**
 * DataCachingService
 * 
 * Implements a comprehensive caching strategy for external data sources
 * to improve performance and reduce API calls.
 */

export interface CacheEntry {
  data: any;
  timestamp: number;
  sourceId: string;
  expiry: number; // Unix timestamp when cache expires
  size: number; // Approximate size in bytes
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  entries: number;
}

class DataCachingService {
  private static instance: DataCachingService;
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    entries: 0
  };
  
  // Default cache durations in milliseconds
  private readonly DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly MUNICIPAL_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly PROVINCIAL_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours
  private readonly NATIONAL_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
  private readonly CIVIL_SOCIETY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_CACHE_ENTRIES = 1000;
  
  private constructor() {}

  public static getInstance(): DataCachingService {
    if (!DataCachingService.instance) {
      DataCachingService.instance = new DataCachingService();
    }
    return DataCachingService.instance;
  }

  /**
   * Get cache duration based on source type
   */
  private getCacheDuration(sourceType: string): number {
    switch (sourceType.toLowerCase()) {
      case 'municipal':
        return this.MUNICIPAL_CACHE_DURATION;
      case 'provincial':
        return this.PROVINCIAL_CACHE_DURATION;
      case 'national':
        return this.NATIONAL_CACHE_DURATION;
      case 'civil_society':
        return this.CIVIL_SOCIETY_CACHE_DURATION;
      default:
        return this.DEFAULT_CACHE_DURATION;
    }
  }

  /**
   * Generate cache key from source ID and parameters
   */
  private generateCacheKey(sourceId: string, params?: Record<string, any>): string {
    if (!params) {
      return sourceId.toLowerCase();
    }

    // Create a string representation of parameters for the key
    const paramsStr = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${sourceId.toLowerCase()}:${paramsStr}`;
  }

  /**
   * Store data in cache
   */
  public set(
    sourceId: string, 
    data: any, 
    params?: Record<string, any>, 
    sourceType?: string,
    customExpiry?: number
  ): void {
    const cacheKey = this.generateCacheKey(sourceId, params);
    const now = Date.now();
    const expiry = customExpiry || (now + this.getCacheDuration(sourceType || 'general'));
    
    // Calculate approximate size
    const size = JSON.stringify(data).length;
    
    const entry: CacheEntry = {
      data,
      timestamp: now,
      sourceId,
      expiry,
      size
    };

    // Check if we need to evict entries due to size or count limits
    this.maybeEvictEntries(entry.size);

    this.cache.set(cacheKey, entry);
    
    // Update stats
    this.stats.entries = this.cache.size;
    this.stats.totalSize += size;
  }

  /**
   * Get data from cache
   */
  public get(sourceId: string, params?: Record<string, any>): any | null {
    const cacheKey = this.generateCacheKey(sourceId, params);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(cacheKey);
      this.stats.evictions++;
      this.stats.totalSize -= entry.size;
      this.stats.entries = this.cache.size;
      this.stats.misses++;
      return null;
    }

    // Update stats
    this.stats.hits++;
    
    return entry.data;
  }

  /**
   * Check if a cache entry exists and is valid
   */
  public has(sourceId: string, params?: Record<string, any>): boolean {
    const cacheKey = this.generateCacheKey(sourceId, params);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    return Date.now() <= entry.expiry;
  }

  /**
   * Delete a cache entry
   */
  public delete(sourceId: string, params?: Record<string, any>): boolean {
    const cacheKey = this.generateCacheKey(sourceId, params);
    const entry = this.cache.get(cacheKey);
    
    if (entry) {
      this.cache.delete(cacheKey);
      this.stats.totalSize -= entry.size;
      this.stats.entries = this.cache.size;
      return true;
    }
    
    return false;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      entries: 0
    };
  }

  /**
   * Clear expired entries
   */
  public clearExpired(): number {
    const now = Date.now();
    let clearedCount = 0;
    let clearedSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        clearedSize += entry.size;
        clearedCount++;
      }
    }
    
    this.stats.totalSize -= clearedSize;
    this.stats.entries = this.cache.size;
    this.stats.evictions += clearedCount;
    
    return clearedCount;
  }

  /**
   * Evict entries if cache is too large
   */
  private maybeEvictEntries(newEntrySize: number): void {
    // Check if we need to evict due to size
    if (this.stats.totalSize + newEntrySize > this.MAX_CACHE_SIZE) {
      this.evictBySize();
    }
    
    // Check if we need to evict due to count
    if (this.cache.size >= this.MAX_CACHE_ENTRIES) {
      this.evictByCount();
    }
  }

  /**
   * Evict entries by size (LRU - Least Recently Used)
   */
  private evictBySize(): void {
    // Sort entries by timestamp (oldest first) and remove until we're under the size limit
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry, timestamp: entry.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    let sizeToRemove = 0;
    for (const { key, entry } of entries) {
      if (this.stats.totalSize - sizeToRemove <= this.MAX_CACHE_SIZE * 0.8) { // Keep under 80% of max
        break;
      }
      
      this.cache.delete(key);
      sizeToRemove += entry.size;
      this.stats.evictions++;
    }
    
    this.stats.totalSize -= sizeToRemove;
    this.stats.entries = this.cache.size;
  }

  /**
   * Evict entries by count (oldest first)
   */
  private evictByCount(): void {
    // Sort entries by timestamp (oldest first) and remove until we're under the count limit
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry, timestamp: entry.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const entriesToRemove = entries.slice(0, Math.floor(this.MAX_CACHE_ENTRIES * 0.1)); // Remove 10% oldest
    
    let sizeToRemove = 0;
    for (const { key, entry } of entriesToRemove) {
      this.cache.delete(key);
      sizeToRemove += entry.size;
      this.stats.evictions++;
    }
    
    this.stats.totalSize -= sizeToRemove;
    this.stats.entries = this.cache.size;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit ratio
   */
  public getHitRatio(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get information about a specific cache entry
   */
  public getEntryInfo(sourceId: string, params?: Record<string, any>): {
    exists: boolean;
    age: number; // in milliseconds
    expiry: number; // unix timestamp
    size: number;
  } | null {
    const cacheKey = this.generateCacheKey(sourceId, params);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    return {
      exists: true,
      age: Date.now() - entry.timestamp,
      expiry: entry.expiry,
      size: entry.size
    };
  }

  /**
   * Get all cache keys
   */
  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Preload commonly used data into cache
   */
  public async preloadCommonData(): Promise<void> {
    // This would be implemented with specific preloading logic
    // For now, just a placeholder
    console.log('Preloading common data into cache...');
  }

  /**
   * Background task to periodically clean expired entries
   */
  public startBackgroundCleanup(intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout { // Every 5 minutes
    return setInterval(() => {
      const cleared = this.clearExpired();
      console.log(`Cache cleanup: cleared ${cleared} expired entries`);
    }, intervalMs);
  }
}

const dataCachingService = DataCachingService.getInstance();

export { DataCachingService };
export { dataCachingService };
export default dataCachingService;