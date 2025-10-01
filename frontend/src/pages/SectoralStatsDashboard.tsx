/**
 * Sectoral Statistics Dashboard
 *
 * Comprehensive dashboard showing statistics and performance metrics across
 * key municipal sectors: Health, Education, Infrastructure, and Social Services
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  GraduationCap,
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Shield,
  Calendar,
  Database,
  ArrowUpCircle,
  ArrowDownCircle,
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import HealthStatisticsChart from '../components/charts/HealthStatisticsChart';
import EducationDataChart from '../components/charts/EducationDataChart';
import InfrastructureProjectsChart from '../components/charts/InfrastructureProjectsChart';
import UnifiedChart from '../components/charts/UnifiedChart';
import TreemapChart from '../components/charts/TreemapChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import RadarChart from '../components/charts/RadarChart';
import { useMasterData } from '../hooks/useMasterData';
import { formatCurrencyARS as formatCurrency, formatNumberARS as formatNumber } from '../utils/formatters';
import { motion } from 'framer-motion';

interface SectorKPI {
  sector: string;
  budget: number;
  spent: number;
  executionRate: number;
  beneficiaries: number;
  projects: number;
  satisfaction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface SectorMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
}

const SectoralStatsDashboard: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<'overview' | 'health' | 'education' | 'infrastructure' | 'social'>('overview');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'comparison' | 'projects'>('summary');

  const {
    availableYears,
    loading,
    error,
    switchYear
  } = useMasterData(selectedYear);

  // Mock sectoral KPIs data (in production, this would come from real APIs)
  const sectorKPIs: SectorKPI[] = useMemo(() => [
    {
      sector: 'Salud',
      budget: 245000000,
      spent: 198500000,
      executionRate: 81.0,
      beneficiaries: 8245,
      projects: 12,
      satisfaction: 87.5,
      trend: 'increasing'
    },
    {
      sector: 'Educación',
      budget: 189000000,
      spent: 175300000,
      executionRate: 92.8,
      beneficiaries: 3456,
      projects: 8,
      satisfaction: 91.2,
      trend: 'increasing'
    },
    {
      sector: 'Infraestructura',
      budget: 156000000,
      spent: 142800000,
      executionRate: 91.5,
      beneficiaries: 15780,
      projects: 15,
      satisfaction: 78.3,
      trend: 'stable'
    },
    {
      sector: 'Servicios Sociales',
      budget: 98000000,
      spent: 89200000,
      executionRate: 91.0,
      beneficiaries: 2134,
      projects: 6,
      satisfaction: 85.6,
      trend: 'stable'
    }
  ], []);

  // Health sector metrics
  const healthMetrics: SectorMetric[] = [
    { name: 'Atenciones Médicas', value: 24580, unit: 'consultas/mes', change: 8.5, target: 25000, status: 'good' },
    { name: 'Vacunación COVID', value: 89.2, unit: '%', change: 2.1, target: 90, status: 'good' },
    { name: 'Tiempo Espera', value: 18, unit: 'minutos', change: -12.3, target: 15, status: 'warning' },
    { name: 'Camas Disponibles', value: 78, unit: '%', change: 5.2, target: 85, status: 'warning' }
  ];

  // Education sector metrics
  const educationMetrics: SectorMetric[] = [
    { name: 'Matrícula Escolar', value: 3456, unit: 'estudiantes', change: 3.2, target: 3500, status: 'good' },
    { name: 'Asistencia Promedio', value: 94.8, unit: '%', change: 1.8, target: 95, status: 'good' },
    { name: 'Deserción Escolar', value: 2.1, unit: '%', change: -15.2, target: 2.0, status: 'warning' },
    { name: 'Docentes Capacitados', value: 87.3, unit: '%', change: 12.5, target: 90, status: 'good' }
  ];

  // Infrastructure sector metrics
  const infrastructureMetrics: SectorMetric[] = [
    { name: 'Obras Finalizadas', value: 12, unit: 'proyectos', change: 20.0, target: 15, status: 'good' },
    { name: 'Calles Reparadas', value: 8.5, unit: 'km', change: 15.6, target: 10, status: 'good' },
    { name: 'Alumbrado Público', value: 92.1, unit: '% funcional', change: 3.8, target: 95, status: 'good' },
    { name: 'Red Cloacal', value: 76.4, unit: '% cobertura', change: 8.2, target: 85, status: 'warning' }
  ];

  // Budget allocation data for treemap
  const budgetAllocation = useMemo(() => {
    return sectorKPIs.map(sector => ({
      name: sector.sector,
      value: sector.budget,
      children: [{ name: sector.sector, value: sector.budget }]
    }));
  }, [sectorKPIs]);

  // Performance comparison data for radar chart
  const performanceData = useMemo(() => {
    return sectorKPIs.map(sector => ({
      sector: sector.sector,
      ejecucion: sector.executionRate,
      satisfaccion: sector.satisfaction,
      beneficiarios: (sector.beneficiaries / 20000) * 100, // Normalize to percentage
      proyectos: (sector.projects / 20) * 100 // Normalize to percentage
    }));
  }, [sectorKPIs]);

  const getSectorIcon = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'salud':
        return Heart;
      case 'educación':
        return GraduationCap;
      case 'infraestructura':
        return Building2;
      case 'servicios sociales':
        return Users;
      default:
        return BarChart3;
    }
  };

  const getSectorColor = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'salud':
        return 'text-red-600';
      case 'educación':
        return 'text-blue-600';
      case 'infraestructura':
        return 'text-green-600';
      case 'servicios sociales':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Error al cargar datos sectoriales</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Estadísticas Sectoriales {selectedYear}
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary text-lg">
              Análisis integral del desempeño en Salud, Educación, Infraestructura y Servicios Sociales
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => switchYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* View Mode Selector */}
            <div className="flex rounded-lg border border-gray-300 dark:border-dark-border overflow-hidden">
              {(['summary', 'detailed', 'comparison', 'projects'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-alt'
                  }`}
                >
                  {mode === 'summary' ? 'Resumen' :
                   mode === 'detailed' ? 'Detallado' :
                   mode === 'comparison' ? 'Comparación' : 'Proyectos'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sector Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen General', icon: BarChart3 },
              { id: 'health', name: 'Salud', icon: Heart },
              { id: 'education', name: 'Educación', icon: GraduationCap },
              { id: 'infrastructure', name: 'Infraestructura', icon: Building2 },
              { id: 'social', name: 'Servicios Sociales', icon: Users }
            ].map((sector) => {
              const Icon = sector.icon;
              return (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector.id as any)}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-sm font-medium text-center hover:text-blue-600 focus:z-10 ${
                    selectedSector === sector.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <span className="truncate">{sector.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <ErrorBoundary>
        {selectedSector === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sectorKPIs.map((sector, index) => {
                const Icon = getSectorIcon(sector.sector);
                const colorClass = getSectorColor(sector.sector);

                return (
                  <motion.div
                    key={sector.sector}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-8 h-8 ${colorClass}`} />
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        sector.executionRate > 85 ? 'bg-green-50 text-green-600 border border-green-200' :
                        sector.executionRate > 75 ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {sector.executionRate}% ejecución
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                      {sector.sector}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-secondary">Presupuesto:</span>
                        <span className="font-medium">{formatCurrency(sector.budget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-secondary">Beneficiarios:</span>
                        <span className="font-medium">{formatNumber(sector.beneficiaries)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-secondary">Satisfacción:</span>
                        <span className="font-medium">{sector.satisfaction}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Budget Allocation and Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6">
                  Distribución Presupuestaria
                </h3>
                <div className="h-80">
                  <TreemapChart
                    data={budgetAllocation}
                    height={320}
                    title="Presupuesto por Sector"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6">
                  Comparación de Desempeño
                </h3>
                <div className="h-80">
                  <RadarChart
                    data={performanceData}
                    height={320}
                    title="Indicadores de Performance"
                  />
                </div>
              </motion.div>
            </div>

            {/* Overall Metrics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6">
                Métricas Consolidadas {selectedYear}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatCurrency(sectorKPIs.reduce((sum, s) => sum + s.budget, 0))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Presupuesto Total</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatNumber(sectorKPIs.reduce((sum, s) => sum + s.beneficiaries, 0))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Beneficiarios Totales</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {sectorKPIs.reduce((sum, s) => sum + s.projects, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Proyectos Activos</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedSector === 'health' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <Heart className="w-6 h-6 text-red-600 mr-2" />
                Estadísticas de Salud
              </h3>

              {/* Health Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {metric.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status === 'good' ? 'Bien' : metric.status === 'warning' ? 'Atención' : 'Crítico'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                      {formatNumber(metric.value)} {metric.unit}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {metric.change > 0 ? (
                        <ArrowUpCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(metric.change)}% vs mes anterior
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Health Statistics Chart */}
              <div className="h-96">
                <HealthStatisticsChart
                  height={384}
                  chartType="line"
                  showFilters={true}
                />
              </div>
            </motion.div>
          </div>
        )}

        {selectedSector === 'education' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <GraduationCap className="w-6 h-6 text-blue-600 mr-2" />
                Estadísticas Educativas
              </h3>

              {/* Education Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {educationMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {metric.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status === 'good' ? 'Bien' : metric.status === 'warning' ? 'Atención' : 'Crítico'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                      {formatNumber(metric.value)} {metric.unit}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {metric.change > 0 ? (
                        <ArrowUpCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(metric.change)}% vs año anterior
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education Data Chart */}
              <div className="h-96">
                <EducationDataChart
                  height={384}
                  chartType="bar"
                  showFilters={true}
                />
              </div>
            </motion.div>
          </div>
        )}

        {selectedSector === 'infrastructure' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <Building2 className="w-6 h-6 text-green-600 mr-2" />
                Estadísticas de Infraestructura
              </h3>

              {/* Infrastructure Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {infrastructureMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {metric.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status === 'good' ? 'Bien' : metric.status === 'warning' ? 'Atención' : 'Crítico'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                      {formatNumber(metric.value)} {metric.unit}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {metric.change > 0 ? (
                        <ArrowUpCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(metric.change)}% vs año anterior
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infrastructure Projects Chart */}
              <div className="h-96">
                <InfrastructureProjectsChart
                  height={384}
                  chartType="timeline"
                  showFilters={true}
                />
              </div>
            </motion.div>
          </div>
        )}

        {selectedSector === 'social' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center">
                <Users className="w-6 h-6 text-purple-600 mr-2" />
                Servicios Sociales
              </h3>

              {/* Social Services Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { title: 'Programas Sociales', value: 8, change: 14.3, icon: Target },
                  { title: 'Familias Asistidas', value: 1247, change: 8.9, icon: Users },
                  { title: 'Ayudas Entregadas', value: 3456, change: 22.1, icon: CheckCircle }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="p-6 border border-gray-200 dark:border-dark-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-8 h-8 text-purple-600" />
                        <span className="text-sm px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                          +{item.change}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                        {formatNumber(item.value)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        {item.title}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Social Programs Chart */}
              <div className="h-96">
                <UnifiedChart
                  type="social"
                  year={selectedYear}
                  variant="bar"
                  height={384}
                />
              </div>
            </motion.div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default SectoralStatsDashboard;