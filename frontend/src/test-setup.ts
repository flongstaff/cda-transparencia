import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
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

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(),
    getEntriesByType: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  },
  writable: true
});

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
  console.log = vi.fn();
});

afterAll(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.log = originalConsole.log;
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
vi.stubEnv('VITE_CACHE_DURATION', '600000');
vi.stubEnv('VITE_RETRY_ATTEMPTS', '3');

// Global test utilities
export const createMockApiResponse = <T>(data: T, options: {
  success?: boolean;
  metadata?: any;
  error?: string;
} = {}) => ({
  success: options.success ?? true,
  data,
  metadata: {
    total_records: Array.isArray(data) ? data.length : 1,
    year: 2024,
    last_updated: '2024-01-01T00:00:00Z',
    source: 'municipal_system',
    data_quality: 'HIGH',
    currency: 'ARS',
    ...options.metadata
  },
  error: options.error ?? null
});

export const createMockDate = (dateStr: string) => {
  const mockDate = new Date(dateStr);
  vi.setSystemTime(mockDate);
  return mockDate;
};

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

// Chart test data factories
export const createMockBudgetData = (overrides: any = {}) => ({
  total_budgeted: 10000000,
  total_executed: 8500000,
  execution_rate: 85.0,
  categories: {
    'Educación': {
      budgeted: 3000000,
      executed: 2800000,
      execution_rate: 93.3,
      variance: -200000,
      variance_percentage: -6.7
    },
    'Salud': {
      budgeted: 2500000,
      executed: 2200000,
      execution_rate: 88.0,
      variance: -300000,
      variance_percentage: -12.0
    },
    ...overrides
  }
});

export const createMockDebtData = (overrides: any = {}) => [
  {
    id: '1',
    debt_type: 'Préstamos Bancarios',
    description: 'Préstamo para infraestructura',
    amount: 1000000,
    interest_rate: 5.5,
    due_date: '2024-12-31',
    status: 'active',
    principal_amount: 800000,
    accrued_interest: 200000,
    ...overrides
  }
];

export const createMockInvestmentData = (overrides: any = {}) => [
  {
    id: '1',
    asset_type: 'Infraestructura',
    description: 'Puente municipal',
    value: 5000000,
    depreciation: 500000,
    location: 'Centro',
    net_value: 4500000,
    age_years: 2,
    acquisition_date: '2022-01-01',
    category: 'infrastructure',
    condition: 'good',
    ...overrides
  }
];

// Mock network conditions
export const mockOnlineStatus = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: online,
  });

  // Trigger online/offline events
  const event = new Event(online ? 'online' : 'offline');
  window.dispatchEvent(event);
};

// Mock slow network
export const mockSlowNetwork = (delay: number = 3000) => {
  vi.stubGlobal('fetch', vi.fn(() =>
    new Promise(resolve => setTimeout(() => resolve({
      ok: true,
      json: () => Promise.resolve({}),
    }), delay))
  ));
};

// Mock network error
export const mockNetworkError = () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.reject(new Error('Network Error'))
  ));
};

// Accessibility test helpers
export const expectElementToBeAccessible = async (element: HTMLElement) => {
  // Check for basic ARIA requirements
  const hasAriaLabel = element.hasAttribute('aria-label');
  const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
  const hasRole = element.hasAttribute('role');
  
  expect(
    hasAriaLabel || hasAriaLabelledBy || hasRole,
    'Element should have aria-label, aria-labelledby, or role for accessibility'
  ).toBe(true);
};

export const expectProperFocusManagement = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  focusableElements.forEach(element => {
    expect(element).not.toHaveAttribute('tabindex', '-1');
  });
};

// Performance test helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// i18n test helper
export const createMockI18n = (lng = 'es') => ({
  init: vi.fn(),
  use: vi.fn(),
  t: vi.fn((key: string, options?: any) => {
    // Simple mock translation
    return key.replace(/\{\{(\w+)\}\}/g, (match, variable) => 
      options?.[variable] || match
    );
  }),
  changeLanguage: vi.fn(),
  language: lng,
  languages: [lng],
  exists: vi.fn(() => true),
});

// Component test wrapper with all providers
export const createTestWrapper = (options: {
  queryClient?: any;
  i18n?: any;
  theme?: 'light' | 'dark';
} = {}) => {
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
  const { I18nextProvider } = require('react-i18next');
  const React = require('react');
  
  const queryClient = options.queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const i18n = options.i18n || createMockI18n();

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(
          'div',
          { className: `theme-${options.theme || 'light'}` },
          children
        )
      )
    );
};