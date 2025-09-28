// DataService.ts
// Unified data service for accessing all transparency data sources

const API_BASE_URL = '/api';
const DATA_BASE_URL = '/data';

export interface DataSource {
  id: string;
  name: string;
  description: string;
  type: string;
  year?: number;
  years?: string;
  files: Array<{
    path: string;
    format: string;
    size: string;
    description: string;
  }>;
  api_endpoints: string[];
}

export interface DataManifest {
  project: string;
  version: string;
  last_updated: string;
  data_sources: DataSource[];
  total_data_sources: number;
  total_files: number;
  total_api_endpoints: number;
  license: string;
  attribution: string;
}

export class DataService {
  static async getDataManifest(): Promise<DataManifest> {
    try {
      const response = await fetch(`${DATA_BASE_URL}/data_manifest.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data manifest:', error);
      throw error;
    }
  }

  static async getFinancialData(year: number = 2019): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/consolidated.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching financial data for ${year}:`, error);
      throw error;
    }
  }

  static async getFinancialSummary(year: number = 2019): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/summary.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching financial summary for ${year}:`, error);
      throw error;
    }
  }

  static async getRevenueBySource(year: number = 2019): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/revenue_by_source.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching revenue by source for ${year}:`, error);
      throw error;
    }
  }

  static async getExpenditureByProgram(year: number = 2019): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/expenditure_by_program.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching expenditure by program for ${year}:`, error);
      throw error;
    }
  }

  static async getChartData(): Promise<any> {
    try {
      const response = await fetch(`${DATA_BASE_URL}/chart_data.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  static async getAllYears(): Promise<any[]> {
    try {
      const response = await fetch(`${DATA_BASE_URL}/api/time_series.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all years data:', error);
      throw error;
    }
  }

  static async getMasterIndex(): Promise<any> {
    try {
      const response = await fetch(`${DATA_BASE_URL}/master_index.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching master index:', error);
      throw error;
    }
  }

  static async getApiRoutes(): Promise<any> {
    try {
      const response = await fetch(`${DATA_BASE_URL}/api_routes.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching API routes:', error);
      throw error;
    }
  }
}

export default DataService;