import React from 'react';
import { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMasterData } from '../hooks/useMasterData';
import { useAuditsData } from '../hooks/useUnifiedData';
import { DataSourcesIndicator } from '@components/common/DataSourcesIndicator';
import { YearSelector } from '@components/common/YearSelector';
import UnifiedTransparencyService from '../services/UnifiedTransparencyService';
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Loader2, Shield, Search, TrendingUp, RefreshCw } from 'lucide-react';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { UnifiedDataViewer } from '@components/data-viewers';
import ChartAuditReport from '@components/charts/ChartAuditReport';
import TimeSeriesAnomalyChart from '@components/charts/TimeSeriesAnomalyChart';
import FiscalBalanceReportChart from '@components/charts/FiscalBalanceReportChart';
import UnifiedChart from '@components/charts/UnifiedChart';

// Define TypeScript interfaces
interface AuditResult {
  id: string;
  year: number;
  local: number;
  external: number;
  discrepancy: number;
}

interface AuditSummary {
  status: string;
  external_sources: number;
  discrepancies: number;
  recommendations: number;
}

interface DataFlag {
  message: string;
  severity: 'high' | 'medium' | 'low';
  recommendation?: string;
  source: string;
}

interface ExternalDataset {
  id: string;
  title: string;
  year?: number;
  organization: string;
  last_modified: string;
}

interface AuditResults {
  external_datasets: ExternalDataset[];
}

