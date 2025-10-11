/**
 * Revenue Sources Chart Component
 * Displays revenue sources data
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService, { CHART_TYPE_NAMES, CHART_TYPE_DESCRIPTIONS } from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

// Props for the RevenueSources Chart component
interface RevenueSourcesChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number; // Optional year filter
  data?: any; // Optional data prop to override default data loading
}

const RevenueSourcesChart: React.FC<RevenueSourcesChartProps> = ({
  height = 400,
  width = '100%',
  chartType = 'line',
  showTitle = true,
  showDescription = true,
  className = '',
  year
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chart data using React Query or use provided data
  const { data: queryData, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Revenue_Sources', year],
    queryFn: () => chartDataService.loadChartData('Revenue_Sources'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !data // Only run query if no data prop is provided
  });
  
  // Use provided data or query data
  const effectiveData = data || queryData;
  
  // Update component state when data changes
  useEffect(() => {
    if (isLoading && !data) {
      setLoading(true);
      setError(null);
    } else if (isError && !data) {
      setLoading(false);
      setError(queryError?.message || 'Error loading chart data');
    } else if (effectiveData || data) {
      setLoading(false);
      setError(null);

      // Filter data by year if specified
      let filteredData = effectiveData;
      if (year && Array.isArray(effectiveData)) {
        filteredData = effectiveData.filter((item: Record<string, unknown>) => {
          // Check for various possible year field names
          const itemYear = item.year || item.Year || item.YEAR || item.año || item.Año || item['año'] || item['Year'];
          return itemYear && parseInt(String(itemYear)) === year;
        });
      }

      setChartData(filteredData);
    }
  }, [effectiveData, isLoading, isError, queryError, year, data]);
  
  // Handle data point clicks
  const handleDataPointClick = (dataPoint: any) => {
    console.log('Revenue Sources data point clicked:', dataPoint);
    // Could open a detail modal or navigate to a detail page
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos de Fuentes de Ingresos...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error cargando datos de Fuentes de Ingresos: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No hay datos disponibles de Fuentes de Ingresos
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
      title={showTitle ? CHART_TYPE_NAMES.Revenue_Sources : undefined}
      description={showDescription ? CHART_TYPE_DESCRIPTIONS.Revenue_Sources : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel="Año"
      yAxisLabel="Monto (ARS)"
    />
  );
};

export default RevenueSourcesChart;
