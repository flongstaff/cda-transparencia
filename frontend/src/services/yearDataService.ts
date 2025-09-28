/**
 * Year Data Service
 *
 * Specialized service for managing year-specific data preloading
 * and caching for improved dashboard performance
 */

import DataService from './dataService';

export interface YearData {
  year: number;
  financial: any[];
  charts: any[];
  audits: any[];
  contracts: any[];
  budget: any[];
  expenses: any[];
  revenue: any[];
  loadedAt: Date;
}

export interface YearDataSummary {
  totalBudget: number;
  totalExecuted: number;
  executionRate: number;
  totalContracts: number;
  totalDocuments: number;
  averageCompletion: number;
}

class YearDataService {
  private cache: Map<number, YearData> = new Map();
  private loadingPromises: Map<number, Promise<YearData>> = new Map();

  /**
   * Get data for a specific year, with caching
   */
  async getYearData(year: number): Promise<YearData> {
    // Check cache first
    if (this.cache.has(year)) {
      const cached = this.cache.get(year)!;
      // Cache is valid for 1 hour
      if (Date.now() - cached.loadedAt.getTime() < 60 * 60 * 1000) {
        return cached;
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(year)) {
      return this.loadingPromises.get(year)!;
    }

    // Start loading
    const loadingPromise = this.loadYearDataFromAPI(year);
    this.loadingPromises.set(year, loadingPromise);

    try {
      const data = await loadingPromise;
      this.cache.set(year, data);
      this.loadingPromises.delete(year);
      return data;
    } catch (error) {
      this.loadingPromises.delete(year);
      throw error;
    }
  }

  /**
   * Load data from API for a specific year
   */
  private async loadYearDataFromAPI(year: number): Promise<YearData> {
    try {
      // Load all data types in parallel
      const [
        financialData,
        chartData,
        auditData
      ] = await Promise.all([
        DataService.getFinancialData(),
        DataService.getChartData(),
        DataService.getMasterIndex()
      ]);

      // Filter data by year where applicable
      const yearFinancialData = financialData.filter((item: any) =>
        !item.year || item.year === year || year === new Date().getFullYear()
      );

      const yearChartData = chartData.filter((item: any) =>
        !item.year || item.year === year || year === new Date().getFullYear()
      );

      const yearAuditData = auditData.filter((item: any) =>
        !item.year || item.year === year || year === new Date().getFullYear()
      );

      // Generate additional derived data
      const contracts = this.generateContractData(yearChartData);
      const budget = this.generateBudgetData(yearFinancialData);
      const expenses = this.generateExpenseData(yearFinancialData);
      const revenue = this.generateRevenueData(yearFinancialData);

      return {
        year,
        financial: yearFinancialData,
        charts: yearChartData,
        audits: yearAuditData,
        contracts,
        budget,
        expenses,
        revenue,
        loadedAt: new Date()
      };
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);

      // Return fallback data
      return {
        year,
        financial: [],
        charts: [],
        audits: [],
        contracts: [],
        budget: [],
        expenses: [],
        revenue: [],
        loadedAt: new Date()
      };
    }
  }

  /**
   * Generate summary statistics for a year
   */
  getYearSummary(yearData: YearData): YearDataSummary {
    const { financial, charts, audits } = yearData;

    const totalBudget = financial.reduce((sum: number, item: any) =>
      sum + (parseFloat(item.planned) || parseFloat(item.presupuesto) || 0), 0
    );

    const totalExecuted = financial.reduce((sum: number, item: any) =>
      sum + (parseFloat(item.executed) || parseFloat(item.ejecutado) || 0), 0
    );

    const executionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

    const totalContracts = charts.filter((item: any) =>
      item.type === 'contract' || item.contractor || item.contratista
    ).length;

    const totalDocuments = financial.length + charts.length + audits.length;

    // Calculate average completion based on available data
    const itemsWithCompletion = financial.filter((item: any) =>
      item.executed > 0 || item.ejecutado > 0
    );
    const averageCompletion = financial.length > 0
      ? (itemsWithCompletion.length / financial.length) * 100
      : 0;

    return {
      totalBudget,
      totalExecuted,
      executionRate: Math.round(executionRate * 100) / 100,
      totalContracts,
      totalDocuments,
      averageCompletion: Math.round(averageCompletion * 100) / 100
    };
  }

  /**
   * Preload data for multiple years
   */
  async preloadYears(years: number[]): Promise<void> {
    const promises = years.map(year => this.getYearData(year));
    await Promise.allSettled(promises);
  }

  /**
   * Get available years from cached data
   */
  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = Array.from(this.cache.keys());

    // Always include recent years
    const defaultYears = [currentYear, currentYear - 1, currentYear - 2];

    return Array.from(new Set([...years, ...defaultYears])).sort((a, b) => b - a);
  }

  /**
   * Clear cache for a specific year
   */
  clearYearCache(year: number): void {
    this.cache.delete(year);
  }

  /**
   * Clear all cached data
   */
  clearAllCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { year: number; size: number; lastLoaded: Date }[] {
    return Array.from(this.cache.entries()).map(([year, data]) => ({
      year,
      size: JSON.stringify(data).length,
      lastLoaded: data.loadedAt
    }));
  }

  // Private helper methods for generating derived data
  private generateContractData(chartData: any[]): any[] {
    return chartData
      .filter(item => item.contractor || item.contratista || item.type === 'contract')
      .map(item => ({
        id: item.id || `contract-${Date.now()}`,
        contractor: item.contractor || item.contratista || 'Contratista',
        amount: parseFloat(item.amount) || parseFloat(item.monto) || 0,
        status: item.status || item.estado || 'activo',
        description: item.description || item.descripcion || 'Contrato municipal',
        startDate: item.startDate || item.fechaInicio || new Date().toISOString(),
        endDate: item.endDate || item.fechaFin || new Date().toISOString()
      }));
  }

  private generateBudgetData(financialData: any[]): any[] {
    return financialData
      .filter(item => item.planned || item.presupuesto)
      .map(item => ({
        category: item.category || item.categoria || 'General',
        planned: parseFloat(item.planned) || parseFloat(item.presupuesto) || 0,
        executed: parseFloat(item.executed) || parseFloat(item.ejecutado) || 0,
        percentage: item.percentage || 0,
        description: item.description || item.descripcion || ''
      }));
  }

  private generateExpenseData(financialData: any[]): any[] {
    return financialData
      .filter(item =>
        item.type === 'expense' ||
        item.tipo === 'gasto' ||
        (item.executed || item.ejecutado)
      )
      .map(item => ({
        category: item.category || item.categoria || 'Gastos Generales',
        amount: parseFloat(item.executed) || parseFloat(item.ejecutado) || parseFloat(item.amount) || 0,
        date: item.date || item.fecha || new Date().toISOString(),
        description: item.description || item.descripcion || 'Gasto municipal'
      }));
  }

  private generateRevenueData(financialData: any[]): any[] {
    return financialData
      .filter(item =>
        item.type === 'revenue' ||
        item.tipo === 'ingreso' ||
        item.revenue ||
        item.ingreso
      )
      .map(item => ({
        source: item.source || item.fuente || 'Ingresos Varios',
        amount: parseFloat(item.revenue) || parseFloat(item.ingreso) || parseFloat(item.amount) || 0,
        date: item.date || item.fecha || new Date().toISOString(),
        description: item.description || item.descripcion || 'Ingreso municipal'
      }));
  }
}

// Export singleton instance
export default new YearDataService();