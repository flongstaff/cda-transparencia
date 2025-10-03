/**
 * CarmenScraperService
 * Service to connect to Carmen de Areco portal scraper endpoints
 * Provides data from official Carmen de Areco sources
 */

import { buildApiUrl } from '../config/apiConfig';

export interface CarmenScraperResponse {
  success: boolean;
  data: any;
  source: string;
  lastModified?: string;
  error?: string;
  responseTime?: number;
}

export interface CarmenDataResult {
  official?: any;
  transparency?: any;
  boletin?: any;
  licitaciones?: any;
  declaraciones?: any;
  hcd?: any;
}

class CarmenScraperService {
  private static instance: CarmenScraperService;

  private constructor() {}

  public static getInstance(): CarmenScraperService {
    if (!CarmenScraperService.instance) {
      CarmenScraperService.instance = new CarmenScraperService();
    }
    return CarmenScraperService.instance;
  }

  /**
   * Fetch data from Carmen de Areco official site
   */
  async fetchOfficialData(): Promise<CarmenScraperResponse> {
    try {
      const response = await fetch(buildApiUrl('carmen/official'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data || data,
        source: 'Carmen de Areco Official Site',
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Carmen official data:', error);
      return {
        success: false,
        data: null,
        source: 'Carmen de Areco Official Site',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch data from Carmen de Areco transparency portal
   */
  async fetchTransparencyData(): Promise<CarmenScraperResponse> {
    try {
      const response = await fetch(buildApiUrl('carmen/transparency'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data || data,
        source: 'Carmen de Areco Transparency Portal',
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Carmen transparency data:', error);
      return {
        success: false,
        data: null,
        source: 'Carmen de Areco Transparency Portal',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch data from Carmen de Areco official bulletin
   */
  async fetchBoletinData(): Promise<CarmenScraperResponse> {
    try {
      const response = await fetch(buildApiUrl('carmen/boletin'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data || data,
        source: 'Carmen de Areco Official Bulletin',
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Carmen boletin data:', error);
      return {
        success: false,
        data: null,
        source: 'Carmen de Areco Official Bulletin',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch data from Carmen de Areco licitaciones/contrataciones
   */
  async fetchLicitacionesData(): Promise<CarmenScraperResponse> {
    try {
      const response = await fetch(buildApiUrl('carmen/licitaciones'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data || data,
        source: 'Carmen de Areco Licitaciones',
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Carmen licitaciones data:', error);
      return {
        success: false,
        data: null,
        source: 'Carmen de Areco Licitaciones',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch data from Carmen de Areco declaraciones juradas
   */
  async fetchDeclaracionesData(): Promise<CarmenScraperResponse> {
    try {
      const response = await fetch(buildApiUrl('carmen/declaraciones'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data || data,
        source: 'Carmen de Areco Declaraciones Juradas',
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Carmen declaraciones data:', error);
      return {
        success: false,
        data: null,
        source: 'Carmen de Areco Declaraciones Juradas',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch data from Honorable Concejo Deliberante blog
   */
  async fetchHCDData(): Promise<CarmenScraperResponse> {
    try {
      const response = await fetch(buildApiUrl('hcd/blog'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data || data,
        source: 'HCD Blog',
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching HCD blog data:', error);
      return {
        success: false,
        data: null,
        source: 'HCD Blog',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch all Carmen de Areco data sources
   */
  async fetchAllCarmenData(): Promise<{
    success: boolean;
    results: CarmenDataResult;
    summary: {
      successful_sources: number;
      failed_sources: number;
      total_sources: number;
      last_updated: string;
    };
    error?: string;
  }> {
    try {
      const [
        officialResult,
        transparencyResult,
        boletinResult,
        licitacionesResult,
        declaracionesResult,
        hcdResult
      ] = await Promise.allSettled([
        this.fetchOfficialData(),
        this.fetchTransparencyData(),
        this.fetchBoletinData(),
        this.fetchLicitacionesData(),
        this.fetchDeclaracionesData(),
        this.fetchHCDData()
      ]);

      const results: CarmenDataResult = {};
      let successful = 0;
      let failed = 0;

      if (officialResult.status === 'fulfilled' && officialResult.value.success) {
        results.official = officialResult.value.data;
        successful++;
      } else {
        failed++;
      }

      if (transparencyResult.status === 'fulfilled' && transparencyResult.value.success) {
        results.transparency = transparencyResult.value.data;
        successful++;
      } else {
        failed++;
      }

      if (boletinResult.status === 'fulfilled' && boletinResult.value.success) {
        results.boletin = boletinResult.value.data;
        successful++;
      } else {
        failed++;
      }

      if (licitacionesResult.status === 'fulfilled' && licitacionesResult.value.success) {
        results.licitaciones = licitacionesResult.value.data;
        successful++;
      } else {
        failed++;
      }

      if (declaracionesResult.status === 'fulfilled' && declaracionesResult.value.success) {
        results.declaraciones = declaracionesResult.value.data;
        successful++;
      } else {
        failed++;
      }

      if (hcdResult.status === 'fulfilled' && hcdResult.value.success) {
        results.hcd = hcdResult.value.data;
        successful++;
      } else {
        failed++;
      }

      return {
        success: true,
        results,
        summary: {
          successful_sources: successful,
          failed_sources: failed,
          total_sources: 6,
          last_updated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error fetching all Carmen data:', error);
      return {
        success: false,
        results: {},
        summary: {
          successful_sources: 0,
          failed_sources: 6,
          total_sources: 6,
          last_updated: new Date().toISOString()
        },
        error: (error as Error).message
      };
    }
  }

  /**
   * Get Carmen de Areco specific data for integration
   */
  async getCarmenDataForIntegration(): Promise<any> {
    const allData = await this.fetchAllCarmenData();
    
    if (!allData.success) {
      console.error('Failed to fetch Carmen data for integration:', allData.error);
      return null;
    }

    // Process and structure data for integration with other pages
    const structuredData = {
      ...allData.results,
      summary: {
        ...allData.summary,
        sourcesActive: Object.keys(allData.results).filter(key => allData.results[key as keyof CarmenDataResult] !== undefined)
      }
    };

    return structuredData;
  }
}

const carmenScraperService = CarmenScraperService.getInstance();

export { CarmenScraperService };
export { carmenScraperService };
export default carmenScraperService;