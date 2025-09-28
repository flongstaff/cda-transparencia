/**
 * Master Data Type Definitions
 *
 * Central types for all transparency data structures
 * Used by hooks and components throughout the application
 */

export interface MasterData {
  yearData: {
    budget: any;
    contracts: any[];
    salaries: any[];
    documents: any[];
    treasury: any;
    debt: any;
  };
  multiYearData: {
    [year: number]: {
      budget: any;
      contracts: any[];
      salaries: any[];
      documents: any[];
      treasury: any;
      debt: any;
      external_validation: any[];
    };
  };
  chartsData: {
    budget: any;
    contracts: any;
    salaries: any;
    treasury: any;
    debt: any;
    documents: any;
    comprehensive: any;
    budgetHistorical: any[];
    contractsHistorical: any[];
    salariesHistorical: any[];
    treasuryHistorical: any[];
    debtHistorical: any[];
    documentsHistorical: any[];
  };
  metadata: {
    totalDocuments: number;
    availableYears: number[];
    categories: string[];
    dataSourcesActive: number;
    lastUpdated?: string;
    responseTime?: number;
  };
}

export interface YearData {
  year: number;
  total_budget: number;
  revenues: number;
  expenses: number;
  executed_infra: number;
  personnel: number;
  execution_rate: number;
}

export interface BudgetData {
  total_budget: number;
  total_executed: number;
  execution_rate: number;
  categories: CategoryData[];
  monthly_execution: MonthlyData[];
}

export interface CategoryData {
  name: string;
  budget: number;
  executed: number;
  percentage: number;
}

export interface MonthlyData {
  month: number;
  executed: number;
  cumulative: number;
}

export interface ContractData {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  category: string;
  vendor: string;
}

export interface DocumentData {
  id: string;
  title: string;
  category: string;
  date: string;
  verified: boolean;
  size: number;
  url: string;
}

export interface TreasuryData {
  total_revenue: number;
  total_expenses: number;
  balance: number;
  cash_flow: CashFlowData[];
}

export interface CashFlowData {
  month: number;
  income: number;
  expenses: number;
  balance: number;
}

export interface DebtData {
  total_debt: number;
  debt_by_type: DebtTypeData[];
  debt_evolution: DebtEvolutionData[];
}

export interface DebtTypeData {
  type: string;
  amount: number;
  percentage: number;
}

export interface DebtEvolutionData {
  year: number;
  amount: number;
}

export interface AuditResult {
  year: number;
  score: number;
  issues: AuditIssue[];
  recommendations: string[];
}

export interface AuditIssue {
  type: 'warning' | 'error' | 'info';
  message: string;
  affected_area: string;
}

export default MasterData;