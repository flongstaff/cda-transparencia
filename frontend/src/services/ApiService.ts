// API Service - compatibility layer
// This service has been deprecated in favor of UnifiedDataService

import { unifiedDataService } from './UnifiedDataService';

class ApiService {
  private baseUrl = 'http://localhost:3001/api';

  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error('API Service error:', error);
      throw error;
    }
  }

  async getYearlyData(year: number) {
    return await unifiedDataService.getYearlyData(year);
  }

  async getBudgetData(year: number) {
    const data = await this.getYearlyData(year);
    return data.budget || {};
  }

  async getSpendingData(year: number) {
    const data = await this.getYearlyData(year);
    return data.spending || {};
  }

  async getDebtData(year: number) {
    const data = await this.getYearlyData(year);
    return data.debt || {};
  }

  async getInvestmentData(year: number) {
    const data = await this.getYearlyData(year);
    return data.investments || {};
  }

  async getRevenueData(year: number) {
    const data = await this.getYearlyData(year);
    return data.revenue || {};
  }
}

export const apiService = new ApiService();
export default apiService;