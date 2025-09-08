/**
 * Chart Data Integration Service - Provides chart-ready data formatting
 * Transforms raw data into formats suitable for various chart libraries
 */

import { consolidatedApiService } from './ConsolidatedApiService';
import PowerBIDataService from './PowerBIDataService';

interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
  category?: string;
}

class ChartDataIntegrationService {
  // Budget Chart Data
  async getBudgetChartData(year: number) {
    try {
      const budgetData = await consolidatedApiService.getBudgetData(year);
      
      if (!budgetData.categories) {
        return {
          pie: [],
          bar: [],
          line: [],
          error: 'No budget categories available'
        };
      }

      const categories = Object.entries(budgetData.categories);
      
      return {
        pie: categories.map(([name, data]: [string, any], index) => ({
          name,
          value: data.budgeted || 0,
          label: name,
          color: this.getColor(index)
        })),
        bar: {
          categories: categories.map(([name]) => name),
          series: [
            {
              name: 'Presupuestado',
              data: categories.map(([, data]: [string, any]) => data.budgeted || 0)
            },
            {
              name: 'Ejecutado',
              data: categories.map(([, data]: [string, any]) => data.executed || 0)
            }
          ]
        },
        execution_rates: categories.map(([name, data]: [string, any]) => ({
          name,
          value: parseFloat(data.execution_rate || '0'),
          color: this.getExecutionColor(parseFloat(data.execution_rate || '0'))
        })),
        summary: {
          total_budgeted: budgetData.total_budgeted || 0,
          total_executed: budgetData.total_executed || 0,
          overall_execution: parseFloat(budgetData.execution_rate || '0')
        }
      };
    } catch (error) {
      console.error('Error getting budget chart data:', error);
      return {
        pie: [],
        bar: { categories: [], series: [] },
        execution_rates: [],
        error: error.message
      };
    }
  }

  // Documents Chart Data
  async getDocumentsChartData(year?: number) {
    try {
      const documents = await consolidatedApiService.getDocuments(year);
      
      // Group by category
      const categoryStats = documents.reduce((acc: any, doc) => {
        const category = doc.category || 'Sin Categoría';
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            totalSize: 0,
            verified: 0
          };
        }
        acc[category].count++;
        acc[category].totalSize += parseFloat(doc.size_mb || '0');
        if (doc.verification_status === 'verified') {
          acc[category].verified++;
        }
        return acc;
      }, {});

      // Group by year if no year filter
      const yearStats = !year ? documents.reduce((acc: any, doc) => {
        const docYear = doc.year || new Date().getFullYear();
        acc[docYear] = (acc[docYear] || 0) + 1;
        return acc;
      }, {}) : {};

