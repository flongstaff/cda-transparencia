/**
 * Transparency Data Hook
 * Centralized hook for accessing all organized transparency data
 */

import { useState, useEffect, useCallback } from 'react';

export interface PDFMetadata {
  file_hash: string;
  filename: string;
  local_path: string;
  original_url?: string;
  web_archive_url?: string;
  file_size: number;
  creation_date?: string;
  extraction_date: string;
  page_count: number;
  extracted_tables: number;
  extracted_rows: number;
}

export interface TransparencyData {
  // System status
  systemStatus: 'loading' | 'active' | 'error';
  lastUpdated: string | null;

  // Document data
  totalDocuments: number;
  documentsByCategory: Record<string, number>;
  categories: string[];

  // PDF data
  totalPDFs: number;
  pdfMetadata: PDFMetadata[];
  pdfsByOriginalUrl: number;
  pdfsByWebArchive: number;

  // Financial data
  revenueData: any[];  // TODO: Define specific type for revenue data
  expenseData: any[];  // TODO: Define specific type for expense data
  budgetExecutionData: any[];  // TODO: Define specific type for budget execution data

  // CSV files info
  csvFiles: string[];
  totalRecords: number;
  extractedTables: number;
  extractedRows: number;

  // API endpoints
  apiEndpoints: Record<string, string>;
}

export const useTransparencyData = () => {
  const [data, setData] = useState<TransparencyData>({
    systemStatus: 'loading',
    lastUpdated: null,
    totalDocuments: 0,
    documentsByCategory: {},
    categories: [],
    totalPDFs: 0,
    pdfMetadata: [],
    pdfsByOriginalUrl: 0,
    pdfsByWebArchive: 0,
    revenueData: [],
    expenseData: [],
    budgetExecutionData: [],
    csvFiles: [],
    totalRecords: 0,
    extractedTables: 0,
    extractedRows: 0,
    apiEndpoints: {}
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransparencyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main API data from consolidated sources
      const responses = await Promise.allSettled([
        fetch('/data/api/index.json'),
        fetch('/data/api/documents.json'),
        fetch('/data/api/csv_data.json'),
        fetch('/data/api/config.json'),
        fetch('/data/api/pdfs.json'),
        fetch('/data/api/pdf_metadata.json')
      ]);

      const [mainApiResponse, documentsResponse, csvDataResponse, summaryResponse, pdfsResponse, metadataResponse] = responses;

      let systemData = {};
      let documentsData = {};
      let csvData = {};
      let summaryData = {};
      let pdfsData = {};
      let metadataData = {};

      // Process API responses
      if (mainApiResponse.status === 'fulfilled' && mainApiResponse.value.ok) {
        systemData = await mainApiResponse.value.json();
      }

      if (documentsResponse.status === 'fulfilled' && documentsResponse.value.ok) {
        documentsData = await documentsResponse.value.json();
      }

      if (csvDataResponse.status === 'fulfilled' && csvDataResponse.value.ok) {
        csvData = await csvDataResponse.value.json();
      }

      if (summaryResponse.status === 'fulfilled' && summaryResponse.value.ok) {
        summaryData = await summaryResponse.value.json();
      }

      if (pdfsResponse.status === 'fulfilled' && pdfsResponse.value.ok) {
        pdfsData = await pdfsResponse.value.json();
      }

      if (metadataResponse.status === 'fulfilled' && metadataResponse.value.ok) {
        metadataData = await metadataResponse.value.json();
      }

      // Process PDF metadata
      const pdfMetadataArray = Object.values(metadataData as Record<string, any>).map((pdf: any) => ({
        file_hash: pdf.file_hash,
        filename: pdf.filename,
        local_path: pdf.local_path,
        original_url: pdf.original_url,
        web_archive_url: pdf.web_archive_url,
        file_size: pdf.file_size,
        creation_date: pdf.creation_date,
        extraction_date: pdf.extraction_date,
        page_count: pdf.page_count,
        extracted_tables: pdf.extracted_tables,
        extracted_rows: pdf.extracted_rows
      }));

      // Update state with combined data
      setData({
        systemStatus: 'active',
        lastUpdated: (systemData as any)?.timestamp || (summaryData as any)?.last_updated || new Date().toISOString(),
        totalDocuments: (documentsData as any)?.total_documents || 0,
        documentsByCategory: (documentsData as any)?.categories || {},
        categories: Object.keys((documentsData as any)?.categories || {}),
        totalPDFs: (pdfsData as any)?.total_pdfs || pdfMetadataArray.length,
        pdfMetadata: pdfMetadataArray,
        pdfsByOriginalUrl: pdfMetadataArray.filter(pdf => pdf.original_url).length,
        pdfsByWebArchive: pdfMetadataArray.filter(pdf => pdf.web_archive_url).length,
        revenueData: [],
        expenseData: [],
        budgetExecutionData: [],
        csvFiles: (csvData as any)?.files?.map((f: any) => f.filename) || [],
        totalRecords: (csvData as any)?.statistics?.data_rows_created || 0,
        extractedTables: (pdfsData as any)?.statistics?.total_extracted_tables || pdfMetadataArray.reduce((sum, pdf) => sum + pdf.extracted_tables, 0),
        extractedRows: (pdfsData as any)?.statistics?.total_extracted_rows || pdfMetadataArray.reduce((sum, pdf) => sum + pdf.extracted_rows, 0),
        apiEndpoints: (systemData as any)?.endpoints || (summaryData as any)?.available_datasets || {}
      });

    } catch (err) {
      setError('Error loading transparency data');
      setData(prev => ({ ...prev, systemStatus: 'error' }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransparencyData();
  }, [fetchTransparencyData]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransparencyData
  };
};

// Define type for CSV row data
interface CSVRow {
  [key: string]: string;
}

// Hook for loading CSV data
export const useCSVData = (filename: string) => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCSV = useCallback(async () => {
    if (!filename) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/data/csv/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }

      const csvText = await response.text();
      const rows = csvText.split('\n');

      if (rows.length === 0) {
        setCsvData([]);
        return;
      }

      // Parse CSV
      const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = rows.slice(1)
        .filter(row => row.trim())
        .map(row => {
          const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
          const rowObj: CSVRow = {};
          headers.forEach((header, index) => {
            rowObj[header] = values[index] || '';
          });
          return rowObj;
        });

      setCsvData(data);
    } catch (err) {
      setError(`Error loading CSV: ${err}`);
      setCsvData([]);
    } finally {
      setLoading(false);
    }
  }, [filename]);

  useEffect(() => {
    loadCSV();
  }, [loadCSV]);

  return {
    data: csvData,
    loading,
    error,
    reload: loadCSV
  };
};

