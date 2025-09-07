// Yearly Data Service - compatibility layer
// This service now uses ConsolidatedApiService

import { consolidatedApiService } from './ConsolidatedApiService';

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
    return await consolidatedApiService.getYearlyData(year);
  }

  static async fetchYearlyAnalysis(year: number) {
    const data = await consolidatedApiService.getYearlyData(year);
    return {
      year,
      data,
      analysis: {
        budget_summary: (data as any).budget || {},
        spending_summary: (data as any).spending || {},
        revenue_summary: (data as any).revenue || {},
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