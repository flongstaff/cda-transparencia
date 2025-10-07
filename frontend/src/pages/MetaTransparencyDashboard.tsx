import React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Award, Target } from 'lucide-react';
import MetaTransparencyTracker from '../components/MetaTransparencyTracker';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useMasterData } from '../hooks/useMasterData';

const MetaTransparencyDashboard: React.FC = () => {
  const { data, loading, error } = useMasterData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-600" />
            Meta-Transparencia
          </h1>
          <p className="text-gray-600">
            Monitoreo de calidad, actualización y accesibilidad de datos del portal de transparencia
          </p>
        </motion.div>

        {/* Commitment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white"
          >
            <Target className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Nuestro Compromiso</h3>
            <p className="text-blue-100">
              Garantizar que toda la información publicada sea precisa, actualizada y accesible para todos los ciudadanos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white"
          >
            <TrendingUp className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Mejora Continua</h3>
            <p className="text-green-100">
              Monitoreamos constantemente la calidad de nuestros datos para identificar oportunidades de mejora.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white"
          >
            <Award className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Transparencia Total</h3>
            <p className="text-purple-100">
              Publicamos no solo datos, sino también información sobre la calidad y frescura de esos datos.
            </p>
          </motion.div>
        </div>

        {/* Main Tracker Component */}
        <MetaTransparencyTracker showFullReport={true} />
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const MetaTransparencyDashboardWithErrorBoundary: React.FC = () => {
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
      <MetaTransparencyDashboard />
    </ErrorBoundary>
  );
};

export default MetaTransparencyDashboardWithErrorBoundary;
