/**
 * Procurement Timeline Analysis Chart Component
 * Analyzes the concentration of tenders in November 2023 and other procurement patterns
 */

import React, { useState, useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

// Props for the Procurement Timeline Chart component
interface ProcurementTimelineChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  years?: number[];
}

const ProcurementTimelineChart: React.FC<ProcurementTimelineChartProps> = memo(({
  height = 400,
  width = '100%',
  chartType = 'scatter', // Default to scatter for timeline analysis
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
    queryKey: ['chart-data', 'Procurement_Timeline', years],
    queryFn: () => chartDataService.loadChartData('Procurement_Timeline'),
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
    console.log('Procurement Timeline data point clicked:', dataPoint);
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading Procurement Timeline data...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error loading Procurement Timeline data: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No Procurement Timeline data available
      </Alert>
    );
  }
  
  // For procurement timeline analysis, we want to show tender dates, values, and categories
  const yAxisKeys: string[] = [];
  
  if (chartData[0]) {
    // Add tender value if available
    if (chartData[0].value || chartData[0].amount || chartData[0].tender_value) {
      yAxisKeys.push(
        chartData[0].value ? 'value' :
        chartData[0].amount ? 'amount' : 
        'tender_value'
      );
    }
    
    // Add tender category if available
    if (chartData[0].category || chartData[0].type) {
      yAxisKeys.push(
        chartData[0].category ? 'category' :
        'type'
      );
    }
  }
  
  // Default to 'date' for x-axis if available
  const xAxisKey = chartData[0]?.date ? 'date' : 
                   chartData[0]?.tender_date ? 'tender_date' : 
                   'year';
  
  return (
    <BaseChart
      data={chartData}
      chartType={chartType}
      xAxisKey={xAxisKey}
      yAxisKeys={yAxisKeys}
      title={showTitle ? "Procurement Timeline Analysis" : undefined}
      description={showDescription ? "Analyzing tender concentration patterns, particularly the November 2023 cluster (5 tenders in 15 days)" : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel={xAxisKey === 'date' || xAxisKey === 'tender_date' ? 'Date' : 'Year'}
      yAxisLabel="Tender Value (ARS) / Category"
      // Special configuration for procurement timeline highlighting
      config={{
        // Size encoding for tender values
        sizeKey: chartData[0]?.value ? 'value' : 
                 chartData[0]?.amount ? 'amount' : 
                 chartData[0]?.tender_value ? 'tender_value' : undefined,
        // Color encoding for categories
        colorKey: chartData[0]?.category ? 'category' : 
                  chartData[0]?.type ? 'type' : undefined,
        referenceAreas: [
          {
            x1: '2023-11-01',
            x2: '2023-11-30',
            fill: '#F59E0B',
            fillOpacity: 0.2,
            stroke: '#F59E0B',
            strokeWidth: 1,
            label: 'Noviembre 2023 (Cluster)'
          }
        ],
        annotations: [
          {
            x: '2023-11-15',
            y: 20000000, // Position near high-value tenders
            text: '5 LICITACIONES EN 15 DÍAS',
            showArrow: true,
            backgroundColor: '#EF4444',
            textColor: 'white'
          }
        ]
      }}
    />
  );
});

ProcurementTimelineChart.displayName = 'ProcurementTimelineChart';

export default ProcurementTimelineChart;