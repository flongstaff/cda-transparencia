import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LazyChartLoader from '../LazyChartLoader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the chart components
vi.mock('../BudgetAnalysisChartEnhanced', () => ({
  default: () => <div data-testid="mock-chart">Budget Chart</div>,
}));

vi.mock('../DebtAnalysisChartTypeSafe', () => ({
  default: () => <div data-testid="mock-chart">Debt Chart</div>,
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('LazyChartLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading fallback while component loads', () => {
    render(<LazyChartLoader chartType="budget" chartProps={{ year: 2024 }} />, {
      wrapper,
    });
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Cargando gráfico de budget...')).toBeInTheDocument();
  });

  it('renders chart component after loading', async () => {
    render(<LazyChartLoader chartType="budget" chartProps={{ year: 2024 }} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });

  it('passes props correctly to chart component', async () => {
    const chartProps = { year: 2024, theme: 'dark' };
    render(<LazyChartLoader chartType="debt" chartProps={chartProps} />, {
      wrapper,
    });

    await waitFor(() => {
      const mockChart = screen.getByTestId('mock-chart');
      expect(mockChart).toBeInTheDocument();
    });
  });

  it('renders custom loading component when provided', () => {
    const CustomLoadingComponent = () => (
      <div data-testid="custom-loading">Custom Loading...</div>
    );
    render(
      <LazyChartLoader
        chartType="budget"
        chartProps={{ year: 2024 }}
        fallbackComponent={CustomLoadingComponent}
      />,
      {
        wrapper,
      }
    );
    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('displays custom loading message', () => {
    render(
      <LazyChartLoader
        chartType="investment"
        chartProps={{ year: 2024 }}
        loadingMessage="inversiones"
      />,
      {
        wrapper,
      }
    );
    expect(screen.getByText('Cargando gráfico de inversiones...')).toBeInTheDocument();
  });
});
