// index.ts
// Main export file for all data services and components

// Services
export { default as DataService } from './DataService';
export { default as FinancialDataService } from './FinancialDataService';

// Hooks
export { default as useFinancialData } from '../hooks/useFinancialData';

// Components
export { default as FinancialDashboard } from '../components/FinancialDashboard';
export { default as FinancialSummaryCard } from '../components/FinancialSummaryCard';
export { default as RevenueBySourceChart } from '../components/RevenueBySourceChart';
export { default as ExpenditureByProgramChart } from '../components/ExpenditureByProgramChart';

// Types
export type { FinancialData, RevenueBySource, ExpenditureByProgram, ConsolidatedData } from './FinancialDataService';
export type { DataManifest, DataSource } from './DataService';