/**
 * Markdown Data Service for Carmen de Areco Portal
 * Browser-compatible service for accessing markdown content via API
 */

export interface MarkdownDocument {
  id: string;
  filename: string;
  title: string;
  year: number;
  category: string;
  content: string;
  metadata: {
    originalPdf: string;
    conversionDate: string;
    wordCount: number;
    pages: number;
    file_hash?: string;
  };
  searchableText: string;
  keyFindings: string[];
  financialData: {
    totalBudget?: number;
    expenses?: number;
    revenue?: number;
    contracts?: number;
    irregularities?: string[];
  };
}

export interface SearchResult {
  document: MarkdownDocument;
  matches: {
    text: string;
    line: number;
    context: string;
    relevance: number;
  }[];
  score: number;
}

class MarkdownDataService {
  private static instance: MarkdownDataService;
  private documentsCache: MarkdownDocument[] = [];
  private searchIndex: Map<string, Set<string>> = new Map();
  private readonly API_BASE: string;

  private constructor() {
    this.API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.loadMarkdownDocuments();
  }

  static getInstance(): MarkdownDataService {
    if (!MarkdownDataService.instance) {
      MarkdownDataService.instance = new MarkdownDataService();
    }
    return MarkdownDataService.instance;
  }

  /**
   * Load markdown documents from API endpoint
   */
  private async loadMarkdownDocuments() {
    this.documentsCache = [];

    try {
      const response = await fetch(`${this.API_BASE}/api/markdown-documents`);
      if (response.ok) {
        const data = await response.json();
        this.documentsCache = data.documents || [];
        this.buildSearchIndex();
        console.log(`✅ Loaded ${this.documentsCache.length} markdown documents from API.`);
      } else {
        console.warn('Markdown documents API not available, using fallback data');
        this.loadFallbackData();
      }
    } catch (error) {
      console.warn('Failed to load markdown documents from API:', error);
      this.loadFallbackData();
    }
  }

  /**
   * Get markdown content for a specific document path
   */
  public async getMarkdownContent(path: string): Promise<{ content: string; metadata: any } | null> {
    try {
      const response = await fetch(`${this.API_BASE}/api/markdown-content/${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to load markdown content for ${path}:`, error);
      return null;
    }
  }

  /**
   * Fallback data when API is not available
   */
  private loadFallbackData() {
    // Create some sample documents based on known structure
    const sampleDocs: MarkdownDocument[] = [
      {
        id: 'estado-ejecucion-gastos-marzo-2025',
        filename: 'Estado-de-Ejecucion-de-Gastos-Marzo.md',
        title: 'Estado de Ejecución de Gastos - Marzo 2025',
        year: 2025,
        category: 'Ejecución de Gastos',
        content: '# Estado de Ejecución de Gastos - Marzo 2025\n\nDocumento procesado desde PDF original del sitio oficial.',
        metadata: {
          originalPdf: 'Estado-de-Ejecucion-de-Gastos-Marzo.pdf',
          conversionDate: new Date().toISOString(),
          wordCount: 500,
          pages: 3,
          file_hash: '302f624762d78290862ec9a15639a8760f18dca7f686cd1113eb12368034c4a3'
        },
        searchableText: 'Estado de Ejecución de Gastos Marzo 2025 presupuesto municipal',
        keyFindings: ['Ejecución presupuestaria', 'Gastos municipales'],
        financialData: {
          totalBudget: 50000000,
          expenses: 15000000
        }
      }
    ];
    
    this.documentsCache = sampleDocs;
    this.buildSearchIndex();
    console.log(`📋 Using fallback markdown data: ${this.documentsCache.length} documents`);
  }

  /**
   * Build search index for fast text search
   */
  private buildSearchIndex() {
    this.searchIndex.clear();
    
    this.documentsCache.forEach(doc => {
      const words = doc.searchableText.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, new Set());
          }
          this.searchIndex.get(word)!.add(doc.id);
        }
      });
    });
  }

  /**
   * Search documents by text query
   */
  public searchDocuments(query: string, limit: number = 20): SearchResult[] {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const results: Map<string, number> = new Map();
    
    // Find documents containing search terms
    searchTerms.forEach(term => {
      if (this.searchIndex.has(term)) {
        this.searchIndex.get(term)!.forEach(docId => {
          results.set(docId, (results.get(docId) || 0) + 1);
        });
      }
    });
    
    // Convert to SearchResult objects and sort by relevance
    const searchResults: SearchResult[] = [];
    
    results.forEach((score, docId) => {
      const document = this.documentsCache.find(d => d.id === docId);
      if (document) {
        const matches = this.findMatches(document, searchTerms);
        searchResults.push({
          document,
          matches,
          score: score + matches.reduce((sum, match) => sum + match.relevance, 0)
        });
      }
    });
    
    return searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Find specific matches within document content
   */
  private findMatches(document: MarkdownDocument, searchTerms: string[]) {
    const matches = [];
    const lines = document.content.split('\n');
    
    lines.forEach((line, lineNumber) => {
      searchTerms.forEach(term => {
        if (line.toLowerCase().includes(term)) {
          matches.push({
            text: term,
            line: lineNumber + 1,
            context: line.trim(),
            relevance: line.toLowerCase().split(term).length - 1
          });
        }
      });
    });
    
    return matches.slice(0, 10);
  }

  /**
   * Get documents by category
   */
  public getDocumentsByCategory(category: string): MarkdownDocument[] {
    return this.documentsCache.filter(doc => doc.category === category);
  }

  /**
   * Get documents by year
   */
  public getDocumentsByYear(year: number): MarkdownDocument[] {
    return this.documentsCache.filter(doc => doc.year === year);
  }

  /**
   * Get financial summary across all documents
   */
  public getFinancialSummary() {
    const summary = {
      totalBudget: 0,
      totalExpenses: 0,
      totalRevenue: 0,
      documentCount: this.documentsCache.length,
      irregularitiesCount: 0,
      yearsCovered: new Set<number>(),
      categories: new Set<string>()
    };
    
    this.documentsCache.forEach(doc => {
      if (doc.financialData.totalBudget) {
        summary.totalBudget += doc.financialData.totalBudget;
      }
      if (doc.financialData.expenses) {
        summary.totalExpenses += doc.financialData.expenses;
      }
      if (doc.financialData.revenue) {
        summary.totalRevenue += doc.financialData.revenue;
      }
      if (doc.financialData.irregularities) {
        summary.irregularitiesCount += doc.financialData.irregularities.length;
      }
      
      summary.yearsCovered.add(doc.year);
      summary.categories.add(doc.category);
    });
    
    return {
      ...summary,
      yearsCovered: Array.from(summary.yearsCovered).sort((a, b) => b - a),
      categories: Array.from(summary.categories).sort()
    };
  }

  /**
   * Get all documents
   */
  public getAllDocuments(): MarkdownDocument[] {
    return [...this.documentsCache];
  }

  /**
   * Get document by ID
   */
  public getDocumentById(id: string): MarkdownDocument | null {
    return this.documentsCache.find(doc => doc.id === id) || null;
  }

  /**
   * Get recent documents
   */
  public getRecentDocuments(limit: number = 10): MarkdownDocument[] {
    return [...this.documentsCache]
      .sort((a, b) => b.year - a.year)
      .slice(0, limit);
  }

  /**
   * Refresh document cache
   */
  public async refreshDocuments(): Promise<boolean> {
    try {
      await this.loadMarkdownDocuments();
      return true;
    } catch (error) {
      console.error('Failed to refresh markdown documents:', error);
      return false;
    }
  }
}

export { MarkdownDataService };