// Hook for financial data
export const useFinancialData = () => {
  const revenueCSV = useCSVData('revenue_summary.csv');
  const expensesCSV = useCSVData('expenses_summary.csv');
  const transparencyCSV = useCSVData('transparency_data_complete.csv');

  return {
    revenue: revenueCSV,
    expenses: expensesCSV,
    transparency: transparencyCSV,
    loading: revenueCSV.loading || expensesCSV.loading || transparencyCSV.loading,
    error: revenueCSV.error || expensesCSV.error || transparencyCSV.error
  };
};

// Hook for document data
export const useDocumentData = () => {
  const { data } = useTransparencyData();

  return {
    totalDocuments: data.totalDocuments,
    categories: data.categories,
    documentsByCategory: data.documentsByCategory,
    documentsUrl: '/data/api/documents.json'
  };
};

// Hook for PDF data with metadata and URLs
export const usePDFData = () => {
  const { data, loading, error } = useTransparencyData();

  return {
    totalPDFs: data.totalPDFs,
    pdfMetadata: data.pdfMetadata,
    pdfsByOriginalUrl: data.pdfsByOriginalUrl,
    pdfsByWebArchive: data.pdfsByWebArchive,
    extractedTables: data.extractedTables,
    extractedRows: data.extractedRows,
    loading,
    error,
    // Utility functions
    getPDFByHash: (hash: string) => data.pdfMetadata.find(pdf => pdf.file_hash === hash),
    getPDFsByOriginalUrl: () => data.pdfMetadata.filter(pdf => pdf.original_url),
    getPDFsByWebArchive: () => data.pdfMetadata.filter(pdf => pdf.web_archive_url),
    // Data URLs
    pdfsApiUrl: '/data/api/pdfs.json',
    pdfMetadataUrl: '/data/api/pdf_metadata.json'
  };
};