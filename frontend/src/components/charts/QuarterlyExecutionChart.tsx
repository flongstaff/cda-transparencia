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
    console.log('Punto de datos de ejecución trimestral seleccionado:', dataPoint);
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos de ejecución trimestral...
        </Typography>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error cargando datos de ejecución trimestral: {error}
      </Alert>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No hay datos de ejecución trimestral disponibles
      </Alert>
    );
  }
  
  // Determine which columns to use as Y-axis keys for combo chart
  // For quarterly execution, we need columns like 'budgeted', 'executed', 'revenue_percentage', 'expenditure_percentage'
  const yAxisKeys: string[] = [];
  
  if (chartData[0]) {
    // Add revenue percentage if available
    if (chartData[0].revenue_percentage || chartData[0].ingresos_porcentaje) {
      yAxisKeys.push(
        chartData[0].revenue_percentage ? 'revenue_percentage' :
        'ingresos_porcentaje'
      );
    }
    
    // Add expenditure percentage if available
    if (chartData[0].expenditure_percentage || chartData[0].gastos_porcentaje) {
      yAxisKeys.push(
        chartData[0].expenditure_percentage ? 'expenditure_percentage' :
        'gastos_porcentaje'
      );
    }
    
    // Add budgeted amount if available (fallback)
    if (chartData[0].budgeted || chartData[0].budgeted_amount || chartData[0].budget) {
      yAxisKeys.push(
        chartData[0].budgeted ? 'budgeted' :
        chartData[0].budgeted_amount ? 'budgeted_amount' : 
        'budget'
      );
    }
    
    // Add executed amount if available (fallback)
    if (chartData[0].executed || chartData[0].executed_amount || chartData[0].executed) {
      yAxisKeys.push(
        chartData[0].executed ? 'executed' :
        chartData[0].executed_amount ? 'executed_amount' : 
        'executed'
      );
    }
  }
  
  // Default to 'quarter' or 'period' for x-axis if available, else use 'year'
  const xAxisKey = chartData[0]?.quarter ? 'quarter' : 
                   chartData[0]?.period ? 'period' : 
                   chartData[0]?.trimestre ? 'trimestre' :
                   'year';
  
  return (
    <BaseChart
      data={chartData}
      chartType={chartType}
      xAxisKey={xAxisKey}
      yAxisKeys={yAxisKeys}
      title={showTitle ? "Tendencias de Ejecución Presupuestaria Trimestral" : undefined}
      description={showDescription ? "Visualización de montos presupuestados vs ejecutados por trimestre con porcentaje de ejecución" : undefined}
      height={height}
      width={width}
      className={className}
      onDataPointClick={handleDataPointClick}
      xAxisLabel={xAxisKey === 'quarter' || xAxisKey === 'trimestre' ? 'Trimestre' : xAxisKey === 'period' ? 'Período' : 'Año'}
      yAxisLabel="Porcentaje (%)"
    />
  );
});

QuarterlyExecutionChart.displayName = 'QuarterlyExecutionChart';

export default QuarterlyExecutionChart;