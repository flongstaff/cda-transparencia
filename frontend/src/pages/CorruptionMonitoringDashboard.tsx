import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  Eye,
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Database,
  Target,
  Zap
} from 'lucide-react';
import WaterfallChart from '../components/charts/WaterfallChart';
import FinancialSunburstChart from '../components/charts/FinancialSunburstChart';

interface AnomalyDetection {
  id: string;
  type: 'price' | 'process' | 'vendor' | 'payment' | 'budget' | 'timeline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  amount?: number;
  date: string;
  entity: string;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  confidence: number;
  indicators: string[];
}

interface CorruptionRisk {
  category: string;
  score: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  cases: number;
  flaggedAmount: number;
}

interface TransparencyMetric {
  metric: string;
  score: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

const CorruptionMonitoringDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'overview' | 'anomalies' | 'risks' | 'transparency' | 'investigation' | 'reports'>('overview');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Mock data - In production, this would come from API and ML models
  const anomalies: AnomalyDetection[] = useMemo(() => [
    {
      id: 'AN-2024-001',
      type: 'price',
      severity: 'critical',
      title: 'Precio Significativamente Superior al Mercado',
      description: 'Contrato de servicios con precio 340% superior al promedio de mercado',
      amount: 2450000,
      date: '2024-08-15',
      entity: 'Licitación Pública N°8',
      status: 'investigating',
      confidence: 94,
      indicators: ['Precio fuera de rango', 'Un solo oferente', 'Proveedor nuevo']
    },
    {
      id: 'AN-2024-002',
      type: 'vendor',
      severity: 'high',
      title: 'Patrón de Adjudicaciones Irregular',
      description: 'Mismo proveedor adjudicado en 15 licitaciones consecutivas sin competencia',
      amount: 8900000,
      date: '2024-07-22',
      entity: 'Compras Menores - Infraestructura',
      status: 'investigating',
      confidence: 87,
      indicators: ['Falta de competencia', 'Patrón repetitivo', 'Fraccionamiento de contratos']
    },
    {
      id: 'AN-2024-003',
      type: 'process',
      severity: 'high',
      title: 'Modificación Sustancial Post-Adjudicación',
      description: 'Ampliación de contrato del 280% respecto al monto original',
      amount: 3200000,
      date: '2024-06-10',
      entity: 'Obra Pública - Centro de Salud',
      status: 'detected',
      confidence: 91,
      indicators: ['Ampliación excesiva', 'Cambio de especificaciones', 'Sin nueva licitación']
    },
    {
      id: 'AN-2024-004',
      type: 'payment',
      severity: 'medium',
      title: 'Pagos Anticipados sin Garantía',
      description: 'Pago del 80% antes del inicio de la obra sin garantía de cumplimiento',
      amount: 1850000,
      date: '2024-05-28',
      entity: 'Infraestructura Vial',
      status: 'resolved',
      confidence: 78,
      indicators: ['Pago anticipado alto', 'Sin garantías', 'Contrato modificado']
    },
    {
      id: 'AN-2024-005',
      type: 'budget',
      severity: 'medium',
      title: 'Ejecución Presupuestaria Irregular',
      description: 'Gastos concentrados en último trimestre sin justificación',
      amount: 4200000,
      date: '2024-09-12',
      entity: 'Secretaría de Obras Públicas',
      status: 'investigating',
      confidence: 82,
      indicators: ['Concentración temporal', 'Fraccionamiento', 'Sin planificación']
    },
    {
      id: 'AN-2024-006',
      type: 'timeline',
      severity: 'low',
      title: 'Plazos de Licitación Reducidos',
      description: 'Plazo de presentación de ofertas menor al mínimo legal',
      amount: 980000,
      date: '2024-04-15',
      entity: 'Adquisición de Equipamiento',
      status: 'false_positive',
      confidence: 65,
      indicators: ['Plazo reducido', 'Justificación urgencia', 'Dentro de excepciones']
    }
  ], []);

  const corruptionRisks: CorruptionRisk[] = useMemo(() => [
    {
      category: 'Contrataciones Públicas',
      score: 72,
      trend: 'decreasing',
      cases: 8,
      flaggedAmount: 15800000
    },
    {
      category: 'Ejecución Presupuestaria',
      score: 45,
      trend: 'stable',
      cases: 3,
      flaggedAmount: 4200000
    },
    {
      category: 'Obras Públicas',
      score: 68,
      trend: 'increasing',
      cases: 6,
      flaggedAmount: 12300000
    },
    {
      category: 'Recursos Humanos',
      score: 28,
      trend: 'stable',
      cases: 1,
      flaggedAmount: 890000
    },
    {
      category: 'Administración Financiera',
      score: 38,
      trend: 'decreasing',
      cases: 2,
      flaggedAmount: 2100000
    }
  ], []);

