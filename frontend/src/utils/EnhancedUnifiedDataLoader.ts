import { filterDocumentsByYear } from './documentProcessor';

// Define types for our data structure
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
  investments?: Record<string, any> | null;
  contracts?: Record<string, any> | null;
  property?: Record<string, any> | null;
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
  source_type?: string;
  file_path?: string;
  original_document_url?: string;
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
    categories: string[];
  };
}

export interface DataSources {
  multiSourceReport: MultiSourceData | null;
  organizedJsonData: { structured: StructuredData; documents: Document[] };
  markdownContent: Record<string, any>;
  pdfDocuments: Document[];
}

// Main data loader class
export class EnhancedUnifiedDataLoader {
  private static instance: EnhancedUnifiedDataLoader;
  private cache = new Map<string, { data: UnifiedData; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): EnhancedUnifiedDataLoader {
    if (!EnhancedUnifiedDataLoader.instance) {
      EnhancedUnifiedDataLoader.instance = new EnhancedUnifiedDataLoader();
    }
    return EnhancedUnifiedDataLoader.instance;
  }

  // Main data loading method that integrates all sources
  public async loadUnifiedData(year?: number): Promise<UnifiedData> {
    const cacheKey = `enhanced-unified-${year || 'all'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Load all data sources concurrently
      const dataSources = await this.loadAllDataSources(year);

      // Process and merge all data sources
      const processedData = this.processAllDataSources(dataSources, year);

      // Cache the result
      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() });

      return processedData;
    } catch (error) {
      console.error('Error loading unified data:', error);
      throw error;
    }
  }

  // Load all data sources
  private async loadAllDataSources(year?: number): Promise<DataSources> {
    const [
      multiSourceReport,
      organizedJsonData,
      markdownContent,
      pdfDocuments
    ] = await Promise.allSettled([
      this.loadMultiSourceReport(),
      this.loadOrganizedJsonData(),
      this.loadMarkdownContent(),
      this.loadPdfDocuments(year)
    ]);

    return {
      multiSourceReport: multiSourceReport.status === 'fulfilled' ? multiSourceReport.value : null,
      organizedJsonData: organizedJsonData.status === 'fulfilled' ? organizedJsonData.value : { structured: {}, documents: [] },
      markdownContent: markdownContent.status === 'fulfilled' ? markdownContent.value : {},
      pdfDocuments: pdfDocuments.status === 'fulfilled' ? pdfDocuments.value : []
    };
  }

  // Load multi-source report (main hub)
  private async loadMultiSourceReport(): Promise<MultiSourceData | null> {
    try {
      // Load from GitHub or local file
      const response = await fetch('/data/multi_source_report.json');
      if (response.ok) {
        const data = await response.json();
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

  // Load organized JSON data (structured financial and document data)
  private async loadOrganizedJsonData(): Promise<{ structured: StructuredData; documents: Document[] }> {
    const structuredData: StructuredData = {
      budget: null,
      debt: null,
      salaries: null,
      audit: null,
      financial: null
    };

    const documents: Document[] = [];

    try {
      // Load all organized JSON files that are relevant to our data structure
      const jsonFiles = [
        'budget_data.json',
        'debt_data.json', 
        'salaries_data.json',
        'audit_data.json',
        'financial_reports_data.json',
        'investments_assets_data.json',
        'contracts_data.json',
        'property_declaration_data.json'
      ];

      for (const fileName of jsonFiles) {
        try {
          const response = await fetch(`/data/organized_documents/json/${fileName}`);
          if (response.ok) {
            const data = await response.json();
            
            // Map file names to structured data properties
            switch (fileName) {
              case 'budget_data.json':
                structuredData.budget = data;
                break;
              case 'debt_data.json':
                structuredData.debt = data;
                break;
              case 'salaries_data.json':
                structuredData.salaries = data;
                break;
              case 'audit_data.json':
                structuredData.audit = data;
                break;
              case 'financial_reports_data.json':
                structuredData.financial = data;
                break;
              case 'investments_assets_data.json':
                structuredData.investments = data;
                break;
              case 'contracts_data.json':
                structuredData.contracts = data;
                break;
              case 'property_declaration_data.json':
                structuredData.property = data;
                break;
            }
          }
        } catch (error) {
          console.warn(`Failed to load ${fileName}:`, error);
        }
      }

      // Load detailed inventory if available
      try {
        const inventoryResponse = await fetch('/data/organized_analysis/detailed_inventory.json');
        if (inventoryResponse.ok) {
          const inventory = await inventoryResponse.json();
          if (inventory && inventory.documents) {
            documents.push(...inventory.documents.map((doc: any) => ({
              ...doc,
              source: 'organized_inventory',
              verified: true,
              processing_date: new Date().toISOString()
            })));
          }
        }
      } catch (error) {
        console.warn('Detailed inventory not available:', error);
      }

    } catch (error) {
      console.error('Error loading organized JSON data:', error);
    }

    return {
      structured: structuredData,
      documents
    };
  }

  // Load markdown content (narrative content for website pages)
  private async loadMarkdownContent(): Promise<Record<string, any>> {
    // This would typically read markdown files and process them
    // For now, we'll return an empty object as the main focus is on structured data
    return {};
  }

  // Load PDF documents (original document access)
  private async loadPdfDocuments(year?: number): Promise<Document[]> {
    const documents: Document[] = [];
    
    try {
      // This would read PDF metadata from organized_pdfs directory
      // Since we don't have a direct way to list PDFs in the frontend,
      // we'll return an empty array for now and focus on the main data integration
      
      // In a real implementation, this would read from organized_pdfs directory structure
      // For now, we'll just return an empty array since the main focus is on structured data
      return documents;
    } catch (error) {
      console.warn('Error loading PDF documents:', error);
      return documents;
    }
  }

  // Process and merge all data sources
  private processAllDataSources(dataSources: DataSources, year?: number): UnifiedData {
    const allDocuments: Document[] = [];
    const allStructuredData: StructuredData = {
      budget: null,
      debt: null,
      salaries: null,
      audit: null,
      financial: null
    };

    // Process multi-source report documents
    if (dataSources.multiSourceReport?.sources) {
      Object.entries(dataSources.multiSourceReport.sources).forEach(([sourceType, sourceData]: [string, any]) => {
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

    // Process organized JSON data
    if (dataSources.organizedJsonData) {
      // Add structured data
      Object.assign(allStructuredData, dataSources.organizedJsonData.structured);

      // Add organized documents
      allDocuments.push(...dataSources.organizedJsonData.documents);
    }

    // Process markdown content (if any)
    // This would typically be used for narrative content in the website

    // Process PDF documents (if any)
    allDocuments.push(...dataSources.pdfDocuments);

    // Remove duplicates and ensure all documents have required fields
    const uniqueDocuments = this.deduplicateDocuments(allDocuments);

    // Apply year filter if specified
    let filteredDocuments = uniqueDocuments;
    if (year) {
      filteredDocuments = filteredDocuments.filter(doc => doc.year === year);
    }

    // Calculate metadata
    const metadata = {
      last_updated: new Date().toISOString(),
      data_sources: this.countActiveSources(dataSources),
      total_documents: filteredDocuments.length,
      year_coverage: this.getAllYears(filteredDocuments),
      categories: this.getAllCategories(filteredDocuments)
    };

    return {
      multi_source: dataSources.multiSourceReport,
      structured: allStructuredData,
      documents: filteredDocuments,
      metadata
    };
  }

  // Remove duplicate documents
  private deduplicateDocuments(documents: Document[]): Document[] {
    const seen = new Set();
    return documents.filter(doc => {
      // Create a unique key based on title, filename, and category
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
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }

  // Get all categories covered by documents
  private getAllCategories(documents: Document[]): string[] {
    const categories = new Set<string>();
    documents.forEach(doc => {
      if (doc.category) {
        categories.add(doc.category);
      }
    });
    return Array.from(categories).sort();
  }

  // Count active data sources
  private countActiveSources(dataSources: DataSources): number {
    let count = 0;
    if (dataSources.multiSourceReport) count++;
    if (dataSources.organizedJsonData.structured) count++;
    if (Object.keys(dataSources.markdownContent).length > 0) count++;
    if (dataSources.pdfDocuments.length > 0) count++;
    return count;
  }

  // Clear cache
  public clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const enhancedUnifiedDataLoader = EnhancedUnifiedDataLoader.getInstance();

// Hook for using the enhanced data loader
export const useEnhancedUnifiedData = () => {
  // This would be used in React components to access the data
  // Implementation would depend on specific needs
  return {
    loader: enhancedUnifiedDataLoader
  };
};
