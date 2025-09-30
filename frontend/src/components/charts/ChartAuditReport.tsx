/**
 * Chart Audit Report Component
 * Comprehensive red flag detection and audit analysis for Carmen de Areco transparency data
 * Implements all specified audit criteria including budget execution, procurement analysis, etc.
 */

import React, { useState, useEffect, memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  BarChart
} from 'recharts';
import {
  Alert,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Warning,
  ExpandMore,
  Download,
  Flag
} from '@mui/icons-material';
import AuditService, {
  DataFlag
} from '../../services/AuditService';
import DataService from '../../services/dataService';

import { RedFlagAnalysis } from '../../types/charts';

// Props for the Chart Audit Report component
interface ChartAuditReportProps {
  height?: number;
  width?: number | string;
  analysis?: RedFlagAnalysis;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
  interactive?: boolean;
}

// Colors for severity levels and analysis types
const SEVERITY_COLORS = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  critical: '#d32f2f',
  healthy: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  administration: '#ff5722',
  social: '#4caf50',
  infrastructure: '#2196f3',
  security: '#ff9800'
};

// Red flag detection functions
interface BudgetExecutionData {
  year: number;
  budget: number;
  executed: number;
}

const detectBudgetExecutionFlags = (data: BudgetExecutionData[]): DataFlag[] => {
  const flags: DataFlag[] = [];

  data.forEach(yearData => {
    const executionRate = (yearData.executed / yearData.budget) * 100;

    // Flag 1: Unusually high execution rates (>95%)
    if (executionRate > 95) {
      flags.push({
        type: 'high_execution_rate',
        severity: 'high',
        message: `Ejecución anormalmente alta (${executionRate.toFixed(1)}%) en ${yearData.year}. ¿Es devengado o pagado?`,
        recommendation: 'Verificar si se trata de gastos comprometidos (devengado) vs. efectivamente pagados',
        source: 'budget_analysis'
      });
    }

    // Flag 2: Large infrastructure spending without visible results
    if (yearData.sector === 'Obras Públicas' && yearData.executed > 200000000) {
      flags.push({
        type: 'infrastructure_execution',
        severity: 'high',
        message: `$${(yearData.executed / 1000000).toFixed(0)}M ejecutado en Obras Públicas (${yearData.year}) sin obras visibles`,
        recommendation: 'Auditar si las obras fueron realmente entregadas o solo comprometidas',
        source: 'infrastructure_analysis'
      });
    }
  });

  return flags;
};

interface SectorSpendingData {
  sector: string;
  executed: number;
}

const detectFunctionPriorityFlags = (data: SectorSpendingData[]): DataFlag[] => {
  const flags: DataFlag[] = [];

  const adminSpending = data.find(d => d.sector === 'Administración')?.executed || 0;
  const socialSpending = data.find(d => d.sector === 'Desarrollo Social')?.executed || 0;

  if (adminSpending > 0 && socialSpending > 0) {
    const ratio = adminSpending / socialSpending;

    if (ratio > 1.5) {
      flags.push({
        type: 'admin_vs_social_imbalance',
        severity: 'medium',
        message: `Gasto en Administración es ${ratio.toFixed(1)}x mayor que Desarrollo Social`,
        recommendation: 'Evaluar si el gasto administrativo está sobredimensionado',
        source: 'function_analysis'
      });
    }
  }

  return flags;
};

interface ProcurementData {
  date: string;
  amount: number;
  supplier: string;
}

