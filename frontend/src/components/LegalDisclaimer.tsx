import React, { useState, useEffect } from 'react';
import { 
  InformationCircleIcon, 
  ScaleIcon, 
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const LegalDisclaimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Check if user has already accepted the disclaimer
  useEffect(() => {
    const hasAccepted = localStorage.getItem('transparency-disclaimer-accepted');
    if (hasAccepted) {
      setIsBannerVisible(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('transparency-disclaimer-accepted', 'true');
    setIsBannerVisible(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Persistent Banner */}
      {isBannerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Proyecto independiente:</strong> Este portal no está vinculado oficialmente con el Concejo Municipal de Carmen de Areco. 
                Usa siempre los canales oficiales para trámites administrativos.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(true)}
                className="text-xs bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                Leer más
              </button>
              <button
                onClick={handleAccept}
                className="text-xs bg-blue-800 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Disclaimer Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        Aviso Legal y Fuentes
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Aviso Legal y Transparencia
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Proyecto Independiente */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Proyecto Independiente
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Este portal de transparencia es un <strong>proyecto independiente</strong> creado 
                        para promover la transparencia gubernamental. No está directamente vinculado 
                        ni autorizado por el Concejo Municipal de Carmen de Areco.
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                        <strong>Importante:</strong> Para trámites oficiales, consultas administrativas o 
                        procesos legales, dirígete siempre al sitio web oficial del municipio: 
                        <a 
                          href="https://carmendeareco.gob.ar" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline text-blue-600 dark:text-blue-400 ml-1"
                        >
                          carmendeareco.gob.ar
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fuentes Oficiales */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <ScaleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Fuentes Oficiales Verificadas
                      </h3>
                      <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                        <p><strong>Fuentes primarias:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Portal Oficial de Transparencia Municipal: 
                            <a 
                              href="https://carmendeareco.gob.ar/transparencia/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline text-green-600 dark:text-green-400 ml-1"
                            >
                              carmendeareco.gob.ar/transparencia/
                            </a>
                          </li>
                          <li>Archivo Web (Wayback Machine) para verificación histórica</li>
                          <li>Boletín Oficial de la Provincia de Buenos Aires</li>
                        </ul>
                        <p className="mt-3"><strong>Próximamente:</strong> AFIP, Sistema Nacional de Contrataciones, Presupuesto Abierto</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marco Legal */}
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <ShieldExclamationIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        Marco Legal de Referencia
                      </h3>
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="mb-2">Los análisis de cumplimiento se basan en:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li><strong>Ley 27.275</strong> - Acceso a la Información Pública</li>
                          <li><strong>Ley 25.188</strong> - Ética en el Ejercicio de la Función Pública</li>
                          <li><strong>Ley 25.725</strong> - Límites salariales funcionarios públicos</li>
                          <li><strong>Decreto 1023/01</strong> - Régimen de Contrataciones Públicas</li>
                          <li><strong>Ley 24.156</strong> - Administración Financiera y Control</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Canal de Denuncias */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Canal de Denuncias Oficial
                      </h3>
                      <div className="text-sm text-red-800 dark:text-red-200 space-y-2">
                        <p>
                          Si detectas irregularidades, utiliza <strong>únicamente</strong> los canales oficiales:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                          <li><strong>Fiscalía de Estado de Buenos Aires</strong> - Denuncias anónimas</li>
                          <li><strong>AFIP</strong> - Irregularidades tributarias</li>
                          <li><strong>Tribunal de Cuentas de la Provincia</strong> - Manejo de fondos públicos</li>
                          <li><strong>Defensoría del Pueblo</strong> - Derechos ciudadanos</li>
                        </ul>
                        <div className="mt-3 p-2 bg-red-100 dark:bg-red-800 rounded text-xs">
                          <strong>Importante:</strong> Este portal no procesa denuncias directas. 
                          Siempre utiliza los canales oficiales para garantizar el anonimato 
                          y la protección legal del denunciante.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Limitación de Responsabilidad */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Limitación de Responsabilidad
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <p>
                      La información presentada se basa en datos públicos oficiales y análisis automatizados. 
                      Este portal no sustituye las investigaciones oficiales ni constituye asesoramiento legal.
                    </p>
                    <p>
                      Los análisis de cumplimiento son orientativos y deben ser verificados por 
                      las autoridades competentes antes de cualquier acción legal.
                    </p>
                  </div>
                </div>

                {/* Protección del Denunciante */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Protección del Denunciante
                  </h3>
                  <div className="text-sm text-purple-800 dark:text-purple-200">
                    <p>
                      Conforme a la <strong>Ley 25.246 (Encubrimiento y Lavado)</strong> y 
                      la <strong>Ley 27.304 (Régimen Legal del Contrato de Trabajo)</strong>, 
                      los denunciantes de buena fe están protegidos contra represalias.
                    </p>
                    <p className="mt-2 font-medium">
                      Nunca reveles tu identidad en canales no oficiales. 
                      Usa siempre los mecanismos de denuncia anónima del Estado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Acepto y entiendo estos términos
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LegalDisclaimer;