// CarmenDeAreco.test.tsx
// Test file for Carmen de Areco components

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CarmenTransparencyDashboard from './CarmenTransparencyDashboard';
import CarmenLicitaciones from './CarmenLicitaciones';

// Mock the hooks
jest.mock('../../hooks/useCarmenDeArecoData', () => ({
  useCarmenDeArecoData: () => ({
    transparencyData: {
      status: 'success',
      data: {
        municipality: 'Carmen de Areco',
        province: 'Buenos Aires',
        country: 'Argentina',
        budget_overview: {
          current_year: 2024,
          total_budget: 1500000000,
          budget_by_area: [
            {
              area: 'Education',
              percentage: 25,
              amount: 375000000
            }
          ]
        },
        recent_licitaciones: [],
        transparency_indicators: {
          budget_accessibility: 95,
          document_availability: 87,
          public_engagement: 78,
          info_quality: 92
        },
        documents: []
      },
      message: 'Success',
      timestamp: new Date().toISOString(),
      source_data: {
        licitaciones_count: 0,
        available_years: [2024]
      }
    },
    licitacionesData: {
      status: 'success',
      data: {
        municipality: 'Carmen de Areco',
        province: 'Buenos Aires',
        country: 'Argentina',
        licitaciones: [],
        summary: {
          total_count: 0,
          year: 2024,
          total_amount: 0,
          active_statuses: []
        }
      },
      message: 'Success',
      timestamp: new Date().toISOString()
    },
    loading: false,
    error: null,
    refreshData: jest.fn()
  })
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Users: () => <div data-testid="users-icon" />,
  ShieldCheck: () => <div data-testid="shield-check-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />
}));

// Mock the formatter
jest.mock('../../utils/formatters', () => ({
  formatCurrencyARS: (value: number) => `$${value.toLocaleString('es-AR')}`
}));

// Mock the Card components
jest.mock('../ui/StandardizedCard', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CarmenDeAreco Components', () => {
  describe('CarmenTransparencyDashboard', () => {
    it('renders without crashing', () => {
      renderWithRouter(<CarmenTransparencyDashboard />);
      expect(screen.getByText('Transparencia Municipal - Carmen de Areco')).toBeInTheDocument();
    });

    it('displays municipality information', () => {
      renderWithRouter(<CarmenTransparencyDashboard />);
      expect(screen.getByText('Carmen de Areco')).toBeInTheDocument();
      expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
      expect(screen.getByText('Argentina')).toBeInTheDocument();
    });

    it('displays budget information', () => {
      renderWithRouter(<CarmenTransparencyDashboard />);
      expect(screen.getByText('Presupuesto 2024')).toBeInTheDocument();
      expect(screen.getByText('$1.500.000.000')).toBeInTheDocument();
    });

    it('displays transparency indicators', () => {
      renderWithRouter(<CarmenTransparencyDashboard />);
      expect(screen.getByText('95%')).toBeInTheDocument(); // budget_accessibility
      expect(screen.getByText('87%')).toBeInTheDocument(); // document_availability
      expect(screen.getByText('78%')).toBeInTheDocument(); // public_engagement
      expect(screen.getByText('92%')).toBeInTheDocument(); // info_quality
    });
  });

  describe('CarmenLicitaciones', () => {
    it('renders without crashing', () => {
      renderWithRouter(<CarmenLicitaciones />);
      expect(screen.getByText('Licitaciones Públicas - Carmen de Areco')).toBeInTheDocument();
    });

    it('displays municipality information', () => {
      renderWithRouter(<CarmenLicitaciones />);
      expect(screen.getByText('Carmen de Areco')).toBeInTheDocument();
      expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
      expect(screen.getByText('Argentina')).toBeInTheDocument();
    });

    it('displays summary information', () => {
      renderWithRouter(<CarmenLicitaciones />);
      expect(screen.getByText('Total Licitaciones')).toBeInTheDocument();
      expect(screen.getByText('Monto Total')).toBeInTheDocument();
      expect(screen.getByText('Año')).toBeInTheDocument();
      expect(screen.getByText('Estados Activos')).toBeInTheDocument();
    });
  });
});