/**
 * UnifiedDataService - Main data service for the transparency portal
 * Consolidates all data access and provides a single interface for municipal data
 */

const API_BASE = 'http://localhost:3001/api';

interface MunicipalData {
  year: number;
  budget: {
    total: number;
    executed: number;
    percentage: number;
    categories: Array<{
      name: string;
      budgeted: number;
      executed: number;
      percentage: number;
    }>;
  };
  revenue: {
    total: number;
    sources: Array<{
      source: string;
      amount: number;
      percentage: number;
    }>;
  };
  expenses: {
    total: number;
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
  };
  salaries: {
    total: number;
    employees: number;
    scale: Array<{
      position: string;
      salary: number;
      level: string;
    }>;
  };
  contracts: Array<{
    id: string;
    vendor: string;
    amount: number;
    type: string;
    status: string;
    date: string;
  }>;
  investments: Array<{
    id: string;
    project: string;
    amount: number;
    status: string;
    completion: number;
  }>;
  debt: {
    total: number;
    items: Array<{
      creditor: string;
      amount: number;
      rate: number;
      maturity: string;
    }>;
  };
}

interface DocumentData {
  id: string;
  title: string;
  year: number;
  category: string;
  type: string;
  url: string;
  processed_url?: string;
  metadata: {
    size: number;
    pages?: number;
    language: string;
  };
}

class UnifiedDataService {
  private cache: Map<string, any> = new Map();

  /**
   * Get municipal data for a specific year
   */
  async getYearlyData(year: number): Promise<MunicipalData> {
    const cacheKey = `yearly-${year}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${API_BASE}/yearly-data/${year}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching yearly data:', error);
      throw error;
    }
  }

  /**
   * Get all available documents
   */
  async getDocuments(year?: number, category?: string): Promise<DocumentData[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', year.toString());
    if (category) params.set('category', category);

    const cacheKey = `docs-${params.toString()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${API_BASE}/documents?${params}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Get budget data for a specific year
   */
  async getBudgetData(year: number) {
    const cacheKey = `budget-${year}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${API_BASE}/budget/${year}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching budget data:', error);
      throw error;
    }
  }

  /**
   * Get salary data for a specific year
   */
  async getSalaryData(year: number) {
    const cacheKey = `salaries-${year}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${API_BASE}/salaries/${year}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching salary data:', error);
      throw error;
    }
  }

  /**
   * Get contracts data for a specific year
   */
  async getContractsData(year: number) {
    const cacheKey = `contracts-${year}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${API_BASE}/contracts/${year}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching contracts data:', error);
      throw error;
    }
  }

  /**
   * Get available years with data
   */
  async getAvailableYears(): Promise<number[]> {
    const cacheKey = 'available-years';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${API_BASE}/years`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching available years:', error);
      return [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;
export type { MunicipalData, DocumentData };