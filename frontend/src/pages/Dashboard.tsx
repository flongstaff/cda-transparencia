import React, { useState, useEffect } from 'react';
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
import PageYearSelector from '../components/PageYearSelector';
import { consolidatedApiService } from '../services';
import { formatCurrencyARS } from '../utils/formatters';

// Import ALL dashboard components for consolidated view
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import SalaryAnalysisChart from '../components/charts/SalaryAnalysisChart';
import DebtAnalysisChart from '../components/charts/DebtAnalysisChart';
import UnifiedDashboardChart from '../components/charts/UnifiedDashboardChart';
import IntegratedChart from '../components/charts/IntegratedChart';
import YearlyDataChart from '../components/charts/YearlyDataChart';
import InvestmentAnalysisChart from '../components/charts/InvestmentAnalysisChart';
import TreasuryAnalysisChart from '../components/charts/TreasuryAnalysisChart';
import MunicipalFinancialVisualization from '../components/charts/MunicipalFinancialVisualization';
import ComprehensiveVisualization from '../components/charts/ComprehensiveVisualization';

// PowerBI Integration Components
import PowerBIDataDashboard from '../components/powerbi/PowerBIDataDashboard';
import PowerBIFinancialDashboard from '../components/powerbi/PowerBIFinancialDashboard';
import PowerBIComparisonDashboard from '../components/powerbi/PowerBIComparisonDashboard';
import FinancialMindMap from '../components/powerbi/FinancialMindMap';
import DataComparisonDashboard from '../components/powerbi/DataComparisonDashboard';

