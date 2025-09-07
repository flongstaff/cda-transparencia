// Compatibility layer for ChartDataIntegrationService
// This service has been deprecated in favor of UnifiedDataService

import { unifiedDataService } from './UnifiedDataService';

class ChartDataIntegrationService {
  async getIntegratedChartData(year: number) {
    return await unifiedDataService.getYearlyData(year);
  }

  async getBudgetChartData(year: number) {
    const data = await unifiedDataService.getYearlyData(year);
    return data.budget || {};
  }

  async getSpendingChartData(year: number) {
    const data = await unifiedDataService.getYearlyData(year);
    return data.spending || {};
  }

  async getRevenueChartData(year: number) {
    const data = await unifiedDataService.getYearlyData(year);
    return data.revenue || {};
  }
}

export const chartDataIntegrationService = new ChartDataIntegrationService();