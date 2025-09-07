// Yearly Data Service - compatibility layer
// This service has been deprecated in favor of UnifiedDataService

import { unifiedDataService } from './UnifiedDataService';

class YearlyDataService {
  static async fetchAvailableYears(): Promise<number[]> {
    try {
      const response = await fetch('http://localhost:3001/api/years');
      const data = await response.json();
      return data.years || [2025, 2024, 2023, 2022, 2021, 2020, 2019];
    } catch (error) {
      return [2025, 2024, 2023, 2022, 2021, 2020, 2019];
    }
  }

  static async fetchYearlyData(year: number) {
    return await unifiedDataService.getYearlyData(year);
  }

  static async fetchYearlyAnalysis(year: number) {
    const data = await unifiedDataService.getYearlyData(year);
    return {
      year,
      data,
      analysis: {
        budget_summary: data.budget || {},
        spending_summary: data.spending || {},
        revenue_summary: data.revenue || {},
        document_count: data.documents?.length || 0,
        transparency_score: 85 // Default score
      }
    };
  }

  async getYearlyComparison(years: number[]) {
    const yearlyData = await Promise.all(
      years.map(year => YearlyDataService.fetchYearlyAnalysis(year))
    );
    
    return {
      years,
      comparison: yearlyData,
      trends: this.calculateTrends(yearlyData)
    };
  }

  private calculateTrends(yearlyData: any[]) {
    if (yearlyData.length < 2) return {};
    
    const latest = yearlyData[0];
    const previous = yearlyData[1];
    
    return {
      budget_trend: this.calculatePercentageChange(
        latest.analysis.budget_summary.total || 0,
        previous.analysis.budget_summary.total || 0
      ),
      transparency_trend: this.calculatePercentageChange(
        latest.analysis.transparency_score,
        previous.analysis.transparency_score
      )
    };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
}

export default YearlyDataService;