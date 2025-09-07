// Enhanced API Service - compatibility layer
// This service has been deprecated in favor of UnifiedDataService

import { unifiedDataService } from './UnifiedDataService';

class EnhancedApiService {
  private baseUrl = 'http://localhost:3001/api';

  async fetchWithErrorHandling(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Enhanced API Service error:', error);
      return null;
    }
  }

  async getYearlyDataEnhanced(year: number) {
    try {
      const data = await unifiedDataService.getYearlyData(year);
      return {
        success: true,
        data,
        metadata: {
          year,
          timestamp: new Date().toISOString(),
          source: 'UnifiedDataService'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async getComprehensiveAnalysis(year: number) {
    const result = await this.getYearlyDataEnhanced(year);
    if (!result.success) return result;

    const data = result.data;
    return {
      ...result,
      analysis: {
        budget_health: this.analyzeBudgetHealth(data.budget),
        transparency_score: this.calculateTransparencyScore(data),
        critical_issues: this.identifyCriticalIssues(data)
      }
    };
  }

  private analyzeBudgetHealth(budget: any) {
    if (!budget) return { status: 'unknown', score: 0 };
    
    const executionRate = budget.execution_rate || 0;
    return {
      status: executionRate > 85 ? 'healthy' : executionRate > 70 ? 'warning' : 'critical',
      score: executionRate,
      recommendation: executionRate < 70 ? 'Requires immediate attention' : 'Monitor closely'
    };
  }

  private calculateTransparencyScore(data: any) {
    let score = 50; // Base score
    
    if (data.documents && data.documents.length > 0) score += 20;
    if (data.budget && Object.keys(data.budget).length > 0) score += 15;
    if (data.spending && Object.keys(data.spending).length > 0) score += 10;
    if (data.revenue && Object.keys(data.revenue).length > 0) score += 5;
    
    return Math.min(100, score);
  }

  private identifyCriticalIssues(data: any) {
    const issues = [];
    
    if (!data.budget || Object.keys(data.budget).length === 0) {
      issues.push('Missing budget data');
    }
    
    if (!data.documents || data.documents.length === 0) {
      issues.push('No transparency documents available');
    }
    
    const budgetExecution = data.budget?.execution_rate || 0;
    if (budgetExecution < 70) {
      issues.push(`Low budget execution rate: ${budgetExecution}%`);
    }
    
    return issues;
  }
}

export { EnhancedApiService };
export const enhancedApiService = new EnhancedApiService();
export default enhancedApiService;