import React, { useState, useEffect, useMemo, useCallback } from 'react';
import UniversalChart from './UniversalChart';
import { consolidatedApiService } from '../../services';
import { STRINGS } from '../../constants/strings';
import { z } from 'zod';

interface BudgetAnalysisChartProps {
  year: number;
}

interface BudgetItem {
  name: string;
  value: number;
  budgeted?: number;
  executed?: number;
  source?: string;
}

// Zod schema for runtime validation
const BudgetDataSchema = z.object({
  total_budgeted: z.number(),
  total_executed: z.number(),
  categories: z.record(z.object({
    budgeted: z.number().optional(),
    executed: z.number().optional()
  })).optional()
});

const BudgetAnalysisChart: React.FC<BudgetAnalysisChartProps> = ({ year }) => {
  const [data, setData] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize chart data transformation
  const chartData = useMemo(() => {
    return data;
  }, [data]);

  // Debounced loading function with retry logic
  const loadBudgetData = useCallback(async () => {
    const CACHE_KEY = `budget_${year}`;
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setData(parsed);
      }

      const budgetData = await consolidatedApiService.getBudgetData(year);
      
      // Validate data structure
      BudgetDataSchema.parse(budgetData);

      // Transform budget data for chart display
      const transformedData: BudgetItem[] = [
        {
          name: STRINGS.chartTotal,
          value: budgetData.total_budgeted,
          budgeted: budgetData.total_budgeted,
          executed: budgetData.total_executed,
          source: STRINGS.chartSourceOfficial
        }
      ];

      // Add categories if available
      if (budgetData.categories && typeof budgetData.categories === 'object') {
        const categoryData = Object.entries(budgetData.categories)
          .slice(0, 6)
          .map(([categoryName, categoryData]) => ({
            name: categoryName,
            value: categoryData.executed || 0,
            budgeted: categoryData.budgeted || 0,
            executed: categoryData.executed || 0,
            source: STRINGS.chartSourceCategories
          }));
        transformedData.push(...categoryData);
      }

      setData(transformedData);
      
      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(transformedData));
      
    } catch (err) {
      console.error('[BudgetAnalysisChart] Error loading budget data:', err);
      
      // Try to load from cache as fallback
      const CACHE_KEY = `budget_${year}`;
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setData(JSON.parse(cached));
        setError(STRINGS.errorFallback);
      } else {
        setError(STRINGS.errorLoad);
        // Set fallback data
        setData([
          {
            name: STRINGS.noData,
            value: 0,
            source: STRINGS.noConnection
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [year]);

  // Effect with timeout handling
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setError(STRINGS.loadingTimeout);
        setLoading(false);
      }
    }, 15000); // 15s timeout

    loadBudgetData();

    return () => clearTimeout(timer);
  }, [year, loadBudgetData, loading]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">{STRINGS.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <UniversalChart
      data={chartData}
      chartType="bar"
      title={`Análisis Presupuestario ${year}`}
      xAxisDataKey="name"
      yAxisDataKey="value"
      height={400}
      timeRange={`${year}`}
      sources={[STRINGS.sourcePortal]}
      additionalSeries={[
        { dataKey: 'budgeted', name: STRINGS.seriesBudgeted, color: '#3b82f6' },
        { dataKey: 'executed', name: STRINGS.seriesExecuted, color: '#10b981' }
      ]}
      metadata={{
        dataQuality: 'HIGH',
        lastUpdated: new Date().toISOString(),
        source: 'municipal_budget_data'
      }}
      onRetry={loadBudgetData}
      error={error}
    />
  );
};

export default BudgetAnalysisChart;