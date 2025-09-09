import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, DollarSign, Users, Building, Calendar } from 'lucide-react';
import LazyChartLoader from '../charts/LazyChartLoader';
import BudgetAnalysisChartEnhanced from '../charts/BudgetAnalysisChartEnhanced';

interface UnifiedFinancialDashboardProps {
  year: number;
}

const UnifiedFinancialDashboard: React.FC<UnifiedFinancialDashboardProps> = ({ year }) => {
  const [selectedYear, setSelectedYear] = useState<number>(year);

  // Generate available years
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with year selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📊 Panel Financiero Unificado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análisis completo de las finanzas municipales para el año {selectedYear}
            </p>
          </div>
          
          {/* Year selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Seleccionar año para análisis"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$4.2B</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ejecución</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">86.5%</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">45%</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Building className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inversión</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Analysis Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Análisis Presupuestario
          </h2>
        </div>
        <BudgetAnalysisChartEnhanced year={selectedYear} />
      </div>

      {/* Debt Analysis Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <PieChart className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Análisis de Deuda
          </h2>
        </div>
        <LazyChartLoader year={selectedYear} />
      </div>
    </motion.div>
  );
};

export default UnifiedFinancialDashboard;