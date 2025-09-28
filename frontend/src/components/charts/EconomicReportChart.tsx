/**
 * Economic Report Chart Component
 * Displays economic report data
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService, { CHART_TYPE_NAMES, CHART_TYPE_DESCRIPTIONS } from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

// Props for the EconomicReport Chart component
interface EconomicReportChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
}

const EconomicReportChart: React.FC<EconomicReportChartProps> = ({
  height = 400,
  width = '100%',
  chartType = 'line',
  showTitle = true,
  showDescription = true,
  className = ''
}) => {
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Economic_Report'],
    queryFn: () => chartDataService.loadChartData('Economic_Report'),
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
      setLoading(false);
      setError(null);
      setChartData(data);
    }
  }, [data, isLoading, isError, queryError]);
  
  // Handle data point clicks
  const handleDataPointClick = (dataPoint: Record<string, unknown>) => {
    console.log('Economic Report data point clicked:', dataPoint);
    // Could open a detail modal or navigate to a detail page
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading Economic Report data...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error loading Economic Report data: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No Economic Report data available
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
      title={showTitle ? CHART_TYPE_NAMES.Economic_Report : undefined}
      description={showDescription ? CHART_TYPE_DESCRIPTIONS.Economic_Report : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel="Year"
      yAxisLabel="Value"
    />
  );
};

export default EconomicReportChart;
