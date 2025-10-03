/**
 * Production Data Manager
 *
 * Manages data fetching, caching, and persistence for production deployment
 * Ensures all external services are fetched efficiently and cached properly
 */

import { externalAPIsService } from './ExternalAPIsService';
import smartDataLoader from './SmartDataLoader';
import dataCachingService from './DataCachingService';

export interface DataManagerStats {
  totalSources: number;
  activeSources: number;
  cachedSources: number;
  failedSources: number;
  lastSync: Date | null;
  cacheSize: number;
}

export interface ExternalDataStatus {
  sourceId: string;
  name: string;
  category: 'municipal' | 'provincial' | 'national' | 'civil_society';
  active: boolean;
  cached: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

class ProductionDataManager {
  private static instance: ProductionDataManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private stats: DataManagerStats = {
    totalSources: 0,
    activeSources: 0,
    cachedSources: 0,
    failedSources: 0,
    lastSync: null,
    cacheSize: 0
  };

  private constructor() {}

  public static getInstance(): ProductionDataManager {
    if (!ProductionDataManager.instance) {
      ProductionDataManager.instance = new ProductionDataManager();
    }
    return ProductionDataManager.instance;
  }

  /**
   * Initialize production data manager
   */
  public async initialize(): Promise<void> {
    console.log('[Production Data Manager] Initializing...');

    // Warm up cache with essential data
    await smartDataLoader.warmUpCache();

    // Start background sync
    this.startBackgroundSync();

    console.log('[Production Data Manager] Initialized successfully');
  }

  /**
   * Fetch all external data sources
   */
  public async fetchAllExternalData(): Promise<Map<string, any>> {
    console.log('[Production Data Manager] Fetching all external data sources...');

    const results = new Map<string, any>();
    const searchQuery = 'Carmen de Areco';

    // Define all external sources - ONLY RELIABLE/WORKING ONES
    const externalSources = [
      // Provincial sources - WORKING
      { id: 'rafam', name: 'RAFAM', category: 'provincial', enabled: true, fetcher: () => externalAPIsService.getRAFAMData('270') },
      { id: 'gba', name: 'GBA Datos Abiertos', category: 'provincial', enabled: true, fetcher: () => externalAPIsService.getBuenosAiresProvincialData() },

      // National sources - WORKING
      { id: 'georef', name: 'Georef API', category: 'national', enabled: true, fetcher: () => externalAPIsService.getGeorefData('Carmen de Areco') },
      { id: 'bcra', name: 'BCRA', category: 'national', enabled: true, fetcher: () => externalAPIsService.getBCRAData() },
      { id: 'datos_argentina', name: 'Datos Argentina', category: 'national', enabled: true, fetcher: () => externalAPIsService.getDatosArgentinaDatasets('carmen de areco') },

      // Municipal sources - WORKING (mock data for development)
      { id: 'carmen_official', name: 'Carmen de Areco Oficial', category: 'municipal', enabled: true, fetcher: () => externalAPIsService.getCarmenDeArecoData() },
      { id: 'boletin_municipal', name: 'Boletín Municipal', category: 'municipal', enabled: true, fetcher: () => externalAPIsService.getBoletinOficialMunicipal() },

      // DISABLED - These require authentication or have unreliable endpoints
      // { id: 'afip', name: 'AFIP', category: 'national', enabled: false, fetcher: () => externalAPIsService.getAFIPData('30-99914050-5') },
      // { id: 'contrataciones', name: 'Contrataciones Abiertas', category: 'national', enabled: false, fetcher: () => externalAPIsService.getContratacionesData(searchQuery) },
      // { id: 'aaip', name: 'AAIP Transparencia', category: 'national', enabled: false, fetcher: () => externalAPIsService.getAAIPTransparencyIndex(searchQuery) },
      // { id: 'infoleg', name: 'InfoLEG', category: 'national', enabled: false, fetcher: () => externalAPIsService.getInfoLEGData(searchQuery) },
      // { id: 'justice', name: 'Ministerio de Justicia', category: 'national', enabled: false, fetcher: () => externalAPIsService.getMinistryOfJusticeData(searchQuery) },
      // { id: 'poder_ciudadano', name: 'Poder Ciudadano', category: 'civil_society', enabled: false, fetcher: () => externalAPIsService.getPoderCiudadanoData(searchQuery) },
      // { id: 'acij', name: 'ACIJ', category: 'civil_society', enabled: false, fetcher: () => externalAPIsService.getACIJData(searchQuery) },
      // { id: 'directorio_legislativo', name: 'Directorio Legislativo', category: 'national', enabled: false, fetcher: () => externalAPIsService.getDirectorioLegislativoData(searchQuery) }
    ].filter(source => source.enabled !== false);

    this.stats.totalSources = externalSources.length;
    this.stats.activeSources = 0;
    this.stats.failedSources = 0;

    // Fetch all sources in parallel
    const fetchPromises = externalSources.map(async (source) => {
      try {
        const result = await source.fetcher();

        if (result && result.success && result.data) {
          results.set(source.id, result.data);

          // Cache the result
          dataCachingService.set(
            `external-${source.id}`,
            result.data,
            { query: searchQuery },
            source.category
          );

          this.stats.activeSources++;
          console.log(`[Production Data Manager] ✓ ${source.name} fetched successfully`);
        } else {
          this.stats.failedSources++;
          console.warn(`[Production Data Manager] ✗ ${source.name} returned no data`);
        }
      } catch (error) {
        this.stats.failedSources++;
        console.error(`[Production Data Manager] ✗ ${source.name} failed:`, error);
      }
    });

    await Promise.all(fetchPromises);

    this.stats.lastSync = new Date();
    this.stats.cacheSize = dataCachingService.getStats().totalSize;

    console.log(`[Production Data Manager] Sync complete: ${this.stats.activeSources}/${this.stats.totalSources} sources active`);

    return results;
  }

