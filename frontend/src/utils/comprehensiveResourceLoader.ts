/**
 * Comprehensive Resource Loader
 * Loader for all types of resources from GitHub with proper error handling and caching
 */

import { DocumentMetadata, SupportedFileType } from '../types/documents';
import { githubAPI } from './githubAPI';
import { errorHandler } from './errorHandler';

// Resource cache with LRU eviction
class ResourceCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number = 100;
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    // Evict least recently used if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Comprehensive resource loader
class ComprehensiveResourceLoader {
  private cache = new ResourceCache();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  // Load document metadata from GitHub
  async loadDocumentMetadata(path: string): Promise<DocumentMetadata | null> {
    try {
      // Check cache first
      const cached = this.cache.get<DocumentMetadata>(`doc_meta_${path}`);
      if (cached) {
        return cached;
      }
      
      // Check if already loading
      if (this.loadingPromises.has(path)) {
        return await this.loadingPromises.get(path);
      }
      
      // Create loading promise
      const loadingPromise = this.fetchDocumentMetadata(path);
      this.loadingPromises.set(path, loadingPromise);
      
      // Wait for result
      const metadata = await loadingPromise;
      
      // Remove from loading promises
      this.loadingPromises.delete(path);
      
      // Cache result
      if (metadata) {
        this.cache.set(`doc_meta_${path}`, metadata, 600000); // 10 minutes
      }
      
      return metadata;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'ComprehensiveResourceLoader',
        action: 'loadDocumentMetadata',
        timestamp: new Date()
      });
      return null;
    }
  }
  
  // Fetch document metadata from GitHub
  private async fetchDocumentMetadata(path: string): Promise<DocumentMetadata | null> {
    try {
      // Get file info from GitHub
      const fileInfo = await githubAPI.getFileContent(path);
      
      // Extract file type from extension
      const fileType = this.extractFileType(fileInfo.name);
      
      // Create document metadata
      const metadata: DocumentMetadata = {
        id: `${fileInfo.sha}_${fileInfo.name}`,
        title: fileInfo.name.replace(/\.[^/.]+$/, ""), // Remove extension
        filename: fileInfo.name,
        year: new Date().getFullYear(), // Default to current year
        category: 'unknown', // Will be determined by caller
        size_mb: (fileInfo.size / (1024 * 1024)).toFixed(2),
        url: fileInfo.download_url,
        official_url: fileInfo.html_url,
        verification_status: 'verified',
        processing_date: new Date().toISOString(),
        relative_path: path,
        content: '',
        file_type: fileType
      };
      
      return metadata;
    } catch (error) {
      console.warn(`Could not fetch metadata for ${path}:`, error);
      return null;
    }
  }
  
  // Load document content from GitHub
  async loadDocumentContent(path: string, fileType: SupportedFileType): Promise<string> {
    try {
      // Check cache first
      const cached = this.cache.get<string>(`doc_content_${path}`);
      if (cached) {
        return cached;
      }
      
      // Check if already loading
      if (this.loadingPromises.has(`content_${path}`)) {
        return await this.loadingPromises.get(`content_${path}`);
      }
      
      // Create loading promise
      const loadingPromise = this.fetchDocumentContent(path, fileType);
      this.loadingPromises.set(`content_${path}`, loadingPromise);
      
      // Wait for result
      const content = await loadingPromise;
      
      // Remove from loading promises
      this.loadingPromises.delete(`content_${path}`);
      
      // Cache result
      this.cache.set(`doc_content_${path}`, content, 300000); // 5 minutes
      
      return content;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'ComprehensiveResourceLoader',
        action: 'loadDocumentContent',
        timestamp: new Date()
      });
      throw error;
    }
  }
  
  // Fetch document content from GitHub based on file type
  private async fetchDocumentContent(path: string, fileType: SupportedFileType): Promise<string> {
    try {
      switch (fileType) {
        case 'pdf':
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'zip':
        case 'rar':
        case '7z':
        case 'doc':
        case 'docx':
        case 'xls':
        case 'xlsx':
        case 'ppt':
        case 'pptx':
          // For binary files, return the download URL
          const fileInfo = await githubAPI.getFileContent(path);
          return fileInfo.download_url || '';
          
        case 'json':
        case 'md':
        case 'markdown':
        case 'txt':
        case 'csv':
          // For text files, fetch the raw content
          return await githubAPI.getRawFileContent(path);
          
        default:
          // For unknown file types, try to fetch as text
          try {
            return await githubAPI.getRawFileContent(path);
          } catch {
            // If text fetch fails, return download URL
            const fileInfo = await githubAPI.getFileContent(path);
            return fileInfo.download_url || '';
          }
      }
    } catch (error) {
      throw new Error(`Failed to fetch content for ${path}: ${(error as Error).message}`);
    }
  }
  
  // Extract file type from filename
  private extractFileType(filename: string): SupportedFileType {
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
    
    return extensionMap[ext] || 'txt';
  }
  
  // Search documents by query
  async searchDocuments(query: string, path: string = ''): Promise<DocumentMetadata[]> {
    try {
      // Check cache first
      const cached = this.cache.get<DocumentMetadata[]>(`search_${query}_${path}`);
      if (cached) {
        return cached;
      }
      
      // Search GitHub repository
      const searchResults = await githubAPI.searchRepo(query, path);
      
      // Convert search results to document metadata
      const documents: DocumentMetadata[] = [];
      
      for (const item of searchResults.items || []) {
        try {
          const metadata = await this.loadDocumentMetadata(item.path);
          if (metadata) {
            documents.push(metadata);
          }
        } catch (error) {
          console.warn(`Could not load metadata for ${item.path}:`, error);
        }
      }
      
      // Cache results
      this.cache.set(`search_${query}_${path}`, documents, 300000); // 5 minutes
      
      return documents;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'ComprehensiveResourceLoader',
        action: 'searchDocuments',
        timestamp: new Date()
      });
      return [];
    }
  }
  
  // Get repository contents
  async getRepositoryContents(path: string = ''): Promise<any[]> {
    try {
      // Check cache first
      const cached = this.cache.get<any[]>(`repo_contents_${path}`);
      if (cached) {
        return cached;
      }
      
      // Get repository contents
      const contents = await githubAPI.getRepoContents(path);
      
      // Cache results
      this.cache.set(`repo_contents_${path}`, contents, 600000); // 10 minutes
      
      return contents;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'ComprehensiveResourceLoader',
        action: 'getRepositoryContents',
        timestamp: new Date()
      });
      return [];
    }
  }
  
  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
  
  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache['cache'].size,
      keys: Array.from(this.cache['cache'].keys())
    };
  }
}

// Export singleton instance
export const comprehensiveResourceLoader = new ComprehensiveResourceLoader();

export default comprehensiveResourceLoader;