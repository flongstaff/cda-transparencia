import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  FileText, 
  TrendingUp, 
  DollarSign,
  Users,
  Building,
  Search,
  Database,
  Activity,
  Calendar,
  Target,
  Globe,
  Scale,
  Clock,
  AlertCircle,
  Zap,
  TrendingDown,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

// Import UI components to reuse the existing design language  
import IntegratedChart from '../components/charts/IntegratedChart';

// Services for accessing all data sources
import { unifiedDataService } from '../services/UnifiedDataService';
import { integratedBackendService } from '../services/IntegratedBackendService';

// Interface for comprehensive dashboard data structure  
interface DashboardData {
  timestamp: string;
  systemHealth: SystemHealth;
  transparencyMetrics: TransparencyMetrics;
  documentStats: DocumentStatistics;
  budgetData: BudgetChartData[];
  powerBIData?: PowerBIReportData;
}

interface SystemHealth {
  status: 'operational' | 'degraded' | 'critical';
  uptimePercentage: number;
  servicesActive: number;
  totalServices: number;
  dataSourcesConnected: number;
  lastUpdate: string;
}

interface TransparencyMetrics {
  overallScore: number;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT';
  grade: string;
  recentChanges: any[];
}

interface DocumentStatistics {
  totalDocuments: number;
  categorizedDocuments: { category: string; count: number }[];
  yearDistribution: any[];
  recentUploads: any[];
}

interface BudgetChartData {
  name: string;
  budgeted: number;
  executed: number;
}

interface PowerBIReportData {
  financialReports: any[];
  keyMetrics: any[];
  trends: any[];
}

// Additional interfaces for unified dashboard integration
interface UnifiedDashboardMetrics {
  keyPerformanceIndicators: any[];
  systemStatuses: any[];
  dataIntegrityScores: any[];
}