  /**
   * Get status of all external data sources
   */
  public getExternalDataStatus(): ExternalDataStatus[] {
    const sources = [
      { id: 'rafam', name: 'RAFAM Buenos Aires', category: 'provincial' as const },
      { id: 'gba', name: 'GBA Datos Abiertos', category: 'provincial' as const },
      { id: 'afip', name: 'AFIP Datos Fiscales', category: 'national' as const },
      { id: 'contrataciones', name: 'Contrataciones Abiertas', category: 'national' as const },
      { id: 'boletin_nacional', name: 'Boletín Oficial Nacional', category: 'national' as const },
      { id: 'boletin_provincial', name: 'Boletín Oficial Provincial', category: 'provincial' as const },
      { id: 'carmen_official', name: 'Carmen de Areco Oficial', category: 'municipal' as const },
      { id: 'aaip', name: 'AAIP Transparencia', category: 'national' as const },
      { id: 'infoleg', name: 'InfoLEG', category: 'national' as const },
      { id: 'justice', name: 'Ministerio de Justicia', category: 'national' as const },
      { id: 'poder_ciudadano', name: 'Poder Ciudadano', category: 'civil_society' as const },
      { id: 'acij', name: 'ACIJ', category: 'civil_society' as const },
      { id: 'directorio_legislativo', name: 'Directorio Legislativo', category: 'national' as const }
    ];

    return sources.map(source => {
      const cached = dataCachingService.has(`external-${source.id}`, { query: 'Carmen de Areco' });
      const cacheInfo = cached ? dataCachingService.getEntryInfo(`external-${source.id}`, { query: 'Carmen de Areco' }) : null;

      return {
        sourceId: source.id,
        name: source.name,
        category: source.category,
        active: cached,
        cached: cached,
        lastUpdate: cacheInfo ? new Date(cacheInfo.expiry - (cacheInfo.age || 0)) : null,
        error: null
      };
    });
  }

  /**
   * Get local data sources
   */
  public async getLocalDataSources(year: number): Promise<string[]> {
    return [
      `/data/consolidated/${year}/summary.json`,
      `/data/consolidated/${year}/budget.json`,
      `/data/consolidated/${year}/treasury.json`,
      `/data/consolidated/${year}/debt.json`,
      `/data/consolidated/${year}/salaries.json`,
      `/data/consolidated/${year}/contracts.json`,
      `/data/consolidated/${year}/documents.json`,
      `/data/charts/Budget_Execution_consolidated_2019-2025.csv`,
      `/data/charts/Expenditure_Report_consolidated_2019-2025.csv`,
      `/data/charts/Personnel_Expenses_consolidated_2019-2025.csv`
    ];
  }

