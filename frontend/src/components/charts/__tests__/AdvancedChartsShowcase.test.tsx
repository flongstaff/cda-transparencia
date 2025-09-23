import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdvancedChartsShowcase from '../AdvancedChartsShowcase';
import { useAccessibility } from '../../../utils/accessibility';
import { monitoring } from '../../../utils/monitoring';

// Mock dependencies
vi.mock('../../../utils/accessibility', () => ({
  useAccessibility: vi.fn(),
}));

vi.mock('../../../utils/monitoring', () => ({
  monitoring: {
    captureError: vi.fn(),
    captureMetric: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
}));

// Mock chart components
vi.mock('../index', () => ({
  TreemapChart: (props: any) => <div data-testid="treemap-chart">{JSON.stringify(props)}</div>,
  WaterfallChart: (props: any) => <div data-testid="waterfall-chart">{JSON.stringify(props)}</div>,
  FunnelChart: (props: any) => <div data-testid="funnel-chart">{JSON.stringify(props)}</div>,
  SankeyDiagram: (props: any) => <div data-testid="sankey-diagram">{JSON.stringify(props)}</div>,
  GanttChart: (props: any) => <div data-testid="gantt-chart">{JSON.stringify(props)}</div>,
  HeatmapCalendar: (props: any) => <div data-testid="heatmap-calendar">{JSON.stringify(props)}</div>,
  RadarChart: (props: any) => <div data-testid="radar-chart">{JSON.stringify(props)}</div>,
}));


describe('AdvancedChartsShowcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAccessibility as any).mockReturnValue({
      prefersReducedMotion: false,
      isScreenReader: false,
      language: 'es',
      direction: 'ltr',
    });
  });

  it('renders without crashing', () => {
    render(<AdvancedChartsShowcase />);
    expect(screen.getByText(/Visualizaciones Avanzadas/)).toBeInTheDocument();
  });

  it('renders all chart types', async () => {
    render(<AdvancedChartsShowcase />);

    await waitFor(() => {
      expect(screen.getByTestId('treemap-chart')).toBeInTheDocument();
      expect(screen.getByTestId('waterfall-chart')).toBeInTheDocument();
      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
      expect(screen.getByTestId('sankey-diagram')).toBeInTheDocument();
      expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
      expect(screen.getByTestId('heatmap-calendar')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });
});
