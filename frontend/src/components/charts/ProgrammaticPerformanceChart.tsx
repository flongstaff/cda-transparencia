/**
 * Programmatic Performance Chart Component
 * Displays programmatic performance metrics using category_caif.csv data
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

// Props for the Programmatic Performance Chart component
interface ProgrammaticPerformanceChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
  indicator?: string; // e.g., 'families_assisted', 'security_cameras', etc.
}

const ProgrammaticPerformanceChart: React.FC<ProgrammaticPerformanceChartProps> = ({
  height = 400,
  width = '100%',
  chartType = 'line',
  showTitle = true,
  showDescription = true,
  className = '',
  year,
  indicator
}) => {
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Programmatic_Performance', year, indicator],
    queryFn: () => chartDataService.loadChartData('Programmatic_Performance'),
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
      
      // Apply indicator filter if specified
      if (indicator) {
        filteredData = filteredData.filter(item => 
          String(item.indicator || item.name).toLowerCase().includes(indicator.toLowerCase())
        );
      }
      
      setLoading(false);
      setError(null);
      setChartData(filteredData);
    }
  }, [data, isLoading, isError, queryError, year, indicator]);
  
  // Handle data point clicks
  const handleDataPointClick = (dataPoint: Record<string, unknown>) => {
    console.log('Programmatic Performance data point clicked:', dataPoint);
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos de Rendimiento Programático...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error cargando datos de Rendimiento Programático: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No hay datos disponibles de Rendimiento Programático
      </Alert>
    );
  }
  
  // Determine which columns to use as Y-axis keys
  // For programmatic performance, we look for planned vs executed metrics
  const yAxisKeys: string[] = [];
  
  if (chartData[0]) {
    // Add planned amount if available
    if (chartData[0].planned || chartData[0].planned_value || chartData[0].plan) {
      yAxisKeys.push(
        chartData[0].planned ? 'planned' :
        chartData[0].planned_value ? 'planned_value' : 
        'plan'
      );
    }
    
    // Add executed amount if available
    if (chartData[0].executed || chartData[0].executed_value || chartData[0].executed) {
      yAxisKeys.push(
        chartData[0].executed ? 'executed' :
        chartData[0].executed_value ? 'executed_value' : 
        'executed'
      );
    }
    
    // Add execution rate if available
    if (chartData[0].execution_rate || chartData[0].execution_percentage) {
      yAxisKeys.push(
        chartData[0].execution_rate ? 'execution_rate' : 
        'execution_percentage'
      );
    }
  }
  
  // Default to 'quarterLabel' if available, else fall back to 'quarter' or 'period' for x-axis if available, else use 'indicator'
  const xAxisKey = chartData[0]?.quarterLabel ? 'quarterLabel' : 
                   chartData[0]?.quarter ? 'quarter' : 
                   chartData[0]?.period ? 'period' : 
                   chartData[0]?.indicator ? 'indicator' : 
                   chartData[0]?.name ? 'name' : 
                   'year';
  
  return (
    <BaseChart
      data={chartData}
      chartType={chartType}
      xAxisKey={xAxisKey}
      yAxisKeys={yAxisKeys}
      title={showTitle ? "Rendimiento Programático" : undefined}
      description={showDescription ? "Seguimiento de indicadores programáticos desde datos de category_caif.csv" : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel={xAxisKey === 'quarterLabel' || xAxisKey === 'quarter' || xAxisKey === 'trimestre' ? 'Trimestre' : 
                  xAxisKey === 'period' ? 'Período' : 
                  xAxisKey === 'indicator' ? 'Indicador' : 
                  xAxisKey === 'name' ? 'Programa' : 'Año'}
      yAxisLabel="Valor / Porcentaje"
    />
  );
};

export default ProgrammaticPerformanceChart;