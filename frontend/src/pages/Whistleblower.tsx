import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Check, 
  Eye, 
  EyeOff, 
  Info, 
  ChevronRight, 
  Upload, 
  X,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Step enum
enum FormStep {
  Introduction = 0,
  ReportType = 1,
  ReportDetails = 2,
  Evidence = 3,
  Review = 4,
  Confirmation = 5,
}

// Report type interface
interface ReportTypeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Report types
const reportTypes: ReportTypeOption[] = [
  {
    id: 'corruption',
    title: 'Corrupción',
    description: 'Sobornos, extorsión, malversación de fondos públicos',
    icon: <AlertTriangle size={24} className="text-error-500" />,
  },
  {
    id: 'fraud',
    title: 'Fraude',
    description: 'Presentación de documentos falsos, facturas fraudulentas',
    icon: <svg className="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>,
  },
  {
    id: 'misconduct',
    title: 'Conducta indebida',
    description: 'Abuso de poder, conflicto de intereses, negligencia',
    icon: <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
  },
  {
    id: 'other',
    title: 'Otros',
    description: 'Cualquier otra irregularidad que considere relevante',
    icon: <HelpCircle size={24} className="text-gray-500" />,
  }
];

const Whistleblower: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.Introduction);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    department: '',
    peopleInvolved: '',
    estimatedAmount: '',
    anonymous: true,
    contactEmail: '',
    contactPhone: '',
  });
  
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  const handleNext = () => {
    setCurrentStep(prev => prev + 1 as FormStep);
    window.scrollTo(0, 0);
  };
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1 as FormStep);
    window.scrollTo(0, 0);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAnonymousToggle = () => {
    setFormData(prev => ({ ...prev, anonymous: !prev.anonymous }));
    if (formData.anonymous) {
      setShowContactInfo(true);
    }
  };
  
  const progressBarWidth = () => {
    const totalSteps = Object.keys(FormStep).length / 2 - 1;
    const currentStepNumber = currentStep;
    return `${(currentStepNumber / totalSteps) * 100}%`;
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case FormStep.Introduction:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-primary-50 dark:bg-primary-900 p-6 rounded-lg">
              <h2 className="flex items-center font-heading text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">
                <Shield size={24} className="mr-3" />
                Sistema de Denuncias Anónimas
              </h2>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                Este portal permite a cualquier ciudadano reportar posibles casos de corrupción, 
                fraude o irregularidades en la administración de fondos públicos.
              </p>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                  Garantías del sistema:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check size={18} className="text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Anonimato completo:</strong> No es necesario identificarse para realizar una denuncia.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Seguridad:</strong> Comunicación cifrada y protocolos de seguridad avanzados.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Confidencialidad:</strong> Toda la información proporcionada es tratada con estricta confidencialidad.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Investigación imparcial:</strong> Cada denuncia es evaluada e investigada por un equipo independiente.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-warning-50 dark:bg-warning-900 p-4 rounded-lg">
                <div className="flex items-start">
                  <Info size={20} className="text-warning-600 dark:text-warning-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-warning-700 dark:text-warning-300 text-sm">
                    Realizar denuncias falsas o malintencionadas puede tener consecuencias legales. 
                    Por favor, asegúrese de proporcionar información veraz y basada en hechos concretos.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150"
                onClick={handleNext}
              >
                Comenzar denuncia
                <ChevronRight size={18} className="inline ml-2" />
              </button>
            </div>
          </motion.div>
        );
      
      case FormStep.ReportType:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white mb-4">
              Seleccione el tipo de irregularidad que desea denunciar
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  className={`p-4 rounded-lg text-left transition duration-150 ${
                    selectedReportType === type.id
                      ? 'bg-primary-50 dark:bg-primary-900 border-2 border-primary-500'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700'
                  }`}
                  onClick={() => setSelectedReportType(type.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">{type.icon}</div>
                    <div>
                      <h3 className={`font-medium mb-1 ${
                        selectedReportType === type.id
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-800 dark:text-white'
                      }`}>
                        {type.title}
                      </h3>
                      <p className={`text-sm ${
                        selectedReportType === type.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150"
                onClick={handleBack}
              >
                Volver
              </button>
              <button
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleNext}
                disabled={!selectedReportType}
              >
                Continuar
                <ChevronRight size={18} className="inline ml-2" />
              </button>
            </div>
          </motion.div>
        );
      
      case FormStep.ReportDetails:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white mb-4">
              Detalles de la denuncia
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título de la denuncia *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Posible fraude en licitación de obras públicas"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción detallada *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={5}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Detalle los hechos con la mayor precisión posible. Incluya fechas, lugares y circunstancias."
                  required
                ></textarea>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Sea lo más específico posible. La calidad de la investigación depende de la información proporcionada.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha aproximada del hecho
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Área o departamento municipal
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccione un departamento</option>
                    <option value="obras_publicas">Obras Públicas</option>
                    <option value="hacienda">Hacienda y Finanzas</option>
                    <option value="compras">Compras y Contrataciones</option>
                    <option value="recursos_humanos">Recursos Humanos</option>
                    <option value="salud">Salud</option>
                    <option value="desarrollo_social">Desarrollo Social</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="peopleInvolved" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Personas involucradas
                </label>
                <input
                  type="text"
                  id="peopleInvolved"
                  name="peopleInvolved"
                  value={formData.peopleInvolved}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nombres y cargos de las personas involucradas, si los conoce"
                />
              </div>
              
              <div>
                <label htmlFor="estimatedAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto aproximado (si aplica)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="text"
                    id="estimatedAmount"
                    name="estimatedAmount"
                    value={formData.estimatedAmount}
                    onChange={handleFormChange}
                    className="w-full p-3 pl-8 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: 500000"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ¿Desea realizar la denuncia de forma anónima?
                  </span>
                  <button 
                    type="button"
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      formData.anonymous ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    onClick={handleAnonymousToggle}
                  >
                    <span 
                      className={`inline-block w-4 h-4 transform transition duration-200 ease-in-out bg-white rounded-full ${
                        formData.anonymous ? 'translate-x-6' : 'translate-x-1'
                      }`} 
                    />
                  </button>
                </div>
                
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-start">
                  <Info size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                  {formData.anonymous 
                    ? 'Su identidad permanecerá completamente anónima.' 
                    : 'Su información de contacto será tratada con estricta confidencialidad.'}
                </p>
                
                {!formData.anonymous && (
                  <motion.div 
                    className="mt-4 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Correo electrónico de contacto
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleFormChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono de contacto
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleFormChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="(Código de área) Número"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150"
                onClick={handleBack}
              >
                Volver
              </button>
              <button
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleNext}
                disabled={!formData.title || !formData.description}
              >
                Continuar
                <ChevronRight size={18} className="inline ml-2" />
              </button>
            </div>
          </motion.div>
        );
        
      case FormStep.Evidence:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white mb-4">
              Evidencia y documentación de respaldo
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Si dispone de documentos, fotografías u otros archivos que respalden su denuncia, 
                puede adjuntarlos a continuación. Este paso es opcional pero recomendado.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="fileUpload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload size={36} className="text-gray-400 dark:text-gray-500 mb-3" />
                  <span className="text-gray-800 dark:text-white font-medium mb-1">
                    Haga clic para seleccionar archivos
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    o arrastre y suelte archivos aquí
                  </span>
                  <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Formatos permitidos: PDF, JPG, PNG, DOCX, XLSX (Max. 10MB por archivo)
                  </span>
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                    Archivos seleccionados ({files.length})
                  </h3>
                  
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center overflow-hidden">
                          <svg className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center ml-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
                            {(file.size / 1024).toFixed(0)} KB
                          </span>
                          <button
                            className="text-gray-400 hover:text-error-500 transition duration-150"
                            onClick={() => removeFile(index)}
                            aria-label="Eliminar archivo"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150"
                onClick={handleBack}
              >
                Volver
              </button>
              <button
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150"
                onClick={handleNext}
              >
                Continuar
                <ChevronRight size={18} className="inline ml-2" />
              </button>
            </div>
          </motion.div>
        );
        
      case FormStep.Review:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white mb-4">
              Revisar y enviar denuncia
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-lg text-gray-800 dark:text-white">
                  Resumen de la denuncia
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tipo de denuncia
                  </h4>
                  <p className="text-gray-800 dark:text-white">
                    {reportTypes.find(type => type.id === selectedReportType)?.title || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Título
                  </h4>
                  <p className="text-gray-800 dark:text-white">
                    {formData.title}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Descripción
                  </h4>
                  <p className="text-gray-800 dark:text-white whitespace-pre-line">
                    {formData.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fecha aproximada
                    </h4>
                    <p className="text-gray-800 dark:text-white">
                      {formData.date ? new Date(formData.date).toLocaleDateString('es-AR') : 'No especificada'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Área o departamento
                    </h4>
                    <p className="text-gray-800 dark:text-white">
                      {formData.department ? formData.department.replace('_', ' ').charAt(0).toUpperCase() + formData.department.replace('_', ' ').slice(1) : 'No especificado'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Personas involucradas
                    </h4>
                    <p className="text-gray-800 dark:text-white">
                      {formData.peopleInvolved || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Monto aproximado
                    </h4>
                    <p className="text-gray-800 dark:text-white">
                      {formData.estimatedAmount ? `$${formData.estimatedAmount}` : 'No especificado'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Archivos adjuntos
                  </h4>
                  {files.length > 0 ? (
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="text-gray-800 dark:text-white flex items-center">
                          <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No se adjuntaron archivos
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tipo de denuncia
                  </h4>
                  <div className="flex items-center">
                    {formData.anonymous ? (
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <EyeOff size={16} className="mr-2" />
                        Anónima
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <Eye size={16} className="mr-2" />
                        Con datos de contacto
                      </div>
                    )}
                  </div>
                  
                  {!formData.anonymous && (
                    <div className="mt-3 pl-6 space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Email:</span> {formData.contactEmail}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Teléfono:</span> {formData.contactPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="confirmVeracity" 
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="confirmVeracity" className="text-sm text-gray-600 dark:text-gray-300">
                    Confirmo que la información proporcionada es veraz y basada en hechos concretos. 
                    Comprendo que realizar denuncias falsas o malintencionadas puede tener consecuencias legales.
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150"
                onClick={handleBack}
              >
                Volver
              </button>
              <button
                className="px-6 py-3 bg-success-500 text-white font-medium rounded-lg hover:bg-success-600 transition duration-150"
                onClick={handleNext}
              >
                Enviar denuncia
              </button>
            </div>
          </motion.div>
        );
        
      case FormStep.Confirmation:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 text-center py-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-500 mb-4">
              <Check size={32} />
            </div>
            
            <h2 className="font-heading text-2xl font-bold text-gray-800 dark:text-white">
              Denuncia enviada con éxito
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              Su denuncia ha sido registrada en nuestro sistema y será analizada por nuestro equipo de investigación.
              {!formData.anonymous && ' Le notificaremos sobre cualquier avance a través de los datos de contacto proporcionados.'}
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg inline-block mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Número de referencia:
              </p>
              <p className="text-xl font-mono font-bold text-gray-800 dark:text-white">
                DEN-{Math.floor(Math.random() * 9000) + 1000}-{new Date().getFullYear()}
              </p>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              {formData.anonymous 
                ? 'Guarde este número de referencia para consultas futuras sobre el estado de la denuncia.' 
                : 'Le recomendamos guardar este número de referencia para futuras consultas.'}
            </p>
            
            <div className="mt-8">
              <Link 
                to="/"
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150"
              >
                Volver al inicio
              </Link>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="pb-16">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
          Sistema de Denuncias
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Portal confidencial para reportar posibles casos de corrupción o irregularidades
        </p>
      </div>
      
      {/* Progress bar - only shown after introduction */}
      {currentStep > FormStep.Introduction && currentStep < FormStep.Confirmation && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Paso {currentStep} de {Object.keys(FormStep).length / 2 - 2}
            </span>
            <span className="text-sm font-medium text-primary-500 dark:text-primary-400">
              {Math.round(((currentStep) / ((Object.keys(FormStep).length / 2) - 2)) * 100)}% completado
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-500 ease-in-out" 
              style={{ width: progressBarWidth() }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Whistleblower;