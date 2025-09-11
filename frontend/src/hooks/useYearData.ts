import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface YearData {
  categories: Record<string, number> | null;
  documents: any[] | null;
  total_documents: number | null;
  loading: boolean;
  error: string | null;
}

export const useYearData = (selectedYear: number | null) => {
  const [data, setData] = useState<YearData>({
    categories: null,
    documents: null,
    total_documents: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        let categoriesData = null;
        let documentsData = null;

        // Try API first
        try {
          const [categoriesRes, documentsRes] = await Promise.all([
            fetch(`${API_BASE}/${selectedYear}/categories`),
            fetch(`${API_BASE}/${selectedYear}/documents`),
          ]);

          if (categoriesRes.ok && documentsRes.ok) {
            categoriesData = await categoriesRes.json();
            documentsData = await documentsRes.json();
          } else {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          console.warn('API fetch failed, falling back to local data:', apiError);
          
          // Fallback to local data sources
          try {
            // Load from organized analysis files
            const [budgetResponse, detailedInventoryResponse, yearDataResponse] = await Promise.allSettled([
              fetch('/data/organized_analysis/financial_oversight/budget_analysis/budget_data_2024.json'),
              fetch('/data/organized_analysis/detailed_inventory.json'),
              fetch(`/data/data_index_${selectedYear}.json`)
            ]);

            // Extract budget categories
            if (budgetResponse.status === 'fulfilled' && budgetResponse.value.ok) {
              const budgetData = await budgetResponse.value.json();
              if (budgetData.categories || budgetData.breakdown) {
                const categories = budgetData.categories || budgetData.breakdown || {};
                categoriesData = { categories };
              }
            }

            // Extract documents from multiple sources
            let documents = [];
            
            // From detailed inventory
            if (detailedInventoryResponse.status === 'fulfilled' && detailedInventoryResponse.value.ok) {
              const inventory = await detailedInventoryResponse.value.json();
              if (inventory.documents) {
                documents.push(...inventory.documents);
              }
            }

            // From year data index
            if (yearDataResponse.status === 'fulfilled' && yearDataResponse.value.ok) {
              const yearData = await yearDataResponse.value.json();
              if (yearData.data_sources) {
                // Extract documents from all categories in data_sources
                Object.values(yearData.data_sources).forEach((category: any) => {
                  if (category.documents) {
                    if (Array.isArray(category.documents)) {
                      documents.push(...category.documents.map((doc: any) => ({
                        id: doc.file || doc.title || `doc-${Math.random()}`,
                        title: doc.title || doc.file || 'Unknown Document',
                        filename: doc.file || doc.filename,
                        category: category.type || 'general',
                        type: doc.format || 'pdf',
                        url: `/data/pdfs/${doc.file || doc.filename}`,
                        size_mb: doc.size_mb || 1.0
                      })));
                    }
                  }
                });
              }
            }

            if (!categoriesData) {
              // Fallback categories from year data structure
              categoriesData = {
                categories: {
                  'budget_execution': documents.filter(d => d.category?.includes('budget')).length,
                  'salary_data': documents.filter(d => d.category?.includes('salary')).length,
                  'debt_analysis': documents.filter(d => d.category?.includes('debt')).length,
                  'gender_perspective': documents.filter(d => d.category?.includes('gender')).length,
                  'caif_data': documents.filter(d => d.category?.includes('caif')).length,
                  'resolutions': documents.filter(d => d.category?.includes('resolution')).length,
                  'declarations': documents.filter(d => d.category?.includes('declaration')).length
                }
              };
            }

            documentsData = { documents };

          } catch (localError) {
            console.warn('Local data fallback failed:', localError);
            
            // Ultimate fallback with mock data
            categoriesData = {
              categories: {
                'budget_execution': 20,
                'salary_data': 6,
                'debt_analysis': 5,
                'gender_perspective': 4,
                'caif_data': 3,
                'resolutions': 7,
                'declarations': 1
              }
            };
            
            documentsData = {
              documents: [
                {
                  id: 'budget-1',
                  title: 'Estado de Ejecución de Gastos por Carácter Económico',
                  filename: 'Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf',
                  category: 'budget_execution',
                  type: 'pdf',
                  url: '/data/pdfs/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf',
                  size_mb: 2.4
                },
                {
                  id: 'salary-1',
                  title: 'Escalas Salariales Octubre 2024',
                  filename: 'ESCALA-SALARIAL-OCTUBRE-2024.pdf',
                  category: 'salary_data',
                  type: 'pdf',
                  url: '/data/pdfs/ESCALA-SALARIAL-OCTUBRE-2024.pdf',
                  size_mb: 0.8
                },
                {
                  id: 'debt-1',
                  title: 'Stock de Deuda y Perfil de Vencimientos',
                  filename: 'STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx',
                  category: 'debt_analysis',
                  type: 'excel',
                  url: '/data/excel/STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx',
                  size_mb: 1.2
                }
              ]
            };
          }
        }

        setData({
          categories: categoriesData?.categories || null,
          documents: documentsData?.documents || [],
          total_documents: documentsData?.documents?.length || 0,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setData({
          categories: null,
          documents: null,
          total_documents: null,
          loading: false,
          error: err.message || 'Error loading data',
        });
      }
    };

    fetchData();
  }, [selectedYear]);

  return data;
};