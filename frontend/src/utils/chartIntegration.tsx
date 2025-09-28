/**
 * Chart Integration Utility
 * Provides functions to dynamically render charts based on routing configuration
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import ChartAuditReport from '../components/charts/ChartAuditReport';
import BudgetExecutionChart from '../components/charts/BudgetExecutionChart';
import RevenueReportChart from '../components/charts/RevenueReportChart';
import ExpenditureReportChart from '../components/charts/ExpenditureReportChart';
import SalaryAnalysisChart from '../components/charts/SalaryAnalysisChart';
import DebtAnalysisChart from '../components/charts/DebtAnalysisChart';
import ContractAnalysisChart from '../components/charts/ContractAnalysisChart';
import InfrastructureProjectsChart from '../components/charts/InfrastructureProjectsChart';
import InvestmentReportChart from '../components/charts/InvestmentReportChart';
import GenderBudgetingChart from '../components/charts/GenderBudgetingChart';
import HealthStatisticsChart from '../components/charts/HealthStatisticsChart';
import EducationDataChart from '../components/charts/EducationDataChart';
import { ChartConfig } from '../types/charts';
import { getChartsForPage, getHighPriorityCharts } from '../config/chartRouting';

// Chart component registry - maps component names to actual components
const CHART_REGISTRY = {
  'ChartAuditReport': ChartAuditReport,
  'BudgetExecutionChart': BudgetExecutionChart,
  'RevenueReportChart': RevenueReportChart,
  'ExpenditureReportChart': ExpenditureReportChart,
  'SalaryAnalysisChart': SalaryAnalysisChart,
  'DebtAnalysisChart': DebtAnalysisChart,
  'ContractAnalysisChart': ContractAnalysisChart,
  'InfrastructureProjectsChart': InfrastructureProjectsChart,
  'InvestmentReportChart': InvestmentReportChart,
  'GenderBudgetingChart': GenderBudgetingChart,
  'HealthStatisticsChart': HealthStatisticsChart,
  'EducationDataChart': EducationDataChart
};

// Render a single chart component
export const renderChart = (config: ChartConfig, key?: string): React.ReactElement => {
  const ChartComponent = CHART_REGISTRY[config.component as keyof typeof CHART_REGISTRY];

  if (!ChartComponent) {
    return (
      <Alert severity="warning" key={key}>
        Component '{config.component}' not found in registry
      </Alert>
    );
  }

  const chartProps = {
    ...config.props,
    analysis: config.analysis,
    title: config.title,
    description: config.description
  };

  return (
    <Card key={key} sx={{ mb: 3 }}>
      <CardContent>
        {config.title && (
          <Typography variant="h6" gutterBottom>
            {config.title}
          </Typography>
        )}
        {config.description && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {config.description}
          </Typography>
        )}
        <ChartComponent {...chartProps} />
      </CardContent>
    </Card>
  );
};

// Render multiple charts for a page
export const renderChartsForPage = (pageName: string, maxCharts?: number): React.ReactElement[] => {
  const charts = maxCharts
    ? getHighPriorityCharts(pageName, maxCharts)
    : getChartsForPage(pageName);

  return charts.map((config, index) =>
    renderChart(config, `${pageName}-chart-${index}`)
  );
};

// Render high-priority charts (top 3)
export const renderHighPriorityCharts = (pageName: string): React.ReactElement[] => {
  return renderChartsForPage(pageName, 3);
};

// Render red flag analysis if available for the page
export const renderRedFlagAnalysis = (pageName: string): React.ReactElement | null => {
  const charts = getChartsForPage(pageName);
  const auditChart = charts.find(config => config.component === 'ChartAuditReport');

  if (!auditChart) {
    return null;
  }

  return renderChart(auditChart, `${pageName}-red-flags`);
};

// Chart wrapper component for consistent styling
interface ChartWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  priority?: number;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  children,
  priority
}) => (
  <Box sx={{ mb: 3 }}>
    <Card elevation={priority === 1 ? 3 : 1}>
      <CardContent>
        {title && (
          <Typography
            variant={priority === 1 ? "h5" : "h6"}
            gutterBottom
            color={priority === 1 ? "primary" : "textPrimary"}
          >
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {description}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  </Box>
);

// Audit section component for pages that support red flag analysis
export const AuditSection: React.FC<{ pageName: string }> = ({ pageName }) => {
  const redFlagChart = renderRedFlagAnalysis(pageName);

  if (!redFlagChart) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'error.main' }}>
        🚩 Análisis de Banderas Rojas
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Detección automática de anomalías y patrones irregulares en los datos
      </Typography>
      {redFlagChart}
    </Box>
  );
};

// Charts grid component for dashboard layouts
interface ChartsGridProps {
  pageName: string;
  maxCharts?: number;
  showAuditFirst?: boolean;
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({
  pageName,
  maxCharts,
  showAuditFirst = true
}) => {
  const charts = renderChartsForPage(pageName, maxCharts);

  if (charts.length === 0) {
    return (
      <Alert severity="info">
        No hay gráficos configurados para esta página
      </Alert>
    );
  }

  return (
    <Box>
      {showAuditFirst && <AuditSection pageName={pageName} />}
      {charts.map((chart, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          {chart}
        </Box>
      ))}
    </Box>
  );
};

// Quick stats component for dashboard summaries
export const QuickStats: React.FC<{ pageName: string }> = ({ pageName }) => {
  // This would be enhanced to show actual statistics based on the page
  const redFlagChart = renderRedFlagAnalysis(pageName);

  if (!redFlagChart) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Resumen de Alertas
      </Typography>
      {redFlagChart}
    </Box>
  );
};

// Export all utilities
export default {
  renderChart,
  renderChartsForPage,
  renderHighPriorityCharts,
  renderRedFlagAnalysis,
  ChartWrapper,
  AuditSection,
  ChartsGrid,
  QuickStats
};