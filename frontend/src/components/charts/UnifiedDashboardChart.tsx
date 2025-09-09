import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ComprehensiveChart, { ChartType } from './ComprehensiveChart';
import { useTransparencyData } from '../../hooks/useTransparencyData';

interface Props {
  year: number;
  className?: string;
}

const CHART_TYPES: { key: ChartType; label: string; description: string }[] = [
  { key: 'budget', label: 'Presupuesto', description: 'Análisis presupuestario y ejecución' },
  { key: 'debt', label: 'Deuda', description: 'Deuda municipal y compromisos' },
  { key: 'treasury', label: 'Tesorería', description: 'Movimientos de tesorería' },
  { key: 'salary', label: 'Salarios', description: 'Análisis salarial público' },
  { key: 'contract', label: 'Contratos', description: 'Contratos y licitaciones' },
  { key: 'property', label: 'Patrimonio', description: 'Declaraciones patrimoniales' },
  { key: 'investment', label: 'Inversiones', description: 'Inversiones municipales' },
  { key: 'revenue', label: 'Ingresos', description: 'Ingresos y recaudación' }
];

const UnifiedDashboardChart: React.FC<Props> = ({ year, className = '' }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('budget');
  const { loading, error, refetch } = useTransparencyData(year);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Dashboard de Transparencia {year}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CHART_TYPES.map(({ key, label, description }) => (
            <motion.button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`p-4 rounded-lg text-left transition-colors ${
                activeChart === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold text-sm">{label}</div>
              <div className={`text-xs mt-1 ${
                activeChart === key ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {description}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Active Chart */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ComprehensiveChart
          type={activeChart}
          year={year}
          variant="bar"
          showControls={true}
          height={500}
        />
      </motion.div>

      {/* Status Indicators */}
      {(loading || error) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          {loading && (
            <div className="text-blue-600 dark:text-blue-400 text-sm">
              Cargando datos del dashboard...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-between">
              <div className="text-red-600 dark:text-red-400 text-sm">
                Error: {error}
              </div>
              <button
                onClick={refetch}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedDashboardChart;