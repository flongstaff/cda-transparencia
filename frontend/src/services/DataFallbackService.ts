/**
 * Data Fallback Service
 * Ensures data loads from local files when Workers/APIs are unavailable
 */

class DataFallbackService {
  private static instance: DataFallbackService;

  public static getInstance(): DataFallbackService {
    if (!DataFallbackService.instance) {
      DataFallbackService.instance = new DataFallbackService();
    }
    return DataFallbackService.instance;
  }

  /**
   * Fetch with automatic fallback to local files
   */
  async fetchWithFallback(remotePath: string, localPath?: string): Promise<any> {
    const pathToTry = localPath || remotePath;
    
    try {
      // Try remote first (Worker/API)
      const remoteResponse = await fetch(remotePath, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (remoteResponse.ok) {
        return await remoteResponse.json();
      }
    } catch (remoteError) {
      console.warn(`Remote fetch failed for ${remotePath}, trying local...`);
    }

    // Fallback to local file
    try {
      const localUrl = pathToTry.startsWith('/') ? pathToTry : `/${pathToTry}`;
      const localResponse = await fetch(localUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (localResponse.ok) {
        return await localResponse.json();
      }

      throw new Error(`Local fetch also failed for ${localUrl}`);
    } catch (localError) {
      console.error(`All fetch attempts failed for ${pathToTry}:`, localError);
      return null;
    }
  }

  /**
   * Load year data with fallback
   */
  async loadYearData(year: number): Promise<any> {
    const dataTypes = ['summary', 'gastos', 'recursos', 'tesoreria', 'presupuesto', 'personal'];
    const results: any = { year, loaded: {} };

    for (const type of dataTypes) {
      const localPath = `data/consolidated/${year}/${type}.json`;
      const data = await this.fetchWithFallback(localPath, localPath);
      
      if (data) {
        results.loaded[type] = data;
      }
    }

    return results;
  }

  /**
   * Load master index
   */
  async loadMasterIndex(): Promise<any> {
    return this.fetchWithFallback(
      'data/master_data_index.json',
      'data/master_data_index.json'
    );
  }

  /**
   * Load OCR extraction index
   */
  async loadOCRIndex(): Promise<any> {
    return this.fetchWithFallback(
      'data/ocr_extracted/extraction_index.json',
      'data/ocr_extracted/extraction_index.json'
    );
  }
}

export const dataFallbackService = DataFallbackService.getInstance();
export default dataFallbackService;
