/**
 * Chart Routing Configuration
 * Defines which charts should be displayed on which pages and how to integrate them
 */

import { RedFlagAnalysis, ChartConfig, PageChartMapping } from '../types/charts';

// Remove duplicate interfaces since they're imported from types

// Chart routing configuration for all pages
export const CHART_ROUTING: PageChartMapping = {
  // Dashboard Principal - Overview with key red flags
  'dashboard': [
    {
      component: 'ChartAuditReport',
      analysis: 'overview',
      title: 'Resumen de Banderas Rojas',
      description: 'Detección automática de anomalías en datos municipales',
      priority: 1,
      props: {
        height: 400,
        interactive: true,
        showTitle: true,
        showDescription: true
      }
    },
    {
      component: 'BudgetExecutionChart',
      title: 'Ejecución Presupuestaria',
      priority: 2
    },
    {
      component: 'RevenueReportChart',
      title: 'Ingresos Municipales',
      priority: 3
    }
  ],

  // Dashboard Completo - All red flag analyses
  'completo': [
    {
      component: 'ChartAuditReport',
      analysis: 'overview',
      title: 'Panel de Control de Auditoría',
      description: 'Análisis comprehensivo de banderas rojas detectadas',
      priority: 1,
      props: {
        height: 500,
        interactive: true,
        showTitle: true,
        showDescription: true
      }
    },
    {
      component: 'ChartAuditReport',
      analysis: 'budget-execution',
      title: 'Análisis de Ejecución Presupuestaria',
      description: 'Detección de anomalías en tasas de ejecución',
      priority: 2,
      props: {
        height: 400,
        interactive: false
      }
    },
    {
      component: 'ChartAuditReport',
      analysis: 'function-priority',
      title: 'Prioridades Funcionales',
      description: 'Balance entre gasto administrativo y social',
      priority: 3,
      props: {
        height: 400,
        interactive: false
      }
    },
    {
      component: 'ChartAuditReport',
      analysis: 'procurement-timeline',
      title: 'Cronología de Licitaciones',
      description: 'Análisis temporal de procesos de compra',
      priority: 4,
      props: {
        height: 400,
        interactive: false
      }
    }
  ],

  // Gastos page - Budget execution focus
  'gastos': [
    {
      component: 'ChartAuditReport',
      analysis: 'budget-execution',
      title: 'Banderas Rojas en Ejecución de Gastos',
      description: 'Detección de anomalías en ejecución presupuestaria',
      priority: 1,
      props: {
        height: 450,
        interactive: true
      }
    },
    {
      component: 'ExpenditureReportChart',
      title: 'Análisis de Gastos por Categoría',
      priority: 2
    },
    {
      component: 'BudgetExecutionChart',
      title: 'Ejecución vs. Presupuesto',
      priority: 3
    }
  ],

  // Recursos page - Revenue and resource analysis
  'recursos': [
    {
      component: 'ChartAuditReport',
      analysis: 'quarterly-anomalies',
      title: 'Anomalías en Evolución de Recursos',
      description: 'Detección de patrones irregulares en ingresos',
      priority: 1,
      props: {
        height: 400,
        interactive: true
      }
    },
    {
      component: 'RevenueReportChart',
      title: 'Análisis de Ingresos',
      priority: 2
    },
    {
      component: 'RevenueSourcesChart',
      title: 'Fuentes de Financiamiento',
      priority: 3
    }
  ],

  // Licitaciones page - Procurement analysis
  'licitaciones': [
    {
      component: 'ChartAuditReport',
      analysis: 'procurement-timeline',
      title: 'Análisis de Banderas Rojas en Licitaciones',
      description: 'Detección de agrupamiento temporal y anomalías',
      priority: 1,
      props: {
        height: 500,
        interactive: true
      }
    },
    {
      component: 'ContractAnalysisChart',
      title: 'Análisis de Contratos',
      priority: 2
    }
  ],

  // Sueldos page - Salary and personnel analysis
  'sueldos': [
    {
      component: 'ChartAuditReport',
      analysis: 'function-priority',
      title: 'Análisis de Gasto en Personal',
      description: 'Balance entre personal administrativo y operativo',
      priority: 1,
      props: {
        height: 400,
        interactive: true
      }
    },
    {
      component: 'SalaryAnalysisChart',
      title: 'Análisis Salarial',
      priority: 2
    },
    {
      component: 'PersonnelExpensesChart',
      title: 'Gastos de Personal',
      priority: 3
    }
  ],

  // Deuda page - Debt analysis
  'deuda': [
    {
      component: 'ChartAuditReport',
      analysis: 'budget-execution',
      title: 'Banderas Rojas en Gestión de Deuda',
      description: 'Análisis de sostenibilidad fiscal',
      priority: 1,
      props: {
        height: 400,
        interactive: true
      }
    },
    {
      component: 'DebtAnalysisChart',
      title: 'Análisis de Deuda',
      priority: 2
    },
    {
      component: 'DebtReportChart',
      title: 'Perfil de Vencimientos',
      priority: 3
    }
  ],

  // Indicadores page - Programmatic indicators
  'indicadores': [
    {
      component: 'ChartAuditReport',
      analysis: 'programmatic-indicators',
      title: 'Banderas Rojas en Indicadores',
      description: 'Brechas entre planificación y ejecución',
      priority: 1,
      props: {
        height: 500,
        interactive: true
      }
    },
    {
      component: 'HealthStatisticsChart',
      title: 'Indicadores de Salud',
      priority: 2
    },
    {
      component: 'EducationDataChart',
      title: 'Indicadores de Educación',
      priority: 3
    }
  ],

  // Genero page - Gender perspective analysis
  'genero': [
    {
      component: 'ChartAuditReport',
      analysis: 'gender-perspective',
      title: 'Análisis de Perspectiva de Género',
      description: 'Detección de cumplimiento simbólico vs. real',
      priority: 1,
      props: {
        height: 500,
        interactive: true
      }
    },
    {
      component: 'GenderBudgetingChart',
      title: 'Presupuesto con Perspectiva de Género',
      priority: 2
    }
  ],

  // Obras page - Infrastructure projects
  'obras': [
    {
      component: 'ChartAuditReport',
      analysis: 'budget-execution',
      title: 'Banderas Rojas en Obras Públicas',
      description: 'Análisis de ejecución vs. entrega real',
      priority: 1,
      props: {
        height: 450,
        interactive: true,
        year: new Date().getFullYear()
      }
    },
    {
      component: 'InfrastructureProjectsChart',
      title: 'Proyectos de Infraestructura',
      priority: 2
    }
  ],

  // Inversion page - Investment analysis
  'inversion': [
    {
      component: 'ChartAuditReport',
      analysis: 'quarterly-anomalies',
      title: 'Anomalías en Inversión Pública',
      description: 'Detección de patrones irregulares en inversiones',
      priority: 1,
      props: {
        height: 400,
        interactive: true
      }
    },
    {
      component: 'InvestmentReportChart',
      title: 'Análisis de Inversiones',
      priority: 2
    }
  ]
};

