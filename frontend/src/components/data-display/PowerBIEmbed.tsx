import React from 'react';
import { Database, AlertTriangle, ExternalLink } from 'lucide-react';

interface PowerBIEmbedProps {
  title?: string;
  height?: number;
  showDataDashboardLink?: boolean;
}

const PowerBIEmbed: React.FC<PowerBIEmbedProps> = ({
  title = 'Panel de Datos',
  height = 600,
  showDataDashboardLink = false
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          </div>
          {showDataDashboardLink && (
            <a 
              href="/data-dashboard" 
              className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Ir al Dashboard
            </a>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Database className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Integración con Power BI
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            Los datos se visualizan mediante paneles interactivos de Power BI para un análisis avanzado.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <ExternalLink className="h-4 w-4 mr-2" />
            Acceder a Power BI
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg max-w-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">Nota:</span> Esta es una integración de demostración. 
                En un entorno de producción, se conectaría directamente a los servicios de Power BI.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Última actualización: {new Date().toLocaleDateString('es-AR')}</span>
          <span>Power BI Embedded</span>
        </div>
      </div>
    </div>
  );
};

export default PowerBIEmbed;