/**
 * Time Series Anomaly Analysis Chart Component
 * Highlights unusual patterns in quarterly budget execution, particularly the Q4 2021 spike
 */

import React, { useState, useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

// Props for the Time Series Anomaly Chart component
interface TimeSeriesAnomalyChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  years?: number[];
}

const TimeSeriesAnomalyChart: React.FC<TimeSeriesAnomalyChartProps> = memo(({
  height = 400,
  width = '100%',
  chartType = 'line', // Default to line for time series
  showTitle = true,
  showDescription = true,
  className = '',
  years
}) => {
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Time_Series_Anomaly', years],
    queryFn: () => chartDataService.loadChartData('Time_Series_Anomaly'),
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
      if (years && years.length > 0) {
        filteredData = filteredData.filter(item => 
          years.includes(Number(item.year))
        );
      }
      
      setLoading(false);
      setError(null);
      setChartData(filteredData);
    }
  }, [data, isLoading, isError, queryError, years]);
  
  // Handle data point clicks
  const handleDataPointClick = (dataPoint: Record<string, unknown>) => {
    console.log('Time Series Anomaly data point clicked:', dataPoint);
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading Time Series Anomaly data...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error loading Time Series Anomaly data: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No Time Series Anomaly data available
      </Alert>
    );
  }
  
  // For time series anomaly analysis, we typically want to show budget amounts over time
  // with special highlighting for anomalies
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
    if (chartData[0].executed || chartData[0].executed_amount) {
      yAxisKeys.push(
        chartData[0].executed ? 'executed' :
        'executed_amount'
      );
    }
    
    // Add any anomaly indicators if available
    if (chartData[0].anomaly_score || chartData[0].z_score) {
      yAxisKeys.push(
        chartData[0].anomaly_score ? 'anomaly_score' : 
        'z_score'
      );
    }
  }
  
  // Default to 'date' or 'period' for x-axis if available, else use 'year'
  const xAxisKey = chartData[0]?.date ? 'date' : 
                   chartData[0]?.period ? 'period' : 
                   chartData[0]?.quarter ? 'quarter' :
                   'year';
  
  return (
    <BaseChart
      data={chartData}
      chartType={chartType}
      xAxisKey={xAxisKey}
      yAxisKeys={yAxisKeys}
      title={showTitle ? "Time Series Anomaly Analysis" : undefined}
      description={showDescription ? "Identifying unusual patterns in quarterly budget execution, including the Q4 2021 spike (+20% in one quarter)" : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel={xAxisKey === 'date' ? 'Date' : xAxisKey === 'quarter' ? 'Quarter' : xAxisKey === 'period' ? 'Period' : 'Year'}
      yAxisLabel="Amount (ARS) / Anomaly Score"
      // Special configuration for anomaly highlighting
      config={{
        referenceLines: [
          {
            y: 90000000, // Example threshold for anomaly detection
            stroke: '#EF4444',
            strokeDasharray: '3 3',
            label: 'Anomaly Threshold'
          }
        ],
        annotations: [
          {
            x: 'Q4 2021',
            y: 90000000,
            text: 'PICO Q4 2021',
            showArrow: true,
            backgroundColor: '#EF4444',
            textColor: 'white'
          }
        ]
      }}
    />
  );
});

TimeSeriesAnomalyChart.displayName = 'TimeSeriesAnomalyChart';

export default TimeSeriesAnomalyChart;