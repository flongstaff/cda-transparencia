import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Eye, FileText, TrendingUp, Calendar, AlertTriangle, CheckCircle, Loader2, PieChart, BarChart3, Wallet } from 'lucide-react';
import TreasuryAnalysisChart from '../components/charts/TreasuryAnalysisChart';
import FinancialDataTable from '../components/tables/FinancialDataTable';
import DataSourceSelector from '../components/data-sources/DataSourceSelector';
import ApiService, { TreasuryMovement } from '../services/ApiService';
import { formatCurrencyARS } from '../utils/formatters';

// Data sources for validation
const treasuryDataSources = ['https://carmendeareco.gob.ar/transparencia/'];

const Treasury: React.FC = () => {
  const [activeYear, setActiveYear] = useState('2025');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<TreasuryMovement | null>(null);
  const [treasuryData, setTreasuryData] = useState<TreasuryMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>(['database_local', 'official_site']);
  const [selectedSources, setSelectedSources] = useState<string[]>(['database_local', 'official_site']);
  
  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

    const loadTreasuryDataForYear = async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getTreasuryMovements(selectedSources);
      setTreasuryData(data);
    } catch (err) {
      console.error('Failed to load treasury data:', err);
      setError('Failed to load treasury data');
      setTreasuryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load treasury data when sources change
  useEffect(() => {
    void loadTreasuryDataForYear(activeYear);
  }, [selectedSources]);

  const handleSourceChange = (newSelectedSources: string[]) => {
    setSelectedSources(newSelectedSources);
  };

  const handleDataRefresh = () => {
    loadTreasuryDataForYear(activeYear);
  };

  const formatCurrency = (value: number) => formatCurrencyARS(value);

  const handleSourceChange = (newSelectedSources: string[]) => {
    setSelectedSources(newSelectedSources);
  };

  const handleDataRefresh = () => {
    loadTreasuryDataForYear(activeYear);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // Transform API data for display
  const transformedTreasuryData = treasuryData?.map((movement, index) => ({
    id: movement.id,
    date: movement.date,
    description: movement.description,
    category: movement.category,
    amount: movement.amount,
    balance: movement.balance,
    debt_tracking: movement.debt_tracking,
    name: movement.description,
    value: Math.round(movement.amount / 1000000), // Convert to millions for chart
    source: treasuryDataSources[0],
    lastVerified: new Date().toISOString(),
    color: movement.amount >= 0 ? '#10B981' : '#EF4444'
  })) || [];

  const currentBalance = transformedTreasuryData.length > 0 
    ? transformedTreasuryData[transformedTreasuryData.length - 1].balance 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de tesorería...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar datos</h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={() => loadTreasuryDataForYear(activeYear)}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              Tesorería Municipal
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Análisis y seguimiento de los movimientos de tesorería del municipio de Carmen de Areco
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <div className="relative">
              <select
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year} {loading && activeYear === year ? '(Cargando...)' : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
              </div>
            </div>

            <button className="inline-flex items-center py-2 px-4 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150">
              <Download size={18} className="mr-2" />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Data Source Selector */}
        <div className="mb-6">
          <DataSourceSelector
            selectedSources={selectedSources}
            onSourceChange={handleSourceChange}
            onDataRefresh={handleDataRefresh}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Visión General', icon: TrendingUp },
              { id: 'flows', name: 'Flujos', icon: PieChart },
              { id: 'evolution', name: 'Evolución', icon: BarChart3 },
              { id: 'documents', name: 'Documentos', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </motion.section>

      {activeTab === 'overview' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Treasury Analysis Chart */}
          <TreasuryAnalysisChart year={parseInt(activeYear)} />

          {/* Treasury Data Table */}
          <FinancialDataTable
            data={transformedTreasuryData}
            columns={[
              { key: 'date', header: 'Fecha', sortable: true, format: 'date' },
              { key: 'description', header: 'Descripción', sortable: true },
              { key: 'category', header: 'Categoría', sortable: true },
              { key: 'amount', header: 'Monto', sortable: true, format: 'currency' },
              { key: 'balance', header: 'Saldo', sortable: true, format: 'currency' }
            ]}
            title={`Movimientos de Tesorería ${activeYear}`}
            loading={loading}
            error={error}
            onRowClick={(row) => setSelectedItem(row)}
            onExport={() => console.log('Export treasury data')}
          />
        </motion.div>
      )}

      {activeTab === 'flows' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Cash Flow Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Análisis de Flujos de Caja {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <TreasuryAnalysisChart year={parseInt(activeYear)} />
            </div>
          </div>

          {/* Inflows vs Outflows */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Ingresos vs Egresos {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <FinancialDataTable
                data={transformedTreasuryData}
                columns={[
                  { key: 'date', header: 'Fecha', sortable: true, format: 'date' },
                  { key: 'description', header: 'Descripción', sortable: true },
                  { key: 'amount', header: 'Monto', sortable: true, format: 'currency' },
                  { key: 'category', header: 'Categoría', sortable: true }
                ]}
                title={`Flujos de Caja ${activeYear}`}
                loading={loading}
                error={error}
                onRowClick={(row) => setSelectedItem(row)}
                onExport={() => console.log('Export cash flow data')}
              />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'evolution' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Treasury Evolution Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Evolución del Saldo de Tesorería
              </h2>
            </div>
            <div className="p-6">
              <TreasuryAnalysisChart year={parseInt(activeYear)} />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Saldo Actual</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrencyARS(currentBalance, true)}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Saldo de tesorería</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Ingresos Totales</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrencyARS(
                  transformedTreasuryData
                    .filter(item => item.amount > 0)
                    .reduce((sum, item) => sum + item.amount, 0),
                  true
                )}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Total de ingresos</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Egresos Totales</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrencyARS(
                  Math.abs(
                    transformedTreasuryData
                      .filter(item => item.amount < 0)
                      .reduce((sum, item) => sum + item.amount, 0)
                  ),
                  true
                )}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Total de egresos</p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'documents' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Document Library */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Biblioteca de Documentos de Tesorería
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Acceda a informes, comprobantes y documentos relacionados con movimientos de tesorería
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Documentos de tesorería no disponibles en esta versión.
                </p>
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          {selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                    {selectedItem.description}
                  </h3>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Vista previa del documento: {selectedItem.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Detalles del movimiento
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left text-sm">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Fecha:</p>
                        <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedItem.date)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Monto:</p>
                        <p className="text-gray-600 dark:text-gray-400">{formatCurrency(selectedItem.amount)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Saldo:</p>
                        <p className="text-gray-600 dark:text-gray-400">{formatCurrency(selectedItem.balance)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Categoría:</p>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                    Descargar Documento
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Treasury;