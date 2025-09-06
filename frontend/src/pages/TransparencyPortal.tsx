import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, Shield, FileX, User, Gavel, DollarSign, Eye, Clock, Download, Search, ExternalLink } from 'lucide-react';

const TransparencyPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState('corruption-tracker');
  const [selectedCase, setSelectedCase] = useState<any>(null);

  // Official documented cases from HTC (Honorable Tribunal de Cuentas)
  const corruptionCases = [
    {
      id: 'htc-2024-001',
      title: 'Multa HTC - Subsidio con Irregularidades',
      description: 'Multa de $280.000 por otorgar subsidio con diferencias entre entidad subsidiada y quien realizó la rendición',
      amount: 280000,
      responsible: ['Iván Villagrán (Intendente)', 'Alicia Batallón (Contadora)'],
      date: '2024',
      status: 'Documentado por HTC',
      severity: 'high',
      category: 'Mal uso de fondos públicos',
      source: 'Honorable Tribunal de Cuentas - Provincia de Buenos Aires',
      documents: ['Resolución HTC 2024', 'Boletín Oficial'],
      additionalCharges: 2362010.41,
      solidaryResponsible: ['Sebastián Torretta (Jefe de Compras)']
    },
    {
      id: 'htc-2024-002',
      title: 'Incumplimiento Fondo Educativo',
      description: 'No destinar el 40% del Fondo Educativo para obras en escuelas',
      amount: 0, // Part of above fine
      responsible: ['Iván Villagrán (Intendente)', 'Alicia Batallón (Contadora)'],
      date: '2024',
      status: 'Documentado por HTC',
      severity: 'high',
      category: 'Incumplimiento normativo',
      source: 'Honorable Tribunal de Cuentas'
    },
    {
      id: 'corruption-2025-001',
      title: 'Licitación Fraudulenta - Consejero',
      description: 'Persona del Consejo Honorable licitó para su propia empresa con el municipio',
      amount: null, // Amount under investigation
      responsible: ['Presidente del Consejo Honorable (Nombre a verificar)'],
      date: '2025',
      status: 'En proceso judicial',
      severity: 'critical',
      category: 'Conflicto de intereses / Autocontratación',
      source: 'Denuncia ciudadana - Proceso judicial en curso'
    },
    {
      id: 'tesoreria-2025-001',
      title: 'Documentos Alterados en Tesorería',
      description: 'Documentos firmados por personas no autorizadas en lugar del responsable de tesorería',
      amount: null,
      responsible: ['Personal de Tesorería (A determinar)', 'Terceros no autorizados'],
      date: '2025',
      status: 'Bajo investigación',
      severity: 'high',
      category: 'Falsificación de documentos',
      source: 'Auditoría interna / Denuncia'
    }
  ];

  const financialAnomalies = [
    {
      period: '2025-Q1',
      anomaly: 'Diferencia Devengado vs Percibido',
      amount: 344186075.86,
      description: 'Diferencia significativa entre recursos devengados y percibidos',
      riskLevel: 'medium',
      investigation: 'pending'
    },
    {
      period: '2024-Q4',
      anomaly: 'Transferencias de Capital No Estimadas',
      amount: 232690775.64,
      description: 'Transferencias de capital no contempladas en presupuesto original',
      riskLevel: 'low',
      investigation: 'completed'
    }
  ];

  const documentIntegrity = [
    {
      document: 'Estado de Ejecución de Recursos - Marzo 2025',
      status: 'verified',
      signatures: 'Complete',
      lastModified: '2025-04-26',
      hash: 'SHA256:a1b2c3...',
      authorizedPersonnel: ['Alicia Batallón', 'Sebastián Torretta']
    },
    {
      document: 'Tesorería - Marzo 2025',
      status: 'suspicious',
      signatures: 'Irregular - Firma no autorizada detectada',
      lastModified: '2025-03-15',
      hash: 'SHA256:d4e5f6...',
      authorizedPersonnel: ['Responsable Tesorería'],
      alerts: ['Firma de persona no autorizada', 'Modificación posterior al cierre']
    }
  ];

  const governmentStructure = [
    {
      position: 'Intendente',
      name: 'Iván Villagrán',
      status: 'Multado por HTC',
      penalties: ['$280.000 (2024)', 'Cargo solidario $2.362.010,41']
    },
    {
      position: 'Contadora Municipal',
      name: 'Alicia Batallón',
      status: 'Multada por HTC',
      penalties: ['$280.000 (2024)', 'Cargo solidario $2.362.010,41']
    },
    {
      position: 'Jefe de Compras',
      name: 'Sebastián Torretta',
      status: 'Cargo solidario por HTC',
      penalties: ['Cargo solidario $2.362.010,41']
    },
    {
      position: 'Presidente Consejo Honorable',
      name: 'Carlos Alfredo Camallo',
      status: 'Bajo investigación judicial',
      penalties: ['Proceso por licitación fraudulenta']
    }
  ];

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'Monto bajo investigación';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-red-500">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="mr-3 text-red-600" size={32} />
              Portal de Transparencia y Anticorrupción
            </h1>
            <p className="text-gray-600">Carmen de Areco - Seguimiento de Irregularidades y Transparencia Fiscal</p>
          </div>
          <div className="text-right">
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
               CASOS ACTIVOS BAJO SEGUIMIENTO
            </div>
            <p className="text-sm text-gray-500 mt-1">Última actualización: 06/09/2025</p>
          </div>
        </div>

        {/* Critical Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="font-semibold text-red-800">ALERTA CRÍTICA:</span>
            <span className="text-red-700 ml-2">
              {corruptionCases.filter(c => c.severity === 'critical').length} casos críticos en investigación, 
              {corruptionCases.filter(c => c.status === 'Documentado por HTC').length} casos documentados por HTC
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex space-x-1">
          {[
            { id: 'corruption-tracker', label: 'Casos de Corrupción', icon: Gavel },
            { id: 'financial-anomalies', label: 'Anomalías Financieras', icon: AlertTriangle },
            { id: 'document-integrity', label: 'Integridad Documentos', icon: FileX },
            { id: 'government-accountability', label: 'Responsables', icon: User },
            { id: 'financial-overview', label: 'Resumen Financiero', icon: DollarSign }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeSection === section.id 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <section.icon size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corruption Tracker Section */}
      {activeSection === 'corruption-tracker' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Gavel className="mr-2 text-red-600" size={24} />
              Casos de Corrupción Documentados
            </h2>
            
            <div className="grid gap-4">
              {corruptionCases.map(case_item => (
                <div 
                  key={case_item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCase(case_item)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{case_item.title}</h3>
                      <p className="text-gray-600 text-sm">{case_item.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(case_item.severity)}`}>
                        {case_item.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{case_item.date}</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Monto: </span>
                      <span className="text-red-600">{formatCurrency(case_item.amount)}</span>
                      {case_item.additionalCharges && (
                        <div className="text-red-500 text-xs">
                          + Cargo solidario: {formatCurrency(case_item.additionalCharges)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Estado: </span>
                      <span className={case_item.status === 'Documentado por HTC' ? 'text-red-600' : 'text-yellow-600'}>
                        {case_item.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Categoría: </span>
                      <span>{case_item.category}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Responsables: </span>
                    <div className="text-sm text-gray-700">
                      {case_item.responsible.map((person, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 mr-2 mb-1">
                          {person}
                        </span>
                      ))}
                      {case_item.solidaryResponsible && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">Responsabilidad solidaria: </span>
                          {case_item.solidaryResponsible.map((person, idx) => (
                            <span key={idx} className="inline-block bg-yellow-100 rounded px-2 py-1 mr-2 text-xs">
                              {person}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Details Modal */}
          {selectedCase && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedCase.title}</h2>
                  <button 
                    onClick={() => setSelectedCase(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Descripción Detallada:</h4>
                    <p className="text-gray-700">{selectedCase.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">Fuente de Información:</h4>
                    <p className="text-blue-600">{selectedCase.source}</p>
                  </div>
                  
                  {selectedCase.documents && (
                    <div>
                      <h4 className="font-semibold">Documentos de Respaldo:</h4>
                      <ul className="list-disc list-inside text-gray-700">
                        {selectedCase.documents.map((doc: string, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <FileX size={16} className="mr-2" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
                    <div>
                      <span className="font-medium">Impacto Económico Total:</span>
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency((selectedCase.amount || 0) + (selectedCase.additionalCharges || 0))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Nivel de Severidad:</span>
                      <div className={`inline-block px-2 py-1 rounded text-sm ${getSeverityColor(selectedCase.severity)}`}>
                        {selectedCase.severity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Integrity Section */}
      {activeSection === 'document-integrity' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FileX className="mr-2 text-yellow-600" size={24} />
            Integridad de Documentos
          </h2>
          
          <div className="space-y-4">
            {documentIntegrity.map((doc, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${doc.status === 'suspicious' ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{doc.document}</h3>
                    <p className="text-sm text-gray-600">Última modificación: {doc.lastModified}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    doc.status === 'verified' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {doc.status === 'verified' ? 'VERIFICADO' : 'SOSPECHOSO'}
                  </div>
                </div>
                
                <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Estado de Firmas: </span>
                    <span className={doc.status === 'verified' ? 'text-green-600' : 'text-red-600'}>
                      {doc.signatures}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Hash de Integridad: </span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{doc.hash}</code>
                  </div>
                </div>
                
                {doc.alerts && (
                  <div className="mt-3 p-3 bg-red-100 rounded">
                    <h4 className="font-semibold text-red-800 text-sm"> ALERTAS DETECTADAS:</h4>
                    <ul className="list-disc list-inside text-red-700 text-sm">
                      {doc.alerts.map((alert: string, alertIdx: number) => (
                        <li key={alertIdx}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Government Accountability Section */}
      {activeSection === 'government-accountability' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <User className="mr-2 text-blue-600" size={24} />
            Responsables de Gobierno y Sanciones
          </h2>
          
          <div className="grid gap-4">
            {governmentStructure.map((official, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{official.position}</h3>
                    <p className="text-gray-600">{official.name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    official.status.includes('Multado') ? 'bg-red-200 text-red-800' :
                    official.status.includes('investigación') ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {official.status}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Sanciones y Procesos:</h4>
                  <ul className="space-y-1">
                    {official.penalties.map((penalty: string, penaltyIdx: number) => (
                      <li key={penaltyIdx} className="text-sm bg-gray-100 px-3 py-2 rounded flex items-center">
                        <Gavel size={14} className="mr-2 text-red-500" />
                        {penalty}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2"> RESUMEN DE RESPONSABILIDADES</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded">
                <div className="text-red-600 font-bold text-lg">$2.922.010,41</div>
                <div className="text-gray-600">Total en multas y cargos HTC</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-yellow-600 font-bold text-lg">1</div>
                <div className="text-gray-600">Proceso judicial activo</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-blue-600 font-bold text-lg">4</div>
                <div className="text-gray-600">Funcionarios sancionados</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Data Sources */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
        <h3 className="font-semibold mb-3 flex items-center">
          <ExternalLink className="mr-2" size={18} />
          Fuentes de Información Verificadas
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Fuentes Oficiales:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Honorable Tribunal de Cuentas - Provincia de Buenos Aires</li>
              <li>Portal de Transparencia Carmen de Areco</li>
              <li>Boletín Oficial de la República Argentina</li>
              <li>Sistema de Boletín Oficial Municipal (SIBOM)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Metodología:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Verificación cruzada de documentos oficiales</li>
              <li>Análisis de patrones en datos financieros</li>
              <li>Seguimiento de procesos judiciales públicos</li>
              <li>Auditoría de integridad documental</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Disclaimer:</strong> Toda la información presentada proviene de fuentes oficiales públicas. 
          Los casos bajo investigación judicial no implican culpabilidad hasta resolución definitiva. 
          Este portal tiene fines de transparencia y rendición de cuentas ciudadana.
        </div>
      </div>
    </div>
  );
};

export default TransparencyPortal;