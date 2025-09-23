import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import React from 'react';

// Mock lucide-react with all commonly used icons
vi.mock('lucide-react', () => ({
  // Basic icons
  Star: () => React.createElement('div', { 'data-testid': 'star-icon' }),
  StarHalf: () => React.createElement('div', { 'data-testid': 'star-half-icon' }),
  TrendingUp: () => React.createElement('div', { 'data-testid': 'trending-up-icon' }),
  TrendingDown: () => React.createElement('div', { 'data-testid': 'trending-down-icon' }),
  TrendingFlat: () => React.createElement('div', { 'data-testid': 'trending-flat-icon' }),
  AlertTriangle: () => React.createElement('div', { 'data-testid': 'alert-triangle-icon' }),
  RefreshCw: () => React.createElement('div', { 'data-testid': 'refresh-icon' }),
  Loader2: () => React.createElement('div', { 'data-testid': 'loader-icon', className: 'animate-spin' }),
  CheckCircle: () => React.createElement('div', { 'data-testid': 'check-circle-icon' }),
  XCircle: () => React.createElement('div', { 'data-testid': 'x-circle-icon' }),

  // File and document icons
  FileText: () => React.createElement('div', { 'data-testid': 'file-text-icon' }),
  FileImage: () => React.createElement('div', { 'data-testid': 'file-image-icon' }),
  FileSpreadsheet: () => React.createElement('div', { 'data-testid': 'file-spreadsheet-icon' }),
  Download: () => React.createElement('div', { 'data-testid': 'download-icon' }),
  ExternalLink: () => React.createElement('div', { 'data-testid': 'external-link-icon' }),
  Archive: () => React.createElement('div', { 'data-testid': 'archive-icon' }),
  Braces: () => React.createElement('div', { 'data-testid': 'braces-icon' }),
  Presentation: () => React.createElement('div', { 'data-testid': 'presentation-icon' }),

  // Financial icons
  DollarSign: () => React.createElement('div', { 'data-testid': 'dollar-sign-icon' }),
  CreditCard: () => React.createElement('div', { 'data-testid': 'credit-card-icon' }),
  Coins: () => React.createElement('div', { 'data-testid': 'coins-icon' }),

  // Navigation and UI icons
  Menu: () => React.createElement('div', { 'data-testid': 'menu-icon' }),
  X: () => React.createElement('div', { 'data-testid': 'x-icon' }),
  Home: () => React.createElement('div', { 'data-testid': 'home-icon' }),
  ChevronRight: () => React.createElement('div', { 'data-testid': 'chevron-right-icon' }),
  Eye: () => React.createElement('div', { 'data-testid': 'eye-icon' }),
  Share2: () => React.createElement('div', { 'data-testid': 'share2-icon' }),

  // Building and organization icons
  Building: () => React.createElement('div', { 'data-testid': 'building-icon' }),
  Users: () => React.createElement('div', { 'data-testid': 'users-icon' }),
  Shield: () => React.createElement('div', { 'data-testid': 'shield-icon' }),
  Activity: () => React.createElement('div', { 'data-testid': 'activity-icon' }),

  // Chart and analysis icons
  BarChart3: () => React.createElement('div', { 'data-testid': 'bar-chart-icon' }),
  PieChart: () => React.createElement('div', { 'data-testid': 'pie-chart-icon' }),
  LineChart: () => React.createElement('div', { 'data-testid': 'line-chart-icon' }),
  LayoutDashboard: () => React.createElement('div', { 'data-testid': 'layout-dashboard-icon' }),

  // Tool icons
  Calculator: () => React.createElement('div', { 'data-testid': 'calculator-icon' }),
  Calendar: () => React.createElement('div', { 'data-testid': 'calendar-icon' }),
  BookOpen: () => React.createElement('div', { 'data-testid': 'book-open-icon' }),
  Briefcase: () => React.createElement('div', { 'data-testid': 'briefcase-icon' }),
  Database: () => React.createElement('div', { 'data-testid': 'database-icon' }),
  Globe: () => React.createElement('div', { 'data-testid': 'globe-icon' }),

  // Media controls
  Play: () => React.createElement('div', { 'data-testid': 'play-icon' }),
  RotateCcw: () => React.createElement('div', { 'data-testid': 'rotate-ccw-icon' }),

  // Version control
  GitBranch: () => React.createElement('div', { 'data-testid': 'git-branch-icon' }),
  Github: () => React.createElement('div', { 'data-testid': 'github-icon' }),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  BarChart: ({ children, data }: { children: React.ReactNode; data: any[] }) =>
    React.createElement('div', {
      'data-testid': 'bar-chart',
      'data-length': data?.length || 0
    }, children),
  LineChart: ({ children, data }: { children: React.ReactNode; data: any[] }) =>
    React.createElement('div', {
      'data-testid': 'line-chart',
      'data-length': data?.length || 0
    }, children),
  PieChart: ({ children, data }: { children: React.ReactNode; data: any[] }) =>
    React.createElement('div', {
      'data-testid': 'pie-chart',
      'data-length': data?.length || 0
    }, children),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: any[] }) =>
    React.createElement('div', {
      'data-testid': 'area-chart',
      'data-length': data?.length || 0
    }, children),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: any[] }) =>
    React.createElement('div', {
      'data-testid': 'composed-chart',
      'data-length': data?.length || 0
    }, children),
  Bar: ({ dataKey, fill }: { dataKey: string; fill: string }) =>
    React.createElement('div', {
      'data-testid': `bar-${dataKey}`,
      style: { backgroundColor: fill }
    }),
  Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) =>
    React.createElement('div', {
      'data-testid': `line-${dataKey}`,
      style: { borderColor: stroke }
    }),
  Area: ({ dataKey, fill }: { dataKey: string; fill: string }) =>
    React.createElement('div', {
      'data-testid': `area-${dataKey}`,
      style: { backgroundColor: fill }
    }),
  Cell: ({ fill }: { fill: string }) =>
    React.createElement('div', {
      'data-testid': 'pie-cell',
      style: { backgroundColor: fill }
    }),
  XAxis: ({ dataKey }: { dataKey: string }) =>
    React.createElement('div', {
      'data-testid': 'x-axis',
      'data-key': dataKey
    }),
  YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
  CartesianGrid: () => React.createElement('div', { 'data-testid': 'cartesian-grid' }),
  Tooltip: ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return React.createElement('div', { 'data-testid': 'tooltip' },
        `${payload[0].name}: $${payload[0].value?.toLocaleString()}`);
    }
    return null;
  },
  Legend: () => React.createElement('div', { 'data-testid': 'legend' }),
}));

