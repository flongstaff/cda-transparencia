import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  Users, 
  Shield, 
  Activity, 
  PieChart, 
  Calendar, 
  Search,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Database,
  Globe,
  Layers
} from 'lucide-react';
import { consolidatedApiService } from '../services';

// Import ALL existing chart and dashboard components
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
import CriticalIssues from '../components/audit/CriticalIssues';
import DataCategorizationDashboard from '../components/audit/DataCategorizationDashboard';
import InfrastructureTracker from '../components/audit/InfrastructureTracker';
import AnomalyDashboard from '../components/anomaly/AnomalyDashboard';

// Dashboard Components
import FinancialOverview from '../components/dashboard/FinancialOverview';
import YearlySummaryDashboard from '../components/dashboard/YearlySummaryDashboard';
import BudgetExecutionDashboard from '../components/dashboard/BudgetExecutionDashboard';
import DebtAnalysisDashboard from '../components/dashboard/DebtAnalysisDashboard';
import FinancialStatsSummary from '../components/dashboard/FinancialStatsSummary';
import RecentUpdatesList from '../components/dashboard/RecentUpdatesList';

// Specialized Components
import ComprehensiveSpendingAnalysis from '../components/analysis/ComprehensiveSpendingAnalysis';
import SalaryScaleVisualization from '../components/salaries/SalaryScaleVisualization';
import YearlyFinancialDashboard from '../components/yearly/YearlyFinancialDashboard';
import DataIntegrityDashboard from '../components/DataIntegrityDashboard';
import ComprehensiveDocumentViewer from '../components/documents/ComprehensiveDocumentViewer';

// Data Sources and Utilities
import DataSourceManager from '../components/DataSourceManager';
import ValidatedChart from '../components/ValidatedChart';
import PageYearSelector from '../components/PageYearSelector';

interface DashboardData {
  statistics: any;
  documents: any[];
  financialData: any[];
  corruptionCases: any[];
  categories: any[];
  years: number[];
}

interface RealtimeMetrics {
  transparency_score: number;
  data_quality: number;
  completion_rate: number;
  verification_rate: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  last_update: string;
}

