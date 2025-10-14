/**
 * OCR Data Service
 *
 * Service for loading and processing OCR-extracted data from DocStrange
 * Handles structured JSON files extracted from PDFs
 */

import smartDataLoader from './SmartDataLoader';

export interface OCRDocument {
  document_type: string;
  title: string;
  date: string;
  amount?: number;
  currency?: string;
  entities?: string[];
  categories?: string[];
  budget_lines?: BudgetLine[];
}

export interface BudgetLine {
  line_item: string;
  amount: number;
  description?: string | null;
}

export interface OCRExtractedData {
  document: {
    raw_content: string;
  };
  format?: string;
  error?: string;
}

export interface ProcessedOCRData {
  documents: OCRDocument[];
  metadata: {
    totalDocuments: number;
    totalAmount: number;
    sources: string[];
    extractionDate: string;
  };
}

class OCRDataService {
  private static instance: OCRDataService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Map of document types to their categories
  private readonly DOCUMENT_TYPE_MAP = {
    'GASTOS': ['expenses', 'gastos'],
    'RECURSOS': ['revenue', 'recursos', 'ingresos'],
    'PRESUPUESTO': ['budget', 'presupuesto'],
    'TESORERIA': ['treasury', 'tesoreria'],
    'DEUDA': ['debt', 'deuda'],
    'PERSONAL': ['salaries', 'personal', 'sueldos']
  };

  private constructor() {}

  public static getInstance(): OCRDataService {
    if (!OCRDataService.instance) {
      OCRDataService.instance = new OCRDataService();
    }
    return OCRDataService.instance;
  }

