/**
 * Real Data Integration Service for Carmen de Areco Portal
 * Integrates downloaded PDFs, audit results, and live scraped data
 */

import ApiService from './ApiService';

import ApiService from './ApiService';

export interface RealDocumentData {
  id: string;
  filename: string;
  title: string;
  type: 'ejecucion_presupuestaria' | 'balance' | 'caif' | 'escala_salarial' | 'licitacion' | 'other';
  year: number;
  quarter?: string;
  month?: string;
  size: number;
  path: string;
  source: 'archive' | 'live_scrape';
  lastModified: string;
  url?: string;
}

export interface AuditResult {
  score: number;
  grade: string;
  compliance: number;
  redFlags: {
    critical: number;
    high: number;
    medium: number;
  };
  recommendations: string[];
  documentsAnalyzed: number;
}

export interface LiveFinancialData {
  balanceGeneral: any;
  ejecucionPresupuestaria: any[];
  escalaSalarial: any[];
  deudaStock: any[];
}

class RealDataService {
  private static instance: RealDataService;
  private documentsCache: RealDocumentData[] = [];
  private auditCache: AuditResult | null = null;
  private financialCache: LiveFinancialData | null = null;

  private constructor() {
    this.loadRealData();
  }

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  /**
   * Load real Carmen de Areco data from downloaded sources
   */
  private async loadRealData() {
    // This would integrate with the backend API that processes the real PDFs
    // For now, we'll simulate with realistic data based on the file structure
    this.documentsCache = this.generateRealDocumentList();
    this.auditCache = this.generateRealAuditResults();
    this.financialCache = this.generateRealFinancialData();
  }

  

  

  

  

  

  /**
   * Get documents by type for specific analysis
   */
  public getDocumentsByType(type: RealDocumentData['type']): RealDocumentData[] {
    return this.documentsCache.filter(doc => doc.type === type);
  }

  /**
   * Get documents by year for temporal analysis
   */
  public getDocumentsByYear(year: number): RealDocumentData[] {
    return this.documentsCache.filter(doc => doc.year === year);
  }

  /**
   * Get critical documents for fraud detection
   */
  public getCriticalDocuments(): RealDocumentData[] {
    const criticalTypes: RealDocumentData['type'][] = [
      'ejecucion_presupuestaria',
      'balance',
      'escala_salarial'
    ];
    return this.documentsCache.filter(doc => criticalTypes.includes(doc.type));
  }

  /**
   * Get most recent documents
   */
  public getRecentDocuments(limit: number = 10): RealDocumentData[] {
    return [...this.documentsCache]
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, limit);
  }

  /**
   * Get audit results
   */
  public getAuditResults(): AuditResult | null {
    return this.auditCache;
  }

  /**
   * Get financial data
   */
  public getFinancialData(): LiveFinancialData | null {
    return this.financialCache;
  }

  /**
   * Search documents by title or filename
   */
  public searchDocuments(query: string): RealDocumentData[] {
    const searchTerm = query.toLowerCase();
    return this.documentsCache.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.filename.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get document statistics
   */
  public getDocumentStats() {
    const stats = {
      total: this.documentsCache.length,
      byType: {} as Record<string, number>,
      byYear: {} as Record<string, number>,
      totalSize: 0,
      lastUpdated: new Date().toISOString()
    };

    this.documentsCache.forEach(doc => {
      // Count by type
      stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
      
      // Count by year
      stats.byYear[doc.year.toString()] = (stats.byYear[doc.year.toString()] || 0) + 1;
      
      // Sum total size
      stats.totalSize += doc.size;
    });

    return stats;
  }

  /**
   * Check data freshness for real-time updates
   */
  public async refreshData(): Promise<boolean> {
    try {
      // In production, this would connect to your Python scraping system
      // and check for new documents
      await this.loadRealData();
      return true;
    } catch (error) {
      console.error('Failed to refresh real data:', error);
      return false;
    }
  }
}

export default RealDataService;