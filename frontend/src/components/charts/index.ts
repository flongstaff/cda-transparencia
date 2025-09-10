// Advanced Charts Export Index
// Provides centralized access to all chart components and utilities

// Legacy Chart Components (commented out - file doesn't exist)
// export { default as CategoryChart } from './CategoryChart';

// Core Chart Components
export { default as TreemapChart } from './TreemapChart';
export { default as WaterfallChart } from './WaterfallChart';
export { default as FunnelChart } from './FunnelChart';
export { default as SankeyDiagram } from './SankeyDiagram';
export { default as DebtAnalysisChart } from './DebtAnalysisChart';
export { default as BudgetAnalysisChart } from './BudgetAnalysisChart';
export { default as BudgetAnalysisChartEnhanced } from './BudgetAnalysisChartEnhanced';
export { default as UniversalChart } from './UniversalChart';

// Specialized Chart Components
export { default as GanttChart } from './GanttChart';
export { default as HeatmapCalendar } from './HeatmapCalendar';
export { default as RadarChart } from './RadarChart';

// Unified Chart System
export { default as ComprehensiveChart } from './ComprehensiveChart';
export { default as UnifiedChart } from './UnifiedChart';
export { default as TreasuryAnalysisChart } from './TreasuryAnalysisChart';
export { default as SalaryAnalysisChart } from './SalaryAnalysisChart';
export { default as ContractAnalysisChart } from './ContractAnalysisChart';
export { default as PropertyDeclarationsChart } from './PropertyDeclarationsChart';
export { default as DocumentAnalysisChart } from './DocumentAnalysisChart';
export { default as YearlyDataChart } from './YearlyDataChart';
export { default as ValidatedChart } from './ValidatedChart';
export { default as UnifiedDashboardChart } from './UnifiedDashboardChart';

// Advanced Chart Loader System
export { default as AdvancedChartLoader } from './AdvancedChartLoader';
export { default as LazyChartLoader } from './LazyChartLoader';
export { default as AdvancedChartsShowcase } from './AdvancedChartsShowcase';

// Advanced Chart Loader Types and Utilities
export type { AdvancedChartType } from './AdvancedChartLoader';
export { 
  preloadAdvancedChart, 
  useAdvancedChartPreloader 
} from './AdvancedChartLoader';

// Chart Type Definitions (when available)
// export type {
//   ChartTooltipProps,
//   ChartDataPoint,
//   ChartSeries,
//   ChartMetadata,
//   BaseChartProps,
//   DebtItem,
//   DebtAnalytics,
//   BudgetCategory,
//   BudgetData,
//   ApiResponse,
//   PaginatedResponse,
//   ChartError,
//   CacheEntry,
//   CacheConfig
// } from '../types/chart';

// Chart Utilities
export const CHART_TYPES = {
  TREEMAP: 'treemap',
  WATERFALL: 'waterfall', 
  FUNNEL: 'funnel',
  SANKEY: 'sankey',
  DEBT: 'debt',
  BUDGET: 'budget'
} as const;

export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  PURPLE: '#8B5CF6',
  PINK: '#EC4899',
  GRAY: '#6B7280',
  TEAL: '#14B8A6',
  ORANGE: '#F97316',
  LIME: '#84CC16'
} as const;