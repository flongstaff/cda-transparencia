// Chart Type Definitions
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    name: string;
    value: number;
    unit?: string;
    payload: any;
  }>;
  label?: string;
  labelFormatter?: (value: any) => string;
  formatter?: (value: number, name: string) => [string, string];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ChartSeries {
  dataKey: string;
  name: string;
  color: string;
  type?: 'bar' | 'line' | 'area';
}

export interface ChartMetadata {
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'CACHED';
  lastUpdated: string;
  source: string;
  recordCount?: number;
  networkStatus?: 'online' | 'offline';
  cacheUsed?: boolean;
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  height?: number;
  onRetry?: () => void;
  metadata?: ChartMetadata;
  className?: string;
}

// Debt-specific types
export interface DebtItem {
  debt_type: string;
  description: string;
  amount: number;
  interest_rate: number;
  due_date: string;
  status: 'active' | 'paid' | 'overdue';
  principal_amount?: number;
  accrued_interest?: number;
}

export interface DebtAnalytics {
  totalDebt: number;
  averageInterestRate: number;
  longTermDebt: number;
  shortTermDebt: number;
  debtByType: Array<{
    name: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  riskMetrics: {
    debtRatio: number;
    interestBurden: number;
    maturityProfile: 'short' | 'medium' | 'long';
  };
}

// Budget-specific types
export interface BudgetCategory {
  budgeted: number;
  executed: number;
  execution_rate: number;
  variance: number;
  variance_percentage: number;
}

export interface BudgetData {
  total_budgeted: number;
  total_executed: number;
  execution_rate: number;
  categories: Record<string, BudgetCategory>;
  year: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  metadata?: ChartMetadata;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error types
export interface ChartError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
}

export type ChartErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR' 
  | 'TIMEOUT_ERROR'
  | 'PARSE_ERROR'
  | 'API_ERROR'
  | 'UNKNOWN_ERROR';

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  storageType: 'localStorage' | 'sessionStorage' | 'memory';
}

export default {
  ChartTooltipProps,
  ChartDataPoint,
  ChartSeries,
  ChartMetadata,
  BaseChartProps,
  DebtItem,
  DebtAnalytics,
  BudgetCategory,
  BudgetData,
  ApiResponse,
  PaginatedResponse,
  ChartError,
  CacheEntry,
  CacheConfig
};