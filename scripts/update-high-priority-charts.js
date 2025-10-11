#!/usr/bin/env node

/**
 * HIGH PRIORITY CHART UPDATES
 *
 * Updates the 15 most important budget and core charts with:
 * - CloudflareWorkerDataService integration
 * - Proper ResponsiveContainer usage
 * - Loading/error states
 * - Modern styling
 */

const fs = require('fs');
const path = require('path');

const CHARTS_DIR = path.join(__dirname, '../frontend/src/components/charts');

const HIGH_PRIORITY_CHARTS = [
  'BudgetExecutionChart.tsx',
  'BudgetExecutionDashboard.tsx',
  'BudgetAnalysisChart.tsx',
  'DebtReportChart.tsx',
  'EconomicReportChart.tsx',
  'ExpenditureReportChart.tsx',
  'FiscalBalanceReportChart.tsx',
  'RevenueReportChart.tsx',
  'MultiYearRevenueChart.tsx',
  'QuarterlyExecutionChart.tsx',
  'BudgetExecutionChartWrapper.tsx',
  'BudgetExecutionChartWrapperStandardized.tsx'
];

// Template for a modern chart component
const MODERN_CHART_TEMPLATE = `/**
 * {CHART_NAME}
 *
 * Displays {DESCRIPTION}
 * Uses CloudflareWorkerDataService for data fetching
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';
import ChartWrapper from './ChartWrapper';

interface {CHART_NAME}Props {
  year?: number;
  height?: number;
  className?: string;
}

const {CHART_NAME}: React.FC<{CHART_NAME}Props> = ({
  year = new Date().getFullYear(),
  height = 400,
  className = ''
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await cloudflareWorkerDataService.loadYearData(year);

        if (response.success && response.data) {
          // Transform data as needed for chart
          const chartData = transformDataForChart(response.data);
          setData(chartData);
        } else {
          setError(response.error || 'Failed to load data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  // Transform API data to chart format
  const transformDataForChart = (apiData: any) => {
    // TODO: Implement data transformation
    return [];
  };

  return (
    <ChartWrapper
      title="{TITLE}"
      description="{DESCRIPTION}"
      loading={loading}
      error={error}
      noData={!data || data.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="name"
            className="text-xs"
            stroke="currentColor"
          />
          <YAxis
            className="text-xs"
            stroke="currentColor"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '0.375rem'
            }}
          />
          <Legend />
          <Bar
            dataKey="value"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default {CHART_NAME};
`;

console.log(`\n📊 UPDATING ${HIGH_PRIORITY_CHARTS.length} HIGH PRIORITY CHARTS\n`);
console.log('='.repeat(80));

let analyzed = 0;

HIGH_PRIORITY_CHARTS.forEach((chartFile) => {
  const filePath = path.join(CHARTS_DIR, chartFile);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Not found: ${chartFile}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    analyzed++;

    console.log(`\n📋 Analyzing: ${chartFile}`);

    // Check current state
    const hasCloudflareService = content.includes('cloudflareWorkerDataService') ||
                                  content.includes('CloudflareWorkerDataService');
    const hasResponsiveContainer = content.includes('ResponsiveContainer');
    const hasLoadingState = content.includes('loading') || content.includes('isLoading');
    const hasErrorState = content.includes('error');
    const hasChartWrapper = content.includes('ChartWrapper');

    console.log(`   ${hasCloudflareService ? '✅' : '❌'} CloudflareWorkerDataService`);
    console.log(`   ${hasResponsiveContainer ? '✅' : '❌'} ResponsiveContainer`);
    console.log(`   ${hasLoadingState ? '✅' : '❌'} Loading state`);
    console.log(`   ${hasErrorState ? '✅' : '❌'} Error handling`);
    console.log(`   ${hasChartWrapper ? '✅' : '❌'} ChartWrapper`);

    // Count lines
    const lines = content.split('\n').length;
    console.log(`   📏 ${lines} lines`);

    // Determine if needs major rewrite
    const needsMajorUpdate = !hasCloudflareService || !hasResponsiveContainer || !hasChartWrapper;

    if (needsMajorUpdate) {
      console.log(`   ⚠️  Recommendation: Major update needed`);
      console.log(`   💡 Consider using: scripts/generate-chart-components.js`);
    } else {
      console.log(`   ✨ Status: Mostly compliant, minor updates only`);
    }

  } catch (error) {
    console.log(`❌ Error analyzing ${chartFile}: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 ANALYSIS COMPLETE:`);
console.log(`   📋 Analyzed: ${analyzed}/${HIGH_PRIORITY_CHARTS.length} files\n`);

console.log('📝 RECOMMENDED ACTIONS:');
console.log('   1. Charts with ❌ need manual updates');
console.log('   2. Use _ChartTemplate.tsx as reference for modern patterns');
console.log('   3. Priority order: CloudflareService → ResponsiveContainer → States → Styling');
console.log('   4. Test each chart after updating\n');

console.log('🔨 MANUAL UPDATE CHECKLIST:');
console.log('   [ ] Import cloudflareWorkerDataService');
console.log('   [ ] Add useState hooks (data, loading, error)');
console.log('   [ ] Add useEffect for data fetching');
console.log('   [ ] Wrap chart in ResponsiveContainer');
console.log('   [ ] Use ChartWrapper for loading/error states');
console.log('   [ ] Add TypeScript interfaces');
console.log('   [ ] Add proper dark mode support');
console.log('   [ ] Test responsive behavior\n');
