/**
 * ComprehensiveExternalDataIntegrationService
 * 
 * Service that orchestrates all external data integration components:
 * - ExternalAPIsService for data fetching
 * - DataNormalizationService for data standardization
 * - DataCachingService for performance optimization
 * - DataSourceIndicatorsService for monitoring and UI indicators
 */

import { externalAPIsService, ExternalDataResponse } from "./ExternalDataAdapter";
import { dataNormalizationService, NormalizedDataPoint } from './DataNormalizationService';
import { dataCachingService } from './DataCachingService';
import { dataSourceIndicatorsService, DataSourceIndicator } from './DataSourceIndicatorsService';

export interface IntegratedDataResponse {
  success: boolean;
  data: NormalizedDataPoint[];
  source: string;
  lastModified?: string;
  error?: string;
  responseTime?: number;
  indicators?: DataSourceIndicator;
}

export interface ComprehensiveDataIntegrationResult {
  municipal: IntegratedDataResponse[];
  provincial: IntegratedDataResponse[];
  national: IntegratedDataResponse[];
  civilSociety: IntegratedDataResponse[];
  summary: {
    totalSources: number;
    successfulSources: number;
    failedSources: number;
    totalDataPoints: number;
    lastUpdated: string;
  };
}

class ComprehensiveExternalDataIntegrationService {
  private static instance: ComprehensiveExternalDataIntegrationService;

  private constructor() {}

  public static getInstance(): ComprehensiveExternalDataIntegrationService {
    if (!ComprehensiveExternalDataIntegrationService.instance) {
      ComprehensiveExternalDataIntegrationService.instance = new ComprehensiveExternalDataIntegrationService();
    }
    return ComprehensiveExternalDataIntegrationService.instance;
  }

