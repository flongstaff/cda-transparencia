// src/types/budget.ts
// TypeScript types for budget data

export interface BudgetCategory {
  budgeted?: number;
  executed?: number;
  execution_rate?: string;
  description?: string;
}

export interface BudgetData {
  total_budgeted: number;
  total_executed: number;
  execution_rate: string;
  categories?: Record<string, BudgetCategory>;
  metadata?: {
    year: number;
    last_updated: string;
    source: string;
  };
}

export interface BudgetApiResponse {
  year: number;
  budget_data: BudgetData;
  comparison_data?: {
    previous_year?: number;
    current_year: number;
    budget_change?: number;
    execution_change?: number;
  };
}

export interface BudgetAnalytics {
  totalBudgeted: number;
  totalExecuted: number;
  executionRate: number;
  categories: Record<string, BudgetCategory>;
  variance: number;
}