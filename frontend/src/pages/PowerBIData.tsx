import React from 'react';
import PowerBIDataDashboard from '../components/powerbi/PowerBIDataDashboard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PowerBIDataPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Additional Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Herramientas de Análisis Avanzado</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/financial-analysis" 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Análisis Completo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Visualización avanzada de datos financieros</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link 
              to="/financial-history" 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Historial Financiero</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Evolución financiera por años</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link 
              to="/audit" 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Auditoría</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Detección de irregularidades</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Power BI Dashboard */}
      <PowerBIDataDashboard />
    </div>
  );
};

export default PowerBIDataPage;