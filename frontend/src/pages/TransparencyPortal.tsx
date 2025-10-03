/**
 * Main Transparency Portal Page
 * Integrates all transparency features for Carmen de Areco
 * Based on the GitHub repository: https://github.com/flongstaff/cda-transparencia
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Shield,
  BarChart3,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Building,
  FileText,
  DollarSign,
  Calendar,
  Search,
  Download,
  RefreshCw,
  Eye,
  ExternalLink,
  Info
} from 'lucide-react';

import EnhancedTransparencyDashboard from '../components/dashboard/EnhancedTransparencyDashboard';
import OSINTMonitoringSystem from '../components/monitoring/OSINTMonitoringSystem';
import EnhancedDataVisualization from '../components/charts/EnhancedDataVisualization';
import PageYearSelector from '../components/forms/PageYearSelector';
import { useDashboardData } from '../hooks/useUnifiedData';
import { DataSourcesIndicator } from '../components/common/DataSourcesIndicator';
import { YearSelector } from '../components/common/YearSelector';
import ErrorBoundary from '../components/common/ErrorBoundary';

interface TransparencyPortalProps {
  initialYear?: number;
  municipality?: string;
}

const TransparencyPortal: React.FC<TransparencyPortalProps> = ({
  initialYear = new Date().getFullYear(),
  municipality = 'Carmen de Areco'
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeView, setActiveView] = useState<'dashboard' | 'monitoring' | 'data' | 'audit'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 🌐 Use UnifiedDataService with ALL external APIs
  const {
    data: dashboardData,
    externalData,
    sources,
    activeSources,
    loading,
    error,
    refetch,
    availableYears,
    liveDataEnabled
  } = useDashboardData(selectedYear);

  // Map data for backward compatibility
  const consolidatedData = dashboardData;
  const osintData = externalData;
  const auditFindings = dashboardData?.audits || [];
  const qualityMetrics = {
    dataQuality: activeSources.length,
    coverage: (activeSources.length / 8) * 100,
    lastUpdate: new Date().toISOString()
  };

  const views = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      description: 'Vista general del sistema de transparencia' 
    },
    { 
      id: 'monitoring', 
      label: 'Monitoreo OSINT', 
      icon: Globe, 
      description: 'Monitoreo de fuentes abiertas y verificación externa' 
    },
    { 
      id: 'data', 
      label: 'Datos Financieros', 
      icon: Database, 
      description: 'Análisis detallado de datos financieros municipales' 
    },
    { 
      id: 'audit', 
      label: 'Auditoría', 
      icon: Shield, 
      description: 'Resultados de auditoría y verificación de datos' 
    }
  ];

  const dataTypes = [
    { key: 'budget', label: 'Presupuesto', icon: DollarSign, color: 'blue' },
    { key: 'revenue', label: 'Ingresos', icon: TrendingUp, color: 'green' },
    { key: 'expenditure', label: 'Gastos', icon: TrendingUp, color: 'red' },
    { key: 'debt', label: 'Deuda', icon: FileText, color: 'orange' },
    { key: 'personnel', label: 'Personal', icon: Users, color: 'purple' },
    { key: 'contracts', label: 'Contratos', icon: Building, color: 'indigo' },
    { key: 'infrastructure', label: 'Infraestructura', icon: Building, color: 'teal' },
    { key: 'transparency', label: 'Transparencia', icon: Shield, color: 'gray' }
  ];

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const renderDashboardView = () => (
    <EnhancedTransparencyDashboard
      initialYear={selectedYear}
      municipality={municipality}
    />
  );

  const renderMonitoringView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Globe className="h-6 w-6 mr-2 text-blue-600" />
              Monitoreo OSINT - {municipality}
            </h2>
            <p className="text-gray-600 mt-1">
              Monitoreo de fuentes abiertas y verificación externa de datos municipales
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <OSINTMonitoringSystem
        year={selectedYear}
        municipality={municipality}
        showControls={true}
        autoRefresh={true}
        refreshInterval={300000}
      />
    </div>
  );

  const renderDataView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="h-6 w-6 mr-2 text-green-600" />
              Análisis de Datos Financieros - {selectedYear}
            </h2>
            <p className="text-gray-600 mt-1">
              Visualización detallada de datos financieros municipales
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dataTypes.map((dataType, index) => (
          <motion.div
            key={dataType.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <dataType.icon className={`h-5 w-5 mr-2 text-${dataType.color}-600`} />
                  {dataType.label}
                </h3>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Ver detalles"
                  aria-label="Ver detalles del gráfico"
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <EnhancedDataVisualization
                year={selectedYear}
                dataType={dataType.key as any}
                variant="dashboard"
                showControls={true}
                showExport={true}
                showFilters={true}
                className="h-64"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAuditView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-purple-600" />
              Auditoría y Verificación - {selectedYear}
            </h2>
            <p className="text-gray-600 mt-1">
              Resultados de auditoría y verificación de datos municipales
            </p>
          </div>
        </div>
      </div>

      {/* Data Quality Metrics */}
      {qualityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cobertura</p>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.coverage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completitud</p>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.completeness}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Precisión</p>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.accuracy}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Actualidad</p>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.timeliness}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Consistencia</p>
                <p className="text-2xl font-bold text-gray-900">{qualityMetrics.consistency}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Findings */}
      {auditFindings && auditFindings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Hallazgos de Auditoría
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {auditFindings.map((finding, index) => (
                <motion.div
                  key={finding.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{finding.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          finding.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          finding.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {finding.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          finding.status === 'open' ? 'bg-red-100 text-red-600' :
                          finding.status === 'investigating' ? 'bg-yellow-100 text-yellow-600' :
                          finding.status === 'resolved' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {finding.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{finding.description}</p>
                      <p className="text-blue-600 text-sm font-medium">{finding.recommendation}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Ver detalles del hallazgo"
                        aria-label="Ver detalles del hallazgo de auditoría"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Ver fuente externa"
                        aria-label="Ver fuente externa del hallazgo"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderViewContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboardView();
      case 'monitoring':
        return renderMonitoringView();
      case 'data':
        return renderDataView();
      case 'audit':
        return renderAuditView();
      default:
        return renderDashboardView();
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Portal de Transparencia - ${municipality} ${selectedYear}`}</title>
        <meta 
          name="description" 
          content={`Portal de transparencia municipal de ${municipality} con análisis financiero, monitoreo OSINT y auditoría de datos para el año ${selectedYear}`} 
        />
        <meta name="keywords" content="transparencia, municipal, presupuesto, gastos, ingresos, auditoría, OSINT, Carmen de Areco" />
        <meta property="og:title" content={`Portal de Transparencia - ${municipality} ${selectedYear}`} />
        <meta property="og:description" content={`Análisis completo de transparencia municipal con monitoreo de fuentes abiertas`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cda-transparencia.org" />
        <link rel="canonical" href="https://cda-transparencia.org" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Portal de Transparencia
                </h1>
                <p className="mt-2 text-gray-600">
                  {municipality} - Sistema integral de transparencia municipal con monitoreo OSINT
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <YearSelector
                  selectedYear={selectedYear}
                  availableYears={availableYears}
                  onChange={handleYearChange}
                  label="Año de consulta"
                  className="min-w-[200px]"
                />
              </div>
            </div>

            {/* Data Sources Indicator */}
            <div className="mt-6">
              <DataSourcesIndicator
                activeSources={activeSources}
                externalData={externalData}
                loading={loading}
                className="w-full"
              />
            </div>

            {/* Search Bar */}
            <div className="mt-6 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar información en el portal de transparencia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeView === view.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <view.icon className="h-4 w-4 mr-2" />
                  {view.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Cargando datos de transparencia...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error en el Sistema de Transparencia</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderViewContent()}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portal de Transparencia</h3>
                <p className="text-gray-600 text-sm">
                  Sistema integral de transparencia municipal con monitoreo OSINT y auditoría de datos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enlaces Útiles</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://carmendeareco.gob.ar" className="text-blue-600 hover:text-blue-800">
                      Sitio Oficial Municipal
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/flongstaff/cda-transparencia" className="text-blue-600 hover:text-blue-800">
                      Código Fuente
                    </a>
                  </li>
                  <li>
                    <a href="https://datos.gob.ar" className="text-blue-600 hover:text-blue-800">
                      Datos Abiertos Argentina
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
                <p className="text-gray-600 text-sm">
                  Portal desarrollado para promover la transparencia y el acceso a la información pública.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
              <p>&copy; 2025 Portal de Transparencia - {municipality}. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};


// Wrap with error boundary for production safety
const TransparencyPortalWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                      {error.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md"
                  >
                    Recargar
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <TransparencyPortal />
    </ErrorBoundary>
  );
};

export default TransparencyPortalWithErrorBoundary;
