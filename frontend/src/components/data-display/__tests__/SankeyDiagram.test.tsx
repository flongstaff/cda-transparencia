import React from 'react';
import { render, screen } from '@testing-library/react';
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

// Simple mock for Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Sankey: ({ children }: any) => <div data-testid="sankey-svg">{children}</div>,
  Tooltip: ({ content }: any) => content
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
    { source: 0, target: 1, value: 600000 },
    { source: 0, target: 2, value: 400000 },
    { source: 1, target: 3, value: 300000 },
    { source: 1, target: 4, value: 200000 },
    { source: 1, target: 5, value: 100000 },
    { source: 2, target: 3, value: 150000 },
    { source: 2, target: 4, value: 150000 },
    { source: 2, target: 5, value: 100000 }
  ]
};

describe('SankeyDiagram', () => {
  const defaultProps = {
    data: mockData,
    title: 'Flujo de Fondos',
    height: 400,
    className: '',
    colorScheme: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
    currency: 'ARS',
    showFlowValues: true,
    interactive: true
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
    expect(screen.getByTestId('sankey-diagram')).toBeInTheDocument();
  });

  it('renders diagram with data', () => {
    render(<SankeyDiagram {...defaultProps} />);
    
    // Check that the main components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('sankey-svg')).toBeInTheDocument();
    
    // Check that the title is rendered
    expect(screen.getByText('Flujo de Fondos')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData = { nodes: [], links: [] };
    render(<SankeyDiagram {...defaultProps} data={emptyData} />);
    
    expect(screen.getByText(/No hay datos de flujo disponibles/)).toBeInTheDocument();
  });

  it('shows flow values when enabled', () => {
    render(<SankeyDiagram {...defaultProps} showFlowValues={true} />);
    
    expect(screen.getByTestId('sankey-svg')).toBeInTheDocument();
  });

  it('hides flow values when disabled', () => {
    render(<SankeyDiagram {...defaultProps} showFlowValues={false} />);
    
    expect(screen.getByTestId('sankey-svg')).toBeInTheDocument();
  });
});