  /**
   * Prefetch all data for a specific year
   */
  public async prefetchYearData(year: number): Promise<void> {
    console.log(`[Production Data Manager] Prefetching data for year ${year}...`);

    const localSources = await this.getLocalDataSources(year);

    // Prefetch local data
    smartDataLoader.prefetch(localSources, 'local');

    // Prefetch external data
    await this.fetchAllExternalData();

    console.log(`[Production Data Manager] Prefetch complete for year ${year}`);
  }

  /**
   * Start background sync for external data
   */
  private startBackgroundSync(intervalMinutes: number = 60): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync immediately
    this.fetchAllExternalData();

    // Then sync every intervalMinutes
    this.syncInterval = setInterval(() => {
      console.log('[Production Data Manager] Starting background sync...');
      this.fetchAllExternalData();
    }, intervalMinutes * 60 * 1000);

    console.log(`[Production Data Manager] Background sync scheduled every ${intervalMinutes} minutes`);
  }

  /**
   * Stop background sync
   */
  public stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[Production Data Manager] Background sync stopped');
    }
  }

  /**
   * Get data manager statistics
   */
  public getStats(): DataManagerStats {
    return { ...this.stats };
  }

  /**
   * Force refresh all external data
   */
  public async forceRefresh(): Promise<void> {
    console.log('[Production Data Manager] Force refreshing all data...');

    // Clear external data cache
    const externalKeys = dataCachingService.getKeys().filter(key => key.startsWith('external-'));
    externalKeys.forEach(key => {
      const [sourceId] = key.split(':');
      dataCachingService.delete(sourceId);
    });

    // Fetch fresh data
    await this.fetchAllExternalData();

    console.log('[Production Data Manager] Force refresh complete');
  }

  /**
   * Get comprehensive data for a page
   */
  public async getPageData(pageName: string, year: number): Promise<{
    localData: any;
    externalData: any;
    sources: ExternalDataStatus[];
  }> {
    const [localData, externalData] = await Promise.all([
      this.loadLocalDataForPage(pageName, year),
      this.loadExternalDataForPage(pageName)
    ]);

    const sources = this.getExternalDataStatus();

    return {
      localData,
      externalData,
      sources
    };
  }

  /**
   * Load local data for a specific page
   */
  private async loadLocalDataForPage(pageName: string, year: number): Promise<any> {
    const pagePaths: Record<string, string[]> = {
      budget: [
        `/data/consolidated/${year}/budget.json`,
        `/data/charts/Budget_Execution_consolidated_2019-2025.csv`
      ],
      treasury: [
        `/data/consolidated/${year}/treasury.json`
      ],
      debt: [
        `/data/consolidated/${year}/debt.json`
      ],
      expenses: [
        `/data/charts/Expenditure_Report_consolidated_2019-2025.csv`
      ],
      salaries: [
        `/data/consolidated/${year}/salaries.json`,
        `/data/charts/Personnel_Expenses_consolidated_2019-2025.csv`
      ],
      contracts: [
        `/data/consolidated/${year}/contracts.json`
      ],
      documents: [
        `/data/consolidated/${year}/documents.json`,
        `/data/web_accessible_pdfs/pdf_index.json`
      ]
    };

    const paths = pagePaths[pageName.toLowerCase()] || [`/data/consolidated/${year}/summary.json`];

    const results = await Promise.all(
      paths.map(path => smartDataLoader.load(path, undefined, {
        priority: 'immediate',
        sourceType: 'local'
      }))
    );

    return results.reduce((acc, data, idx) => {
      if (data) {
        acc[`source_${idx}`] = data;
      }
      return acc;
    }, {} as any);
  }

  /**
   * Load external data for a specific page
   */
  private async loadExternalDataForPage(pageName: string): Promise<any> {
    const cachedExternal = dataCachingService.get('external-data', { query: 'Carmen de Areco' });

    if (cachedExternal) {
      return cachedExternal;
    }

    // If not cached, fetch it
    const externalData = await this.fetchAllExternalData();

    return Object.fromEntries(externalData);
  }
}

const productionDataManager = ProductionDataManager.getInstance();

export { ProductionDataManager };
export { productionDataManager };
export default productionDataManager;
