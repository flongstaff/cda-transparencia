// CarmenDeArecoPage.tsx
// Dedicated page for Carmen de Areco specific transparency data

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { CarmenTransparencyDashboard, CarmenLicitaciones } from '@components/carmen';
import ErrorBoundary from '@components/common/ErrorBoundary';

const CarmenDeArecoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                <Building className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                Transparencia Municipal - Carmen de Areco
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                Datos de transparencia y licitaciones para el municipio de Carmen de Areco
              </p>
            </div>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-dark-border"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                Bienvenido al Portal de Transparencia de Carmen de Areco
              </h2>
              <p className="mt-2 text-gray-600 dark:text-dark-text-secondary">
                Este portal proporciona acceso a información detallada sobre el presupuesto, 
                gastos, contrataciones y otros datos relevantes del municipio de Carmen de Areco.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-tertiary">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                  Datos actualizados regularmente
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-tertiary">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                  Acceso gratuito a la información
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-tertiary">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                  Cumple con normativas de transparencia
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transparency Dashboard Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600" />
              Dashboard de Transparencia
            </h2>
          </div>
          
          <ErrorBoundary
            fallback={(error) => (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-6 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error al cargar el dashboard de transparencia
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error?.message || 'Ocurrió un error al cargar los datos.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          >
            <CarmenTransparencyDashboard />
          </ErrorBoundary>
        </motion.section>

        {/* Licitaciones Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Licitaciones Públicas
            </h2>
          </div>
          
          <ErrorBoundary
            fallback={(error) => (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-6 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error al cargar las licitaciones
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error?.message || 'Ocurrió un error al cargar los datos de licitaciones.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          >
            <CarmenLicitaciones />
          </ErrorBoundary>
        </motion.section>
      </div>
    </div>
  );
};

export default CarmenDeArecoPage;