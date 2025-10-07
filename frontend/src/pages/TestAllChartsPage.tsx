/**
 * Test All Charts Page - Verify all chart components are working with data
 */

import React from 'react';
import BudgetExecutionChartWrapper from '../components/charts/BudgetExecutionChartWrapper';
import DebtReportChart from '../components/charts/DebtReportChart';
import EconomicReportChart from '../components/charts/EconomicReportChart';
import EducationDataChart from '../components/charts/EducationDataChart';
import ExpenditureReportChart from '../components/charts/ExpenditureReportChart';
import FinancialReservesChart from '../components/charts/FinancialReservesChart';
import FiscalBalanceReportChart from '../components/charts/FiscalBalanceReportChart';
import HealthStatisticsChart from '../components/charts/HealthStatisticsChart';
import InfrastructureProjectsChart from '../components/charts/InfrastructureProjectsChart';
import InvestmentReportChart from '../components/charts/InvestmentReportChart';
import PersonnelExpensesChart from '../components/charts/PersonnelExpensesChart';
import RevenueReportChart from '../components/charts/RevenueReportChart';
import RevenueSourcesChart from '../components/charts/RevenueSourcesChart';
import QuarterlyExecutionChart from '../components/charts/QuarterlyExecutionChart';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useMasterData } from '../hooks/useMasterData';

const TestAllChartsPage: React.FC = () => {
  const { data, loading, error } = useMasterData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-8">Test All Charts Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* First row of charts */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Budget Execution</h2>
          <BudgetExecutionChartWrapper height={350} />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Debt Report</h2>
          <DebtReportChart height={350} />
        </div>
        
        {/* Second row of charts */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Economic Report</h2>
          <EconomicReportChart height={350} />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Education Data</h2>
          <EducationDataChart height={350} />
        </div>
        
        {/* Third row of charts */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Expenditure Report</h2>
          <ExpenditureReportChart height={350} />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Financial Reserves</h2>
          <FinancialReservesChart height={350} />
        </div>
        
        {/* Fourth row of charts */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Fiscal Balance</h2>
          <FiscalBalanceReportChart height={350} />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Health Statistics</h2>
          <HealthStatisticsChart height={350} />
        </div>
        
        {/* Fifth row of charts */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Infrastructure Projects</h2>
          <InfrastructureProjectsChart height={350} />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Investment Report</h2>
          <InvestmentReportChart height={350} />
        </div>
        
        {/* Sixth row of charts */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Personnel Expenses</h2>
          <PersonnelExpensesChart height={350} />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Revenue Report</h2>
          <RevenueReportChart height={350} />
        </div>
        
        {/* Seventh row of charts */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Revenue Sources</h2>
          <RevenueSourcesChart height={350} />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">Quarterly Execution</h2>
          <QuarterlyExecutionChart height={350} />
        </div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const TestAllChartsPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                      {error.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md"
                  >
                    Recargar
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <TestAllChartsPage />
    </ErrorBoundary>
  );
};

export default TestAllChartsPageWithErrorBoundary;