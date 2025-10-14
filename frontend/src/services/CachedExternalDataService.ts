/**
 * CACHED EXTERNAL DATA SERVICE
 *
 * Provides access to cached external API data
 * Simplified version - returns mock data for offline functionality
 */

interface CachedData {
  success: boolean;
  data: any;
  source: string;
  timestamp: string;
  cached: boolean;
}

class CachedExternalDataService {
  private baseUrl = '/data/external';
  private dataCache: Map<string, any> = new Map();

  /**
   * Get RAFAM data
   */
  async getRAFAMData(municipalityCode: string = '270', year?: number): Promise<CachedData> {
    return this.getMockData('rafam', { municipalityCode, year });
  }

  /**
   * Get Carmen de Areco data
   */
  async getCarmenDeArecoData(): Promise<CachedData> {
    return this.getMockData('carmen_official', {});
  }

  /**
   * Get Geographic data
   */
  async getGeorefData(name: string = 'Carmen de Areco'): Promise<CachedData> {
    return this.getMockData('georef', { name });
  }

  /**
   * Get BCRA data
   */
  async getBCRAData(): Promise<CachedData> {
    return this.getMockData('bcra', {});
  }

  /**
   * Get Datos Argentina datasets
   */
  async getDatosArgentinaDatasets(query: string = 'carmen de areco'): Promise<CachedData> {
    return this.getMockData('datos_argentina', { query });
  }

  /**
   * Get Municipal Bulletin
   */
  async getBoletinOficialMunicipal(): Promise<CachedData> {
    return this.getMockData('boletin_municipal', {});
  }

  /**
   * Generic mock data response
   */
  private async getMockData(source: string, params: any): Promise<CachedData> {
    try {
      // Create the appropriate file path based on source and parameters
      let filePath = `${this.baseUrl}/${source}.json`;
      
      // Handle specific cases where the file name follows a different pattern
      if (source === 'rafam') {
        if (params.year) {
          filePath = `${this.baseUrl}/rafam/rafam_${params.year}.json`;
        } else if (params.municipalityCode) {
          // For RAFAM, if no year is provided, try to find the latest year
          filePath = `${this.baseUrl}/rafam/rafam_2025.json`; // Default to latest available year
        }
      } else if (source === 'georef' && params.name) {
        filePath = `${this.baseUrl}/georef_${params.name.toLowerCase().replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.json`;
      }
      
      // Check if we have it in cache first
      const cacheKey = `${source}_${JSON.stringify(params)}`;
      if (this.dataCache.has(cacheKey)) {
        return this.dataCache.get(cacheKey);
      }
      
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      const result: CachedData = {
        success: true,
        data,
        source,
        timestamp: new Date().toISOString(),
        cached: true
      };
      
      this.dataCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.warn(`⚠️ Cache miss for ${source}:`, error);
      // Return mock data as fallback
      return {
        success: true,
        data: {
          available: false,
          message: 'Cached data not available',
          params,
          fallback: true
        },
        source,
        timestamp: new Date().toISOString(),
        cached: true
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.dataCache.clear();
  }
}

const cachedExternalDataService = new CachedExternalDataService();
export default cachedExternalDataService;
