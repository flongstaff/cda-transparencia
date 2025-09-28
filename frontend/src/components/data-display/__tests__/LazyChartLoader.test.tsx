import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LazyChartLoader from '../LazyChartLoader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the chart components
vi.mock('../charts/DebtAnalysisChart', () => ({
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
    render(<LazyChartLoader year={2024} />, {
      wrapper,
    });
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Cargando gráfico...')).toBeInTheDocument();
  });

  it('renders chart component after loading', async () => {
    render(<LazyChartLoader year={2024} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });
});
