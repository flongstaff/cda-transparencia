import React from 'react';
import { AlertTriangle, FileText, Shield, ExternalLink } from 'lucide-react';

const Irregularities: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
          Alertas: Desviaciones y Sanciones
        </h1>
        <p className="text-gray-600 mt-2">
          Información sobre posibles irregularidades en la ejecución presupuestaria y gastos municipales
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 rounded-r-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="h-6 w-6 text-yellow-600 mr-2" />
          Información Importante
        </h2>
        <p className="text-gray-800 mb-3">
          <strong>Actualización:</strong> A partir de septiembre 24, 2025, no se ha encontrado en fuentes oficiales 
          confirmación de sanciones específicas relacionadas con desvíos de fondos en 2024-2025. 
          La información presentada está basada en análisis de documentos públicos oficiales.
        </p>
        <p className="text-gray-700">
          Esta sección destaca hallazgos basados en documentos oficiales del municipio y análisis de datos financieros. 
          Si usted tiene información adicional o más reciente, por favor contáctenos.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
          <AlertTriangle className="h-7 w-7 text-red-600 mr-2" />
          Hallazgos de Análisis Financiero
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bajo porcentaje de ejecución en infraestructura</h3>
            <p className="text-gray-700 mb-3">
              Análisis de documentos oficiales (2022-2023) muestra una ejecución de infraestructura 
              consistentemente por debajo del 80% de lo planificado, mientras que los gastos de personal 
              han superado el 45-50% del total ejecutado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-800">Ejecución de Infraestructura</h4>
                <p className="text-2xl font-bold text-blue-700">~65%</p>
                <p className="text-sm text-gray-600">Promedio 2022-2023</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h4 className="font-medium text-green-800">Gastos de Personal</h4>
                <p className="text-2xl font-bold text-green-700">&gt;45%</p>
                <p className="text-sm text-gray-600">Del total ejecutado</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Patrones de gasto inusuales</h3>
            <p className="text-gray-700 mb-3">
              Análisis de documentos como "ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO" 
              revelan patrones donde categorías como "bienes de capital" (infraestructura) no se 
              ejecutan completamente mientras que "remuneraciones" superan los porcentajes típicos.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>11% promedio para bienes de capital (infraestructura) en 2022</li>
              <li>45-50% para personal en el mismo período</li>
              <li>Diferencias significativas entre presupuesto y ejecución real</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="h-6 w-6 text-gray-700 mr-2" />
          Documentos de Referencia
        </h2>
        <p className="text-gray-700 mb-4">
          Los hallazgos anteriores se basan en el análisis de los siguientes documentos oficiales:
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO</h3>
            <p className="text-gray-600 text-sm">Análisis detallado de gastos por categoría económica</p>
            <a 
              href="https://carmendeareco.gob.ar/wp-content/uploads/2023/10/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf" 
              className="text-blue-600 hover:underline text-sm flex items-center mt-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documento <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS</h3>
            <p className="text-gray-600 text-sm">Comparativa entre recursos afectados y gastos reales</p>
            <a 
              href="https://carmendeareco.gob.ar/wp-content/uploads/2023/10/ESTADO-DE-EJECUCION-DE-RECURSOS-AFECTADOS-VS-GASTOS-4°TRE-2022.pdf" 
              className="text-blue-600 hover:underline text-sm flex items-center mt-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documento <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Reportes de ejecución presupuestaria múltiples años</h3>
            <p className="text-gray-600 text-sm">Análisis de tendencias a lo largo del tiempo</p>
            <a 
              href="/data/multi_source_report.json"
              className="text-blue-600 hover:underline text-sm flex items-center mt-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver reporte de datos <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-3">¿Qué puede hacer usted?</h2>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>Consultar los documentos oficiales mencionados para verificar la información</li>
          <li>Contactar al municipio para solicitar información adicional o aclaraciones</li>
          <li>Presentar denuncias en caso de detectar irregularidades reales</li>
          <li>Seguir de cerca la ejecución presupuestaria en los informes trimestrales</li>
        </ul>
        
        <div className="mt-4 p-4 bg-white rounded border border-blue-300">
          <h3 className="font-semibold text-blue-800 mb-2">Contacto para transparencia</h3>
          <p className="text-blue-700">
            Para consultas sobre información pública o presentar inquietudes sobre transparencia:
            <br />
            <a 
              href="https://carmendeareco.gob.ar/contacto/" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Formulario de contacto oficial del municipio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Irregularities;