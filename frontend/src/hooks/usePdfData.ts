/**
 * PDF Data Hook - Optimized for PDF resource handling
 * Handles PDF metadata, availability checks, and document listings
 * No page reloads, efficient caching
 */

import { useState, useEffect, useCallback } from 'react';

interface PdfInfo {
  url: string;
  name: string;
  size?: string;
  lastModified?: string;
  contentType?: string;
  available: boolean;
  category?: string;
  year?: number;
  description?: string;
}

interface PdfDataState {
  pdfs: PdfInfo[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  totalSize?: number;
  availableCount: number;
}

// PDF cache
const pdfCache = new Map<string, { data: PdfInfo[]; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache for PDFs

// Common PDF endpoints for the transparency portal
const PDF_ENDPOINTS = [
  '/data/charts/*.pdf',
  '/src/data/downloaded/pdfs/*.pdf',
  '/data/documents/*.pdf',
  '/data/audit_results/*.pdf'
];

export default function usePdfData(
  selectedYear?: number,
  category?: string,
  searchQuery?: string
): PdfDataState {
  const [state, setState] = useState<PdfDataState>({
    pdfs: [],
    loading: false,
    error: null,
    refetch: () => {},
    availableCount: 0
  });

  const checkPdfAvailability = useCallback(async (url: string): Promise<PdfInfo> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });

      const pdfInfo: PdfInfo = {
        url,
        name: url.split('/').pop() || 'Unknown',
        size: response.headers.get('content-length') || undefined,
        lastModified: response.headers.get('last-modified') || undefined,
        contentType: response.headers.get('content-type') || undefined,
        available: response.ok
      };

      // Extract year from filename if possible
      const yearMatch = pdfInfo.name.match(/(\d{4})/);
      if (yearMatch) {
        pdfInfo.year = parseInt(yearMatch[1]);
      }

      // Extract category from path or filename
      if (url.includes('/audit')) {
        pdfInfo.category = 'audit';
      } else if (url.includes('/budget') || pdfInfo.name.toLowerCase().includes('presupuesto')) {
        pdfInfo.category = 'budget';
      } else if (url.includes('/contract') || pdfInfo.name.toLowerCase().includes('contrat')) {
        pdfInfo.category = 'contracts';
      } else if (url.includes('/salary') || pdfInfo.name.toLowerCase().includes('sueldo')) {
        pdfInfo.category = 'salaries';
      } else {
        pdfInfo.category = 'general';
      }

      return pdfInfo;
    } catch (error) {
      return {
        url,
        name: url.split('/').pop() || 'Unknown',
        available: false
      };
    }
  }, []);

  const loadPdfData = useCallback(async () => {
    const cacheKey = `pdfs-${selectedYear || 'all'}-${category || 'all'}`;

    // Check cache first
    const cached = pdfCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      let filteredPdfs = cached.data;

      // Apply search filter if specified
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredPdfs = filteredPdfs.filter(pdf =>
          pdf.name.toLowerCase().includes(lowerQuery) ||
          (pdf.description && pdf.description.toLowerCase().includes(lowerQuery)) ||
          (pdf.category && pdf.category.toLowerCase().includes(lowerQuery))
        );
      }

      const availableCount = filteredPdfs.filter(pdf => pdf.available).length;
      const totalSize = filteredPdfs.reduce((sum, pdf) => {
        const size = pdf.size ? parseInt(pdf.size) : 0;
        return sum + (isNaN(size) ? 0 : size);
      }, 0);

      setState(prev => ({
        ...prev,
        pdfs: filteredPdfs,
        loading: false,
        error: null,
        availableCount,
        totalSize
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get list of known PDF files from the downloaded directory
      const knownPdfs = [
        '/src/data/downloaded/pdfs/pdf_100_GASTOS-POR-FUENTE-DE-FINANCIAMIENTO.pdf',
        '/src/data/downloaded/pdfs/pdf_101_GASTOS-POR-CARACTER-ECONOMICO.pdf',
        '/src/data/downloaded/pdfs/pdf_102_GASTOS-POR-FINALIDAD-Y-FUNCION.pdf',
        '/src/data/downloaded/pdfs/pdf_103_GASTOS-CON-PERSPECTIVA-DE-GENERO.pdf',
        '/src/data/downloaded/pdfs/pdf_104_SITUACION-ECONOMICO-FINANCIERA.pdf',
        '/src/data/downloaded/pdfs/pdf_105_BALANCE-GENERAL-2020.pdf',
        '/src/data/downloaded/pdfs/pdf_160_PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf',
        '/src/data/downloaded/pdfs/pdf_161_ORDENANZA-FISCAL-3198-23.pdf',
        '/src/data/downloaded/pdfs/pdf_173_ESCALA-SALARIAL-OCTUBRE-2024.pdf',
        '/src/data/downloaded/pdfs/pdf_181_DDJJ-2024.pdf',
        '/src/data/downloaded/pdfs/pdf_184_ORGANIGRAMA-2025.pdf'
      ];

      // Check availability of all known PDFs
      const pdfChecks = knownPdfs.map(url => checkPdfAvailability(url));
      const allPdfs = await Promise.all(pdfChecks);

      // Filter by year if specified
      let filteredPdfs = allPdfs;
      if (selectedYear) {
        filteredPdfs = allPdfs.filter(pdf =>
          !pdf.year || pdf.year === selectedYear
        );
      }

      // Filter by category if specified
      if (category) {
        filteredPdfs = filteredPdfs.filter(pdf =>
          pdf.category === category
        );
      }

      // Apply search filter if specified
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredPdfs = filteredPdfs.filter(pdf =>
          pdf.name.toLowerCase().includes(lowerQuery) ||
          (pdf.description && pdf.description.toLowerCase().includes(lowerQuery)) ||
          (pdf.category && pdf.category.toLowerCase().includes(lowerQuery))
        );
      }

      // Cache the result
      pdfCache.set(cacheKey, {
        data: allPdfs,
        timestamp: Date.now()
      });

      const availableCount = filteredPdfs.filter(pdf => pdf.available).length;
      const totalSize = filteredPdfs.reduce((sum, pdf) => {
        const size = pdf.size ? parseInt(pdf.size) : 0;
        return sum + (isNaN(size) ? 0 : size);
      }, 0);

      setState(prev => ({
        ...prev,
        pdfs: filteredPdfs,
        loading: false,
        error: null,
        availableCount,
        totalSize
      }));

    } catch (err) {
      setState(prev => ({
        ...prev,
        pdfs: [],
        loading: false,
        error: err as Error,
        availableCount: 0
      }));
    }
  }, [selectedYear, category, searchQuery, checkPdfAvailability]);

  const refetch = useCallback(() => {
    // Clear cache and reload
    pdfCache.clear();
    loadPdfData();
  }, [loadPdfData]);

  useEffect(() => {
    loadPdfData();
  }, [loadPdfData]);

  // Update the refetch function in state
  useEffect(() => {
    setState(prev => ({ ...prev, refetch }));
  }, [refetch]);

  return state;
}

export { pdfCache };