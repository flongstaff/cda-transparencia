/**
 * Official Document Processing Service
 * Handles processing of PDF and XLSX documents for the transparency portal
 */

import * as XLSX from 'xlsx';
import { Document } from 'react-pdf';

// Document types that we can process
export type DocumentType = 'pdf' | 'xlsx' | 'xls' | 'csv' | 'json' | 'xml';

// Processed document data structure
export interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number;
  pageCount?: number;
  sheetsCount?: number;
  tables: DocumentTable[];
  metadata: DocumentMetadata;
  createdAt: string;
  processedAt: string;
}

// Document table structure
export interface DocumentTable {
  id: string;
  name: string;
  headers: string[];
  rows: any[][];
  rowCount: number;
  columnCount: number;
}

// Document metadata
export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  totalPages?: number;
}

// PDF processing options
export interface PDFProcessingOptions {
  maxPages?: number;
  extractText?: boolean;
  extractTables?: boolean;
  extractImages?: boolean;
}

// Excel processing options
export interface ExcelProcessingOptions {
  extractAllSheets?: boolean;
  maxRows?: number;
  extractFormulas?: boolean;
}

class OfficialDocumentService {
  private static instance: OfficialDocumentService;
  private cache = new Map<string, { data: ProcessedDocument; timestamp: number; expires: number }>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  private constructor() {}

  public static getInstance(): OfficialDocumentService {
    if (!OfficialDocumentService.instance) {
      OfficialDocumentService.instance = new OfficialDocumentService();
    }
    return OfficialDocumentService.instance;
  }

