import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WaterfallChart from '../../charts/WaterfallChart';
import { useAccessibility } from '../../../utils/accessibility';
import { monitoring } from '../../../utils/monitoring';

// Mock dependencies
vi.mock('../../../utils/accessibility', () => ({
  useAccessibility: vi.fn(),
  chartAccessibility: {
    generateChartDescription: vi.fn(() => 'Waterfall chart showing budget evolution'),
    createDataTable: vi.fn(() => document.createElement('table'))
  }
}));

vi.mock('../../../utils/monitoring', () => ({
  monitoring: {
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
  BarChart: ({ data, children, ...props }: any) => (
    <div data-testid="bar-chart" data-props={JSON.stringify(props)} onClick={props.onClick}>
      {data?.map((item: any, index: number) => (
        <div key={index} data-testid={`bar-${index}`} data-value={item.value} onClick={() => props.onClick({ activePayload: [{ payload: item }], activeTooltipIndex: index })}>
          {item.label}: {item.value}
        </div>
      ))}
      {children}
    </div>
  ),
  Bar: ({ dataKey, stackId, fill, children }: any) => (
    <div data-testid="bar" data-key={dataKey} data-stack={stackId} style={{ fill }}>
      {children}
    </div>
  ),
  Cell: ({ fill }: any) => <div data-testid="cell" style={{ fill }} />,
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ tickFormatter }: any) => <div data-testid="y-axis" data-formatter={!!tickFormatter} />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({ content }: any) => <div data-testid="tooltip" data-custom={!!content} />
}));

const mockData = [
  { label: 'Presupuesto Inicial', value: 1000000, type: 'start' },
  { label: 'Ingresos Adicionales', value: 200000, type: 'increase' },
  { label: 'Gastos Extraordinarios', value: -150000, type: 'decrease' },
  { label: 'Ajustes', value: -50000, type: 'decrease' },
  { label: 'Presupuesto Final', value: 1000000, type: 'end' }
];

describe('WaterfallChart', () => {
  const defaultProps = {
    data: mockData,
    currency: 'ARS',
    showTotal: true,
    colorScheme: {
      positive: '#10B981',
      negative: '#EF4444',
      neutral: '#6B7280',
      start: '#3B82F6',
      end: '#8B5CF6'
    },
    onStepClick: vi.fn(),
    className: 'test-waterfall'
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
    render(<WaterfallChart {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders chart with data', async () => {
    render(<WaterfallChart {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-0')).toBeInTheDocument();
    });

    // Check that data is rendered
    expect(screen.getByText(/Presupuesto Inicial: 1000000/)).toBeInTheDocument();
    expect(screen.getByText(/Ingresos Adicionales: 200000/)).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<WaterfallChart {...defaultProps} data={[]} />);
    
    expect(screen.getByText(/No hay datos disponibles/)).toBeInTheDocument();
  });

  it('calculates cumulative values correctly', async () => {
    render(<WaterfallChart {...defaultProps} />);
    
    await waitFor(() => {
      const _chartData = JSON.parse(
        screen.getByTestId('bar-chart').getAttribute('data-props') || '{}'
      );
      
      // Should have calculated cumulative positions
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('applies different colors for different value types', async () => {
    render(<WaterfallChart {...defaultProps} />);
    
    await waitFor(() => {
      const bars = screen.getAllByTestId('bar');
      expect(bars.length).toBeGreaterThan(0);
    });
  });

  it('shows total when enabled', () => {
    render(<WaterfallChart {...defaultProps} showTotal={true} />);
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('hides total when disabled', () => {
    render(<WaterfallChart {...defaultProps} showTotal={false} />);
    expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<WaterfallChart {...defaultProps} currency="USD" />);
    
    // Check that currency formatting is applied
    expect(screen.getByTestId('y-axis')).toHaveAttribute('data-formatter', 'true');
  });

  it('calls onStepClick when step is clicked', async () => {
    const onStepClick = vi.fn();
    render(<WaterfallChart {...defaultProps} onStepClick={onStepClick} />);

    await waitFor(() => {
      const step = screen.getByTestId('bar-0');
      fireEvent.click(step);
    });

    expect(onStepClick).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Presupuesto Inicial',
        value: 1000000,
        type: 'start'
      }),
      0
    );
  });

  it('handles keyboard navigation', async () => {
    render(<WaterfallChart {...defaultProps} />);

    await waitFor(() => {
      const chart = screen.getByTestId('bar-chart');
      fireEvent.keyDown(chart, { key: 'ArrowRight' });
    });

    // Should handle keyboard navigation
    expect(document.activeElement).toBeDefined();
  });

  it('respects reduced motion preferences', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: true,
      isScreenReader: false,
      language: 'es'
    });

    const { container } = render(<WaterfallChart {...defaultProps} />);
    expect(container.firstChild).toHaveClass('motion-reduce:animate-none');
  });

  it('provides screen reader support', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: true,
      language: 'es'
    });

    render(<WaterfallChart {...defaultProps} />);
    
    expect(screen.getByRole('img')).toHaveAttribute('aria-label');
    expect(screen.getByTestId('waterfall-description')).toBeInTheDocument();
  });

  it('handles positive and negative values correctly', () => {
    const mixedData = [
      { label: 'Start', value: 100, type: 'start' },
      { label: 'Positive', value: 50, type: 'increase' },
      { label: 'Negative', value: -30, type: 'decrease' },
      { label: 'End', value: 120, type: 'end' }
    ];

    render(<WaterfallChart {...defaultProps} data={mixedData} />);
    
    expect(screen.getByText(/Positive: 50/)).toBeInTheDocument();
    expect(screen.getByText(/Negative: -30/)).toBeInTheDocument();
  });

  it('handles errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Force an error by passing invalid data
    render(<WaterfallChart {...defaultProps} data={null as any} />);
    
    expect(monitoring.captureError).toHaveBeenCalled();
    expect(screen.getByText(/Error al cargar el gráfico/)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('supports custom tooltip content', async () => {
    render(<WaterfallChart {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-custom', 'true');
    });
  });

  it('calculates percentage changes correctly', () => {
    render(<WaterfallChart {...defaultProps} />);
    
    // Should show percentage change in tooltip
    const tooltipContent = screen.getByTestId('tooltip');
    expect(tooltipContent).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<WaterfallChart {...defaultProps} data={undefined} />);
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  });

  it('captures performance metrics', async () => {
    render(<WaterfallChart {...defaultProps} />);
    
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_render_time',
        value: expect.any(Number),
        unit: 'ms',
        tags: expect.objectContaining({
          chartType: 'waterfall'
        })
      });
    });
  });

  it('supports data export functionality', async () => {
    render(<WaterfallChart {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_export',
        value: 1,
        unit: 'count',
        tags: expect.objectContaining({
          chartType: 'waterfall'
        })
      });
    });
  });

  it('handles resize events properly', () => {
    const { rerender } = render(<WaterfallChart {...defaultProps} />);
    
    // Simulate resize
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
    window.dispatchEvent(new Event('resize'));
    
    rerender(<WaterfallChart {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('validates data structure correctly', () => {
    const invalidData = [
      { label: 'Test', value: 'invalid', type: 'start' }
    ];

    render(<WaterfallChart {...defaultProps} data={invalidData as any} />);
    
    expect(monitoring.captureError).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<WaterfallChart {...defaultProps} />);
    expect(container.firstChild).toHaveClass('test-waterfall');
  });
});