// Helper function to get charts for a specific page
export const getChartsForPage = (pageName: string): ChartConfig[] => {
  return CHART_ROUTING[pageName] || [];
};

// Helper function to get high-priority charts for a page
export const getHighPriorityCharts = (pageName: string, maxCharts: number = 3): ChartConfig[] => {
  const charts = getChartsForPage(pageName);
  return charts
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxCharts);
};

// Helper function to check if a page should show red flag analysis
export const shouldShowRedFlags = (pageName: string): boolean => {
  const charts = getChartsForPage(pageName);
  return charts.some(chart => chart.component === 'ChartAuditReport');
};

// Helper function to get the primary red flag analysis for a page
export const getPrimaryRedFlagAnalysis = (pageName: string): RedFlagAnalysis | null => {
  const charts = getChartsForPage(pageName);
  const auditChart = charts.find(chart => chart.component === 'ChartAuditReport');
  return auditChart?.analysis || null;
};

// Navigation mapping for chart-based routing
export const CHART_NAVIGATION = {
  'banderas-rojas': {
    title: 'Banderas Rojas',
    description: 'Detección automática de anomalías',
    component: 'ChartAuditReport',
    analysis: 'overview'
  },
  'ejecucion-presupuestaria': {
    title: 'Ejecución Presupuestaria',
    description: 'Análisis de tasas de ejecución',
    component: 'ChartAuditReport',
    analysis: 'budget-execution'
  },
  'prioridades-funcionales': {
    title: 'Prioridades Funcionales',
    description: 'Balance administrativo vs. social',
    component: 'ChartAuditReport',
    analysis: 'function-priority'
  },
  'cronologia-licitaciones': {
    title: 'Cronología de Licitaciones',
    description: 'Análisis temporal de compras',
    component: 'ChartAuditReport',
    analysis: 'procurement-timeline'
  },
  'indicadores-programaticos': {
    title: 'Indicadores Programáticos',
    description: 'Brecha planificación vs. ejecución',
    component: 'ChartAuditReport',
    analysis: 'programmatic-indicators'
  },
  'perspectiva-genero': {
    title: 'Perspectiva de Género',
    description: 'Análisis de cumplimiento real',
    component: 'ChartAuditReport',
    analysis: 'gender-perspective'
  },
  'anomalias-trimestrales': {
    title: 'Anomalías Trimestrales',
    description: 'Patrones temporales irregulares',
    component: 'ChartAuditReport',
    analysis: 'quarterly-anomalies'
  }
};

export default CHART_ROUTING;