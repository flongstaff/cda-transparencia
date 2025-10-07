/**
 * UnifiedTransparencyService
 *
 * Orchestrates data from multiple transparency sources including:
 * - Poder Ciudadano transparency reports
 * - ACIJ legal challenge data
 * - Directorio Legislativo representative information
 * - AAIP compliance monitoring
 *
 * This service provides a unified interface for accessing transparency data
 * and implements caching for improved performance.
 */

import { externalAPIsService } from './ExternalAPIsService';
import { dataCachingService } from './DataCachingService';

export interface TransparencyData {
  poderCiudadano?: any;
  acij?: any;
  directorioLegislativo?: any;
  aaip?: any;
  compliance?: any;
  lastUpdated: string;
}

export interface TransparencyDataSource {
  name: string;
  url: string;
  type: 'api' | 'scraping' | 'rss';
  format: 'json' | 'xml' | 'html' | 'csv';
  enabled: boolean;
  priority: number;
  cacheMinutes: number;
}

class UnifiedTransparencyService {
  private static instance: UnifiedTransparencyService;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

  private constructor() {}

  public static getInstance(): UnifiedTransparencyService {
    if (!UnifiedTransparencyService.instance) {
      UnifiedTransparencyService.instance = new UnifiedTransparencyService();
    }
    return UnifiedTransparencyService.instance;
  }

  /**
   * Get all transparency data from various sources
   */
  async getTransparencyData(): Promise<TransparencyData> {
    const cacheKey = 'transparency-data';
    
    // Check if we have cached data
    const cachedData = dataCachingService.get(cacheKey);
    if (cachedData) {
      console.log('📦 Returning cached transparency data');
      return cachedData;
    }

    try {
      // Fetch data from all sources in parallel
      const [
        poderCiudadanoData,
        acijData,
        directorioLegislativoData,
        aaipData
      ] = await Promise.all([
        this.fetchPoderCiudadanoData(),
        this.fetchACIJData(),
        this.fetchDirectorioLegislativoData(),
        this.fetchAAIPData()
      ]);

      // Combine all data
      const transparencyData: TransparencyData = {
        poderCiudadano: poderCiudadanoData,
        acij: acijData,
        directorioLegislativo: directorioLegislativoData,
        aaip: aaipData,
        lastUpdated: new Date().toISOString()
      };

      // Cache the data
      dataCachingService.set(cacheKey, transparencyData, undefined, 'transparency', this.CACHE_DURATION);

      return transparencyData;
    } catch (error) {
      console.error('❌ Error fetching transparency data:', error);
      
      // Return fallback data if any source fails
      return {
        poderCiudadano: null,
        acij: null,
        directorioLegislativo: null,
        aaip: null,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch Poder Ciudadano transparency reports
   */
  private async fetchPoderCiudadanoData(): Promise<any> {
    console.log('👥 Fetching Poder Ciudadano data...');
    
    const cacheKey = 'poder-ciudadano-data';
    const cached = dataCachingService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await externalAPIsService.getPoderCiudadanoData();
      
      if (result.success && result.data) {
        dataCachingService.set(cacheKey, result.data, undefined, 'civil_society', 1440); // 24 hours
        return result.data;
      }
      
      console.warn('⚠️ Poder Ciudadano data fetch failed or returned no data');
      return null;
    } catch (error) {
      console.error('❌ Error fetching Poder Ciudadano data:', error);
      return null;
    }
  }

  /**
   * Fetch ACIJ legal challenge data
   */
  private async fetchACIJData(): Promise<any> {
    console.log('⚖️ Fetching ACIJ data...');
    
    const cacheKey = 'acij-data';
    const cached = dataCachingService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await externalAPIsService.getACIJData();
      
      if (result.success && result.data) {
        dataCachingService.set(cacheKey, result.data, undefined, 'civil_society', 1440); // 24 hours
        return result.data;
      }
      
      console.warn('⚠️ ACIJ data fetch failed or returned no data');
      return null;
    } catch (error) {
      console.error('❌ Error fetching ACIJ data:', error);
      return null;
    }
  }

  /**
   * Fetch Directorio Legislativo representative information
   */
  private async fetchDirectorioLegislativoData(): Promise<any> {
    console.log('🏛️ Fetching Directorio Legislativo data...');
    
    const cacheKey = 'directorio-legislativo-data';
    const cached = dataCachingService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await externalAPIsService.getDirectorioLegislativoData();
      
      if (result.success && result.data) {
        dataCachingService.set(cacheKey, result.data, undefined, 'civil_society', 1440); // 24 hours
        return result.data;
      }
      
      console.warn('⚠️ Directorio Legislativo data fetch failed or returned no data');
      return null;
    } catch (error) {
      console.error('❌ Error fetching Directorio Legislativo data:', error);
      return null;
    }
  }

