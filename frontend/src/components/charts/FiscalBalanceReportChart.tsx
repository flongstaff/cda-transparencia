/**
 * Fiscal Balance Report Chart Component
 * Displays fiscal balance report data
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService, { CHART_TYPE_NAMES, CHART_TYPE_DESCRIPTIONS } from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

// Props for the FiscalBalanceReport Chart component
interface FiscalBalanceReportChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number; // Optional year filter
}

const FiscalBalanceReportChart: React.FC<FiscalBalanceReportChartProps> = ({
  height = 400,
  width = '100%',
  chartType = 'line',
  showTitle = true,
  showDescription = true,
  className = '',
  year
}) => {
  interface FiscalBalanceData {
    Column_0: string;
    Column_1: string | number;
    Column_2: string | number;
    Column_3: string | number;
    year: number;
  }

  const [chartData, setChartData] = useState<FiscalBalanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Fiscal_Balance_Report', year],
    queryFn: () => chartDataService.loadChartData('Fiscal_Balance_Report'),
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

      // Filter data by year if specified
      let filteredData = data;
      if (year && Array.isArray(data)) {
        filteredData = data.filter((item: Record<string, unknown>) => {
          // Check for various possible year field names
          const itemYear = item.year || item.Year || item.YEAR || item.año || item.Año || item['año'] || item['Year'];
          return itemYear && parseInt(String(itemYear)) === year;
        });
      }

      setChartData(filteredData);
    }
  }, [data, isLoading, isError, queryError, year]);
  
  // Handle data point clicks
  const handleDataPointClick = (dataPoint: FiscalBalanceData) => {
    console.log('Fiscal Balance Report data point clicked:', dataPoint);
    // Could open a detail modal or navigate to a detail page
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos del Balance Fiscal...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error cargando datos del Balance Fiscal: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No hay datos disponibles del Balance Fiscal
      </Alert>
    );
  }
  
  // Determine which columns to use as Y-axis keys
  // We'll look for numeric columns that represent financial values
  const yAxisKeys = chartData.length > 0
    ? Object.keys(chartData[0]).filter(key => {
        if (key === 'year' || key === 'concept') return false;
        const value = (chartData[0] as any)[key];
        return typeof value === 'number' || (!isNaN(Number(value)) && value !== '' && value !== null);
      })
    : [];
  
  return (
    <BaseChart
      data={chartData}
      chartType={chartType}
      xAxisKey="year"
      yAxisKeys={yAxisKeys}
      title={showTitle ? CHART_TYPE_NAMES.Fiscal_Balance_Report : undefined}
      description={showDescription ? CHART_TYPE_DESCRIPTIONS.Fiscal_Balance_Report : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel="Año"
      yAxisLabel="Monto (ARS)"
    />
  );
};

export default FiscalBalanceReportChart;
