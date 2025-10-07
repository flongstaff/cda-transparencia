// index.ts
// Main export file for all data services and components

// Services
export { default as DataService } from './DataService';
export { default as FinancialDataService } from './FinancialDataService';

// Hooks
export { default as useFinancialData } from '../hooks/useFinancialData';

// Components
// Removed unused export to fix build errors
// export { default as FinancialDashboard } from '../pages/FinancialDashboard';
export { default as FinancialSummaryCard } from '@components/FinancialSummaryCard';
export { default as RevenueBySourceChart } from '@components/charts/RevenueBySourceChart';
export { default as ExpenditureByProgramChart } from '@components/charts/ExpenditureByProgramChart';

// Types
export type { FinancialData, RevenueBySource, ExpenditureByProgram, ConsolidatedData } from './FinancialDataService';
export type { DataManifest, DataSource } from './DataService';