  /**
   * Load OCR extraction index
   */
  public async getExtractionIndex(): Promise<any> {
    const cacheKey = 'ocr-extraction-index';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const index = await smartDataLoader.load('/data/ocr_extracted/extraction_index.json');
      this.cache.set(cacheKey, { data: index, timestamp: Date.now() });
      return index;
    } catch (error) {
      console.warn('Failed to load OCR extraction index:', error);
      return null;
    }
  }

  /**
   * Parse structured JSON content from DocStrange
   */
  private parseStructuredContent(rawContent: string): OCRDocument[] {
    const documents: OCRDocument[] = [];

    try {
      // Split by page breaks
      const batches = rawContent.split(/<!-- Page Break - Batch \d+ -->/);

      for (const batch of batches) {
        const trimmed = batch.trim();
        if (!trimmed || trimmed.length < 10) continue;

        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.document_type && parsed.budget_lines) {
            documents.push(parsed);
          }
        } catch (e) {
          // Skip invalid JSON batches
          continue;
        }
      }
    } catch (error) {
      console.warn('Error parsing structured content:', error);
    }

    return documents;
  }

  /**
   * Load structured JSON file from OCR extraction
   */
  public async loadStructuredJSON(filename: string): Promise<ProcessedOCRData | null> {
    const cacheKey = `ocr-structured-${filename}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data: OCRExtractedData = await smartDataLoader.load(`/data/ocr_extracted/json/${filename}`);

      if (!data || !data.document || !data.document.raw_content) {
        console.warn(`No valid content in ${filename}`);
        return null;
      }

      // Parse the raw content which contains JSON objects separated by page breaks
      const documents = this.parseStructuredContent(data.document.raw_content);

      if (documents.length === 0) {
        console.warn(`No documents parsed from ${filename}`);
        return null;
      }

      // Calculate metadata
      const totalAmount = documents.reduce((sum, doc) => {
        if (doc.budget_lines) {
          return sum + doc.budget_lines.reduce((lineSum, line) => lineSum + (line.amount || 0), 0);
        }
        return sum + (doc.amount || 0);
      }, 0);

      const sources = [...new Set(documents.flatMap(d => d.entities || []))];

      const processedData: ProcessedOCRData = {
        documents,
        metadata: {
          totalDocuments: documents.length,
          totalAmount,
          sources,
          extractionDate: documents[0]?.date || new Date().toISOString()
        }
      };

      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() });
      return processedData;
    } catch (error) {
      console.error(`Error loading structured JSON ${filename}:`, error);
      return null;
    }
  }

  /**
   * Get expenses data from OCR extractions
   */
  public async getExpensesData(year?: number): Promise<ProcessedOCRData | null> {
    try {
      // Load multiple expense-related files
      const expenseFiles = [
        'pdf_101_GASTOS-POR-CARACTER-ECONOMICO_structured.json',
        'pdf_30_Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre_12_structured.json',
        'Estado-de-Ejecucion-de-Gastos-Marzo_28_structured.json',
        'ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-3°TRIMESTRE_12_structured.json'
      ];

      const results = await Promise.all(
        expenseFiles.map(file => this.loadStructuredJSON(file))
      );

      // Merge all results
      const validResults = results.filter(r => r !== null) as ProcessedOCRData[];

      if (validResults.length === 0) return null;

      const merged = this.mergeProcessedData(validResults);
      return merged;
    } catch (error) {
      console.error('Error getting expenses data:', error);
      return null;
    }
  }

  /**
   * Get revenue data from OCR extractions
   */
  public async getRevenueData(year?: number): Promise<ProcessedOCRData | null> {
    try {
      const revenueFiles = [
        'pdf_52_Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio_7_structured.json',
        'pdf_151_ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO_27_structured.json',
        'pdf_120_ESTADO-DE-EJECUCION-DE-RECURSOS-POR-CARACTER-ECONOMICO-4°TRE-2022_14_structured.json',
        'pdf_73_ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-2023-4°TRI_27_structured.json',
        'ESTADOS-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS_16_structured.json'
      ];

      const results = await Promise.all(
        revenueFiles.map(file => this.loadStructuredJSON(file))
      );

      const validResults = results.filter(r => r !== null) as ProcessedOCRData[];
      if (validResults.length === 0) return null;

      return this.mergeProcessedData(validResults);
    } catch (error) {
      console.error('Error getting revenue data:', error);
      return null;
    }
  }

  /**
   * Get budget data from OCR extractions
   */
  public async getBudgetData(year?: number): Promise<ProcessedOCRData | null> {
    try {
      // Combine both expenses and revenue for complete budget view
      const [expenses, revenue] = await Promise.all([
        this.getExpensesData(year),
        this.getRevenueData(year)
      ]);

      if (!expenses && !revenue) return null;

      const combined: ProcessedOCRData[] = [];
      if (expenses) combined.push(expenses);
      if (revenue) combined.push(revenue);

      return this.mergeProcessedData(combined);
    } catch (error) {
      console.error('Error getting budget data:', error);
      return null;
    }
  }

  /**
   * Get treasury data from OCR extractions
   */
  public async getTreasuryData(year?: number): Promise<ProcessedOCRData | null> {
    try {
      const treasuryFiles = [
        'boletin_oficial_pdf_8_Situacion-Economica-Financiera-al-31-12-22_29_structured.json',
        'boletin_oficial_pdf_7_SIT-ECONOMICO-FINANCIERA-TERCER-TRIMESTRE_6_structured.json'
      ];

      const results = await Promise.all(
        treasuryFiles.map(file => this.loadStructuredJSON(file))
      );

      const validResults = results.filter(r => r !== null) as ProcessedOCRData[];
      if (validResults.length === 0) return null;

      return this.mergeProcessedData(validResults);
    } catch (error) {
      console.error('Error getting treasury data:', error);
      return null;
    }
  }

  /**
   * Get all available OCR data organized by category
   */
  public async getAllData(): Promise<Map<string, ProcessedOCRData>> {
    const dataMap = new Map<string, ProcessedOCRData>();

    try {
      const [expenses, revenue, budget, treasury] = await Promise.all([
        this.getExpensesData(),
        this.getRevenueData(),
        this.getBudgetData(),
        this.getTreasuryData()
      ]);

      if (expenses) dataMap.set('expenses', expenses);
      if (revenue) dataMap.set('revenue', revenue);
      if (budget) dataMap.set('budget', budget);
      if (treasury) dataMap.set('treasury', treasury);

      return dataMap;
    } catch (error) {
      console.error('Error getting all OCR data:', error);
      return dataMap;
    }
  }

  /**
   * Merge multiple ProcessedOCRData objects
   */
  private mergeProcessedData(dataArray: ProcessedOCRData[]): ProcessedOCRData {
    const allDocuments = dataArray.flatMap(d => d.documents);
    const totalAmount = dataArray.reduce((sum, d) => sum + d.metadata.totalAmount, 0);
    const allSources = [...new Set(dataArray.flatMap(d => d.metadata.sources))];
    const latestDate = dataArray
      .map(d => new Date(d.metadata.extractionDate))
      .sort((a, b) => b.getTime() - a.getTime())[0]
      .toISOString();

    return {
      documents: allDocuments,
      metadata: {
        totalDocuments: allDocuments.length,
        totalAmount,
        sources: allSources,
        extractionDate: latestDate
      }
    };
  }

  /**
   * Transform OCR data to chart-friendly format
   */
  public transformToChartData(data: ProcessedOCRData, chartType: 'expenses' | 'revenue' | 'budget' = 'expenses'): any[] {
    const chartData: any[] = [];

    for (const doc of data.documents) {
      if (!doc.budget_lines || doc.budget_lines.length === 0) continue;

      for (const line of doc.budget_lines) {
        // Skip total lines to avoid double counting
        if (line.line_item.toLowerCase().includes('total')) continue;

        chartData.push({
          category: line.line_item,
          amount: line.amount,
          description: line.description || line.line_item,
          documentType: doc.document_type,
          date: doc.date,
          source: 'ocr'
        });
      }
    }

    return chartData;
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

const ocrDataService = OCRDataService.getInstance();
export default ocrDataService;