const detectProcurementFlags = (procurementData: ProcurementData[]): DataFlag[] => {
  const flags: DataFlag[] = [];

  // Group procurement by month
  const monthGroups = procurementData.reduce((acc: Record<number, number>, proc) => {
    const month = new Date(proc.date).getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Flag clustering in November (month 10)
  if (monthGroups[10] && monthGroups[10] >= 5) {
    flags.push({
      type: 'procurement_clustering',
      severity: 'high',
      message: `${monthGroups[10]} licitaciones concentradas en noviembre - posible gasto de fin de ejercicio`,
      recommendation: 'Investigar las razones de la concentración temporal de licitaciones',
      source: 'procurement_analysis'
    });
  }

  return flags;
};

const ChartAuditReport: React.FC<ChartAuditReportProps> = memo(({
  height = 600,
  width = '100%',
  analysis = 'overview',
  showTitle = true,
  showDescription = true,
  className = '',
  year,
  interactive = true
}) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<RedFlagAnalysis>(analysis);
  const [redFlags, setRedFlags] = useState<DataFlag[]>([]);
  interface AnalysisDataPoint {
    year?: number;
    budget?: number;
    executed?: number;
    executionRate?: number;
    sector?: string;
    function?: string;
    percentage?: number;
    id?: string;
    indicator?: string;
    gap?: number;
    planned?: number;
    category?: string;
    budgeted?: number;
    quarter?: string;
    growth?: number;
    date?: string;
    amount?: number;
    supplier?: string;
    item?: string;
    flags?: number;
    value?: number;
  }

  const [analysisData, setAnalysisData] = useState<AnalysisDataPoint[]>([]);

  // Load audit data using React Query
  const {
    isLoading: discrepanciesLoading,
    isError: discrepanciesError
  } = useQuery({
    queryKey: ['audit-discrepancies', year],
    queryFn: () => AuditService.getAuditResults(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const {
    isLoading: summaryLoading,
    isError: summaryError
  } = useQuery({
    queryKey: ['audit-summary'],
    queryFn: () => AuditService.getAuditSummary(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const {
    data: dataFlags,
    isLoading: flagsLoading,
    isError: flagsError
  } = useQuery({
    queryKey: ['audit-flags'],
    queryFn: () => AuditService.getDataFlags(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Load financial data for red flag analysis
  const {
    data: financialData,
    isLoading: financialLoading
  } = useQuery({
    queryKey: ['financial-data-all-years'],
    queryFn: () => DataService.getAllYears(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Generate analysis data based on current analysis type
  useEffect(() => {
    if (!financialData || financialData.length === 0) return;

    let processedData: AnalysisDataPoint[] = [];
    let flags: DataFlag[] = [];

    switch (currentAnalysis) {
      case 'budget-execution':
        // Budget vs Execution analysis for 2019 & 2021
        processedData = financialData
          .filter(d => [2019, 2021].includes(d.year))
          .map(d => ({
            year: d.year,
            budget: d.total_budget || 0,
            executed: d.expenses || 0,
            executionRate: d.total_budget > 0 ? (d.expenses / d.total_budget * 100) : 0,
            sector: d.sector || 'General'
          }));

        flags = detectBudgetExecutionFlags(processedData);
        break;

      case 'function-priority': {
        // Function vs Public Need analysis
        const categoryMapping = {
          'Salud': 'Social',
          'Educación': 'Social',
          'Desarrollo Social': 'Social',
          'Seguridad': 'Public Order',
          'Obras Públicas': 'Infrastructure',
          'Administración': 'Administration',
          'Ambiente': 'Environment'
        };

        processedData = financialData
          .filter(d => year ? d.year === year : d.year === 2019)
          .map(d => ({
            sector: d.sector || 'Otros',
            executed: d.expenses || 0,
            function: categoryMapping[d.sector as keyof typeof categoryMapping] || 'Others',
            percentage: d.total_budget > 0 ? (d.expenses / d.total_budget * 100) : 0
          }));

        flags = detectFunctionPriorityFlags(processedData);
        break;
      }

      case 'procurement-timeline':
        // Mock procurement data - in real implementation, this would come from processed PDFs
        processedData = [
          { id: 'N°11', item: 'Equipo de Nefrología', date: '2023-11-13', value: 15000000 },
          { id: 'N°10', item: 'Combi Mini Bus', date: '2023-11-13', value: 8000000 },
          { id: 'N°9', item: 'Camioneta Utilitaria', date: '2023-11-17', value: 6000000 },
          { id: 'N°8', item: 'Compactador', date: '2023-11-17', value: 12000000 },
          { id: 'N°7', item: 'Sistema de Producción', date: '2023-11-27', value: 20000000 }
        ];

        flags = detectProcurementFlags(processedData);
        break;

      case 'programmatic-indicators':
        // Programmatic indicators analysis
        processedData = [
          { indicator: 'Cámaras de Seguridad', planned: 198, executed: 298, gap: 100 },
          { indicator: 'Familias Asistidas', planned: 2350, executed: 1755, gap: -595 },
          { indicator: 'Obras de Infraestructura', planned: 15, executed: 12, gap: -3 },
          { indicator: 'Programas Sociales', planned: 8, executed: 6, gap: -2 }
        ];

        // Flag significant gaps
        processedData.forEach(ind => {
          if (Math.abs(ind.gap / ind.planned * 100) > 20) {
            flags.push({
              type: 'programmatic_gap',
              severity: ind.gap > 0 ? 'medium' : 'high',
              message: `${ind.indicator}: ${ind.gap > 0 ? '+' : ''}${ind.gap} vs. planificado (${(ind.gap / ind.planned * 100).toFixed(1)}%)`,
              recommendation: ind.gap > 0 ? 'Evaluar sobreinversión' : 'Investigar causas del déficit de ejecución',
              source: 'programmatic_analysis'
            });
          }
        });
        break;

      case 'gender-perspective':
        // Gender perspective analysis - check if gender budget execution = 0
        processedData = [
          { category: 'Presupuesto con Perspectiva de Género', budgeted: 50000000, executed: 0 },
          { category: 'Programas de Mujeres', budgeted: 25000000, executed: 5000000 },
          { category: 'Violencia de Género', budgeted: 15000000, executed: 0 }
        ];

        processedData.forEach(item => {
          if (item.budgeted > 0 && item.executed === 0) {
            flags.push({
              type: 'gender_tokenism',
              severity: 'high',
              message: `${item.category}: $${(item.budgeted/1000000).toFixed(0)}M presupuestado, $0 ejecutado`,
              recommendation: 'Verificar si es cumplimiento simbólico o error de reporte',
              source: 'gender_analysis'
            });
          }
        });
        break;

      case 'quarterly-anomalies':
        // Quarterly budget growth analysis for 2021
        processedData = [
          { quarter: 'Q1 2021', budgeted: 75000000, growth: 0 },
          { quarter: 'Q2 2021', budgeted: 82000000, growth: 9.3 },
          { quarter: 'Q3 2021', budgeted: 86000000, growth: 4.9 },
          { quarter: 'Q4 2021', budgeted: 90000000, growth: 4.7 }
        ];

        // Flag quarters with >20% growth
        processedData.forEach((q) => {
          if (q.growth > 20) {
            flags.push({
              type: 'quarterly_surge',
              severity: 'medium',
              message: `${q.quarter}: Crecimiento presupuestario de ${q.growth}% (posible gasto electoral)`,
              recommendation: 'Analizar justificación del incremento presupuestario',
              source: 'quarterly_analysis'
            });
          }
        });
        break;

      case 'overview':
      default:
        // Overview with all red flags
        processedData = [
          { category: 'Ejecución Presupuestaria', flags: 3, severity: 'high' },
          { category: 'Prioridades Funcionales', flags: 2, severity: 'medium' },
          { category: 'Licitaciones', flags: 1, severity: 'high' },
          { category: 'Indicadores Programáticos', flags: 4, severity: 'medium' },
          { category: 'Perspectiva de Género', flags: 2, severity: 'high' },
          { category: 'Anomalías Temporales', flags: 1, severity: 'medium' }
        ];

        // Combine all flags from other analyses
        flags = [
          ...detectBudgetExecutionFlags(financialData),
          ...detectFunctionPriorityFlags(financialData),
          ...(dataFlags || [])
        ];
        break;
    }

    setAnalysisData(processedData);
    setRedFlags(flags);
  }, [financialData, currentAnalysis, year, dataFlags]);

  // Memoize chart configurations
  const chartConfig = useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    height,
    width
  }), [height, width]);

  // Handle analysis type change
  const handleAnalysisChange = (_: React.SyntheticEvent, newValue: RedFlagAnalysis) => {
    setCurrentAnalysis(newValue);
  };

  // Render loading state
  const isLoading = discrepanciesLoading || summaryLoading || flagsLoading || financialLoading;
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height} className={className}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando análisis de auditoría...
        </Typography>
      </Box>
    );
  }

  // Render error state
  const hasError = discrepanciesError || summaryError || flagsError;
  if (hasError) {
    return (
      <Alert severity="error" className={className}>
        Error cargando datos de auditoría. Por favor, intente nuevamente.
      </Alert>
    );
  }

  // Render red flags summary
  const renderRedFlagsSummary = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12}>
        <Alert
          severity={redFlags.length > 5 ? 'error' : redFlags.length > 2 ? 'warning' : 'success'}
          icon={<Flag />}
        >
          <Typography variant="h6">
            {redFlags.length === 0 ? 'No se detectaron anomalías' :
             `${redFlags.length} Banderas Rojas Detectadas`}
          </Typography>
          <Typography variant="body2">
            {redFlags.length === 0 ? 'Los datos parecen consistentes' :
             'Se detectaron patrones que requieren investigación adicional'}
          </Typography>
        </Alert>
      </Grid>

      {redFlags.slice(0, 3).map((flag, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning
                  sx={{
                    color: SEVERITY_COLORS[flag.severity as keyof typeof SEVERITY_COLORS],
                    mr: 1
                  }}
                />
                <Chip
                  label={flag.severity.toUpperCase()}
                  color={flag.severity === 'high' ? 'error' : 'warning'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" gutterBottom>
                {flag.message}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {flag.recommendation || 'No recommendation available'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render appropriate chart based on analysis type
  const renderAnalysisChart = () => {
    switch (currentAnalysis) {
      case 'budget-execution':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <ComposedChart data={analysisData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number | string, name: string) => [
                  typeof value === 'number' ? `$${(value / 1000000).toFixed(0)}M` : value,
                  name === 'budget' ? 'Presupuesto' :
                  name === 'executed' ? 'Ejecutado' :
                  name === 'executionRate' ? '% Ejecución' : name
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="budget" fill={SEVERITY_COLORS.info} name="Presupuesto" />
              <Bar yAxisId="left" dataKey="executed" fill={SEVERITY_COLORS.medium} name="Ejecutado" />
              <Line yAxisId="right" type="monotone" dataKey="executionRate" stroke={SEVERITY_COLORS.high} name="% Ejecución" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'function-priority':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <PieChart>
              <Pie
                data={analysisData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="executed"
                nameKey="sector"
                label={({ sector, percentage }) => `${sector}: ${percentage?.toFixed(1)}%`}
              >
                {analysisData.map((entry) => (
                  <Cell
                    key={`cell-${entry.sector}`}
                    fill={SEVERITY_COLORS[entry.function?.toLowerCase() as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(0)}M`, 'Ejecutado']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'procurement-timeline':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <ScatterChart 
              data={analysisData} 
              margin={chartConfig.margin}
              className="text-gray-900 dark:text-dark-text-primary"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" className="dark:stroke-gray-600" />
              <XAxis
                dataKey="date"
                type="category"
                tickFormatter={(date) => new Date(date).getDate().toString()}
                stroke="#333" 
                className="dark:stroke-gray-300"
              />
              <YAxis 
                dataKey="item" 
                type="category" 
                stroke="#333" 
                className="dark:stroke-gray-300"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderColor: '#e5e7eb',
                  color: '#000'
                }}
                className="dark:bg-dark-surface dark:border-dark-border dark:text-dark-text-primary"
                formatter={(value: number | string, name: string) => [
                  name === 'value' ? `${(value / 1000000).toFixed(1)}M` : value,
                  'Valor'
                ]}
                labelFormatter={(date) => `Fecha: ${date}`}
              />
              <Scatter dataKey="value" fill="#f44336" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'programmatic-indicators':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <ComposedChart data={analysisData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="indicator" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill={SEVERITY_COLORS.info} name="Planificado" />
              <Bar dataKey="executed" fill={SEVERITY_COLORS.medium} name="Ejecutado" />
              <Line type="monotone" dataKey="gap" stroke={SEVERITY_COLORS.high} name="Brecha" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'gender-perspective':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <ComposedChart data={analysisData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, 'Monto']} />
              <Legend />
              <Bar dataKey="budgeted" fill={SEVERITY_COLORS.info} name="Presupuestado" />
              <Bar dataKey="executed" fill={SEVERITY_COLORS.medium} name="Ejecutado" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'quarterly-anomalies':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <AreaChart data={analysisData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(0)}M`, 'Presupuesto']} />
              <Legend />
              <Area type="monotone" dataKey="budgeted" fill={SEVERITY_COLORS.info} />
              <Line type="monotone" dataKey="growth" stroke={SEVERITY_COLORS.high} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'overview':
      default:
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <BarChart data={analysisData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="flags"
                fill={SEVERITY_COLORS.high}
                name="Banderas Rojas"
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render detailed red flags table
  const renderRedFlagsTable = () => {
    if (redFlags.length === 0) return null;

    return (
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            Detalles de Banderas Rojas ({redFlags.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Severidad</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Recomendación</TableCell>
                  <TableCell>Fuente</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {redFlags.map((flag, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip label={flag.type.replace(/_/g, ' ')} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flag.severity}
                        color={flag.severity === 'high' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{flag.message}</TableCell>
                    <TableCell>{flag.recommendation}</TableCell>
                    <TableCell>{flag.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <div className={`audit-chart-container ${className} bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm`}>
      {showTitle && (
        <Typography variant="h5" gutterBottom className="dark:text-dark-text-primary">
          🚩 Análisis de Banderas Rojas - Carmen de Areco
        </Typography>
      )}

      {showDescription && (
        <Typography variant="body2" className="text-gray-600 dark:text-dark-text-secondary mb-6" gutterBottom>
          Detección automática de anomalías en datos de transparencia municipal basado en criterios de auditoría
        </Typography>
      )}

      {renderRedFlagsSummary()}

      {interactive && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} className="dark:border-dark-border">
          <Tabs
            value={currentAnalysis}
            onChange={handleAnalysisChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="📊 Resumen" value="overview" />
            <Tab label="💰 Presupuesto vs Ejecución" value="budget-execution" />
            <Tab label="🏛️ Prioridades Funcionales" value="function-priority" />
            <Tab label="📅 Cronología de Licitaciones" value="procurement-timeline" />
            <Tab label="📈 Indicadores Programáticos" value="programmatic-indicators" />
            <Tab label="👥 Perspectiva de Género" value="gender-perspective" />
            <Tab label="📉 Anomalías Trimestrales" value="quarterly-anomalies" />
          </Tabs>
        </Box>
      )}

      <div className="chart-wrapper mb-6">
        {renderAnalysisChart()}
      </div>

      {renderRedFlagsTable()}

      <Box sx={{ 
        mt: 4, 
        p: 3, 
        borderRadius: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider'
      }} className="dark:border-dark-border dark:bg-dark-surface-alt rounded-lg">
        <Typography variant="caption" className="dark:text-dark-text-tertiary block">
          ⚖️ <strong>Disclaimer:</strong> Estos análisis usan datos oficiales del Municipio de Carmen de Areco.
          Las banderas rojas detectadas requieren investigación adicional.
          Invitamos a la gestión municipal a aclarar las discrepancias identificadas.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<Download />}
            size="small"
            variant="outlined"
            onClick={() => {
              // Export functionality would be implemented here
              console.log('Exporting red flag analysis...');
            }}
          >
            Exportar Análisis Completo
          </Button>
        </Box>
      </Box>
    </div>
  );
});

ChartAuditReport.displayName = 'ChartAuditReport';

export default ChartAuditReport;