// Audit and Analysis Components
import AuditDashboard from '../components/audit/AuditDashboard';
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
}

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [transparencyScore, setTransparencyScore] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'documents' | 'audit' | 'powerbi' | 'comprehensive'>('overview');

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
        contractValue
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

    return [
      {
        title: 'Presupuesto Total',
        value: formatCurrencyARS(financialSummary.totalBudget, true),
        icon: <DollarSign size={20} />,
        description: `Presupuesto municipal ${selectedYear}`,
        trend: 'stable',
        transparency: transparencyScore
      },
      {
        title: 'Ejecución Presupuestaria',
        value: `${financialSummary.executionRate.toFixed(1)}%`,
        icon: <Target size={20} />,
        description: 'Tasa de ejecución real',
        trend: financialSummary.executionRate >= 80 ? 'up' : 'down',
        change: `${financialSummary.executionRate.toFixed(1)}%`,
        transparency: transparencyScore
      },
      {
        title: 'Deuda Total',
        value: formatCurrencyARS(financialSummary.totalDebt, true),
        icon: <Coins size={20} />,
        description: 'Deuda municipal acumulada',
        trend: financialSummary.debtToBudgetRatio > 50 ? 'down' : 'stable',
        alert: financialSummary.debtToBudgetRatio > 50,
        transparency: transparencyScore
      },
      {
        title: 'Gastos en Salarios',
        value: formatCurrencyARS(financialSummary.totalSalaries, true),
        icon: <Users size={20} />,
        description: `Representa ${financialSummary.salaryToBudgetRatio.toFixed(1)}% del presupuesto`,
        trend: 'stable',
        transparency: transparencyScore
      },
      {
        title: 'Contratos Públicos',
        value: financialSummary.totalContracts.toString(),
        icon: <Briefcase size={20} />,
        description: `Valor total: ${formatCurrencyARS(financialSummary.contractValue, true)}`,
        trend: 'up',
        transparency: transparencyScore
      },
      {
        title: 'Documentos Verificados',
        value: `${documentCount}`,
        icon: <CheckCircle size={20} />,
        description: `Transparencia: ${transparencyScore}%`,
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
          <p className="text-gray-600 dark:text-gray-400">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  const dashboardMetrics = getDashboardMetrics();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Panel de Control Financiero
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visión integral de la situación financiera de Carmen de Areco
              </p>
            </div>
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
              label="Año"
            />
          </div>

          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="text-blue-600" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Sistema de Transparencia Activo
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Datos actualizados en tiempo real | {documentCount} documentos procesados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {transparencyScore}%
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Transparencia
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 inline-flex flex-wrap gap-2">
            {[
              { key: 'overview', label: '📊 Resumen', icon: <BarChart3 className="w-4 h-4" /> },
              { key: 'financial', label: '💰 Financiero', icon: <DollarSign className="w-4 h-4" /> },
              { key: 'documents', label: '📄 Documentos', icon: <FileText className="w-4 h-4" /> },
              { key: 'audit', label: '🔍 Auditoría', icon: <Shield className="w-4 h-4" /> },
              { key: 'powerbi', label: '⚡ PowerBI', icon: <Activity className="w-4 h-4" /> },
              { key: 'comprehensive', label: '🚀 Completo', icon: <Layers className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab - Key Metrics Grid */}
        {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {dashboardMetrics.map((metric, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-sm border ${
                metric.alert 
                  ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {metric.icon}
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {metric.title}
                  </h3>
                  {metric.alert && <AlertTriangle size={16} className="text-red-500" />}
                </div>
                
                {metric.trend && (
                  <div className={`flex items-center ${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {metric.trend === 'up' && <TrendingUp size={16} />}
                    {metric.trend === 'down' && <TrendingDown size={16} />}
                  </div>
                )}
              </div>
              
              <div className="mb-2">
                <p className={`text-2xl font-bold ${
                  metric.alert ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'
                }`}>
                  {metric.value}
                </p>
                {metric.change && (
                  <p className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {metric.change}
                  </p>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metric.description}
              </p>
              
              {/* Transparency Bar */}
              {metric.transparency && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Transparencia</span>
                    <span>{metric.transparency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.transparency >= 80 ? 'bg-green-500' :
                        metric.transparency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.transparency}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>

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
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Análisis Presupuestario</h3>
                <BudgetAnalysisChart year={selectedYear} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📉 Análisis de Deuda</h3>
                <DebtAnalysisChart year={selectedYear} />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 Dashboard Financiero Unificado</h3>
              <UnifiedDashboardChart year={selectedYear} />
            </div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📄 Análisis de Documentos</h3>
              <DocumentAnalysisChart year={selectedYear} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Datos Anuales</h3>
              <YearlyDataChart year={selectedYear} />
            </div>
          </motion.div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔍 Auditoría Financiera</h3>
              <FinancialAuditDashboard />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🏗️ Seguimiento de Infraestructura</h3>
              <InfrastructureTracker />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📂 Categorización de Datos</h3>
              <DataCategorizationDashboard />
            </div>
          </motion.div>
        )}

        {/* PowerBI Tab */}
        {activeTab === 'powerbi' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚡ Dashboard PowerBI</h3>
              <PowerBIDataDashboard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💰 PowerBI Financiero</h3>
                <PowerBIFinancialDashboard />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Comparación PowerBI</h3>
                <PowerBIComparisonDashboard />
              </div>
            </div>
          </motion.div>
        )}

        {/* Comprehensive Tab */}
        {activeTab === 'comprehensive' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 Visualización Comprehensiva</h3>
              <ComprehensiveVisualization />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💰 Visualización Financiera Municipal</h3>
                <MunicipalFinancialVisualization year={selectedYear} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 Análisis de Inversiones</h3>
                <InvestmentAnalysisChart year={selectedYear} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🏦 Análisis de Tesorería</h3>
                <TreasuryAnalysisChart year={selectedYear} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">👥 Análisis de Salarios</h3>
                <SalaryAnalysisChart year={selectedYear} />
              </div>
            </div>
          </motion.div>
        )}

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
        >
          <p className="text-sm text-blue-700 dark:text-blue-400">
            🏛️ Sistema de Transparencia Municipal | ✅ Datos integrados de Carmen de Areco | 📊 Nivel de Transparencia: {transparencyScore}%
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;