  /**
   * Fetch and integrate all external data sources comprehensively
   */
  public async fetchAllIntegratedData(): Promise<ComprehensiveDataIntegrationResult> {
    console.log('🔄 Starting comprehensive external data integration...');

    const startTime = Date.now();

    // Fetch all data sources in parallel
    const [
      municipalData,
      provincialData,
      nationalData,
      civilSocietyData
    ] = await Promise.allSettled([
      this.fetchMunicipalData(),
      this.fetchProvincialData(),
      this.fetchNationalData(),
      this.fetchCivilSocietyData()
    ]);

    // Process results
    const municipalResults = municipalData.status === 'fulfilled' ? municipalData.value : [];
    const provincialResults = provincialData.status === 'fulfilled' ? provincialData.value : [];
    const nationalResults = nationalData.status === 'fulfilled' ? nationalData.value : [];
    const civilSocietyResults = civilSocietyData.status === 'fulfilled' ? civilSocietyData.value : [];

    // Combine all results
    const allResults = [
      ...municipalResults,
      ...provincialResults,
      ...nationalResults,
      ...civilSocietyResults
    ];

    const endTime = Date.now();

    // Calculate summary statistics
    const successfulSources = allResults.filter(r => r.success).length;
    const failedSources = allResults.filter(r => !r.success).length;
    const totalDataPoints = allResults.reduce((sum, r) => 
      sum + (Array.isArray(r.data) ? r.data.length : 0), 0);

    return {
      municipal: municipalResults,
      provincial: provincialResults,
      national: nationalResults,
      civilSociety: civilSocietyResults,
      summary: {
        totalSources: allResults.length,
        successfulSources,
        failedSources,
        totalDataPoints,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Fetch and integrate municipal data sources
   */
  private async fetchMunicipalData(): Promise<IntegratedDataResponse[]> {
    console.log('🏢 Fetching municipal data sources...');

    // Define municipal sources to fetch
    const municipalSources = [
      { id: 'carmen-official', name: 'Carmen de Areco Official Portal', fetcher: () => externalAPIsService.getCarmenDeArecoData() },
      { id: 'carmen-transparency', name: 'Carmen de Areco Transparency Portal', fetcher: () => externalAPIsService.getCarmenDeArecoData() },
      { id: 'carmen-boletin', name: 'Carmen de Areco Official Bulletin', fetcher: () => externalAPIsService.getBoletinOficialProvincial() },
      { id: 'hcd-blog', name: 'Honorable Concejo Deliberante Blog', fetcher: () => externalAPIsService.getCarmenDeArecoData() }
    ];

    // Fetch all municipal sources in parallel
    const results = await Promise.all(
      municipalSources.map(async (source) => {
        try {
          const startTime = Date.now();
          
          // Check cache first
          const cacheKey = `municipal-${source.id}`;
          const cached = dataCachingService.get(cacheKey);
          
          if (cached) {
            console.log(`📦 Using cached data for ${source.name}`);
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: true,
              data: cached.data,
              source: `${source.name} (cached)`,
              lastModified: cached.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }

          // Fetch fresh data
          const rawData = await source.fetcher();
          
          if (rawData.success) {
            // Normalize the data
            const normalizedData = await dataNormalizationService.normalizeExternalData(rawData, source.id);
            
            // Cache the normalized data
            dataCachingService.set(cacheKey, {
              data: normalizedData,
              lastModified: rawData.lastModified || new Date().toISOString()
            }, undefined, 'municipal', 30); // 30 minutes cache
            
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            
            return {
              success: true,
              data: normalizedData,
              source: source.name,
              lastModified: rawData.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          } else {
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: false,
              data: [],
              source: source.name,
              error: rawData.error,
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }
        } catch (error) {
          console.error(`❌ Error fetching ${source.name}:`, error);
          const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
          return {
            success: false,
            data: [],
            source: source.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            indicators: indicator || undefined
          };
        }
      })
    );

    return results;
  }

  /**
   * Fetch and integrate provincial data sources
   */
  private async fetchProvincialData(): Promise<IntegratedDataResponse[]> {
    console.log('🏛️ Fetching provincial data sources...');

    // Define provincial sources to fetch
    const provincialSources = [
      { id: 'rafam', name: 'RAFAM Economic Data', fetcher: () => externalAPIsService.getRAFAMData('270') },
      { id: 'gba-opendata', name: 'Buenos Aires Open Data', fetcher: () => externalAPIsService.getBuenosAiresProvincialData() },
      { id: 'gba-fiscal', name: 'Buenos Aires Fiscal Transparency', fetcher: () => externalAPIsService.getBuenosAiresFiscalData() },
      { id: 'gba-boletin', name: 'Buenos Aires Official Bulletin', fetcher: () => externalAPIsService.getBoletinOficialProvincial() },
      { id: 'expedientes', name: 'Administrative Proceedings', fetcher: () => externalAPIsService.getExpedientesData() }
    ];

    // Fetch all provincial sources in parallel
    const results = await Promise.all(
      provincialSources.map(async (source) => {
        try {
          const startTime = Date.now();
          
          // Check cache first
          const cacheKey = `provincial-${source.id}`;
          const cached = dataCachingService.get(cacheKey);
          
          if (cached) {
            console.log(`📦 Using cached data for ${source.name}`);
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: true,
              data: cached.data,
              source: `${source.name} (cached)`,
              lastModified: cached.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }

          // Fetch fresh data
          const rawData = await source.fetcher();
          
          if (rawData.success) {
            // Normalize the data
            const normalizedData = await dataNormalizationService.normalizeExternalData(rawData, source.id);
            
            // Cache the normalized data
            dataCachingService.set(cacheKey, {
              data: normalizedData,
              lastModified: rawData.lastModified || new Date().toISOString()
            }, undefined, 'provincial', 120); // 2 hours cache
            
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            
            return {
              success: true,
              data: normalizedData,
              source: source.name,
              lastModified: rawData.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          } else {
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: false,
              data: [],
              source: source.name,
              error: rawData.error,
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }
        } catch (error) {
          console.error(`❌ Error fetching ${source.name}:`, error);
          const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
          return {
            success: false,
            data: [],
            source: source.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            indicators: indicator || undefined
          };
        }
      })
    );

    return results;
  }

  /**
   * Fetch and integrate national data sources
   */
  private async fetchNationalData(): Promise<IntegratedDataResponse[]> {
    console.log('🇦🇷 Fetching national data sources...');

    // Define national sources to fetch
    const nationalSources = [
      { id: 'datos-argentina', name: 'Datos Argentina', fetcher: () => externalAPIsService.getNationalBudgetData() },
      { id: 'georef', name: 'Geographic Reference API', fetcher: () => externalAPIsService.getGeographicData() },
      { id: 'presupuesto-abierto', name: 'Presupuesto Abierto Nacional', fetcher: () => externalAPIsService.getNationalBudgetData() },
      { id: 'afip', name: 'AFIP Tax Data', fetcher: () => externalAPIsService.getAFIPData() },
      { id: 'contrataciones', name: 'Contrataciones Abiertas', fetcher: () => externalAPIsService.getContratacionesData() },
      { id: 'boletin-nacional', name: 'Boletín Oficial Nacional', fetcher: () => externalAPIsService.getBoletinOficialNacional() },
      { id: 'obras-publicas', name: 'Obras Públicas API', fetcher: () => externalAPIsService.getObrasPublicasData() },
      { id: 'aaip', name: 'AAIP Transparency Data', fetcher: () => externalAPIsService.getAAIPData() }
    ];

    // Fetch all national sources in parallel
    const results = await Promise.all(
      nationalSources.map(async (source) => {
        try {
          const startTime = Date.now();
          
          // Check cache first
          const cacheKey = `national-${source.id}`;
          const cached = dataCachingService.get(cacheKey);
          
          if (cached) {
            console.log(`📦 Using cached data for ${source.name}`);
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: true,
              data: cached.data,
              source: `${source.name} (cached)`,
              lastModified: cached.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }

          // Fetch fresh data
          const rawData = await source.fetcher();
          
          if (rawData.success) {
            // Normalize the data
            const normalizedData = await dataNormalizationService.normalizeExternalData(rawData, source.id);
            
            // Cache the normalized data
            dataCachingService.set(cacheKey, {
              data: normalizedData,
              lastModified: rawData.lastModified || new Date().toISOString()
            }, undefined, 'national', 360); // 6 hours cache
            
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            
            return {
              success: true,
              data: normalizedData,
              source: source.name,
              lastModified: rawData.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          } else {
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: false,
              data: [],
              source: source.name,
              error: rawData.error,
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }
        } catch (error) {
          console.error(`❌ Error fetching ${source.name}:`, error);
          const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
          return {
            success: false,
            data: [],
            source: source.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            indicators: indicator || undefined
          };
        }
      })
    );

    return results;
  }

  /**
   * Fetch and integrate civil society data sources
   */
  private async fetchCivilSocietyData(): Promise<IntegratedDataResponse[]> {
    console.log('👥 Fetching civil society data sources...');

    // Define civil society sources to fetch
    const civilSocietySources = [
      { id: 'poder-ciudadano', name: 'Poder Ciudadano', fetcher: () => externalAPIsService.getPoderCiudadanoData() },
      { id: 'acij', name: 'ACIJ', fetcher: () => externalAPIsService.getACIJData() },
      { id: 'directorio-legislativo', name: 'Directorio Legislativo', fetcher: () => externalAPIsService.getDirectorioLegislativoData() }
    ];

    // Fetch all civil society sources in parallel
    const results = await Promise.all(
      civilSocietySources.map(async (source) => {
        try {
          const startTime = Date.now();
          
          // Check cache first
          const cacheKey = `civil-${source.id}`;
          const cached = dataCachingService.get(cacheKey);
          
          if (cached) {
            console.log(`📦 Using cached data for ${source.name}`);
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: true,
              data: cached.data,
              source: `${source.name} (cached)`,
              lastModified: cached.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }

          // Fetch fresh data
          const rawData = await source.fetcher();
          
          if (rawData.success) {
            // Normalize the data
            const normalizedData = await dataNormalizationService.normalizeExternalData(rawData, source.id);
            
            // Cache the normalized data
            dataCachingService.set(cacheKey, {
              data: normalizedData,
              lastModified: rawData.lastModified || new Date().toISOString()
            }, undefined, 'civil_society', 1440); // 24 hours cache
            
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            
            return {
              success: true,
              data: normalizedData,
              source: source.name,
              lastModified: rawData.lastModified || new Date().toISOString(),
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          } else {
            const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
            return {
              success: false,
              data: [],
              source: source.name,
              error: rawData.error,
              responseTime: Date.now() - startTime,
              indicators: indicator || undefined
            };
          }
        } catch (error) {
          console.error(`❌ Error fetching ${source.name}:`, error);
          const indicator = await dataSourceIndicatorsService.getIndicator(source.id);
          return {
            success: false,
            data: [],
            source: source.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            indicators: indicator || undefined
          };
        }
      })
    );

    return results;
  }

  /**
   * Get data source indicators for UI display
   */
  public async getDataSourceIndicators(): Promise<DataSourceIndicator[]> {
    return await dataSourceIndicatorsService.generateIndicators();
  }

  /**
   * Get health metrics for all data sources
   */
  public async getHealthMetrics() {
    return await dataSourceIndicatorsService.getHealthMetrics();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return dataCachingService.getStats();
  }

  /**
   * Clear all caches
   */
  public clearAllCaches(): void {
    dataCachingService.clear();
    externalAPIsService.clearCache();
  }

  /**
   * Refresh all data sources
   */
  public async refreshAllData(): Promise<ComprehensiveDataIntegrationResult> {
    console.log('🔄 Refreshing all external data sources...');
    
    // Clear caches first
    this.clearAllCaches();
    
    // Fetch fresh data
    return await this.fetchAllIntegratedData();
  }

  /**
   * Get specific data source by ID
   */
  public async getDataSourceById(sourceId: string): Promise<IntegratedDataResponse | null> {
    // Try to get from cache first
    const cacheKey = `specific-${sourceId}`;
    const cached = dataCachingService.get(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached.data,
        source: `${sourceId} (cached)`,
        lastModified: cached.lastModified || new Date().toISOString()
      };
    }

    try {
      let rawData: ExternalDataResponse | null = null;

      // Map source IDs to fetch functions
      const sourceMap: Record<string, () => Promise<ExternalDataResponse>> = {
        'carmen-official': () => externalAPIsService.getCarmenDeArecoData(),
        'rafam': () => externalAPIsService.getRAFAMData('270'),
        'gba-opendata': () => externalAPIsService.getBuenosAiresProvincialData(),
        'datos-argentina': () => externalAPIsService.getNationalBudgetData(),
        'afip': () => externalAPIsService.getAFIPData(),
        'contrataciones': () => externalAPIsService.getContratacionesData(),
        'poder-ciudadano': () => externalAPIsService.getPoderCiudadanoData(),
        'acij': () => externalAPIsService.getACIJData()
      };

      const fetchFunction = sourceMap[sourceId];
      if (fetchFunction) {
        rawData = await fetchFunction();
      }

      if (rawData && rawData.success) {
        // Normalize the data
        const normalizedData = await dataNormalizationService.normalizeExternalData(rawData, sourceId);
        
        // Cache the result
        dataCachingService.set(cacheKey, {
          data: normalizedData,
          lastModified: rawData.lastModified || new Date().toISOString()
        });
        
        return {
          success: true,
          data: normalizedData,
          source: sourceId,
          lastModified: rawData.lastModified || new Date().toISOString()
        };
      } else {
        return {
          success: false,
          data: [],
          source: sourceId,
          error: rawData?.error || 'Data source not found or unavailable'
        };
      }
    } catch (error) {
      console.error(`❌ Error fetching data source ${sourceId}:`, error);
      return {
        success: false,
        data: [],
        source: sourceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Transform data for specific visualization types
   */
  public transformForVisualization(
    data: NormalizedDataPoint[],
    visualizationType: 'time-series' | 'comparison' | 'distribution' | 'hierarchical'
  ) {
    return dataNormalizationService.transformForVisualization(data, visualizationType);
  }

  /**
   * Calculate data quality metrics
   */
  public calculateDataQuality(data: NormalizedDataPoint[]) {
    return dataNormalizationService.calculateQualityMetrics(data);
  }
}

const comprehensiveExternalDataIntegrationService = ComprehensiveExternalDataIntegrationService.getInstance();

export { ComprehensiveExternalDataIntegrationService };
export { comprehensiveExternalDataIntegrationService };
export default comprehensiveExternalDataIntegrationService;