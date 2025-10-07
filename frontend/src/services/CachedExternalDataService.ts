/**
 * CACHED EXTERNAL DATA SERVICE
 *
 * Loads pre-fetched external data from cached JSON files.
 * This eliminates runtime API calls and ensures offline functionality.
 *
 * Data is synced daily using: scripts/sync-external-data.js
 */

interface CacheManifest {
  last_sync: string;
  sources: Array<{
    id: string;
    name: string;
    category: string;
    priority: string;
    files: number;
    total_size: number;
    last_updated: string;
  }>;
  statistics: {
    total_sources: number;
    successful_sources: number;
    total_files: number;
    total_size_bytes: number;
  };
}

interface CachedData {
  success: boolean;
  data: any;
  source: string;
  timestamp: string;
  cached: true;
}

class CachedExternalDataService {
  private baseUrl = '/data/external';
  private manifest: CacheManifest | null = null;
  private dataCache: Map<string, any> = new Map();

  /**
   * Load the cache manifest
   */
  async loadManifest(): Promise<CacheManifest> {
    if (this.manifest) {
      return this.manifest;
    }

    try {
      const response = await fetch(`${this.baseUrl}/cache_manifest.json`);
      this.manifest = await response.json();
      console.log('[Cached Data] Manifest loaded:', this.manifest.statistics);
      return this.manifest;
    } catch (error) {
      console.error('[Cached Data] Failed to load manifest:', error);
      throw error;
    }
  }

  /**
   * Load cached data from a file
   */
  private async loadCachedFile(filename: string): Promise<CachedData> {
    const cacheKey = filename;

    // Check memory cache first
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${filename}`);
      const data = await response.json();

      // Cache in memory
      this.dataCache.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error(`[Cached Data] Failed to load ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Get RAFAM data for a specific year
   */
  async getRAFAMData(municipalityCode: string = '270', year?: number): Promise<CachedData> {
    const targetYear = year || new Date().getFullYear();
    const filename = `rafam_${targetYear}.json`;

    try {
      const data = await this.loadCachedFile(filename);
      console.log(`[Cached Data] ✅ RAFAM ${targetYear} loaded from cache`);
      return data;
    } catch (error) {
      console.warn(`[Cached Data] RAFAM ${targetYear} not in cache, using fallback`);
      return {
        success: false,
        data: null,
        source: 'rafam',
        timestamp: new Date().toISOString(),
        cached: true
      };
    }
  }

  /**
   * Get all RAFAM data (all years)
   */
  async getAllRAFAMData(): Promise<{ [year: number]: CachedData }> {
    const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const results: { [year: number]: CachedData } = {};

    await Promise.all(
      years.map(async (year) => {
        try {
          results[year] = await this.getRAFAMData('270', year);
        } catch (error) {
          console.warn(`[Cached Data] Failed to load RAFAM ${year}`);
        }
      })
    );

    return results;
  }

  /**
   * Get Carmen de Areco official data
   */
  async getCarmenDeArecoData(): Promise<CachedData> {
    try {
      const data = await this.loadCachedFile('carmen_official.json');
      console.log('[Cached Data] ✅ Carmen Official loaded from cache');
      return data;
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'carmen_official',
        timestamp: new Date().toISOString(),
        cached: true
      };
    }
  }

  /**
   * Get Georef geographic data
   */
  async getGeorefData(municipalityName: string = 'Carmen de Areco'): Promise<CachedData> {
    try {
      const data = await this.loadCachedFile('georef.json');
      console.log('[Cached Data] ✅ Georef loaded from cache');
      return data;
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'georef',
        timestamp: new Date().toISOString(),
        cached: true
      };
    }
  }

  /**
   * Get BCRA economic indicators
   */
  async getBCRAData(): Promise<CachedData> {
    try {
      const data = await this.loadCachedFile('bcra.json');
      console.log('[Cached Data] ✅ BCRA loaded from cache');
      return data;
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'bcra',
        timestamp: new Date().toISOString(),
        cached: true
      };
    }
  }

  /**
   * Get Datos Argentina datasets
   */
  async getDatosArgentinaDatasets(query: string = 'carmen de areco'): Promise<CachedData> {
    try {
      const data = await this.loadCachedFile('datos_argentina.json');
      console.log('[Cached Data] ✅ Datos Argentina loaded from cache');
      return data;
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'datos_argentina',
        timestamp: new Date().toISOString(),
        cached: true
      };
    }
  }

  /**
   * Get Boletín Oficial Municipal
   */
  async getBoletinOficialMunicipal(): Promise<CachedData> {
    try {
      const data = await this.loadCachedFile('boletin_municipal.json');
      console.log('[Cached Data] ✅ Boletín Municipal loaded from cache');
      return data;
    } catch (error) {
      return {
        success: false,
        data: null,
        source: 'boletin_municipal',
        timestamp: new Date().toISOString(),
        cached: true
      };
    }
  }

  /**
   * Get all cached data sources
   */
  async getAllCachedData(): Promise<{
    rafam: { [year: number]: CachedData };
    carmen_official: CachedData;
    georef: CachedData;
    bcra: CachedData;
    datos_argentina: CachedData;
    boletin_municipal: CachedData;
    manifest: CacheManifest;
  }> {
    const [rafam, carmen, georef, bcra, datos, boletin, manifest] = await Promise.all([
      this.getAllRAFAMData(),
      this.getCarmenDeArecoData(),
      this.getGeorefData(),
      this.getBCRAData(),
      this.getDatosArgentinaDatasets(),
      this.getBoletinOficialMunicipal(),
      this.loadManifest()
    ]);

    return {
      rafam,
      carmen_official: carmen,
      georef,
      bcra,
      datos_argentina: datos,
      boletin_municipal: boletin,
      manifest
    };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    last_sync: string;
    sources_available: number;
    total_files: number;
    total_size_mb: number;
    age_hours: number;
  }> {
    const manifest = await this.loadManifest();
    const lastSync = new Date(manifest.last_sync);
    const now = new Date();
    const ageHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

    return {
      last_sync: manifest.last_sync,
      sources_available: manifest.statistics.successful_sources,
      total_files: manifest.statistics.total_files,
      total_size_mb: manifest.statistics.total_size_bytes / (1024 * 1024),
      age_hours: ageHours
    };
  }

  /**
   * Clear memory cache
   */
  clearMemoryCache(): void {
    this.dataCache.clear();
    console.log('[Cached Data] Memory cache cleared');
  }
}

// Export singleton instance
export const cachedExternalDataService = new CachedExternalDataService();
export default cachedExternalDataService;
