import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SankeyDiagram from '../SankeyDiagram';
import { useAccessibility } from '../../../utils/accessibility';
import { monitoring } from '../../../utils/monitoring';

// Mock dependencies
vi.mock('../../../utils/accessibility', () => ({
  useAccessibility: vi.fn(),
  chartAccessibility: {
    generateChartDescription: vi.fn(() => 'Sankey diagram showing fund flows'),
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

// Mock Recharts with Sankey component
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    Sankey: ({ children, data }: any) => (
      <div 
        data-testid="sankey-svg" 
        data-nodes={data?.nodes?.length || 0}
        data-links={data?.links?.length || 0}
      >
        {children}
        {data?.nodes?.map((node: any, index: number) => (
          <div 
            key={index} 
            data-testid={`sankey-node-${node.id || index}`}
          >
            {node.name}
          </div>
        ))}
        {data?.links?.map((link: any, index: number) => (
          <div 
            key={index} 
            data-testid={`sankey-link-${index}`}
          >
            Link {index}
          </div>
        ))}
      </div>
    ),
    Tooltip: ({ content }: any) => content
  };
});

// Mock D3 for Sankey implementation
vi.mock('d3-sankey', () => ({
  sankey: vi.fn(() => ({
    nodeWidth: vi.fn().mockReturnThis(),
    nodePadding: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnThis(),
    nodes: vi.fn().mockReturnThis(),
    links: vi.fn().mockReturnThis(),
    iterations: vi.fn().mockReturnThis()
  })),
  sankeyLinkHorizontal: vi.fn(() => (props: Record<string, unknown>) => `M${d.source.x1},${d.source.y0}L${d.target.x0},${d.target.y1}`)
}));

const mockData = {
  nodes: [
    { id: 'ingresos', name: 'Ingresos Totales' },
    { id: 'tributos', name: 'Tributos' },
    { id: 'tasas', name: 'Tasas' },
    { id: 'salud', name: 'Salud' },
    { id: 'educacion', name: 'Educación' },
    { id: 'obras', name: 'Obras Públicas' }
  ],
  links: [
    { source: 'ingresos', target: 'tributos', value: 600000 },
    { source: 'ingresos', target: 'tasas', value: 400000 },
    { source: 'tributos', target: 'salud', value: 300000 },
    { source: 'tributos', target: 'educacion', value: 200000 },
    { source: 'tributos', target: 'obras', value: 100000 },
    { source: 'tasas', target: 'salud', value: 150000 },
    { source: 'tasas', target: 'educacion', value: 150000 },
    { source: 'tasas', target: 'obras', value: 100000 }
  ]
};

describe('SankeyDiagram', () => {
  const defaultProps = {
    data: mockData,
    colorScheme: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'] as const,
    currency: 'ARS',
    showFlowValues: true,
    interactive: true,
    onNodeClick: vi.fn(),
    onNodeHover: vi.fn(),
    onLinkClick: vi.fn(),
    onLinkHover: vi.fn(),
    className: 'test-sankey'
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
    render(<SankeyDiagram {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders diagram with data', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('sankey-svg')).toBeInTheDocument();
    });

    // Check that nodes are rendered
    expect(screen.getByText(/Ingresos Totales/)).toBeInTheDocument();
    expect(screen.getByText(/Salud/)).toBeInTheDocument();
    expect(screen.getByText(/Educación/)).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData = { nodes: [], links: [] };
    render(<SankeyDiagram {...defaultProps} data={emptyData} />);
    
    expect(screen.getByText(/No hay datos de flujo disponibles/)).toBeInTheDocument();
  });

  it('renders nodes correctly', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    await waitFor(() => {
      const nodes = screen.getAllByTestId(/^sankey-node-/);
      expect(nodes).toHaveLength(6); // 6 nodes in mock data
    });
  });

  it('renders links correctly', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    await waitFor(() => {
      const links = screen.getAllByTestId(/^sankey-link-/);
      expect(links).toHaveLength(8); // 8 links in mock data
    });
  });

  it('shows flow values when enabled', () => {
    render(<SankeyDiagram {...defaultProps} showFlowValues={true} />);
    
    expect(screen.getByText(/600\.000/)).toBeInTheDocument();
    expect(screen.getByText(/400\.000/)).toBeInTheDocument();
  });

  it('hides flow values when disabled', () => {
    render(<SankeyDiagram {...defaultProps} showFlowValues={false} />);
    
    expect(screen.queryByText(/600\.000/)).not.toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<SankeyDiagram {...defaultProps} currency="USD" />);
    
    // Currency formatting should be applied to values
    const valueElements = screen.getAllByText(/\$.*600/);
    expect(valueElements.length).toBeGreaterThan(0);
  });

  it('calls onNodeClick when node is clicked', async () => {
    const onNodeClick = vi.fn();
    render(<SankeyDiagram {...defaultProps} onNodeClick={onNodeClick} />);

    await waitFor(() => {
      const node = screen.getByTestId('sankey-node-ingresos');
      fireEvent.click(node);
    });

    expect(onNodeClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ingresos',
        name: 'Ingresos Totales'
      })
    );
  });

  it('calls onNodeHover when node is hovered', async () => {
    const onNodeHover = vi.fn();
    render(<SankeyDiagram {...defaultProps} onNodeHover={onNodeHover} />);

    await waitFor(() => {
      const node = screen.getByTestId('sankey-node-ingresos');
      fireEvent.mouseEnter(node);
    });

    expect(onNodeHover).toHaveBeenCalled();
  });

  it('calls onLinkClick when link is clicked', async () => {
    const onLinkClick = vi.fn();
    render(<SankeyDiagram {...defaultProps} onLinkClick={onLinkClick} />);

    await waitFor(() => {
      const link = screen.getByTestId('sankey-link-0');
      fireEvent.click(link);
    });

    expect(onLinkClick).toHaveBeenCalled();
  });

  it('calls onLinkHover when link is hovered', async () => {
    const onLinkHover = vi.fn();
    render(<SankeyDiagram {...defaultProps} onLinkHover={onLinkHover} />);

    await waitFor(() => {
      const link = screen.getByTestId('sankey-link-0');
      fireEvent.mouseEnter(link);
    });

    expect(onLinkHover).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    render(<SankeyDiagram {...defaultProps} />);

    await waitFor(() => {
      const diagram = screen.getByTestId('sankey-svg');
      fireEvent.keyDown(diagram, { key: 'Tab' });
    });

    expect(document.activeElement).toBeDefined();
  });

  it('respects reduced motion preferences', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: true,
      isScreenReader: false,
      language: 'es'
    });

    const { container } = render(<SankeyDiagram {...defaultProps} />);
    expect(container.firstChild).toHaveClass('motion-reduce:animate-none');
  });

  it('provides screen reader support', () => {
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: true,
      language: 'es'
    });

    render(<SankeyDiagram {...defaultProps} />);
    
    expect(screen.getByRole('img')).toHaveAttribute('aria-label');
    expect(screen.getByTestId('sankey-description')).toBeInTheDocument();
  });

  it('handles invalid node references in links', () => {
    const invalidData = {
      nodes: [{ id: 'valid', name: 'Valid Node' }],
      links: [{ source: 'invalid', target: 'valid', value: 100 }]
    };

    render(<SankeyDiagram {...defaultProps} data={invalidData} />);
    expect(monitoring.captureError).toHaveBeenCalled();
  });

  it('calculates node sizes based on flow values', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    await waitFor(() => {
      // Nodes with higher flow should be larger
      const ingresoNode = screen.getByTestId('sankey-node-ingresos');
      const saludNode = screen.getByTestId('sankey-node-salud');
      
      expect(ingresoNode).toHaveAttribute('data-value');
      expect(saludNode).toHaveAttribute('data-value');
    });
  });

  it('applies color scheme correctly', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    await waitFor(() => {
      const nodes = screen.getAllByTestId(/^sankey-node-/);
      nodes.forEach(node => {
        expect(node).toHaveStyle('fill: #3B82F6'); // First color in scheme
      });
    });
  });

  it('handles errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SankeyDiagram {...defaultProps} data={null as any} />);
    
    expect(monitoring.captureError).toHaveBeenCalled();
    expect(screen.getByText(/Error al cargar el diagrama/)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('supports interactive mode', () => {
    render(<SankeyDiagram {...defaultProps} interactive={true} />);
    
    // Interactive elements should have cursor pointer
    expect(screen.getByTestId('sankey-svg')).toHaveClass('cursor-pointer');
  });

  it('supports non-interactive mode', () => {
    render(<SankeyDiagram {...defaultProps} interactive={false} />);
    
    // Non-interactive should not have pointer cursor
    expect(screen.getByTestId('sankey-svg')).not.toHaveClass('cursor-pointer');
  });

  it('handles loading state', () => {
    render(<SankeyDiagram {...defaultProps} data={undefined} />);
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  });

  it('captures performance metrics', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_render_time',
        value: expect.any(Number),
        unit: 'ms',
        tags: expect.objectContaining({
          chartType: 'sankey'
        })
      });
    });
  });

  it('supports data export functionality', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(monitoring.captureMetric).toHaveBeenCalledWith({
        name: 'chart_export',
        value: 1,
        unit: 'count',
        tags: expect.objectContaining({
          chartType: 'sankey'
        })
      });
    });
  });

  it('provides detailed tooltips for nodes and links', async () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    await waitFor(() => {
      const node = screen.getByTestId('sankey-node-ingresos');
      fireEvent.mouseEnter(node);
    });

    // Should show tooltip with flow information
    expect(screen.getByText(/Total de flujo/)).toBeInTheDocument();
  });

  it('handles resize events properly', () => {
    const { rerender } = render(<SankeyDiagram {...defaultProps} />);
    
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
    window.dispatchEvent(new Event('resize'));
    
    rerender(<SankeyDiagram {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SankeyDiagram {...defaultProps} />);
    expect(container.firstChild).toHaveClass('test-sankey');
  });

  it('validates data structure correctly', () => {
    const invalidData = {
      nodes: [{ name: 'Missing ID' }], // Missing required id field
      links: []
    };
    
    render(<SankeyDiagram {...defaultProps} data={invalidData as any} />);
    expect(monitoring.captureError).toHaveBeenCalled();
  });

  it('handles circular flows correctly', () => {
    const circularData = {
      nodes: [
        { id: 'a', name: 'Node A' },
        { id: 'b', name: 'Node B' }
      ],
      links: [
        { source: 'a', target: 'b', value: 100 },
        { source: 'b', target: 'a', value: 50 } // Circular reference
      ]
    };

    render(<SankeyDiagram {...defaultProps} data={circularData} />);
    
    // Should handle circular flows without crashing
    expect(screen.getByTestId('sankey-svg')).toBeInTheDocument();
  });
});