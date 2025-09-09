import React, { useState, useEffect } from 'react';
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
  Layers,
  Activity,
  Globe,
  Eye,
  Target,
  Construction,
  Shield,
  Users,
  Briefcase,
  Coins
} from 'lucide-react';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { consolidatedApiService } from '../services';
import { formatCurrencyARS } from '../utils/formatters';
import UnifiedFinancialDashboard from '../components/dashboard/UnifiedFinancialDashboard';

// Import ALL dashboard components for consolidated view
import UniversalChart from '../components/charts/UniversalChart';
import ValidatedChart from '../components/charts/ValidatedChart';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
// Removed problematic UnifiedDashboardChart
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import YearlyDataChart from '../components/charts/YearlyDataChart';

// PowerBI Integration Components (removed unused imports)

// Audit and Analysis Components
import FinancialAuditDashboard from '../components/audit/FinancialAuditDashboard';
import InfrastructureTracker from '../components/audit/InfrastructureTracker';
import DataCategorizationDashboard from '../components/audit/DataCategorizationDashboard';

interface DashboardMetric {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  alert?: boolean;
  icon: React.ReactNode;
  description: string;
  change?: string;
  transparency?: number;
}

interface FinancialSummary {
  totalBudget: number;
  totalExecuted: number;
  executionRate: number;
  totalDebt: number;
  debtToBudgetRatio: number;
  totalSalaries: number;
  salaryToBudgetRatio: number;
  totalContracts: number;
  contractValue: number;
  categories?: Record<string, {
    budgeted: number;
    executed: number;
    execution_rate: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [transparencyScore, setTransparencyScore] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'documents' | 'audit' | 'powerbi' | 'comprehensive'>('comprehensive');

  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadDashboardData();
    }
  }, [selectedYear]);

  const loadAvailableYears = async () => {
    try {
      const years = await consolidatedApiService.getAvailableYears();
      setAvailableYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (error) {
      console.error('Error loading available years:', error);
      // Fallback to current and previous years
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear, currentYear - 1, currentYear - 2, currentYear - 3]);
      setSelectedYear(currentYear);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load data from all services in parallel
      const [
        budgetData,
        debtData,
        salaryData,
        contractData,
        documentData
      ] = await Promise.all([
        consolidatedApiService.getBudgetData(selectedYear),
        consolidatedApiService.getMunicipalDebt(selectedYear),
        consolidatedApiService.getSalaryData(selectedYear),
        consolidatedApiService.getPublicTenders(selectedYear),
        consolidatedApiService.getDocuments(selectedYear)
      ]);

      // Calculate financial summary
      const totalBudget = budgetData.total_budgeted || 0;
      const totalExecuted = budgetData.total_executed || 0;
      const executionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;
      
      const totalDebt = debtData.reduce((sum, debt) => sum + (debt.amount || 0), 0);
      const debtToBudgetRatio = totalBudget > 0 ? (totalDebt / totalBudget) * 100 : 0;
      
      const totalSalaries = salaryData.reduce((sum, salary) => sum + (salary.net_salary || salary.basic_salary || 0), 0);
      const salaryToBudgetRatio = totalBudget > 0 ? (totalSalaries / totalBudget) * 100 : 0;
      
      const totalContracts = contractData.length;
      const contractValue = contractData.reduce((sum, contract) => sum + (contract.amount || contract.budget || 0), 0);
      
      setFinancialSummary({
        totalBudget,
        totalExecuted,
        executionRate,
        totalDebt,
        debtToBudgetRatio,
        totalSalaries,
        salaryToBudgetRatio,
        totalContracts,
        contractValue,
        categories: budgetData.categories || {}
      });
      
      // Calculate transparency score
      const verifiedDocs = documentData.filter(doc => doc.verification_status === 'verified').length;
      const transparency = documentData.length > 0 ? Math.round((verifiedDocs / documentData.length) * 100) : 0;
      setTransparencyScore(transparency);
      setDocumentCount(documentData.length);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardMetrics = (): DashboardMetric[] => {
    if (!financialSummary) return [];

    const totalCategories = Object.keys(financialSummary.categories || {}).length;
    const avgExecutionRate = Object.values(financialSummary.categories || {})
      .reduce((sum: number, cat: any) => sum + parseFloat(cat.execution_rate || '0'), 0) / totalCategories || 0;

    return [
      {
        title: '💰 Presupuesto Total',
        value: formatCurrencyARS(financialSummary.totalBudget, true),
        icon: <DollarSign size={20} />,
        description: `Presupuesto total asignado para el año ${selectedYear} (${totalCategories} categorías)`,
        trend: 'stable',
        transparency: transparencyScore
      },
      {
        title: '📊 Ejecución Presupuestaria',
        value: `${financialSummary.executionRate.toFixed(1)}%`,
        icon: <Target size={20} />,
        description: `Porcentaje del presupuesto ejecutado (promedio: ${avgExecutionRate.toFixed(1)}%)`,
        trend: financialSummary.executionRate >= 80 ? 'up' : 'down',
        change: `${financialSummary.executionRate.toFixed(1)}%`,
        transparency: transparencyScore
      },
      {
        title: '💸 Total Ejecutado',
        value: formatCurrencyARS(financialSummary.totalExecuted, true),
        icon: <TrendingUp size={20} />,
        description: `Monto total ya ejecutado del presupuesto`,
        trend: financialSummary.totalExecuted > financialSummary.totalBudget ? 'up' : 'stable',
        transparency: transparencyScore
      },
      {
        title: '📈 Variación Presupuestaria',
        value: formatCurrencyARS(Math.abs(financialSummary.totalExecuted - financialSummary.totalBudget), true),
        icon: <Activity size={20} />,
        description: financialSummary.totalExecuted > financialSummary.totalBudget ? 
          'Sobreejecución presupuestaria' : 'Subejecución presupuestaria',
        trend: financialSummary.totalExecuted > financialSummary.totalBudget ? 'up' : 'down',
        transparency: transparencyScore
      },
      {
        title: '🏛️ Documentos Disponibles',
        value: documentCount.toString(),
        icon: <FileText size={20} />,
        description: `Total de documentos de transparencia disponibles`,
        trend: 'stable',
        transparency: transparencyScore
      },
      {
        title: '🎯 Índice de Transparencia',
        value: `${transparencyScore}/100`,
        icon: <Shield size={20} />,
        description: `Calificación de transparencia municipal`,
        trend: transparencyScore >= 80 ? 'up' : 'stable',
        transparency: transparencyScore
      },
      {
        title: '🏦 Lo que Debemos',
        value: formatCurrencyARS(financialSummary.totalDebt, true),
        icon: <Coins size={20} />,
        description: 'Deudas que tiene que pagar el municipio',
        trend: financialSummary.debtToBudgetRatio > 50 ? 'down' : 'stable',
        alert: financialSummary.debtToBudgetRatio > 50,
        transparency: transparencyScore
      },
      {
        title: '👥 Sueldos',
        value: formatCurrencyARS(financialSummary.totalSalaries, true),
        icon: <Users size={20} />,
        description: `Sueldos de empleados municipales (${financialSummary.salaryToBudgetRatio.toFixed(1)}% del total)`,
        trend: 'stable',
        transparency: transparencyScore
      },
      {
        title: '📋 Compras y Obras',
        value: financialSummary.totalContracts.toString(),
        icon: <Briefcase size={20} />,
        description: `Contratos por ${formatCurrencyARS(financialSummary.contractValue, true)}`,
        trend: 'up',
        transparency: transparencyScore
      },
      {
        title: '📄 Info Disponible',
        value: `${documentCount}`,
        icon: <CheckCircle size={20} />,
        description: `${transparencyScore}% de toda la información está publicada`,
        trend: transparencyScore >= 80 ? 'up' : 'down',
        transparency: transparencyScore
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">⏳ Buscando la info más nueva...</p>
        </div>
      </div>
    );
  }

  const dashboardMetrics = getDashboardMetrics();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                💰 Finanzas Municipales
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Información financiera transparente de la administración municipal de Carmen de Areco
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
              <PageYearSelector
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={availableYears}
                label="Año"
              />
            </div>
          </div>

          {/* Simple Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-lg font-semibold text-gray-900">
                  Información actualizada - {documentCount} documentos disponibles
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {transparencyScore}%
                </div>
                <div className="text-sm text-gray-600">
                  Información completa
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Simple Navigation */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 inline-flex flex-wrap gap-2">
            {[
              { key: 'comprehensive', label: '🎯 Unificado', icon: <Layers className="w-4 h-4" /> },
              { key: 'overview', label: '📊 Lo Básico', icon: <BarChart3 className="w-4 h-4" /> },
              { key: 'financial', label: '💰 Plata', icon: <DollarSign className="w-4 h-4" /> },
              { key: 'documents', label: '📋 Papeles', icon: <FileText className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comprehensive Unified Dashboard Tab */}
        {activeTab === 'comprehensive' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UnifiedFinancialDashboard year={selectedYear} />
          </motion.div>
        )}

        {/* Overview Tab - Key Metrics Grid - Enhanced */}
        {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {dashboardMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`p-6 rounded-2xl border-2 transform hover:scale-105 transition-all duration-300 cursor-pointer group ${
                metric.alert 
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 shadow-lg hover:shadow-xl hover:border-red-400'
                  : 'bg-white border-gray-200 shadow-md hover:shadow-xl hover:border-blue-300'
              }`}
              onMouseEnter={() => {
                // Add gentle pulse animation on hover
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white shadow-md">
                    {metric.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {metric.title}
                  </h3>
                  {metric.alert && (
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle size={20} className="text-red-600" />
                    </div>
                  )}
                </div>
                
                {metric.trend && (
                  <div className={`p-2 rounded-lg ${
                    metric.trend === 'up' ? 'bg-green-100 text-green-600' :
                    metric.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {metric.trend === 'up' && <TrendingUp size={20} />}
                    {metric.trend === 'down' && <TrendingDown size={20} />}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <p className={`text-3xl font-bold mb-2 ${
                  metric.alert ? 'text-red-700' : 'text-gray-900'
                }`}>
                  {metric.value}
                </p>
                {metric.change && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    metric.trend === 'up' ? 'bg-green-100 text-green-700' :
                    metric.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {metric.change}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 font-medium mb-4 leading-relaxed">
                {metric.description}
              </p>
              
              {/* Transparency Bar - Enhanced */}
              {metric.transparency && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Transparencia</span>
                    <span className="text-lg font-bold text-gray-900">{metric.transparency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        metric.transparency >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        metric.transparency >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${metric.transparency}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Financial Ratios */}
      {financialSummary && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ratios Financieros Clave
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Relación Deuda/Presupuesto</span>
                  <span className={`font-medium ${
                    financialSummary.debtToBudgetRatio > 50 ? 'text-red-600 dark:text-red-400' : 
                    financialSummary.debtToBudgetRatio > 30 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {financialSummary.debtToBudgetRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Relación Salarios/Presupuesto</span>
                  <span className={`font-medium ${
                    financialSummary.salaryToBudgetRatio > 60 ? 'text-red-600 dark:text-red-400' : 
                    financialSummary.salaryToBudgetRatio > 40 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {financialSummary.salaryToBudgetRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de Ejecución Presupuestaria</span>
                  <span className={`font-medium ${
                    financialSummary.executionRate >= 90 ? 'text-green-600 dark:text-green-400' : 
                    financialSummary.executionRate >= 75 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {financialSummary.executionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resumen de Actividades
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Contratos Públicos</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {financialSummary.totalContracts}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Valor Total de Contratos</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrencyARS(financialSummary.contractValue, true)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Documentos Procesados</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {documentCount}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
            )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">💰 La Plata del {selectedYear}</h3>
              <p className="text-gray-600 mb-4">En qué cosas se gasta la plata de todos los vecinos</p>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Pasá el mouse sobre el gráfico para ver más detalles
                </p>
              </div>
              <BudgetAnalysisChart year={selectedYear} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">📊 Ejecución por Categorías</h3>
              <p className="text-gray-600 mb-4">Ver cómo se ejecuta el presupuesto por área</p>
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-green-700">
                  ✅ <strong>Bueno:</strong> Podés ver el detalle por cada área
                </p>
              </div>
              {financialSummary && (
                <UniversalChart
                  data={Object.entries(financialSummary.categories || {}).map(([name, data]) => ({
                    name: name.replace(/_/g, ' '),
                    budgeted: data.budgeted || 0,
                    executed: data.executed || 0,
                    execution_rate: parseFloat(data.execution_rate || '0')
                  }))}
                  chartType="bar"
                  title={`Ejecución Presupuestaria por Categoría - ${selectedYear}`}
                  height={400}
                  showControls={true}
                  additionalSeries={[
                    { dataKey: 'budgeted', name: 'Presupuestado', color: '#3b82f6' },
                    { dataKey: 'executed', name: 'Ejecutado', color: '#10b981' }
                  ]}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">📄 Todos los Papeles</h3>
              <p className="text-gray-600 mb-4">Acá están todos los papeles oficiales que podés ver</p>
              <div className="bg-orange-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-orange-700">
                  📂 <strong>Fácil:</strong> Hacé clic en cualquier documento para verlo
                </p>
              </div>
              <DocumentAnalysisChart year={selectedYear} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">📊 Por Años</h3>
              <p className="text-gray-600 mb-4">Comparar cómo cambió todo de un año a otro</p>
              <div className="bg-purple-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-purple-700">
                  📈 <strong>Interesante:</strong> Mirá cómo cambiaron las cosas cada año
                </p>
              </div>
              <YearlyDataChart year={selectedYear} />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300">
              <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                💬 ¿Te ayudamos?
              </h4>
              <p className="text-gray-700 mb-4">
                Si no entendés algo o necesitás ayuda para encontrar información, escribinos. 
                <strong> Estamos para ayudarte.</strong>
              </p>
              <div className="flex space-x-3">
                <Link 
                  to="/contact" 
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  💌 Escribinos
                </Link>
                <Link 
                  to="/about" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
                >
                  📖 Más info
                </Link>
              </div>
            </div>
          </motion.div>
        )}


        {/* Footer Status - Modern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mt-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-lg font-bold text-gray-900">
              🏛️ Portal Transparente de Carmen de Areco
            </p>
          </div>
          <p className="text-gray-600">
            ✅ Toda la información está actualizada • 📊 {transparencyScore}% de transparencia • 🤝 Hecho para vos
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;