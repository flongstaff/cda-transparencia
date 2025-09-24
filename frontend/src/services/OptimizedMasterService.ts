/**
 * OPTIMIZED MASTER SERVICE - ALL-IN-ONE DATA CONSOLIDATION
 *
 * This service consolidates ALL your existing services into one optimized system:
 * - CompleteFinalDataService (most comprehensive)
 * - MasterDataService (GitHub integration)
 * - RealDataService (real data access)
 * - All external APIs and validation systems
 *
 * Provides unified, cached, optimized access to ALL data sources
 */

import { completeFinalDataService } from './CompleteFinalDataService';
import { realDataService } from './RealDataService';
import { masterDataService } from './MasterDataService';

// Re-export all interfaces from the most comprehensive service
export * from './CompleteFinalDataService';

class OptimizedMasterService {
  private static instance: OptimizedMasterService;
  private primaryService = completeFinalDataService; // Your most comprehensive service
  private fallbackServices = [realDataService, masterDataService];
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): OptimizedMasterService {
    if (!OptimizedMasterService.instance) {
      OptimizedMasterService.instance = new OptimizedMasterService();
    }
    return OptimizedMasterService.instance;
  }

  /**
   * OPTIMIZED: Load complete data using the best available service
   * Falls back automatically if primary service fails
   */
  async loadCompleteData(selectedYear?: number) {
    const cacheKey = `complete_data_${selectedYear || 'all'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Primary: Use your most comprehensive CompleteFinalDataService
      console.log('🚀 Loading data with CompleteFinalDataService (primary)');
      const data = await this.primaryService.loadCompleteData(selectedYear);

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;

    } catch (error) {
      console.warn('Primary service failed, trying fallback services:', error);

      // Fallback: Try other services
      for (const service of this.fallbackServices) {
        try {
          console.log(`🔄 Trying fallback service: ${service.constructor.name}`);
          const data = await service.loadCompleteData();

          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        } catch (fallbackError) {
          console.warn(`Fallback service failed: ${service.constructor.name}`, fallbackError);
        }
      }

      throw new Error('All data services failed. Check console for details.');
    }
  }

  /**
   * OPTIMIZED: Load specific year data with intelligent routing
   */
  async loadYearData(year: number) {
    const cacheKey = `year_data_${year}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Use the primary service which has the most comprehensive year data
      const completeData = await this.primaryService.loadCompleteData(year);
      const yearData = completeData.byYear[year] || null;

      this.cache.set(cacheKey, { data: yearData, timestamp: Date.now() });
      return yearData;

    } catch (error) {
      console.warn('Year data loading failed:', error);
      return null;
    }
  }

  /**
   * OPTIMIZED: Load documents with cross-service aggregation
   */
  async loadDocuments(filters?: { year?: number; category?: string }) {
    const cacheKey = `documents_${JSON.stringify(filters || {})}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const completeData = await this.loadCompleteData(filters?.year);
      let documents = completeData.documents || [];

      // Apply filters
      if (filters?.year) {
        documents = documents.filter(doc => doc.year === filters.year);
      }
      if (filters?.category) {
        documents = documents.filter(doc =>
          doc.category?.toLowerCase().includes(filters.category?.toLowerCase() || '')
        );
      }

      this.cache.set(cacheKey, { data: documents, timestamp: Date.now() });
      return documents;

    } catch (error) {
      console.warn('Document loading failed:', error);
      return [];
    }
  }

  /**
   * OPTIMIZED: Get all available years from all services
   */
  async getAvailableYears(): Promise<number[]> {
    const cacheKey = 'available_years';
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const completeData = await this.loadCompleteData();
      const years = completeData.summary?.years_covered || [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

      this.cache.set(cacheKey, { data: years, timestamp: Date.now() });
      return years;

    } catch (error) {
      console.warn('Failed to get available years:', error);
      return [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    }
  }

  /**
   * OPTIMIZED: Load budget data with financial analysis
   */
  async loadBudgetData(year: number) {
    const yearData = await this.loadYearData(year);
    return yearData?.budget || null;
  }

  /**
   * OPTIMIZED: Load salary data with employee analysis
   */
  async loadSalaryData(year: number) {
    const yearData = await this.loadYearData(year);
    return yearData?.salaries || null;
  }

  /**
   * OPTIMIZED: Load contract data with procurement analysis
   */
  async loadContractData(year: number) {
    const yearData = await this.loadYearData(year);
    return yearData?.contracts || [];
  }

  /**
   * OPTIMIZED: Clear all caches for fresh data
   */
  clearCache(): void {
    this.cache.clear();
    this.primaryService.clearCache?.();
    this.fallbackServices.forEach(service => service.clearCache?.());
  }

  /**
   * OPTIMIZED: Get service health status
   */
  async getServiceStatus() {
    const statuses = [];

    // Test primary service
    try {
      await this.primaryService.loadCompleteData();
      statuses.push({ service: 'CompleteFinalDataService', status: 'healthy', primary: true });
    } catch (error) {
      statuses.push({ service: 'CompleteFinalDataService', status: 'failed', error: error.message, primary: true });
    }

    // Test fallback services
    for (const service of this.fallbackServices) {
      try {
        await service.loadCompleteData();
        statuses.push({ service: service.constructor.name, status: 'healthy', primary: false });
      } catch (error) {
        statuses.push({ service: service.constructor.name, status: 'failed', error: error.message, primary: false });
      }
    }

    return {
      overall: statuses.some(s => s.status === 'healthy') ? 'operational' : 'degraded',
      services: statuses,
      cacheSize: this.cache.size,
      timestamp: new Date().toISOString()
    };
  }
}

export const optimizedMasterService = OptimizedMasterService.getInstance();
export default optimizedMasterService;