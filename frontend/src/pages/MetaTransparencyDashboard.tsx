import React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Award, Target } from 'lucide-react';
import MetaTransparencyTracker from '../components/MetaTransparencyTracker';

const MetaTransparencyDashboard: React.FC = () => {
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

export default MetaTransparencyDashboard;
