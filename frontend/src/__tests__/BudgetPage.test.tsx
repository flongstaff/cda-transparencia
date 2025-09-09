import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Budget from '../pages/Budget';

// Mock the consolidated API service
jest.mock('../services/ConsolidatedApiService', () => ({
  consolidatedApiService: {
    getAvailableYears: jest.fn().mockResolvedValue([2025, 2024, 2023, 2022]),
    getYearlyData: jest.fn().mockResolvedValue({
      year: 2024,
      budget: {
        total: 5000000000,
        executed: 4250000000,
        executionRate: '85.0',
        categories: [
          { name: 'Personal', budgeted: 2150670000, executed: 1828069500, executionRate: '85.0' },
          { name: 'Corrientes', budgeted: 1250000000, executed: 1062500000, executionRate: '85.0' },
          { name: 'Capital', budgeted: 875000000, executed: 743750000, executionRate: '85.0' },
          { name: 'Deuda', budgeted: 375000000, executed: 318750000, executionRate: '85.0' },
          { name: 'Transferencias', budgeted: 350000000, executed: 297500000, executionRate: '85.0' }
        ]
      },
      summary: {
        total_documents: 173,
        total_categories: 5,
        total_size_mb: '57.30',
        verified_documents: 156,
        transparency_score: 85
      },
      categories: {
        'Ejecución Presupuestaria': [
          { id: 'doc-1', title: 'Estado de Ejecución de Gastos', year: 2024, category: 'Ejecución Presupuestaria', type: 'budget_execution', size_mb: '2.5', url: '/documents/1', official_url: 'https://carmendeareco.gob.ar/transparencia/document1.pdf', verification_status: 'verified', processing_date: '2024-06-30' }
        ]
      },
      total_documents: 173,
      verified_documents: 156
    }),
    getBudgetData: jest.fn().mockResolvedValue({
      total_budgeted: 5000000000,
      total_executed: 4250000000,
      execution_rate: '85.0',
      categories: {
        'Personal': { budgeted: 2150670000, executed: 1828069500, execution_rate: '85.0' },
        'Corrientes': { budgeted: 1250000000, executed: 1062500000, execution_rate: '85.0' },
        'Capital': { budgeted: 875000000, executed: 743750000, execution_rate: '85.0' },
        'Deuda': { budgeted: 375000000, executed: 318750000, execution_rate: '85.0' },
        'Transferencias': { budgeted: 350000000, executed: 297500000, execution_rate: '85.0' }
      }
    }),
    getTransparencyScore: jest.fn().mockResolvedValue({
      score: 85,
      overall: 85,
      execution: 85
    })
  }
}));

// Mock other components
jest.mock('../components/PageYearSelector', () => {
  return function MockPageYearSelector(props: any) {
    return <div data-testid="page-year-selector">PageYearSelector</div>;
  };
});

jest.mock('../components/charts/BudgetAnalysisChart', () => {
  return function MockBudgetAnalysisChart() {
    return <div data-testid="budget-analysis-chart">BudgetAnalysisChart</div>;
  };
});

jest.mock('../components/charts/UnifiedDashboardChart', () => {
  return function MockUnifiedDashboardChart() {
    return <div data-testid="unified-dashboard-chart">UnifiedDashboardChart</div>;
  };
});


jest.mock('../components/audit/CriticalIssues', () => {
  return function MockCriticalIssues() {
    return <div data-testid="critical-issues">CriticalIssues</div>;
  };
});

describe('Budget Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders budget page with loading state initially', () => {
    render(
      <BrowserRouter>
        <Budget />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Cargando datos del sistema integrado...')).toBeInTheDocument();
  });

  test('renders budget metrics after data loads', async () => {
    render(
      <BrowserRouter>
        <Budget />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos del sistema integrado...')).not.toBeInTheDocument();
    });
    
    // Check that key elements are rendered
    expect(screen.getByText('Portal de Transparencia Integrado')).toBeInTheDocument();
    expect(screen.getByText('Carmen de Areco - Año 2024')).toBeInTheDocument();
    
    // Check that metrics are displayed
    expect(screen.getByText('Documentos Totales')).toBeInTheDocument();
    expect(screen.getByText('341')).toBeInTheDocument();
    
    expect(screen.getByText('Verificados')).toBeInTheDocument();
    expect(screen.getByText('312')).toBeInTheDocument();
    
    expect(screen.getByText('Transparencia')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
    
    expect(screen.getByText('Presupuesto 2024')).toBeInTheDocument();
    expect(screen.getByText('$5,000,000,000')).toBeInTheDocument();
  });

  test('renders navigation tabs', async () => {
    render(
      <BrowserRouter>
        <Budget />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos del sistema integrado...')).not.toBeInTheDocument();
    });
    
    // Check that navigation tabs are rendered
    expect(screen.getByText('Resumen General')).toBeInTheDocument();
    expect(screen.getByText('Por Categorías')).toBeInTheDocument();
    expect(screen.getByText('Análisis')).toBeInTheDocument();
    expect(screen.getByText('Tendencias')).toBeInTheDocument();
    expect(screen.getByText('Verificación')).toBeInTheDocument();
    expect(screen.getByText('Explorador')).toBeInTheDocument();
  });
});