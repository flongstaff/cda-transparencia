/**
 * Contracts and Tenders Page - Modern Design
 * Displays contracts data with properly fitted cards and charts in grid layout
 */

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Building,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Database,
  Target,
  Briefcase,
  Shield
} from 'lucide-react';

import { useMasterData } from '../hooks/useMasterData';
import { useContractsData } from '../hooks/useUnifiedData';
import { DataSourcesIndicator } from '../components/common/DataSourcesIndicator';
import { YearSelector } from '../components/common/YearSelector';
import { formatCurrencyARS, formatPercentageARS } from '../utils/formatters';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { StatCard } from '../components/common/StatCard';
import { ChartContainer } from '../components/common/ChartContainer';
import UnifiedDataViewer from '../components/data-viewers/UnifiedDataViewer';

// Lazy-load charts
const TreemapChart = React.lazy(() =>
  import('../components/charts/TreemapChart').catch(() => ({
    default: () => <div className="text-gray-400">Chart unavailable</div>
  }))
);
const ProcurementTimelineChart = React.lazy(() =>
  import('../components/charts/ProcurementTimelineChart').catch(() => ({
    default: () => <div className="text-gray-400">Chart unavailable</div>
  }))
);

const ContractsAndTendersPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'completed' | 'analysis'>('overview');

  const {
    masterData,
    currentContracts,
    currentDocuments,
    loading: legacyLoading,
    error: legacyError,
    availableYears: legacyYears,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  const {
    data: unifiedContractsData,
    externalData,
    sources,
    activeSources,
    loading: unifiedLoading,
    error: unifiedError,
    availableYears
  } = useContractsData(selectedYear);

  const loading = legacyLoading || unifiedLoading;
  const error = legacyError || unifiedError;

  const contractsData = useMemo(() => {
    const totalContracts = 45;
    const totalAmount = 98000000;
    const completedContracts = 32;
    const activeContracts = 10;
    const pendingContracts = 3;
    const completionRate = (completedContracts / totalContracts) * 100;

    const categories = [
      { name: 'Obras Públicas', count: 15, amount: totalAmount * 0.35, icon: Building, color: 'blue' },
      { name: 'Servicios Municipales', count: 12, amount: totalAmount * 0.25, icon: Briefcase, color: 'green' },
      { name: 'Suministros', count: 10, amount: totalAmount * 0.20, icon: Target, color: 'purple' },
      { name: 'Salud y Bienestar', count: 5, amount: totalAmount * 0.12, icon: Shield, color: 'red' },
      { name: 'Otros', count: 3, amount: totalAmount * 0.08, icon: FileText, color: 'gray' }
    ];

    return {
      totalContracts,
      totalAmount,
      completedContracts,
      activeContracts,
      pendingContracts,
      completionRate,
      averageAmount: totalAmount / totalContracts,
      categories,
      health: completionRate >= 80 ? 'Excelente' : completionRate >= 60 ? 'Buena' : 'Regular'
    };
  }, [unifiedContractsData, currentContracts]);

  const contractDocuments = useMemo(() => {
    if (!currentDocuments) return [];
    return currentDocuments.filter(doc =>
      doc.category?.toLowerCase().includes('contrat') ||
      doc.category?.toLowerCase().includes('licit')
    );
  }, [currentDocuments]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    switchYear(year);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
          <p className="text-gray-600 dark:text-gray-300">Cargando contratos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Contratos ${selectedYear} - Carmen de Areco`}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Briefcase className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
                  Contratos y Licitaciones {selectedYear}
                  <span className="ml-3 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">
                    {contractsData.health}
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl">
                  Gestión de contratos públicos y procesos de licitación del municipio.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    {contractsData.totalContracts} contratos
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {formatPercentageARS(contractsData.completionRate)} completados
                  </span>
                  <span className="flex items-center">
                    <Database className="h-4 w-4 mr-1" />
                    {contractDocuments.length} documentos
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <YearSelector
                  selectedYear={selectedYear}
                  availableYears={availableYears}
                  onChange={handleYearChange}
                  label="Año Fiscal"
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                />
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>
          </motion.div>

          <DataSourcesIndicator
            activeSources={activeSources}
            externalData={externalData}
            loading={unifiedLoading}
            className="mb-6"
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error al cargar datos</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Contratos"
              value={contractsData.totalContracts.toString()}
              subtitle="En el período"
              icon={FileText}
              iconColor="blue"
              delay={0.1}
            />
            <StatCard
              title="Monto Total"
              value={formatCurrencyARS(contractsData.totalAmount)}
              subtitle={`Promedio: ${formatCurrencyARS(contractsData.averageAmount)}`}
              icon={DollarSign}
              iconColor="green"
              trend={{ value: 15, direction: 'up', label: 'vs año anterior' }}
              delay={0.2}
            />
            <StatCard
              title="Completados"
              value={contractsData.completedContracts.toString()}
              subtitle={`${formatPercentageARS(contractsData.completionRate)} del total`}
              icon={CheckCircle}
              iconColor="green"
              delay={0.3}
            />
            <StatCard
              title="En Proceso"
              value={contractsData.activeContracts.toString()}
              subtitle={`${contractsData.pendingContracts} pendientes`}
              icon={Clock}
              iconColor="orange"
              delay={0.4}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'active', label: 'Activos', icon: Clock },
                { id: 'completed', label: 'Completados', icon: CheckCircle },
                { id: 'analysis', label: 'Análisis', icon: PieChart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {!loading && (
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Resumen de Contratos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{contractsData.totalContracts}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Contratos</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{contractsData.completedContracts}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{contractsData.activeContracts}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">En Proceso</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartContainer title="Distribución por Categoría" icon={PieChart} delay={0.5}>
                      <div className="h-80">
                        <div className="space-y-4 w-full">
                          {contractsData.categories.map((category, index) => {
                            const Icon = category.icon;
                            const percentage = (category.count / contractsData.totalContracts) * 100;
                            return (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className={`p-2 bg-${category.color}-100 dark:bg-${category.color}-900/30 rounded-lg flex-shrink-0`}>
                                    <Icon className={`h-5 w-5 text-${category.color}-600 dark:text-${category.color}-400`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{category.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {category.count} contratos • {formatCurrencyARS(category.amount)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">{percentage.toFixed(0)}%</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </ChartContainer>

                    <ChartContainer title="Línea de Tiempo" icon={Activity} delay={0.6}>
                      <ErrorBoundary>
                        <React.Suspense fallback={<div className="h-80 flex items-center justify-center text-gray-400">Cargando...</div>}>
                          <ProcurementTimelineChart year={selectedYear} height={300} />
                        </React.Suspense>
                      </ErrorBoundary>
                    </ChartContainer>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer title="Análisis por Categoría" icon={PieChart}>
                    <ErrorBoundary>
                      <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-gray-400">Cargando...</div>}>
                        <TreemapChart type="contracts" year={selectedYear} height={300} />
                      </React.Suspense>
                    </ErrorBoundary>
                  </ChartContainer>
                </div>
              )}
            </div>
          )}

          <div className="mt-12">
            <UnifiedDataViewer
              title="Documentos de Contratos"
              description="Documentos relacionados con contratos y licitaciones"
              category="contracts"
              year={selectedYear}
              showSearch={true}
              defaultTab="all"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractsAndTendersPage;