      return {
        by_category: Object.entries(categoryStats).map(([name, stats]: [string, any], index) => ({
          name,
          count: stats.count,
          size_mb: Math.round(stats.totalSize * 100) / 100,
          verified_percentage: Math.round((stats.verified / stats.count) * 100),
          color: this.getColor(index)
        })),
        by_year: Object.entries(yearStats).map(([year, count]) => ({
          year: parseInt(year),
          count: count as number
        })).sort((a, b) => a.year - b.year),
        verification_stats: {
          verified: documents.filter(doc => doc.verification_status === 'verified').length,
          unverified: documents.filter(doc => doc.verification_status !== 'verified').length,
          total: documents.length
        },
        size_distribution: this.calculateSizeDistribution(documents),
        timeline: this.createDocumentTimeline(documents)
      };
    } catch (error) {
      console.error('Error getting documents chart data:', error);
      return {
        by_category: [],
        by_year: [],
        verification_stats: { verified: 0, unverified: 0, total: 0 },
        error: error.message
      };
    }
  }

  // Transparency Score Chart Data
  async getTransparencyChartData(years: number[]) {
    try {
      const scorePromises = years.map(year => 
        consolidatedApiService.getTransparencyScore(year).then(score => ({ year, ...score }))
      );
      
      const scores = await Promise.all(scorePromises);
      
      return {
        timeline: scores.map(item => ({
          year: item.year,
          overall: item.overall || 0,
          execution: item.execution || 0
        })),
        current_year: scores[scores.length - 1] || { year: new Date().getFullYear(), overall: 0, execution: 0 },
        trend: this.calculateTrend(scores.map(s => s.overall || 0)),
        benchmarks: {
          excellent: 90,
          good: 75,
          acceptable: 60,
          needs_improvement: 45
        }
      };
    } catch (error) {
      console.error('Error getting transparency chart data:', error);
      return {
        timeline: [],
        current_year: { year: new Date().getFullYear(), overall: 0, execution: 0 },
        trend: 'stable',
        error: error.message
      };
    }
  }

  // Comprehensive Dashboard Data
  async getComprehensiveDashboardData(year: number) {
    try {
      const [
        budgetCharts,
        documentCharts,
        transparencyData,
        systemHealth,
        powerBIData
      ] = await Promise.all([
        this.getBudgetChartData(year),
        this.getDocumentsChartData(year),
        this.getTransparencyChartData([year - 2, year - 1, year]),
        consolidatedApiService.getSystemHealth(),
        PowerBIDataService.getFinancialDataset(year)
      ]);

      return {
        year,
        budget: budgetCharts,
        documents: documentCharts,
        transparency: transparencyData,
        system: {
          status: systemHealth.status || 'unknown',
          health_score: this.calculateHealthScore(systemHealth),
          last_update: systemHealth.timestamp || new Date().toISOString()
        },
        powerbi: powerBIData,
        summary: {
          total_documents: documentCharts.verification_stats?.total || 0,
          budget_execution: budgetCharts.summary?.overall_execution || 0,
          transparency_score: transparencyData.current_year?.overall || 0,
          data_quality: this.calculateDataQuality({
            budgetCharts,
            documentCharts,
            transparencyData
          })
        },
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting comprehensive dashboard data:', error);
      return {
        year,
        error: error.message,
        generated_at: new Date().toISOString()
      };
    }
  }

  // Utility methods
  private getColor(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    return colors[index % colors.length];
  }

  private getExecutionColor(rate: number): string {
    if (rate >= 90) return '#10B981'; // Green
    if (rate >= 75) return '#F59E0B'; // Yellow
    if (rate >= 50) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  }

  private calculateSizeDistribution(documents: any[]) {
    const ranges = {
      'Pequeño (< 1MB)': 0,
      'Mediano (1-10MB)': 0,
      'Grande (10-50MB)': 0,
      'Muy Grande (> 50MB)': 0
    };

    documents.forEach(doc => {
      const size = parseFloat(doc.size_mb || '0');
      if (size < 1) ranges['Pequeño (< 1MB)']++;
      else if (size < 10) ranges['Mediano (1-10MB)']++;
      else if (size < 50) ranges['Grande (10-50MB)']++;
      else ranges['Muy Grande (> 50MB)']++;
    });

    return Object.entries(ranges).map(([name, count], index) => ({
      name,
      count,
      color: this.getColor(index)
    }));
  }

  private createDocumentTimeline(documents: any[]): TimeSeriesPoint[] {
    const timeline = documents.reduce((acc: any, doc) => {
      const date = new Date(doc.processing_date || Date.now()).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, value: count as number }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 data points
  }

  private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-3);
    const average = recent.reduce((a, b) => a + b) / recent.length;
    const older = values.slice(0, -3);
    const oldAverage = older.length > 0 ? older.reduce((a, b) => a + b) / older.length : average;

    if (average > oldAverage + 5) return 'improving';
    if (average < oldAverage - 5) return 'declining';
    return 'stable';
  }

  private calculateHealthScore(health: any): number {
    if (!health || health.status !== 'healthy') return 0;
    
    let score = 70; // Base score for healthy status
    
    if (health.total_documents > 100) score += 10;
    if (health.verified_documents > health.total_documents * 0.8) score += 10;
    if (health.transparency_score > 80) score += 10;
    
    return Math.min(100, score);
  }

  private calculateDataQuality(data: any): number {
    let score = 0;
    let factors = 0;

    // Budget data quality
    if (data.budgetCharts && !data.budgetCharts.error) {
      score += 25;
      factors++;
    }

    // Document data quality
    if (data.documentCharts && data.documentCharts.verification_stats?.total > 0) {
      score += 25;
      factors++;
    }

    // Transparency data quality
    if (data.transparencyData && data.transparencyData.current_year?.overall > 0) {
      score += 25;
      factors++;
    }

    // System integration
    score += 25;
    factors++;

    return factors > 0 ? Math.round(score / factors * (factors / 4)) : 0;
  }
}

export default new ChartDataIntegrationService();
export { ChartDataIntegrationService };