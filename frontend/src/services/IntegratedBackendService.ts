/**
 * Integrated Backend Service - Provides unified backend integration
 * This service wraps ConsolidatedApiService for backward compatibility
 */

import { consolidatedApiService } from './ConsolidatedApiService';

class IntegratedBackendService {
  async getIntegratedData(year: number) {
    try {
      const [yearlyData, documents, budgetData] = await Promise.all([
        consolidatedApiService.getYearlyData(year),
        consolidatedApiService.getDocuments(year),
        consolidatedApiService.getBudgetData(year)
      ]);

      return {
        year,
        yearly: yearlyData,
        documents,
        budget: budgetData,
        integration_timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting integrated data:', error);
      throw error;
    }
  }

  async getChartData(type: string, year?: number) {
    try {
      switch (type) {
        case 'budget':
          return year ? await consolidatedApiService.getBudgetData(year) : null;
        case 'documents':
          return await consolidatedApiService.getDocuments(year);
        case 'transparency':
          return year ? await consolidatedApiService.getTransparencyScore(year) : null;
        default:
          return await consolidatedApiService.getStatistics();
      }
    } catch (error) {
      console.error(`Error getting chart data for ${type}:`, error);
      return null;
    }
  }

  async validateDataIntegrity() {
    try {
      const health = await consolidatedApiService.getSystemHealth();
      return {
        status: health.status === 'healthy' ? 'valid' : 'invalid',
        timestamp: new Date().toISOString(),
        details: health
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

export default new IntegratedBackendService();
export { IntegratedBackendService };