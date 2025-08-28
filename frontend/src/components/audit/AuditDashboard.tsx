import React, { useState, useEffect } from 'react';
import CrossValidationService, { CrossValidationReport, ValidationResult, IrregularityReport } from '../../services/CrossValidationService';

interface AuditDashboardProps {
  year: number;
  onYearChange?: (year: number) => void;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ year, onYearChange }) => {
  const [report, setReport] = useState<CrossValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'validations' | 'fraud' | 'documents'>('overview');

  useEffect(() => {
    loadAuditReport();
  }, [year]);

  const loadAuditReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const crossValidationService = CrossValidationService.getInstance();
      const auditReport = await crossValidationService.performCrossValidation(year);
      setReport(auditReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando reporte de auditoría');
      console.error('Audit report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'match': return 'text-green-600 bg-green-100';
      case 'minor_discrepancy': return 'text-yellow-600 bg-yellow-100';
      case 'major_discrepancy': return 'text-orange-600 bg-orange-100';
      case 'suspicious_pattern': return 'text-purple-600 bg-purple-100';
      case 'fraud_indicator': return 'text-red-600 bg-red-100';
      case 'missing_data': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={loadAuditReport}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Auditoría de Transparencia Carmen de Areco {year}
          </h1>
          <p className="text-gray-600">
            Análisis de Ejecución Presupuestaria y Detección de Irregularidades
          </p>
          <p className="text-sm text-gray-500">
            Generado: {new Date(report.generatedAt).toLocaleString('es-AR')}
          </p>
        </div>

        {/* Risk Score Alert */}
        {report.summary.riskScore > 50 && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  ⚠️ ALERTA: Nivel de Riesgo Elevado ({report.summary.riskScore.toFixed(1)}%)
                </h3>
                <p className="mt-1 text-sm">
                  Se detectaron irregularidades que requieren investigación inmediata.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Precisión General</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {report.summary.overallAccuracy.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">⚠️</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Puntuación de Riesgo</dt>
                    <dd className={`text-lg font-medium ${report.summary.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                      {report.summary.riskScore.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🚨</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Indicadores de Fraude</dt>
                    <dd className="text-lg font-medium text-red-600">
                      {report.summary.fraudIndicators}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📄</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Documentos Procesados</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {report.documentAnalysis.documentsProcessed.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Resumen', icon: '📊' },
                { id: 'validations', name: 'Validaciones', icon: '✅' },
                { id: 'fraud', name: 'Irregularidades', icon: '🚨' },
                { id: 'documents', name: 'Documentos', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Validation Summary */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Validaciones</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{report.summary.matches}</div>
                      <div className="text-sm text-gray-500">Coincidencias</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{report.summary.minorDiscrepancies}</div>
                      <div className="text-sm text-gray-500">Discrepancias Menores</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{report.summary.majorDiscrepancies}</div>
                      <div className="text-sm text-gray-500">Discrepancias Mayores</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{report.summary.suspiciousPatterns}</div>
                      <div className="text-sm text-gray-500">Patrones Sospechosos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{report.summary.fraudIndicators}</div>
                      <div className="text-sm text-gray-500">Indicadores de Fraude</div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recomendaciones</h3>
                  <div className="space-y-2">
                    {report.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 text-sm text-gray-700">
                          {recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'validations' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Validaciones Detalladas</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Riesgo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discrepancia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PowerBI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.validations.map((validation, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {validation.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(validation.status)}`}>
                              {validation.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(validation.riskLevel)}`}>
                              {validation.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {validation.discrepancyPercentage.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof validation.powerBIValue === 'number' ? formatCurrency(validation.powerBIValue) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {validation.documentValue ? formatCurrency(validation.documentValue) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'fraud' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Análisis de Irregularidades</h3>
                
                {/* Priority Investigations */}
                {report.fraudAnalysis.priorityInvestigations.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">🚨 Investigaciones Prioritarias</h4>
                    <ul className="space-y-1">
                      {report.fraudAnalysis.priorityInvestigations.map((investigation, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start">
                          <span className="mr-2">•</span>
                          {investigation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Irregularities Table */}
                {report.fraudAnalysis.irregularities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Irregularidades Detectadas</h4>
                    <div className="space-y-4">
                      {report.fraudAnalysis.irregularities.map((irregularity, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{irregularity.description}</h5>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              irregularity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              irregularity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {irregularity.severity}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Tipo:</strong> {irregularity.type.replace('_', ' ')}
                            </div>
                            <div>
                              <strong>Monto Afectado:</strong> {formatCurrency(irregularity.affectedAmount)}
                            </div>
                            <div className="md:col-span-2">
                              <strong>Acción Requerida:</strong> {irregularity.requiredAction}
                            </div>
                          </div>
                          
                          {irregularity.evidence.length > 0 && (
                            <div className="mt-3">
                              <strong className="text-sm text-gray-700">Evidencias:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {irregularity.evidence.map((evidence, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                    {evidence}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {report.fraudAnalysis.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Factores de Riesgo</h4>
                    <div className="space-y-2">
                      {report.fraudAnalysis.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="text-yellow-600">⚠️</div>
                          <div className="flex-1 text-sm text-gray-700">{factor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Análisis de Documentos</h3>
                
                {/* Ejecución Presupuestaria Analysis */}
                {report.documentAnalysis.ejecucionPresupuestariaAnalysis.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">📊 Documentos de Ejecución Presupuestaria</h4>
                    <div className="space-y-4">
                      {report.documentAnalysis.ejecucionPresupuestariaAnalysis.map((analysis, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Documento ID: {analysis.documentId}</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500">Ejecución Presupuestaria</div>
                              <div className="text-lg font-medium text-gray-900">{analysis.budgetExecution}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Indicadores de Fraude</div>
                              <div className="text-lg font-medium text-red-600">{analysis.fraudIndicators.length}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Categorías Analizadas</div>
                              <div className="text-lg font-medium text-gray-900">{Object.keys(analysis.categoryBreakdown).length}</div>
                            </div>
                          </div>

                          {analysis.fraudIndicators.length > 0 && (
                            <div className="mb-4">
                              <div className="text-sm font-medium text-gray-700 mb-2">Indicadores de Fraude:</div>
                              <div className="flex flex-wrap gap-1">
                                {analysis.fraudIndicators.map((indicator, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                    {indicator}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {Object.keys(analysis.categoryBreakdown).length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">Desglose por Categoría:</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                {Object.entries(analysis.categoryBreakdown).map(([category, amount]) => (
                                  <div key={category} className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span className="capitalize">{category}:</span>
                                    <span className="font-medium">{formatCurrency(amount as number)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Documents */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Todos los Documentos Procesados</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Año
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tamaño
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.documentAnalysis.documentsProcessed.map((doc, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <div className="truncate max-w-xs" title={doc.title}>
                                {doc.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {doc.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {doc.size_mb.toFixed(1)} MB
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Procesado
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;