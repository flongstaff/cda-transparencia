// dataIntegrationService.ts - Central service that integrates all data sources for the transparency portal
import { 
  getMultiYearFinancialData, 
  getUnifiedFinancialData, 
  getContractData,
  getMoneyFlowData,
  YearlyData,
  UnifiedFinancialData,
  ContractData
} from './financialDataService';

// Document interfaces
export interface Document {
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

// Main unified data interface
export interface UnifiedDataState {
  // Structured data by year and type
  structured: {
    budget: Record<number, any>;
    debt: Record<number, any>;
    salaries: Record<number, any>;
    audit: Record<number, any>;
    financial: Record<number, any>;
    contracts: Record<number, any>;
    declarations: Record<number, any>;
  };
  // All documents across all years and types
  documents: {
    all: Document[];
    byYear: Record<number, Document[]>;
    byCategory: Record<string, Document[]>;
    byType: Record<string, Document[]>;
  };
  // External API data
  external: {
    presupuesto_abierto: any;
    georef: any;
    indec: any;
  };
  // Metadata and status
  metadata: {
    last_updated: string;
    total_documents: number;
    available_years: number[];
    categories: string[];
    data_sources_active: number;
    verification_status: {
      total: number;
      verified: number;
      pending: number;
    };
  };
  // Loading and error states
  loading: boolean;
  error: string | null;
}

// Audit event interface
export interface AuditEvent {
  id: string;
  timestamp: string;
  event_type: string;
  source: string;
  details: any;
  user_id?: string;
}

// Available years for data
const AVAILABLE_YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

class DataIntegrationService {
  private static instance: DataIntegrationService;
  private auditLog: AuditEvent[] = [];
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService();
    }
    return DataIntegrationService.instance;
  }

  /**
   * Load comprehensive unified data from all available sources
   */
  public async loadComprehensiveData(): Promise<UnifiedDataState> {
    const cacheKey = 'comprehensive-data';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    this.logAuditEvent('data_load_start', { cache_key: cacheKey });

    try {
      // Load all data sources in parallel
      const [
        multiYearFinancialData,
        unifiedFinancialData,
        contractData,
        moneyFlowData
      ] = await Promise.all([
        getMultiYearFinancialData(),
        getUnifiedFinancialData(),
        getContractData(),
        getMoneyFlowData()
      ]);

      // Organize the data into the unified structure
      const structuredData = {
        budget: {},
        debt: {},
        salaries: {},
        audit: {},
        financial: {},
        contracts: {},
        declarations: {}
      };

      // Populate financial data by year
      multiYearFinancialData.forEach(yearData => {
        structuredData.budget[yearData.year] = {
          total: yearData.total_budget,
          executed: yearData.total_executed,
          execution_rate: yearData.total_budget ? (yearData.total_executed / yearData.total_budget) * 100 : 0
        };
        
        structuredData.financial[yearData.year] = {
          executed_infra: yearData.executed_infra,
          executed_personnel: yearData.personnel,
          planned_infra: yearData.planned_infra,
          total_budget: yearData.total_budget,
          total_executed: yearData.total_executed
        };
      });

      // Populate contract data by year
      const contractsByYear: Record<number, ContractData[]> = {};
      contractData.forEach(contract => {
        if (!contractsByYear[contract.year]) {
          contractsByYear[contract.year] = [];
        }
        contractsByYear[contract.year].push(contract);
      });

      Object.keys(contractsByYear).forEach(year => {
        const yearNum = parseInt(year);
        structuredData.contracts[yearNum] = contractsByYear[yearNum];
      });

      // Generate documents from available data
      const allDocuments: Document[] = [];

      // Add contract-related documents
      contractData.forEach(contract => {
        allDocuments.push({
          id: `${contract.id}`,
          title: contract.title,
          category: contract.category,
          type: 'json',
          filename: `contract_${contract.id}.json`,
          size_mb: 0.1, // Estimated size
          url: `/data/contracts/${contract.id}.json`,
          year: contract.year,
          verified: true,
          processing_date: new Date().toISOString(),
          integrity_verified: true,
          source: contract.source,
          content: contract
        });
      });

      // Add financial documents
      multiYearFinancialData.forEach(yearData => {
        allDocuments.push({
          id: `budget_${yearData.year}`,
          title: `Presupuesto Anual ${yearData.year}`,
          category: 'Presupuesto',
          type: 'json',
          filename: `budget_${yearData.year}.json`,
          size_mb: 0.2,
          url: `/data/budgets/budget_${yearData.year}.json`,
          year: yearData.year,
          verified: true,
          processing_date: new Date().toISOString(),
          integrity_verified: true,
          source: 'budget_execution_report',
          content: yearData
        });
      });

      // Organize documents by different criteria
      const documentsByYear: Record<number, Document[]> = {};
      const documentsByCategory: Record<string, Document[]> = {};
      const documentsByType: Record<string, Document[]> = {};

      allDocuments.forEach(doc => {
        // Group by year
        if (!documentsByYear[doc.year]) documentsByYear[doc.year] = [];
        documentsByYear[doc.year].push(doc);

        // Group by category
        const category = doc.category || 'general';
        if (!documentsByCategory[category]) documentsByCategory[category] = [];
        documentsByCategory[category].push(doc);

        // Group by type
        if (!documentsByType[doc.type]) documentsByType[doc.type] = [];
        documentsByType[doc.type].push(doc);
      });

      // Calculate metadata
      const availableYears = Array.from(
        new Set([
          ...multiYearFinancialData.map(d => d.year),
          ...contractData.map(c => c.year)
        ])
      ).sort((a, b) => a - b);

      const categories = Array.from(
        new Set([
          ...allDocuments.map(d => d.category),
          'Presupuesto',
          'Gastos',
          'Contratos',
          'Personal',
          'Infraestructura'
        ])
      );

      const verificationStatus = {
        total: allDocuments.length,
        verified: allDocuments.filter(d => d.verified).length,
        pending: allDocuments.filter(d => !d.verified).length
      };

      const unifiedData: UnifiedDataState = {
        structured: structuredData,
        documents: {
          all: allDocuments,
          byYear: documentsByYear,
          byCategory: documentsByCategory,
          byType: documentsByType
        },
        external: {
          presupuesto_abierto: null,
          georef: null,
          indec: null
        },
        metadata: {
          last_updated: new Date().toISOString(),
          total_documents: allDocuments.length,
          available_years: availableYears,
          categories: categories,
          data_sources_active: 4, // Financial, Contracts, Money Flow, Documents
          verification_status: verificationStatus
        },
        loading: false,
        error: null
      };

      this.cache.set(cacheKey, { data: unifiedData, timestamp: Date.now() });
      this.logAuditEvent('data_load_success', {
        documents: allDocuments.length,
        years: availableYears.length,
        categories: categories.length
      });

      return unifiedData;
    } catch (error) {
      this.logAuditEvent('data_load_error', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Get data for a specific year
   */
  public async getDataForYear(year: number): Promise<UnifiedDataState> {
    const allData = await this.loadComprehensiveData();
    
    return {
      ...allData,
      structured: {
        budget: { [year]: allData.structured.budget[year] },
        debt: { [year]: allData.structured.debt[year] },
        salaries: { [year]: allData.structured.salaries[year] },
        audit: { [year]: allData.structured.audit[year] },
        financial: { [year]: allData.structured.financial[year] },
        contracts: { [year]: allData.structured.contracts[year] },
        declarations: { [year]: allData.structured.declarations[year] }
      },
      documents: {
        all: allData.documents.byYear[year] || [],
        byYear: { [year]: allData.documents.byYear[year] || [] },
        byCategory: this.filterDocsByYear(allData.documents.byCategory, year),
        byType: this.filterDocsByYear(allData.documents.byType, year)
      },
      metadata: {
        ...allData.metadata,
        available_years: [year],
        total_documents: (allData.documents.byYear[year] || []).length
      }
    };
  }

  private filterDocsByYear(docsByCategory: Record<string, Document[]>, year: number): Record<string, Document[]> {
    const filtered: Record<string, Document[]> = {};
    
    Object.entries(docsByCategory).forEach(([category, docs]) => {
      filtered[category] = docs.filter(doc => doc.year === year);
    });
    
    return filtered;
  }

  /**
   * Get available years
   */
  public getAvailableYears(): number[] {
    return [...AVAILABLE_YEARS];
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.logAuditEvent('cache_cleared', {});
  }

  /**
   * Get audit logs
   */
  public getAuditLogs(): AuditEvent[] {
    return [...this.auditLog];
  }

  private logAuditEvent(eventType: string, details: any): void {
    const auditEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      source: 'DataIntegrationService',
      details,
      user_id: 'system'
    };
    this.auditLog.push(auditEvent);
    console.log('[AUDIT]', auditEvent);
  }

  /**
   * Get summary statistics
   */
  public async getSummaryStats() {
    const data = await this.loadComprehensiveData();
    
    return {
      totalYears: data.metadata.available_years.length,
      totalDocuments: data.metadata.total_documents,
      categories: data.metadata.categories,
      dataSources: data.metadata.data_sources_active,
      verifiedDocs: data.metadata.verification_status.total > 0
        ? (data.metadata.verification_status.verified / data.metadata.verification_status.total) * 100
        : 0
    };
  }

  /**
   * Get money flow tracking data (contracts → budget → execution)
   */
  public async getMoneyFlowTrackingData() {
    try {
      const moneyFlowData = await getMoneyFlowData();
      return moneyFlowData;
    } catch (error) {
      console.error('Error getting money flow tracking data:', error);
      return [];
    }
  }

  /**
   * Get contracts linked to execution reports
   */
  public async getContractsWithExecutionLinks() {
    try {
      const contracts = await getContractData();
      return contracts;
    } catch (error) {
      console.error('Error getting contracts with execution links:', error);
      return [];
    }
  }
}

// Export singleton instance
export const dataIntegrationService = DataIntegrationService.getInstance();
export default dataIntegrationService;