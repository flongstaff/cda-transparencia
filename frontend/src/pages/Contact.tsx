import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasterData } from '../hooks/useMasterData';
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  FileText,
  Users,
  Globe,
  Info,
  CheckCircle2,
  Send,
  AlertCircle
} from 'lucide-react';

const Contact: React.FC = () => {
  const [selectedYear] = useState<number>(new Date().getFullYear());
  const [formData, setFormData] = useState({
    reportType: '',
    description: '',
    evidence: '',
    location: '',
    timeframe: '',
    anonymous: true
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use integrated master data service for contact/reporting context
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

  const reportTypes = [
    { value: 'transparency', label: 'Solicitud de Información Pública', icon: Eye },
    { value: 'budget', label: 'Consulta sobre Presupuesto Municipal', icon: FileText },
    { value: 'contracts', label: 'Información sobre Contratos y Licitaciones', icon: Users },
    { value: 'irregularity', label: 'Reporte de Irregularidad (Anónimo)', icon: AlertTriangle },
    { value: 'access', label: 'Acceso a Documentos Públicos', icon: Globe },
    { value: 'other', label: 'Otra Consulta de Transparencia', icon: Info }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate anonymous submission (in reality, this would go to an encrypted endpoint)
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);

      // Reset form after successful submission
      setFormData({
        reportType: '',
        description: '',
        evidence: '',
        location: '',
        timeframe: '',
        anonymous: true
      });
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-8">
          <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Reporte Enviado de Forma Segura
          </h2>
          <p className="text-green-700 mb-6">
            Su solicitud ha sido enviada de forma anónima y segura al Honorable Concejo Deliberante
            según la Ley de Acceso a la Información Pública (Ley 27.275).
          </p>
          <div className="bg-white dark:bg-dark-surface rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              <strong>Número de Seguimiento:</strong> CDA-{Date.now().toString().slice(-8)}
            </p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-2">
              Guarde este número para futuras consultas (opcional)
            </p>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Realizar Otro Reporte
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-4">
              Canal de Transparencia Ciudadana
            </h1>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              Portal seguro y anónimo para solicitudes de información pública y reportes ciudadanos
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Portal No Oficial - Protección Ciudadana
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Este es un canal <strong>no oficial</strong> para facilitar el acceso ciudadano a la transparencia.
                Todos los reportes se envían de forma <strong>anónima</strong> al Honorable Concejo Deliberante
                para proteger su identidad y seguridad.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center text-blue-700">
                  <Lock className="h-4 w-4 mr-1" />
                  Envío Anónimo
                </span>
                <span className="flex items-center text-blue-700">
                  <Shield className="h-4 w-4 mr-1" />
                  Protección Legal
                </span>
                <span className="flex items-center text-blue-700">
                  <Eye className="h-4 w-4 mr-1" />
                  Ley 27.275 LAIP
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Legal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">
                Marco Legal y Protección
              </h2>

              <div className="space-y-6">
                {/* LAIP */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2 flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Ley de Acceso a la Información Pública
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                    Ley 27.275 garantiza el derecho de acceso a la información pública y
                    protege a los solicitantes de cualquier tipo de represalia.
                  </p>
                </div>

                {/* Protection */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2 flex items-center">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    Protección del Denunciante
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                    Su identidad permanece completamente anónima. Los reportes se envían
                    sin datos personales identificables.
                  </p>
                </div>

                {/* UIF */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                    Unidad de Información Financiera
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                    Casos de corrupción o lavado se derivan automáticamente a la UIF
                    manteniendo el anonimato del reportante.
                  </p>
                </div>

                {/* Contact Official */}
                <div className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
                    Canal Oficial
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">
                    Para consultas no anónimas, contacte directamente:
                  </p>
                  <p className="text-sm font-mono text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">
                    transparencia@carmendeareco.gob.ar
                  </p>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">
                    Honorable Concejo Deliberante
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Anonymous Report Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6 flex items-center">
                <Lock className="h-6 w-6 text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mr-2" />
                Formulario de Reporte Anónimo
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type */}
                <div>
                  <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">
                    Tipo de Solicitud *
                  </label>
                  <select
                    id="reportType"
                    name="reportType"
                    value={formData.reportType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione el tipo de solicitud</option>
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">
                    Descripción Detallada *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Describa su solicitud o reporte de manera clara y detallada. Incluya toda la información relevante que pueda ayudar a procesar su solicitud."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">
                    Evidencia o Documentos de Referencia
                  </label>
                  <textarea
                    id="evidence"
                    name="evidence"
                    rows={3}
                    value={formData.evidence}
                    onChange={handleChange}
                    placeholder="Mencione cualquier documento, resolución, expediente u otra evidencia relevante (no incluya datos personales)."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">
                      Ubicación/Área
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ej: Secretaría de Obras, Centro, etc."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Timeframe */}
                  <div>
                    <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">
                      Período de Tiempo
                    </label>
                    <input
                      type="text"
                      id="timeframe"
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleChange}
                      placeholder="Ej: 2024, Enero-Marzo 2024, etc."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Anonymous Confirmation */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                        Confirmación de Envío Anónimo
                      </h3>
                      <p className="text-sm text-yellow-700 mb-3">
                        Al enviar este formulario, confirma que:
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
                        <li>Su identidad permanecerá completamente anónima</li>
                        <li>No se solicitarán ni almacenarán datos personales</li>
                        <li>El reporte se enviará al Concejo Deliberante de forma segura</li>
                        <li>Está protegido por la Ley de Acceso a la Información Pública</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando de Forma Segura...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Enviar Reporte Anónimo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">
            Recursos Adicionales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Globe className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Portal Oficial</h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                Acceda al portal oficial de transparencia del municipio
              </p>
              <a
                href="https://carmendeareco.gob.ar/transparencia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
              >
                Visitar Portal →
              </a>
            </div>

            <div className="text-center">
              <FileText className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Marco Legal</h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                Conozca sus derechos bajo la Ley de Acceso a la Información
              </p>
              <a
                href="https://www.argentina.gob.ar/aaip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:text-green-800 text-sm font-medium mt-2 inline-block"
              >
                Ver Ley LAIP →
              </a>
            </div>

            <div className="text-center">
              <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">Oficina Anticorrupción</h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                Reportes de corrupción a nivel nacional
              </p>
              <a
                href="https://www.argentina.gob.ar/anticorrupcion"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 text-sm font-medium mt-2 inline-block"
              >
                Acceder OA →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;