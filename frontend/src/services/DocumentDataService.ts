/**
 * Document Data Service
 * Service to fetch and organize data from Markdown and JSON files by year and category
 */

// Type definitions
export interface DocumentMetadata {
  id: string;
  title: string;
  filename: string;
  year: number;
  category: string;
  type: string;
  size_mb: string;
  url: string;
  official_url: string;
  verification_status: string;
  processing_date: string;
  relative_path?: string;
  content?: string;
}

export interface CategoryData {
  name: string;
  documents: DocumentMetadata[];
  count: number;
}

export interface YearlyData {
  year: number;
  categories: Record<string, CategoryData>;
  totalDocuments: number;
  verifiedDocuments: number;
}

export interface DocumentIndex {
  [year: number]: YearlyData;
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';

class DocumentDataService {
  private basePath = '/data/organized_documents';
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private documentInventory: any[] | null = null; // Cache for the document inventory

  private async _loadDocumentInventory(): Promise<any[]> {
    if (this.documentInventory) {
      return this.documentInventory;
    }
    try {
      const url = `${GITHUB_RAW_BASE}/data/organized_documents/document_inventory.json`;
      const response = await fetch(url);
      if (response.ok) {
        this.documentInventory = await response.json();
        return this.documentInventory;
      } else {
        throw new Error(`Failed to load document inventory: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading document inventory:', error);
      throw error;
    }
  }
  /**
   * Get all available years by scanning the organized_documents directory
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      // Load the document inventory
      const documents = await this._loadDocumentInventory();
      // Extract unique years from documents
      const years = [...new Set(documents.map((doc: any) => parseInt(doc.year)))].sort((a, b) => b - a);
      return years;
    } catch (error) {
      console.error('Error getting available years:', error);
      // If loading fails, return an empty array. The calling component should handle the fallback.
      return [];
    }
  }

  /**
   * Get document categories for a specific year
   */
  async getCategoriesForYear(year: number): Promise<string[]> {
    try {
      const cacheKey = `categories_${year}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Load the document inventory
      const documents = await this._loadDocumentInventory();
      // Filter documents by year and extract unique categories
      const categories = [...new Set(
        documents
          .filter((doc: any) => parseInt(doc.year) === year)
          .map((doc: any) => doc.category.replace(/_/g, ' '))
      )].sort();
      
      this.cache.set(cacheKey, {
        data: categories,
        timestamp: Date.now()
      });
      
      return categories;
    } catch (error) {
      console.error(`Error getting categories for year ${year}:`, error);
      // If loading fails, return an empty array. The calling component should handle the fallback.
      return [];
    }
  }

  /**
   * Get documents for a specific year and category by loading the document inventory
   */
  async getDocumentsForYearAndCategory(year: number, category: string): Promise<DocumentMetadata[]> {
    try {
      const cacheKey = `documents_${year}_${category}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Load documents from the organized document inventory
      const allDocuments = await this._loadDocumentInventory();
      
      // Filter documents by year and category
      const filteredDocuments = allDocuments
        .filter((doc: any) => 
          parseInt(doc.year) === year && 
          doc.category.replace(/_/g, ' ') === category.replace(/_/g, ' ')
        )
        .map((doc: any) => this.transformDocumentData(doc, year, category));
      
      this.cache.set(cacheKey, {
        data: filteredDocuments,
        timestamp: Date.now()
      });
      
      return filteredDocuments;
    } catch (error) {
      console.error(`Error getting documents for year ${year} and category ${category}:`, error);
      return [];
    }
  }

  /**
   * Get all documents for a specific year organized by category
   */
  async getYearlyData(year: number): Promise<YearlyData> {
    try {
      const cacheKey = `yearly_data_${year}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
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

      this.cache.set(cacheKey, {
        data: yearlyData,
        timestamp: Date.now()
      });

      return yearlyData;
    } catch (error) {
      console.error(`Error getting yearly data for year ${year}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific document by its path
   */
  async getDocumentByPath(relativePath: string): Promise<DocumentMetadata | null> {
    try {
      const cacheKey = `document_${relativePath}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Try to load the document from the document inventory
      try {
        const allDocuments = await this._loadDocumentInventory();
        
        // Find the document by relative path
        const document = allDocuments.find((doc: any) => doc.relative_path === relativePath);
        
        if (document) {
          const transformedDoc = this.transformDocumentData(document, parseInt(document.year), document.category);
          
          this.cache.set(cacheKey, {
            data: transformedDoc,
            timestamp: Date.now()
          });
          
          return transformedDoc;
        }
      } catch (error) {
        console.warn(`Could not load document by path ${relativePath}:`, error);
      }

      return null;
    } catch (error) {
      console.error(`Error getting document by path ${relativePath}:`, error);
      return null;
    }
  }

  /**
   * Search documents by query
   */
  async searchDocuments(query: string, year?: number, category?: string): Promise<DocumentMetadata[]> {
    try {
      // Load all documents and filter by query
      try {
        const allDocuments = await this._loadDocumentInventory();
        
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
      }

      return [];
    } catch (error) {
      console.error(`Error searching documents with query "${query}":`, error);
      return [];
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Transform raw document data to our standardized format
   */
  private transformDocumentData(rawData: any, year: number, category: string): DocumentMetadata {
    // Extract filename without extension for title
    const filename = rawData.filename || 'Documento sin nombre';
    const title = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
    
    // Construct GitHub raw URL for the document
    const documentUrl = rawData.url || rawData.file_path || rawData.official_url;
    const githubRawUrl = documentUrl ? 
      (documentUrl.startsWith('http') ? documentUrl : `${GITHUB_RAW_BASE}${documentUrl}`) : 
      '';

    return {
      id: rawData.id || `${rawData.year || year}_${rawData.category || category}_${filename}`, // Use rawData.year/category if available
      title: rawData.title || title || 'Documento sin título',
      filename: filename,
      year: rawData.year || year, // Use rawData.year if available
      category: rawData.category || category, // Use rawData.category if available
      type: rawData.type || rawData.document_type || rawData.file_type || 'Documento',
      size_mb: rawData.size_mb || rawData.file_size || '0',
      url: githubRawUrl, // Use the constructed GitHub raw URL
      official_url: rawData.official_url || '',
      verification_status: rawData.verification_status || 'verified',
      processing_date: rawData.processing_date || rawData.created_at || new Date().toISOString(),
      relative_path: rawData.relative_path || '',
      content: rawData.content || ''
    };
  }
}

// Export singleton instance
export const documentDataService = new DocumentDataService();
export default documentDataService;