  /**
   * Fetch AAIP compliance monitoring data
   */
  private async fetchAAIPData(): Promise<any> {
    console.log('🔍 Fetching AAIP compliance data...');
    
    const cacheKey = 'aaip-data';
    const cached = dataCachingService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await externalAPIsService.getAAIPData();
      
      if (result.success && result.data) {
        dataCachingService.set(cacheKey, result.data, undefined, 'national', 60); // 1 hour
        return result.data;
      }
      
      console.warn('⚠️ AAIP data fetch failed or returned no data');
      return null;
    } catch (error) {
      console.error('❌ Error fetching AAIP data:', error);
      return null;
    }
  }

  /**
   * Get compliance monitoring data specifically
   */
  async getComplianceData(): Promise<any> {
    console.log('🔍 Fetching compliance monitoring data...');
    
    const cacheKey = 'compliance-data';
    const cached = dataCachingService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Get AAIP transparency index data
      const aaipIndexResult = await externalAPIsService.getAAIPTransparencyIndex();
      
      // Get InfoLEG data for legal information
      const infolegResult = await externalAPIsService.getInfoLEGData();
      
      // Get Ministry of Justice data
      const justiceResult = await externalAPIsService.getMinistryOfJusticeData();
      
      const complianceData = {
        aaip: aaipIndexResult.success ? aaipIndexResult.data : null,
        infoleg: infolegResult.success ? infolegResult.data : null,
        justice: justiceResult.success ? justiceResult.data : null,
        lastUpdated: new Date().toISOString()
      };

      dataCachingService.set(cacheKey, complianceData, undefined, 'national', 60); // 1 hour
      
      return complianceData;
    } catch (error) {
      console.error('❌ Error fetching compliance data:', error);
      return null;
    }
  }

  /**
   * Get specific transparency data by source
   */
  async getTransparencyDataBySource(source: 'poderCiudadano' | 'acij' | 'directorioLegislativo' | 'aaip'): Promise<any> {
    switch (source) {
      case 'poderCiudadano':
        return await this.fetchPoderCiudadanoData();
      case 'acij':
        return await this.fetchACIJData();
      case 'directorioLegislativo':
        return await this.fetchDirectorioLegislativoData();
      case 'aaip':
        return await this.fetchAAIPData();
      default:
        throw new Error(`Unknown transparency source: ${source}`);
    }
  }

  /**
   * Clear all cached transparency data
   */
  clearCache(): void {
    // Clear specific cache keys for transparency data
    const cacheKeys = [
      'transparency-data',
      'poder-ciudadano-data',
      'acij-data',
      'directorio-legislativo-data',
      'aaip-data',
      'compliance-data'
    ];
    
    cacheKeys.forEach(key => {
      dataCachingService.delete(key);
    });
    
    console.log('🧹 Cleared transparency data cache');
  }

  /**
   * Get cache statistics for transparency data
   */
  getCacheStats(): any {
    return dataCachingService.getStats();
  }

  /**
   * Check if cache has valid transparency data
   */
  isCacheValid(): boolean {
    const cacheKey = 'transparency-data';
    return dataCachingService.has(cacheKey);
  }

  /**
   * Get health status of transparency data sources
   */
  async getHealthStatus(): Promise<any> {
    try {
      const health = await externalAPIsService.getServiceHealth();
      
      return {
        status: health.status,
        sources: health.sources,
        cacheSize: health.cache_size,
        lastCheck: health.last_check
      };
    } catch (error) {
      console.error('❌ Error getting transparency service health:', error);
      return {
        status: 'down',
        sources: [],
        cacheSize: 0,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch all transparency data sources with enhanced error handling and fallbacks
   */
  async getAllTransparencyData(): Promise<TransparencyData> {
    console.log('🌐 Fetching all transparency data sources...');
    
    try {
      const [
        poderCiudadano,
        acij,
        directorioLegislativo,
        aaip,
        compliance
      ] = await Promise.all([
        this.fetchPoderCiudadanoData(),
        this.fetchACIJData(),
        this.fetchDirectorioLegislativoData(),
        this.fetchAAIPData(),
        this.getComplianceData()
      ]);

      const transparencyData: TransparencyData = {
        poderCiudadano,
        acij,
        directorioLegislativo,
        aaip,
        compliance,
        lastUpdated: new Date().toISOString()
      };

      // Cache the data
      dataCachingService.set('transparency-data', transparencyData, undefined, 'transparency', this.CACHE_DURATION);
      
      return transparencyData;
    } catch (error) {
      console.error('❌ Error fetching all transparency data:', error);
      
      // Return fallback with minimal data
      return {
        poderCiudadano: null,
        acij: null,
        directorioLegislativo: null,
        aaip: null,
        compliance: null,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch data from specific transparency source with enhanced error handling
   */
  async fetchTransparencySource(source: string, query?: string): Promise<any> {
    console.log(`🌐 Fetching data from ${source}...`);
    
    try {
      switch (source.toLowerCase()) {
        case 'poderciudadano':
          return await externalAPIsService.getPoderCiudadanoData(query);
        case 'acij':
          return await externalAPIsService.getACIJData(query);
        case 'directoriolegislativo':
          return await externalAPIsService.getDirectorioLegislativoData(query);
        case 'aaip':
          return await externalAPIsService.getAAIPData();
        case 'infoleg':
          return await externalAPIsService.getInfoLEGData(query);
        case 'justice':
          return await externalAPIsService.getMinistryOfJusticeData(query);
        default:
          throw new Error(`Unknown transparency source: ${source}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${source} data:`, error);
      return {
        success: false,
        data: null,
        source,
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch and process data from all transparency sources in parallel
   */
  async getProcessedTransparencyData(): Promise<TransparencyData> {
    console.log('🔄 Fetching and processing all transparency data...');
    
    try {
      const [
        poderCiudadanoResult,
        acijResult,
        directorioLegislativoResult,
        aaipResult,
        complianceResult
      ] = await Promise.all([
        externalAPIsService.getPoderCiudadanoData(),
        externalAPIsService.getACIJData(),
        externalAPIsService.getDirectorioLegislativoData(),
        externalAPIsService.getAAIPData(),
        this.getComplianceData()
      ]);

      const transparencyData: TransparencyData = {
        poderCiudadano: poderCiudadanoResult.success ? poderCiudadanoResult.data : null,
        acij: acijResult.success ? acijResult.data : null,
        directorioLegislativo: directorioLegislativoResult.success ? directorioLegislativoResult.data : null,
        aaip: aaipResult.success ? aaipResult.data : null,
        compliance: complianceResult,
        lastUpdated: new Date().toISOString()
      };

      // Cache the data
      dataCachingService.set('transparency-data', transparencyData, undefined, 'transparency', this.CACHE_DURATION);
      
      return transparencyData;
    } catch (error) {
      console.error('❌ Error processing transparency data:', error);
      
      // Return fallback with minimal data
      return {
        poderCiudadano: null,
        acij: null,
        directorioLegislativo: null,
        aaip: null,
        compliance: null,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

const unifiedTransparencyService = UnifiedTransparencyService.getInstance();

export { UnifiedTransparencyService };
export { unifiedTransparencyService };
export default unifiedTransparencyService;
