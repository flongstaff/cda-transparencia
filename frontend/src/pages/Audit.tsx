import React, { useState } from 'react';
import { 
  DollarSign, 
  Building, 
  FolderOpen,
  AlertTriangle,
  Eye,
  Target
} from 'lucide-react';
import FinancialAuditDashboard from '../components/audit/FinancialAuditDashboard';
import InfrastructureTracker from '../components/audit/InfrastructureTracker';
import DataCategorizationDashboard from '../components/audit/DataCategorizationDashboard';
import AuditAnomaliesExplainer from '../components/audit/AuditAnomaliesExplainer';

const Audit: React.FC = () => {
  const [activeSection, setActiveSection] = useState('anomalies');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
                🏛️ Auditoría de Transparencia
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Análisis integral de la transparencia municipal en Carmen de Areco
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización
              </div>
              <div className="font-medium text-gray-800 dark:text-white">
                {new Date().toLocaleDateString('es-AR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('anomalies')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'anomalies'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Anomalías y Multas
          </button>

          <button
            onClick={() => setActiveSection('financial')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'financial'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Auditoría Financiera
          </button>
          
          <button
            onClick={() => setActiveSection('infrastructure')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'infrastructure'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Building className="h-4 w-4 mr-2" />
            Infraestructura
          </button>
          
          <button
            onClick={() => setActiveSection('categorization')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'categorization'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Documentos
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeSection === 'anomalies' && <AuditAnomaliesExplainer />}
        {activeSection === 'financial' && <FinancialAuditDashboard />}
        {activeSection === 'infrastructure' && <InfrastructureTracker />}
        {activeSection === 'categorization' && <DataCategorizationDashboard />}
      </div>
    </div>
  );
};

export default Audit;