// Mock D3 Sankey
vi.mock('d3-sankey', () => ({
  sankey: () => ({
    nodeWidth: vi.fn().mockReturnThis(),
    nodePadding: vi.fn().mockReturnThis(),
    extent: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnThis(),
    nodes: vi.fn().mockReturnValue([]),
    links: vi.fn().mockReturnValue([]),
  }),
  sankeyLinkHorizontal: () => vi.fn().mockReturnValue('M0,0L100,100'),
}));

// Mock Nivo charts
vi.mock('@nivo/treemap', () => ({
  ResponsiveTreeMap: ({ data }: { data: any }) =>
    React.createElement('div', {
      'data-testid': 'nivo-treemap',
      'data-nodes': data?.children?.length || 0
    }),
}));

vi.mock('@nivo/funnel', () => ({
  ResponsiveFunnel: ({ data }: { data: any[] }) =>
    React.createElement('div', {
      'data-testid': 'nivo-funnel',
      'data-length': data?.length || 0
    }),
}));

vi.mock('@nivo/sankey', () => ({
  ResponsiveSankey: ({ data }: { data: any }) =>
    React.createElement('div', {
      'data-testid': 'sankey-svg',
      'data-nodes': data?.nodes?.length || 0
    }),
}));

vi.mock('@nivo/calendar', () => ({
  ResponsiveCalendar: ({ data }: { data: any[] }) =>
    React.createElement('div', {
      'data-testid': 'nivo-calendar',
      'data-length': data?.length || 0
    }),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    section: ({ children, ...props }: any) => React.createElement('section', props, children),
    article: ({ children, ...props }: any) => React.createElement('article', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useParams: () => ({ year: '2024' }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  NavLink: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
}));

// Mock services
vi.mock('../src/services/ConsolidatedApiService', () => ({
  getYearlyData: vi.fn(),
  getBudgetData: vi.fn(),
  getContractData: vi.fn(),
  getDocumentData: vi.fn(),
}));

vi.mock('../src/services/ExternalDataService', () => ({
  externalDataService: {
    getBudgetData: vi.fn(),
    getContractData: vi.fn(),
    getGeographicData: vi.fn(),
    getOfficialDocuments: vi.fn(),
  },
}));

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Setup and teardown
beforeAll(() => {
  // Setup global test environment
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
  localStorageMock.clear();
});

afterAll(() => {
  // Clean up after all tests
  vi.restoreAllMocks();
});