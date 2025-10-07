/**
 * DataRightsForm Component
 * Form for submitting data subject rights requests (ARCO+)
 * Following AAIP guidelines and Ley 25.326 compliance
 */

import React, { useState } from 'react';
import { User, Mail, FileText, AlertTriangle, CheckCircle, Clock, Send, X } from 'lucide-react';
import { privacyService, DataRightsRequest } from '../services/privacyService';

interface FormData {
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'opposition' | 'limitation';
  name: string;
  email: string;
  message: string;
  additionalInfo?: string;
}

const DataRightsForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    requestType: 'access',
    name: '',
    email: '',
    message: '',
    additionalInfo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestResult, setRequestResult] = useState<DataRightsRequest | null>(null);

  const requestTypes = [
    { id: 'access', name: 'Acceso', description: 'Obtener confirmación sobre si se están tratando sus datos personales y acceder a los mismos' },
    { id: 'rectification', name: 'Rectificación', description: 'Solicitar la corrección de datos personales inexactos o incompletos' },
    { id: 'erasure', name: 'Cancelación', description: 'Solicitar la eliminación de datos personales cuando sean inadecuados o excesivos' },
    { id: 'portability', name: 'Portabilidad', description: 'Recibir sus datos personales en formato estructurado, de uso común y lectura mecánica' },
    { id: 'opposition', name: 'Oposición', description: 'Oponerse al tratamiento de sus datos personales en ciertas circunstancias' },
    { id: 'limitation', name: 'Limitación', description: 'Solicitar la limitación del tratamiento de sus datos personales en ciertas circunstancias' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous submission state
    setSubmitSuccess(false);
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      const result = await privacyService.submitDataRightsRequest(
        formData.requestType,
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          additionalInfo: formData.additionalInfo
        }
      );
      
      setRequestResult(result);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        requestType: 'access',
        name: '',
        email: '',
        message: '',
        additionalInfo: ''
      });
    } catch (error) {
      console.error('Data rights request error:', error);
      setSubmitError('Error al enviar la solicitud. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setRequestResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-blue-600" />
          <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">
            Derechos de Datos Personales
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Ejercer sus derechos ARCO+ (Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Limitación) 
          según Ley 25.326 de Protección de Datos Personales y directrices de la AAIP.
        </p>
      </div>

      {submitSuccess && requestResult && (
        <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Solicitud enviada exitosamente
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Su solicitud ha sido registrada con el número <strong>{requestResult.id}</strong>. 
                Nos pondremos en contacto con usted a la brevedad.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Enviar otra solicitud
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface-alt transition-colors"
                >
                  Imprimir comprobante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{submitError}</p>
            <button
              onClick={() => setSubmitError(null)}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Formulario de Solicitud de Derechos ARCO+
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Complete todos los campos requeridos para procesar su solicitud
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Solicitud <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requestTypes.map((type) => (
                <div 
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.requestType === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() => setFormData({...formData, requestType: type.id as any})}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id={type.id}
                      name="requestType"
                      value={type.id}
                      checked={formData.requestType === type.id}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={type.id} className="ml-3">
                      <span className="block font-medium text-gray-900 dark:text-white">{type.name}</span>
                      <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese su nombre completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ejemplo@email.com"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción de la Solicitud <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describa detalladamente su solicitud de derechos de datos..."
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sea específico sobre qué información desea acceder, corregir o eliminar
            </p>
          </div>

          {/* Additional Information */}
          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Información Adicional
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cualquier información adicional que considere relevante..."
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Agregue cualquier detalle que pueda ayudar a procesar su solicitud
            </p>
          </div>

          {/* Legal Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-200">Aviso Legal</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  Su solicitud será procesada conforme a la Ley 25.326 de Protección de Datos Personales. 
                  Nos comprometemos a responder en un plazo máximo de 10 días hábiles.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-dark-surface-alt border-t border-gray-200 dark:border-dark-border flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Tiempo estimado de respuesta: 10 días hábiles
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitud
              </>
            )}
          </button>
        </div>
      </form>

      {/* Information Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            Proceso de Solicitud
          </h3>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
              <span className="text-gray-700 dark:text-gray-300">Complete y envíe este formulario</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
              <span className="text-gray-700 dark:text-gray-300">Reciba confirmación de recepción</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
              <span className="text-gray-700 dark:text-gray-300">Procesamiento de su solicitud (máximo 10 días hábiles)</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
              <span className="text-gray-700 dark:text-gray-300">Recepción de respuesta detallada</span>
            </li>
          </ol>
        </div>

        <div className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Derechos ARCO+
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Acceso a sus datos personales</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Rectificación de datos inexactos</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Cancelación de datos innecesarios</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Oposición al tratamiento</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Portabilidad de datos</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Limitación del tratamiento</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataRightsForm;