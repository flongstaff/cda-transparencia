/** 
 * Budget Execution Chart - Wrapper component using Chart Data Service
 * Loads data from consolidated CSV file and passes to the visualization component
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BudgetExecutionChart from './BudgetExecutionChart';
import chartDataService from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

// Define the expected data structure
interface BudgetExecutionData {
  sector: string;
  budget: number;
  execution: number;
  execution_rate?: number;
  [key: string]: unknown;
}

// Props for the Budget Execution Chart wrapper
interface BudgetExecutionChartWrapperProps {
  height?: number;
  width?: number | string;
  chartType?: 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'composed';
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
}

const BudgetExecutionChartWrapper: React.FC<BudgetExecutionChartWrapperProps> = ({
  height = 500,
  className = '',
  year
}) => {
  const [chartData, setChartData] = useState<BudgetExecutionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Budget_Execution'],
    queryFn: () => chartDataService.loadChartData('Budget_Execution'),
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
      // Transform the raw data to match BudgetExecutionChart expectations
      // Group by sector and aggregate budgeted/executed amounts
      const filteredData = year ? data.filter(item => 
        item.year === year || item.year === String(year)
      ) : data;
      
      // Group by sector and aggregate budgeted/executed amounts
      const transformedData = filteredData.reduce((acc: BudgetExecutionData[], row: Record<string, unknown>) => {
        const sectorKey = row.Concept || row.concept || row.sector || 'Unknown';
        const existingSectorIndex = acc.findIndex(item => item.sector === sectorKey);
        
        if (existingSectorIndex !== -1) {
          acc[existingSectorIndex].budget += parseFloat(row.Budgeted?.replace(/[$,]/g, '')?.replace('ARS', '') || '0');
          acc[existingSectorIndex].execution += parseFloat(row.Executed?.replace(/[$,]/g, '')?.replace('ARS', '') || '0');
        } else {
          acc.push({
            sector: sectorKey,
            budget: parseFloat(row.Budgeted?.replace(/[$,]/g, '')?.replace('ARS', '') || '0') || 0,
            execution: parseFloat(row.Executed?.replace(/[$,]/g, '')?.replace('ARS', '') || '0') || 0,
            execution_rate: parseFloat(row.Percentage?.replace('%', '') || '0') || 0
          });
        }
        
        return acc;
      }, []);

      setChartData(transformedData);
    }
  }, [data, isLoading, isError, queryError, year]); // Removed handleDataPointClick since it's not used in the effect

  

  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading Budget Execution data...
        </Typography>
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error loading Budget Execution data: {error}
      </Alert>
    );
  }

  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No Budget Execution data available
      </Alert>
    );
  }

  return (
    <BudgetExecutionChart
      data={chartData}
      year={year || new Date().getFullYear()}
      height={height}
      className={className}
    />
  );
};

export default BudgetExecutionChartWrapper;