export const ComprehensiveDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'documents' | 'financial' | 'audit' | 'trends' | 'powerbi' | 'infrastructure' | 'comprehensive'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    if (!loading) setRefreshing(true);
    
    try {
      // Load all data in parallel for better performance
      const [statisticsRes, documentsRes, financialRes, corruptionRes, categoriesRes, yearsRes] = await Promise.all([
        fetch('http://localhost:3001/api/statistics'),
        fetch('http://localhost:3001/api/documents'),
        fetch('http://localhost:3001/api/financial'),
        fetch('http://localhost:3001/api/corruption-cases'),
        fetch('http://localhost:3001/api/categories'),
        fetch('http://localhost:3001/api/years')
      ]);

      const [statistics, documents, financial, corruption, categories, years] = await Promise.all([
        statisticsRes.json(),
        documentsRes.json(),
        financialRes.json(),
        corruptionRes.json(),
        categoriesRes.json(),
        yearsRes.json()
      ]);

      const dashboardData: DashboardData = {
        statistics: statistics.statistics,
        documents: documents.documents || [],
        financialData: financial.financial_data || [],
        corruptionCases: corruption.cases || [],
        categories: categories.categories || [],
        years: years.years || []
      };

      // Calculate real-time metrics
      const totalDocs = dashboardData.statistics?.total_documents || 0;
      const verifiedDocs = dashboardData.statistics?.verified_documents || 0;
      const corruptionCount = dashboardData.corruptionCases.length;
      
      const realtimeMetrics: RealtimeMetrics = {
        transparency_score: Math.min(100, Math.round((totalDocs / 500) * 100)),
        data_quality: Math.round((verifiedDocs / Math.max(totalDocs, 1)) * 100),
        completion_rate: Math.round(((dashboardData.categories.length * totalDocs) / (8 * 500)) * 100),
        verification_rate: Math.round((verifiedDocs / Math.max(totalDocs, 1)) * 100),
        risk_level: corruptionCount > 10 ? 'HIGH' : corruptionCount > 5 ? 'MEDIUM' : 'LOW',
        last_update: new Date().toISOString()
      };

      setData(dashboardData);
      setMetrics(realtimeMetrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando Panel Integral...</p>
          <p className="text-sm text-gray-500 mt-2">Integrating all transparency data sources</p>
        </motion.div>
      </div>
    );
  }

  if (!data || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-900 mb-4">Error cargando datos</p>
          <button 
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header with Real-time Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Panel Integral de Transparencia</h1>
                  <p className="text-sm text-gray-600">Carmen de Areco • Tiempo Real</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Real-time Metrics */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{metrics.transparency_score}%</div>
                  <div className="text-xs text-gray-500">Transparencia</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{metrics.data_quality}%</div>
                  <div className="text-xs text-gray-500">Calidad</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    metrics.risk_level === 'LOW' ? 'text-green-600' :
                    metrics.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.risk_level}
                  </div>
                  <div className="text-xs text-gray-500">Riesgo</div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="mr-2"
                  />
                  Auto-refresh
                </label>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Live Status Indicator */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>En vivo • {data.statistics?.total_documents || 0} documentos • Actualizado hace {refreshing ? '0' : '30'} seg</span>
            </div>
            
            {/* View Selector */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
              {[
                { key: 'overview', label: 'Resumen', icon: <BarChart3 className="w-4 h-4" /> },
                { key: 'documents', label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
                { key: 'financial', label: 'Financiero', icon: <DollarSign className="w-4 h-4" /> },
                { key: 'audit', label: 'Auditoría', icon: <Shield className="w-4 h-4" /> },
                { key: 'trends', label: 'Tendencias', icon: <TrendingUp className="w-4 h-4" /> },
                { key: 'powerbi', label: 'PowerBI', icon: <Database className="w-4 h-4" /> },
                { key: 'infrastructure', label: 'Infraestructura', icon: <Layers className="w-4 h-4" /> },
                { key: 'comprehensive', label: 'Integral', icon: <Globe className="w-4 h-4" /> }
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setActiveView(view.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === view.key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  {view.icon}
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Documentos</p>
                      <p className="text-3xl font-bold text-blue-600">{data.statistics?.total_documents || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {data.statistics?.by_type?.json || 0} JSON • {data.statistics?.by_type?.markdown || 0} Markdown
                      </p>
                    </div>
                    <FileText className="h-12 w-12 text-blue-500 opacity-20" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Categorías Activas</p>
                      <p className="text-3xl font-bold text-green-600">{data.statistics?.total_categories || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Object.keys(data.statistics?.by_category || {}).length} tipos diferentes
                      </p>
                    </div>
                    <Layers className="h-12 w-12 text-green-500 opacity-20" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Años Disponibles</p>
                      <p className="text-3xl font-bold text-purple-600">{data.years.length || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {data.statistics?.year_range?.earliest} - {data.statistics?.year_range?.latest}
                      </p>
                    </div>
                    <Calendar className="h-12 w-12 text-purple-500 opacity-20" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Casos de Corrupción</p>
                      <p className="text-3xl font-bold text-red-600">{data.corruptionCases.length || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Nivel de riesgo: {metrics.risk_level}
                      </p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-red-500 opacity-20" />
                  </div>
                </motion.div>
              </div>

              {/* Comprehensive Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Documentos</h3>
                  <DocumentAnalysisChart data={data.documents} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Municipal</h3>
                  <MunicipalFinancialVisualization year={selectedYear} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
                  <div className="space-y-3">
                    {Object.entries(data.statistics?.by_category || {}).map(([category, count]) => {
                      const percentage = ((count as number) / (data.statistics?.total_documents || 1)) * 100;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{category}</span>
                            <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Financial Overview Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero Integral</h3>
                <FinancialOverview year={selectedYear} />
              </motion.div>

              {/* Data Integrity Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Integridad de Datos</h3>
                <DataIntegrityDashboard />
              </motion.div>

              {/* Unified Dashboard Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Panel Unificado</h3>
                <UnifiedDashboardChart 
                  documents={data.documents}
                  financialData={data.financialData}
                  statistics={data.statistics}
                />
              </motion.div>
            </motion.div>
          )}

          {activeView === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Documentos</h3>
                  <DocumentAnalysisChart data={data.documents} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorización de Datos</h3>
                  <DataCategorizationDashboard />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualizador Comprensivo de Documentos</h3>
                <ComprehensiveDocumentViewer documents={data.documents} />
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Actualizaciones Recientes</h3>
                <RecentUpdatesList />
              </div>
            </motion.div>
          )}

          {activeView === 'financial' && (
            <motion.div
              key="financial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Top Financial Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Presupuestario</h3>
                  <BudgetAnalysisChart year={selectedYear} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Deuda</h3>
                  <DebtAnalysisChart year={selectedYear} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Inversiones</h3>
                  <InvestmentAnalysisChart year={selectedYear} />
                </div>
              </div>
              
              {/* Treasury and Salary Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Tesorería</h3>
                  <TreasuryAnalysisChart year={selectedYear} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Salarial</h3>
                  <SalaryAnalysisChart year={selectedYear} />
                </div>
              </div>
              
              {/* Comprehensive Dashboards */}
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard de Ejecución Presupuestaria</h3>
                  <BudgetExecutionDashboard year={selectedYear} />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard de Análisis de Deuda</h3>
                  <DebtAnalysisDashboard year={selectedYear} />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Comprensivo de Gastos</h3>
                  <ComprehensiveSpendingAnalysis year={selectedYear} />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualización de Escala Salarial</h3>
                  <SalaryScaleVisualization year={selectedYear} />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Financiero Anual</h3>
                  <YearlyFinancialDashboard year={selectedYear} />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Financieras</h3>
                  <FinancialStatsSummary year={selectedYear} />
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Comprehensive Audit Dashboard */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard de Auditoría Principal</h3>
                <AuditDashboard />
              </div>
              
              {/* Financial Audit Dashboard */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard de Auditoría Financiera</h3>
                <FinancialAuditDashboard year={selectedYear} />
              </div>
              
              {/* Critical Issues */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Problemas Críticos
                </h3>
                <CriticalIssues />
              </div>
              
              {/* Anomaly Dashboard */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard de Anomalías</h3>
                <AnomalyDashboard />
              </div>
              
              {/* Corruption Cases */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Casos de Corrupción Detectados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.corruptionCases.map((case_item: any, index: number) => (
                    <motion.div
                      key={case_item.case_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-red-900 mb-2">{case_item.title}</h4>
                      <p className="text-sm text-red-700 mb-2">{case_item.description}</p>
                      <div className="flex justify-between text-xs text-red-600">
                        <span>Severidad: {case_item.severity}</span>
                        <span>Estado: {case_item.status}</span>
                      </div>
                      {case_item.amount && (
                        <div className="mt-2 text-sm font-medium text-red-800">
                          Monto: ${case_item.amount?.toLocaleString()}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Estado de Verificación</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {data.statistics?.verified_documents || 0}
                    </div>
                    <div className="text-sm text-gray-600">Documentos Verificados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {(data.statistics?.total_documents || 0) - (data.statistics?.verified_documents || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Pendientes de Verificar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {metrics.verification_rate}%
                    </div>
                    <div className="text-sm text-gray-600">Tasa de Verificación</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Yearly Trends */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendencias por Año</h3>
                <div className="h-80">
                  <div className="grid grid-cols-5 lg:grid-cols-10 gap-4 h-full items-end">
                    {Object.entries(data.statistics?.by_year || {}).map(([year, count]) => (
                      <div key={year} className="flex flex-col items-center">
                        <div
                          className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t w-full transition-all duration-500 hover:from-blue-600 hover:to-blue-400"
                          style={{ 
                            height: `${((count as number) / Math.max(...Object.values(data.statistics?.by_year || {}))) * 200}px`,
                            minHeight: '20px'
                          }}
                        />
                        <div className="text-xs text-gray-600 mt-2 font-medium">{year}</div>
                        <div className="text-xs text-gray-500">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Activity Feed */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Activity className="h-5 w-5 text-green-500 mr-2" />
                  Actividad en Tiempo Real
                </h3>
                <div className="space-y-4">
                  {data.documents.slice(0, 5).map((doc: any, index: number) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                        <p className="text-xs text-gray-500">{doc.category} • {doc.year}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeView === 'powerbi' && (
            <motion.div
              key="powerbi"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">PowerBI - Dashboard de Datos</h3>
                  <PowerBIDataDashboard />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">PowerBI - Dashboard Financiero</h3>
                  <PowerBIFinancialDashboard />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">PowerBI - Dashboard de Comparación</h3>
                <PowerBIComparisonDashboard />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapa Mental Financiero</h3>
                  <FinancialMindMap />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación de Datos</h3>
                  <DataComparisonDashboard />
                </div>
              </div>
            </motion.div>
          )}
          
          {activeView === 'infrastructure' && (
            <motion.div
              key="infrastructure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rastreador de Infraestructura</h3>
                <InfrastructureTracker />
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Fuentes de Datos</h3>
                <DataSourceManager />
              </div>
            </motion.div>
          )}
          
          {activeView === 'comprehensive' && (
            <motion.div
              key="comprehensive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualización Comprensiva</h3>
                <ComprehensiveVisualization year={selectedYear} />
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Anual Resumido</h3>
                <YearlySummaryDashboard year={selectedYear} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Gráfico Integrado</h3>
                  <IntegratedChart year={selectedYear} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Anuales</h3>
                  <YearlyDataChart year={selectedYear} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;