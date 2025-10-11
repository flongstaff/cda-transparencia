/**
 * Simplified Home Page - Professional Government Transparency Portal Landing
 * Serves as a welcoming introduction to the portal with key information
 */

import React, { useState } from 'react';
import {
  Shield,
  FileText,
  DollarSign,
  Building,
  TrendingUp,
  BarChart3,
  Calculator,
  Briefcase,
  LayoutDashboard,
  Search,
  ChevronRight,
  CheckCircle,
  Database,
  PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TransparencyHighlights from '@components/transparency/TransparencyHighlights';
import ErrorBoundary from '@components/common/ErrorBoundary';
import LoadingState from '@components/ui/LoadingState';
import { ChartContainer } from '@components/common/ChartContainer';
import UnifiedChart from '@components/charts/UnifiedChart';
import TimeSeriesChart from '@components/charts/TimeSeriesChart';


const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  // Quick access links
  const quickLinks = [
    {
      title: 'Dashboard Completo',
      description: 'Vista integral con todos los datos financieros y documentos organizados',
      path: '/completo',
      icon: <LayoutDashboard className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      stats: 'Documentos procesados',
      highlight: true
    },
    {
      title: 'Presupuesto Municipal',
      description: 'Análisis completo del presupuesto con datos extraídos de PDFs',
      path: '/budget',
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      stats: 'Datos actualizados del presupuesto'
    },
    {
      title: 'Ingresos y Recursos',
      description: 'Visualización de todos los ingresos municipales por categoría',
      path: '/revenue',
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      stats: 'CSV con datos de ingresos disponible'
    },
    {
      title: 'Centro de Datos',
      description: 'Visualizaciones interactivas de todos los archivos CSV, JSON y PDF',
      path: '/data-hub',
      icon: <Database className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      stats: 'Todas las fuentes de datos unificadas',
      highlight: true
    },
    {
      title: 'Tesorería Municipal',
      description: 'Gestión de fondos públicos y flujo de efectivo',
      path: '/treasury',
      icon: <Calculator className="w-6 h-6 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      stats: 'Administración financiera'
    },
    {
      title: 'Gastos y Ejecución',
      description: 'Estado de ejecución presupuestaria y análisis de gastos',
      path: '/expenses',
      icon: <Calculator className="w-6 h-6 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      stats: 'Datos de ejecución presupuestaria'
    },
    {
      title: 'Contratos y Licitaciones',
      description: 'Todos los contratos públicos y procesos de licitación',
      path: '/contracts',
      icon: <Briefcase className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      stats: 'Contratos organizados por categoría'
    },
    {
      title: 'Biblioteca de Documentos',
      description: 'Acceso completo a todos los documentos públicos organizados',
      path: '/documents',
      icon: <FileText className="w-6 h-6 text-gray-600" />,
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      stats: 'Categorías disponibles'
    }
  ];

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Documentos Públicos',
      value: '171',
      subtitle: 'Archivos PDF disponibles',
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Categorías de Datos',
      value: '7',
      subtitle: 'Tipos de información financiera',
      icon: <Database className="w-8 h-8 text-green-600" />,
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Archivos de Datos',
      value: '43',
      subtitle: 'Bases de datos estructuradas',
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Sistema Actualizado',
      value: new Date().getFullYear().toString(),
      subtitle: 'Última actualización',
      icon: <Shield className="w-8 h-8 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200'
    }
  ];

  // Loading state - for this page it's just a visual placeholder
  const loading = false;
  const error = null;
  const retry = () => {};

  return (
    <LoadingState 
      isLoading={loading} 
      error={error} 
      retry={retry}
      type="full-page"
      message="Cargando datos del portal de transparencia..."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Government Header Banner */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="px-8 py-12 sm:px-12 sm:py-16">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-2/3 mb-8 lg:mb-0">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl mr-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">
                      Portal de Transparencia
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Municipio de Carmen de Areco
                    </p>
                  </div>
                </div>

                <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                  Acceso ciudadano completo a la información financiera, administrativa y documental
                  del gobierno municipal. Todos los documentos organizados y datos procesados.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/completo"
                    className="px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Ver Dashboard Completo
                  </Link>
                  <Link
                    to="/data-hub"
                    className="px-8 py-4 bg-blue-900 bg-opacity-50 text-white rounded-xl font-semibold hover:bg-opacity-70 transition-all duration-300 inline-flex items-center border border-blue-400 hover:shadow-lg"
                  >
                    <Database className="w-5 h-5 mr-2" />
                    Centro de Datos
                  </Link>
                </div>
              </div>

              <div className="lg:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 shadow-xl transform transition-transform hover:scale-105">
                    <Building className="w-24 h-24 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    ACTIVO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TransparencyHighlights />

        {/* Call to Action for Dashboard Completo */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-dark-text-primary">Acceda al Dashboard Completo</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto dark:text-dark-text-secondary">
              Para ver todas las visualizaciones de datos financieros, análisis presupuestarios y documentos organizados en un solo lugar, visite nuestro dashboard integral.
            </p>
            <Link
              to="/completo"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Ir al Dashboard Completo
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Real-time Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
          {statisticsCards.map((card, index) => (
            <div
              key={index}
              className={`${card.color} border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 dark:bg-dark-surface dark:border-dark-border`}
            >
              <div className="flex items-center justify-between mb-3">
                {card.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1 dark:text-dark-text-primary">{card.value}</div>
                <div className="text-xs font-medium text-gray-900 mb-1 dark:text-dark-text-secondary">{card.title}</div>
                <div className="text-[0.6rem] text-gray-600 leading-tight dark:text-dark-text-tertiary">{card.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Quick Access */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Acceso Directo a Información</h2>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ver todo en el dashboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`${link.color} border rounded-lg p-4 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md dark:bg-dark-surface dark:border-dark-border`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white shadow-sm backdrop-blur-sm dark:bg-dark-surface-alt">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm dark:text-dark-text-primary">{link.title}</h3>
                      {link.highlight && (
                        <span className="bg-blue-600 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full font-medium">
                          COMPLETO
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mb-2 leading-relaxed dark:text-dark-text-secondary">{link.description}</p>
                    <div className="text-[0.6rem] text-gray-500 mb-2 font-medium dark:text-dark-text-tertiary">{link.stats}</div>
                    <div className="flex items-center text-blue-600 text-xs font-medium dark:text-blue-400">
                      <span>Acceder ahora</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Key Metrics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Document Processing Trends */}
          <ChartContainer
            title="Tendencias de Procesamiento de Documentos"
            description="Evolución histórica de documentos analizados"
            icon={BarChart3}
            height={350}
          >
            <TimeSeriesChart
              type="document_processing_trends"
              year={null}
              title="Documentos Procesados"
              height={300}
            />
          </ChartContainer>

          {/* Data Categories Distribution */}
          <ChartContainer
            title="Distribución de Documentos"
            description="Clasificación de información por tipo"
            icon={PieChart}
            height={350}
          >
            <ErrorBoundary>
              <React.Suspense fallback={<LoadingState />}>
                <UnifiedChart
                  type="document"
                  year={new Date().getFullYear()}
                  variant="pie"
                  height={300}
                />
              </React.Suspense>
            </ErrorBoundary>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Financial Data Growth */}
          <ChartContainer
            title="Tendencia Presupuestaria"
            description="Evolución del presupuesto a lo largo del tiempo"
            icon={TrendingUp}
            height={350}
          >
            <ErrorBoundary>
              <React.Suspense fallback={<LoadingState />}>
                <UnifiedChart
                  type="budget-trend"
                  year={new Date().getFullYear()}
                  variant="area"
                  height={300}
                />
              </React.Suspense>
            </ErrorBoundary>
          </ChartContainer>

          {/* Data Quality Metrics */}
          <ChartContainer
            title="Metrías de Calidad de Datos"
            description="Integridad y verificación de datos"
            icon={CheckCircle}
            height={350}
          >
            <UnifiedChart
              type="data_quality_metrics"
              year={new Date().getFullYear()}
              title="Calidad de Datos"
              height={300}
            />
          </ChartContainer>
        </div>

        {/* Comprehensive Data Overview */}
        <ChartContainer
          title="Visión Integral de Datos Públicos"
          description="Análisis completo del estado y disponibilidad de datos"
          icon={Database}
          height={450}
          className="mb-8"
        >
          <UnifiedChart
            type="comprehensive_data_overview"
            year={new Date().getFullYear()}
            title="Visión Integral"
            height={400}
          />
        </ChartContainer>

        {/* Advanced Search */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                Búsqueda Avanzada en Documentos
              </h2>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Busque en documentos organizados y datos estructurados
              </p>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="w-6 h-6 text-gray-400 dark:text-dark-text-tertiary absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en presupuestos, contratos, ejecución presupuestaria, estados financieros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-32 py-4 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-lg shadow-sm transition-all duration-300 bg-white dark:bg-dark-surface-alt text-gray-900 dark:text-dark-text-primary"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Buscar
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">Búsquedas populares:</span>
              {['presupuesto 2024', 'ejecución gastos', 'contratos', 'ingresos municipales', 'deuda pública'].map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchTerm(term)}
                  className="text-sm px-3 py-1 bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface hover:shadow-sm transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comprehensive Navigation - All Pages */}
        <div className="bg-gray-50 dark:bg-dark-surface-alt rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6 mb-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 text-center">
              Navegación Completa - Todas las Secciones
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {/* Financial Pages */}
              <Link to="/budget" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Presupuesto</span>
                </div>
              </Link>

              <Link to="/treasury" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Calculator className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Tesorería</span>
                </div>
              </Link>

              <Link to="/expenses" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Gastos</span>
                </div>
              </Link>

              <Link to="/revenue" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Ingresos</span>
                </div>
              </Link>

              <Link to="/debt" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Calculator className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Deuda</span>
                </div>
              </Link>

              <Link to="/investments" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Building className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Inversiones</span>
                </div>
              </Link>

              <Link to="/salaries" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Calculator className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Salarios</span>
                </div>
              </Link>

              <Link to="/contracts" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Briefcase className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Contratos</span>
                </div>
              </Link>

              <Link to="/documents" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <FileText className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Documentos</span>
                </div>
              </Link>

              <Link to="/reports" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <FileText className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Reportes</span>
                </div>
              </Link>

              <Link to="/audits" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Auditorías</span>
                </div>
              </Link>

              <Link to="/transparency" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Transparencia</span>
                </div>
              </Link>

              <Link to="/data-hub" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Database className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Centro Datos</span>
                </div>
              </Link>

              <Link to="/database" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Database className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Base Datos</span>
                </div>
              </Link>

              <Link to="/search" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Search className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Búsqueda</span>
                </div>
              </Link>

              <Link to="/about" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Building className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Acerca de</span>
                </div>
              </Link>

              <Link to="/contact" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <Building className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Contacto</span>
                </div>
              </Link>

              <Link to="/all-charts" className="p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-dark-border">
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Gráficos</span>
                </div>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                Todas las secciones del Portal de Transparencia disponibles desde esta página
              </p>
            </div>
          </div>
        </div>
      </div>
    </LoadingState>
  );
};


// Wrap with error boundary for production safety
const HomeWithErrorBoundary: React.FC = () => {
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
      <Home />
    </ErrorBoundary>
  );
};

export default HomeWithErrorBoundary;