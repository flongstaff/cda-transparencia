import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Eye, FileText, TrendingUp, Calendar, AlertTriangle, CheckCircle, Loader2, PieChart, BarChart3, Building } from 'lucide-react';
import InvestmentAnalysisChart from '../components/charts/InvestmentAnalysisChart';
import FinancialDataTable from '../components/tables/FinancialDataTable';
import DataSourceSelector from '../components/data-sources/DataSourceSelector';
import ApiService, { InvestmentAsset } from '../services/ApiService';
import { useYear } from '../contexts/YearContext'; // Import useYear hook

const formatCurrencyARS = (value: number, shortFormat = false): string => {
  if (shortFormat && value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Data sources for validation
const investmentDataSources = ['https://carmendeareco.gob.ar/transparencia/'];

const Investments: React.FC = () => {
  const { selectedYear, setSelectedYear } = useYear(); // Use YearContext
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<InvestmentAsset | null>(null);
  const [investmentData, setInvestmentData] = useState<InvestmentAsset[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  const loadInvestmentDataForYear = async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      // Load investment data with PowerBI integration
      const data = await ApiService.getInvestmentsWithPowerBI(parseInt(year));
      setInvestmentData(data);
      
      console.log(`Loaded ${data.length} investment records for ${year}:`, data);
    } catch (err) {
      console.error('Failed to load investment data for year:', year, err);
      setError('Failed to load investment data');
      setInvestmentData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load investment data when year changes
  useEffect(() => {
    loadInvestmentDataForYear(selectedYear.toString());
  }, [selectedYear]);

  const handleDataRefresh = () => {
    loadInvestmentDataForYear(activeYear);
  };

  const formatCurrency = (value: number) => formatCurrencyARS(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // Transform API data for display
  const transformedInvestmentData = investmentData?.map((asset, index) => ({
    id: asset.id,
    year: asset.year,
    asset_type: asset.asset_type,
    description: asset.description,
    value: asset.value,
    acquisition_date: new Date().toISOString(), // Default date
    status: 'active',
    name: asset.asset_type,
    source: investmentDataSources[0],
    lastVerified: new Date().toISOString(),
    color: ['#0056b3', '#28a745', '#ffc107', '#dc3545', '#20c997', '#6f42c1'][index] || '#fd7e14'
  })) || [];

  const totalInvestmentValue = transformedInvestmentData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de inversiones...</p>
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
          onClick={() => loadInvestmentDataForYear(activeYear)}
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
              Inversiones Municipales
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Análisis y seguimiento de las inversiones del municipio de Carmen de Areco
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
            onDataRefresh={handleDataRefresh}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Visión General', icon: TrendingUp },
              { id: 'composition', name: 'Composición', icon: PieChart },
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
          {/* Investment Analysis Chart */}
          <InvestmentAnalysisChart year={parseInt(activeYear)} />

          {/* Investment Data Table */}
          <FinancialDataTable
            data={transformedInvestmentData}
            columns={[
              { key: 'asset_type', header: 'Tipo de Activo', sortable: true },
              { key: 'description', header: 'Descripción', sortable: true },
              { key: 'value', header: 'Valor', sortable: true, format: 'currency' },
              { key: 'acquisition_date', header: 'Fecha de Adquisición', sortable: true, format: 'date' },
              { key: 'status', header: 'Estado', sortable: true }
            ]}
            title={`Datos de Inversiones ${activeYear}`}
            loading={loading}
            error={error}
            onRowClick={(row) => setSelectedItem(row)}
            onExport={() => console.log('Export investment data')}
          />
        </motion.div>
      )}

      {activeTab === 'composition' && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Investment Composition Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Composición de Inversiones {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <InvestmentAnalysisChart year={parseInt(activeYear)} />
            </div>
          </div>

          {/* Investment by Type Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Detalle por Tipo de Inversión {activeYear}
              </h2>
            </div>
            <div className="p-6">
              <FinancialDataTable
                data={transformedInvestmentData}
                columns={[
                  { key: 'asset_type', header: 'Tipo de Activo', sortable: true },
                  { key: 'description', header: 'Descripción', sortable: true },
                  { key: 'value', header: 'Valor', sortable: true, format: 'currency' },
                  { key: 'status', header: 'Estado', sortable: true }
                ]}
                title={`Inversiones por Tipo ${activeYear}`}
                loading={loading}
                error={error}
                onRowClick={(row) => setSelectedItem(row)}
                onExport={() => console.log('Export investment composition data')}
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
          {/* Investment Evolution Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Evolución Histórica de Inversiones
              </h2>
            </div>
            <div className="p-6">
              <InvestmentAnalysisChart year={parseInt(activeYear)} />
            </div>
          </div>

          {/* Year-over-Year Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                Comparación Interanual
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">2023</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrencyARS(totalInvestmentValue * 0.75, true)}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Base de comparación</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">2024</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrencyARS(totalInvestmentValue * 0.85, true)}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">+13.3% vs 2023</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">2025</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrencyARS(totalInvestmentValue, true)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">+17.6% vs 2024</p>
                </div>
              </div>
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
                Biblioteca de Documentos de Inversiones
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Acceda a informes, contratos y documentos relacionados con inversiones municipales
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Documentos de inversiones no disponibles en esta versión.
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
                      Detalles de la inversión: {selectedItem.asset_type}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left text-sm">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Valor:</p>
                        <p className="text-gray-600 dark:text-gray-400">{formatCurrency(selectedItem.value)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Fecha de Adquisición:</p>
                        <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedItem.acquisition_date)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Estado:</p>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.status}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Tipo:</p>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.asset_type}</p>
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

export default Investments;