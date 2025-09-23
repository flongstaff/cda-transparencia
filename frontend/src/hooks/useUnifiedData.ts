// src/hooks/useUnifiedData.ts
// Unified data hook that ensures all components use the same data sources

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataVerificationService } from '../services/DataVerificationService';
import { dataSyncService } from '../services/DataSyncService';
import { DEFAULT_YEAR } from '../utils/yearConfig'; // Import DEFAULT_YEAR

// Helper functions for markdown generation (moved from useComprehensiveData.ts)
function generateMarkdownDocuments(comprehensiveData: any): any[] {
  const markdownDocs = [];
  const years = ['2022', '2023', '2024', '2025'];
  
  // Generate markdown documents based on known document structure
  const markdownCategories = [
    'ESTADO-DE-EJECUCION-DE-GASTOS',
    'ESTADO-DE-EJECUCION-DE-RECURSOS', 
    'ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO',
    'ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION',
    'ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO',
    'Resolución',
    'NOTAS MONITOREO'
  ];
  
  years.forEach(year => {
    markdownCategories.forEach(category => {
      markdownDocs.push({
        id: `md-${year}-${category}`,
        title: `${category} ${year}`,
        filename: `${category}-${year}.md`,
        category: 'Documentos Digitalizados',
        type: 'markdown',
        year: parseInt(year),
        path: `/data/markdown_documents/${year}/${category}-${year}.md`,
        source: 'markdown_documents',
        verified: true,
        created_at: `${year}-01-01`,
        size: 0
      });
    });
  });
  
  return markdownDocs;
}

function generateMarkdownIndex(comprehensiveData: any) {
  if (!comprehensiveData) return {};
  
  // Generate markdown documents index from comprehensive data
  const years = ['2022', '2023', '2024', '2025'];
  const markdownIndex = {} as any;
  
  years.forEach(year => {
    markdownIndex[year] = [
      {
        filename: `presupuesto_${year}.md`,
        title: `Presupuesto Municipal ${year}`,
        path: `/data/markdown_documents/${year}/presupuesto_${year}.md`
      },
      {
        filename: `ejecucion_gastos_${year}.md`,
        title: `Ejecución de Gastos ${year}`,
        path: `/data/markdown_documents/${year}/ejecucion_gastos_${year}.md`
      },
      {
        filename: `recursos_${year}.md`,
        title: `Ejecución de Recursos ${year}`,
        path: `/data/markdown_documents/${year}/recursos_${year}.md`
      }
    ];
  });
  
  return markdownIndex;
}

export interface UnifiedDataState {
  // Multi‑source data (main hub)
  multi_source: MultiSourceData | null;
  
  // Structured data for charts
  structured: StructuredData;
  
  // Markdown content for narrative
  markdown: MarkdownData;
  
  // PDF documents for original access
  pdfs: PdfData;
  
  // Combined documents for easy access
  documents: Document[];
  
  // Verification data
  verification: VerificationData;
  
  // Sync data
  sync: SyncData;
  
