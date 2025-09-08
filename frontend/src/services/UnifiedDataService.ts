/**
 * Unified Data Service - Central data management service
 * Consolidates all data sources and provides unified interface
 */

import { consolidatedApiService } from './ConsolidatedApiService';
import PowerBIDataService from './PowerBIDataService';
import IntegratedBackendService from './IntegratedBackendService';
import CrossValidationService from './CrossValidationService';

class UnifiedDataService {
  // Cache for performance
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(method: string, params: any[]): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Unified data retrieval methods
  async getAllAvailableData(year?: number) {
    const cacheKey = this.getCacheKey('getAllAvailableData', [year]);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [
        documents,
        budgetData,
        statistics,
        systemHealth,
        availableYears,
        powerBIFinancial,
        auditResults
      ] = await Promise.allSettled([
        consolidatedApiService.getDocuments(year),
        year ? consolidatedApiService.getBudgetData(year) : Promise.resolve(null),
        consolidatedApiService.getStatistics(),
        consolidatedApiService.getSystemHealth(),
        consolidatedApiService.getAvailableYears(),
        year ? PowerBIDataService.getFinancialDataset(year) : Promise.resolve(null),
        year ? CrossValidationService.auditYearlyData(year) : Promise.resolve([])
      ]);

      const result = {
        documents: documents.status === 'fulfilled' ? documents.value : [],
        budget: budgetData.status === 'fulfilled' ? budgetData.value : null,
        statistics: statistics.status === 'fulfilled' ? statistics.value : {},
        system_health: systemHealth.status === 'fulfilled' ? systemHealth.value : {},
        available_years: availableYears.status === 'fulfilled' ? availableYears.value : [],
        powerbi_data: powerBIFinancial.status === 'fulfilled' ? powerBIFinancial.value : null,
        audit_results: auditResults.status === 'fulfilled' ? auditResults.value : [],
        unified_timestamp: new Date().toISOString(),
        data_sources: ['transparency.db', 'PowerBI', 'Audit', 'ConsolidatedAPI']
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting all available data:', error);
      throw error;
    }
  }

  async getComprehensiveYearData(year: number) {
    const cacheKey = this.getCacheKey('getComprehensiveYearData', [year]);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [
        yearlyData,
        integratedData,
        budgetDiscrepancies,
        corruptionIndicators,
        powerBIDatasets
      ] = await Promise.allSettled([
        consolidatedApiService.getYearlyData(year),
        IntegratedBackendService.getIntegratedData(year),
        CrossValidationService.getBudgetDiscrepancies(year),
        CrossValidationService.getCorruptionIndicators(),
        Promise.all([
          PowerBIDataService.getFinancialDataset(year),
          PowerBIDataService.getMunicipalDataset(year)
        ])
      ]);

      const result = {
        year,
        base_data: yearlyData.status === 'fulfilled' ? yearlyData.value : {},
        integrated_data: integratedData.status === 'fulfilled' ? integratedData.value : {},
        audit_analysis: {
          budget_discrepancies: budgetDiscrepancies.status === 'fulfilled' ? budgetDiscrepancies.value : {},
          corruption_indicators: corruptionIndicators.status === 'fulfilled' ? corruptionIndicators.value : {}
        },
        powerbi_datasets: powerBIDatasets.status === 'fulfilled' ? powerBIDatasets.value : [],
        comprehensive_timestamp: new Date().toISOString(),
        completeness_score: this.calculateCompletenessScore({
          yearlyData: yearlyData.status === 'fulfilled',
          integratedData: integratedData.status === 'fulfilled',
          auditData: budgetDiscrepancies.status === 'fulfilled',
          powerbiData: powerBIDatasets.status === 'fulfilled'
        })
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting comprehensive year data:', error);
      throw error;
    }
  }

