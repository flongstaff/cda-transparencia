/**
 * Quarterly Execution Trends Chart Component
 * Displays quarterly budget execution trends with combo chart
 */

import React, { useState, useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

// Props for the Quarterly Execution Chart component
interface QuarterlyExecutionChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
}

const QuarterlyExecutionChart: React.FC<QuarterlyExecutionChartProps> = memo(({
  height = 400,
  width = '100%',
  chartType = 'composed', // Default to composed for combo chart
  showTitle = true,
  showDescription = true,
  className = '',
  year
}) => {
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Quarterly_Execution', year],
    queryFn: () => chartDataService.loadChartData('Quarterly_Execution'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
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
      let filteredData = [...data];
      
      // Apply year filter if specified
      if (year) {
        filteredData = filteredData.filter(item => Number(item.year) === year);
      }
      
      setLoading(false);
      setError(null);
      setChartData(filteredData);
    }
  }, [data, isLoading, isError, queryError, year]);
  
  // Handle data point clicks
  const handleDataPointClick = (dataPoint: Record<string, unknown>) => {
    console.log('Quarterly Execution data point clicked:', dataPoint);
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading Quarterly Execution data...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error loading Quarterly Execution data: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No Quarterly Execution data available
      </Alert>
    );
  }
  
  // Determine which columns to use as Y-axis keys for combo chart
  // For budget vs execution, we need columns like 'budgeted', 'executed', 'execution_rate'
  const yAxisKeys: string[] = [];
  
  if (chartData[0]) {
    // Add budgeted amount if available
    if (chartData[0].budgeted || chartData[0].budgeted_amount || chartData[0].budget) {
      yAxisKeys.push(
        chartData[0].budgeted ? 'budgeted' :
        chartData[0].budgeted_amount ? 'budgeted_amount' : 
        'budget'
      );
    }
    
    // Add executed amount if available
    if (chartData[0].executed || chartData[0].executed_amount || chartData[0].executed) {
      yAxisKeys.push(
        chartData[0].executed ? 'executed' :
        chartData[0].executed_amount ? 'executed_amount' : 
        'executed'
      );
    }
    
    // Add execution rate if available
    if (chartData[0]['execution_rate'] || chartData[0]['execution_percentage']) {
      yAxisKeys.push(
        chartData[0]['execution_rate'] ? 'execution_rate' : 
        'execution_percentage'
      );
    }
  }
  
  // Default to 'quarter' or 'period' for x-axis if available, else use 'year'
  const xAxisKey = chartData[0]?.quarter ? 'quarter' : 
                   chartData[0]?.period ? 'period' : 
                   'year';
  
  return (
    <BaseChart
      data={chartData}
      chartType={chartType}
      xAxisKey={xAxisKey}
      yAxisKeys={yAxisKeys}
      title={showTitle ? "Quarterly Budget Execution Trends" : undefined}
      description={showDescription ? "Visualizing quarterly budgeted vs executed amounts with execution percentage" : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel={xAxisKey === 'quarter' ? 'Quarter' : xAxisKey === 'period' ? 'Period' : 'Year'}
      yAxisLabel="Amount (ARS) / Percentage"
    />
  );
});

QuarterlyExecutionChart.displayName = 'QuarterlyExecutionChart';

export default QuarterlyExecutionChart;