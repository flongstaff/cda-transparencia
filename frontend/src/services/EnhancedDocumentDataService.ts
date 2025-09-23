/**
 * Enhanced Document Data Service
 * Service to fetch and organize data from Markdown and JSON files by year and category
 * with improved TypeScript support, error handling, and caching
 */

import {
  DocumentMetadata,
  YearlyData,
  CategoryData,
  DocumentServiceError,
  SupportedFileType
} from '../types/documents';

// GitHub configuration
const GITHUB_CONFIG = {
  baseUrl: import.meta.env.VITE_GITHUB_BASE_URL || 'https://raw.githubusercontent.com',
  owner: import.meta.env.VITE_GITHUB_OWNER || 'flongstaff',
  repo: import.meta.env.VITE_GITHUB_REPO || 'cda-transparencia',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  token: import.meta.env.VITE_GITHUB_TOKEN // For private repos
};

const GITHUB_RAW_BASE = `${GITHUB_CONFIG.baseUrl}/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}`;

// Enhanced cache with LRU eviction
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessed: number;
}

class DocumentCache {
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
  
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
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

class EnhancedDocumentDataService {
  private cache = new DocumentCache();
  private documentInventory: any[] | null = null;
  
  // Fetch with retry mechanism
  private async fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) return response;
        
