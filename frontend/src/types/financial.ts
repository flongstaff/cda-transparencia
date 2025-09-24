export interface BudgetData {
  year: number;
  totalBudget: number;
  totalExecuted: number;
  executionPercentage: number;
  categories: Array<{
    name: string;
    budgeted: number;
    executed: number;
    percentage: number;
  }>;
}

export interface ContractData {
  id: string;
  year: number;
  title: string;
  amount: number;
  category: string;
  vendor: string;
  status: string;
  source: string;
  execution_link: string;
}

export interface YearlyData {
  year: number;
  total_budget: number;
  executed_infra: number;
  planned_infra: number;
  personnel: number;
  total_executed: number;
  execution_rate: number;
}

export interface UnifiedFinancialData {
  year: number;
  category: string;
  planned: number;
  executed: number;
  execution_rate: number;
  source: string;
  verification_status: string;
}