  const transparencyMetrics: TransparencyMetric[] = useMemo(() => [
    {
      metric: 'Publicación de Licitaciones',
      score: 95,
      target: 100,
      status: 'good',
      lastUpdated: '2024-09-30'
    },
    {
      metric: 'Disponibilidad de Datos Abiertos',
      score: 78,
      target: 90,
      status: 'warning',
      lastUpdated: '2024-09-30'
    },
    {
      metric: 'Respuesta a Solicitudes de Información',
      score: 88,
      target: 95,
      status: 'good',
      lastUpdated: '2024-09-30'
    },
    {
      metric: 'Declaraciones Juradas Publicadas',
      score: 100,
      target: 100,
      status: 'good',
      lastUpdated: '2024-09-30'
    },
    {
      metric: 'Contratos Publicados con Detalle',
      score: 65,
      target: 90,
      status: 'critical',
      lastUpdated: '2024-09-30'
    },
    {
      metric: 'Participación Ciudadana',
      score: 72,
      target: 80,
      status: 'warning',
      lastUpdated: '2024-09-30'
    }
  ], []);

  const filteredAnomalies = useMemo(() => {
    if (severityFilter === 'all') return anomalies;
    return anomalies.filter(a => a.severity === severityFilter);
  }, [anomalies, severityFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'text-red-600 bg-red-50';
      case 'investigating': return 'text-orange-600 bg-orange-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'false_positive': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected': return <AlertCircle className="w-4 h-4" />;
      case 'investigating': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'false_positive': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500 rotate-0" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-sm text-gray-500">Anomalías Detectadas</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {anomalies.filter(a => a.status !== 'false_positive' && a.status !== 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">
            {anomalies.filter(a => a.severity === 'critical').length} críticas, {anomalies.filter(a => a.severity === 'high').length} altas
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <span className="text-sm text-gray-500">Monto Observado</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ${(anomalies.reduce((sum, a) => sum + (a.amount || 0), 0) / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-600">
            En investigación
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">Transparencia Promedio</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {Math.round(transparencyMetrics.reduce((sum, m) => sum + m.score, 0) / transparencyMetrics.length)}%
          </div>
          <div className="text-sm text-gray-600">
            {transparencyMetrics.filter(m => m.status === 'good').length} de {transparencyMetrics.length} métricas óptimas
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Precisión del Sistema</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {Math.round(anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length)}%
          </div>
          <div className="text-sm text-gray-600">
            Confianza promedio en detecciones
          </div>
        </motion.div>
      </div>

      {/* Risk Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Mapa de Riesgos de Corrupción
          </h3>
        </div>
        <div className="space-y-4">
          {corruptionRisks.map((risk, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{risk.category}</span>
                  {getTrendIcon(risk.trend)}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{risk.cases} casos</span>
                  <span className="text-sm font-semibold text-gray-900">{risk.score}/100</span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${risk.score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`absolute left-0 top-0 h-full rounded-full ${
                    risk.score >= 70 ? 'bg-red-500' :
                    risk.score >= 50 ? 'bg-orange-500' :
                    risk.score >= 30 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                />
              </div>
              <div className="text-xs text-gray-500">
                Monto observado: ${(risk.flaggedAmount / 1000000).toFixed(2)}M
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Anomalies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Anomalías Recientes (Alta Prioridad)
          </h3>
          <button
            onClick={() => setViewMode('anomalies')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas →
          </button>
        </div>
        <div className="space-y-3">
          {anomalies.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 3).map((anomaly) => (
            <div
              key={anomaly.id}
              className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase">{anomaly.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(anomaly.status)} flex items-center gap-1`}>
                      {getStatusIcon(anomaly.status)}
                      {anomaly.status === 'detected' ? 'Detectada' :
                       anomaly.status === 'investigating' ? 'Investigando' :
                       anomaly.status === 'resolved' ? 'Resuelta' : 'Falso Positivo'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{anomaly.title}</h4>
                  <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {anomaly.entity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(anomaly.date).toLocaleDateString('es-AR')}
                    </span>
                    {anomaly.amount && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${(anomaly.amount / 1000000).toFixed(2)}M
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gray-900">{anomaly.confidence}%</div>
                  <div className="text-xs text-gray-600">confianza</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {anomaly.indicators.map((indicator, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-300">
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderAnomalies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Todas las Anomalías Detectadas</h3>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todas las severidades</option>
          <option value="critical">Solo críticas</option>
          <option value="high">Solo altas</option>
          <option value="medium">Solo medias</option>
          <option value="low">Solo bajas</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredAnomalies.map((anomaly) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold uppercase">{anomaly.id}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(anomaly.status)} flex items-center gap-1`}>
                    {getStatusIcon(anomaly.status)}
                    {anomaly.status === 'detected' ? 'Detectada' :
                     anomaly.status === 'investigating' ? 'Investigando' :
                     anomaly.status === 'resolved' ? 'Resuelta' : 'Falso Positivo'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {anomaly.type === 'price' ? 'Precio' :
                     anomaly.type === 'process' ? 'Proceso' :
                     anomaly.type === 'vendor' ? 'Proveedor' :
                     anomaly.type === 'payment' ? 'Pago' :
                     anomaly.type === 'budget' ? 'Presupuesto' : 'Cronograma'}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{anomaly.title}</h4>
                <p className="text-gray-700 mb-3">{anomaly.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {anomaly.entity}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(anomaly.date).toLocaleDateString('es-AR')}
                  </span>
                  {anomaly.amount && (
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      ${anomaly.amount.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-gray-900">{anomaly.confidence}%</div>
                <div className="text-sm text-gray-600">confianza</div>
                <div className="mt-2 px-3 py-1 rounded bg-white text-xs font-semibold uppercase">
                  {anomaly.severity === 'critical' ? 'Crítica' :
                   anomaly.severity === 'high' ? 'Alta' :
                   anomaly.severity === 'medium' ? 'Media' : 'Baja'}
                </div>
              </div>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">Indicadores de riesgo:</div>
              <div className="flex flex-wrap gap-2">
                {anomaly.indicators.map((indicator, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-300">
                    • {indicator}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTransparency = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-600" />
          Índice de Transparencia Municipal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transparencyMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 text-sm">{metric.metric}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  metric.status === 'good' ? 'bg-green-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </div>
              <div className="mb-3">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{metric.score}%</span>
                  <span className="text-sm text-gray-600 mb-1">/ {metric.target}%</span>
                </div>
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(metric.score / metric.target) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`absolute left-0 top-0 h-full rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Actualizado: {new Date(metric.lastUpdated).toLocaleDateString('es-AR')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Datos Abiertos Publicados
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-gray-700">Presupuesto Municipal</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-gray-700">Ejecución de Gastos</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-gray-700">Contrataciones Públicas</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-sm font-medium text-gray-700">Salarios y Personal</span>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-sm font-medium text-gray-700">Detalle de Contratos</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Participación Ciudadana
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Consultas Públicas</span>
                <span className="text-sm font-bold text-gray-900">12 activas</span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-purple-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Denuncias Recibidas</span>
                <span className="text-sm font-bold text-gray-900">8 en proceso</span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-orange-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Solicitudes de Información</span>
                <span className="text-sm font-bold text-gray-900">45 respondidas</span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-600" />
            Monitor de Integridad y Anticorrupción
          </h1>
          <p className="text-gray-600">
            Sistema de detección de anomalías e indicadores de transparencia municipal
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'anomalies', label: 'Anomalías', icon: AlertTriangle },
            { id: 'risks', label: 'Riesgos', icon: Shield },
            { id: 'transparency', label: 'Transparencia', icon: Eye },
            { id: 'investigation', label: 'Investigaciones', icon: FileText },
            { id: 'reports', label: 'Reportes', icon: PieChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                viewMode === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'anomalies' && renderAnomalies()}
        {viewMode === 'transparency' && renderTransparency()}
        {viewMode === 'risks' && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis Detallado de Riesgos</h3>
            <p className="text-gray-600">Contenido del análisis de riesgos en desarrollo...</p>
          </div>
        )}
        {viewMode === 'investigation' && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Investigaciones en Curso</h3>
            <p className="text-gray-600">Panel de investigaciones en desarrollo...</p>
          </div>
        )}
        {viewMode === 'reports' && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reportes y Estadísticas</h3>
            <p className="text-gray-600">Sistema de reportes en desarrollo...</p>
          </div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Sistema de Detección Automática</p>
              <p>
                Este sistema utiliza algoritmos de aprendizaje automático y reglas de negocio para detectar
                patrones irregulares en las operaciones municipales. Las anomalías detectadas requieren
                investigación manual para confirmar su naturaleza.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CorruptionMonitoringDashboard;
