import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Database,
  Activity,
  Globe,
  Shield,
  Users,
  Briefcase
} from 'lucide-react';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatCurrencyARS, formatPercentageARS } from '../utils/formatters';
import { useTransparencyData } from '../hooks/useTransparencyData';

// Import unified chart components
import ComprehensiveChart from '../components/charts/ComprehensiveChart';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import YearlyDataChart from '../components/charts/YearlyDataChart';

interface DashboardMetric {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  alert?: boolean;
  icon: React.ReactNode;
  description: string;
  change?: string;
}

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'documents' | 'audit'>('overview');

  // Use unified data hooks
  const {
    financialOverview,
    budgetBreakdown,
    documents,
    dashboard,
    auditOverview,
    loading,
    error,
    generated_at,
    actualDocCount,
    expectedDocCount
  } = useTransparencyData(selectedYear);

  // Generate available years
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Calculate derived metrics from unified data
  const transparencyScore = actualDocCount && expectedDocCount 
    ? Math.round((actualDocCount / expectedDocCount) * 100) 
    : 0;

  const documentCount = actualDocCount || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Cargando Panel de Transparencia
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Preparando la información municipal para el año {selectedYear}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Carga</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate metrics from unified data
  const dashboardMetrics: DashboardMetric[] = [
    {
      title: 'Presupuesto Total',
      value: formatCurrencyARS(financialOverview?.totalBudget || 0),
      description: 'Presupuesto total asignado para el año, distribuido en diferentes categorías municipales.',
      icon: <DollarSign className="w-6 h-6" />,
      trend: 'stable'
    },
    {
      title: 'Ejecución Presupuestaria',
      value: formatPercentageARS(financialOverview?.executionRate || 0),
      description: 'Porcentaje de presupuesto ejecutado en promedio por todas las áreas.',
      icon: <TrendingUp className="w-6 h-6" />,
      trend: 'up'
    },
    {
      title: 'Monto Ejecutado',
      value: formatCurrencyARS(financialOverview?.totalExecuted || 0),
      description: 'Monto total ejecutado del presupuesto municipal.',
      icon: <CheckCircle className="w-6 h-6" />,
      trend: 'up'
    },
    {
      title: 'Variación Presupuestaria',
      value: `${((financialOverview?.executionRate || 0) > 100 ? '+' : '')}${formatPercentageARS(((financialOverview?.executionRate || 0) - 100))}`,
      description: (financialOverview?.executionRate || 0) > 100 ? 'Sobreejecución presupuestaria' : 'Subejecución presupuestaria',
      icon: <Activity className="w-6 h-6" />,
      trend: 'stable'
    },
    {
      title: 'Documentos Disponibles',
      value: documentCount.toString(),
      description: `Total de documentos de transparencia disponibles para consulta pública.`,
      icon: <FileText className="w-6 h-6" />,
      trend: 'stable'
    },
    {
      title: 'Índice de Transparencia',
      value: `${transparencyScore}%`,
      description: 'Calificación de transparencia basada en documentos publicados.',
      icon: <Shield className="w-6 h-6" />,
      trend: transparencyScore >= 80 ? 'up' : transparencyScore >= 60 ? 'stable' : 'down',
      alert: transparencyScore < 60
    },
    {
      title: 'Deudas Municipales',
      value: formatCurrencyARS(financialOverview?.totalDebt || 0),
      description: 'Deudas que tiene que pagar el municipio actualmente.',
      icon: <AlertTriangle className="w-6 h-6" />,
      trend: 'stable'
    },
    {
      title: 'Sueldos Municipales',
      value: formatCurrencyARS(financialOverview?.totalSalaries || 0),
      description: 'Sueldos de empleados municipales pagados.',
      icon: <Users className="w-6 h-6" />,
      trend: 'stable'
    },
    {
      title: 'Compras y Obras',
      value: formatCurrencyARS(financialOverview?.totalContracts || 0),
      description: 'Contratos y obras realizadas por el municipio.',
      icon: <Briefcase className="w-6 h-6" />,
      trend: 'stable'
    },
    {
      title: 'Estado Sistema',
      value: transparencyScore >= 80 ? 'Óptimo' : transparencyScore >= 60 ? 'Bueno' : 'Disponible',
      description: `Sistema funcionando correctamente. Toda la información está publicada y actualizada.`,
      icon: <Database className="w-6 h-6" />,
      trend: 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                📊 Panel de Transparencia
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Portal de Transparencia Municipal - Carmen de Areco
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Última actualización: {generated_at ? new Date(generated_at).toLocaleString('es-AR') : 'Cargando...'}</span>
              </div>
            </div>
            
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
            />
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Resumen General', icon: <BarChart3 className="w-4 h-4" /> },
                { key: 'financial', label: 'Información Financiera', icon: <DollarSign className="w-4 h-4" /> },
                { key: 'documents', label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
                { key: 'audit', label: 'Auditoría', icon: <Shield className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {dashboardMetrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
                    metric.alert ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${
                      metric.alert ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 
                      metric.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                      metric.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {metric.icon}
                    </div>
                    {metric.trend && (
                      <div className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                        metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                         metric.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                         <Activity className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metric.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Budget Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    💰 Resumen Presupuestario {selectedYear}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Mirá en qué cosas se gasta la plata del municipio, para todos los vecinos de Carmen de Areco
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    💡 Pasá el cursor sobre cada gráfico para ver más detalles
                  </div>
                </div>
                <div className="p-6">
                  <BudgetAnalysisChart year={selectedYear} />
                </div>
              </div>

              {/* Document Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📋 Ejecución por Categorías
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Mirá cómo se ejecuta el presupuesto en cada área del municipio
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    💡 Podés ver el detalle de cada área haciendo click
                  </div>
                </div>
                <div className="p-6">
                  <DocumentAnalysisChart year={selectedYear} />
                </div>
              </div>

              {/* Yearly Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 col-span-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📈 Evolución Histórica
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Evolución de los principales indicadores financieros a lo largo de los años
                  </p>
                </div>
                <div className="p-6">
                  <YearlyDataChart year={selectedYear} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'financial' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Budget Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <ComprehensiveChart
                type="budget"
                year={selectedYear}
                title={`Análisis Presupuestario ${selectedYear}`}
                variant="bar"
                showControls={true}
                className="h-96"
              />
            </div>

            {/* Treasury Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <ComprehensiveChart
                type="treasury"
                year={selectedYear}
                title={`Análisis de Tesorería ${selectedYear}`}
                variant="line"
                showControls={true}
                className="h-96"
              />
            </div>

            {/* Debt Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <ComprehensiveChart
                type="debt"
                year={selectedYear}
                title={`Análisis de Deuda ${selectedYear}`}
                variant="pie"
                showControls={true}
                className="h-96"
              />
            </div>

            {/* Investment Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <ComprehensiveChart
                type="investment"
                year={selectedYear}
                title={`Inversiones Públicas ${selectedYear}`}
                variant="bar"
                showControls={true}
                className="h-96"
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Documentos de Transparencia
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Accede a todos los documentos oficiales del municipio para el año {selectedYear}
              </p>
              <Link 
                to="/documents"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Ver Todos los Documentos
              </Link>
            </div>
          </motion.div>
        )}

        {activeTab === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Auditoría y Control
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Información sobre auditorías y controles realizados en {selectedYear}
              </p>
              <Link 
                to="/audit"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Shield className="w-5 h-5 mr-2" />
                Ver Auditorías
              </Link>
            </div>
          </motion.div>
        )}

        {/* Footer Information */}
        <motion.div 
          className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-start">
            <Globe className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
            <div className="ml-3">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Compromiso con la Transparencia
              </h4>
              <p className="text-blue-800 dark:text-blue-200 mt-1">
                Esta plataforma garantiza el acceso libre y gratuito a toda la información pública municipal. 
                Nuestro índice de transparencia actual es del {transparencyScore}%, reflejando nuestro compromiso 
                con la apertura y rendición de cuentas hacia la ciudadanía de Carmen de Areco.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;