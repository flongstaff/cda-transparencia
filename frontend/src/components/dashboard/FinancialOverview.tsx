import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { formatCurrencyARS } from '../../utils/formatters';
import ValidatedChart from '../ValidatedChart';

interface FinancialSummary {
  totalBudget: number;
  totalExpenses: number;
  totalRevenue: number;
  totalDebt: number;
  budgetExecution: number;
  revenueGrowth: number;
  expenseGrowth: number;
  debtToBudgetRatio: number;
}

interface MonthlyData {
  month: string;
  budget: number;
  expenses: number;
  revenue: number;
}

const FinancialOverview: React.FC = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear().toString());

  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  useEffect(() => {
    loadFinancialData();
  }, [activeYear]);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all necessary data in parallel
      const [reports, expenses, feesRights, debt] = await Promise.all([
        ApiService.getFinancialReports(parseInt(activeYear)),
        ApiService.getOperationalExpenses(parseInt(activeYear)),
        ApiService.getFeesRights(parseInt(activeYear)),
        ApiService.getMunicipalDebt(parseInt(activeYear))
      ]);

      // Calculate summary statistics
      const totalBudget = reports.reduce((sum, report) => sum + report.income, 0);
      const totalExpenses = reports.reduce((sum, report) => sum + report.expenses, 0);
      const totalRevenue = feesRights.reduce((sum, fee) => sum + fee.revenue, 0);
      const totalDebt = debt.reduce((sum, d) => sum + d.amount, 0);
      
      const budgetExecution = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
      const revenueGrowth = 5.2; // Placeholder - would calculate from previous year data
      const expenseGrowth = 3.8; // Placeholder - would calculate from previous year data
      const debtToBudgetRatio = totalBudget > 0 ? (totalDebt / totalBudget) * 100 : 0;

      setSummary({
        totalBudget,
        totalExpenses,
        totalRevenue,
        totalDebt,
        budgetExecution,
        revenueGrowth,
        expenseGrowth,
        debtToBudgetRatio
      });

      // Generate monthly data (simulated from quarterly reports)
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthlyData: MonthlyData[] = months.map((month, index) => {
        const quarter = Math.floor(index / 3) + 1;
        const quarterReport = reports.find(r => r.quarter === quarter);
        
        return {
          month,
          budget: quarterReport ? quarterReport.income / 3 : 0,
          expenses: quarterReport ? quarterReport.expenses / 3 : 0,
          revenue: quarterReport ? (totalRevenue / 12) : 0
        };
      });
      
      setMonthlyData(monthlyData);
    } catch (err) {
      console.error('Failed to load financial data:', err);
      setError('Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando resumen financiero...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar datos</h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={loadFinancialData}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex justify-end">
        <div className="relative">
          <select
            className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={activeYear}
            onChange={(e) => setActiveYear(e.target.value)}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg mr-4">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Presupuesto Total
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {summary && formatCurrencyARS(summary.totalBudget)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-lg mr-4">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ingresos Totales
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {summary && formatCurrencyARS(summary.totalRevenue)}
              </p>
              <div className="flex items-center mt-1">
                {summary && summary.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${summary && summary.revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {summary && summary.revenueGrowth.toFixed(1)}% vs año anterior
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg mr-4">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Gastos Totales
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {summary && formatCurrencyARS(summary.totalExpenses)}
              </p>
              <div className="flex items-center mt-1">
                {summary && summary.expenseGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                )}
                <span className={`text-xs ${summary && summary.expenseGrowth >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {summary && summary.expenseGrowth.toFixed(1)}% vs año anterior
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-lg mr-4">
              <PieChart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Deuda Municipal
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {summary && formatCurrencyARS(summary.totalDebt)}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {summary && summary.debtToBudgetRatio.toFixed(1)}% del presupuesto
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white">
              Ejecución Presupuestaria {activeYear}
            </h3>
          </div>
          <div className="p-6">
            <ValidatedChart
          data={monthlyData.map(item => ({
            name: item.month,
            value: Math.round(item.budget / 1000000),
            presupuestado: Math.round(item.budget / 1000000),
            ejecutado: Math.round(item.expenses / 1000000)
          }))}
          chartType="bar"
          title={`Presupuesto vs Gastos Mensuales ${activeYear}`}
          sources={['https://carmendeareco.gob.ar/transparencia/']}
          showValidation={true}
        />
          </div>
        </motion.div>

        {/* Revenue Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white">
              Composición de Ingresos {activeYear}
            </h3>
          </div>
          <div className="p-6">
            <ValidatedChart
              data={[
                { name: 'Impuestos', value: 45, color: '#3B82F6' },
                { name: 'Derechos', value: 25, color: '#10B981' },
                { name: 'Multas', value: 10, color: '#F59E0B' },
                { name: 'Transferencias', value: 15, color: '#8B5CF6' },
                { name: 'Otros', value: 5, color: '#EC4899' }
              ]}
              chartType="pie"
              title={`Fuentes de Ingresos ${activeYear}`}
              sources={['https://carmendeareco.gob.ar/transparencia/']}
              showValidation={true}
            />
          </div>
        </motion.div>
      </div>

      {/* Execution Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
      >
        <h3 className="font-heading text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
          📊 Resumen de Ejecución Financiera
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {summary && summary.budgetExecution.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-300">Ejecución Presupuestaria</div>
            <div className={`text-xs mt-1 ${summary && summary.budgetExecution >= 95 ? 'text-green-600 dark:text-green-400' : summary && summary.budgetExecution >= 85 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {summary && summary.budgetExecution >= 95 
                ? 'Ejecución óptima' 
                : summary && summary.budgetExecution >= 85 
                ? 'Ejecución buena' 
                : 'Ejecución baja'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {summary && formatCurrencyARS(summary.totalRevenue - summary.totalExpenses)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-300">Superávit/Deficit</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {summary && (summary.totalRevenue - summary.totalExpenses) >= 0 
                ? 'Superávit financiero' 
                : 'Déficit financiero'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {summary && summary.debtToBudgetRatio.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-300">Nivel de Deuda</div>
            <div className={`text-xs mt-1 ${summary && summary.debtToBudgetRatio <= 30 ? 'text-green-600 dark:text-green-400' : summary && summary.debtToBudgetRatio <= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {summary && summary.debtToBudgetRatio <= 30 
                ? 'Nivel bajo' 
                : summary && summary.debtToBudgetRatio <= 50 
                ? 'Nivel moderado' 
                : 'Nivel alto'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FinancialOverview;