// Compatibility layer for ComprehensiveDataService
// This service has been deprecated in favor of UnifiedDataService

import { unifiedDataService } from './UnifiedDataService';

class ComprehensiveDataService {
  async fetchComprehensiveData(year: number) {
    return await unifiedDataService.getYearlyData(year);
  }

  async getDocumentAnalysis(year: number) {
    const data = await unifiedDataService.getYearlyData(year);
    return {
      documents: data.documents || [],
      categories: data.categories || {},
      analysis: {
        total_documents: data.total_documents || 0,
        verified_documents: data.verified_documents || 0
      }
    };
  }

  async getFinancialOverview(year: number) {
    const data = await unifiedDataService.getYearlyData(year);
    return {
      budget: data.budget || {},
      spending: data.spending || {},
      revenue: data.revenue || {}
    };
  }
}

export const comprehensiveDataService = new ComprehensiveDataService();
export default comprehensiveDataService;