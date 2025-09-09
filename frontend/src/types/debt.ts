export interface DebtData {
  debt_type: string;
  description: string;
  amount: number;
  interest_rate: number;
  due_date: string;
  status: 'active' | 'paid' | 'defaulted' | 'refinanced';
  principal_amount?: number;
  accrued_interest?: number;
}

export interface DebtApiResponse {
  debt_data: DebtData[];
  total_debt: number;
  average_interest_rate: number;
  long_term_debt: number;
  short_term_debt: number;
  debt_by_type: Record<string, number>;
  metadata?: {
    year: number;
    last_updated: string;
    source: string;
    error?: string;
  };
}

export interface DebtAnalytics {
  totalDebt: number;
  averageInterestRate: number;
  longTermDebt: number;
  shortTermDebt: number;
  debtByType: { name: string; value: number; color: string }[];
}