const DatabaseDataService = require('./DatabaseDataService');
const YearlyDataService = require('./YearlyDataService');

/**
 * Unified Data Service that combines real CSV data with mock data fallbacks
 * Provides a single interface for all municipal data
 */
class UnifiedDataService {
  constructor() {
    this.databaseService = new DatabaseDataService();
    this.yearlyService = new YearlyDataService();
    this.preferRealData = true;
  }

  /**
   * Get available years from all data sources
   */
  async getAvailableYears() {
    try {
      const csvYears = await this.databaseService.getAvailableYears();
      const mockYears = await this.yearlyService.getAvailableYears();
      
      // Combine and deduplicate years
      const allYears = [...new Set([...csvYears, ...mockYears])];
      return allYears.sort((a, b) => b - a);
    } catch (error) {
      console.error('Error getting available years:', error);
      return [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
    }
  }

  /**
   * Get yearly data with real CSV data as priority
   */
  async getYearlyData(year) {
    try {
      if (this.preferRealData) {
        const realData = await this.databaseService.getYearlyData(year);
        
        // For years 2018-2025, we ALWAYS have data even if document count is 0
        if (year >= 2018 && year <= 2025 && realData.budget.total > 0) {
          console.log(`📊 Using real CSV data for ${year}: ${realData.total_documents} documents, $${(realData.budget.total/1000000).toFixed(1)}M budget`);
          return realData;
        }
        
        // Legacy check for document-based data availability
        if (realData.total_documents > 0) {
          console.log(`📊 Using real CSV data for ${year}: ${realData.total_documents} documents`);
          return realData;
        }
      }
      
      // No mock data fallback - return empty structure
      console.log(`📋 No data available for ${year}`);
      return {
        year: parseInt(year),
        total_documents: 0,
        budget_documents: 0,
        documents: [],
        budget: { total: 0, executed: 0, percentage: 0, categories: [] },
        revenue: { total: 0, sources: [] },
        expenses: { total: 0, categories: [] },
        contracts: { total: 0, count: 0, items: [] },
        salaries: { total: 0, average_salary: 0, departments: [] }
      };
      
    } catch (error) {
      console.error(`Error getting yearly data for ${year}:`, error);
      // Return empty structure instead of mock data
      return {
        year: parseInt(year),
        total_documents: 0,
        budget_documents: 0,
        documents: [],
        budget: { total: 0, executed: 0, percentage: 0, categories: [] },
        revenue: { total: 0, sources: [] },
        expenses: { total: 0, categories: [] },
        contracts: { total: 0, count: 0, items: [] },
        salaries: { total: 0, average_salary: 0, departments: [] }
      };
    }
  }

  /**
   * Get documents for a specific year
   */
  async getDocumentsForYear(year) {
    try {
      if (this.preferRealData) {
        const realDocs = await this.databaseService.getDocumentsForYear(year);
        if (realDocs.length > 0) {
          return realDocs;
        }
      }
      
      return await this.yearlyService.getDocumentsForYear(year);
    } catch (error) {
      console.error(`Error getting documents for ${year}:`, error);
      return [];
    }
  }

  /**
   * Get documents by category
   */
  async getDocumentsByCategory(category) {
    try {
      if (this.preferRealData) {
        const realDocs = await this.databaseService.getDocumentsByCategory(category);
        if (realDocs.length > 0) {
          return realDocs;
        }
      }
      
      return await this.yearlyService.getCategoriesForYear(new Date().getFullYear());
    } catch (error) {
      console.error(`Error getting documents for category ${category}:`, error);
      return [];
    }
  }

  /**
   * Search documents across all sources
   */
  async searchDocuments(query, year = null, category = null) {
    try {
      if (this.preferRealData) {
        const realResults = await this.databaseService.searchDocuments(query, year, category);
        if (realResults.length > 0) {
          return realResults;
        }
      }
      
      // Simple fallback search in mock data
      const yearData = await this.yearlyService.getYearlyData(year || new Date().getFullYear());
      return yearData.documents || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Get comprehensive statistics
   */
  async getStatistics() {
    try {
      const realStats = await this.databaseService.getStatistics();
      const mockStats = { years_available: await this.yearlyService.getAvailableYears() };
      
      return {
        ...realStats,
        mock_years: mockStats.years_available,
        data_sources: ['csv_files', 'mock_data'],
        hybrid_mode: true
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total_documents: 0,
        years_available: [2025, 2024, 2023, 2022, 2021, 2020, 2019],
        categories_available: [],
        data_sources: ['mock_data'],
        error: error.message
      };
    }
  }

  /**
   * Get municipal data (combines budget, revenue, expenses for a year)
   */
  async getMunicipalData(year) {
    return await this.getYearlyData(year);
  }

  /**
   * Get transparency documents (alias for documents)
   */
  async getTransparencyDocuments(year) {
    return await this.getDocumentsForYear(year);
  }

  /**
   * Toggle between real data and mock data preference
   */
  setDataPreference(preferReal = true) {
    this.preferRealData = preferReal;
    console.log(`📝 Data preference set to: ${preferReal ? 'Real CSV data' : 'Mock data'}`);
  }

  /**
   * Get data health status
   */
  async getDataHealth() {
    try {
      const [realStats, mockYears] = await Promise.all([
        this.databaseService.getStatistics(),
        this.yearlyService.getAvailableYears()
      ]);

      return {
        csv_data: {
          available: realStats.total_documents > 0,
          documents: realStats.total_documents,
          years: realStats.years_available?.length || 0,
          categories: realStats.categories_available?.length || 0,
          last_updated: realStats.last_updated
        },
        mock_data: {
          available: mockYears.length > 0,
          years: mockYears.length
        },
        status: realStats.total_documents > 0 ? 'healthy' : 'mock_only',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        csv_data: { available: false, error: error.message },
        mock_data: { available: true },
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = UnifiedDataService;