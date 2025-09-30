/**
 * Enhanced Data Service - Stub version to prevent build errors
 * This is a minimal implementation to avoid breaking imports
 */

export default class EnhancedDataService {
  private static instance: EnhancedDataService;

  static getInstance(): EnhancedDataService {
    if (!EnhancedDataService.instance) {
      EnhancedDataService.instance = new EnhancedDataService();
    }
    return EnhancedDataService.instance;
  }

  // Stub methods to prevent runtime errors
  static async getAllYears(): Promise<any[]> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty array');
    return [];
  }

  static async getBudget(year: number): Promise<any> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty object');
    return {};
  }

  static async getContracts(year: number): Promise<any[]> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty array');
    return [];
  }

  static async getSalaries(year: number): Promise<any[]> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty array');
    return [];
  }

  static async getTreasury(year: number): Promise<any> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty object');
    return {};
  }

  static async getDebt(year: number): Promise<any> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty object');
    return {};
  }

  static async getDocuments(year: number): Promise<any[]> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty array');
    return [];
  }

  static async fetchJson<T>(url: string, cacheKey?: string): Promise<T | null> {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning null');
    return null;
  }

  static clearCache(): void {
    console.warn('[ENHANCED DATA SERVICE] Stub method - cache clear not implemented');
  }

  static getCacheStats(): any {
    console.warn('[ENHANCED DATA SERVICE] Stub method - returning empty stats');
    return {
      total_keys: 0,
      cache_size: '0 MB',
      entries: []
    };
  }
}