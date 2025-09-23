import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import UIDemoPage from '../pages/UIDemoPage';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  DollarSign: () => <svg data-testid="dollar-sign-icon" />,
  TrendingUp: () => <svg data-testid="trending-up-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  PieChart: () => <svg data-testid="pie-chart-icon" />,
  Coins: () => <svg data-testid="coins-icon" />,
  CreditCard: () => <svg data-testid="credit-card-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  Users: () => <svg data-testid="users-icon" />,
  BarChart3: () => <svg data-testid="bar-chart-icon" />,
  Activity: () => <svg data-testid="activity-icon" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
  Globe: () => <svg data-testid="globe-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  TrendingDown: () => <svg data-testid="trending-down-icon" />,
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}));

describe('UIDemoPage', () => {
  it('renders without crashing', () => {
    render(<UIDemoPage />);
    
    expect(screen.getByText('Demo de Componentes UI')).toBeInTheDocument();
    expect(screen.getByText('Vista previa de los nuevos componentes de interfaz de usuario')).toBeInTheDocument();
  });

  it('renders all component sections', () => {
    render(<UIDemoPage />);
    
    expect(screen.getByText('Financial Category Navigation')).toBeInTheDocument();
    expect(screen.getByText('Financial Health Score Card')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de Salud Financiera')).toBeInTheDocument();
    expect(screen.getByText('Puntaje de Transparencia')).toBeInTheDocument();
    expect(screen.getByText('Tarjetas de Métricas Mejoradas')).toBeInTheDocument();
    expect(screen.getByText('Insignia de Verificación de Datos')).toBeInTheDocument();
  });

  it('renders category navigation with sample categories', () => {
    render(<UIDemoPage />);
    
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Presupuesto')).toBeInTheDocument();
    expect(screen.getByText('Ingresos')).toBeInTheDocument();
    expect(screen.getByText('Gastos')).toBeInTheDocument();
    expect(screen.getByText('Deuda')).toBeInTheDocument();
    expect(screen.getByText('Inversiones')).toBeInTheDocument();
  });

  it('renders sample financial health score cards', () => {
    render(<UIDemoPage />);
    
    expect(screen.getByText('Overall Financial Health')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders sample transparency score cards', () => {
    render(<UIDemoPage />);
    
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders sample enhanced metric cards', () => {
    render(<UIDemoPage />);
    
    expect(screen.getByText('Ejecución Presupuestaria')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Ingresos Recaudados')).toBeInTheDocument();
    expect(screen.getByText('$12.4M')).toBeInTheDocument();
    expect(screen.getByText('Ratio de Deuda')).toBeInTheDocument();
    expect(screen.getByText('18.5%')).toBeInTheDocument();
    expect(screen.getByText('Documentos Totales')).toBeInTheDocument();
    expect(screen.getByText('192')).toBeInTheDocument();
    expect(screen.getByText('Presupuesto Total')).toBeInTheDocument();
    expect(screen.getByText('$24.5M')).toBeInTheDocument();
    expect(screen.getByText('Contratos Activos')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders sample data verification badges', () => {
    render(<UIDemoPage />);
    
    expect(screen.getByText('Verificado')).toBeInTheDocument();
    expect(screen.getByText('Procesando')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});