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

const TestAllChartsPage: React.FC = () => {
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

export default TestAllChartsPage;