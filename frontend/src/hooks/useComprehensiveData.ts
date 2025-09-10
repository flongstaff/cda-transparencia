import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/transparency';
const USE_API = import.meta.env.VITE_USE_API === 'true';

export interface ComprehensiveDataState {
  // Core data
  documents: any[];
  budgetData: any;
  salaryData: any;
  debtData: any;
  auditResults: any;
  
  // Analysis data
  financialAnalysis: any;
  transparencyMetrics: any;
  anomalyDetection: any;
  
  // Document categories
  contractsData: any[];
  declarationsData: any[];
  executionData: any[];
  resourcesData: any[];
  
  // State management
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface DataFilters {
  year?: number;
  category?: string;
  type?: string;
  searchTerm?: string;
}

/**
 * Comprehensive data hook that integrates all available data sources:
 * - Local organized JSON files
 * - Database documents  
 * - Analysis results
 * - PDF markdown extracts
 * - API endpoints
 */
export const useComprehensiveData = (filters: DataFilters = {}) => {
  const [data, setData] = useState<ComprehensiveDataState>({
    documents: [],
    budgetData: null,
    salaryData: null,
    debtData: null,
    auditResults: null,
    financialAnalysis: null,
    transparencyMetrics: null,
    anomalyDetection: null,
    contractsData: [],
    declarationsData: [],
    executionData: [],
    resourcesData: [],
    loading: false,
    error: null,
    lastUpdated: null
  });

  const fetchComprehensiveData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await Promise.allSettled([
        // Core API calls
        fetchAPIData('documents', filters),
        fetchAPIData('financial', filters),
        fetchAPIData('budget', filters),
        fetchAPIData('debt', filters),
        
        // Organized data from local files
        fetchOrganizedData('budget_analysis', filters.year || 2024),
        fetchOrganizedData('salary_oversight', filters.year || 2024),
        fetchOrganizedData('debt_monitoring', filters.year || 2024),
        fetchOrganizedData('audit_results', filters.year || 2024),
        
        // Document categories
        fetchCategoryData('Contrataciones'),
        fetchCategoryData('Declaraciones_Patrimoniales'),
        fetchCategoryData('Ejecución_de_Gastos'),
        fetchCategoryData('Ejecución_de_Recursos')
      ]);

      // Process results
      const [
        documents, financial, budget, debt,
        budgetAnalysis, salaryAnalysis, debtAnalysis, auditResults,
        contracts, declarations, execution, resources
      ] = results.map(result => result.status === 'fulfilled' ? result.value : null);

      setData({
        documents: documents?.data || [],
        budgetData: budget?.data || budgetAnalysis,
        salaryData: salaryAnalysis,
        debtData: debt?.data || debtAnalysis,
        auditResults: auditResults,
        financialAnalysis: financial?.data,
        transparencyMetrics: calculateTransparencyMetrics(documents?.data || []),
        anomalyDetection: auditResults?.anomalies || [],
        contractsData: contracts || [],
        declarationsData: declarations || [],
        executionData: execution || [],
        resourcesData: resources || [],
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error fetching comprehensive data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error loading data'
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchComprehensiveData();
  }, [fetchComprehensiveData]);

  return { ...data, refetch: fetchComprehensiveData };
};

// Helper functions
async function fetchAPIData(endpoint: string, filters: DataFilters) {
  if (!USE_API) return null;
  
  try {
    const queryParams = new URLSearchParams();
    if (filters.year) queryParams.append('year', filters.year.toString());
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
    
    const url = `${API_BASE}/${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`API fetch failed for ${endpoint}:`, error);
    return null;
  }
}

async function fetchOrganizedData(type: string, year: number) {
  try {
    // Try to fetch from organized analysis data
    const paths = {
      budget_analysis: `/data/organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`,
      salary_oversight: `/data/organized_analysis/financial_oversight/salary_oversight/salary_data_${year}.json`,
      debt_monitoring: `/data/organized_analysis/financial_oversight/debt_monitoring/debt_data_${year}.json`,
      audit_results: `/data/organized_analysis/audit_cycles/enhanced_audits/enhanced_audit_results.json`
    };

    const path = paths[type as keyof typeof paths];
    if (!path) return null;

    const response = await fetch(path);
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch organized data for ${type}:`, error);
    return null;
  }
}

async function fetchCategoryData(category: string) {
  try {
    // Try to fetch category-specific data from organized documents
    const response = await fetch(`/data/organized_analysis/data_analysis/csv_exports/category_${category}.csv`);
    if (!response.ok) return [];
    
    const csvText = await response.text();
    return parseCSVToJSON(csvText);
  } catch (error) {
    console.warn(`Failed to fetch category data for ${category}:`, error);
    return [];
  }
}

function parseCSVToJSON(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

function calculateTransparencyMetrics(documents: any[]): any {
  const currentYear = new Date().getFullYear();
  const recentDocs = documents.filter(doc => {
    const docYear = new Date(doc.date || doc.created_at || 0).getFullYear();
    return docYear >= currentYear - 1;
  });

  const categoryCount = new Set(documents.map(doc => doc.category)).size;
  const verifiedDocs = documents.filter(doc => doc.verified === true).length;
  
  return {
    totalDocuments: documents.length,
    recentDocuments: recentDocs.length,
    categoryCoverage: categoryCount,
    verificationRate: documents.length > 0 ? (verifiedDocs / documents.length) * 100 : 0,
    transparencyScore: Math.min(100, Math.floor(
      (recentDocs.length * 0.4 + categoryCount * 5 + verifiedDocs * 0.6) / 10
    ))
  };
}

// Specialized hooks for specific data types
export const useBudgetAnalysis = (year: number = 2024) => {
  const { budgetData, financialAnalysis, loading, error } = useComprehensiveData({ year });
  
  return {
    budgetData,
    financialAnalysis,
    executionRate: budgetData?.executionPercentage || 0,
    categories: budgetData?.categories || [],
    loading,
    error
  };
};

export const useDocumentAnalysis = (filters: DataFilters = {}) => {
  const { documents, transparencyMetrics, loading, error } = useComprehensiveData(filters);
  
  return {
    documents,
    metrics: transparencyMetrics,
    totalCount: documents.length,
    byCategory: groupByCategory(documents),
    byYear: groupByYear(documents),
    loading,
    error
  };
};

export const useFinancialOverview = (year: number = 2024) => {
  const { 
    budgetData, 
    debtData, 
    financialAnalysis, 
    transparencyMetrics, 
    loading, 
    error 
  } = useComprehensiveData({ year });
  
  return {
    budget: budgetData,
    debt: debtData,
    analysis: financialAnalysis,
    transparency: transparencyMetrics,
    loading,
    error
  };
};

// Helper functions for data grouping
function groupByCategory(documents: any[]): Record<string, any[]> {
  return documents.reduce((acc, doc) => {
    const category = doc.category || 'Sin Categoría';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, any[]>);
}

function groupByYear(documents: any[]): Record<string, any[]> {
  return documents.reduce((acc, doc) => {
    const year = new Date(doc.date || doc.created_at || 0).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(doc);
    return acc;
  }, {} as Record<string, any[]>);
}