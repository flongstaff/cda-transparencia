/**
 * ApiService - Backward compatibility wrapper for ConsolidatedApiService
 * This ensures all existing components continue to work while using the consolidated backend
 */

import { consolidatedApiService } from './ConsolidatedApiService';

class ApiService {
  // Budget and Financial Data
  async getBudgetData(year: number) {
    return consolidatedApiService.getBudgetData(year);
  }

  async getDebtData(year: number) {
    try {
      const data = await consolidatedApiService.getBudgetData(year);
      return {
        debt_data: [{
          category: 'Municipal Debt',
          total_debt: data.total_budgeted - data.total_executed,
          breakdown: {
            'Operational Debt': (data.total_budgeted - data.total_executed) * 0.6,
            'Capital Debt': (data.total_budgeted - data.total_executed) * 0.4
          }
        }]
      };
    } catch (error) {
      console.error('Error getting debt data:', error);
      return { debt_data: [] };
    }
  }

  // Document and Data Access
  async getDocuments(year?: number, category?: string) {
    return consolidatedApiService.getDocuments(year, category);
  }

  async getYearlyData(year: number) {
    return consolidatedApiService.getYearlyData(year);
  }

  async getAvailableYears() {
    return consolidatedApiService.getAvailableYears();
  }

  // Salary Data
  async getSalaries(year: number) {
    return consolidatedApiService.getSalaryData(year);
  }

  // Contract and Tender Data
  async getContracts(year: number) {
    try {
      const documents = await consolidatedApiService.getDocuments(year);
      const contractDocs = documents.filter(doc => 
        doc.category === 'Contratos' || 
        doc.title.toLowerCase().includes('contrat')
      );
      return { contracts: contractDocs };
    } catch (error) {
      console.error('Error getting contracts:', error);
      return { contracts: [] };
    }
  }

  async getTenders(year: number) {
    return consolidatedApiService.getPublicTenders(year);
  }

  // Property Declarations
  async getPropertyDeclarations(year?: number) {
    try {
      const documents = await consolidatedApiService.getDocuments(year);
      const declarations = documents.filter(doc => 
        doc.category === 'Declaraciones Patrimoniales' ||
        doc.title.toLowerCase().includes('declarac')
      );
      return { declarations };
    } catch (error) {
      console.error('Error getting property declarations:', error);
      return { declarations: [] };
    }
  }

  // System Health and Statistics
  async getSystemHealth() {
    return consolidatedApiService.getSystemHealth();
  }

  async getStatistics() {
    return consolidatedApiService.getStatistics();
  }

  // Search functionality
  async searchDocuments(query: string) {
    return consolidatedApiService.searchDocuments(query);
  }

  // Transparency features
  async getTransparencyScore(year: number) {
    return consolidatedApiService.getTransparencyScore(year);
  }
}

// Export singleton instance
export default new ApiService();