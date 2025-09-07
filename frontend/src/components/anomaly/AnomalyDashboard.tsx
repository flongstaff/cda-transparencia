import React, { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, FileText, TrendingDown } from 'lucide-react';
import { consolidatedApiService } from '../../services/ConsolidatedApiService';

interface Anomaly {
  id: string;
  type: 'missing_declaration' | 'execution_gap' | 'undeclared_crypto' | 'budget_discrepancy';
  title: string;
  description: string;
  amount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
  related_documents: string[];
  detection_date: string;
}

const AnomalyDashboard: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnomalyData();
  }, []);

  const loadAnomalyData = async () => {
    try {
      setLoading(true);
      // This would fetch real anomaly data from your analysis
      // For now, using simulated data based on your findings
      const mockAnomalies: Anomaly[] = [
        {
          id: 'anomaly_1',
          type: 'execution_gap',
          title: '$169.8M en Obras Públicas No Ejecutadas',
          description: 'Contratos adjudicados pero no ejecutados completamente',
          amount: 169828314.90,
          severity: 'critical',
          evidence: [
            'Contrato camioneta utilitaria - $17.6M no entregada',
            'Combi mini bus - $52.6M no entregada',
            'Equipos de nefrología - $71M no entregados',
            'Sistema de agua - 60% no ejecutado ($28.4M)'
          ],
          related_documents: [
            'Licitación Pública N°10',
            'Contrato Obras Públicas 2023-01',
            'Informe de Ejecución Trimestral Q3'
          ],
          detection_date: new Date().toISOString()
        },
        {
          id: 'anomaly_2',
          type: 'missing_declaration',
          title: 'Declaraciones Patrimoniales Pendientes',
          description: 'Funcionarios sin declaración patrimonial presentada',
          amount: 21000000,
          severity: 'high',
          evidence: [
            'Intendente Villagrán Iván Darío - 2024',
            'Directora Fernández Julieta Tamara - 2022'
          ],
          related_documents: [
            'Resolución 123/2024 - Presentación DDJJ',
            'Informe de Cumplimiento 2024'
          ],
          detection_date: new Date().toISOString()
        },
        {
          id: 'anomaly_3',
          type: 'undeclared_crypto',
          title: 'Posible Tenencia de Criptomonedas No Declarada',
          description: 'Indicios de tenencia no declarada por altos funcionarios',
          amount: 13000000,
          severity: 'high',
          evidence: [
            'Transacciones sospechosas detectadas en blockchain',
            'Correspondencia con actualizaciones de sueldos en personal key',
            'Patrones de gasto inusuales en familiares de funcionarios'
          ],
          related_documents: [
            'DDJJ 2023 - Villagrán',
            'DDJJ 2023 - Fernández',
            'DDJJ 2023 - Dinardi'
          ],
          detection_date: new Date().toISOString()
        }
      ];
      
      setAnomalies(mockAnomalies);
    } catch (err) {
      setError('Error al cargar datos de anomalías');
      console.error('Anomaly data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string): JSX.Element => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high': return <TrendingDown className="h-5 w-5 text-orange-500" />;
      case 'medium': return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'low': return <DollarSign className="h-5 w-5 text-blue-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando análisis de anomalías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button 
          onClick={loadAnomalyData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🔍 Análisis de Anomalías Financieras</h1>
            <p className="mt-2 text-red-100">
              Detección automatizada de irregularidades financieras en el municipio
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{anomalies.length}</div>
            <div className="text-red-100">Anomalías Detectadas</div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {anomalies.some(a => a.severity === 'critical') && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                ⚠️ Alerta Crítica: Anomalías de Alto Riesgo Detectadas
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Se han identificado {anomalies.filter(a => a.severity === 'critical').length} anomalías críticas 
                  que requieren atención inmediata. Revise los detalles a continuación.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomalies List */}
      <div className="grid grid-cols-1 gap-6">
        {anomalies.map((anomaly) => (
          <div 
            key={anomaly.id} 
            className={`bg-white rounded-lg shadow border-l-4 ${
              anomaly.severity === 'critical' ? 'border-red-500' : 
              anomaly.severity === 'high' ? 'border-orange-500' : 
              anomaly.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
            } overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-4 ${
                    anomaly.severity === 'critical' ? 'bg-red-100' : 
                    anomaly.severity === 'high' ? 'bg-orange-100' : 
                    anomaly.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {getSeverityIcon(anomaly.severity)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{anomaly.title}</h3>
                    <p className="mt-1 text-gray-600">{anomaly.description}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      <span className="ml-2 text-lg font-bold text-gray-900">
                        {formatCurrency(anomaly.amount)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(anomaly.detection_date).toLocaleDateString('es-AR')}
                </div>
              </div>

              {/* Evidence */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Evidencia</h4>
                <ul className="mt-2 space-y-1">
                  {anomaly.evidence.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                      <p className="ml-2 text-sm text-gray-600">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Documents */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Documentos Relacionados</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {anomaly.related_documents.map((doc, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Anomalías</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'critical').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-red-600 mt-1">Anomalías Críticas</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'high').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-orange-600 mt-1">Anomalías Altas</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'medium').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-yellow-600 mt-1">Anomalías Medias</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'low').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-blue-600 mt-1">Anomalías Bajas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDashboard;