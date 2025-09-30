/**
 * Unified Data Service
 * Integrates all data sources: CSV, JSON, PDFs, and external services
 * Provides comprehensive data access for all pages
 */

// Types
interface DataSource {
  type: 'csv' | 'json' | 'pdf' | 'external';
  path: string;
  year?: number;
  category?: string;
  description?: string;
}

interface DataInventory {
  csv: DataSource[];
  json: DataSource[];
  pdf: DataSource[];
  external: DataSource[];
  totalFiles: number;
  lastUpdated: string;
}

interface PageData {
  page: string;
  data: any;
  sources: DataSource[];
  lastUpdated: string;
}

class UnifiedDataService {
  private static instance: UnifiedDataService;
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  public static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }

  /**
   * Get comprehensive data inventory
   */
  public async getDataInventory(): Promise<DataInventory> {
    const cacheKey = 'data-inventory';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }

    try {
      // Load data inventory from manifest
      const manifest = await this.fetchData('/data/data_manifest.json');
      const inventory = await this.fetchData('/data/data_inventory.json');
      
      const dataInventory: DataInventory = {
        csv: this.categorizeDataSources(manifest?.csv_sources || [], 'csv'),
        json: this.categorizeDataSources(manifest?.json_sources || [], 'json'),
        pdf: this.categorizeDataSources(manifest?.pdf_sources || [], 'pdf'),
        external: this.categorizeDataSources(manifest?.external_sources || [], 'external'),
        totalFiles: inventory?.total_files || 0,
        lastUpdated: inventory?.last_updated || new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: dataInventory,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return dataInventory;
    } catch (error) {
      console.error('[UNIFIED DATA SERVICE] Error loading data inventory:', error);
      return {
        csv: [],
        json: [],
        pdf: [],
        external: [],
        totalFiles: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get data for a specific page
   */
  public async getPageData(pageName: string, year?: number): Promise<PageData> {
    const cacheKey = `page-data-${pageName}-${year || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }

    try {
      let pageData: any = {};
      const sources: DataSource[] = [];

      switch (pageName.toLowerCase()) {
        case 'budget':
          pageData = await this.getBudgetData(year);
          sources.push(...this.getBudgetSources(year));
          break;
        
        case 'treasury':
          pageData = await this.getTreasuryData(year);
          sources.push(...this.getTreasurySources(year));
          break;
        
        case 'debt':
          pageData = await this.getDebtData(year);
          sources.push(...this.getDebtSources(year));
          break;
        
        case 'expenses':
          pageData = await this.getExpensesData(year);
          sources.push(...this.getExpensesSources(year));
          break;
        
        case 'investments':
          pageData = await this.getInvestmentsData(year);
          sources.push(...this.getInvestmentsSources(year));
          break;
        
        case 'salaries':
          pageData = await this.getSalariesData(year);
          sources.push(...this.getSalariesSources(year));
          break;
        
        case 'contracts':
          pageData = await this.getContractsData(year);
          sources.push(...this.getContractsSources(year));
          break;
        
        case 'documents':
          pageData = await this.getDocumentsData(year);
          sources.push(...this.getDocumentsSources(year));
          break;
        
        case 'reports':
          pageData = await this.getReportsData(year);
          sources.push(...this.getReportsSources(year));
          break;
        
        case 'database':
          pageData = await this.getDatabaseData();
          sources.push(...this.getDatabaseSources());
          break;
        
        case 'dashboard':
        case 'home':
          pageData = await this.getDashboardData(year);
          sources.push(...this.getDashboardSources(year));
          break;
        
        default:
          pageData = await this.getGeneralData(pageName, year);
          sources.push(...this.getGeneralSources(pageName, year));
      }

      const result: PageData = {
        page: pageName,
        data: pageData,
        sources,
        lastUpdated: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return result;
    } catch (error) {
      console.error(`[UNIFIED DATA SERVICE] Error loading data for page ${pageName}:`, error);
      return {
        page: pageName,
        data: {},
        sources: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get all available years
   */
  public async getAvailableYears(): Promise<number[]> {
    try {
      const consolidatedIndex = await this.fetchData('/data/consolidated/index.json');
      return consolidatedIndex?.years || [2019, 2020, 2021, 2022, 2023, 2024, 2025];
    } catch (error) {
      console.error('[UNIFIED DATA SERVICE] Error loading available years:', error);
      return [2019, 2020, 2021, 2022, 2023, 2024, 2025];
    }
  }

  /**
   * Get chart data for visualization
   */
  public async getChartData(chartType: string, year?: number): Promise<any> {
    const cacheKey = `chart-data-${chartType}-${year || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }

    try {
      let chartData: any = {};

      // Try to load from charts directory first
      const chartFileName = `${chartType}_consolidated_${year ? year : '2019-2025'}.csv`;
      try {
        chartData = await this.fetchCsvData(`/data/charts/${chartFileName}`);
      } catch (error) {
        // Fallback to consolidated data
        if (year) {
          const consolidatedData = await this.fetchData(`/data/consolidated/${year}/summary.json`);
          chartData = this.transformConsolidatedToChart(consolidatedData, chartType);
        }
      }

      this.cache.set(cacheKey, {
        data: chartData,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return chartData;
    } catch (error) {
      console.error(`[UNIFIED DATA SERVICE] Error loading chart data for ${chartType}:`, error);
      return {};
    }
  }

  // Private helper methods

  private async fetchData(path: string): Promise<any> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`[UNIFIED DATA SERVICE] Failed to fetch ${path}:`, error);
      return null;
    }
  }

  private async fetchCsvData(path: string): Promise<any[]> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      return this.parseCsv(csvText);
    } catch (error) {
      console.warn(`[UNIFIED DATA SERVICE] Failed to fetch CSV ${path}:`, error);
      return [];
    }
  }

  private parseCsv(csvText: string): any[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  }

  private categorizeDataSources(sources: any[], type: 'csv' | 'json' | 'pdf' | 'external'): DataSource[] {
    return sources.map(source => ({
      type,
      path: source.path || source.file || source.url,
      year: source.year,
      category: source.category,
      description: source.description
    }));
  }

  private transformConsolidatedToChart(consolidatedData: any, chartType: string): any {
    // Transform consolidated data to chart format based on chart type
    switch (chartType.toLowerCase()) {
      case 'budget':
        return consolidatedData?.budget || {};
      case 'revenue':
        return consolidatedData?.revenue || {};
      case 'expenditure':
        return consolidatedData?.expenditure || {};
      case 'debt':
        return consolidatedData?.debt || {};
      case 'personnel':
        return consolidatedData?.salaries || {};
      case 'contracts':
        return consolidatedData?.contracts || {};
      case 'infrastructure':
        return consolidatedData?.infrastructure || {};
      default:
        return consolidatedData || {};
    }
  }

  // Data loading methods for each page type

  private async getBudgetData(year?: number): Promise<any> {
    if (year) {
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/budget.json`);
      if (consolidatedData) return consolidatedData;
    }
    
    // Fallback to chart data
    return await this.getChartData('Budget_Execution', year);
  }

  private async getTreasuryData(year?: number): Promise<any> {
    if (year) {
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/treasury.json`);
      if (consolidatedData) return consolidatedData;
    }
    
    return await this.getChartData('Financial_Reserves', year);
  }

  private async getDebtData(year?: number): Promise<any> {
    if (year) {
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/debt.json`);
      if (consolidatedData) return consolidatedData;
    }
    
    return await this.getChartData('Debt_Report', year);
  }

  private async getExpensesData(year?: number): Promise<any> {
    if (year) {
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/summary.json`);
      if (consolidatedData?.expenditure) return consolidatedData.expenditure;
    }
    
    return await this.getChartData('Expenditure_Report', year);
  }

  private async getInvestmentsData(year?: number): Promise<any> {
    return await this.getChartData('Investment_Report', year);
  }

  private async getSalariesData(year?: number): Promise<any> {
    if (year) {
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/salaries.json`);
      if (consolidatedData) return consolidatedData;
    }
    
    return await this.getChartData('Personnel_Expenses', year);
  }

  private async getContractsData(year?: number): Promise<any> {
    if (year) {
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/contracts.json`);
      if (consolidatedData) return consolidatedData;
    }
    
    return await this.getChartData('Infrastructure_Projects', year);
  }

  private async getDocumentsData(year?: number): Promise<any> {
    if (year) {
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/documents.json`);
      if (consolidatedData) return consolidatedData;
    }
    
    // Get PDF index
    const pdfIndex = await this.fetchData('/data/web_accessible_pdfs/pdf_index.json');
    return pdfIndex || {};
  }

  private async getReportsData(year?: number): Promise<any> {
    const multiSourceReport = await this.fetchData('/data/multi_source_report.json');
    const redFlagsReport = await this.fetchData('/data/red_flags_report.json');
    
    return {
      multiSource: multiSourceReport,
      redFlags: redFlagsReport,
      year: year
    };
  }

  private async getDatabaseData(): Promise<any> {
    const dataInventory = await this.getDataInventory();
    const masterIndex = await this.fetchData('/data/master_index.json');
    
    return {
      inventory: dataInventory,
      masterIndex: masterIndex,
      totalFiles: dataInventory.totalFiles
    };
  }

  private async getDashboardData(year?: number): Promise<any> {
    const availableYears = await this.getAvailableYears();
    const selectedYear = year || Math.max(...availableYears);
    
    const consolidatedData = await this.fetchData(`/data/consolidated/${selectedYear}/summary.json`);
    const chartData = await this.getChartData('Budget_Execution', selectedYear);
    
    return {
      year: selectedYear,
      availableYears,
      consolidated: consolidatedData,
      charts: chartData,
      summary: {
        totalBudget: consolidatedData?.financial_overview?.total_budget || 0,
        totalExecuted: consolidatedData?.financial_overview?.total_executed || 0,
        executionRate: consolidatedData?.financial_overview?.execution_rate || 0
      }
    };
  }

  private async getGeneralData(pageName: string, year?: number): Promise<any> {
    // Generic data loading for any page
    const consolidatedData = await this.fetchData(`/data/consolidated/${year || 2025}/summary.json`);
    return consolidatedData || {};
  }

  // Source methods for each page type

  private getBudgetSources(year?: number): DataSource[] {
    const sources: DataSource[] = [
      { type: 'csv', path: '/data/charts/Budget_Execution_consolidated_2019-2025.csv', category: 'budget' },
      { type: 'json', path: `/data/consolidated/${year || 2025}/budget.json`, category: 'budget' }
    ];
    if (year) {
      sources.push({ type: 'csv', path: `/data/processed/budget_execution_${year}.csv`, category: 'budget' });
    }
    return sources;
  }

  private getTreasurySources(year?: number): DataSource[] {
    return [
      { type: 'csv', path: '/data/charts/Financial_Reserves_consolidated_2019-2025.csv', category: 'treasury' },
      { type: 'json', path: `/data/consolidated/${year || 2025}/treasury.json`, category: 'treasury' }
    ];
  }

  private getDebtSources(year?: number): DataSource[] {
    return [
      { type: 'csv', path: '/data/charts/Debt_Report_consolidated_2019-2025.csv', category: 'debt' },
      { type: 'json', path: `/data/consolidated/${year || 2025}/debt.json`, category: 'debt' }
    ];
  }

  private getExpensesSources(year?: number): DataSource[] {
    return [
      { type: 'csv', path: '/data/charts/Expenditure_Report_consolidated_2019-2025.csv', category: 'expenses' },
      { type: 'json', path: `/data/consolidated/${year || 2025}/summary.json`, category: 'expenses' }
    ];
  }

  private getInvestmentsSources(year?: number): DataSource[] {
    return [
      { type: 'csv', path: '/data/charts/Investment_Report_consolidated_2019-2025.csv', category: 'investments' },
      { type: 'csv', path: '/data/charts/Infrastructure_Projects_consolidated_2019-2025.csv', category: 'infrastructure' }
    ];
  }

  private getSalariesSources(year?: number): DataSource[] {
    return [
      { type: 'csv', path: '/data/charts/Personnel_Expenses_consolidated_2019-2025.csv', category: 'personnel' },
      { type: 'json', path: `/data/consolidated/${year || 2025}/salaries.json`, category: 'personnel' }
    ];
  }

  private getContractsSources(year?: number): DataSource[] {
    return [
      { type: 'json', path: `/data/consolidated/${year || 2025}/contracts.json`, category: 'contracts' },
      { type: 'pdf', path: `/data/organized_by_subject/${year || 2025}/Contrataciones/`, category: 'contracts' }
    ];
  }

  private getDocumentsSources(year?: number): DataSource[] {
    return [
      { type: 'json', path: `/data/consolidated/${year || 2025}/documents.json`, category: 'documents' },
      { type: 'pdf', path: `/data/web_accessible_pdfs/${year || 2025}/`, category: 'documents' },
      { type: 'json', path: '/data/web_accessible_pdfs/pdf_index.json', category: 'documents' }
    ];
  }

  private getReportsSources(year?: number): DataSource[] {
    return [
      { type: 'json', path: '/data/multi_source_report.json', category: 'reports' },
      { type: 'json', path: '/data/red_flags_report.json', category: 'reports' }
    ];
  }

  private getDatabaseSources(): DataSource[] {
    return [
      { type: 'json', path: '/data/data_inventory.json', category: 'database' },
      { type: 'json', path: '/data/master_index.json', category: 'database' },
      { type: 'json', path: '/data/data_manifest.json', category: 'database' }
    ];
  }

  private getDashboardSources(year?: number): DataSource[] {
    return [
      { type: 'json', path: `/data/consolidated/${year || 2025}/summary.json`, category: 'dashboard' },
      { type: 'csv', path: '/data/charts/Budget_Execution_consolidated_2019-2025.csv', category: 'dashboard' }
    ];
  }

  private getGeneralSources(pageName: string, year?: number): DataSource[] {
    return [
      { type: 'json', path: `/data/consolidated/${year || 2025}/summary.json`, category: pageName }
    ];
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('[UNIFIED DATA SERVICE] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
const unifiedDataService = UnifiedDataService.getInstance();
export default unifiedDataService;

// Export types
export type { DataSource, DataInventory, PageData };
