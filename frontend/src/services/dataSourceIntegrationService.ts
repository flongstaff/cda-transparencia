// dataSourceIntegrationService.ts - Service that integrates all available data sources in the repository
import { comprehensiveDataIntegrationService } from './comprehensiveDataIntegrationService';
import { moneyFlowTrackingService } from './moneyFlowTrackingService';

// Document metadata interface
export interface DocumentMetadata {
  id: string;
  title: string;
  category: string;
  type: 'pdf' | 'json' | 'markdown' | 'excel' | 'csv';
  filename: string;
  size_mb: number;
  url: string;
  year: number;
  verified: boolean;
  processing_date: string;
  integrity_verified: boolean;
  source: string;
  file_path?: string;
  original_document_url?: string;
  content?: any;
  markdown_content?: string;
}

// Data source integration service class
class DataSourceIntegrationService {
  private static instance: DataSourceIntegrationService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): DataSourceIntegrationService {
    if (!DataSourceIntegrationService.instance) {
      DataSourceIntegrationService.instance = new DataSourceIntegrationService();
    }
    return DataSourceIntegrationService.instance;
  }

  /**
   * Get all available data sources organized by type and year
   */
  public async getAllDataSources(): Promise<{
    financialData: any[];
    contractData: any[];
    documentData: DocumentMetadata[];
    moneyFlowData: any[];
    unifiedData: any;
  }> {
    const cacheKey = 'all-data-sources';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Load all data in parallel
      const [
        comprehensiveData,
        moneyFlowAnalysis
      ] = await Promise.all([
        comprehensiveDataIntegrationService.loadComprehensiveData(),
        moneyFlowTrackingService.trackMoneyFlow()
      ]);

      // Extract financial data
      const financialData: any[] = [];
      Object.entries(comprehensiveData.structured.financial).forEach(([year, data]) => {
        financialData.push({
          year: parseInt(year),
          ...data
        });
      });

      // Extract contract data
      const contractData: any[] = [];
      Object.entries(comprehensiveData.structured.contracts).forEach(([year, contracts]) => {
        if (Array.isArray(contracts)) {
          contractData.push(...contracts.map(contract => ({
            ...contract,
            year: parseInt(year)
          })));
        }
      });

      // Extract document data
      const documentData: DocumentMetadata[] = comprehensiveData.documents.all.map(doc => ({
        ...doc,
        verified: doc.verified || false,
        integrity_verified: doc.integrity_verified || false
      }));

      // Extract money flow data
      const moneyFlowData = moneyFlowAnalysis.yearlySummaries;

      // Extract unified data
      const unifiedData = comprehensiveData;

      const result = {
        financialData,
        contractData,
        documentData,
        moneyFlowData,
        unifiedData
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error loading all data sources:', error);
      throw error;
    }
  }

  /**
   * Get data for a specific year
   */
  public async getDataForYear(year: number): Promise<{
    financialData: any;
    contractData: any[];
    documentData: DocumentMetadata[];
    moneyFlowData: any;
    unifiedData: any;
  }> {
    const cacheKey = `data-for-year-${year}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Load data for specific year
      const [
        comprehensiveData,
        moneyFlowAnalysis
      ] = await Promise.all([
        comprehensiveDataIntegrationService.getDataForYear(year),
        moneyFlowTrackingService.getMoneyFlowForYear(year)
      ]);

      // Extract financial data for the year
      const financialData = comprehensiveData.structured.financial[year] || null;

      // Extract contract data for the year
      const contractData = comprehensiveData.structured.contracts[year] || [];

      // Extract document data for the year
      const documentData = comprehensiveData.documents.all.filter(doc => doc.year === year);

      // Extract money flow data for the year
      const moneyFlowData = moneyFlowAnalysis.yearlySummaries.find(y => y.year === year) || null;

      // Extract unified data for the year
      const unifiedData = comprehensiveData;

      const result = {
        financialData,
        contractData,
        documentData,
        moneyFlowData,
        unifiedData
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  public async getDocumentById(id: string): Promise<DocumentMetadata | null> {
    try {
      const allData = await this.getAllDataSources();
      return allData.documentData.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error(`Error loading document ${id}:`, error);
      return null;
    }
  }

  /**
   * Search documents by term
   */
  public async searchDocuments(term: string): Promise<DocumentMetadata[]> {
    try {
      const allData = await this.getAllDataSources();
      const lowerTerm = term.toLowerCase();
      
      return allData.documentData.filter(doc => 
        doc.title.toLowerCase().includes(lowerTerm) ||
        doc.category.toLowerCase().includes(lowerTerm) ||
        doc.filename.toLowerCase().includes(lowerTerm) ||
        (doc.content && JSON.stringify(doc.content).toLowerCase().includes(lowerTerm)) ||
        (doc.markdown_content && doc.markdown_content.toLowerCase().includes(lowerTerm))
      );
    } catch (error) {
      console.error(`Error searching documents for term "${term}":`, error);
      return [];
    }
  }

  /**
   * Get documents by category
   */
  public async getDocumentsByCategory(category: string): Promise<DocumentMetadata[]> {
    try {
      const allData = await this.getAllDataSources();
      return allData.documentData.filter(doc => doc.category === category);
    } catch (error) {
      console.error(`Error loading documents for category "${category}":`, error);
      return [];
    }
  }

  /**
   * Get documents by year
   */
  public async getDocumentsByYear(year: number): Promise<DocumentMetadata[]> {
    try {
      const allData = await this.getAllDataSources();
      return allData.documentData.filter(doc => doc.year === year);
    } catch (error) {
      console.error(`Error loading documents for year ${year}:`, error);
      return [];
    }
  }

  /**
   * Get documents by type
   */
  public async getDocumentsByType(type: string): Promise<DocumentMetadata[]> {
    try {
      const allData = await this.getAllDataSources();
      return allData.documentData.filter(doc => doc.type === type);
    } catch (error) {
      console.error(`Error loading documents of type "${type}":`, error);
      return [];
    }
  }

  /**
   * Get all unique categories
   */
  public async getAllCategories(): Promise<string[]> {
    try {
      const allData = await this.getAllDataSources();
      const categories = new Set<string>();
      
      allData.documentData.forEach(doc => {
        categories.add(doc.category);
      });
      
      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  /**
   * Get all available years
   */
  public async getAllYears(): Promise<number[]> {
    try {
      const allData = await this.getAllDataSources();
      const years = new Set<number>();
      
      allData.documentData.forEach(doc => {
        years.add(doc.year);
      });
      
      return Array.from(years).sort((a, b) => b - a); // Descending order
    } catch (error) {
      console.error('Error loading years:', error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  public getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const dataSourceIntegrationService = DataSourceIntegrationService.getInstance();
export default dataSourceIntegrationService;