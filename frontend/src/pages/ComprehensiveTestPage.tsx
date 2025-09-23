/**
 * Comprehensive Test Page
 * Test page that brings together all testing components
 */

import React from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  FileImage,
  Archive,
  Braces,
  FileSpreadsheet,
  Presentation,
  FileWord,
  Github,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import TestRunner from '../components/testing/TestRunner';

const ComprehensiveTestPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white">Pruebas Integrales del Sistema</h1>
          <p className="text-blue-100 mt-2">
            Verificación completa de todos los componentes del sistema de transparencia
          </p>
        </div>
        
        <div className="p-6">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              Sistema de Pruebas Integral
            </h2>
            <p className="text-blue-700 mb-4">
              Esta página proporciona un conjunto completo de pruebas para verificar que todos 
              los componentes del sistema de transparencia estén funcionando correctamente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-blue-700">Manejo de Documentos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Github className="w-5 h-5 text-blue-500" />
                <span className="text-blue-700">Integración con GitHub</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-blue-700">Visores de Archivos</span>
              </div>
            </div>
          </div>
          
          {/* Test Runner Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ejecutar Pruebas</h2>
            <TestRunner />
          </div>
          
          {/* Manual Test Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Pruebas Manuales
            </h2>
            <p className="text-gray-700 mb-4">
              Además de las pruebas automatizadas, puede realizar las siguientes pruebas manuales:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  Verificar Visores de Documentos
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>PDF: Verificar visualización y descarga</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Markdown: Verificar renderizado y edición</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Imágenes: Verificar visualización y zoom</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>JSON: Verificar visualización estructurada</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Archivos: Verificar descarga y extracción</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Github className="w-4 h-4 mr-2 text-gray-500" />
                  Verificar Integración con GitHub
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Acceso a datos desde GitHub</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Caché de recursos locales</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Manejo de errores de red</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Autenticación con tokens</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Actualización automática de datos</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                Nota Importante
              </h3>
              <p className="text-yellow-700 text-sm">
                Las pruebas automatizadas simulan el comportamiento del sistema. Para pruebas reales, 
                asegúrese de tener conexión a Internet y acceso al repositorio de GitHub. Algunas 
                pruebas pueden requerir permisos especiales o configuración adicional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTestPage;