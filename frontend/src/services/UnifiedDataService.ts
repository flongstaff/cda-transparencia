/**
 * Unified Data Service
 * Integrates all data sources: CSV, JSON, PDFs, and external live APIs
 * Provides comprehensive data access for all pages with real-time data fetching
 * Uses SmartDataLoader for intelligent caching and on-demand loading
 */

import { externalAPIsService } from "./ExternalDataAdapter";
import { buildApiUrl } from '../config/apiConfig';
import smartDataLoader from './SmartDataLoader';
import dataCachingService from './DataCachingService';

// Types
interface DataSource {
  type: 'csv' | 'json' | 'pdf' | 'external';
  path: string;
  year?: number;
  category?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'error';
  lastFetched?: Date;
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
  externalData?: {
    rafam?: any;
    gba?: any;
    afip?: any;
    contrataciones?: any;
    boletinNacional?: any;
    boletinProvincial?: any;
    carmenOfficial?: any;
    aaip?: any;
    infoleg?: any;
    justice?: any;
    poderCiudadano?: any;
    acij?: any;
    directorioLegislativo?: any;
  };
  lastUpdated: string;
  liveDataEnabled: boolean;
}

class UnifiedDataService {
  private static instance: UnifiedDataService;
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly EXTERNAL_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for external data

  private constructor() {}

  /**
   * Fetch external API data with caching
   */
  private async fetchExternalData(searchQuery: string = 'Carmen de Areco'): Promise<any> {
    const cacheKey = `external-data-${searchQuery}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expires) {
      console.log('[UNIFIED DATA SERVICE] Using cached external data');
      return cached.data;
    }

    console.log('[UNIFIED DATA SERVICE] Fetching live external data...');

    const [rafamResult, gbaResult, afipResult, contratacionesResult, boletinNacionalResult, boletinProvincialResult, carmenResult, aaipResult, infolegResult, justiceResult, poderCiudadanoResult, acijResult, directorioLegislativoResult] =
      await Promise.allSettled([
        externalAPIsService.getRAFAMData('270'),
        externalAPIsService.getBuenosAiresProvincialData(),
        externalAPIsService.getAFIPData('30-99914050-5'),
        externalAPIsService.getContratacionesData(searchQuery),
        externalAPIsService.getBoletinOficialNacional(searchQuery),
        externalAPIsService.getBoletinOficialProvincial(searchQuery),
        externalAPIsService.getCarmenDeArecoData(),
        externalAPIsService.getAAIPTransparencyIndex('Carmen de Areco'),
        externalAPIsService.getInfoLEGData(searchQuery),
        externalAPIsService.getMinistryOfJusticeData(searchQuery),
        externalAPIsService.getPoderCiudadanoData(searchQuery),
        externalAPIsService.getACIJData(searchQuery),
        externalAPIsService.getDirectorioLegislativoData(searchQuery)
      ]);

    const externalData = {
      rafam: rafamResult.status === 'fulfilled' && rafamResult.value?.success ? rafamResult.value.data : null,
      gba: gbaResult.status === 'fulfilled' && gbaResult.value?.success ? gbaResult.value.data : null,
      afip: afipResult.status === 'fulfilled' && afipResult.value?.success ? afipResult.value.data : null,
      contrataciones: contratacionesResult.status === 'fulfilled' && contratacionesResult.value?.success ? contratacionesResult.value.data : null,
      boletinNacional: boletinNacionalResult.status === 'fulfilled' && boletinNacionalResult.value?.success ? boletinNacionalResult.value.data : null,
      boletinProvincial: boletinProvincialResult.status === 'fulfilled' && boletinProvincialResult.value?.success ? boletinProvincialResult.value.data : null,
      carmenOfficial: carmenResult.status === 'fulfilled' ? carmenResult.value : null,
      aaip: aaipResult.status === 'fulfilled' && aaipResult.value?.success ? aaipResult.value.data : null,
      infoleg: infolegResult.status === 'fulfilled' && infolegResult.value?.success ? infolegResult.value.data : null,
      justice: justiceResult.status === 'fulfilled' && justiceResult.value?.success ? justiceResult.value.data : null,
      poderCiudadano: poderCiudadanoResult.status === 'fulfilled' && poderCiudadanoResult.value?.success ? poderCiudadanoResult.value.data : null,
      acij: acijResult.status === 'fulfilled' && acijResult.value?.success ? acijResult.value.data : null,
      directorioLegislativo: directorioLegislativoResult.status === 'fulfilled' && directorioLegislativoResult.value?.success ? directorioLegislativoResult.value.data : null
    };

    this.cache.set(cacheKey, {
      data: externalData,
      timestamp: Date.now(),
      expires: Date.now() + this.EXTERNAL_CACHE_DURATION
    });

    console.log('[UNIFIED DATA SERVICE] External data fetched and cached');
    return externalData;
  }

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
   * Get data for a specific page with live external data
   */
  public async getPageData(pageName: string, year?: number, enableLiveData: boolean = true): Promise<PageData> {
    const cacheKey = `page-data-${pageName}-${year || 'all'}-${enableLiveData}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }

    try {
      let pageData: any = {};
      const sources: DataSource[] = [];
      let externalData: any = null;

      // Fetch external data if enabled
      if (enableLiveData) {
        externalData = await this.fetchExternalData();

        // Add external data sources with status
        const externalSources: DataSource[] = [
          { type: 'external', path: 'RAFAM Buenos Aires', category: 'provincial', status: externalData.rafam ? 'active' : 'inactive', lastFetched: new Date() },
          { type: 'external', path: 'Buenos Aires GBA Data', category: 'provincial', status: externalData.gba ? 'active' : 'inactive', lastFetched: new Date() },
          { type: 'external', path: 'AFIP Tax Data', category: 'national', status: externalData.afip ? 'active' : 'inactive', lastFetched: new Date() },
          { type: 'external', path: 'Contrataciones Abiertas', category: 'national', status: externalData.contrataciones ? 'active' : 'inactive', lastFetched: new Date() },
          { type: 'external', path: 'Boletín Oficial Nacional', category: 'national', status: externalData.boletinNacional ? 'active' : 'inactive', lastFetched: new Date() },
          { type: 'external', path: 'Boletín Oficial Provincial', category: 'provincial', status: externalData.boletinProvincial ? 'active' : 'inactive', lastFetched: new Date() },
          { type: 'external', path: 'Carmen de Areco Official', category: 'municipal', status: externalData.carmenOfficial ? 'active' : 'inactive', lastFetched: new Date() }
        ];
        sources.push(...externalSources);
      }

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
        externalData: enableLiveData ? externalData : undefined,
        lastUpdated: new Date().toISOString(),
        liveDataEnabled: enableLiveData
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
        externalData: undefined,
        lastUpdated: new Date().toISOString(),
        liveDataEnabled: false
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
      // Use SmartDataLoader for intelligent caching
      const data = await smartDataLoader.load(path, undefined, {
        priority: 'immediate',
        sourceType: 'local'
      });
      return data;
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
        let value = values[index] || '';

        // Clean currency values: remove $, commas, and percentage signs
        const cleanValue = value.replace(/[$,\s%]/g, '');

        // Try to parse as number if it looks like one (but not dates or 4-digit years)
        if (cleanValue && !isNaN(parseFloat(cleanValue)) && isNaN(Date.parse(value)) && !/^\d{4}$/.test(value)) {
          row[header] = parseFloat(cleanValue);
        } else {
          // Keep original value for text fields (like Quarter, Concept, year)
          row[header] = value;
        }
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

  /**
   * Load local data from consolidated sources
   */
  private async loadLocalData(sources: DataSource[], year: number): Promise<any> {
    const localData: any = {};

    try {
      // Load consolidated data for the year
      const consolidatedData = await this.fetchData(`/data/consolidated/${year}/summary.json`);

      if (consolidatedData) {
        localData.budget = consolidatedData.budget || consolidatedData.financial_overview;
        localData.debt = consolidatedData.debt;
        localData.treasury = consolidatedData.treasury;
        localData.contracts = consolidatedData.contracts;
        localData.salaries = consolidatedData.salaries;
        localData.documents = consolidatedData.documents;
        localData.summary = consolidatedData;
      }

      console.log('[UNIFIED DATA SERVICE] Local data loaded for year:', year);
    } catch (error) {
      console.warn('[UNIFIED DATA SERVICE] Error loading local data:', error);
    }

    return localData;
  }

  /**
   * Fetch external data from all sources
   */
  private async fetchExternalDataSources(searchQuery: string, year?: number): Promise<{ success: boolean; data: any }> {
    try {
      const externalData = await this.fetchExternalData(searchQuery || 'Carmen de Areco');

      return {
        success: true,
        data: externalData
      };
    } catch (error) {
      console.error('[UNIFIED DATA SERVICE] Error fetching external data sources:', error);
      return {
        success: false,
        data: null
      };
    }
  }

  /***
   * Get analytics data with visualization formatting
   */
  async getAnalyticsData(year: number, includeExternal: boolean = true): Promise<PageData> {
    console.log(`[UNIFIED DATA SERVICE] Fetching analytics data for ${year} with external data: ${includeExternal}`);

    // Define data sources for analytics
    const analyticsSources = this.getAnalyticsSources(year);
    
    // Load local data
    const localData = await this.loadLocalData(analyticsSources, year);
    
    // Initialize external data
    let externalData = null;
    let liveDataEnabled = false;
    
    // Load external data if enabled
    if (includeExternal) {
      try {
        const externalResult = await this.fetchExternalDataSources("", year);
        externalData = externalResult.data;
        liveDataEnabled = externalResult.success;
        console.log(`[UNIFIED DATA SERVICE] External analytics data loaded: ${!!externalData}`);
      } catch (error) {
        console.warn("[UNIFIED DATA SERVICE] External analytics data not available:", error);
      }
    }

    // Combine local and external data
    const combinedData = {
      ...localData,
      ...externalData,
      analytics: {
        budget: localData.budget || externalData?.rafam,
        debt: localData.debt || externalData?.gba,
        treasury: localData.treasury || externalData?.carmenOfficial,
        contracts: localData.contracts || externalData?.contrataciones,
        salaries: localData.salaries || externalData?.afip,
        documents: localData.documents || externalData?.boletinNacional,
        aaip: externalData?.aaip,
        infoleg: externalData?.infoleg
      }
    };

    const pageData: PageData = {
      page: "analytics",
      data: combinedData,
      sources: analyticsSources,
      externalData: includeExternal ? externalData : undefined,
      lastUpdated: new Date().toISOString(),
      liveDataEnabled
    };

    console.log(`[UNIFIED DATA SERVICE] Analytics data loaded for ${year}`, {
      local: !!localData,
      external: !!externalData,
      liveDataEnabled
    });

    return pageData;
  }

  /***
   * Get analytics chart data for visualization
   */
  async getAnalyticsChartData(chartType: string, year?: number): Promise<any> {
    try {
      console.log(`[UNIFIED DATA SERVICE] Fetching analytics chart data for ${chartType} (${year || "all"})`);

      // Build API URL for analytics chart data
      const apiUrl = buildApiUrl(`analytics/chart/${chartType}`);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          year: year || new Date().getFullYear(),
          type: chartType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`[UNIFIED DATA SERVICE] Analytics chart data fetched for ${chartType}`, {
        dataPoints: data?.length || 0,
        chartType
      });
      
      return data;

    } catch (error) {
      console.error(`[UNIFIED DATA SERVICE] Error fetching analytics chart data for ${chartType}:`, error);
      
      // Return mock data for development
      return this.generateMockAnalyticsData(chartType, year);
    }
  }

  /***
   * Generate mock analytics data for development
   */
  private generateMockAnalyticsData(chartType: string, year?: number): any {
    const mockYear = year || new Date().getFullYear();
    
    switch (chartType) {
      case "budget":
        return [
          { category: "Ingresos", budgeted: 350000000, executed: 330000000, executionRate: 94.3 },
          { category: "Gastos Operativos", budgeted: 280000000, executed: 275000000, executionRate: 98.2 },
          { category: "Inversiones", budgeted: 70000000, executed: 55000000, executionRate: 78.6 }
        ];
        
      case "debt":
        return [
          { year: mockYear - 2, total_debt: 120000000, debt_ratio: 15.2 },
          { year: mockYear - 1, total_debt: 135000000, debt_ratio: 16.8 },
          { year: mockYear, total_debt: 145000000, debt_ratio: 17.5 }
        ];
        
      case "contracts":
        return [
          { month: "Ene", contracts: 12, amount: 45000000 },
          { month: "Feb", contracts: 8, amount: 32000000 },
          { month: "Mar", contracts: 15, amount: 58000000 },
          { month: "Abr", contracts: 10, amount: 41000000 }
        ];
        
      case "salaries":
        return [
          { department: "Administración", employees: 45, averageSalary: 450000 },
          { department: "Obras Públicas", employees: 32, averageSalary: 380000 },
          { department: "Salud", employees: 28, averageSalary: 420000 },
          { department: "Educación", employees: 22, averageSalary: 395000 }
        ];
        
      default:
        return [];
    }
  }

  /***
   * Get data sources for analytics
   */
  private getAnalyticsSources(year?: number): DataSource[] {
    return [
      // Budget data sources
      { type: "json", path: `/data/consolidated/${year || 2025}/budget.json`, category: "budget" },
      { type: "csv", path: `/data/csv/Budget_Execution_${year || 2025}.csv`, category: "budget" },
      
      // Debt data sources
      { type: "json", path: `/data/consolidated/${year || 2025}/debt.json`, category: "debt" },
      { type: "csv", path: `/data/csv/Debt_Report_${year || 2025}.csv`, category: "debt" },
      
      // Treasury data sources
      { type: "json", path: `/data/consolidated/${year || 2025}/treasury.json`, category: "treasury" },
      { type: "csv", path: `/data/csv/Treasury_${year || 2025}.csv`, category: "treasury" },
      
      // Contracts data sources
      { type: "json", path: `/data/consolidated/${year || 2025}/contracts.json`, category: "contracts" },
      { type: "csv", path: `/data/csv/Contracts_${year || 2025}.csv`, category: "contracts" },
      
      // Salaries data sources
      { type: "json", path: `/data/consolidated/${year || 2025}/salaries.json`, category: "salaries" },
      { type: "csv", path: `/data/csv/Salaries_${year || 2025}.csv`, category: "salaries" },
      
      // Documents data sources
      { type: "json", path: `/data/consolidated/${year || 2025}/documents.json`, category: "documents" },
      { type: "pdf", path: `/data/pdfs/documents_${year || 2025}.pdf`, category: "documents" }
    ];
  }

}

// Export singleton instance
const unifiedDataService = UnifiedDataService.getInstance();
export default unifiedDataService;

// Export types
export type { DataSource, DataInventory, PageData };
