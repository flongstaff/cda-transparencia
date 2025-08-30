/**
 * Service to fetch Power BI data from the backend API
 */

export interface PowerBIDataset {
  name: string;
  id: string;
  table_count: number;
}

export interface PowerBITable {
  name: string;
  column_count: number;
  row_count: number;
}

export interface PowerBIRecord {
  source: string;
  data: Record<string, any>;
}

export interface PowerBIReport {
  report_date: string;
  summary: {
    datasets_extracted: number;
    tables_extracted: number;
    records_extracted: number;
    records_saved: number;
  };
}

export interface PowerBIFinancialData {
  category: string;
  subcategory: string;
  budgeted: number;
  executed: number;
  difference: number;
  percentage: number;
  year: number;
  quarter: string;
  department: string;
  project?: string;
}

export interface ComparisonDataPoint {
  category: string;
  subcategory: string;
  powerbi_amount: number;
  pdf_amount: number;
  difference: number;
  percentage_diff: number;
  year: number;
  quarter: string;
  status: 'match' | 'discrepancy' | 'missing';
  source_document?: string;
}

class PowerBIDataService {
  private baseURL = '/api/powerbi';

  /**
   * Check if Power BI data is available
   */
  async isDataAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/status`);
      const data = await response.json();
      return data.available || false;
    } catch (error) {
      console.error('Error checking Power BI data availability:', error);
      return false;
    }
  }

  /**
   * Fetch Power BI datasets
   */
  async fetchDatasets(): Promise<PowerBIDataset[]> {
    try {
      const response = await fetch(`${this.baseURL}/datasets`);
      const data = await response.json();
      return data.datasets || [];
    } catch (error) {
      console.error('Error fetching Power BI datasets:', error);
      return [];
    }
  }

  /**
   * Fetch Power BI tables
   */
  async fetchTables(): Promise<PowerBITable[]> {
    try {
      const response = await fetch(`${this.baseURL}/tables`);
      const data = await response.json();
      return data.tables || [];
    } catch (error) {
      console.error('Error fetching Power BI tables:', error);
      return [];
    }
  }

  /**
   * Fetch Power BI records (limited)
   */
  async fetchRecords(limit: number = 100): Promise<PowerBIRecord[]> {
    try {
      const response = await fetch(`${this.baseURL}/records?limit=${limit}`);
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching Power BI records:', error);
      return [];
    }
  }

  /**
   * Fetch Power BI extraction report
   */
  async fetchReport(): Promise<PowerBIReport> {
    try {
      const response = await fetch(`${this.baseURL}/report`);
      const data = await response.json();
      return data.report;
    } catch (error) {
      console.error('Error fetching Power BI report:', error);
      throw new Error('Failed to load Power BI report');
    }
  }

  /**
   * Fetch financial data for auditing
   */
  async fetchFinancialData(): Promise<PowerBIFinancialData[]> {
    try {
      const response = await fetch(`${this.baseURL}/financial-data`);
      const data = await response.json();
      return data.financialData || [];
    } catch (error) {
      console.error('Error fetching Power BI financial data:', error);
      return [];
    }
  }

  /**
   * Trigger Power BI data extraction
   */
  async triggerExtraction(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return {
        success: data.success || false,
        message: data.message || 'Extraction completed'
      };
    } catch (error) {
      console.error('Error triggering Power BI extraction:', error);
      return {
        success: false,
        message: 'Failed to trigger extraction'
      };
    }
  }

  /**
   * Fetch comparison data between Power BI and PDF documents
   */
  async fetchComparisonData(): Promise<ComparisonDataPoint[]> {
    try {
      // In a real implementation, this would fetch actual comparison data
      // For now, we'll generate mock data based on financial data
      const financialData = await this.fetchFinancialData();
      
      const comparisonData: ComparisonDataPoint[] = financialData.map((item, index) => {
        // Simulate some discrepancies
        const hasDiscrepancy = index % 7 === 0; // Every 7th item has a discrepancy
        const isMissing = index % 11 === 0; // Every 11th item is missing from PDF
        
        let pdf_amount = item.budgeted;
        let difference = 0;
        let percentage_diff = 0;
        let status: 'match' | 'discrepancy' | 'missing' = 'match';
        
        if (isMissing) {
          pdf_amount = 0;
          difference = -item.budgeted;
          percentage_diff = -100;
          status = 'missing';
        } else if (hasDiscrepancy) {
          const discrepancy = item.budgeted * (Math.random() * 0.1 - 0.05); // ±5% discrepancy
          pdf_amount = item.budgeted + discrepancy;
          difference = discrepancy;
          percentage_diff = (discrepancy / item.budgeted) * 100;
          status = 'discrepancy';
        }
        
        return {
          category: item.category,
          subcategory: item.subcategory,
          powerbi_amount: item.budgeted,
          pdf_amount,
          difference,
          percentage_diff,
          year: item.year,
          quarter: item.quarter,
          status,
          source_document: `documento-${item.category.replace(/\s+/g, '-')}-${item.year}.pdf`
        };
      });
      
      return comparisonData;
    } catch (error) {
      console.error('Error fetching Power BI comparison data:', error);
      return [];
    }
  }
}

export default new PowerBIDataService();