const Audits: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [dataFlags, setDataFlags] = useState<DataFlag[]>([]);
  const [loadingAudits, setLoadingAudits] = useState<boolean>(true);
  
  // Use unified master data service (legacy)
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    currentDebt,
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
    data: unifiedAuditsData,
    externalData,
    sources,
    activeSources,
    loading: unifiedLoading,
    error: unifiedError,
    refetch: unifiedRefetch,
    availableYears,
    liveDataEnabled
  } = useAuditsData(selectedYear);

  const loading = legacyLoading || unifiedLoading;
  const error = legacyError || unifiedError;

  // Load audit data
  useEffect(() => {
    const loadAuditData = async () => {
      try {
        setLoadingAudits(true);
        const [results, summary, flags] = await Promise.all([
          UnifiedTransparencyService.getAuditData(),
          UnifiedTransparencyService.getAuditData(), // This will get audit summary
          UnifiedTransparencyService.getAuditData()  // This will get data flags
        ]);

        // Extract audit data properly
        setAuditResults({
          external_datasets: results.external_datasets || []
        });
        setAuditSummary(results.summary || {
          status: 'unknown',
          external_sources: 0,
          discrepancies: 0,
          recommendations: 0
        });
        setDataFlags(results.flags || []);
      } catch (error) {
        console.error('Error loading audit data:', error);
      } finally {
        setLoadingAudits(false);
      }
    };

    loadAuditData();
  }, []);

  // Get discrepancies data from masterData
  const discrepancies = masterData?.chartsData.comprehensive?.discrepancies || [];

  // Prepare data for chart
  const auditData = discrepancies.map(item => ({
    year: item.year,
    local: item.local || item.localAmount || 0,
    external: item.external || item.externalAmount || 0,
    discrepancy: Math.abs(item.discrepancy || 0)
  }));

  // Define columns for the table
  const columns = [
    { Header: 'Año', accessor: 'year' },
    { 
      Header: 'Monto Local (ARS)', 
      accessor: 'local',
      Cell: ({ value }: { value: number }) => value ? `${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'
    },
    { 
      Header: 'Monto Externo (ARS)', 
      accessor: 'external',
      Cell: ({ value }: { value: number }) => value ? `${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'
    },
    { 
      Header: 'Discrepancia (ARS)', 
      accessor: 'discrepancy',
      Cell: ({ value }: { value: number }) => {
        const discrepancy = Math.abs(value);
        return (
          <span className={discrepancy > 10000 ? 'text-red-600 font-semibold' : 'text-green-600'}>
            $ {discrepancy.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
    },
  ];

  // Create table instance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: discrepancies,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando datos de auditorías...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-1">
                Auditorías y Control de Transparencia {selectedYear}
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary text-sm">
                Verificación automática de datos locales vs. fuentes externas oficiales
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-3 shadow-sm">
                <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-1">
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => switchYear(Number(e.target.value))}
                  className="w-full md:w-40 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-dark-border rounded-md
                           bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                           transition-colors"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year} {year === new Date().getFullYear() && '(Actual)'}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                  Datos {selectedYear}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loadingAudits && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600 dark:text-blue-400 mr-2" />
            <span>Cargando auditorías...</span>
          </div>
        )}

        {/* Audit Summary Cards */}
        {auditSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">Estado General</h3>
              <div className="mt-2 flex items-center">
                {auditSummary.status === 'healthy' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                )}
                <span className="text-lg font-bold capitalize">{auditSummary.status}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">Fuentes Externas</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{auditSummary.external_sources}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">datasets encontrados</p>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">Discrepancias</h3>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{auditSummary.discrepancies}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">diferencias detectadas</p>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">Recomendaciones</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{auditSummary.recommendations}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">mejoras sugeridas</p>
            </div>
          </div>
        )}

        {/* Data Quality Flags */}
        {dataFlags.length > 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-4">
              <AlertTriangle className="inline-block w-5 h-5 mr-2" />
              Alertas de Calidad de Datos
            </h2>
            <div className="space-y-3">
              {dataFlags.map((flag, index) => (
                <div
                  key={index}
                  className={`flex items-start p-4 rounded-lg border-l-4 ${
                    flag.severity === 'high' ? 'bg-red-50 border-red-400' :
                    flag.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex-shrink-0 mr-3">
                    {flag.severity === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : flag.severity === 'medium' ? (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{flag.message}</p>
                    {flag.recommendation && (
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">
                        <strong>Recomendación:</strong> {flag.recommendation}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase">{flag.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Data Sources */}
        {auditResults?.external_datasets && auditResults.external_datasets.length > 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-4">
              <ExternalLink className="inline-block w-5 h-5 mr-2" />
              Fuentes de Datos Externas Detectadas
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                      Dataset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                      Organización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                      Última Actualización
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                  {auditResults.external_datasets.map((dataset: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                        {dataset.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                        {dataset.year || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                        {dataset.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                        {new Date(dataset.last_modified).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Red Flag Analysis Section - Prominently displayed on Audits page */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-700 p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">🚩 Análisis de Banderas Rojas</h2>
                <p className="text-red-700 dark:text-red-300">Detección automática de anomalías en datos municipales</p>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-lg p-4">
              <ErrorBoundary>
                <ChartAuditReport
                  analysis="overview"
                  year={selectedYear}
                  height={400}
                  interactive={true}
                  showTitle={false}
                  showDescription={false}
                />
              </ErrorBoundary>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Información Importante
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      ⚖️ Disclaimer: Estos análisis usan datos oficiales del Municipio de Carmen de Areco. 
                      Las banderas rojas detectadas requieren investigación adicional. 
                      Invitamos a la gestión municipal a verificar estas discrepancias.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Enhanced Audit Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Time Series Anomaly Detection */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2 text-red-600" />
              Detección de Anomalías
            </h3>
            <div className="h-64">
              <ErrorBoundary>
                <TimeSeriesAnomalyChart
                  year={selectedYear}
                  height={250}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Fiscal Balance Report */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Balance Fiscal
            </h3>
            <div className="h-64">
              <ErrorBoundary>
                <FiscalBalanceReportChart
                  year={selectedYear}
                  height={250}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Unified Multi-Source Chart */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
              <ExternalLink className="h-5 w-5 mr-2 text-purple-600" />
              Datos Multi-Fuente
            </h3>
            <div className="h-64">
              <ErrorBoundary>
                <UnifiedChart
                  type="audit"
                  year={selectedYear}
                  variant="line"
                  height={250}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Original Discrepancies Chart for existing data */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Análisis de Discrepancias
          </h3>
          {auditData && auditData.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={auditData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString('es-AR')}`, 'Valor']} />
                  <Legend />
                  <Bar dataKey="local" name="Local" fill="#0088FE" />
                  <Bar dataKey="external" name="Externo" fill="#FF8042" />
                  <Bar dataKey="discrepancy" name="Discrepancia" fill="#FF0000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Multi-Source Data Integration Status */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ExternalLink className="h-6 w-6 mr-2 text-blue-600" />
          Estado de Integración Multi-Fuente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded">
            <h3 className="font-semibold text-green-700 dark:text-green-400">Archivos CSV</h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              {(typeof dataSourcesActive === 'object' && dataSourcesActive?.csvFiles) || 0} archivos procesados
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Extraídos de documentos PDF municipales
            </p>
          </div>
          <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400">Datos JSON</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {(typeof dataSourcesActive === 'object' && dataSourcesActive?.jsonFiles) || 0} fuentes estructuradas
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              APIs locales y consolidaciones
            </p>
          </div>
          <div className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
            <h3 className="font-semibold text-purple-700 dark:text-purple-400">APIs Externas</h3>
            <p className="text-sm text-purple-600 dark:text-purple-300">
              {auditResults?.external_datasets?.length || 0} servicios conectados
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Datos de GBA y fuentes gubernamentales
            </p>
          </div>
        </div>
      </div>

      {/* Discrepancies Table */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Tabla de Discrepancias</h2>
        <ErrorBoundary>
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider"
                      >
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()} className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                {rows.map(row => {
                  prepareRow(row);

                  // Determine row class based on discrepancy
                  const discrepancy = row.original.discrepancy || 0;
                  const hasHighDiscrepancy = Math.abs(discrepancy) > 10000;

                  return (
                    <tr
                      {...row.getRowProps()}
                      className={hasHighDiscrepancy ? 'bg-red-100' : ''}
                    >
                      {row.cells.map(cell => (
                        <td
                          {...cell.getCellProps()}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary"
                        >
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ErrorBoundary>
      </div>

      {/* Discrepancy Summary */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Resumen de Discrepancias</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Total de Discrepancias</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">
            {discrepancies.length} años auditados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {discrepancies.filter(d => Math.abs(d.discrepancy) < 1000).length}
            </p>
            <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Años sin discrepancias significativas</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-lg font-semibold text-yellow-600">
              {discrepancies.filter(d => Math.abs(d.discrepancy) >= 1000 && Math.abs(d.discrepancy) < 10000).length}
            </p>
            <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Años con discrepancias moderadas</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {discrepancies.filter(d => Math.abs(d.discrepancy) >= 10000).length}
            </p>
            <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Años con discrepancias significativas</p>
          </div>
        </div>
      </div>

      {/* Unified Data Viewer - Audit Documents and Datasets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UnifiedDataViewer
          title="Documentos y Datasets de Auditorías y Transparencia"
          description="Acceda a informes de auditoría, datos de control fiscal, reportes de transparencia y datasets de verificación"
          category="audit"
          theme={['just', 'justicia-y-seguridad', 'gove', 'gobierno-y-sector-publico']}
          year={selectedYear}
          showSearch={true}
          defaultTab="all"
          maxPDFs={25}
          maxDatasets={35}
        />
      </div>
    </div>
  );
};

export default Audits;