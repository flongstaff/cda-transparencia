import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  Users,
  FileX,
  Calendar,
  Target,
  Scale,
  Zap,
  Clock,
  Building,
  Download,
  Share
} from 'lucide-react';

// Services
import dataService from '../services/dataService';

interface AuditAnomaly {
  id: string;
  type: 'missing_document' | 'budget_discrepancy' | 'contract_irregularity' | 'salary_anomaly' | 'transparency_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  document_id?: string;
  document_name?: string;
  amount?: number;
  year: number;
  category: string;
  fine_amount?: number;
  council_involved?: boolean;
  council_members?: string[];
  legal_implications?: string;
  importance_score: number;
  resolution_status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
  resolution_date?: string;
  responsible_department?: string;
  created_date: string;
  impact_assessment: string;
  recommended_actions: string[];
}

interface DocumentImportance {
  document_id: string;
  importance_score: number;
  legal_significance: 'low' | 'medium' | 'high' | 'critical';
  public_interest: 'low' | 'medium' | 'high';
  financial_impact: number;
  transparency_impact: number;
  regulatory_compliance: boolean;
  council_decision_required: boolean;
  statutory_deadline?: string;
  penalties_for_non_compliance?: string;
  public_disclosure_required: boolean;
}

const AuditAnomaliesExplainer: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AuditAnomaly[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AuditAnomaly | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'importance'>('severity');

  // Load audit data and generate anomalies
  const loadAuditData = async () => {
    setLoading(true);
    setError(null);

    try {
      const anomaliesData = await dataService.auditDiscrepancies();
      setAnomalies(anomaliesData);
    } catch (err) {
      console.error('Error loading audit data:', err);
      setError(err instanceof Error ? err.message : 'Error loading audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  // Filter and sort anomalies
  const filteredAnomalies = anomalies
    .filter(anomaly => 
      (filterSeverity === 'all' || anomaly.severity === filterSeverity) &&
      (filterType === 'all' || anomaly.type === filterType)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
                    case 'severity': {
                      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                      return severityOrder[b.severity] - severityOrder[a.severity];
                    }        case 'importance':
          return b.importance_score - a.importance_score;
        default:
          return 0;
      }
    });

  // Severity colors and icons
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, bgColor: 'bg-red-50' };
      case 'high':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, bgColor: 'bg-orange-50' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Info, bgColor: 'bg-yellow-50' };
      case 'low':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Info, bgColor: 'bg-blue-50' };
      default:
        return { color: 'bg-gray-100 dark:bg-dark-background text-gray-800 dark:text-dark-text-secondary border-gray-200', icon: Info, bgColor: 'bg-gray-50 dark:bg-dark-background' };
    }
  };

  // Status colors
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'resolved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'dismissed':
        return { color: 'bg-gray-100 dark:bg-dark-background text-gray-800 dark:text-dark-text-secondary', icon: FileX };
      default:
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Analizando anomalías de auditoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3 text-red-600 dark:text-red-400" />
              Sistema de Detección de Anomalías
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">
              Análisis automático de irregularidades, importancia de documentos y implicaciones legales
            </p>
          </div>
          
          <button
            onClick={loadAuditData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Actualizar Análisis</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las severidades</option>
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Medio</option>
            <option value="low">Bajo</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="missing_document">Documentos faltantes</option>
            <option value="budget_discrepancy">Discrepancias presupuestarias</option>
            <option value="contract_irregularity">Irregularidades contractuales</option>
            <option value="salary_anomaly">Anomalías salariales</option>
            <option value="transparency_issue">Problemas de transparencia</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="severity">Ordenar por severidad</option>
            <option value="date">Ordenar por fecha</option>
            <option value="importance">Ordenar por importancia</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
            {anomalies.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Críticos</div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 text-center">
          <DollarSign className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
            ${anomalies.reduce((sum, a) => sum + (a.fine_amount || 0), 0).toLocaleString('es-AR')}
          </div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Total en Multas</div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 text-center">
          <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
            {anomalies.filter(a => a.council_involved).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Con Concejo Involucrado</div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 text-center">
          <Target className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
            {anomalies.filter(a => a.resolution_status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Resueltos</div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.map((anomaly) => {
          const severityConfig = getSeverityConfig(anomaly.severity);
          const statusConfig = getStatusConfig(anomaly.resolution_status);
          const SeverityIcon = severityConfig.icon;
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-md border-l-4 ${
                anomaly.severity === 'critical' ? 'border-red-500' :
                anomaly.severity === 'high' ? 'border-orange-500' :
                anomaly.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-full ${severityConfig.bgColor}`}>
                      <SeverityIcon className="w-6 h-6 text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{anomaly.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${severityConfig.color}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {anomaly.resolution_status === 'pending' ? 'Pendiente' :
                           anomaly.resolution_status === 'in_progress' ? 'En Progreso' :
                           anomaly.resolution_status === 'resolved' ? 'Resuelto' : 'Desestimado'}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-4">{anomaly.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {anomaly.amount && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>Monto: ${anomaly.amount.toLocaleString('es-AR')}</span>
                          </div>
                        )}
                        
                        {anomaly.fine_amount && (
                          <div className="flex items-center space-x-2">
                            <Scale className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span>Multa: ${anomaly.fine_amount.toLocaleString('es-AR')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Importancia: {anomaly.importance_score}/100</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Año: {anomaly.year}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary" />
                          <span>{anomaly.responsible_department}</span>
                        </div>
                        
                        {anomaly.council_involved && (
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span>Concejo involucrado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedAnomaly(anomaly)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedAnomaly && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 dark:bg-dark-border bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={() => setSelectedAnomaly(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-dark-surface"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{selectedAnomaly.title}</h3>
                  <button
                    onClick={() => setSelectedAnomaly(null)}
                    className="text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary hover:text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary"
                  >
                    <span className="sr-only">Cerrar</span>
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Descripción</h4>
                      <p className="text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">{selectedAnomaly.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Evaluación de Impacto</h4>
                      <p className="text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">{selectedAnomaly.impact_assessment}</p>
                    </div>
                    
                    {selectedAnomaly.legal_implications && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Implicaciones Legales</h4>
                        <p className="text-red-700 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{selectedAnomaly.legal_implications}</p>
                      </div>
                    )}
                    
                    {selectedAnomaly.council_members && selectedAnomaly.council_members.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Concejales Involucrados</h4>
                        <div className="space-y-1">
                          {selectedAnomaly.council_members.map((member, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">{member}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Acciones Recomendadas</h4>
                      <ul className="space-y-2">
                        {selectedAnomaly.recommended_actions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-3">Datos Clave</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Puntuación:</span>
                          <div className="font-semibold">{selectedAnomaly.importance_score}/100</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Categoría:</span>
                          <div className="font-semibold">{selectedAnomaly.category}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Departamento:</span>
                          <div className="font-semibold">{selectedAnomaly.responsible_department}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Fecha:</span>
                          <div className="font-semibold">{new Date(selectedAnomaly.created_date).toLocaleDateString('es-ES')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <button className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                    <Share className="w-4 h-4 inline mr-2" />
                    Compartir
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                    <Download className="w-4 h-4 inline mr-2" />
                    Exportar
                  </button>
                  <button
                    onClick={() => setSelectedAnomaly(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditAnomaliesExplainer;