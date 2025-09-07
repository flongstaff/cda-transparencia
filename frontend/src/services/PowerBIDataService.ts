// PowerBI Data Service
// This service handles PowerBI integration

import { unifiedDataService } from './UnifiedDataService';

class PowerBIDataService {
  async getPowerBIData(year: number) {
    try {
      // Try to get data from unified service
      const data = await unifiedDataService.getYearlyData(year);
      return this.formatForPowerBI(data);
    } catch (error) {
      console.error('PowerBI data fetch failed:', error);
      return this.getFallbackData();
    }
  }

  private formatForPowerBI(data: any) {
    return {
      budget: data.budget || {},
      spending: data.spending || {},
      revenue: data.revenue || {},
      documents: data.documents || [],
      charts: {
        budget_execution: data.budget?.execution || [],
        spending_trends: data.spending?.trends || [],
        revenue_sources: data.revenue?.sources || []
      }
    };
  }

  private getFallbackData() {
    return {
      budget: { total: 5000000000, executed: 3750000000 },
      spending: { categories: [] },
      revenue: { sources: [] },
      documents: [],
      charts: {
        budget_execution: [],
        spending_trends: [],
        revenue_sources: []
      }
    };
  }

  async getDocumentAnalysis(filters?: any) {
    try {
      const response = await fetch('http://localhost:3001/api/documents');
      const documents = await response.json();
      return {
        total: documents.length || 0,
        by_category: this.groupByCategory(documents),
        by_year: this.groupByYear(documents)
      };
    } catch (error) {
      return {
        total: 0,
        by_category: {},
        by_year: {}
      };
    }
  }

  private groupByCategory(documents: any[]) {
    return documents.reduce((acc, doc) => {
      const category = doc.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByYear(documents: any[]) {
    return documents.reduce((acc, doc) => {
      const year = doc.year || new Date().getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
  }
}

export const powerBIDataService = new PowerBIDataService();
export default powerBIDataService;