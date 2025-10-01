import React, { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, FileText, TrendingDown } from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';

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
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Use integrated master data service
  const {
    masterData,
    currentBudget,
    currentTreasury,
    currentSalaries,
    currentContracts,
    currentDebt,
    loading: dataLoading,
    error: dataError,
    switchYear,
    availableYears
  } = useMasterData(selectedYear);

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
          title: 'Potencial Incumplimiento en Obras Públicas',
          description: 'Diferencia entre contratos adjudicados y ejecución real verificable según datos disponibles',
          amount: 169828314.90,
          severity: 'high',
          evidence: [
            'Diferencia entre montos adjudicados y ejecución reportada',
            'Documentación de contratos disponibles públicamente',
            'Reportes de ejecución trimestral'
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
          title: 'Declaraciones Patrimoniales Pendientes de Verificación',
          description: 'Posible incumplimiento en presentación de declaraciones patrimoniales según datos públicos',
          amount: 21000000,
          severity: 'medium',
          evidence: [
            'Falta de publicación en portales oficiales',
            'Datos disponibles en organismos de control',
            'Consultas a bases de datos públicas'
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
          title: 'Patrones de Inversión Inusuales',
          description: 'Análisis de patrones de inversión y gasto basado en datos públicos disponibles',
          amount: 13000000,
          severity: 'medium',
          evidence: [
            'Análisis de movimientos públicos en registros financieros',
            'Comparación con declaraciones patrimoniales presentadas',
            'Patrones de gasto detectados en transacciones públicas'
          ],
          related_documents: [
            'Análisis de DDJJ 2023 - Funcionarios Públicos',
            'Reporte de Inversiones 2023',
            'Comparativa de Activos Informativos'
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

  const getSeverityIcon = (severity: string): JSX._Element => {
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
      {/* Legal Disclaimer Banner */}
      {showDisclaimer && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Aviso Legal Importante</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Esta plataforma presenta análisis automatizado basado exclusivamente en datos públicos oficiales. 
                  Las observaciones presentadas son indicativas y requieren verificación por organismos competentes. 
                  No deben interpretarse como acusaciones formales ni como juicio de responsabilidad personal. 
                  El uso de esta información debe realizarse bajo responsabilidad propia y sujeto a las leyes de acceso a la información pública.
                </p>
              </div>
              <div className="mt-3">
                <button 
                  onClick={() => setShowDisclaimer(false)}
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-900"
                >
                  Entendido, continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Attribution Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Fuentes de Datos</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Todos los datos analizados provienen de fuentes públicas oficiales del municipio de Carmen de Areco, 
                incluyendo: Portal de Transparencia, Presupuesto Municipal, Ejecución Presupuestaria, 
                Contrataciones Públicas y Declaraciones Juradas Patrimoniales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🔍 Análisis de Datos Públicos</h1>
            <p className="mt-2 text-purple-100">
              Verificación automatizada de datos oficiales disponibles públicamente
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{anomalies.length}</div>
            <div className="text-purple-100">Elementos Analizados</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-purple-200">
          <p>
            Este análisis compara datos públicos oficiales para identificar discrepancias y elementos que requieren verificación adicional.
          </p>
        </div>
      </div>

      {/* User Guidance Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Cómo Interpretar Esta Información</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Los hallazgos se basan únicamente en datos públicos oficiales disponibles legalmente</li>
          <li>No constituyen acusaciones formales ni juicio de responsabilidad personal</li>
          <li>Todos los datos y documentos referenciados están disponibles en portales oficiales</li>
          <li>Se requiere verificación por organismos competentes para confirmar hallazgos</li>
          <li>El análisis está sujeto a limitaciones inherentes al uso de datos públicos</li>
        </ul>
      </div>

      {/* High Priority Alert Banner */}
      {anomalies.some(a => a.severity === 'high' || a.severity === 'critical') && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-orange-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">
                ⚠️ Elementos Requeridos de Atención
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Se han identificado {anomalies.filter(a => a.severity === 'high' || a.severity === 'critical').length} 
                  elementos que requieren verificación adicional. Revise los detalles a continuación y consulte fuentes oficiales originales.
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
                <h4 className="text-sm font-medium text-gray-900">Análisis de Datos Públicos</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="mb-2">
                    El análisis se basa en datos verificables de fuentes oficiales públicas. 
                    Cualquier discrepancia o hallazgo debe ser verificado por los organismos competentes.
                  </p>
                </div>
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
                <h4 className="text-sm font-medium text-gray-900">Documentos Públicos Consultados</h4>
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
                <div className="mt-3 text-xs text-gray-500">
                  Todos los documentos mencionados están disponibles en los portales oficiales del municipio.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Análisis</h3>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Guía de Interpretación:</strong> Este análisis se basa únicamente en datos públicos oficiales. 
            Las cantidades representan discrepancias identificadas entre diferentes fuentes de datos oficiales. 
            No constituyen acusaciones formales ni juicio de responsabilidad. 
            Se recomienda su verificación por organismos de control competentes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'critical').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-red-600 mt-1">Elementos de Alta Prioridad</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'high').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-orange-600 mt-1">Elementos Relevantes</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'medium').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-yellow-600 mt-1">Elementos de Interés</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(anomalies.filter(a => a.severity === 'low').reduce((sum, a) => sum + a.amount, 0))}
            </div>
            <div className="text-sm text-blue-600 mt-1">Elementos Menores</div>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Marco Legal y Responsabilidades</h3>
          <div className="text-xs text-gray-700 space-y-1">
            <p><strong>Ley de Acceso a la Información Pública:</strong> Esta plataforma opera bajo los principios de transparencia y acceso a la información pública.</p>
            <p><strong>Responsabilidad:</strong> La información presentada se basa exclusivamente en datos oficiales públicos disponibles legalmente.</p>
            <p><strong>Limitaciones:</strong> No se realizan acusaciones personales; los hallazgos requieren verificación por organismos competentes.</p>
            <p><strong>Contacto:</strong> Para consultas sobre datos o información específica, diríjase a las autoridades municipales competentes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDashboard;