import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseChart, { SupportedChartType } from './BaseChart';
import chartDataService, { CHART_TYPE_NAMES, CHART_TYPE_DESCRIPTIONS } from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';
import StandardizedSection from '../ui/StandardizedSection';

// Props for the DebtReport Chart component
interface DebtReportChartProps {
  height?: number;
  width?: number | string;
  chartType?: SupportedChartType;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
}

const DebtReportChart: React.FC<DebtReportChartProps> = ({
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
    queryKey: ['chart-data', 'Debt_Report'],
    queryFn: () => chartDataService.loadChartData('Debt_Report'),
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
    console.log('Debt Report data point clicked:', dataPoint);
    // Could open a detail modal or navigate to a detail page
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <StandardizedSection
        title="Cargando datos de deuda"
        description="Obteniendo información del reporte de deuda"
        className={className}
      >
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando datos de deuda...
          </Typography>
        </Box>
      </StandardizedSection>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <StandardizedSection
        title="Error en datos de deuda"
        description="No se pudieron cargar los datos del reporte de deuda"
        className={className}
      >
        <Alert severity="error">
          Error cargando datos de deuda: {error}
        </Alert>
      </StandardizedSection>
    );
  }
  
  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <StandardizedSection
        title="Sin datos de deuda"
        description="No hay datos disponibles para el reporte de deuda"
        className={className}
      >
        <Alert severity="warning">
          No hay datos de deuda disponibles
        </Alert>
      </StandardizedSection>
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
    <StandardizedSection
      title={showTitle ? CHART_TYPE_NAMES.Debt_Report : undefined}
      description={showDescription ? CHART_TYPE_DESCRIPTIONS.Debt_Report : undefined}
      className={className}
    >
      <BaseChart
        data={chartData}
        chartType={chartType}
        xAxisKey="year"
        yAxisKeys={yAxisKeys}
        height={height}
        width={width}
        onDataPointClick={handleDataPointClick}
        xAxisLabel="Año"
        yAxisLabel="Monto (ARS)"
      />
    </StandardizedSection>
  );
};

export default DebtReportChart;