import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';
import BudgetExecutionChart from './BudgetExecutionChart';
import StandardizedSection from '../ui/StandardizedSection';
import StandardizedDataDisplay from '../ui/StandardizedDataDisplay';
import { formatCurrencyARS, formatPercentageARS } from '../../utils/formatters';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

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

// Define the expected data structure
interface BudgetExecutionData {
  sector: string;
  budget: number;
  execution: number;
  execution_rate?: number;
  [key: string]: unknown;
}

const BudgetExecutionChartWrapper: React.FC<BudgetExecutionChartWrapperProps> = ({
  height = 500,
  className = '',
  year
}) => {
  const [chartData, setChartData] = useState<BudgetExecutionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalExecution, setTotalExecution] = useState<number>(0);
  const [averageExecutionRate, setAverageExecutionRate] = useState<number>(0);

  // Load chart data using React Query
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['chart-data', 'Budget_Execution'],
    queryFn: () => fetch('/data/charts/Budget_Execution_consolidated_2019-2025.csv').then(res => res.text()),
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
      
      // Transform raw CSV data to match BudgetExecutionChart expectations
      try {
        const csvText = data as string;
        const lines = csvText.split('\n').slice(1).filter(line => line.trim());
        
        const transformedData: BudgetExecutionData[] = [];
        let totalBudgetSum = 0;
        let totalExecutionSum = 0;
        let validEntries = 0;

        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 5) {
            const yearValue = parseInt(parts[4]);
            if (!year || yearValue === year) {
              const budgetStr = parts[1].replace(/[$",]/g, '');
              const executionStr = parts[2].replace(/[$",]/g, '');
              
              const budget = parseFloat(budgetStr) || 0;
              const execution = parseFloat(executionStr) || 0;
              
              if (budget > 0 || execution > 0) {
                transformedData.push({
                  sector: parts[0] || 'Sector no especificado',
                  budget,
                  execution,
                  execution_rate: budget > 0 ? (execution / budget) * 100 : 0
                });
                
                totalBudgetSum += budget;
                totalExecutionSum += execution;
                validEntries++;
              }
            }
          }
        });

        setChartData(transformedData);
        setTotalBudget(totalBudgetSum);
        setTotalExecution(totalExecutionSum);
        setAverageExecutionRate(validEntries > 0 ? (totalExecutionSum / totalBudgetSum) * 100 : 0);
      } catch (err) {
        console.error('Error transforming data:', err);
        setError('Error processing chart data');
        setChartData([]);
      }
    }
  }, [data, isLoading, isError, queryError, year]);

  // Show loading spinner
  if (loading) {
    return (
      <StandardizedSection
        title="Cargando datos de ejecución presupuestaria"
        description="Procesando información de presupuesto y ejecución"
        className={className}
      >
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando datos de ejecución presupuestaria...
          </Typography>
        </Box>
      </StandardizedSection>
    );
  }

  // Show error message
  if (error) {
    return (
      <StandardizedSection
        title="Error en ejecución presupuestaria"
        description="No se pudieron cargar los datos de ejecución"
        className={className}
      >
        <Alert severity="error">
          Error cargando datos de ejecución presupuestaria: {error}
        </Alert>
      </StandardizedSection>
    );
  }

  // Show no data message
  if (!chartData || chartData.length === 0) {
    return (
      <StandardizedSection
        title="Sin datos de ejecución"
        description="No hay datos disponibles para mostrar"
        className={className}
      >
        <Alert severity="warning">
          No hay datos de ejecución presupuestaria disponibles
        </Alert>
      </StandardizedSection>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StandardizedDataDisplay
          title="Presupuesto Total"
          value={formatCurrencyARS(totalBudget)}
          description="Presupuesto aprobado para el período"
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
          size="lg"
        />
        
        <StandardizedDataDisplay
          title="Ejecutado"
          value={formatCurrencyARS(totalExecution)}
          description={`Tasa de ejecución: ${formatPercentageARS(averageExecutionRate)}`}
          trend={averageExecutionRate > 95 ? 5 : averageExecutionRate > 85 ? 0 : -10}
          trendLabel="vs esperado"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          size="lg"
        />
        
        <StandardizedDataDisplay
          title="Disponibilidad"
          value={formatCurrencyARS(totalBudget - totalExecution)}
          description="Presupuesto pendiente de ejecutar"
          icon={<BarChart3 className="w-5 h-5" />}
          color="orange"
          size="lg"
        />
      </div>

      {/* Main Chart */}
      <StandardizedSection
        title={`Ejecución Presupuestaria ${year || 'Histórica'}`}
        description="Comparación entre presupuesto aprobado y ejecutado por sector"
      >
        <BudgetExecutionChart
          data={chartData}
          year={year || new Date().getFullYear()}
          className="h-80"
        />
      </StandardizedSection>

      {/* Key Insights */}
      <StandardizedSection
        title="Insights Clave"
        description="Análisis automatizado de datos presupuestarios"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🔍 Ejecución Alta ({'>'}95%)
            </h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Puede indicar devengado vs pagado. Verificar si se traduce en obras reales.
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
              ⚠️ Ejecución Baja ({'<'}85%)
            </h4>
            <p className="text-orange-700 dark:text-orange-300 text-sm">
              Revisar sectores con baja ejecución. Pueden indicar problemas de planificación.
            </p>
          </div>
        </div>
      </StandardizedSection>
    </div>
  );
};

export default BudgetExecutionChartWrapper;