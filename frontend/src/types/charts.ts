/**
 * Chart type definitions for the transparency portal
 */

// Red flag analysis types
export type RedFlagAnalysis =
  | 'budget-execution'
  | 'function-priority'
  | 'procurement-timeline'
  | 'programmatic-indicators'
  | 'gender-perspective'
  | 'quarterly-anomalies'
  | 'overview';

// Chart component props interface
export interface ChartComponentProps {
  height?: number;
  width?: number | string;
  analysis?: RedFlagAnalysis;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
  interactive?: boolean;
  data?: any;
}

// Chart configuration for routing
export interface ChartConfig {
  component: string;
  props?: Record<string, any>;
  analysis?: RedFlagAnalysis;
  title?: string;
  description?: string;
  priority: number;
}

// Page chart mapping
export interface PageChartMapping {
  [pageName: string]: ChartConfig[];
}

// Chart navigation item
export interface ChartNavigationItem {
  title: string;
  description: string;
  component: string;
  analysis?: RedFlagAnalysis;
}

export default RedFlagAnalysis;