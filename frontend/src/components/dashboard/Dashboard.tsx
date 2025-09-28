/**
 * Comprehensive Dashboard Component
 * Combines multiple data sources and visualizations into a single dashboard
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building, 
  Heart, 
  Wrench, 
  FileText, 
  TrendingDown, 
  Wallet, 
  ArrowUpDown, 
  Package, 
  Eye, 
  Shield, 
  Search, 
  Calendar, 
  Activity, 
  CheckCircle, 
  ArrowRight, 
  Database, 
  Award, 
  AlertTriangle, 
  CreditCard, 
  Mail, 
  Info, 
  Archive 
} from 'lucide-react';
import TimeSeriesChart from '../charts/TimeSeriesChart';
import BarChartComponent from '../charts/BarChartComponent';
import CorruptionAlert from '../alerts/CorruptionAlert';
import PageYearSelector from '../forms/PageYearSelector';

interface DashboardProps {
  year?: number;
  onYearChange?: (year: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  year = new Date().getFullYear(),
  onYearChange 
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(year);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle year change
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  // Mock data for demonstration
  const availableYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const totalDocuments = 171;
  const totalRevenue = 500;
  const totalExpenses = 7;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
              Dashboard de Transparencia
            </h1>
            <p className="mt-2 text-gray-600 dark:text-dark-text-secondary">
              Vista integral con todos los datos financieros y documentos organizados
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              availableYears={availableYears}
              size="md"
              label="Año de consulta"
              showDataAvailability={true}
              className="min-w-[200px]"
              aria-label="Selector de año para datos de transparencia"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-dark-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar información en el portal de transparencia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary">Documentos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{totalDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary">Filas de Datos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary">Archivos CSV</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{totalExpenses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary">Año</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{selectedYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <TimeSeriesChart 
            csvUrl={`/data/charts/Budget_Execution_consolidated_${selectedYear}.csv`}
            title="Evolución Presupuestaria"
            height={400}
          />
        </div>
        
        <div>
          <BarChartComponent
            csvUrl={`/data/charts/Expenditure_Report_consolidated_${selectedYear}.csv`}
            title="Distribución de Gastos"
            height={400}
            compareMode={true}
          />
        </div>
      </div>

      {/* Correlation Analysis */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
          Análisis de Correlación
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Ingresos vs Ejecución</h3>
            </div>
            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">
              Análisis de correlación entre ingresos presupuestarios y su ejecución real
            </p>
            <div className="h-48 bg-gray-50 dark:bg-dark-surface-alt rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-dark-text-tertiary">Gráfico de correlación</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Tendencia Temporal</h3>
            </div>
            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">
              Seguimiento de tendencias en ejecución presupuestaria a lo largo del tiempo
            </p>
            <div className="h-48 bg-gray-50 dark:bg-dark-surface-alt rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-dark-text-tertiary">Gráfico de tendencias</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Indicadores de Eficiencia</h3>
            </div>
            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">
              Métricas de eficiencia en la ejecución de diferentes categorías presupuestarias
            </p>
            <div className="h-48 bg-gray-50 dark:bg-dark-surface-alt rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-dark-text-tertiary">Indicadores de eficiencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
          Alertas de Transparencia
        </h2>
        
        <div className="space-y-4">
          <CorruptionAlert
            type="low_execution"
            title="Tasa de Ejecución Baja"
            description="La ejecución presupuestaria para gastos de infraestructura está por debajo del 50% en el último trimestre"
            severity="high"
            value={45.2}
            expected={75.0}
          />
          
          <CorruptionAlert
            type="high_execution"
            title="Ejecución Presupuestaria Alta"
            description="Los gastos en consultorías han excedido el presupuesto en un 35%"
            severity="medium"
            value={135.0}
            expected={100.0}
          />
          
          <CorruptionAlert
            type="variance_spike"
            title="Varianza Anormal Detectada"
            description="Variación inusual en gastos de personal entre meses consecutivos"
            severity="low"
            value={25.7}
            expected={5.0}
          />
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
            Fuentes de Datos
          </h2>
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-semibold">Sistema Activo</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Presupuesto', 'Contratos', 'Documentos', 'Personal'].map((source, index) => (
            <div 
              key={index} 
              className="p-4 bg-gray-50 dark:bg-dark-surface-alt rounded-lg border border-gray-200 dark:border-dark-border"
            >
              <div className="flex items-center">
                <div className="p-2 bg-white dark:bg-dark-surface rounded-lg mr-3">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">{source}</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">Actualizado</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;