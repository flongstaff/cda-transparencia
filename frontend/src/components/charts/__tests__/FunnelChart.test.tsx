import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FunnelChart from '../FunnelChart';
import { useAccessibility } from '../../../utils/accessibility';
import monitoring from '../../../utils/monitoring';

// Mock dependencies
vi.mock('../../../utils/accessibility', () => ({
  useAccessibility: vi.fn(),
  chartAccessibility: {
    generateChartDescription: vi.fn(() => 'Funnel chart showing process stages'),
    createDataTable: vi.fn(() => document.createElement('table'))
  }
}));

vi.mock('../../../utils/monitoring', () => ({
  default: {
    captureError: vi.fn(),
    captureMetric: vi.fn()
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  FunnelChart: ({ data, children, ...props }: any) => (
    <div data-testid="funnel-chart" data-props={JSON.stringify(props)}>
      {data?.map((item: any, index: number) => (
        <div key={index} data-testid={`funnel-segment-${index}`} data-value={item.value}>
          {item.name}: {item.value} ({item.conversionRate}%)
        </div>
      ))}
      {children}
    </div>
  ),
  Funnel: ({ dataKey }: any) => <div data-testid="funnel" data-key={dataKey} />,
  LabelList: ({ dataKey }: any) => <div data-testid="label-list" data-key={dataKey} />,
  Cell: ({ fill }: any) => <div data-testid="funnel-cell" style={{ fill }} />
}));

const mockData = [
  { name: 'Solicitudes Recibidas', value: 1000, conversionRate: 100 },
  { name: 'Documentación Completa', value: 800, conversionRate: 80 },
  { name: 'Evaluación Técnica', value: 600, conversionRate: 75 },
  { name: 'Aprobación Administrativa', value: 400, conversionRate: 67 },
  { name: 'Contratos Firmados', value: 350, conversionRate: 88 }
];

describe('FunnelChart', () => {
  const defaultProps = {
    data: mockData,
    colorScheme: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] as const,
    showConversionRates: true,
    showDropOffAnalysis: true,
    onSegmentClick: vi.fn(),
    onSegmentHover: vi.fn(),
    className: 'test-funnel'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: false,
      language: 'es'
    });
  });

  it('renders without crashing', () => {
    render(<FunnelChart {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders chart with data', async () => {
    render(<FunnelChart {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
      expect(screen.getByTestId('funnel-segment-0')).toBeInTheDocument();
    });

    // Check that data is rendered
    expect(screen.getByText(/Solicitudes Recibidas: 1000/)).toBeInTheDocument();
    expect(screen.getByText(/Contratos Firmados: 350/)).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<FunnelChart {...defaultProps} data={[]} />);
    
    expect(screen.getByText(/No hay datos de proceso disponibles/)).toBeInTheDocument();
  });

  it('calculates conversion rates correctly', async () => {
    render(<FunnelChart {...defaultProps} />);
    
    await waitFor(() => {
      // Check conversion rates are displayed
      expect(screen.getByText(/80%/)).toBeInTheDocument();
      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });
  });

  it('shows conversion rates when enabled', () => {
    render(<FunnelChart {...defaultProps} showConversionRates={true} />);
    expect(screen.getByText(/Tasa de Conversión/)).toBeInTheDocument();
  });

  it('hides conversion rates when disabled', () => {
    render(<FunnelChart {...defaultProps} showConversionRates={false} />);
    expect(screen.queryByText(/Tasa de Conversión/)).not.toBeInTheDocument();
  });

  it('shows drop-off analysis when enabled', () => {
    render(<FunnelChart {...defaultProps} showDropOffAnalysis={true} />);
    expect(screen.getByText(/Análisis de Abandono/)).toBeInTheDocument();
  });

  it('hides drop-off analysis when disabled', () => {
    render(<FunnelChart {...defaultProps} showDropOffAnalysis={false} />);
    expect(screen.queryByText(/Análisis de Abandono/)).not.toBeInTheDocument();
  });

  it('calls onSegmentClick when segment is clicked', async () => {
    const onSegmentClick = vi.fn();
    render(<FunnelChart {...defaultProps} onSegmentClick={onSegmentClick} />);

    await waitFor(() => {
      const segment = screen.getByTestId('funnel-segment-0');
      fireEvent.click(segment);
    });

    expect(onSegmentClick).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Solicitudes Recibidas',
        value: 1000,
        conversionRate: 100
      }),
      0
    );
  });

  it('calls onSegmentHover when segment is hovered', async () => {
    const onSegmentHover = vi.fn();
    render(<FunnelChart {...defaultProps} onSegmentHover={onSegmentHover} />);

    await waitFor(() => {
      const segment = screen.getByTestId('funnel-segment-0');
      fireEvent.mouseEnter(segment);
    });

    expect(onSegmentHover).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    render(<FunnelChart {...defaultProps} />);

    await waitFor(() => {
      const funnel = screen.getByTestId('funnel-chart');
      fireEvent.keyDown(funnel, { key: 'ArrowDown' });
    });

    expect(document.activeElement).toBeDefined();
  });

  it('respects reduced motion preferences', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: true,
      isScreenReader: false,
      language: 'es'
    });

    const { container } = render(<FunnelChart {...defaultProps} />);
    expect(container.firstChild).toHaveClass('motion-reduce:animate-none');
  });

  it('provides screen reader support', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: true,
      language: 'es'
    });

    render(<FunnelChart {...defaultProps} />);
    
    expect(screen.getByRole('img')).toHaveAttribute('aria-label');
    expect(screen.getByTestId('funnel-description')).toBeInTheDocument();
  });

  it('calculates drop-off rates correctly', () => {
    render(<FunnelChart {...defaultProps} />);
    
    // Should show drop-off analysis
    expect(screen.getByText(/Pérdida: 20%/)).toBeInTheDocument(); // From 1000 to 800
  });

  it('identifies bottlenecks in the process', () => {
    render(<FunnelChart {...defaultProps} />);
    
    // Should highlight stages with high drop-off
    expect(screen.getByText(/Cuello de botella/)).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleData = [{ name: 'Solo Punto', value: 100, conversionRate: 100 }];
    
    render(<FunnelChart {...defaultProps} data={singleData} />);
    expect(screen.getByText(/Solo Punto: 100/)).toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    const dataWithZero = [
      { name: 'Start', value: 100, conversionRate: 100 },
      { name: 'Zero', value: 0, conversionRate: 0 }
    ];
    
    render(<FunnelChart {...defaultProps} data={dataWithZero} />);
    expect(screen.getByText(/Zero: 0/)).toBeInTheDocument();
  });

  it('applies custom color scheme', async () => {
    render(<FunnelChart {...defaultProps} />);
    
    await waitFor(() => {
      const cells = screen.getAllByTestId('funnel-cell');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  it('handles errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<FunnelChart {...defaultProps} data={null as any} />);
    
    expect(monitoring.captureError).toHaveBeenCalled();
    expect(screen.getByText(/Error al cargar el gráfico/)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('formats percentage values correctly', () => {
    render(<FunnelChart {...defaultProps} />);
    
    // Check percentage formatting
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<FunnelChart {...defaultProps} data={undefined} />);
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  });

  it('captures performance metrics', async () => {
    render(<FunnelChart {...defaultProps} />);
    
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_render_time',
        value: expect.any(Number),
        unit: 'ms',
        tags: expect.objectContaining({
          chartType: 'funnel'
        })
      });
    });
  });

  it('supports data export functionality', async () => {
    render(<FunnelChart {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_export',
        value: 1,
        unit: 'count',
        tags: expect.objectContaining({
          chartType: 'funnel'
        })
      });
    });
  });

  it('provides detailed tooltips', async () => {
    render(<FunnelChart {...defaultProps} />);
    
    await waitFor(() => {
      const segment = screen.getByTestId('funnel-segment-0');
      fireEvent.mouseEnter(segment);
    });

    // Should show detailed tooltip with conversion rates and drop-off
    expect(screen.getByText(/Tasa de conversión/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FunnelChart {...defaultProps} />);
    expect(container.firstChild).toHaveClass('test-funnel');
  });

  it('handles resize events', () => {
    const { rerender } = render(<FunnelChart {...defaultProps} />);
    
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 });
    window.dispatchEvent(new Event('resize'));
    
    rerender(<FunnelChart {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('validates data structure', () => {
    const invalidData = [{ name: 'Test', value: 'invalid' }];
    
    render(<FunnelChart {...defaultProps} data={invalidData as any} />);
    expect(monitoring.captureError).toHaveBeenCalled();
  });
});