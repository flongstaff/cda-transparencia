import React from 'react';
import { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMasterData } from '../hooks/useMasterData';
import UnifiedTransparencyService from '../services/UnifiedTransparencyService';
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';

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
  
  // Use unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    currentDebt,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

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

        {/* Original Discrepancies Chart for existing data */}
        {auditData && auditData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
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
        ) : (
          <p className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">No hay datos disponibles</p>
        )}
      </div>

      {/* Discrepancies Table */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Tabla de Discrepancias</h2>
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
    </div>
  );
};

export default Audits;