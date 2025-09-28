/**
 * Chart Data Service - Loads and processes consolidated chart data
 * Handles loading of CSV data for the 13 chart types across all years (2019-2025)
 */

import Papa from 'papaparse';

// Chart types that we have consolidated data for
export const CHART_TYPES = [
  'Budget_Execution',
  'Debt_Report',
  'Economic_Report',
  'Education_Data',
  'Expenditure_Report',
  'Financial_Reserves',
  'Fiscal_Balance_Report',
  'Health_Statistics',
  'Infrastructure_Projects',
  'Investment_Report',
  'Personnel_Expenses',
  'Revenue_Report',
  'Revenue_Sources',
  'Quarterly_Execution',
  'Programmatic_Performance',
  'Gender_Budgeting',
  'Waterfall_Execution'
] as const;

export type ChartType = typeof CHART_TYPES[number];

// Mapping chart types to human-readable names
export const CHART_TYPE_NAMES: Record<ChartType, string> = {
  'Budget_Execution': 'Budget Execution',
  'Debt_Report': 'Debt Report',
  'Economic_Report': 'Economic Report',
  'Education_Data': 'Education Data',
  'Expenditure_Report': 'Expenditure Report',
  'Financial_Reserves': 'Financial Reserves',
  'Fiscal_Balance_Report': 'Fiscal Balance Report',
  'Health_Statistics': 'Health Statistics',
  'Infrastructure_Projects': 'Infrastructure Projects',
  'Investment_Report': 'Investment Report',
  'Personnel_Expenses': 'Personnel Expenses',
  'Revenue_Report': 'Revenue Report',
  'Revenue_Sources': 'Revenue Sources',
  'Quarterly_Execution': 'Quarterly Execution Trends',
  'Programmatic_Performance': 'Programmatic Performance',
  'Gender_Budgeting': 'Gender Budgeting Analysis',
  'Waterfall_Execution': 'Cumulative Execution Waterfall'
};

// Mapping chart types to descriptions
export const CHART_TYPE_DESCRIPTIONS: Record<ChartType, string> = {
  'Budget_Execution': 'Shows how the municipal budget was executed over time, comparing planned vs actual spending',
  'Debt_Report': "Details the municipality's debt obligations, interest rates, and repayment schedules",
  'Economic_Report': 'Provides overall economic indicators for the municipality',
  'Education_Data': 'Tracks educational statistics, school enrollment, and education spending',
  'Expenditure_Report': 'Detailed breakdown of municipal expenditures by category',
  'Financial_Reserves': 'Information about financial reserves and contingency funds',
  'Fiscal_Balance_Report': 'Shows the fiscal balance (revenue minus expenses) over time',
  'Health_Statistics': 'Healthcare statistics, health center data, and medical spending',
  'Infrastructure_Projects': 'Details major infrastructure projects and their progress',
  'Investment_Report': 'Investment activities and capital expenditure projects',
  'Personnel_Expenses': 'Personnel costs including salaries, benefits, and staffing levels',
  'Revenue_Report': 'Detailed breakdown of municipal revenue sources',
  'Revenue_Sources': 'Analysis of different revenue streams and their contributions',
  'Quarterly_Execution': 'Quarterly trends in budget execution with combo chart visualization',
  'Programmatic_Performance': 'Performance metrics for key municipal programs and initiatives',
  'Gender_Budgeting': 'Analysis of gender perspective in municipal budgeting and staffing',
  'Waterfall_Execution': 'Cumulative visualization of budget execution across periods'
};

class ChartDataService {
  private static instance: ChartDataService;
  private cache = new Map<string, { data: any; timestamp: number; expires: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private constructor() {}

  public static getInstance(): ChartDataService {
    if (!ChartDataService.instance) {
      ChartDataService.instance = new ChartDataService();
    }
    return ChartDataService.instance;
  }

  /**
   * Load consolidated chart data for a specific chart type
   */
  public async loadChartData(chartType: ChartType): Promise<any[] | null> {
    const cacheKey = `chart-data-${chartType}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log(`[CHART DATA SERVICE] Cache hit for: ${chartType}`);
      return cached.data;
    }

    try {
      console.log(`[CHART DATA SERVICE] Loading chart data for: ${chartType}`);
      
      // Construct the URL for the consolidated CSV file
      // Use absolute path to work in both development and production
      const csvUrl = `/data/charts/${chartType}_consolidated_2019-2025.csv`;
      
      // Fetch the CSV file
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        console.warn(`[CHART DATA SERVICE] Failed to load ${chartType} data from ${csvUrl}: HTTP ${response.status}`);
        // Return empty data instead of throwing error to allow graceful degradation
        return [];
      }
      
      const csvText = await response.text();
      
      // Parse the CSV data
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      
      if (parsed.errors.length > 0) {
        console.warn(`[CHART DATA SERVICE] Parsing warnings for ${chartType}:`, parsed.errors);
      }
      
      const data = parsed.data;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });
      
      console.log(`[CHART DATA SERVICE] Loaded ${data.length} rows for ${chartType}`);
      return data;
    } catch (error) {
      console.error(`[CHART DATA SERVICE] Error loading chart data for ${chartType}:`, error);
      
      // Try to return expired cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`[CHART DATA SERVICE] Returning expired cache for ${chartType}`);
        return cached.data;
      }
      
      return null;
    }
  }

  /**
   * Load all chart data for a dashboard view
   */
  public async loadAllChartData(): Promise<Record<ChartType, any[] | null>> {
    console.log('[CHART DATA SERVICE] Loading all chart data...');
    
    // Load all chart types in parallel
    const loadDataPromises = CHART_TYPES.map(chartType => 
      this.loadChartData(chartType).then(data => ({ chartType, data }))
    );
    
    const results = await Promise.all(loadDataPromises);
    
    // Convert to record format
    const allData: Record<ChartType, any[] | null> = {} as Record<ChartType, any[] | null>;
    
    results.forEach(({ chartType, data }) => {
      allData[chartType] = data;
    });
    
    console.log('[CHART DATA SERVICE] Loaded all chart data');
    return allData;
  }

  /**
   * Get chart metadata including available years and data points
   */
  public async getChartMetadata(chartType: ChartType): Promise<any> {
    const data = await this.loadChartData(chartType);
    
    if (!data || data.length === 0) {
      return {
        chartType,
        availableYears: [],
        totalRecords: 0,
        dataPoints: 0,
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Extract unique years
    const years = [...new Set(data.map(row => row.year))].sort((a, b) => b - a);
    
    return {
      chartType,
      availableYears: years,
      totalRecords: data.length,
      dataPoints: Object.keys(data[0] || {}).length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get all chart metadata
   */
  public async getAllChartMetadata(): Promise<any[]> {
    const metadataPromises = CHART_TYPES.map(chartType => 
      this.getChartMetadata(chartType)
    );
    
    return Promise.all(metadataPromises);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('[CHART DATA SERVICE] Cache cleared');
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
const chartDataService = ChartDataService.getInstance();
export default chartDataService;

// Export for named imports
export { chartDataService };