// FinancialSummaryCard.tsx
// Component to display financial summary data for Carmen de Areco Transparency Portal

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { FinancialData } from '../services/FinancialDataService';

interface FinancialSummaryCardProps {
  data: FinancialData;
  loading: boolean;
  error: Error | null;
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cargando resumen financiero...
          </h2>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-700 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Error al cargar datos financieros
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No hay datos disponibles
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Los datos financieros no están disponibles en este momento.
          </p>
        </div>
      </motion.div>
    );
  }

  // Helper function to determine trend color and icon
  const getTrendIndicator = (percentage: number) => {
    const isPositive = percentage >= 90; // Consider 90%+ execution as positive
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
    };
  };

  const revenueExecutionPercent = data.revenue.total.percentage;
  const expenditureExecutionPercent = data.expenditure.total.percentage;
  const revenueTrend = getTrendIndicator(revenueExecutionPercent);
  const expenditureTrend = getTrendIndicator(expenditureExecutionPercent);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Resumen Financiero {data.year}
            </h2>
            <p className="text-blue-100">Carmen de Areco - Transparencia Municipal</p>
          </div>
          <Sparkles className="h-5 w-5 text-blue-200 ml-auto" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Revenue Section */}
        <motion.div
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              Ingresos
            </h3>
            <div className={`flex items-center space-x-1 ${revenueTrend.color}`}>
              <revenueTrend.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{revenueExecutionPercent}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Presupuestado</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${data.revenue.total.budgeted.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ejecutado</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ${data.revenue.total.executed.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ejecución</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {revenueExecutionPercent}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Expenditure Section */}
        <motion.div
          className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700/30"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
              Gastos
            </h3>
            <div className={`flex items-center space-x-1 ${expenditureTrend.color}`}>
              <expenditureTrend.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{expenditureExecutionPercent}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Presupuestado</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${data.expenditure.total.budgeted.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ejecutado</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                ${data.expenditure.total.executed.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ejecución</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {expenditureExecutionPercent}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Financial Result Section */}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            Resultado Financiero
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resultado del Artículo 44</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ${data.financial_result.operating_result.executed.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resultado del Ejercicio</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ${data.financial_result.net_result.executed.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Datos oficiales del Municipio de Carmen de Areco • Actualizado: {new Date().toLocaleDateString('es-AR')}
        </p>
      </div>
    </motion.div>
  );
};

export default FinancialSummaryCard;