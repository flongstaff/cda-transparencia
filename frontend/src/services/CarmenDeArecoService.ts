/**
 * Carmen de Areco Service
 * Service for accessing Carmen de Areco specific data from the backend API
 */

import { buildApiUrl } from '../config/apiConfig';

export interface CarmenTransparencyData {
  status: string;
  data: {
    municipality: string;
    province: string;
    country: string;
    budget_overview: {
      current_year: number;
      total_budget: number;
      budget_by_area: Array<{
        area: string;
        percentage: number;
        amount: number;
      }>;
    };
    recent_licitaciones: any[];
    transparency_indicators: {
      budget_accessibility: number;
      document_availability: number;
      public_engagement: number;
      info_quality: number;
    };
    documents: Array<{
      id: string;
      title: string;
      category: string;
      date: string;
      url: string;
    }>;
  };
  message: string;
  timestamp: string;
  source_data: {
    licitaciones_count: number;
    available_years: number[];
  };
}

export interface CarmenLicitacionesData {
  status: string;
  data: {
    municipality: string;
    province: string;
    country: string;
    licitaciones: any[];
    summary: {
      total_count: number;
      year: number;
      total_amount: number;
      active_statuses: string[];
    };
  };
  message: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

class CarmenDeArecoService {
  private static instance: CarmenDeArecoService;

  private constructor() {}

  public static getInstance(): CarmenDeArecoService {
    if (!CarmenDeArecoService.instance) {
      CarmenDeArecoService.instance = new CarmenDeArecoService();
    }
    return CarmenDeArecoService.instance;
  }

  /**
   * Fetch transparency data for Carmen de Areco
   */
  async getTransparencyData(): Promise<ApiResponse<CarmenTransparencyData>> {
    try {
      console.log('🌐 Fetching Carmen de Areco transparency data...');
      
      const apiUrl = buildApiUrl('carmen/transparency');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CarmenTransparencyData = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('❌ Carmen de Areco transparency data fetch error:', error);
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetch licitaciones data for Carmen de Areco
   */
  async getLicitacionesData(): Promise<ApiResponse<CarmenLicitacionesData>> {
    try {
      console.log('🌐 Fetching Carmen de Areco licitaciones data...');
      
      const apiUrl = buildApiUrl('carmen/licitaciones');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CarmenLicitacionesData = await response.json();
      
      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('❌ Carmen de Areco licitaciones data fetch error:', error);
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

const carmenDeArecoService = CarmenDeArecoService.getInstance();

export { CarmenDeArecoService };
export { carmenDeArecoService };
export default carmenDeArecoService;