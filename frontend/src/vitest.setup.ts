import { vi } from 'vitest';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  BarChart3: (props) => <div data-testid="bar-chart-icon" {...props} />,
  PieIcon: (props) => <div data-testid="pie-chart-icon" {...props} />,
  Activity: (props) => <div data-testid="activity-icon" {...props} />,
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  FunnelChart: ({ children }) => <div data-testid="funnel-chart">{children}</div>,
  Sankey: ({ children }) => <div data-testid="sankey-chart">{children}</div>,
  Treemap: ({ children }) => <div data-testid="treemap-chart">{children}</div>,
  WaterfallChart: ({ children }) => <div data-testid="waterfall-chart">{children}</div>,
  Bar: (props) => <div data-testid="bar" {...props} />,
  XAxis: (props) => <div data-testid="x-axis" {...props} />,
  YAxis: (props) => <div data-testid="y-axis" {...props} />,
  Tooltip: (props) => <div data-testid="tooltip" {...props} />,
  Legend: (props) => <div data-testid="legend" {...props} />,
  CartesianGrid: (props) => <div data-testid="grid" {...props} />,
  Cell: (props) => <div data-testid="cell" {...props} />,
}));
