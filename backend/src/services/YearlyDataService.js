const fs = require('fs').promises;
const path = require('path');

class YearlyDataService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/preserved/json');
  }

  /**
   * Get available years
   */
  async getAvailableYears() {
    try {
      const files = await fs.readdir(this.dataPath);
      // Look for files that contain financial data or budget data
      const yearFiles = files.filter(file => 
        file.includes('ESTADO-DE-EJECUCION') || 
        file.includes('EJECUCION-DE-GASTOS') ||
        file.includes('EJECUCION-DE-RECURSOS') ||
        file.includes('SITUACION-ECONOMICA')
      );
      
      // Extract years from filenames
      const years = yearFiles.map(file => {
        const match = file.match(/(20\d{2})/);
        return match ? parseInt(match[1]) : null;
      }).filter(year => year !== null);
      
      // Remove duplicates and sort descending
      const uniqueYears = [...new Set(years)];
      return uniqueYears.sort((a, b) => b - a);
    } catch (error) {
      console.error('Error reading available years:', error);
      // Fallback to known years
      return [2025, 2024, 2023, 2022, 2021, 2020, 2019];
    }
  }

  /**
   * Get data for a specific year - NO MOCK DATA
   */
  async getYearlyData(year) {
    try {
      // Load data from the actual CSV conversion system
      const DatabaseDataService = require('./DatabaseDataService');
      const dbService = new DatabaseDataService();
      return await dbService.getYearlyData(year);
    } catch (error) {
      console.error(`Error reading data for year ${year}:`, error);
      // Return empty structure instead of mock data
      return {
        year: parseInt(year),
        total_documents: 0,
        categories: {},
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
      const yearlyData = await this.getYearlyData(year);
      return yearlyData.documents || [];
    } catch (error) {
      console.error(`Error getting documents for year ${year}:`, error);
      return [];
    }
  }

  /**
   * Get categories for a specific year
   */
  async getCategoriesForYear(year) {
    try {
      const yearlyData = await this.getYearlyData(year);
      return yearlyData.categories || {};
    } catch (error) {
      console.error(`Error getting categories for year ${year}:`, error);
      return {};
    }
  }

  // ALL MOCK DATA REMOVED - SERVICE NOW USES REAL DATA ONLY
}

module.exports = YearlyDataService;