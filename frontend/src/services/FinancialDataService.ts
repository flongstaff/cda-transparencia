// FinancialDataService.ts
// Service to access financial data for Carmen de Areco Transparency Portal

const API_BASE_URL = '/api';

export interface FinancialData {
  year: number;
  title: string;
  revenue: {
    total: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    current: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    capital: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    financial_sources: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    discretionary: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    earmarked: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
  };
  expenditure: {
    total: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    personnel: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    consumables: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    services: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    capital_goods: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    transfers: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    financial_assets: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    debt_service: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
  };
  financial_position: {
    current_assets: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    non_current_assets: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    current_liabilities: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    non_current_liabilities: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
  };
  financial_result: {
    operating_result: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
    net_result: {
      budgeted: number;
      executed: number;
      percentage: number;
    };
  };
}

export interface RevenueBySource {
  year: number;
  title: string;
  sources: Array<{
    source: string;
    type: string;
    description: string;
    budgeted: number;
    executed: number;
    percentage: number;
  }>;
}

export interface ExpenditureByProgram {
  year: number;
  title: string;
  programs: Array<{
    program_code: string;
    program_name: string;
    budgeted: number;
    executed: number;
    paid: number;
  }>;
}

export interface ConsolidatedData {
  metadata: {
    year: number;
    title: string;
    last_updated: string;
    source: string;
  };
  summary: {
    revenue: {
      total: {
        budgeted: number;
        executed: number;
        percentage: number;
      };
      current: {
        budgeted: number;
        executed: number;
        percentage: number;
      };
      capital: {
        budgeted: number;
        executed: number;
        percentage: number;
      };
    };
    expenditure: {
      total: {
        budgeted: number;
        executed: number;
        percentage: number;
      };
      personnel: {
        budgeted: number;
        executed: number;
        percentage: number;
      };
      consumables: {
        budgeted: number;
        executed: number;
        percentage: number;
      };
    };
    financial_result: {
      operating_result: {
        executed: number;
      };
      net_result: {
        executed: number;
      };
    };
  };
  revenue_by_source: Array<{
    source: string;
    description: string;
    executed: number;
  }>;
  top_expenditure_programs: Array<{
    program_name: string;
    executed: number;
  }>;
}

export class FinancialDataService {
  static async getFinancialSummary(year: number = 2019): Promise<FinancialData> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/summary.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching financial summary for ${year}:`, error);
      throw error;
    }
  }

  static async getRevenueBySource(year: number = 2019): Promise<RevenueBySource> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/revenue_by_source.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching revenue by source for ${year}:`, error);
      throw error;
    }
  }

  static async getExpenditureByProgram(year: number = 2019): Promise<ExpenditureByProgram> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/expenditure_by_program.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching expenditure by program for ${year}:`, error);
      throw error;
    }
  }

  static async getConsolidatedData(year: number = 2019): Promise<ConsolidatedData> {
    try {
      const response = await fetch(`${API_BASE_URL}/financial/${year}/consolidated.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching consolidated data for ${year}:`, error);
      throw error;
    }
  }

  static async getAllFinancialData(year: number = 2019): Promise<{
    summary: FinancialData;
    revenueBySource: RevenueBySource;
    expenditureByProgram: ExpenditureByProgram;
    consolidated: ConsolidatedData;
  }> {
    try {
      const [summary, revenueBySource, expenditureByProgram, consolidated] = await Promise.all([
        FinancialDataService.getFinancialSummary(year),
        FinancialDataService.getRevenueBySource(year),
        FinancialDataService.getExpenditureByProgram(year),
        FinancialDataService.getConsolidatedData(year)
      ]);

      return {
        summary,
        revenueBySource,
        expenditureByProgram,
        consolidated
      };
    } catch (error) {
      console.error(`Error fetching all financial data for ${year}:`, error);
      throw error;
    }
  }
}

export default FinancialDataService;