/**
 * Service to fetch yearly financial data for the Carmen de Areco Transparency Portal
 */

export interface Document {
  id: string;
  title: string;
  url: string;
  year: number;
  category: string;
  source: string;
  type: string;
  description: string;
  official_url: string;
  size_mb: number;
  last_modified: string;
}

export interface YearlyData {
  year: number;
  total_documents: number;
  categories: {
    [key: string]: Document[];
  };
  documents: Document[];
}

class YearlyDataService {
  private baseURL = '/api/years';

  /**
   * Fetch available years
   */
  async fetchAvailableYears(): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}`);
      const data = await response.json();
      return data.years || [];
    } catch (error) {
      console.error('Error fetching available years:', error);
      // Fallback to known years
      return [2025, 2024, 2023, 2022, 2020, 2019];
    }
  }

  /**
   * Fetch yearly financial data
   */
  async fetchYearlyData(year: number): Promise<YearlyData> {
    try {
      const response = await fetch(`${this.baseURL}/${year}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as YearlyData;
    } catch (error) {
      console.error(`Error fetching data for year ${year}:`, error);
      throw new Error(`Failed to load data for year ${year}`);
    }
  }

  /**
   * Fetch documents for a specific year
   */
  async fetchDocumentsForYear(year: number): Promise<Document[]> {
    try {
      const response = await fetch(`${this.baseURL}/${year}/documents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error(`Error fetching documents for year ${year}:`, error);
      return [];
    }
  }

  /**
   * Fetch categories for a specific year
   */
  async fetchCategoriesForYear(year: number): Promise<{ [key: string]: Document[] }> {
    try {
      const response = await fetch(`${this.baseURL}/${year}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.categories || {};
    } catch (error) {
      console.error(`Error fetching categories for year ${year}:`, error);
      return {};
    }
  }
}

export default new YearlyDataService();