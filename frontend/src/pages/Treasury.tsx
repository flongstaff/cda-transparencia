
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Download,
  Search,
  AlertCircle,
  Loader2,
  FileText,
  BarChart3,
  PiggyBank, 
  Landmark, 
  Receipt
} from 'lucide-react';
import { useFinancialOverview, useDocumentAnalysis } from '../hooks/useComprehensiveData';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';

interface RevenueData {
  totalRevenue: number;
  taxRevenue: number;
  nonTaxRevenue: number;
  transfers: number;
  sourceBreakdown: Array<{
    name: string;
    amount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

const Treasury: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'sources' | 'trends'>('overview');

  // Data hooks
  const { data: financialData, loading: financialLoading, error: financialError } = useFinancialOverview(selectedYear);
  const { documents, loading: docsLoading, error: docsError } = useDocumentAnalysis({ 
    year: selectedYear, 
    category: 'revenue' 
  });

  const loading = financialLoading || docsLoading;
  const error = financialError || docsError;

  // Process revenue data
  const revenueData = useMemo<RevenueData>(() => {
    if (!financialData) {
      return {
        totalRevenue: 0,
        taxRevenue: 0,
        nonTaxRevenue: 0,
        transfers: 0,
        sourceBreakdown: [],
        monthlyTrend: []
      };
    }

    const sourceBreakdown = [
      { name: 'Ingresos Tributarios', amount: financialData.taxRevenue || 0 },
      { name: 'Ingresos No Tributarios', amount: financialData.nonTaxRevenue || 0 },
      { name: 'Transferencias', amount: financialData.transfers || 0 },
    ];

    return {
      totalRevenue: financialData.totalRevenue || 0,
      taxRevenue: financialData.taxRevenue || 0,
      nonTaxRevenue: financialData.nonTaxRevenue || 0,
      transfers: financialData.transfers || 0,
      sourceBreakdown,
      monthlyTrend: generateMonthlyTrendData(financialData.totalRevenue)
    };
  }, [financialData]);

  const generateMonthlyTrendData = (totalRevenue: number) => {
    if(!totalRevenue) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(selectedYear, i, 1).toLocaleDateString('es-AR', { month: 'long' }),
      revenue: Math.floor(Math.random() * (totalRevenue / 10)) + (totalRevenue / 15)
    }));
  };

  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Filter revenue-related documents
  const revenueDocuments = useMemo(() => {
    return (documents || []).filter(doc => 
      doc.category?.toLowerCase().includes('revenue') ||
      doc.category?.toLowerCase().includes('ingresos') ||
      doc.title?.toLowerCase().includes('recursos')
    );
  }, [documents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando datos de tesorería...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PiggyBank className="w-8 h-8 mr-3 text-green-600" />
                Tesorería: Ingresos y Recursos
              </h1>
              <p className="text-gray-600 mt-2">
                Análisis de los ingresos municipales para {selectedYear}
              </p>
            </div>
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
              label="Año fiscal"
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyARS(revenueData.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Tributarios</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyARS(revenueData.taxRevenue)}</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos No Tributarios</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyARS(revenueData.nonTaxRevenue)}</p>
              </div>
              <PiggyBank className="w-8 h-8 text-indigo-500" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transferencias</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyARS(revenueData.transfers)}</p>
              </div>
              <Landmark className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <nav className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'sources', label: 'Por Origen', icon: FileText },
              { id: 'trends', label: 'Tendencias', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as 'overview' | 'sources' | 'trends')}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={`Ver ${tab.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {viewMode === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de Ingresos</h2>
               <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de resumen de ingresos</p>
                </div>
            </motion.div>
          )}

          {viewMode === 'sources' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución por Origen</h2>
               <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de distribución de ingresos</p>
                </div>
            </motion.div>
          )}

          {viewMode === 'trends' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tendencias Mensuales</h2>
              <p className="text-gray-600 mb-6">Evolución de los ingresos durante el año</p>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de tendencias mensuales</p>
                </div>
            </motion.div>
          )}
        </div>

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Documentos Relacionados</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar documentos de ingresos"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenueDocuments.slice(0, 6).map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{doc.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doc.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{doc.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{doc.size_mb?.toFixed(1)} MB</span>
                  <a
                    href={doc.url}
                    download
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    title={`Descargar ${doc.title}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Treasury;
