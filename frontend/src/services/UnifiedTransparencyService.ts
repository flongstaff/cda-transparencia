/**
 * Unified Transparency Service
 * Single source of truth for all transparency data
 * Consolidates all existing services into one clean interface
 */

import { completeFinalDataService, CompleteFinalData } from './CompleteFinalDataService';

// Re-export all types from the most comprehensive service
export type {
  CompleteDocument,
  CompleteFinalData,
  YearData,
  BudgetData,
  SalaryData,
  ContractData
} from './CompleteFinalDataService';

export interface TransparencyMetrics {
  totalDocuments: number;
  availableYears: number[];
  categories: string[];
  auditCompletionRate: number;
  totalBudget: number;
  totalExecuted: number;
  executionRate: number;
  externalSourcesActive: number;
}

export interface TransparencyData {
  // Complete system data
  completeData: CompleteFinalData | null;
  
  // Current year data
  currentYearData: {
    documents: any[];
    budget: any;
    salaries: any;
    contracts: any;
  } | null;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Metrics
  metrics: TransparencyMetrics;
  
  // Actions
  refetch: () => Promise<void>;
  clearCache: () => void;
}

class UnifiedTransparencyService {
  private static instance: UnifiedTransparencyService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): UnifiedTransparencyService {
    if (!UnifiedTransparencyService.instance) {
      UnifiedTransparencyService.instance = new UnifiedTransparencyService();
    }
    return UnifiedTransparencyService.instance;
  }

  /**
   * Load complete transparency data
   */
  async loadCompleteData(selectedYear?: number): Promise<TransparencyData> {
    try {
      const data = await completeFinalDataService.loadCompleteData();
      
      // Extract current year data
      const yearData = selectedYear && data.byYear[selectedYear] 
        ? data.byYear[selectedYear] 
        : null;
      
      // Calculate metrics
      const metrics: TransparencyMetrics = {
        totalDocuments: data.summary.total_documents,
        availableYears: data.summary.years_covered,
        categories: data.summary.categories,
        auditCompletionRate: data.summary.audit_completion_rate,
        totalBudget: data.summary.total_budget || 0,
        totalExecuted: data.summary.total_executed || 0,
        executionRate: data.summary.execution_rate || 0,
        externalSourcesActive: data.summary.external_sources_active
      };
      
      return {
        completeData: data,
        currentYearData: yearData ? {
          documents: yearData.documents,
          budget: yearData.budget,
          salaries: yearData.salaries,
          contracts: yearData.contracts
        } : null,
        loading: false,
        error: null,
        metrics,
        refetch: async () => {
          completeFinalDataService.clearCache();
          return this.loadCompleteData(selectedYear);
        },
        clearCache: () => {
          completeFinalDataService.clearCache();
        }
      };
    } catch (error: any) {
      return {
        completeData: null,
        currentYearData: null,
        loading: false,
        error: error.message || 'Failed to load transparency data',
        metrics: {
          totalDocuments: 0,
          availableYears: [],
          categories: [],
          auditCompletionRate: 0,
          totalBudget: 0,
          totalExecuted: 0,
          executionRate: 0,
          externalSourcesActive: 0
        },
        refetch: async () => this.loadCompleteData(selectedYear),
        clearCache: () => completeFinalDataService.clearCache()
      };
    }
  }

  /**
   * Get document content
   */
  async getDocumentContent(document: any): Promise<any> {
    try {
      // Try JSON first, then markdown, then PDF
      if (document.json_url) {
        const response = await fetch(document.json_url);
        if (response.ok) {
          return await response.json();
        }
      }

      if (document.markdown_url) {
        const response = await fetch(document.markdown_url);
        if (response.ok) {
          return await response.text();
        }
      }

      if (document.content) {
        return document.content;
      }

      throw new Error('No content available for this document');
    } catch (error) {
      console.error('Failed to load document content:', error);
      throw error;
    }
  }
}

export const unifiedTransparencyService = UnifiedTransparencyService.getInstance();
export default unifiedTransparencyService;