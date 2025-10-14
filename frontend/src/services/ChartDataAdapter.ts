/**
 * Chart Data Adapter
 * Transforms OCR-extracted and consolidated data into chart-ready formats
 * Connects real financial data to React chart components
 */

import { getDataUrl } from '../config/dataPathConfig';

export interface ChartDataPoint {
  label: string;
  value: number;
  year?: number;
  category?: string;
  percentage?: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export interface BudgetExecutionData {
  year: number;
  budget: number;
  executed: number;
  percentage: number;
  category: string;
}

export interface RevenueExpenseData {
  year: number;
  revenue: number;
  expenses: number;
  balance: number;
}

class ChartDataAdapterService {
  private cache: Map<string, any> = new Map();

  /**
   * Load and parse CSV file
   */
  private async loadCSV(url: string): Promise<any[]> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');

      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, i) => {
          const value = values[i]?.trim();
          // Try to parse as number
          obj[header.trim()] = isNaN(Number(value)) ? value : Number(value);
        });
        return obj;
      });

      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error(`Error loading CSV ${url}:`, error);
      return [];
    }
  }

  /**
   * Load JSON file
   */
  private async loadJSON(url: string): Promise<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error(`Error loading JSON ${url}:`, error);
      return null;
    }
  }

  /**
   * Get budget execution data for all years
   */
  async getBudgetExecutionData(): Promise<BudgetExecutionData[]> {
    const csv = await this.loadCSV(getDataUrl('charts/budget_execution_all_years.csv'));

    return csv.map(row => ({
      year: row.year,
      budget: row.amount || 0,
      executed: row.amount || 0,
      percentage: 100, // Calculate from detailed data if available
      category: row.type || 'general'
    }));
  }

  /**
   * Get revenue vs expenses comparison
   */
  async getRevenueExpenseComparison(): Promise<RevenueExpenseData[]> {
    const csv = await this.loadCSV(getDataUrl('charts/revenue_vs_expenses.csv'));

    return csv.map(row => ({
      year: row.year,
      revenue: row.recursos || 0,
      expenses: row.gastos || 0,
      balance: row.balance || (row.recursos - row.gastos)
    }));
  }

  /**
   * Get expenses by category for a specific year
   */
  async getExpensesByCategory(year: number): Promise<ChartDataPoint[]> {
    const data = await this.loadJSON(getDataUrl(`consolidated/${year}/gastos.json`));

    if (!data || !data.documents) return [];

    // Group by budget line category
    const categoryTotals: Map<string, number> = new Map();

    data.documents.forEach((doc: any) => {
      const budgetLines = doc.content?.budget_lines || [];
      budgetLines.forEach((line: any) => {
        const category = this.extractCategory(line.concept || line.description || 'Other');
        const amount = line.amount || 0;
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount);
      });
    });

    const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryTotals.entries()).map(([label, value]) => ({
      label,
      value,
      year,
      percentage: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }

  /**
   * Get revenue by source for a specific year
   */
  async getRevenueBySource(year: number): Promise<ChartDataPoint[]> {
    const data = await this.loadJSON(getDataUrl(`consolidated/${year}/recursos.json`));

    if (!data || !data.documents) return [];

    // Group by revenue source
    const sourceTotals: Map<string, number> = new Map();

    data.documents.forEach((doc: any) => {
      const budgetLines = doc.content?.budget_lines || [];
      budgetLines.forEach((line: any) => {
        const source = this.extractSource(line.concept || line.description || 'Other');
        const amount = line.amount || 0;
        sourceTotals.set(source, (sourceTotals.get(source) || 0) + amount);
      });
    });

    const total = Array.from(sourceTotals.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(sourceTotals.entries()).map(([label, value]) => ({
      label,
      value,
      year,
      percentage: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }

  /**
   * Get monthly/quarterly execution data
   */
  async getExecutionTimeSeries(year: number, type: 'gastos' | 'recursos'): Promise<TimeSeriesData[]> {
    const data = await this.loadJSON(getDataUrl(`consolidated/${year}/${type}.json`));

    if (!data || !data.documents) return [];

    // Extract time-based data from documents
    const timeData = data.documents.map((doc: any) => {
      const date = doc.metadata?.date || doc.metadata?.processed_date || `${year}-01-01`;
      const amount = doc.metadata?.amount || 0;

      return {
        date: date.substring(0, 10), // YYYY-MM-DD format
        value: amount,
        category: type
      };
    }).sort((a: any, b: any) => a.date.localeCompare(b.date));

    return timeData;
  }

  /**
   * Get document type distribution
   */
  async getDocumentTypeDistribution(): Promise<ChartDataPoint[]> {
    const csv = await this.loadCSV(getDataUrl('charts/document_type_distribution.csv'));

    return csv.map(row => ({
      label: row.type,
      value: row.count,
      percentage: row.percentage
    }));
  }

  /**
   * Get treasury/cash flow data
   */
  async getTreasuryData(year: number): Promise<any> {
    const data = await this.loadJSON(getDataUrl(`consolidated/${year}/tesoreria.json`));

    if (!data || !data.documents) return null;

    // Extract cash flow information
    const documents = data.documents;
    const cashFlows: any[] = [];

    documents.forEach((doc: any) => {
      const content = doc.content;
      if (content.budget_lines) {
        content.budget_lines.forEach((line: any) => {
          cashFlows.push({
            date: doc.metadata?.date || `${year}-01-01`,
            concept: line.concept || line.description,
            amount: line.amount || 0,
            type: this.classifyCashFlow(line.concept || line.description || '')
          });
        });
      }
    });

    return {
      year,
      totalInflows: cashFlows.filter(cf => cf.type === 'inflow').reduce((sum, cf) => sum + cf.amount, 0),
      totalOutflows: cashFlows.filter(cf => cf.type === 'outflow').reduce((sum, cf) => sum + cf.amount, 0),
      cashFlows: cashFlows.sort((a, b) => a.date.localeCompare(b.date))
    };
  }

  /**
   * Get personnel/salary data
   */
  async getPersonnelData(year: number): Promise<any> {
    const data = await this.loadJSON(getDataUrl(`consolidated/${year}/personal.json`));

    if (!data || !data.documents) return null;

    const documents = data.documents;
    const personnelByDepartment: Map<string, number> = new Map();
    let totalSalaries = 0;

    documents.forEach((doc: any) => {
      const lines = doc.content?.budget_lines || [];
      lines.forEach((line: any) => {
        const dept = this.extractDepartment(line.concept || line.description || 'General');
        const amount = line.amount || 0;
        personnelByDepartment.set(dept, (personnelByDepartment.get(dept) || 0) + amount);
        totalSalaries += amount;
      });
    });

    return {
      year,
      totalSalaries,
      byDepartment: Array.from(personnelByDepartment.entries()).map(([department, amount]) => ({
        department,
        amount,
        percentage: totalSalaries > 0 ? (amount / totalSalaries) * 100 : 0
      })).sort((a, b) => b.amount - a.amount)
    };
  }

  /**
   * Get multi-year comparison data
   */
  async getMultiYearComparison(years: number[], type: 'gastos' | 'recursos' = 'gastos'): Promise<any[]> {
    const promises = years.map(year => this.loadJSON(getDataUrl(`consolidated/${year}/summary.json`)));
    const summaries = await Promise.all(promises);

    return summaries.map((summary, index) => {
      if (!summary) return { year: years[index], total: 0, count: 0 };

      const typeAmount = summary.summary?.total_amounts?.[type] || 0;
      const typeCount = summary.summary?.by_type?.[type] || 0;

      return {
        year: years[index],
        total: typeAmount,
        count: typeCount,
        average: typeCount > 0 ? typeAmount / typeCount : 0
      };
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Helper methods for data extraction
  private extractCategory(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('personal') || lower.includes('salario') || lower.includes('sueldo')) return 'Personal';
    if (lower.includes('servicio') || lower.includes('mantenimiento')) return 'Servicios';
    if (lower.includes('obra') || lower.includes('infraestructura') || lower.includes('construcción')) return 'Obras Públicas';
    if (lower.includes('educación') || lower.includes('escuela')) return 'Educación';
    if (lower.includes('salud') || lower.includes('hospital')) return 'Salud';
    if (lower.includes('seguridad') || lower.includes('policía')) return 'Seguridad';
    if (lower.includes('deuda') || lower.includes('interés') || lower.includes('préstamo')) return 'Deuda';
    if (lower.includes('transferencia')) return 'Transferencias';
    return 'Otros';
  }

  private extractSource(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('coparticipación') || lower.includes('coparticipacion')) return 'Coparticipación';
    if (lower.includes('tasa') || lower.includes('impuesto municipal')) return 'Tasas Municipales';
    if (lower.includes('provincia') || lower.includes('provincial')) return 'Aportes Provinciales';
    if (lower.includes('nación') || lower.includes('nacional') || lower.includes('nacion')) return 'Aportes Nacionales';
    if (lower.includes('propios') || lower.includes('propio')) return 'Recursos Propios';
    if (lower.includes('transferencia')) return 'Transferencias';
    return 'Otros';
  }

  private classifyCashFlow(text: string): 'inflow' | 'outflow' {
    const lower = text.toLowerCase();
    if (lower.includes('ingreso') || lower.includes('cobr') || lower.includes('recaud')) return 'inflow';
    if (lower.includes('pago') || lower.includes('egreso') || lower.includes('gasto')) return 'outflow';
    return 'outflow'; // Default to outflow for expenses
  }

  private extractDepartment(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('intendencia') || lower.includes('ejecutivo')) return 'Intendencia';
    if (lower.includes('hacienda') || lower.includes('finanzas')) return 'Hacienda';
    if (lower.includes('obras')) return 'Obras Públicas';
    if (lower.includes('desarrollo') || lower.includes('social')) return 'Desarrollo Social';
    if (lower.includes('educación') || lower.includes('cultura')) return 'Educación y Cultura';
    if (lower.includes('salud')) return 'Salud';
    if (lower.includes('seguridad')) return 'Seguridad';
    return 'Administración General';
  }
}

export const chartDataAdapter = new ChartDataAdapterService();
export default chartDataAdapter;
