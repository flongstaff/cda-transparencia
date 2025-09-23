import { useState, useEffect } from 'react';
import { useUnifiedData } from './useUnifiedData';
import { filterDocumentsByYear } from '../utils/documentProcessor';

export interface YearData {
  categories: Record<string, number> | null;
  documents: Document[] | null;
  total_documents: number | null;
  loading: boolean;
  error: string | null;
}

interface Document {
  id: string;
  title: string;
  category: string;
  year: number;
  filename: string;
  type: string;
  url: string;
  size_mb: number;
  verified: boolean;
  processing_date: string;
  integrity_verified: boolean;
}

export const useYearData = (selectedYear: number | null) => {
  // Use the unified data hook as the source of truth
  const { 
    documents: allDocuments, 
    structured, 
    loading: unifiedLoading, 
    error: unifiedError 
  } = useUnifiedData({ year: selectedYear }); // Pass selectedYear here

  // Transform the unified data into the YearData interface
  const [data, setData] = useState<YearData>({
    categories: null,
    documents: null,
    total_documents: null,
    loading: unifiedLoading,
    error: unifiedError ? unifiedError.message : null,
  });

  useEffect(() => {
    if (!selectedYear || !allDocuments) {
      setData({
        categories: null,
        documents: null,
        total_documents: null,
        loading: false,
        error: null,
      });
      return;
    }

    // Documents are already filtered by useUnifiedData
    const yearDocuments = allDocuments; // No need to filter again

    // Calculate categories from the filtered documents
    const categories = yearDocuments.reduce((acc, doc) => {
      const category = doc.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Use structured budget data if available for enhanced categories
    const enhancedCategories = { ...categories };
    if (structured.budget && structured.budget.categories) { // Access categories directly
      // Add budget-specific categories
      Object.entries(structured.budget.categories).forEach(([name, categoryData]: [string, any]) => {
        const budgetKey = `budget_${name.toLowerCase().replace(/\s+/g, '_')}`;
        enhancedCategories[budgetKey] = categoryData.document_count || 0;
      });
    }

    setData({
      categories: enhancedCategories,
      documents: yearDocuments,
      total_documents: yearDocuments.length,
      loading: false,
      error: null,
    });
  }, [selectedYear, allDocuments, structured]);

  return data;
};