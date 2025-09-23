import { useMemo } from 'react';
import { useUnifiedData } from './useUnifiedData';

export interface UnifiedTransparencyData {
  // Complete data payload from backend
  year: number | null;
  financialOverview: FinancialOverview | null;
  budgetBreakdown: BudgetBreakdownItem[] | null;
  documents: Document[] | null;
  dashboard: DashboardData | null;
  spendingEfficiency: SpendingEfficiency | null;
  auditOverview: AuditOverview | null;
  antiCorruption: AntiCorruptionData | null;
  // Loading & error states
  loading: boolean;
  error: string | null;
  // Metadata
  generated_at: string | null;
  // Consistency check data
  consistency_check: ConsistencyCheck | null;
}

interface FinancialOverview {
  totalBudget: number;
  totalExecuted: number;
  executionRate: number;
  totalRevenue: number;
  totalDebt: number;
  transparencyScore: number;
}

interface BudgetBreakdownItem {
  name: string;
  budgeted: number;
  executed: number;
  execution_rate: number;
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
}

interface DashboardData {
  totalDocuments: number;
  categoriesCount: number;
  lastUpdate: string;
  dataSources: number;
}

interface SpendingEfficiency {
  efficiency_score: number;
  variance_analysis: string;
  recommendations: string[];
}

interface AuditOverview {
  findings: number;
  recommendations: number;
  compliance_score: number;
}

interface AntiCorruptionData {
  transparency_index: number;
  public_access_score: number;
  disclosure_completeness: number;
}

interface ConsistencyCheck {
  documents_expected: number | null;
  documents_received: number | null;
  data_complete: boolean | null;
}

export const useUnifiedTransparencyData = (year: number) => {
  // Use the unified data hook as the source of truth
  const { 
    multi_source, 
    structured, 
    documents, 
    metadata, 
    loading, 
    error 
  } = useUnifiedData({ year });

  // Transform the unified data into the transparency interface
  const transparencyData = useMemo<UnifiedTransparencyData>(() => {
    if (!year || loading) {
      return {
        year: null,
        financialOverview: null,
        budgetBreakdown: null,
        documents: [],
        dashboard: null,
        spendingEfficiency: null,
        auditOverview: null,
        antiCorruption: null,
        loading,
        error: error ? error.message : null,
        generated_at: null,
        consistency_check: null,
      };
    }

    // Financial Overview from structured data
    const financialOverview: FinancialOverview = structured.financial || null; // structured.financial should contain the overall financial overview

    // Budget Breakdown from structured data
    const budgetBreakdown = structured.budget?.categories ? // structured.budget should contain the budget data for the selected year
      structured.budget.categories.map((item: any) => ({
        name: item.name,
        budgeted: item.budgeted || 0,
        executed: item.executed || 0,
        execution_rate: item.execution_rate || 0,
      })) : null;

    // Dashboard data from metadata and document counts
    const dashboard: DashboardData = {
      totalDocuments: documents.length,
      categoriesCount: Object.keys(
        documents.reduce((acc, doc) => {
          acc[doc.category] = true;
          return acc;
        }, {} as Record<string, boolean>)
      ).length,
      lastUpdate: metadata.last_updated,
      dataSources: metadata.data_sources,
    };

    // Spending Efficiency from structured data (if present)
    const spendingEfficiency: SpendingEfficiency = structured.financial?.spendingEfficiency || null; // Assuming spendingEfficiency is part of financial overview

    // Audit Overview from structured data
    const auditOverview: AuditOverview = structured.audit || null; // structured.audit should contain the overall audit overview

    // Anti‑corruption data from multi‑source
    const antiCorruption: AntiCorruptionData = multi_source?.governance?.anti_corruption ?? null;

    // Consistency check
    const consistency_check: ConsistencyCheck = {
      documents_expected: multi_source?.metadata?.total_documents || null,
      documents_received: documents.length,
      data_complete: documents.length > 0,
    };

    return {
      year,
      financialOverview,
      budgetBreakdown,
      documents,
      dashboard,
      spendingEfficiency,
      auditOverview,
      antiCorruption,
      loading,
      error: error ? error.message : null,
      generated_at: metadata.last_updated,
      consistency_check,
    };
  }, [year, multi_source, structured, documents, metadata, loading, error]);

  return transparencyData;
};