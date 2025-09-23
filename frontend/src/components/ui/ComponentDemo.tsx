import React from 'react';
import { PieChart, Coins, CreditCard } from 'lucide-react';
import { FinancialHealthScoreCard, EnhancedMetricCard, DataVerificationBadge, TransparencyScore, FinancialCategoryNavigation } from './ui';

const ComponentDemo: React.FC = () => {
  const handleCategoryChange = (categoryId: string) => {
    console.log('Category changed to:', categoryId);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">UI Component Demo</h1>
      
      {/* Financial Category Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Financial Category Navigation</h2>
        <FinancialCategoryNavigation 
          categories={[
            { id: 'all', name: 'All' },
            { id: 'budget', name: 'Budget' },
            { id: 'revenue', name: 'Revenue' },
            { id: 'expenses', name: 'Expenses' },
            { id: 'debt', name: 'Debt' },
            { id: 'investments', name: 'Investments' }
          ]}
          activeCategory="budget"
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Financial Health Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Financial Health Score Card</h2>
        <div className="max-w-md">
          <FinancialHealthScoreCard 
            score={85}
            title="Overall Financial Health"
            onClick={() => console.log('Financial health card clicked')}
          />
        </div>
      </div>

      {/* Transparency Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transparency Score</h2>
        <div className="max-w-xs">
          <TransparencyScore 
            score={4.2}
            documentCount={24}
            onClick={() => console.log('Transparency score clicked')}
          />
        </div>
      </div>

      {/* Enhanced Metric Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Enhanced Metric Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EnhancedMetricCard
            title="Budget Execution"
            value="92%"
            icon={PieChart}
            trend={{ value: 12, isPositive: true }}
            updatedAt="Jan 15, 2025"
            onClick={() => console.log('Budget execution card clicked')}
          />
          
          <EnhancedMetricCard
            title="Revenue Collection"
            value="$12.4M"
            icon={Coins}
            trend={{ value: 8, isPositive: true }}
            updatedAt="Jan 15, 2025"
            onClick={() => console.log('Revenue collection card clicked')}
          />
          
          <EnhancedMetricCard
            title="Debt Ratio"
            value="18.5%"
            icon={CreditCard}
            trend={{ value: 3, isPositive: false }}
            updatedAt="Jan 15, 2025"
            onClick={() => console.log('Debt ratio card clicked')}
          />
        </div>
      </div>

      {/* Data Verification Badge */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Verification Badge</h2>
        <div className="flex items-center space-x-4">
          <DataVerificationBadge status="verified" />
          <DataVerificationBadge status="processing" />
          <DataVerificationBadge status="pending" />
        </div>
      </div>
    </div>
  );
};

export default ComponentDemo;