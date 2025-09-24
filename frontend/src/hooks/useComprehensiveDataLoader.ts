import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// GitHub raw content base URL
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';

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

export interface DataFilters {
  year?: number;
  category?: string;
  type?: string;
  searchTerm?: string;
  verified?: boolean;
  source?: string;
}

// Enhanced data loader hook
export const useComprehensiveDataLoader = (filters: DataFilters = {}) => {
  const [data, setData] = useState<UnifiedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Fetch available years from GitHub - covering 2000-2025 range
  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/json/data_index.json`);
      if (response.ok) {
        const { years } = await response.json();
        if (years && Array.isArray(years)) {
          return years.sort((a, b) => b - a); // Sort descending
        }
      }
    } catch (error) {
      console.warn('Could not fetch available years from data_index.json, using known range');
    }

    // Use the complete range from 2000-2025 as documented in the project
    const fullRangeYears = Array.from({ length: 26 }, (_, i) => 2000 + i); // 2000-2025
    return fullRangeYears;
  }, []);

  // Fetch all data from all years
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get available years (2000-2025)
      const years = await fetchAvailableYears();
      setAvailableYears(years);

      // Fetch multi-source report
      let multiSourceReport: MultiSourceData | null = null;
      try {
        const response = await fetch(`${GITHUB_RAW_BASE}/data/multi_source_report.json`);
        if (response.ok) {
          multiSourceReport = await response.json();
        }
      } catch (error) {
        console.warn('Multi-source report not available:', error);
      }

      // Initialize structured data
      const structuredData: StructuredData = {
        budget: {},
        debt: {},
        salaries: {},
        audit: {},
        financial: {},
        investments: {},
        contracts: {},
        property: {}
      };

      // Initialize documents array
      const allDocuments: Document[] = [];

      // Fetch data for each year (2000-2025)
      const yearPromises = years.map(async (year) => {
        try {
          // Try to load comprehensive year data by checking for various patterns
          const filePatterns = [
            `EJECUCION-DE-GASTOS.json`,
            `EJECUCION-DEL-PRESUPUESTO-DE-GASTOS-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-GASTOS-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-RECURSOS-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-GASTOS-POR-FUENTE-DE-FINANCIAMIENTO-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-${year}.json`,
            `ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-${year}.json`,
            `SITUACION-ECONOMICA-FINANCIERA-${year}.json`,
            `SITUACION-ECONOMICO-FINANCIERA-${year}.json`,
            `ddjj-${year}.json`,
            `${year}-Situacion-Economico-Financiera-Carmen-de-Areco.json`,
            `EJECUCION-PRESUPUESTARIA-DE-RECURSOS-${year}.json`,
            `CUENTA-AHORRO-INVERSION-FINANCIAMIENTO-${year}.json`,
            `EJECUCION-DE-RECURSOS-PERIODO-${year}.json`,
            `budget_data_${year}.json`,
            `debt_data_${year}.json`,
            `salary_data_${year}.json`,
            `financial_data_${year}.json`,
            `investment_data_${year}.json`,
            `contract_data_${year}.json`,
            `property_declaration_data_${year}.json`
          ];

          for (const filename of filePatterns) {
            try {
              const response = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/json/${filename}`);
              if (response.ok) {
                const jsonData = await response.json();
                
                // Determine which structured data category this belongs to based on filename
                if (filename.includes('gasto') || filename.includes('presupuesto') || filename.includes('budget')) {
                  if (!structuredData.budget![year]) structuredData.budget![year] = [];
                  if (Array.isArray(structuredData.budget![year])) {
                    structuredData.budget![year].push(jsonData);
                  } else {
                    structuredData.budget![year] = [structuredData.budget![year], jsonData];
                  }
                } else if (filename.includes('debt') || filename.includes('deuda')) {
                  if (!structuredData.debt![year]) structuredData.debt![year] = [];
                  if (Array.isArray(structuredData.debt![year])) {
                    structuredData.debt![year].push(jsonData);
                  } else {
                    structuredData.debt![year] = [structuredData.debt![year], jsonData];
                  }
                } else if (filename.includes('salary') || filename.includes('sueldo') || filename.includes('salario')) {
                  if (!structuredData.salaries![year]) structuredData.salaries![year] = [];
                  if (Array.isArray(structuredData.salaries![year])) {
                    structuredData.salaries![year].push(jsonData);
                  } else {
                    structuredData.salaries![year] = [structuredData.salaries![year], jsonData];
                  }
                } else if (filename.includes('investment') || filename.includes('inversion')) {
                  if (!structuredData.investments![year]) structuredData.investments![year] = [];
                  if (Array.isArray(structuredData.investments![year])) {
                    structuredData.investments![year].push(jsonData);
                  } else {
                    structuredData.investments![year] = [structuredData.investments![year], jsonData];
                  }
                } else if (filename.includes('contract') || filename.includes('contrato')) {
                  if (!structuredData.contracts![year]) structuredData.contracts![year] = [];
                  if (Array.isArray(structuredData.contracts![year])) {
                    structuredData.contracts![year].push(jsonData);
                  } else {
                    structuredData.contracts![year] = [structuredData.contracts![year], jsonData];
                  }
                } else if (filename.includes('property') || filename.includes('declaration') || filename.includes('ddjj')) {
                  if (!structuredData.property![year]) structuredData.property![year] = [];
                  if (Array.isArray(structuredData.property![year])) {
                    structuredData.property![year].push(jsonData);
                  } else {
                    structuredData.property![year] = [structuredData.property![year], jsonData];
                  }
                } else {
                  if (!structuredData.financial![year]) structuredData.financial![year] = [];
                  if (Array.isArray(structuredData.financial![year])) {
                    structuredData.financial![year].push(jsonData);
                  } else {
                    structuredData.financial![year] = [structuredData.financial![year], jsonData];
                  }
                }

                // Add document record
                allDocuments.push({
                  id: `${year}-${filename}`,
                  title: filename.replace(/[_-]/g, ' ').replace(/\.[^/.]+$/, ''),
                  category: categorizeFromFilename(filename),
                  type: 'json',
                  filename,
                  size_mb: parseFloat(response.headers.get('content-length') || '2048000') / (1024 * 1024),
                  url: `${GITHUB_RAW_BASE}/data/organized_documents/json/${filename}`,
                  year,
                  verified: true,
                  processing_date: new Date().toISOString(),
                  integrity_verified: true,
                  source: 'organized_documents',
                  content: jsonData
                });
              }
            } catch (e) {
              // Continue to next file
            }
          }

          // Try to fetch year-specific data index
          try {
            const indexResponse = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/json/data_index_${year}.json`);
            if (indexResponse.ok) {
              const indexData = await indexResponse.json();
              if (indexData.documents && Array.isArray(indexData.documents)) {
                const yearDocs = indexData.documents.map((doc: any) => ({
                  ...doc,
                  year,
                  source: 'data_index',
                  verified: true,
                  processing_date: doc.processing_date || new Date().toISOString()
                }));
                allDocuments.push(...yearDocs);
              }
            }
          } catch (e) {
            // Index not available for this year
          }

        } catch (yearError) {
          console.warn(`Error fetching data for year ${year}:`, yearError);
        }
      });

      await Promise.all(yearPromises);

      // Load category-specific indices
      const categories = [
        'Contrataciones', 'Declaraciones_Patrimoniales', 'Ejecución_de_Gastos', 
        'Ejecución_de_Recursos', 'Estados_Financieros', 'Presupuesto_Municipal', 
        'Recursos_Humanos', 'Salud_Pública', 'Documentos_Generales'
      ];

      for (const category of categories) {
        try {
          const catResponse = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/json/data_index_${category}.json`);
          if (catResponse.ok) {
            const catData = await catResponse.json();
            if (catData.documents && Array.isArray(catData.documents)) {
              const catDocs = catData.documents.map((doc: any) => ({
                ...doc,
                source: category,
                verified: true,
                processing_date: doc.processing_date || new Date().toISOString()
              }));
              allDocuments.push(...catDocs);
            }
          }
        } catch (e) {
          // Category index not available, continue to next
        }
      }

      // Fetch comprehensive documents data
      try {
        const docsResponse = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/json/documents_data.json`);
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          if (docsData && Array.isArray(docsData)) {
            const docs = docsData.map((doc: any) => ({
              ...doc,
              id: doc.id || doc.filename || `doc-${Date.now()}-${Math.random()}`,
              verified: doc.verified !== undefined ? doc.verified : true,
              processing_date: doc.processing_date || new Date().toISOString()
            }));
            allDocuments.push(...docs);
          }
        }
      } catch (error) {
        console.warn('Comprehensive documents data not available:', error);
      }

      // Try to fetch complete transparency data
      try {
        const completeResponse = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/json/complete_transparency_data.json`);
        if (completeResponse.ok) {
          const completeData = await completeResponse.json();
          if (completeData && Array.isArray(completeData.documents)) {
            const docs = completeData.documents.map((doc: any) => ({
              ...doc,
              id: doc.id || doc.filename || `complete-${Date.now()}-${Math.random()}`,
              verified: doc.verified !== undefined ? doc.verified : true,
              processing_date: doc.processing_date || new Date().toISOString()
            }));
            allDocuments.push(...docs);
          }
        }
      } catch (error) {
        console.warn('Complete transparency data not available:', error);
      }

      // Process multi-source documents if available
      if (multiSourceReport?.sources) {
        Object.entries(multiSourceReport.sources).forEach(([sourceType, sourceData]: [string, any]) => {
          if (sourceData.documents && Array.isArray(sourceData.documents)) {
            const docs = sourceData.documents.map((doc: any) => ({
              ...doc,
              source: 'multi_source',
              source_type: sourceType,
              verified: true,
              processing_date: doc.processing_date || new Date().toISOString()
            }));
            allDocuments.push(...docs);
          }
        });
      }

      // Remove duplicates and ensure all documents have required fields
      const uniqueDocuments = allDocuments.filter((doc, index, self) => 
        index === self.findIndex(d => d.filename === doc.filename && d.year === doc.year)
      );

      // Apply filters
      let filteredDocuments = uniqueDocuments;
      if (filters.year) {
        filteredDocuments = filteredDocuments.filter(doc => doc.year === filters.year);
      }
      if (filters.category) {
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.category?.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }
      if (filters.type) {
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.type?.toLowerCase() === filters.type.toLowerCase()
        );
      }
      if (filters.searchTerm) {
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.title?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          doc.filename?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          doc.category?.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }
      if (filters.verified !== undefined) {
        filteredDocuments = filteredDocuments.filter(doc => doc.verified === filters.verified);
      }
      if (filters.source) {
        filteredDocuments = filteredDocuments.filter(doc => doc.source === filters.source);
      }

      // Calculate metadata
      const categories = new Set(filteredDocuments.map(doc => doc.category));
      const yearsInDocs = new Set(filteredDocuments.map(doc => doc.year));

      const result: UnifiedData = {
        multi_source: multiSourceReport,
        structured: structuredData,
        documents: filteredDocuments,
        metadata: {
          last_updated: new Date().toISOString(),
          data_sources: 5, // This will be an approximation
          total_documents: filteredDocuments.length,
          year_coverage: Array.from(yearsInDocs).sort((a, b) => b - a),
          categories: Array.from(categories).sort()
        }
      };

      setData(result);
    } catch (error) {
      console.error('Error fetching all data:', error);
      setError(error instanceof Error ? error.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [filters, fetchAvailableYears]);

  // Add helper method
  const categorizeFromFilename = (filename: string): string => {
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('budget') || lowerName.includes('presupuesto')) return 'Presupuesto';
    if (lowerName.includes('debt') || lowerName.includes('deuda')) return 'Deuda';
    if (lowerName.includes('salary') || lowerName.includes('sueldo') || lowerName.includes('salario')) return 'Salarios';
    if (lowerName.includes('audit') || lowerName.includes('auditoria')) return 'Auditoría';
    if (lowerName.includes('contract') || lowerName.includes('contrato')) return 'Contratos';
    if (lowerName.includes('property') || lowerName.includes('declaration') || lowerName.includes('ddjj')) return 'Declaraciones';
    if (lowerName.includes('gasto') || lowerName.includes('gastos')) return 'Gastos';
    if (lowerName.includes('recurso') || lowerName.includes('recursos')) return 'Recursos';
    if (lowerName.includes('inversion') || lowerName.includes('investment')) return 'Inversiones';
    if (lowerName.includes('financial') || lowerName.includes('financiero')) return 'Financiero';
    return 'General';
  };

  // Method to refetch data
  const refetch = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    error,
    availableYears,
    refetch,
    metadata: data?.metadata,
    structured: data?.structured,
    documents: data?.documents,
    multi_source: data?.multi_source
  };
};

  // Load data when filters change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Method to refetch data
  const refetch = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    error,
    availableYears,
    refetch,
    metadata: data?.metadata,
    structured: data?.structured,
    documents: data?.documents,
    multi_source: data?.multi_source
  };
};