        if (i === maxRetries) {
          throw new DocumentServiceError(
            `Failed after ${maxRetries} retries: ${response.status} ${response.statusText}`,
            'NETWORK_ERROR'
          );
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) {
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
  
  // Load document inventory with fallback
  private async loadDocumentInventory(): Promise<any[]> {
    // Return cached inventory if available
    const cached = this.cache.get<any[]>('document_inventory');
    if (cached) {
      this.documentInventory = cached;
      return cached;
    }
    
    // Try primary source first
    try {
      const url = `${GITHUB_RAW_BASE}/data/organized_documents/document_inventory.json`;
      const response = await this.fetchWithRetry(url);
      if (response.ok) {
        const data = await response.json();
        this.documentInventory = data;
        this.cache.set('document_inventory', data, 10 * 60 * 1000); // 10 minutes cache
        return data;
      }
    } catch (error) {
      console.warn('Primary source failed, trying fallback:', error);
    }
    
    // Try local fallback
    try {
      const localResponse = await fetch('/data/document_inventory.json');
      if (localResponse.ok) {
        const data = await localResponse.json();
        this.documentInventory = data;
        this.cache.set('document_inventory', data, 5 * 60 * 1000); // 5 minutes cache
        return data;
      }
    } catch (error) {
      console.warn('Local fallback failed:', error);
    }
    
    // Return empty array if all sources fail
    return [];
  }
  
  /**
   * Get all available years by scanning the organized_documents directory
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      // Load the document inventory
      const documents = await this.loadDocumentInventory();
      // Extract unique years from documents
      const years = [...new Set(documents.map((doc: any) => parseInt(doc.year)))].sort((a, b) => b - a);
      return years;
    } catch (error) {
      console.error('Error getting available years:', error);
      throw new DocumentServiceError(
        'Failed to load available years',
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  /**
   * Get document categories for a specific year
   */
  async getCategoriesForYear(year: number): Promise<string[]> {
    try {
      const cacheKey = `categories_${year}`;
      const cached = this.cache.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Load the document inventory
      const documents = await this.loadDocumentInventory();
      // Filter documents by year and extract unique categories
      const categories = [...new Set(
        documents
          .filter((doc: any) => parseInt(doc.year) === year)
          .map((doc: any) => doc.category.replace(/_/g, ' '))
      )].sort();
      
      this.cache.set(cacheKey, categories, 15 * 60 * 1000); // 15 minutes cache
      
      return categories;
    } catch (error) {
      console.error(`Error getting categories for year ${year}:`, error);
      throw new DocumentServiceError(
        `Failed to load categories for year ${year}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  /**
   * Get documents for a specific year and category
   */
  async getDocumentsForYearAndCategory(
    year: number, 
    category: string
  ): Promise<DocumentMetadata[]> {
    try {
      const cacheKey = `documents_${year}_${category}`;
      const cached = this.cache.get<DocumentMetadata[]>(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Load documents from the organized document inventory
      const allDocuments = await this.loadDocumentInventory();
      
      // Filter documents by year and category
      const filteredDocuments = allDocuments
        .filter((doc: any) => 
          parseInt(doc.year) === year && 
          doc.category.replace(/_/g, ' ') === category.replace(/_/g, ' ')
        )
        .map((doc: any) => this.transformDocumentData(doc, year, category));
      
      this.cache.set(cacheKey, filteredDocuments, 10 * 60 * 1000); // 10 minutes cache
      
      return filteredDocuments;
    } catch (error) {
      console.error(`Error getting documents for year ${year} and category ${category}:`, error);
      throw new DocumentServiceError(
        `Failed to load documents for year ${year} and category ${category}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  /**
   * Get all documents for a specific year organized by category
   */
  async getYearlyData(year: number): Promise<YearlyData> {
    try {
      const cacheKey = `yearly_data_${year}`;
      const cached = this.cache.get<YearlyData>(cacheKey);
      if (cached) {
        return cached;
      }
      
      const categories = await this.getCategoriesForYear(year);
      const categoryData: Record<string, CategoryData> = {};
      let totalDocuments = 0;
      let verifiedDocuments = 0;
      
      // Process categories in parallel for better performance
      const categoryPromises = categories.map(async (category) => {
        const documents = await this.getDocumentsForYearAndCategory(year, category);
        return {
          category,
          data: {
            name: category,
            documents,
            count: documents.length
          }
        };
      });
      
      const categoryResults = await Promise.all(categoryPromises);
      
      // Process results
      categoryResults.forEach(({ category, data }) => {
        categoryData[category] = data;
        totalDocuments += data.count;
        verifiedDocuments += data.documents.filter(doc => doc.verification_status === 'verified').length;
      });
      
      const yearlyData: YearlyData = {
        year,
        categories: categoryData,
        totalDocuments,
        verifiedDocuments
      };
      
      this.cache.set(cacheKey, yearlyData, 15 * 60 * 1000); // 15 minutes cache
      
      return yearlyData;
    } catch (error) {
      console.error(`Error getting yearly data for year ${year}:`, error);
      throw new DocumentServiceError(
        `Failed to load yearly data for year ${year}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  /**
   * Get a specific document by its path
   */
  async getDocumentByPath(relativePath: string): Promise<DocumentMetadata | null> {
    try {
      const cacheKey = `document_${relativePath}`;
      const cached = this.cache.get<DocumentMetadata>(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Try to load the document from the document inventory
      try {
        const allDocuments = await this.loadDocumentInventory();
        
        // Find the document by relative path
        const document = allDocuments.find((doc: any) => doc.relative_path === relativePath);
        
        if (document) {
          const transformedDoc = this.transformDocumentData(document, parseInt(document.year), document.category);
          
          this.cache.set(cacheKey, transformedDoc, 20 * 60 * 1000); // 20 minutes cache
          
          return transformedDoc;
        }
      } catch (error) {
        console.warn(`Could not load document by path ${relativePath}:`, error);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting document by path ${relativePath}:`, error);
      throw new DocumentServiceError(
        `Failed to load document by path ${relativePath}`,
        'UNKNOWN_ERROR',
        error as Error
      );
    }
  }
  
  /**
   * Search documents by query
   */
  async searchDocuments(query: string, year?: number, category?: string): Promise<DocumentMetadata[]> {
    try {
      // Load all documents and filter by query
      try {
        const allDocuments = await this.loadDocumentInventory();
        
        // Filter documents based on query and optional filters
        const filteredDocuments = allDocuments
          .filter((doc: any) => {
            // Check if document matches query
            const matchesQuery = 
              (doc.filename && doc.filename.toLowerCase().includes(query.toLowerCase())) ||
              (doc.title && doc.title.toLowerCase().includes(query.toLowerCase()));
            
            // Check if document matches year filter
            const matchesYear = !year || parseInt(doc.year) === year;
            
            // Check if document matches category filter
            const matchesCategory = !category || doc.category.replace(/_/g, ' ') === category.replace(/_/g, ' ');
            
            return matchesQuery && matchesYear && matchesCategory;
          })
          .map((doc: any) => this.transformDocumentData(doc, parseInt(doc.year), doc.category));
        
        return filteredDocuments;
      } catch (error) {
        console.warn(`Could not search documents:`, error);
        throw new DocumentServiceError(
          'Failed to search documents',
          'UNKNOWN_ERROR',
          error as Error
        );
      }
    } catch (error) {
      console.error(`Error searching documents with query "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.documentInventory = null;
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats();
  }
  
  /**
   * Determine file type from filename or MIME type
   */
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
  
  /**
   * Transform raw document data to our standardized format
   */
  private transformDocumentData(rawData: any, year: number, category: string): DocumentMetadata {
    // Extract filename without extension for title
    const filename = rawData.filename || 'Documento sin nombre';
    const title = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
    
    // Determine file type
    const fileType = this.determineFileType(filename, rawData.mime_type);
    
    // Construct GitHub raw URL for the document
    const documentUrl = rawData.url || rawData.file_path || rawData.official_url;
    const githubRawUrl = documentUrl ? 
      (documentUrl.startsWith('http') ? documentUrl : `${GITHUB_RAW_BASE}${documentUrl}`) : 
      '';
    
    // Create base document object
    const baseDocument: DocumentMetadata = {
      id: rawData.id || `${rawData.year || year}_${rawData.category || category}_${filename}`,
      title: rawData.title || title || 'Documento sin título',
      filename: filename,
      year: rawData.year || year,
      category: rawData.category || category,
      size_mb: rawData.size_mb || rawData.file_size || '0',
      url: githubRawUrl,
      official_url: rawData.official_url || '',
      verification_status: rawData.verification_status || 'verified',
      processing_date: rawData.processing_date || rawData.created_at || new Date().toISOString(),
      relative_path: rawData.relative_path || '',
      content: rawData.content || '',
      file_type: fileType
    };
    
    // Add format property for specific file types
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileType)) {
      return {
        ...baseDocument,
        file_type: fileType as 'jpg' | 'jpeg' | 'png' | 'gif' | 'svg',
        format: fileType as 'jpg' | 'jpeg' | 'png' | 'gif' | 'svg'
      } as any;
    }
    
    if (['zip', 'rar', '7z'].includes(fileType)) {
      return {
        ...baseDocument,
        file_type: fileType as 'zip' | 'rar' | '7z',
        format: fileType as 'zip' | 'rar' | '7z'
      } as any;
    }
    
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType)) {
      return {
        ...baseDocument,
        file_type: fileType as 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx',
        format: fileType as 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx'
      } as any;
    }
    
    if (['txt', 'csv'].includes(fileType)) {
      return {
        ...baseDocument,
        file_type: fileType as 'txt' | 'csv',
        format: fileType as 'txt' | 'csv'
      } as any;
    }
    
    return baseDocument;
  }
}

// Export singleton instance
export const enhancedDocumentDataService = new EnhancedDocumentDataService();
export default enhancedDocumentDataService;