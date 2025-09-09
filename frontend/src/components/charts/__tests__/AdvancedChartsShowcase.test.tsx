import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdvancedChartsShowcase from '../AdvancedChartsShowcase';
import { useAdvancedData } from '../../../hooks/useAdvancedData';
import { useAccessibility } from '../../../utils/accessibility';
import monitoring from '../../../utils/monitoring';

// Mock dependencies
vi.mock('../../../hooks/useAdvancedData', () => ({
  useAdvancedData: vi.fn()
}));

vi.mock('../../../utils/accessibility', () => ({
  useAccessibility: vi.fn()
}));

vi.mock('../../../utils/monitoring', () => ({
  default: {
    captureError: vi.fn(),
    captureMetric: vi.fn()
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>
  }
}));

// Mock chart components
vi.mock('../AdvancedChartLoader', () => ({
  __esModule: true,
  default: ({ chartType, data, ...props }: any) => (
    <div data-testid={`advanced-chart-${chartType}`} data-props={JSON.stringify(props)}>
      Mock {chartType} Chart with {data?.length || 0} items
    </div>
  )
}));

const mockBudgetData = [
  { name: 'Salud', value: 150000, percentage: 35 },
  { name: 'Educación', value: 120000, percentage: 28 },
  { name: 'Obras Públicas', value: 80000, percentage: 19 },
  { name: 'Administración', value: 75000, percentage: 18 }
];

const mockWaterfallData = [
  { label: 'Presupuesto Inicial', value: 1000000, type: 'start' },
  { label: 'Ingresos Adicionales', value: 200000, type: 'increase' },
  { label: 'Gastos Extraordinarios', value: -150000, type: 'decrease' },
  { label: 'Presupuesto Final', value: 1050000, type: 'end' }
];

const mockProcessData = [
  { name: 'Solicitudes', value: 1000, conversionRate: 100 },
  { name: 'Evaluadas', value: 800, conversionRate: 80 },
  { name: 'Aprobadas', value: 600, conversionRate: 75 },
  { name: 'Finalizadas', value: 500, conversionRate: 83 }
];

const mockFlowData = {
  nodes: [
    { id: 'ingresos', name: 'Ingresos' },
    { id: 'salud', name: 'Salud' },
    { id: 'educacion', name: 'Educación' }
  ],
  links: [
    { source: 'ingresos', target: 'salud', value: 300000 },
    { source: 'ingresos', target: 'educacion', value: 200000 }
  ]
};

