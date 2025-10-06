import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Download, FileText, RefreshCw, BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import { useReportsData } from '../hooks/useUnifiedData';
import { DataSourcesIndicator } from '../components/common/DataSourcesIndicator';
import { YearSelector } from '../components/common/YearSelector';
import PageYearSelector from '../components/forms/PageYearSelector';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { UnifiedDataViewer } from '../components/data-viewers';
import { ChartContainer } from '../components/common/ChartContainer';
import UnifiedChart from '../components/charts/UnifiedChart';
import BudgetExecutionChart from '../components/charts/BudgetExecutionChart';
import ExpenditureReportChart from '../components/charts/ExpenditureReportChart';
import PersonnelExpensesChart from '../components/charts/PersonnelExpensesChart';
import DebtReportChart from '../components/charts/DebtReportChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';

const Reports: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Use unified master data service (legacy)
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    loading: legacyLoading,
    error: legacyError,
    totalDocuments,
    availableYears: legacyYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // 🌐 Use new UnifiedDataService with external APIs
  const {
    data: unifiedReportsData,
    externalData,
    sources,
    activeSources,
    loading: unifiedLoading,
    error: unifiedError,
    refetch: unifiedRefetch,
    availableYears,
    liveDataEnabled
  } = useReportsData(selectedYear);

  const loading = legacyLoading || unifiedLoading;
  const error = legacyError || unifiedError;
  
  // Get documents from the master data
  const documents = currentDocuments;

  // Load reports data (placeholder – replace with real API call if needed)
  const loadReportsDataForYear = async (year: number) => {
    // Simulate async load
    return new Promise<void>((resolve) => setTimeout(resolve, 200));
  };

  useEffect(() => {
    loadReportsDataForYear(selectedYear);
  }, [selectedYear, loadReportsDataForYear]);

  const filtered = documents?.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const memoizedCount = useMemo(() => filtered?.length ?? 0, [filtered]);

  // Calculate metrics for consolidated report section
  const metrics = useMemo(() => ({
    totalDocuments: currentDocuments?.length || 0,
    dataSources: dataSourcesActive,
    yearsCovered: availableYears
  }), [currentDocuments, dataSourcesActive, availableYears]);

  if (loading) return <p className="text-center py-8">Cargando reporte…</p>;
  if (error) return <p className="text-center text-red-600 dark:text-red-400 py-8">Error: {error}</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">📄 Informes Municipales</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Informes disponibles para el año {selectedYear}</p>
        </div>

        {/* The PageYearSelector already renders a <select>. Forward a label for accessibility. */}
        <PageYearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
          label="Año del informe"
        />
      </div>

      {/* Data Sources Indicator */}
      <DataSourcesIndicator
        activeSources={activeSources}
        externalData={externalData}
        loading={unifiedLoading}
        className="mb-6"
      />

      {/* Search */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 flex items-center">
        <Search className="mr-2 h-5 w-5 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary" />
        <input
          type="text"
          placeholder="Buscar informes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
        {loading && <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Cargando informes…</p>}
        {error && <p className="text-red-600 dark:text-red-400">Error: {error}</p>}
        {!loading && !error && (
          <>
            <p className="mb-4 text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              Se encontraron <strong>{memoizedCount}</strong> informes.
            </p>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Título</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Categoría</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                {filtered?.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-2">{doc.title}</td>
                    <td className="px-4 py-2">{doc.category}</td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Export button */}
            <div className="mt-4">
              <button
                title="Exportar informe"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Reporte Consolidado */}
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-indigo-600" />
          Reporte Consolidado
        </h1>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Documentos Totales</p>
            <p className="text-2xl font-semibold">{metrics.totalDocuments}</p>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Fuentes de Datos</p>
            <p className="text-2xl font-semibold">{metrics.dataSources}</p>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Años Cubiertos</p>
            <p className="text-2xl font-semibold">{metrics.yearsCovered.join(', ')}</p>
          </div>
        </div>

        {/* Lista de documentos principales */}
        <ul className="space-y-4">
          {filtered?.slice(0, 10).map((doc) => (
            <li key={doc.id} className="bg-white dark:bg-dark-surface rounded-xl shadow p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{doc.title}</p>
                <p className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{doc.category}</p>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={`/documents/${doc.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </a>
                {doc.url && (
                  <a
                    href={doc.url}
                    download
                    className="text-green-600 dark:text-green-400 hover:underline flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Unified Data Viewer - All Reports PDFs and Datasets */}
      <div className="mt-8">
        <UnifiedDataViewer
          title="Documentos y Datasets de Informes y Reportes"
          description="Acceda a todos los informes municipales, reportes económicos, auditorías y documentación oficial en formato PDF y datasets estructurados"
          category="economic_reports"
          theme={['econ', 'economia-y-finanzas', 'gove']}
          year={selectedYear}
          showSearch={true}
          defaultTab="all"
          maxPDFs={20}
          maxDatasets={30}
        />
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const ReportsWithErrorBoundary: React.FC = () => {
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
      <Reports />
    </ErrorBoundary>
  );
};

export default ReportsWithErrorBoundary;