  async searchAllSources(query: string, filters: any = {}) {
    try {
      const [
        documentSearch,
        consolidatedSearch
      ] = await Promise.allSettled([
        consolidatedApiService.searchDocuments(query),
        this.searchInAllData(query, filters)
      ]);

      return {
        query,
        results: {
          documents: documentSearch.status === 'fulfilled' ? documentSearch.value : { results: [] },
          comprehensive: consolidatedSearch.status === 'fulfilled' ? consolidatedSearch.value : []
        },
        total_results: (
          (documentSearch.status === 'fulfilled' ? documentSearch.value.results?.length || 0 : 0) +
          (consolidatedSearch.status === 'fulfilled' ? consolidatedSearch.value.length : 0)
        ),
        search_timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error searching all sources:', error);
      return {
        query,
        results: { documents: { results: [] }, comprehensive: [] },
        total_results: 0,
        error: error.message
      };
    }
  }

  private async searchInAllData(query: string, filters: any = {}) {
    try {
      const allData = await this.getAllAvailableData(filters.year);
      const results = [];

      // Search in documents
      if (allData.documents) {
        const matchingDocs = allData.documents.filter((doc: any) =>
          doc.title?.toLowerCase().includes(query.toLowerCase()) ||
          doc.category?.toLowerCase().includes(query.toLowerCase())
        );
        results.push(...matchingDocs.map((doc: any) => ({
          type: 'document',
          source: 'transparency.db',
          data: doc,
          relevance: this.calculateRelevance(doc, query)
        })));
      }

      // Search in budget data
      if (allData.budget && allData.budget.categories) {
        Object.entries(allData.budget.categories).forEach(([category, data]: [string, any]) => {
          if (category.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'budget',
              source: 'budget_data',
              data: { category, ...data },
              relevance: this.calculateRelevance({ title: category }, query)
            });
          }
        });
      }

      return results.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error('Error searching in all data:', error);
      return [];
    }
  }

  private calculateRelevance(item: any, query: string): number {
    const title = (item.title || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const queryLower = query.toLowerCase();

    let score = 0;
    if (title.includes(queryLower)) score += 10;
    if (category.includes(queryLower)) score += 5;
    if (title.startsWith(queryLower)) score += 5;

    return score;
  }

  private calculateCompletenessScore(sources: Record<string, boolean>): number {
    const total = Object.keys(sources).length;
    const available = Object.values(sources).filter(Boolean).length;
    return Math.round((available / total) * 100);
  }

  // Export/Import functionality
  async exportAllData(format: 'json' | 'csv' = 'json') {
    try {
      const allData = await this.getAllAvailableData();
      
      if (format === 'json') {
        return {
          format: 'json',
          data: allData,
          exported_at: new Date().toISOString(),
          version: '1.0'
        };
      } else if (format === 'csv') {
        return {
          format: 'csv',
          data: this.convertToCSV(allData),
          exported_at: new Date().toISOString(),
          version: '1.0'
        };
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  private convertToCSV(data: any): string {
    if (!data.documents || !Array.isArray(data.documents)) {
      return 'No data available';
    }

    const headers = ['ID', 'Title', 'Category', 'Year', 'Size (MB)', 'Verification Status'];
    const rows = data.documents.map((doc: any) => [
      doc.id || '',
      doc.title || '',
      doc.category || '',
      doc.year || '',
      doc.size_mb || '0',
      doc.verification_status || 'unknown'
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  // Real-time data updates
  async getLatestUpdates(since?: Date) {
    try {
      const sinceTimestamp = since ? since.getTime() : Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      
      return {
        updates: [
          {
            type: 'system_health',
            data: await consolidatedApiService.getSystemHealth(),
            timestamp: new Date().toISOString()
          }
        ],
        since: new Date(sinceTimestamp).toISOString(),
        checked_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting latest updates:', error);
      return {
        updates: [],
        error: error.message,
        checked_at: new Date().toISOString()
      };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache status
  getCacheStats() {
    return {
      total_entries: this.cache.size,
      entries: Array.from(this.cache.keys()),
      last_cleared: new Date().toISOString()
    };
  }
}

export default new UnifiedDataService();
export { UnifiedDataService };