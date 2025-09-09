import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Eye,
  FileSearch,
  Activity,
  BarChart3,
  Zap,
  Database,
  Settings,
  Clock,
  AlertCircle,
  Download,
  Play,
  Loader2
} from 'lucide-react';
import { professionalApiService, AntiCorruptionDashboard } from '../services/ProfessionalApiService';
import { formatCurrencyARS } from '../utils/formatters';

const AntiCorruptionDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AntiCorruptionDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'analysis' | 'actions'>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAntiCorruptionData();
  }, []);

  const loadAntiCorruptionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🛡️ Loading professional anti-corruption dashboard...');
      const data = await professionalApiService.getAntiCorruptionDashboard();
      setDashboardData(data);
      console.log('✅ Anti-corruption dashboard loaded:', data);
    } catch (err) {
      console.error('❌ Error loading anti-corruption dashboard:', err);
      setError('Error al cargar el sistema anti-corrupción');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: string, endpoint: string) => {
    setActionLoading(action);
    try {
      console.log(`🎯 Executing action: ${action}`);
      let result;
      
      if (endpoint.includes('/analysis/')) {
        const year = dashboardData?.current_year || new Date().getFullYear();
        result = await professionalApiService.runCorruptionAnalysis(year);
      } else if (endpoint.includes('/generate-report')) {
        const year = dashboardData?.current_year || new Date().getFullYear();
        result = await professionalApiService.generateAuditReport(year);
      } else if (endpoint.includes('/run-tracker')) {
        result = await professionalApiService.runPythonTracker();
      } else if (endpoint.includes('/compare-official/')) {
        const year = dashboardData?.current_year || new Date().getFullYear();
        result = await professionalApiService.compareOfficialData(year);
      } else if (endpoint.includes('/trends')) {
        result = await professionalApiService.getTransparencyTrends();
      }
      
      console.log(`✅ Action completed:`, result);
      // Reload data after action
      await loadAntiCorruptionData();
    } catch (error) {
      console.error(`❌ Action failed:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'BAJO': return 'text-green-600 bg-green-100';
      case 'MEDIO': return 'text-yellow-600 bg-yellow-100';
      case 'ALTO': return 'text-orange-600 bg-orange-100';
      case 'CRÍTICO': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-600';
    if (grade.includes('B')) return 'text-blue-600';
    if (grade.includes('C')) return 'text-yellow-600';
    if (grade.includes('D')) return 'text-orange-600';
    if (grade.includes('F')) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando Sistema Anti-Corrupción
          </h3>
          <p className="text-gray-600">
            Inicializando servicios de detección y análisis...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 text-center mb-2">
            Error del Sistema
          </h3>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={loadAntiCorruptionData}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-600 p-3 rounded-xl mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema Anti-Corrupción Profesional
                </h1>
                <p className="text-gray-600">
                  Detección automática, análisis transparencia y auditoría integral
                </p>
              </div>
            </div>
            
            {dashboardData?.system_status && (
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  dashboardData.system_status.operational 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    dashboardData.system_status.operational ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}></div>
                  {dashboardData.system_status.operational ? 'Sistema Activo' : 'Sistema Inactivo'}
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <div>Servicios: {dashboardData.system_status.services_active}</div>
                  <div>Fuentes: {dashboardData.system_status.data_sources_connected}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Performance Indicators */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${getRiskLevelColor(dashboardData.corruption_status.risk_level)}`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Nivel de Riesgo</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.corruption_status.risk_level}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Puntuación Transparencia</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {dashboardData.transparency_metrics.overall_score}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Alertas Críticas</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {dashboardData.red_flags.critical_alerts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${getGradeColor(dashboardData.transparency_metrics.grade)} bg-opacity-20`}>
                    <BarChart3 className={`h-6 w-6 ${getGradeColor(dashboardData.transparency_metrics.grade)}`} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Calificación</p>
                  <p className={`text-2xl font-semibold ${getGradeColor(dashboardData.transparency_metrics.grade)}`}>
                    {dashboardData.transparency_metrics.grade}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Resumen General', icon: Eye },
                { key: 'alerts', label: 'Alertas y Banderas Rojas', icon: AlertTriangle },
                { key: 'analysis', label: 'Análisis Detallado', icon: BarChart3 },
                { key: 'actions', label: 'Acciones del Sistema', icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && dashboardData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Transparency Metrics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Métricas de Transparencia
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Puntuación General:</span>
                        <span className="font-semibold text-blue-600">
                          {dashboardData.transparency_metrics.overall_score}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calificación:</span>
                        <span className={`font-semibold ${getGradeColor(dashboardData.transparency_metrics.grade)}`}>
                          {dashboardData.transparency_metrics.grade}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado de Cumplimiento:</span>
                        <span className="font-semibold text-gray-900">
                          {dashboardData.transparency_metrics.compliance_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Áreas de Mejora:</span>
                        <span className="font-semibold text-orange-600">
                          {dashboardData.transparency_metrics.improvement_areas.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Estadísticas Rápidas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Documentos Analizados:</span>
                        <span className="font-semibold text-gray-900">
                          {dashboardData.quick_stats.total_documents_analyzed.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Años Cubiertos:</span>
                        <span className="font-semibold text-gray-900">
                          {dashboardData.quick_stats.budget_years_covered}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issues Detectados:</span>
                        <span className="font-semibold text-red-600">
                          {dashboardData.kpi_summary.total_issues_detected}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uptime del Sistema:</span>
                        <span className="font-semibold text-green-600">
                          {dashboardData.quick_stats.system_uptime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && dashboardData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Banderas Rojas y Alertas Recientes
                  </h3>
                  <div className="flex space-x-4 text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Críticas: {dashboardData.red_flags.critical_alerts}
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      Alta Prioridad: {dashboardData.red_flags.high_priority_alerts}
                    </span>
                  </div>
                </div>
                
                {dashboardData.red_flags.recent_alerts.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.red_flags.recent_alerts.map((alert, index) => (
                      <div 
                        key={index}
                        className={`border-l-4 bg-white p-4 rounded-r-lg shadow-sm ${
                          alert.severity === 'CRITICAL' ? 'border-red-500' :
                          alert.severity === 'HIGH' ? 'border-orange-500' :
                          alert.severity === 'MEDIUM' ? 'border-yellow-500' :
                          'border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full mr-3 ${
                                alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {alert.severity}
                              </span>
                              <span className="text-sm text-gray-500">{alert.category}</span>
                            </div>
                            <p className="text-gray-900 mt-2">{alert.description}</p>
                          </div>
                          <div className="text-sm text-gray-500 text-right">
                            {new Date(alert.date).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No hay alertas recientes
                    </h4>
                    <p className="text-gray-600">
                      El sistema no ha detectado banderas rojas en el período actual
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analysis' && dashboardData && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Análisis Detallado del Sistema
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">KPIs del Sistema</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Issues Detectados:</span>
                        <span className="font-semibold">{dashboardData.kpi_summary.total_issues_detected}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calificación de Transparencia:</span>
                        <span className="font-semibold">{dashboardData.kpi_summary.transparency_grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requiere Atención Inmediata:</span>
                        <span className={`font-semibold ${dashboardData.kpi_summary.requires_immediate_attention ? 'text-red-600' : 'text-green-600'}`}>
                          {dashboardData.kpi_summary.requires_immediate_attention ? 'SÍ' : 'NO'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cumplimiento Legal:</span>
                        <span className="font-semibold">{dashboardData.kpi_summary.legal_compliance_status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Audit Trail</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total de Reportes:</span>
                        <span className="font-semibold">{dashboardData.audit_trail.total_reports}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Último Reporte:</span>
                        <span className="font-semibold text-sm">{dashboardData.audit_trail.latest_report || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sesión Actual:</span>
                        <span className="font-semibold text-sm">{dashboardData.audit_trail.current_session || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actions' && dashboardData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Acciones Disponibles del Sistema
                  </h3>
                  <p className="text-sm text-gray-500">
                    {dashboardData.available_actions.length} acciones disponibles
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboardData.available_actions.map((action, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full mr-3 ${
                              action.category === 'analysis' ? 'bg-blue-100 text-blue-800' :
                              action.category === 'reporting' ? 'bg-green-100 text-green-800' :
                              action.category === 'detection' ? 'bg-red-100 text-red-800' :
                              action.category === 'verification' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {action.category.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">{action.estimated_time}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {action.action.replace(/_/g, ' ').toUpperCase()}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            {action.description}
                          </p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {action.endpoint}
                          </code>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => executeAction(action.action, action.endpoint)}
                          disabled={actionLoading === action.action}
                          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            actionLoading === action.action
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {actionLoading === action.action ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Ejecutando...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Ejecutar Acción
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiCorruptionDashboardPage;