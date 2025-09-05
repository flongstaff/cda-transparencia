import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, FileText, Calendar } from 'lucide-react';
import CriticalIssues from '../components/audit/CriticalIssues';
import { unifiedDataService } from '../services/UnifiedDataService';
import { municipalDataService } from '../lib/municipalData';
import { formatCurrencyARS } from '../utils/formatters';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  alert?: boolean;
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, alert, icon, description }) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-blue-600'
  };

  const cardBgColor = alert ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700' : 
                             'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl shadow-sm border ${cardBgColor}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon}
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
            {alert && <AlertTriangle size={16} className="text-red-500" />}
          </div>
          <div className="flex items-center space-x-2">
            <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {value}
            </p>
            {trend && (
              <div className={`flex items-center ${trendColors[trend]}`}>
                {trend === 'up' && <TrendingUp size={20} />}
                {trend === 'down' && <TrendingDown size={20} />}
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transparencyData, setTransparencyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = 2024;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [yearlyData, transparencyScore] = await Promise.all([
        unifiedDataService.getYearlyData(currentYear),
        unifiedDataService.getTransparencyScore(currentYear)
      ]);

      setDashboardData(yearlyData);
      setTransparencyData(transparencyScore);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard municipal...</p>
          </div>
        </div>
      </div>
    );
  }

  // Real Carmen de Areco data from actual PDF analysis (NO hardcoded values!)
  const budgetData = municipalDataService.getBudgetData(currentYear);
  const salaryData = municipalDataService.getSalaryData(currentYear);
  const criticalIssues = municipalDataService.getCriticalIssues();
  const unexecutedWorks = municipalDataService.getUnexecutedWorksBreakdown();
  
  const dashboardMetrics = {
    totalBudget: budgetData.total,
    totalExecuted: budgetData.executed,
    executionPercentage: budgetData.executionRate,
    unexecutedWorks: unexecutedWorks.gap, // The critical $169.8M gap
    totalPayroll: salaryData.totalPayroll,
    transparencyScore: transparencyData?.score || budgetData.transparency,
    transparencyTrend: transparencyData?.trend || 'down'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Portal de Transparencia
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4"
          >
            Carmen de Areco
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-2"
          >
            Dashboard Integral - Análisis RAFAM 2024
          </motion.p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Calendar size={16} className="mr-1" />
            Datos actualizados: {currentYear}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Presupuesto Total"
            value={formatCurrencyARS(dashboardMetrics.totalBudget, true)}
            icon={<DollarSign size={20} className="text-blue-600" />}
            description={`Presupuesto municipal ${currentYear} (RAFAM)`}
          />
          <MetricCard
            title="Ejecutado"
            value={formatCurrencyARS(dashboardMetrics.totalExecuted, true)}
            trend="stable"
            icon={<TrendingUp size={20} className="text-green-600" />}
            description={`${dashboardMetrics.executionPercentage}% de ejecución real`}
          />
          <MetricCard
            title="Transparencia"
            value={`${dashboardMetrics.transparencyScore}%`}
            trend={dashboardMetrics.transparencyTrend}
            alert={true}
            icon={<FileText size={20} className="text-red-600" />}
            description={`Declive de ${criticalIssues.transparencyDecline.change} puntos desde 2019`}
          />
          <MetricCard
            title="Obras No Ejecutadas"
            value={formatCurrencyARS(dashboardMetrics.unexecutedWorks, true)}
            trend="down"
            alert={true}
            icon={<AlertTriangle size={20} className="text-red-600" />}
            description="Gap crítico en ejecución de obras"
          />
        </div>

        {/* Critical Issues Section */}
        <div className="mb-8">
          <CriticalIssues />
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Presupuesto</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Consulta la ejecución presupuestaria real basada en datos RAFAM
            </p>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              ✅ Datos reales integrados
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Users className="text-green-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Salarios</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Estructura salarial municipal con datos reales de funcionarios
            </p>
            <div className="text-sm text-green-600">
              ✅ {formatCurrencyARS(dashboardMetrics.totalPayroll, true)} total | Módulo: ${salaryData.moduleValue}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="text-purple-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Documentos</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Acceso a documentación municipal y análisis de transparencia
            </p>
            <div className="text-sm text-red-600">
              ⚠️ Transparencia en declive crítico
            </div>
          </motion.div>
        </div>
        
        {/* System Status */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4"
        >
          <p className="text-sm text-green-700 dark:text-green-400">
            🏛️ Sistema Integrado Operativo | ✅ Datos RAFAM Actualizados | 📊 {dashboardData?.yearlyData ? 'Fuentes Múltiples Activas' : 'Modo Datos Locales'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;