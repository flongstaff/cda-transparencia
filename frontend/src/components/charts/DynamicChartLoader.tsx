/**
 * Dynamic Chart Loader Component
 * Automatically loads and displays charts based on available data
 * Works with all chart types and handles missing data gracefully
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';
import chartDataService, { CHART_TYPE_NAMES, ChartType } from '../../services/charts/ChartDataService';

// Import all chart components
import BudgetExecutionChart from './BudgetExecutionChart';
import DebtReportChart from './DebtReportChart';
import EconomicReportChart from './EconomicReportChart';
import EducationDataChart from './EducationDataChart';
import ExpenditureReportChart from './ExpenditureReportChart';
import FinancialReservesChart from './FinancialReservesChart';
import FiscalBalanceReportChart from './FiscalBalanceReportChart';
import HealthStatisticsChart from './HealthStatisticsChart';
import InfrastructureProjectsChart from './InfrastructureProjectsChart';
import InvestmentReportChart from './InvestmentReportChart';
import PersonnelExpensesChart from './PersonnelExpensesChart';
import RevenueReportChart from './RevenueReportChart';
import RevenueSourcesChart from './RevenueSourcesChart';
import QuarterlyExecutionChart from './QuarterlyExecutionChart';
import ProgrammaticPerformanceChart from './ProgrammaticPerformanceChart';
import GenderBudgetingChart from './GenderBudgetingChart';
import WaterfallExecutionChart from './WaterfallExecutionChart';

// Map chart types to components
interface ChartComponentProps {
  height?: number;
  width?: number | string;
  chartType?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
}

const CHART_COMPONENTS: Record<string, React.ComponentType<ChartComponentProps>> = {
  'Budget_Execution': BudgetExecutionChart,
  'Debt_Report': DebtReportChart,
  'Economic_Report': EconomicReportChart,
  'Education_Data': EducationDataChart,
  'Expenditure_Report': ExpenditureReportChart,
  'Financial_Reserves': FinancialReservesChart,
  'Fiscal_Balance_Report': FiscalBalanceReportChart,
  'Health_Statistics': HealthStatisticsChart,
  'Infrastructure_Projects': InfrastructureProjectsChart,
  'Investment_Report': InvestmentReportChart,
  'Personnel_Expenses': PersonnelExpensesChart,
  'Revenue_Report': RevenueReportChart,
  'Revenue_Sources': RevenueSourcesChart,
  'Quarterly_Execution': QuarterlyExecutionChart,
  'Programmatic_Performance': ProgrammaticPerformanceChart,
  'Gender_Budgeting': GenderBudgetingChart,
  'Waterfall_Execution': WaterfallExecutionChart
};

// Props for the Dynamic Chart Loader component
interface DynamicChartLoaderProps {
  chartType: string;
  height?: number;
  width?: number | string;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
}

const DynamicChartLoader: React.FC<DynamicChartLoaderProps> = ({
  chartType,
  height = 400,
  width = '100%',
  showTitle = true,
  showDescription = true,
  className = '',
  year
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);

  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', chartType, year],
    queryFn: () => chartDataService.loadChartData(chartType as ChartType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Retry once on failure
  });

  // Update component state when data changes
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      setError(null);
      setHasData(false);
    } else if (isError) {
      setLoading(false);
      setError(queryError?.message || `Error loading data for ${CHART_TYPE_NAMES[chartType as keyof typeof CHART_TYPE_NAMES] || chartType}`);
      setHasData(false);
    } else if (data) {
      setLoading(false);
      setError(null);
      setHasData(data.length > 0);
    }
  }, [data, isLoading, isError, queryError, chartType]);

  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos de {CHART_TYPE_NAMES[chartType as keyof typeof CHART_TYPE_NAMES] || chartType}...
        </Typography>
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Alert severity="error" className={className}>
        Error cargando datos de {CHART_TYPE_NAMES[chartType as keyof typeof CHART_TYPE_NAMES] || chartType}: {error}
      </Alert>
    );
  }

  // Show no data message
  if (!hasData) {
    return (
      <Alert severity="warning" className={className}>
        No hay datos disponibles para {CHART_TYPE_NAMES[chartType as keyof typeof CHART_TYPE_NAMES] || chartType}
      </Alert>
    );
  }

  // Get the appropriate chart component
  const ChartComponent = CHART_COMPONENTS[chartType];
  
  // If we don't have a specific component for this chart type, show an error
  if (!ChartComponent) {
    return (
      <Alert severity="warning" className={className}>
        Componente de gráfico no encontrado para {CHART_TYPE_NAMES[chartType as keyof typeof CHART_TYPE_NAMES] || chartType}
      </Alert>
    );
  }

  // Render the chart component with the loaded data
  return (
    <ChartComponent
      height={height}
      width={width}
      showTitle={showTitle}
      showDescription={showDescription}
      className={className}
      year={year}
    />
  );
};

export default DynamicChartLoader;