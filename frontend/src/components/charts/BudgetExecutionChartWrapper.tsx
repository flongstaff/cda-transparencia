/** 
 * Budget Execution Chart - Wrapper component using Chart Data Service
 * Loads data from consolidated CSV file and passes to the visualization component
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BudgetExecutionChart from './BudgetExecutionChart';
import chartDataService from '../../services/charts/ChartDataService';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

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

  // Load chart data using React Query (include year in cache key for proper invalidation)
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Budget_Execution', year],
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
      
      // Filter data by year if specified
      let filteredData = data;
      if (year) {
        filteredData = data.filter((item: Record<string, unknown>) => {
          // Check for various possible year field names
          const itemYear = item.year || item.Year || item.YEAR || item.año || item.Año || item['año'] || item['Year'];
          return itemYear && parseInt(String(itemYear)) === year;
        });
      }
      
      // Group by sector and aggregate budgeted/executed amounts
      const transformedData = filteredData.reduce((acc: BudgetExecutionData[], row: Record<string, unknown>) => {
        // Check for various possible sector/concept field names
        const sectorKey = row.Concept || row.concept || row.sector || row.Sector || row.Area || row.area || row['Área'] || row['area'] || 'Unknown';
        
        const existingSectorIndex = acc.findIndex(item => item.sector === sectorKey);
        
        // Check for various possible budget and execution field names
        const budgetValue = row.Budgeted || row.budgeted || row.Budget || row.budget || row.Presupuesto || row.presupuesto || 0;
        const executionValue = row.Executed || row.executed || row.Executed || row.executed || row.Ejecutado || row.ejecutado || 0;
        const percentageValue = row.Percentage || row.percentage || row.Percentage || row.porcentaje || row.Porcentaje || 0;
        
        if (existingSectorIndex !== -1) {
          acc[existingSectorIndex].budget += parseFloat(String(budgetValue).replace(/[$,]/g, '')?.replace('ARS', '') || '0');
          acc[existingSectorIndex].execution += parseFloat(String(executionValue).replace(/[$,]/g, '')?.replace('ARS', '') || '0');
          // Update execution rate if it exists
          if (typeof row.execution_rate !== 'undefined') {
            acc[existingSectorIndex].execution_rate = parseFloat(String(percentageValue).replace('%', '') || '0');
          }
        } else {
          acc.push({
            sector: String(sectorKey),
            budget: parseFloat(String(budgetValue).replace(/[$,]/g, '')?.replace('ARS', '') || '0') || 0,
            execution: parseFloat(String(executionValue).replace(/[$,]/g, '')?.replace('ARS', '') || '0') || 0,
            execution_rate: parseFloat(String(percentageValue).replace('%', '') || '0') || 0
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
          Cargando datos de Ejecución Presupuestaria...
        </Typography>
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error cargando datos de Ejecución Presupuestaria: {error}
      </Alert>
    );
  }

  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        No hay datos disponibles de Ejecución Presupuestaria
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