#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Chart types and their specific configurations
const chartTypes = [
  { 
    name: 'DebtReport', 
    chartType: 'Debt_Report',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'EconomicReport', 
    chartType: 'Economic_Report',
    yAxisLabel: 'Value',
    xAxisLabel: 'Year'
  },
  { 
    name: 'EducationData', 
    chartType: 'Education_Data',
    yAxisLabel: 'Count/Amount',
    xAxisLabel: 'Year'
  },
  { 
    name: 'ExpenditureReport', 
    chartType: 'Expenditure_Report',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'FinancialReserves', 
    chartType: 'Financial_Reserves',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'FiscalBalanceReport', 
    chartType: 'Fiscal_Balance_Report',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'HealthStatistics', 
    chartType: 'Health_Statistics',
    yAxisLabel: 'Count/Rate',
    xAxisLabel: 'Year'
  },
  { 
    name: 'InfrastructureProjects', 
    chartType: 'Infrastructure_Projects',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'InvestmentReport', 
    chartType: 'Investment_Report',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'PersonnelExpenses', 
    chartType: 'Personnel_Expenses',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'RevenueReport', 
    chartType: 'Revenue_Report',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  },
  { 
    name: 'RevenueSources', 
    chartType: 'Revenue_Sources',
    yAxisLabel: 'Amount (ARS)',
    xAxisLabel: 'Year'
  }
];

// Template for chart components
const template = (chartTypeName, chartType, yAxisLabel, xAxisLabel) => `/**
 * ${chartTypeName.replace(/([A-Z])/g, ' $1').trim()} Chart Component
 * Displays ${chartTypeName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} data
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService, { CHART_TYPE_NAMES, CHART_TYPE_DESCRIPTIONS } from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

// Props for the ${chartTypeName} Chart component
interface ${chartTypeName}ChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
}

const ${chartTypeName}Chart: React.FC<${chartTypeName}ChartProps> = ({
  height = 400,
  width = '100%',
  chartType = 'line',
  showTitle = true,
  showDescription = true,
  className = ''
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', '${chartType}'],
    queryFn: () => chartDataService.loadChartData('${chartType}'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
  
  // Update component state when data changes
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      setError(null);
    } else if (isError) {
      setLoading(false);
      setError(queryError?.message || 'Error loading chart data');
    } else if (data) {
      setLoading(false);
      setError(null);
      setChartData(data);
    }
  }, [data, isLoading, isError, queryError]);
  
  // Handle data point clicks
  const handleDataPointClick = (dataPoint: any) => {
    console.log('${chartTypeName.replace(/([A-Z])/g, ' $1').trim()} data point clicked:', dataPoint);
    // Could open a detail modal or navigate to a detail page
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading ${chartTypeName.replace(/([A-Z])/g, ' $1').trim()} data...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error loading ${chartTypeName.replace(/([A-Z])/g, ' $1').trim()} data: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No ${chartTypeName.replace(/([A-Z])/g, ' $1').trim()} data available
      </Alert>
    );
  }
  
  // Determine which columns to use as Y-axis keys
  // We'll look for numeric columns that represent financial values
  const yAxisKeys = chartData[0] 
    ? Object.keys(chartData[0]).filter(key => 
        key !== 'year' && 
        key !== 'concept' && 
        typeof chartData[0][key] === 'number'
      )
    : [];
  
  return (
    <BaseChart
      data={chartData}
      chartType={chartType}
      xAxisKey="year"
      yAxisKeys={yAxisKeys}
      title={showTitle ? CHART_TYPE_NAMES.${chartType} : undefined}
      description={showDescription ? CHART_TYPE_DESCRIPTIONS.${chartType} : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel="${xAxisLabel}"
      yAxisLabel="${yAxisLabel}"
    />
  );
};

export default ${chartTypeName}Chart;
`;

// Generate all chart components
const chartsDir = path.join(__dirname, '../frontend/src/components/charts');

chartTypes.forEach(chart => {
  const fileName = `${chart.name}Chart.tsx`;
  const filePath = path.join(chartsDir, fileName);
  
  const content = template(
    chart.name, 
    chart.chartType,
    chart.yAxisLabel,
    chart.xAxisLabel
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Generated ${fileName}`);
});

console.log('All chart components generated successfully!');