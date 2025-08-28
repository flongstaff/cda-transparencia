const fs = require('fs').promises;
const path = require('path');

class YearlyDataService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/organized_data');
  }

  /**
   * Get available years
   */
  async getAvailableYears() {
    try {
      const files = await fs.readdir(this.dataPath);
      const yearFiles = files.filter(file => file.startsWith('data_index_') && file.endsWith('.json') && file.includes('20'));
      const years = yearFiles.map(file => {
        const match = file.match(/data_index_(\d{4})\.json/);
        return match ? parseInt(match[1]) : null;
      }).filter(year => year !== null);
      
      return years.sort((a, b) => b - a); // Sort descending
    } catch (error) {
      console.error('Error reading available years:', error);
      // Fallback to known years
      return [2025, 2024, 2023, 2022, 2020, 2019];
    }
  }

  /**
   * Get data for a specific year
   */
  async getYearlyData(year) {
    try {
      const filePath = path.join(this.dataPath, `data_index_${year}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading data for year ${year}:`, error);
      throw new Error(`Data not available for year ${year}`);
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
}

module.exports = YearlyDataService;