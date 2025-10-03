/**
 * PrivacyPolicyPage Component
 * Displays the privacy policy in compliance with AAIP guidelines and Ley 25.326
 */

import React, { useState, useEffect } from 'react';
import { Shield, Eye, FileText, User, Lock, AlertTriangle, CheckCircle, Clock, Download, ExternalLink } from 'lucide-react';
import { privacyService, PrivacyPolicy, PolicySection } from '../services/privacyService';
import ErrorBoundary from '../components/common/ErrorBoundary';

const PrivacyPolicyPage: React.FC = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrivacyPolicy = async () => {
      try {
        setLoading(true);
        const policy = await privacyService.getPrivacyPolicy();
        setPrivacyPolicy(policy);
      } catch (err) {
        console.error('Error loading privacy policy:', err);
        setError('Error al cargar la política de privacidad');
      } finally {
        setLoading(false);
      }
    };

    loadPrivacyPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Cargando política de privacidad...</p>
        </div>
      </div>
    );
  }

  if (error || !privacyPolicy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background">
        <div className="max-w-2xl mx-auto p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error || 'No se pudo cargar la política de privacidad'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const renderPolicySection = (section: PolicySection) => {
    return (
      <div key={section.id} className="mb-8 p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          {section.id === 'data-collection' && <Download className="h-5 w-5 mr-2 text-blue-600" />}
          {section.id === 'data-usage' && <Eye className="h-5 w-5 mr-2 text-blue-600" />}
          {section.id === 'data-sharing' && <ExternalLink className="h-5 w-5 mr-2 text-blue-600" />}
          {section.id === 'data-security' && <Lock className="h-5 w-5 mr-2 text-blue-600" />}
          {section.id === 'user-rights' && <User className="h-5 w-5 mr-2 text-blue-600" />}
          {section.id === 'cookies' && <FileText className="h-5 w-5 mr-2 text-blue-600" />}
          {section.id === 'ai-processing' && <Shield className="h-5 w-5 mr-2 text-blue-600" />}
          {section.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {section.content}
        </p>
        
        {section.personalDataTypes && section.personalDataTypes.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Datos personales recopilados:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {section.personalDataTypes.map((type, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">{type}</li>
              ))}
            </ul>
          </div>
        )}
        
        {section.nonPersonalDataTypes && section.nonPersonalDataTypes.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Datos no personales recopilados:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {section.nonPersonalDataTypes.map((type, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">{type}</li>
              ))}
            </ul>
          </div>
        )}
        
        {section.legalBases && section.legalBases.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Bases legales:</h4>
            <div className="space-y-2">
              {section.legalBases.map((basis, idx) => (
                <div key={idx} className="pl-4 border-l-2 border-blue-500">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{basis.basis}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{basis.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {section.purposes && section.purposes.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Propósitos del uso de datos:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {section.purposes.map((purpose, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">{purpose}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Esta política describe cómo el Portal de Transparencia Carmen de Areco recopila, 
            usa y protege su información personal en cumplimiento con la Ley 25.326 de Protección 
            de Datos Personales y las directrices de la AAIP.
          </p>
        </div>

        {/* Policy Meta Information */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white dark:bg-dark-surface rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Vigente desde</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(privacyPolicy.effectiveDate).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-dark-surface rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Última actualización</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(privacyPolicy.lastUpdated).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-dark-surface rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Versión</p>
              <p className="font-medium text-gray-900 dark:text-white">{privacyPolicy.version}</p>
            </div>
          </div>
        </div>

        {/* Jurisdiction and Laws */}
        <div className="mb-8 p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Jurisdicción y Legislación Aplicable
          </h2>
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Jurisdicción:</h3>
            <p className="text-gray-700 dark:text-gray-300">{privacyPolicy.jurisdiction}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Leyes Aplicables:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {privacyPolicy.governingLaws.map((law, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">{law}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="mb-8">
          {privacyPolicy.policySections.map(renderPolicySection)}
        </div>

        {/* Compliance Information */}
        <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Cumplimiento y Garantías
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200">Guías AAIP</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">La política se adhiere a las directrices de la Agencia de Acceso a la Información Pública</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200">Ley 25.326</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">Cumplimiento con la Ley de Protección de Datos Personales</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200">Ley 27.275</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">Alineado con la Ley de Acceso a la Información Pública</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200">Principios GDPR</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">Incorpora principios de protección de datos del Reglamento Europeo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Subject Rights Summary */}
        <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl">
          <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Derechos del Titular de los Datos
          </h2>
          <p className="text-purple-700 dark:text-purple-300 mb-4">
            Como titular de sus datos personales, usted tiene los siguientes derechos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-dark-surface rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Acceso y Rectificación</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Derecho a obtener confirmación sobre si se están tratando datos personales 
                y acceso a los mismos, así como a solicitar la corrección de datos inexactos.
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-dark-surface rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Cancelación y Oposición</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Derecho a solicitar la eliminación de datos cuando sean inadecuados y 
                a oponerse al tratamiento en ciertas circunstancias.
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-dark-surface rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Portabilidad</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Derecho a recibir sus datos en formato estructurado, de uso común y 
                lectura mecánica para transmitirlos a otro responsable del tratamiento.
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-dark-surface rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Limitación del Tratamiento</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Derecho a solicitar la limitación del tratamiento de sus datos personales 
                en ciertas circunstancias.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white dark:bg-dark-surface rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Cómo Ejercer sus Derechos</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
              Puede ejercer sus derechos ARCO+ contactándonos a través de:
            </p>
            <button 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => window.location.href = 'mailto:dpo@carmendeareco.gob.ar'}
            >
              dpo@carmendeareco.gob.ar
            </button>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
              O utilizando nuestro formulario de Derechos de Datos disponible en la página correspondiente.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Contacto y Delegado de Protección de Datos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Delegado de Protección de Datos</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-1"><strong>Nombre:</strong> Delegado de Protección de Datos</p>
              <p className="text-gray-700 dark:text-gray-300 mb-1"><strong>Email:</strong> 
                <button 
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => window.location.href = 'mailto:dpo@carmendeareco.gob.ar'}
                >
                  dpo@carmendeareco.gob.ar
                </button>
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Autoridad de Control</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-1"><strong>Nombre:</strong> Agencia de Acceso a la Información Pública (AAIP)</p>
              <p className="text-gray-700 dark:text-gray-300 mb-1"><strong>Contacto:</strong> 
                <button 
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => window.location.href = 'mailto:consultas@aaip.gob.ar'}
                >
                  consultas@aaip.gob.ar
                </button>
              </p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Web:</strong> 
                <a 
                  href="https://www.argentina.gob.ar/aaip" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  www.argentina.gob.ar/aaip
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const PrivacyPolicyPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                      {error.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md"
                  >
                    Recargar
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <PrivacyPolicyPage />
    </ErrorBoundary>
  );
};

export default PrivacyPolicyPageWithErrorBoundary;