  // Metadata
  metadata: Metadata;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

interface MultiSourceData {
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

interface StructuredData {
  budget: Record<string, any> | null;
  debt: Record<string, any> | null;
  salaries: Record<string, any> | null;
  audit: Record<string, any> | null;
  financial: Record<string, any> | null;
}

interface MarkdownData {
  documents: any[];
  byYear: Record<string, any[]>;
  byCategory: Record<string, any[]>;
}

interface PdfData {
  byYear: Record<string, any[]>;
  byCategory: Record<string, any[]>;
  documents: any[];
}

interface Document {
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
}

interface VerificationData {
  report: VerificationReport | null;
  byDocument: Record<string, VerificationResult>;
  verification_rate: number;
}

interface VerificationReport {
  total_documents: number;
  verified_documents: number;
  pending_verification: number;
  by_document?: Record<string, VerificationResult>;
  verification_rate?: number;
}

// Fix the type issue by ensuring we handle both cases
interface FixedVerificationReport {
  total_documents: number;
  verified_documents: number;
  pending_verification: number;
  by_document?: Record<string, VerificationResult>;
  verification_rate?: number;
}

interface VerificationResult {
  document_id: string;
  verification_status: 'verified' | 'pending' | 'failed';
}

interface SyncData {
  report: SyncReport | null;
  last_sync: string | null;
  sync_status: 'idle' | 'syncing' | 'completed' | 'failed';
}

interface SyncReport {
  end_time: string;
  failed_sources: number;
}

interface Metadata {
  last_updated: string;
  data_sources: number;
  total_documents: number;
  year_coverage: number[];
  verification_status: {
    total: number;
    verified: number;
    pending: number;
  };
}

export interface DataFilters {
  year?: number;
  category?: string;
  type?: string;
  searchTerm?: string;
  verified?: boolean;
  source?: string;
}

// Main unified data hook
export const useUnifiedData = (filters: DataFilters = {}) => {
  const queryResult = useQuery({
    queryKey: ['unifiedData', filters],
    queryFn: async () => {
      // Fetch data directly from GitHub (similar to fetchFromGitHubRepository)
      const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';
      const year = filters.year || DEFAULT_YEAR; // Use DEFAULT_YEAR if no year filter

      const dataUrls = {
        comprehensive: `${GITHUB_RAW_BASE}/frontend/src/data/data_index_${year}.json`,
        detailedInventory: `${GITHUB_RAW_BASE}/data/organized_analysis/detailed_inventory.json`,
        multiSourceReport: `${GITHUB_RAW_BASE}/data/multi_source_report.json`,
        budgetData: `${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`,
        debtData: `${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/debt_monitoring/debt_data_${year}.json`,
        salaryData: `${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/salary_oversight/salary_data_${year}.json`,
        // Add other specific data files as needed, similar to fetchFromGitHubRepository
        // For now, we'll focus on the main ones that populate unifiedData
      };

      const results = {} as any;
      const fetchPromises = Object.entries(dataUrls).map(async ([key, url]) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            results[key] = data;
          } else {
            console.warn(`Failed to fetch ${key} from repository: ${response.status} ${response.statusText}`);
            results[key] = null;
          }
        } catch (error) {
          console.warn(`Failed to fetch ${key} from repository:`, error);
          results[key] = null;
        }
      });
      await Promise.all(fetchPromises);

      // Transform raw results into UnifiedDataState structure
      const unifiedData: UnifiedDataState = {
        multi_source: results.multiSourceReport || null,
        structured: {
          budget: results.comprehensive?.financialOverview || null, // Assuming comprehensive has budget data
          debt: results.comprehensive?.debtData || null,
          salaries: results.comprehensive?.analysis?.salaryData || null,
          audit: results.comprehensive?.governance?.audit_results || null,
          financial: results.comprehensive?.financialOverview || null,
        },
        markdown: {
          documents: generateMarkdownDocuments(results.comprehensive), // Re-use existing helper
          byYear: generateMarkdownIndex(results.comprehensive), // Re-use existing helper
          byCategory: {}, // Will be populated by filteredData
        },
        pdfs: {
          documents: results.detailedInventory?.documents?.filter((doc: any) => doc.type === 'pdf') || [],
          byYear: {}, // Will be populated by filteredData
          byCategory: {}, // Will be populated by filteredData
        },
        documents: [], // Will be populated by filteredData
        verification: {
          report: null, // Will be populated by dataVerificationService
          byDocument: {},
          verification_rate: 0,
        },
        sync: {
          report: null, // Will be populated by dataSyncService
          last_sync: null,
          sync_status: 'idle',
        },
        metadata: {
          last_updated: new Date().toISOString(),
          data_sources: Object.keys(dataUrls).length,
          total_documents: 0, // Will be populated by filteredData
          year_coverage: [], // Will be populated by filteredData
          verification_status: {
            total: 0,
            verified: 0,
            pending: 0,
          },
        },
        loading: false,
        error: null,
      };

      // Verify documents
      const verificationReport = await dataVerificationService.verifyAllDocuments(unifiedData.documents);
      
      // Get latest sync report
      const syncReport = dataSyncService.getLatestSyncReport();
      
      return {
        unifiedData,
        verificationReport,
        syncReport
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Apply filters and transform data
  const filteredData = useMemo(() => {
    if (!queryResult.data) return null;

    const { unifiedData, verificationReport, syncReport } = queryResult.data;
    let filteredDocuments = [...unifiedData.documents];

    // Apply year filter
    if (filters.year) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.year === filters.year
      );
    }

    // Apply category filter
    if (filters.category) {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.category?.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type) {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.type?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Apply search filter
    if (filters.searchTerm) {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.title?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        doc.filename?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        doc.category?.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }

      // Apply verification filter
    if (filters.verified !== undefined) {
      filteredDocuments = filteredDocuments.filter(doc => {
        // Handle both potential structures for verificationReport
        const byDocument = (verificationReport as any).by_document || (verificationReport as any).byDocument;
        const verificationResult = byDocument?.[doc.id];
        const isVerified = verificationResult?.verification_status === 'verified';
        return filters.verified ? isVerified : !isVerified;
      });
    }

    // Fix missing type for documents array
    const finalDocuments = filteredDocuments.map(doc => ({
      ...doc,
      id: doc.id || Math.random().toString(36).substr(2, 9),
      title: doc.title || 'Untitled Document',
      category: doc.category || 'General',
      type: doc.type || 'unknown',
      filename: doc.filename || 'unnamed.md',
      size_mb: doc.size_mb || 0,
      url: doc.url || '',
      year: doc.year || new Date().getFullYear(),
      verified: doc.verified !== undefined ? doc.verified : false,
      processing_date: doc.processing_date || new Date().toISOString(),
      integrity_verified: doc.integrity_verified !== undefined ? doc.integrity_verified : false,
      source: doc.source || 'unknown'
    }));

    // Apply source filter
    if (filters.source) {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.source === filters.source
      );
    }

    // Group documents by year and category
    const byYear = filteredDocuments.reduce((acc, doc) => {
      const year = doc.year?.toString() || 'unknown';
      if (!acc[year]) acc[year] = [];
      acc[year].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    const byCategory = filteredDocuments.reduce((acc, doc) => {
      const category = doc.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      ...unifiedData,
      documents: filteredDocuments,
      markdown: {
        documents: unifiedData.markdown?.documents || [],
        byYear: unifiedData.markdown?.byYear || {},
        byCategory: unifiedData.markdown?.byCategory || {}
      },
      pdfs: {
        byYear,
        byCategory,
        documents: filteredDocuments.filter(doc => doc.type === 'pdf')
      },
      verification: {
        report: verificationReport,
        byDocument: (verificationReport as any).by_document || (verificationReport as any).byDocument || {},
        verification_rate: verificationReport.verification_rate || 0
      },
      sync: {
        report: syncReport,
        last_sync: syncReport?.end_time || null,
        sync_status: syncReport ? 'completed' : 'idle'
      },
      metadata: {
        ...unifiedData.metadata,
        total_documents: filteredDocuments.length,
        verification_status: {
          total: verificationReport.total_documents,
          verified: verificationReport.verified_documents,
          pending: verificationReport.pending_verification
        }
      }
    };
  }, [queryResult.data, filters]);

  const syncData = useCallback(async () => {
    try {
      // You might want to update some state to indicate syncing is in progress
      await dataSyncService.synchronizeAllSources();
      await queryResult.refetch();
    } catch (error) {
      console.error('Error syncing data:', error);
      // You might want to update some state to indicate syncing failed
    }
  }, [queryResult]);

  return {
    data: filteredData,
    refetch: queryResult.refetch,
    syncData,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
  };
};

// Specialized hooks for specific data types

// Hook for budget data (structured JSON for charts)
export const useBudgetData = (year?: number) => {
  const { data, isLoading, isError, error } = useUnifiedData({ year });
  
  return {
    data: data?.structured.budget,
    loading: isLoading,
    error: isError ? error : null,
  };
};

// Hook for debt data (structured JSON for charts)
export const useDebtData = (year?: number) => {
  const { data, isLoading, isError, error } = useUnifiedData({ year });
  
  return {
    data: data?.structured.debt,
    loading: isLoading,
    error: isError ? error : null,
  };
};

// Hook for markdown content (narrative content)
export const useMarkdownContent = (category?: string, year?: number) => {
  const { data, isLoading, isError, error } = useUnifiedData({ category, year });
  
  return {
    documents: data?.markdown.documents,
    byYear: data?.markdown.byYear,
    byCategory: data?.markdown.byCategory,
    loading: isLoading,
    error: isError ? error : null,
  };
};

// Hook for PDF documents (original documents)
export const usePdfDocuments = (category?: string, year?: number) => {
  const { data, isLoading, isError, error } = useUnifiedData({ category, year });
  
  return {
    documents: data?.pdfs.documents,
    byYear: data?.pdfs.byYear,
    byCategory: data?.pdfs.byCategory,
    loading: isLoading,
    error: isError ? error : null,
  };
};

// Hook for multi-source report data (main hub)
export const useMultiSourceData = () => {
  const { data, isLoading, isError, error } = useUnifiedData();
  
  return {
    data: data?.multi_source,
    loading: isLoading,
    error: isError ? error : null,
  };
};

// Hook for verification data
export const useVerificationData = () => {
  const { data, isLoading, isError, error } = useUnifiedData();
  
  return {
    report: data?.verification.report,
    byDocument: data?.verification.byDocument,
    verification_rate: data?.verification.verification_rate,
    loading: isLoading,
    error: isError ? error : null,
  };
};

// Hook for sync data
export const useSyncData = () => {
  const { data, syncData, isLoading, isError, error } = useUnifiedData();
  
  return {
    report: data?.sync.report,
    last_sync: data?.sync.last_sync,
    sync_status: data?.sync.sync_status,
    syncData,
    loading: isLoading,
    error: isError ? error : null,
  };
};

export default {
  useUnifiedData,
  useBudgetData,
  useDebtData,
  useMarkdownContent,
  usePdfDocuments,
  useMultiSourceData,
  useVerificationData,
  useSyncData
};
