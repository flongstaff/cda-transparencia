import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Budget from '../pages/Budget';

// Mock the consolidated API service
vi.mock('../services/ConsolidatedApiService', () => ({
  consolidatedApiService: {
    getAvailableYears: vi.fn().mockResolvedValue([2025, 2024, 2023, 2022, 2021, 2020, 2019]),
    getYearlyData: vi.fn().mockResolvedValue({
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
        total_documents: 336,
        total_categories: 5,
        total_size_mb: '57.30',
        verified_documents: 336,
        transparency_score: 100
      },
      categories: {
        'Ejecución Presupuestaria': [
          { id: 'doc-1', title: 'Estado de Ejecución de Gastos', year: 2024, category: 'Ejecución Presupuestaria', type: 'budget_execution', size_mb: '2.5', url: '/documents/1', official_url: 'https://carmendeareco.gob.ar/transparencia/document1.pdf', verification_status: 'verified', processing_date: '2024-06-30' }
        ]
      },
      total_documents: 336,
      verified_documents: 336
    }),
    getBudgetData: vi.fn().mockResolvedValue({
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
    getTransparencyScore: vi.fn().mockResolvedValue({
      score: 100,
      overall: 100,
      execution: 100
    })
  }
}));

// Mock other components
vi.mock('../components/PageYearSelector', () => ({
  default: () => {
    return <div data-testid="page-year-selector">PageYearSelector</div>;
  }
}));

vi.mock('../components/charts/BudgetAnalysisChart', () => ({
  default: () => <div data-testid="budget-analysis-chart">BudgetAnalysisChart</div>
}));

vi.mock('../components/charts/UnifiedDashboardChart', () => ({
  default: () => <div data-testid="unified-dashboard-chart">UnifiedDashboardChart</div>
}));


vi.mock('../components/audit/CriticalIssues', () => ({
  default: () => <div data-testid="critical-issues">CriticalIssues</div>
}));

describe('Budget Page', () => {
  const queryClient = new QueryClient();

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  test('renders budget page with loading state initially', () => {
    renderWithProviders(<Budget />);
    
    expect(screen.getByText('Cargando datos del sistema integrado...')).toBeInTheDocument();
  });

  test('renders budget metrics after data loads', async () => {
    renderWithProviders(<Budget />);
    
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
    renderWithProviders(<Budget />);
    
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