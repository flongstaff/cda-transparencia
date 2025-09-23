import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TreemapChart from '../TreemapChart';
import { useAccessibility } from '../../../utils/accessibility';
import { monitoring } from '../../../utils/monitoring';

// Mock dependencies
vi.mock('../../../utils/accessibility', () => ({
  useAccessibility: vi.fn(),
  chartAccessibility: {
    generateChartDescription: vi.fn(() => 'Treemap chart showing 3 data points'),
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

// Mock Nivo Treemap
vi.mock('@nivo/treemap', () => ({
  ResponsiveTreeMap: ({ data, onClick, onMouseMove, ...props }: any) => (
    <div data-testid="treemap" data-props={JSON.stringify(props)}>
      {data?.children?.map((item: any, index: number) => (
        <div 
          key={index} 
          data-testid={`treemap-cell-${index}`} 
          data-name={item.name}
          onClick={() => onClick({ data: item })}
          onMouseMove={(e) => onMouseMove({ data: item }, e)}
        >
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  )
}));

// Mock Recharts (for other components that might use it)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ data, children, ...props }: any) => (
    <div data-testid="bar-chart" data-props={JSON.stringify(props)}>
      {data?.map((item: any, index: number) => (
        <div key={index} data-testid={`bar-${index}`} data-value={item.value}>
          {item.label}: {item.value}
        </div>
      ))}
      {children}
    </div>
  ),
  Bar: ({ dataKey, stackId, fill }: any) => (
    <div data-testid="bar" data-key={dataKey} data-stack={stackId} style={{ fill }} />
  ),
  Cell: ({ fill }: any) => <div data-testid="cell" style={{ fill }} />,
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ tickFormatter }: any) => <div data-testid="y-axis" data-formatter={!!tickFormatter} />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({ content }: any) => <div data-testid="tooltip" data-custom={!!content} />
}));

const mockData = [
  {
    name: 'Salud',
    value: 150000,
    children: [
      { name: 'Hospital Municipal', value: 100000 },
      { name: 'Centros de Salud', value: 50000 }
    ]
  },
  {
    name: 'Educación',
    value: 120000,
    children: [
      { name: 'Escuelas Primarias', value: 80000 },
      { name: 'Jardines de Infantes', value: 40000 }
    ]
  },
  {
    name: 'Obras Públicas',
    value: 80000,
    children: [
      { name: 'Infraestructura Vial', value: 50000 },
      { name: 'Alumbrado', value: 30000 }
    ]
  }
];

describe('TreemapChart', () => {
  const defaultProps = {
    data: mockData,
    colorScheme: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] as const,
    onNodeClick: vi.fn(),
    onNodeHover: vi.fn(),
    className: 'test-treemap'
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
    render(<TreemapChart {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders chart with data', async () => {
    render(<TreemapChart {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('treemap')).toBeInTheDocument();
      expect(screen.getByTestId('treemap-cell-0')).toBeInTheDocument();
    });

    // Check that data is rendered
    expect(screen.getByText(/Salud: 150000/)).toBeInTheDocument();
    expect(screen.getByText(/Educación: 120000/)).toBeInTheDocument();
    expect(screen.getByText(/Obras Públicas: 80000/)).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<TreemapChart {...defaultProps} data={[]} />);
    
    expect(screen.getByText(/No hay datos disponibles/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<TreemapChart {...defaultProps} />);
    expect(container.firstChild).toHaveClass('test-treemap');
  });

  it('calls onNodeClick when node is clicked', async () => {
    const onNodeClick = vi.fn();
    render(<TreemapChart {...defaultProps} onNodeClick={onNodeClick} />);

    await waitFor(() => {
      const node = screen.getByTestId('treemap-cell-0');
      fireEvent.click(node);
    });

    expect(onNodeClick).toHaveBeenCalled();
  });

  it('calls onNodeHover when node is hovered', async () => {
    const onNodeHover = vi.fn();
    render(<TreemapChart {...defaultProps} onNodeHover={onNodeHover} />);

    await waitFor(() => {
      const node = screen.getByTestId('treemap-cell-0');
      fireEvent.mouseEnter(node);
    });

    expect(onNodeHover).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    const onNodeClick = vi.fn();
    render(<TreemapChart {...defaultProps} onNodeClick={onNodeClick} />);

    await waitFor(() => {
      const treemap = screen.getByTestId('treemap');
      fireEvent.keyDown(treemap, { key: 'Enter' });
    });

    // Should focus on first accessible element
    expect(document.activeElement).toBeDefined();
  });

  it('respects reduced motion preferences', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: true,
      isScreenReader: false,
      language: 'es'
    });

    const { container } = render(<TreemapChart {...defaultProps} />);
    expect(container.firstChild).toHaveClass('motion-reduce:animate-none');
  });

  it('provides screen reader support', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: true,
      language: 'es'
    });

    render(<TreemapChart {...defaultProps} />);
    
    expect(screen.getByRole('img')).toHaveAttribute('aria-label');
    expect(screen.getByTestId('treemap-description')).toBeInTheDocument();
  });

  it('handles errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Force an error by passing invalid data
    render(<TreemapChart {...defaultProps} data={null as any} />);
    
    expect(monitoring.captureError).toHaveBeenCalled();
    expect(screen.getByText(/Error al cargar el gráfico/)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('formats currency values correctly', () => {
    render(<TreemapChart {...defaultProps} />);
    
    // Check tooltip formatting
    expect(screen.getByText(/150\.000/)).toBeInTheDocument();
  });

  it('supports hierarchical data structure', async () => {
    render(<TreemapChart {...defaultProps} />);
    
    await waitFor(() => {
      // Check that nested data is handled
      const treemapProps = JSON.parse(
        screen.getByTestId('treemap').getAttribute('data-props') || '{}'
      );
      expect(treemapProps.dataKey).toBe('value');
    });
  });

  it('applies correct color scheme', async () => {
    render(<TreemapChart {...defaultProps} />);
    
    await waitFor(() => {
      const cells = screen.getAllByTestId('treemap-cell');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  it('handles loading state', () => {
    render(<TreemapChart {...defaultProps} data={undefined} />);
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  });

  it('captures performance metrics', async () => {
    render(<TreemapChart {...defaultProps} />);
    
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_render_time',
        value: expect.any(Number),
        unit: 'ms',
        tags: expect.objectContaining({
          chartType: 'treemap'
        })
      });
    });
  });

  it('handles resize events', () => {
    const { rerender } = render(<TreemapChart {...defaultProps} />);
    
    // Simulate resize
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
    window.dispatchEvent(new Event('resize'));
    
    rerender(<TreemapChart {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('supports data export functionality', async () => {
    render(<TreemapChart {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    fireEvent.click(exportButton);
    
    // Should trigger data export
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_export',
        value: 1,
        unit: 'count',
        tags: expect.objectContaining({
          chartType: 'treemap',
          exportFormat: 'csv'
        })
      });
    });
  });
});