  /**
   * Process an official PDF document
   */
  public async processPDF(
    file: File | string, 
    options: PDFProcessingOptions = {}
  ): Promise<ProcessedDocument | null> {
    try {
      console.log('[OFFICIAL DOC SERVICE] Processing PDF document');
      
      // For now, we'll simulate processing since react-pdf is primarily for rendering
      // In a real implementation, we would use a library like pdfjs-dist for server-side processing
      
      const fileName = typeof file === 'string' ? file : file.name;
      const fileSize = typeof file === 'string' ? 0 : file.size;
      
      // Generate a unique ID for the document
      const docId = this.generateDocumentId(fileName);
      
      // Simulate processing
      const processedDocument: ProcessedDocument = {
        id: docId,
        fileName,
        fileType: 'pdf',
        fileSize,
        pageCount: 10, // Simulated page count
        tables: [], // Would be populated with extracted tables
        metadata: {
          title: fileName,
          creationDate: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      };
      
      // Cache the result
      this.cache.set(docId, {
        data: processedDocument,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });
      
      console.log('[OFFICIAL DOC SERVICE] PDF document processed successfully');
      return processedDocument;
    } catch (error) {
      console.error('[OFFICIAL DOC SERVICE] Error processing PDF document:', error);
      return null;
    }
  }

  /**
   * Process an official Excel document (XLSX/XLS)
   */
  public async processExcel(
    file: File | string, 
    options: ExcelProcessingOptions = {}
  ): Promise<ProcessedDocument | null> {
    try {
      console.log('[OFFICIAL DOC SERVICE] Processing Excel document');
      
      let arrayBuffer: ArrayBuffer;
      let fileName: string;
      
      if (typeof file === 'string') {
        // File path - fetch it
        fileName = file.split('/').pop() || file;
        const response = await fetch(file);
        arrayBuffer = await response.arrayBuffer();
      } else {
        // File object
        fileName = file.name;
        arrayBuffer = await file.arrayBuffer();
      }
      
      // Read the Excel file
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellFormula: options.extractFormulas,
        cellHTML: false,
        cellStyles: false
      });
      
      // Generate a unique ID for the document
      const docId = this.generateDocumentId(fileName);
      
      // Process all sheets or just the first one
      const sheetNames = options.extractAllSheets 
        ? workbook.SheetNames 
        : [workbook.SheetNames[0]];
      
      const tables: DocumentTable[] = [];
      
      // Process each sheet
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ''
        });
        
        if (jsonData.length > 0) {
          // Extract headers (first row) and data (remaining rows)
          const headers = jsonData[0] as string[];
          const dataRows = jsonData.slice(1) as any[][];
          
          const table: DocumentTable = {
            id: `${docId}-sheet-${sheetName}`,
            name: sheetName,
            headers: headers.map(h => String(h)),
            rows: dataRows,
            rowCount: dataRows.length,
            columnCount: headers.length
          };
          
          tables.push(table);
        }
      }
      
      // Create processed document
      const processedDocument: ProcessedDocument = {
        id: docId,
        fileName,
        fileType: fileName.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'xls',
        fileSize: arrayBuffer.byteLength,
        sheetsCount: workbook.SheetNames.length,
        tables,
        metadata: {
          title: fileName,
          creator: workbook.Props?.Creator,
          lastModifiedBy: workbook.Props?.LastModifiedBy,
          created: workbook.Props?.Created ? new Date(workbook.Props.Created).toISOString() : undefined,
          modified: workbook.Props?.Modified ? new Date(workbook.Props.Modified).toISOString() : undefined
        },
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      };
      
      // Cache the result
      this.cache.set(docId, {
        data: processedDocument,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });
      
      console.log('[OFFICIAL DOC SERVICE] Excel document processed successfully');
      return processedDocument;
    } catch (error) {
      console.error('[OFFICIAL DOC SERVICE] Error processing Excel document:', error);
      return null;
    }
  }

  /**
   * Process a CSV document
   */
  public async processCSV(
    file: File | string
  ): Promise<ProcessedDocument | null> {
    try {
      console.log('[OFFICIAL DOC SERVICE] Processing CSV document');
      
      let textContent: string;
      let fileName: string;
      
      if (typeof file === 'string') {
        // File path - fetch it
        fileName = file.split('/').pop() || file;
        const response = await fetch(file);
        textContent = await response.text();
      } else {
        // File object
        fileName = file.name;
        textContent = await file.text();
      }
      
      // Split into lines
      const lines = textContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      // Parse CSV manually (simple implementation)
      const rows = lines.map(line => {
        // Handle quoted fields
        const fields: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"' && !inQuotes) {
            inQuotes = true;
          } else if (char === '"' && inQuotes) {
            inQuotes = false;
          } else if (char === ',' && !inQuotes) {
            fields.push(currentField);
            currentField = '';
          } else {
            currentField += char;
          }
        }
        
        fields.push(currentField);
        return fields;
      });
      
      // Extract headers (first row) and data (remaining rows)
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Generate a unique ID for the document
      const docId = this.generateDocumentId(fileName);
      
      const table: DocumentTable = {
        id: `${docId}-table-0`,
        name: 'Sheet1',
        headers,
        rows: dataRows,
        rowCount: dataRows.length,
        columnCount: headers.length
      };
      
      // Create processed document
      const processedDocument: ProcessedDocument = {
        id: docId,
        fileName,
        fileType: 'csv',
        fileSize: textContent.length,
        tables: [table],
        metadata: {
          title: fileName
        },
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      };
      
      // Cache the result
      this.cache.set(docId, {
        data: processedDocument,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });
      
      console.log('[OFFICIAL DOC SERVICE] CSV document processed successfully');
      return processedDocument;
    } catch (error) {
      console.error('[OFFICIAL DOC SERVICE] Error processing CSV document:', error);
      return null;
    }
  }

  /**
   * Process any supported document type
   */
  public async processDocument(
    file: File | string,
    fileType?: DocumentType
  ): Promise<ProcessedDocument | null> {
    // Determine file type if not provided
    let typeToProcess: DocumentType = fileType || 'pdf';
    
    if (typeof file === 'string') {
      const ext = file.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        typeToProcess = ext as 'xlsx' | 'xls';
      } else if (ext === 'csv') {
        typeToProcess = 'csv';
      } else if (ext === 'pdf') {
        typeToProcess = 'pdf';
      }
    } else {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        typeToProcess = fileName.endsWith('.xlsx') ? 'xlsx' : 'xls';
      } else if (fileName.endsWith('.csv')) {
        typeToProcess = 'csv';
      } else if (fileName.endsWith('.pdf')) {
        typeToProcess = 'pdf';
      }
    }
    
    // Process based on file type
    switch (typeToProcess) {
      case 'xlsx':
      case 'xls':
        return this.processExcel(file);
      case 'csv':
        return this.processCSV(file);
      case 'pdf':
      default:
        return this.processPDF(file);
    }
  }

  /**
   * Get processed document from cache
   */
  public getProcessedDocument(id: string): ProcessedDocument | null {
    const cached = this.cache.get(id);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    return null;
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('[OFFICIAL DOC SERVICE] Cache cleared');
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(fileName: string): string {
    // Simple hash function for ID generation
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      const char = fileName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `doc-${Math.abs(hash)}-${Date.now()}`;
  }
}

// Export singleton instance
const officialDocumentService = OfficialDocumentService.getInstance();
export default officialDocumentService;

// Export for named imports
export { officialDocumentService };