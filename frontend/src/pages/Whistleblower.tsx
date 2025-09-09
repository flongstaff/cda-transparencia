import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Eye, FileText, Phone, Mail, MessageSquare } from 'lucide-react';

const Whistleblower: React.FC = () => {
  const [reportType, setReportType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [evidence, setEvidence] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [contactMethod, setContactMethod] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would securely submit the report
    setSubmitted(true);
  };

  const reportTypes = [
    'Corrupción',
    'Malversación de fondos',
    'Nepotismo',
    'Conflicto de interés',
    'Abuso de poder',
    'Fraude',
    'Violación de procedimientos',
    'Otro'
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Reporte Enviado Exitosamente
          </h3>
          <p className="text-gray-600 mb-6">
            Su reporte ha sido recibido y será investigado de manera confidencial. 
            Si proporcionó información de contacto, nos comunicaremos con usted si necesitamos más detalles.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Número de referencia: <strong>WB-{Date.now().toString().slice(-8)}</strong>
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setReportType('');
              setDescription('');
              setEvidence('');
              setContactMethod('');
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Realizar Otro Reporte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔒 Canal de Denuncias
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Reporte de manera segura y confidencial cualquier irregularidad en la administración municipal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Protección del Denunciante
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Confidencialidad</h4>
                    <p className="text-sm text-gray-600">
                      Su identidad será protegida según la ley
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Anonimato</h4>
                    <p className="text-sm text-gray-600">
                      Puede reportar de forma completamente anónima
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">No Represalias</h4>
                    <p className="text-sm text-gray-600">
                      Protección legal contra represalias
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contactos Alternativos
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Línea Directa</p>
                    <p className="text-sm text-gray-600">0800-DENUNCIA</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Email Seguro</p>
                    <p className="text-sm text-gray-600">denuncias@carmenreco.gob.ar</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Presencial</p>
                    <p className="text-sm text-gray-600">Oficina de Transparencia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Formulario de Denuncia
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Anonymity Option */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      id="anonymous"
                      name="anonymous"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-3 block text-sm font-medium text-blue-900">
                      Realizar denuncia de forma anónima
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-blue-700">
                    Recomendado para máxima protección. No podremos contactarlo para seguimiento.
                  </p>
                </div>

                {/* Contact Method (if not anonymous) */}
                {!isAnonymous && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de contacto preferido (opcional)
                    </label>
                    <select
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione un método</option>
                      <option value="email">Email</option>
                      <option value="phone">Teléfono</option>
                      <option value="mail">Correo postal</option>
                    </select>
                  </div>
                )}

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de irregularidad *
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccione el tipo de irregularidad</option>
                    {reportTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción detallada *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={6}
                    placeholder="Describa los hechos de manera detallada, incluyendo fechas, lugares, personas involucradas y cualquier otro dato relevante..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidencia o documentación
                  </label>
                  <textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    rows={3}
                    placeholder="Describa cualquier evidencia que posea (documentos, fotografías, grabaciones, testimonios, etc.). NO adjunte archivos a través de este formulario."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Para evidencia física o digital, contacte a través de los canales seguros listados a la izquierda.
                  </p>
                </div>

                {/* Legal Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Aviso Legal
                      </h4>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Las denuncias falsas constituyen un delito</li>
                          <li>Proporcione información veraz y verificable</li>
                          <li>Este canal es para irregularidades administrativas</li>
                          <li>Para emergencias, contacte a las autoridades competentes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    * Campos obligatorios
                  </p>
                  <button
                    type="submit"
                    disabled={!reportType || !description}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Enviar Denuncia de Forma Segura
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Marco Legal y Proceso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fundamento Legal</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ley Nacional 25.188 - Ética Pública</li>
                <li>• Ley Nacional 27.275 - Acceso a la Información</li>
                <li>• Decreto Municipal de Transparencia</li>
                <li>• Código de Ética Municipal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Proceso de Investigación</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recepción y registro de la denuncia</li>
                <li>• Evaluación preliminar (5 días hábiles)</li>
                <li>• Investigación formal (30 días hábiles)</li>
                <li>• Informe y recomendaciones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whistleblower;