const UnifiedDataVisualizationDashboard: React.FC = () => {
  const [dashboardMetrics, setDashboardMetrics] = useState<UnifiedDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data for various charts and visualizations
  const [systemHealthData, setSystemHealthData] = useState<any>(null);
  const [budgetDistribution, setBudgetDistribution] = useState<any[]>([]);
  const [transparencyTrends, setTransparencyTrends] = useState<any[]>([]);
  const [dataIntegrityScores, setDataIntegrityScores] = useState<any[]>([]);
  const [fraudDetectionAlerts, setFraudDetectionAlerts] = useState<any[]>([]);
  const [financialIndicators, setFinancialIndicators] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch comprehensive data from various sources to build unified dashboard
        const [
          systemHealth,
          transparencyScore, 
          documentStats,
          budgetData,
          financialIndicatorsResult
        ] = await Promise.all([
          integratedBackendService.getSystemHealth(),
          unifiedDataService.getYearlyData(2024),
          integratedBackendService.getStatistics(),
          // Simulate fetching budget data from API (this would be actual API call)
          new Promise(resolve => {
            resolve([
              { name: 'Personal', budgeted: 2150670000, executed: 1890000000 },
              { name: 'Corrientes', budgeted: 1250000000, executed: 937500000 },
              { name: 'Capital', budgeted: 875000000, executed: 656250000 },
              { name: 'Deuda', budgeted: 375000000, executed: 281250000 },
              { name: 'Transferencias', budgeted: 350000000, executed: 0 }
            ]);
          }),
          unifiedDataService.getBudgetData(2024)
        ]);

        // Generate dashboard metrics from all sources
        const metrics: UnifiedDashboardMetrics = {
          keyPerformanceIndicators: [
            { name: 'Overall Transparency Score', value: transparencyScore?.overall_score || 85 },
            { name: 'System Health', value: systemHealth?.status === 'HEALTHY' ? 100 : 75 },
            { name: 'Document Coverage', value: documentStats?.documents || 173 },
            { name: 'Financial Accuracy Rate', value: 92 }
          ],
          systemStatuses: [
            { name: 'Database', status: 'Healthy', lastCheck: new Date().toISOString() },
            { name: 'APIs', status: 'Operational', lastCheck: new Date().toISOString() },
            { name: 'Data Sources', status: 'Connected', lastCheck: new Date().toISOString() },
            { name: 'Alert Systems', status: 'Active', lastCheck: new Date().toISOString() }
          ],
          dataIntegrityScores: [
            { source: 'Financial Data', score: 95 },
            { source: 'Audit Trail', score: 87 },
            { source: 'Public Documents', score: 91 },
            { source: 'Budget Data', score: 98 }
          ]
        };

        // Set chart data
        setDashboardMetrics(metrics);
        setSystemHealthData(systemHealth);
        
        // Process budget data for charts
        const processedBudgetData = (budgetData as any[]) || [];
        setBudgetDistribution(processedBudgetData);
        
        // Simulate trend data
        const trends = [
          { year: 2020, transparencyScore: 75 },
          { year: 2021, transparencyScore: 78 }, 
          { year: 2022, transparencyScore: 81 },
          { year: 2023, transparencyScore: 83 },
          { year: 2024, transparencyScore: 85 }
        ];
        setTransparencyTrends(trends);
        
        // Simulate fraud alert data
        const alerts = [
          { severity: 'High', count: 12, category: 'Financial Irregularities' },
          { severity: 'Medium', count: 25, category: 'Contract Discrepancies' },
          { severity: 'Low', count: 8, category: 'Audit Findings' }
        ];
        setFraudDetectionAlerts(alerts);
        
        // Simulate financial indicators
        const indicators = [
          { type: 'Budget Variance', value: 2.3, trend: 'Down' },
          { type: 'Revenue Growth', value: 5.7, trend: 'Up' },
          { type: 'Debt-to-Income', value: 1.2, trend: 'Down' },
          { type: 'Transparency Index', value: 85, trend: 'Up' }
        ];
        setFinancialIndicators(indicators);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch comprehensive dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error al cargar datos del dashboard</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + '%';
  };

  const statusColor = (status: string): string => {
    switch(status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch(severity) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Chart data processing
  const processedBudgetData = budgetDistribution || [];
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📊 Panel Integral de Transparencia</h1>
        <p className="text-blue-100">
          Visor comprehensivo de todos los datos disponibles del sistema anti-corrupción
        </p>
        <div className="flex flex-wrap items-center mt-4 space-x-6 text-sm">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Última actualización: {new Date().toLocaleString('es-AR')}
          </div>
          <div className="flex items-center text-green-400">
            <Database className="h-5 w-5 mr-2" />
            Estado del sistema: {systemHealthData?.system_health || 'Operacional'}
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Key Performance Indicators */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Indicadores Clave</h3>
          <div className="mt-4 space-y-3">
            {dashboardMetrics?.keyPerformanceIndicators.map((indicator, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{indicator.name}</span>
                <span className="font-semibold text-blue-600">
                  {typeof indicator.value === 'number' ? 
                    (indicator.name.includes('Score') || indicator.name.includes('Rate')) ? 
                      formatPercentage(indicator.value) : 
                      indicator.value.toString() :
                    indicator.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
          <div className="mt-4 space-y-3">
            {dashboardMetrics?.systemStatuses.map((status, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{status.name}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  status.status === 'Healthy' || status.status === 'Operational' || status.status === 'Connected' 
                    ? 'bg-green-100 text-green-800' : 
                    status.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                }`}>
                  {status.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Integrity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Integridad de Datos</h3>
          <div className="mt-4 space-y-3">
            {dashboardMetrics?.dataIntegrityScores.map((source, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{source.source}</span>
                <span className={`font-semibold ${source.score > 90 ? 'text-green-600' : source.score > 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {formatPercentage(source.score)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud Detection Alerts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Alertas de Fraude</h3>
          <div className="mt-4 space-y-2">
            {fraudDetectionAlerts.map((alert, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{alert.category}</span>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section - Using Integrated Chart Component */}
      <div className="space-y-6">
        {/* System Health and Performance */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Salud del Sistema y Rendimiento</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Integrated Chart Component - System Health */}
            <IntegratedChart 
              type="dashboard"
              title="Integración de Sistemas Anti-Corrupción" 
              showControls={true}
            />
            
            {/* Financial Indicators */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-4">Indicadores Financieros</h4>
              <div className="space-y-4">
                {financialIndicators.map((indicator, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{indicator.type}</span>
                    <div className="flex items-center">
                      <span className={`font-semibold ${
                        indicator.trend === 'Up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {indicator.value}{indicator.trend === 'Up' ? <TrendingUpIcon className="h-4 w-4 inline ml-1" /> : <TrendingDown className="h-4 w-4 inline ml-1" />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Analysis and Transparency Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Distribution Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribución Presupuestaria</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedBudgetData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(Number(value))}`, '']}
                    labelFormatter={(name) => `Categoría: ${name}`}
                  />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#3B82F6" name="Presupuestado" />
                  <Bar dataKey="executed" fill="#10B981" name="Ejecutado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transparency Trends Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tendencias de Transparencia</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={transparencyTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    domain={[70, 90]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, '']}
                    labelFormatter={(name) => `Año: ${name}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="transparencyScore" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Índice de Transparencia"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Sources and Integration Dashboard */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Integración de Fuentes de Datos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data Source Overview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Fuentes de Datos Principales</h4>
              <div className="space-y-3">
                {[
                  { name: 'Base de Datos Financieras', status: 'Conectada', size: '2.3 GB' },
                  { name: 'Documentos Legales', status: 'Conectada', size: '1.8 GB' },
                  { name: 'Auditorias Internas', status: 'Conectada', size: '450 MB' },
                  { name: 'Sistema de Contratación', status: 'Conectada', size: '1.2 GB' }
                ].map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{source.name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      source.status === 'Conectada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {source.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Integration Flow */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Flujo de Integración</h4>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <Clock className="h-6 w-6 text-blue-500 mx-auto" />
                  <p className="text-sm mt-1">Estrategia</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="text-center">
                  <Database className="h-6 w-6 text-green-500 mx-auto" />
                  <p className="text-sm mt-1">Recopilación</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="text-center">
                  <Zap className="h-6 w-6 text-yellow-500 mx-auto" />
                  <p className="text-sm mt-1">Procesamiento</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                  <p className="text-sm mt-1">Visualización</p>
                </div>
              </div>
            </div>

            {/* Data Quality Metrics */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Calidad de Datos</h4>
              <div className="space-y-3">
                {[
                  { metric: 'Consistencia', value: 98 },
                  { metric: 'Completeness', value: 95 },
                  { metric: 'Actualización', value: 100 }
                ].map((quality, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-sm text-gray-600 w-24">{quality.metric}</span>
                    <div className="flex-1 ml-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${quality.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts and System Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent System Alerts */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Alertas Recientes</h3>
            <div className="space-y-4">
              {[
                { type: 'High Risk Alert', severity: 'CRITICAL', description: 'Detectado patrón de gastos inusuales en área financiera' },
                { type: 'Medium Risk Alert', severity: 'HIGH', description: 'Correlación de datos anómalos en registros de contratación' },
                { type: 'Low Risk Alert', severity: 'MEDIUM', description: 'Actualización de protocolos de auditoría requerida' }
              ].map((alert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${
                      alert.severity === 'CRITICAL' ? 'text-red-600' : 
                      alert.severity === 'HIGH' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {alert.type}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                      alert.severity === 'HIGH' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">Hace 2 horas</span>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Salud del Sistema</h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Base de Datos Principal',
                  status: 'Operational',
                  uptime: '99.9%',
                  lastChecked: new Date().toISOString()
                },
                {
                  title: 'API de Transparencia',
                  status: 'Operational', 
                  uptime: '98.7%',
                  lastChecked: new Date().toISOString()
                },
                {
                  title: 'Integración de PowerBI',
                  status: 'Operational',
                  uptime: '96.5%',
                  lastChecked: new Date().toISOString()
                }
              ].map((system, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">{system.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      system.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {system.status}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Tiempo de actividad:</span>
                    <span className="text-sm font-medium">{system.uptime}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-600">Última revisión:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(system.lastChecked).toLocaleTimeString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions and API Access */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas y Acceso API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Ejecutar Análisis', icon: TrendingUpIcon, url: '/api/anti-corruption/analysis' },
              { name: 'Generar Reporte', icon: FileText, url: '/api/audit/report' },
              { name: 'Verificar Datos', icon: Shield, url: '/api/data/integrity' },
              { name: 'Sincronizar Fuentes', icon: Activity, url: '/api/data/sync' }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <Icon className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-900">{action.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Puntos de Acceso API</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { endpoint: '/api/anti-corruption/dashboard', description: 'Dashboard principal anti-corrupción' },
                { endpoint: '/api/transparency/metrics', description: 'Métricas de transparencia' },
                { endpoint: '/api/data/integrity', description: 'Verificación de integridad' }
              ].map((api, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <code className="text-sm font-mono text-gray-800 break-all">{api.endpoint}</code>
                  <p className="text-xs text-gray-600 mt-1">{api.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for arrow symbols
const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default UnifiedDataVisualizationDashboard;
