/**
 * Cache manager for Cloudflare Workers using KV storage
 */

/**
 * Simple in-memory cache for Cloudflare Workers
 * In production, this would use Cloudflare KV or Durable Objects
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get item from cache
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set item in cache
   */
  set(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  /**
   * Delete item from cache
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total_entries: this.cache.size,
      valid_entries: validEntries,
      expired_entries: expiredEntries,
      hit_rate: 0 // Would need to track hits/misses for this
    };
  }

  /**
   * Clean expired entries
   */
  clean() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Auto-clean expired entries every minute
setInterval(() => {
  cacheManager.clean();
}, 60 * 1000);
