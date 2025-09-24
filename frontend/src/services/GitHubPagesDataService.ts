/**
 * GitHub Pages Data Service - ELECTION READY
 * Proper URL handling for GitHub Pages deployment
 * Serves ALL years (2018-2025) from organized data structure
 */

// GitHub Pages URL - this will be the deployed site URL
const GITHUB_PAGES_BASE = window.location.hostname === 'localhost'
  ? 'https://flongstaff.github.io/cda-transparencia'  // Production GitHub Pages URL
  : window.location.origin; // Use current origin for deployed site

console.log('🌐 GitHub Pages Base URL:', GITHUB_PAGES_BASE);

export interface DocumentFile {
  id: string;
  title: string;
  category: string;
  year: number;
  filename: string;
  type: 'pdf' | 'json' | 'markdown';
  url: string;
  size_mb?: number;
  verified: boolean;
  processing_date: string;
}

export interface YearlyDataIndex {
  year: number;
  categories: string[];
  documents: DocumentFile[];
  totalDocuments: number;
  lastUpdated: string;
}

class GitHubPagesDataService {
  private static instance: GitHubPagesDataService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for elections

  private constructor() {}

  public static getInstance(): GitHubPagesDataService {
    if (!GitHubPagesDataService.instance) {
      GitHubPagesDataService.instance = new GitHubPagesDataService();
    }
    return GitHubPagesDataService.instance;
  }

  /**
   * Load data for ALL years (2018-2025) from GitHub Pages
   */
  async loadAllYearsData(): Promise<Record<number, YearlyDataIndex>> {
    console.log('🚀 LOADING ALL YEARS DATA FROM GITHUB PAGES...');

    const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const allYearsData: Record<number, YearlyDataIndex> = {};

    // Load all years in parallel for maximum speed
    const yearPromises = years.map(async (year) => {
      try {
        const yearData = await this.loadYearData(year);
        allYearsData[year] = yearData;
        console.log(`✅ Loaded ${year} data:`, yearData.totalDocuments, 'documents');
      } catch (error) {
        console.warn(`⚠️ Could not load ${year} data:`, error);
        // Create empty structure for missing years
        allYearsData[year] = {
          year,
          categories: [],
          documents: [],
          totalDocuments: 0,
          lastUpdated: new Date().toISOString()
        };
      }
    });

    await Promise.all(yearPromises);

    const totalDocs = Object.values(allYearsData).reduce((sum, yearData) => sum + yearData.totalDocuments, 0);
    console.log(`🎉 LOADED ALL YEARS: ${totalDocs} total documents across ${years.length} years`);

    return allYearsData;
  }

