/**
 * Unified Resource Service
 * Centralized service for fetching and managing all external resources
 * including documents, images, JSON data, and other file types from GitHub
 */

import {
  DocumentMetadata,
  DocumentServiceError,
  SupportedFileType
} from '../types/documents';

// Configuration
const RESOURCE_CONFIG = {
  GITHUB_BASE_URL: import.meta.env.VITE_GITHUB_BASE_URL || 'https://raw.githubusercontent.com',
  GITHUB_OWNER: import.meta.env.VITE_GITHUB_OWNER || 'flongstaff',
  GITHUB_REPO: import.meta.env.VITE_GITHUB_REPO || 'cda-transparencia',
  GITHUB_BRANCH: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN,
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300000'), // 5 minutes default
  MAX_RETRIES: parseInt(import.meta.env.VITE_MAX_RETRIES || '3')
};

// Enhanced cache with LRU eviction
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessed: number;
}

class ResourceCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 100;
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    entry.accessed = Date.now();
    return entry.data;
  }
  
  set<T>(key: string, data: T, ttl: number = RESOURCE_CONFIG.CACHE_TTL): void {
    // Evict least recently used if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessed: Date.now()
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
  
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessed < oldestAccess) {
        oldestAccess = entry.accessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

class UnifiedResourceService {
  private cache = new ResourceCache();
  
  // Fetch with retry mechanism and authentication
  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error;
    
    // Add authentication header if token is available
    const fetchOptions = { ...options };
    if (RESOURCE_CONFIG.GITHUB_TOKEN && url.startsWith(RESOURCE_CONFIG.GITHUB_BASE_URL)) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${RESOURCE_CONFIG.GITHUB_TOKEN}`
      };
    }
    
    for (let i = 0; i <= RESOURCE_CONFIG.MAX_RETRIES; i++) {
      try {
        const response = await fetch(url, fetchOptions);
        if (response.ok) return response;
        
        if (i === RESOURCE_CONFIG.MAX_RETRIES) {
          throw new DocumentServiceError(
            `Failed after ${RESOURCE_CONFIG.MAX_RETRIES} retries: ${response.status} ${response.statusText}`,
            response.status === 404 ? 'NOT_FOUND' : 
            response.status === 403 ? 'PERMISSION_ERROR' : 'NETWORK_ERROR'
          );
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      } catch (error) {
        lastError = error as Error;
        if (i === RESOURCE_CONFIG.MAX_RETRIES) {
          throw new DocumentServiceError(
            `Network error: ${lastError.message}`,
            'NETWORK_ERROR',
            lastError
          );
        }
      }
    }
    
    throw lastError;
  }
  
  // Get GitHub raw URL
  private getGitHubRawUrl(path: string): string {
    return `${RESOURCE_CONFIG.GITHUB_BASE_URL}/${RESOURCE_CONFIG.GITHUB_OWNER}/${RESOURCE_CONFIG.GITHUB_REPO}/${RESOURCE_CONFIG.GITHUB_BRANCH}/${path}`;
  }
  
  // Fetch JSON data
  async fetchJSON<T>(path: string, useCache: boolean = true): Promise<T> {
    const cacheKey = `json_${path}`;
    
    if (useCache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const url = this.getGitHubRawUrl(path);
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      if (useCache) {
        this.cache.set(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      throw new DocumentServiceError(
        `Failed to fetch JSON from ${path}: ${(error as Error).message}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  // Fetch text data
  async fetchText(path: string, useCache: boolean = true): Promise<string> {
    const cacheKey = `text_${path}`;
    
    if (useCache) {
      const cached = this.cache.get<string>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const url = this.getGitHubRawUrl(path);
      const response = await this.fetchWithRetry(url);
      const data = await response.text();
      
      if (useCache) {
        this.cache.set(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      throw new DocumentServiceError(
        `Failed to fetch text from ${path}: ${(error as Error).message}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  // Fetch binary data as blob
  async fetchBlob(path: string, useCache: boolean = true): Promise<Blob> {
    const cacheKey = `blob_${path}`;
    
    if (useCache) {
      const cached = this.cache.get<Blob>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const url = this.getGitHubRawUrl(path);
      const response = await this.fetchWithRetry(url);
      const data = await response.blob();
      
      if (useCache) {
        this.cache.set(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      throw new DocumentServiceError(
        `Failed to fetch blob from ${path}: ${(error as Error).message}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  // Fetch document metadata
  async fetchDocumentMetadata(path: string): Promise<DocumentMetadata | null> {
    const cacheKey = `doc_meta_${path}`;
    const cached = this.cache.get<DocumentMetadata>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Try to fetch document inventory first
      const inventory = await this.fetchJSON<any[]>('data/organized_documents/document_inventory.json');
      const document = inventory.find(doc => doc.relative_path === path);
      
      if (document) {
        const metadata: DocumentMetadata = {
          id: document.id || `${document.year}_${document.category}_${document.filename}`,
          title: document.title || document.filename.replace(/\.[^/.]+$/, ""),
          filename: document.filename,
          year: document.year,
          category: document.category,
          size_mb: document.size_mb || document.file_size || '0',
          url: document.url || this.getGitHubRawUrl(document.relative_path),
          official_url: document.official_url || '',
          verification_status: document.verification_status || 'verified',
          processing_date: document.processing_date || document.created_at || new Date().toISOString(),
          relative_path: document.relative_path || '',
          content: document.content || '',
          file_type: this.determineFileType(document.filename, document.mime_type)
        };
        
        this.cache.set(cacheKey, metadata);
        return metadata;
      }
      
      return null;
    } catch (error) {
      console.warn(`Could not fetch metadata for document ${path}:`, error);
      return null;
    }
  }
  
  // Determine file type from filename or MIME type
  private determineFileType(filename: string, mimeType?: string): SupportedFileType {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    // Map common extensions to supported file types
    const extensionMap: Record<string, SupportedFileType> = {
      'pdf': 'pdf',
      'md': 'md',
      'markdown': 'markdown',
      'jpg': 'jpg',
      'jpeg': 'jpeg',
      'png': 'png',
      'gif': 'gif',
      'svg': 'svg',
      'json': 'json',
      'zip': 'zip',
      'rar': 'rar',
      '7z': '7z',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'xls',
      'xlsx': 'xlsx',
      'ppt': 'ppt',
      'pptx': 'pptx',
      'txt': 'txt',
      'csv': 'csv'
    };
    
    return extensionMap[ext] || 'other';
  }
  
  // Search resources
  async searchResources(query: string, type?: SupportedFileType): Promise<DocumentMetadata[]> {
    try {
      const inventory = await this.fetchJSON<any[]>('data/organized_documents/document_inventory.json');
      
      const results = inventory
        .filter(doc => {
          const matchesQuery = 
            (doc.filename && doc.filename.toLowerCase().includes(query.toLowerCase())) ||
            (doc.title && doc.title.toLowerCase().includes(query.toLowerCase()));
          
          const matchesType = !type || this.determineFileType(doc.filename) === type;
          
          return matchesQuery && matchesType;
        })
        .map(doc => ({
          id: doc.id || `${doc.year}_${doc.category}_${doc.filename}`,
          title: doc.title || doc.filename.replace(/\.[^/.]+$/, ""),
          filename: doc.filename,
          year: doc.year,
          category: doc.category,
          size_mb: doc.size_mb || doc.file_size || '0',
          url: doc.url || this.getGitHubRawUrl(doc.relative_path),
          official_url: doc.official_url || '',
          verification_status: doc.verification_status || 'verified',
          processing_date: doc.processing_date || doc.created_at || new Date().toISOString(),
          relative_path: doc.relative_path || '',
          content: doc.content || '',
          file_type: this.determineFileType(doc.filename, doc.mime_type)
        }));
      
      return results;
    } catch (error) {
      throw new DocumentServiceError(
        `Failed to search resources: ${(error as Error).message}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  // Get available years
  async getAvailableYears(): Promise<number[]> {
    const cacheKey = 'available_years';
    const cached = this.cache.get<number[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const inventory = await this.fetchJSON<any[]>('data/organized_documents/document_inventory.json');
      const years = [...new Set(inventory.map(doc => parseInt(doc.year)))].sort((a, b) => b - a);
      
      this.cache.set(cacheKey, years, 15 * 60 * 1000); // 15 minutes cache
      return years;
    } catch (error) {
      throw new DocumentServiceError(
        `Failed to get available years: ${(error as Error).message}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  // Get categories for year
  async getCategoriesForYear(year: number): Promise<string[]> {
    const cacheKey = `categories_${year}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const inventory = await this.fetchJSON<any[]>('data/organized_documents/document_inventory.json');
      const categories = [...new Set(
        inventory
          .filter(doc => parseInt(doc.year) === year)
          .map(doc => doc.category.replace(/_/g, ' '))
      )].sort();
      
      this.cache.set(cacheKey, categories, 10 * 60 * 1000); // 10 minutes cache
      return categories;
    } catch (error) {
      throw new DocumentServiceError(
        `Failed to get categories for year ${year}: ${(error as Error).message}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
  
  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const unifiedResourceService = new UnifiedResourceService();
export default unifiedResourceService;