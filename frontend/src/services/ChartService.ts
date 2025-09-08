/**
 * ChartService - Chart utilities and data formatting for visualizations
 * Handles chart data transformation and configuration
 */

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
  category?: string;
}

interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

class ChartService {
  /**
   * Format data for pie charts
   */
  formatPieChartData(
    data: Array<{ name: string; value: number }>,
    colors?: string[]
  ): ChartDataPoint[] {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const defaultColors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', 
      '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'
    ];

    return data.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: colors?.[index] || defaultColors[index % defaultColors.length],
      percentage: Math.round((item.value / total) * 100),
    }));
  }

  /**
   * Format data for bar charts
   */
  formatBarChartData(
    data: Array<{ category: string; value: number }>,
    sortBy?: 'value' | 'name'
  ): ChartDataPoint[] {
    let sortedData = [...data];
    
    if (sortBy === 'value') {
      sortedData = sortedData.sort((a, b) => b.value - a.value);
    } else if (sortBy === 'name') {
      sortedData = sortedData.sort((a, b) => a.category.localeCompare(b.category));
    }

    return sortedData.map(item => ({
      name: item.category,
      value: item.value,
    }));
  }

  /**
   * Format data for time series charts
   */
  formatTimeSeriesData(
    data: Array<{ date: string; value: number; category?: string }>,
    dateFormat?: string
  ): TimeSeriesPoint[] {
    return data.map(item => ({
      date: this.formatDate(item.date, dateFormat),
      value: item.value,
      category: item.category,
    }));
  }

  /**
   * Create comparison data between two periods
   */
  createComparisonData(
    currentData: Array<{ category: string; value: number }>,
    previousData: Array<{ category: string; value: number }>
  ): ComparisonData[] {
    const previousMap = new Map(
      previousData.map(item => [item.category, item.value])
    );

    return currentData.map(current => {
      const previous = previousMap.get(current.category) || 0;
      const change = current.value - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : 0;

      return {
        category: current.category,
        current: current.value,
        previous,
        change,
        changePercent: Math.round(changePercent * 100) / 100,
      };
    });
  }

  /**
   * Calculate percentage distribution
   */
  calculatePercentages(data: Array<{ name: string; value: number }>): Array<{ name: string; value: number; percentage: number }> {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return data.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100 * 100) / 100 : 0,
    }));
  }

  /**
   * Format currency values
   */
  formatCurrency(value: number, locale: string = 'es-AR', currency: string = 'ARS'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Format large numbers with suffixes
   */
  formatLargeNumber(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format date
   */
  formatDate(date: string, format?: string): string {
    const d = new Date(date);
    
    if (format === 'short') {
      return d.toLocaleDateString('es-AR', { 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    if (format === 'year') {
      return d.getFullYear().toString();
    }
    
    return d.toLocaleDateString('es-AR');
  }

  /**
   * Generate chart colors based on values
   */
  generateValueBasedColors(
    data: Array<{ value: number }>,
    colorScale: { min: string; max: string } = { min: '#ff7c7c', max: '#82ca9d' }
  ): string[] {
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    return data.map(d => {
      if (range === 0) return colorScale.min;
      
      const ratio = (d.value - min) / range;
      // Simple linear interpolation between colors
      return ratio > 0.5 ? colorScale.max : colorScale.min;
    });
  }

  /**
   * Create trend analysis
   */
  analyzeTrend(data: Array<{ date: string; value: number }>): {
    trend: 'up' | 'down' | 'stable';
    change: number;
    changePercent: number;
  } {
    if (data.length < 2) {
      return { trend: 'stable', change: 0, changePercent: 0 };
    }

    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sortedData[0].value;
    const last = sortedData[sortedData.length - 1].value;
    const change = last - first;
    const changePercent = first > 0 ? (change / first) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      trend,
      change,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  }
}

export const chartService = new ChartService();
export default chartService;
export type { ChartDataPoint, TimeSeriesPoint, ComparisonData };