  /**
   * Load data for a specific year from GitHub Pages
   */
  async loadYearData(year: number): Promise<YearlyDataIndex> {
    const cacheKey = `year-${year}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    console.log(`📁 Loading data for year ${year}...`);

    // Try to load organized data index first
    let yearData: YearlyDataIndex;
    try {
      yearData = await this.loadOrganizedYearData(year);
    } catch (error) {
      console.warn(`Failed to load organized data for ${year}, trying fallback...`);
      yearData = await this.loadFallbackYearData(year);
    }

    this.cache.set(cacheKey, { data: yearData, timestamp: Date.now() });
    return yearData;
  }

  /**
   * Load organized data for a year from the structured directories
   */
  private async loadOrganizedYearData(year: number): Promise<YearlyDataIndex> {
    const categories = [
      'Contrataciones',
      'Declaraciones_Patrimoniales',
      'Documentos_Generales',
      'Ejecución_de_Gastos',
      'Ejecución_de_Recursos',
      'Estados_Financieros',
      'Recursos_Humanos',
      'Salud_Pública',
      'Presupuesto_Municipal'
    ];

    const documents: DocumentFile[] = [];
    const availableCategories: string[] = [];

    // Load documents from each category
    for (const category of categories) {
      try {
        const categoryDocs = await this.loadCategoryDocuments(year, category);
        if (categoryDocs.length > 0) {
          documents.push(...categoryDocs);
          availableCategories.push(category);
        }
      } catch (error) {
        console.warn(`Could not load category ${category} for year ${year}:`, error);
      }
    }

    return {
      year,
      categories: availableCategories,
      documents,
      totalDocuments: documents.length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Load documents for a specific category and year
   */
  private async loadCategoryDocuments(year: number, category: string): Promise<DocumentFile[]> {
    const documents: DocumentFile[] = [];
    const fileTypes = ['json', 'markdown', 'pdfs'];

    for (const fileType of fileTypes) {
      try {
        // Check if directory index exists
        const indexUrl = `${GITHUB_PAGES_BASE}/data/organized_documents/${year}/${category}/${fileType}/index.json`;
        const indexResponse = await fetch(indexUrl);

        if (indexResponse.ok) {
          const indexData = await indexResponse.json();

          // Process indexed files
          if (indexData.files && Array.isArray(indexData.files)) {
            indexData.files.forEach((file: any) => {
              documents.push({
                id: `${year}-${category}-${file.name}`,
                title: this.formatDocumentTitle(file.name, category),
                category,
                year,
                filename: file.name,
                type: fileType === 'pdfs' ? 'pdf' : fileType as 'json' | 'markdown',
                url: `${GITHUB_PAGES_BASE}/data/organized_documents/${year}/${category}/${fileType}/${file.name}`,
                size_mb: file.size_mb || 0,
                verified: true,
                processing_date: file.processing_date || new Date().toISOString()
              });
            });
          }
        } else {
          // Fallback: try common file patterns
          await this.loadCommonFilePatterns(year, category, fileType, documents);
        }
      } catch (error) {
        console.warn(`Could not load ${fileType} files for ${category} ${year}:`, error);
      }
    }

    return documents;
  }

  /**
   * Load common file patterns when no index exists
   */
  private async loadCommonFilePatterns(year: number, category: string, fileType: string, documents: DocumentFile[]): Promise<void> {
    // Common file patterns based on your data structure
    const patterns = [
      `EJECUCION-DE-GASTOS-${year}`,
      `EJECUCION-DE-RECURSOS-${year}`,
      `ESTADO-DE-EJECUCION-DE-GASTOS-${year}`,
      `ESTADO-DE-EJECUCION-DE-RECURSOS-${year}`,
      `PRESUPUESTO-${year}`,
      `CONTRATOS-${year}`,
      `LICITACIONES-${year}`,
      `SALARIOS-${year}`,
      `DECLARACIONES-${year}`
    ];

    const extensions = {
      json: '.json',
      markdown: '.md',
      pdfs: '.pdf'
    };

    for (const pattern of patterns) {
      if (this.patternMatchesCategory(pattern, category)) {
        const filename = `${pattern}${extensions[fileType] || ''}`;
        const url = `${GITHUB_PAGES_BASE}/data/organized_documents/${year}/${category}/${fileType}/${filename}`;

        try {
          const response = await fetch(url, { method: 'HEAD' }); // Just check if file exists
          if (response.ok) {
            documents.push({
              id: `${year}-${category}-${filename}`,
              title: this.formatDocumentTitle(filename, category),
              category,
              year,
              filename,
              type: fileType === 'pdfs' ? 'pdf' : fileType as 'json' | 'markdown',
              url,
              size_mb: parseFloat(response.headers.get('content-length') || '0') / (1024 * 1024),
              verified: true,
              processing_date: new Date().toISOString()
            });
          }
        } catch (error) {
          // File doesn't exist, continue
        }
      }
    }
  }

  /**
   * Check if a file pattern matches a category
   */
  private patternMatchesCategory(pattern: string, category: string): boolean {
    const patternLower = pattern.toLowerCase();
    const categoryLower = category.toLowerCase();

    const matches: Record<string, string[]> = {
      'contrataciones': ['contrat', 'licitac'],
      'ejecución_de_gastos': ['gasto', 'ejecucion'],
      'ejecución_de_recursos': ['recurso', 'ejecucion'],
      'presupuesto_municipal': ['presupuesto'],
      'recursos_humanos': ['salario', 'sueldo', 'recurso'],
      'declaraciones_patrimoniales': ['declaracion'],
      'estados_financieros': ['estado', 'financiero'],
      'salud_pública': ['salud'],
      'documentos_generales': ['documento', 'general']
    };

    const categoryKeys = matches[categoryLower] || [];
    return categoryKeys.some(key => patternLower.includes(key));
  }

  /**
   * Fallback data loading method
   */
  private async loadFallbackYearData(year: number): Promise<YearlyDataIndex> {
    // Try to load from the main data indices
    try {
      const indexUrl = `${GITHUB_PAGES_BASE}/data/organized_documents/json/data_index_${year}.json`;
      const response = await fetch(indexUrl);

      if (response.ok) {
        const indexData = await response.json();

        if (indexData.documents && Array.isArray(indexData.documents)) {
          const documents: DocumentFile[] = indexData.documents.map((doc: any) => ({
            id: doc.id || `${year}-${doc.filename}`,
            title: doc.title || this.formatDocumentTitle(doc.filename, doc.category),
            category: doc.category || 'General',
            year,
            filename: doc.filename,
            type: this.determineFileType(doc.filename),
            url: doc.url || `${GITHUB_PAGES_BASE}${doc.relative_path}`,
            size_mb: doc.size_mb || 0,
            verified: doc.verified !== false,
            processing_date: doc.processing_date || new Date().toISOString()
          }));

          const categories = [...new Set(documents.map(doc => doc.category))];

          return {
            year,
            categories,
            documents,
            totalDocuments: documents.length,
            lastUpdated: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.warn(`Fallback loading failed for ${year}:`, error);
    }

    // Return empty structure if all fails
    return {
      year,
      categories: [],
      documents: [],
      totalDocuments: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Format document title from filename
   */
  private formatDocumentTitle(filename: string, category: string): string {
    const cleanName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    const formatted = cleanName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return `${formatted} - ${category}`;
  }

  /**
   * Determine file type from filename
   */
  private determineFileType(filename: string): 'pdf' | 'json' | 'markdown' {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'json': return 'json';
      case 'pdf': return 'pdf';
      case 'md': case 'markdown': return 'markdown';
      default: return 'json';
    }
  }

  /**
   * Get document content (JSON or text)
   */
  async getDocumentContent(document: DocumentFile): Promise<any> {
    try {
      const response = await fetch(document.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }

      if (document.type === 'json') {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`Failed to load document content:`, error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton
export const gitHubPagesDataService = GitHubPagesDataService.getInstance();
export default gitHubPagesDataService;