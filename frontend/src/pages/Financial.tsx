import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { consolidatedApiService } from '../services';

interface BudgetData {
  total_budgeted: number;
  total_executed: number;
  execution_rate: string;
  categories: Record<string, {
    budgeted: number;
    executed: number;
    execution_rate: string;
  }>;
}

interface FinancialDocument {
  id: number;
  filename: string;
  year: number;
  category: string;
  document_type: string;
  size_bytes: string;
  verification_status: string;
  processing_date: string;
}

const Financial: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [financialDocs, setFinancialDocs] = useState<FinancialDocument[]>([]);
  const [budgetDocs, setBudgetDocs] = useState<FinancialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'debt' | 'statements'>('overview');
  const [availableYears] = useState([2024, 2023, 2022, 2021, 2020]);

  useEffect(() => {
    loadFinancialData();
  }, [selectedYear]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Load budget data
      const budget = await consolidatedApiService.getBudgetData(selectedYear);
      setBudgetData(budget);

      // Load financial documents
      const docsResponse = await fetch('http://localhost:3001/api/documents');
      const allDocs = await docsResponse.json();
      
      if (allDocs.documents) {
        // Filter financial documents
        const financial = allDocs.documents.filter((doc: FinancialDocument) => 
          doc.category === 'Estados Financieros' && doc.year === selectedYear
        );
        setFinancialDocs(financial);

        // Filter budget execution documents
        const budget = allDocs.documents.filter((doc: FinancialDocument) => 
          doc.category === 'Ejecución Presupuestaria' && doc.year === selectedYear
        );
        setBudgetDocs(budget);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatBytes = (bytes: string) => {
    const size = parseInt(bytes);
    const mb = size / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`;
  };

  const getExecutionColor = (rate: string) => {
    const percentage = parseFloat(rate);
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getExecutionBgColor = (rate: string) => {
    const percentage = parseFloat(rate);
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Activity className="animate-spin h-16 w-16 text-blue-600 mx-auto" />
            <p className="mt-4 text-xl text-gray-600">Cargando datos financieros...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 Panel Financiero
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Análisis integral de presupuesto, deuda y estados financieros
          </p>
          
          {/* Year Selector */}
          <div className="inline-flex bg-white rounded-lg shadow-md p-1">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-md transition-all ${
                  selectedYear === year
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 inline-flex">
            {[
              { key: 'overview', label: '📊 Resumen', icon: <BarChart3 className="w-4 h-4" /> },
              { key: 'budget', label: '💰 Presupuesto', icon: <DollarSign className="w-4 h-4" /> },
              { key: 'debt', label: '📉 Deuda', icon: <TrendingDown className="w-4 h-4" /> },
              { key: 'statements', label: '📋 Estados', icon: <FileText className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && budgetData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Presupuesto Total</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(budgetData.total_budgeted)}</p>
                  </div>
                  <Target className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ejecutado</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(budgetData.total_executed)}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              
              <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                parseFloat(budgetData.execution_rate) >= 80 ? 'border-green-500' : 'border-yellow-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ejecución</h3>
                    <p className={`text-3xl font-bold ${getExecutionColor(budgetData.execution_rate)}`}>
                      {parseFloat(budgetData.execution_rate).toFixed(1)}%
                    </p>
                  </div>
                  <Activity className="h-12 w-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Categories Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Ejecución por Categoría</h2>
              <div className="space-y-4">
                {Object.entries(budgetData.categories || {}).map(([category, data]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{category}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExecutionBgColor(data.execution_rate)} ${getExecutionColor(data.execution_rate)}`}>
                        {parseFloat(data.execution_rate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Presupuestado: </span>
                        <span className="font-medium">{formatCurrency(data.budgeted)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ejecutado: </span>
                        <span className="font-medium">{formatCurrency(data.executed)}</span>
                      </div>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(data.execution_rate) >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(parseFloat(data.execution_rate), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📄 Documentos de Ejecución Presupuestaria</h2>
              {budgetDocs.length > 0 ? (
                <div className="space-y-4">
                  {budgetDocs.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{doc.filename}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {doc.year}
                            </span>
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {formatBytes(doc.size_bytes)}
                            </span>
                            {doc.verification_status === 'verified' && (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verificado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay documentos de ejecución presupuestaria para {selectedYear}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* States Tab */}
        {activeTab === 'statements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Estados Financieros</h2>
              {financialDocs.length > 0 ? (
                <div className="space-y-4">
                  {financialDocs.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{doc.filename}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {doc.year}
                            </span>
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {formatBytes(doc.size_bytes)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.document_type === 'financial_statement' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {doc.document_type}
                            </span>
                            {doc.verification_status === 'verified' && (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verificado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay estados financieros para {selectedYear}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Debt Tab */}
        {activeTab === 'debt' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📉 Información de Deuda</h2>
              <div className="text-center py-12 text-gray-500">
                <TrendingDown className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Datos de deuda en desarrollo</p>
                <p className="text-sm">Los datos de deuda municipal se mostrarán aquí cuando estén disponibles</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Financial;