describe('AdvancedChartsShowcase', () => {
  const mockUseAdvancedData = {
    budgetTreemapData: { data: mockBudgetData, isLoading: false, error: null },
    waterfallData: { data: mockWaterfallData, isLoading: false, error: null },
    processData: { data: mockProcessData, isLoading: false, error: null },
    flowData: { data: mockFlowData, isLoading: false, error: null },
    refetch: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAdvancedData as any).mockReturnValue(mockUseAdvancedData);
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: false,
      language: 'es',
      direction: 'ltr'
    });
  });

  it('renders without crashing', () => {
    render(<AdvancedChartsShowcase />);
    expect(screen.getByText(/Visualizaciones Avanzadas/)).toBeInTheDocument();
  });

  it('renders all chart types', async () => {
    render(<AdvancedChartsShowcase />);

    await waitFor(() => {
      expect(screen.getByTestId('advanced-chart-treemap')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-chart-waterfall')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-chart-funnel')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-chart-sankey')).toBeInTheDocument();
    });
  });

  it('displays chart descriptions correctly', () => {
    render(<AdvancedChartsShowcase />);

    expect(screen.getByText(/Análisis Presupuestario Jerárquico/)).toBeInTheDocument();
    expect(screen.getByText(/Evolución del Presupuesto/)).toBeInTheDocument();
    expect(screen.getByText(/Análisis de Procesos/)).toBeInTheDocument();
    expect(screen.getByText(/Flujo de Fondos/)).toBeInTheDocument();
  });

  it('handles loading states', () => {
    (useAdvancedData as any).mockReturnValue({
      ...mockUseAdvancedData,
      budgetTreemapData: { data: null, isLoading: true, error: null }
    });

    render(<AdvancedChartsShowcase />);
    expect(screen.getByTestId('chart-skeleton-treemap')).toBeInTheDocument();
  });

  it('handles error states', () => {
    const error = new Error('Failed to load data');
    (useAdvancedData as any).mockReturnValue({
      ...mockUseAdvancedData,
      budgetTreemapData: { data: null, isLoading: false, error }
    });

    render(<AdvancedChartsShowcase />);
    expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
  });

  it('provides retry functionality on errors', async () => {
    const error = new Error('Network error');
    const refetch = vi.fn();
    (useAdvancedData as any).mockReturnValue({
      ...mockUseAdvancedData,
      budgetTreemapData: { data: null, isLoading: false, error },
      refetch
    });

    render(<AdvancedChartsShowcase />);
    
    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(retryButton);
    
    expect(refetch).toHaveBeenCalled();
  });

  it('supports chart switching/tabs', async () => {
    render(<AdvancedChartsShowcase />);

    // Find tab buttons
    const treemapTab = screen.getByRole('button', { name: /treemap/i });
    const waterfallTab = screen.getByRole('button', { name: /waterfall/i });

    // Switch between tabs
    fireEvent.click(waterfallTab);
    await waitFor(() => {
      expect(screen.getByTestId('advanced-chart-waterfall')).toBeVisible();
    });

    fireEvent.click(treemapTab);
    await waitFor(() => {
      expect(screen.getByTestId('advanced-chart-treemap')).toBeVisible();
    });
  });

  it('captures metrics when charts are viewed', async () => {
    render(<AdvancedChartsShowcase />);

    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'advanced_charts_showcase_view',
        value: 1,
        unit: 'count',
        tags: expect.objectContaining({
          section: 'showcase'
        })
      });
    });
  });

  it('supports keyboard navigation between charts', async () => {
    render(<AdvancedChartsShowcase />);

    const showcase = screen.getByRole('tablist');
    fireEvent.keyDown(showcase, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(document.activeElement).toHaveAttribute('role', 'tab');
    });
  });

  it('respects reduced motion preferences', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: true,
      isScreenReader: false,
      language: 'es',
      direction: 'ltr'
    });

    const { container } = render(<AdvancedChartsShowcase />);
    expect(container.firstChild).toHaveClass('motion-reduce:animate-none');
  });

  it('provides screen reader support', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: true,
      language: 'es',
      direction: 'ltr'
    });

    render(<AdvancedChartsShowcase />);
    
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label');
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('supports RTL layouts', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: false,
      language: 'ar',
      direction: 'rtl'
    });

    const { container } = render(<AdvancedChartsShowcase />);
    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
  });

  it('handles empty data gracefully', () => {
    (useAdvancedData as any).mockReturnValue({
      budgetTreemapData: { data: [], isLoading: false, error: null },
      waterfallData: { data: [], isLoading: false, error: null },
      processData: { data: [], isLoading: false, error: null },
      flowData: { data: { nodes: [], links: [] }, isLoading: false, error: null },
      refetch: vi.fn()
    });

    render(<AdvancedChartsShowcase />);
    expect(screen.getByText(/No hay datos disponibles/)).toBeInTheDocument();
  });

  it('provides export functionality', async () => {
    render(<AdvancedChartsShowcase />);

    const exportButton = screen.getByRole('button', { name: /exportar datos/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'showcase_data_export',
        value: 1,
        unit: 'count',
        tags: expect.objectContaining({
          exportType: 'all_charts'
        })
      });
    });
  });

  it('supports full-screen mode', async () => {
    render(<AdvancedChartsShowcase />);

    const fullscreenButton = screen.getByRole('button', { name: /pantalla completa/i });
    fireEvent.click(fullscreenButton);

    await waitFor(() => {
      expect(document.fullscreenElement || document.webkitFullscreenElement).toBeTruthy();
    });
  });

  it('displays data freshness indicators', () => {
    render(<AdvancedChartsShowcase />);
    
    expect(screen.getByText(/Última actualización/)).toBeInTheDocument();
    expect(screen.getByText(/hace/)).toBeInTheDocument();
  });

  it('shows chart performance metrics', () => {
    render(<AdvancedChartsShowcase />);
    
    expect(screen.getByText(/Rendimiento/)).toBeInTheDocument();
    expect(screen.getByText(/ms/)).toBeInTheDocument();
  });

  it('handles chart interaction events', async () => {
    render(<AdvancedChartsShowcase />);

    const treemapChart = screen.getByTestId('advanced-chart-treemap');
    fireEvent.click(treemapChart);

    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_interaction',
        value: 1,
        unit: 'count',
        tags: expect.objectContaining({
          chartType: 'treemap',
          interactionType: 'click'
        })
      });
    });
  });

  it('supports chart comparison mode', async () => {
    render(<AdvancedChartsShowcase />);

    const compareButton = screen.getByRole('button', { name: /comparar/i });
    fireEvent.click(compareButton);

    await waitFor(() => {
      expect(screen.getByTestId('chart-comparison-view')).toBeInTheDocument();
    });
  });

  it('provides chart configuration options', () => {
    render(<AdvancedChartsShowcase />);

    expect(screen.getByRole('button', { name: /configurar/i })).toBeInTheDocument();
  });

  it('displays chart metadata and sources', () => {
    render(<AdvancedChartsShowcase />);

    expect(screen.getByText(/Fuente de datos/)).toBeInTheDocument();
    expect(screen.getByText(/Metodología/)).toBeInTheDocument();
  });

  it('supports print-friendly layouts', () => {
    render(<AdvancedChartsShowcase />);

    const printButton = screen.getByRole('button', { name: /imprimir/i });
    fireEvent.click(printButton);

    // Should apply print styles
    expect(document.body).toHaveClass('print-mode');
  });

  it('handles responsive breakpoints', () => {
    // Mobile breakpoint
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 480 });
    window.dispatchEvent(new Event('resize'));

    const { rerender } = render(<AdvancedChartsShowcase />);

    expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();

    // Desktop breakpoint
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 });
    window.dispatchEvent(new Event('resize'));

    rerender(<AdvancedChartsShowcase />);
    expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
  });

  it('captures errors and reports them', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Force an error by corrupting the hook return
    (useAdvancedData as any).mockImplementation(() => {
      throw new Error('Hook failed');
    });

    render(<AdvancedChartsShowcase />);

    expect(monitoring.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'AdvancedChartsShowcase'
      })
    );

    consoleSpy.mockRestore();
  });
});