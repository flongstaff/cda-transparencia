import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, HelpCircle, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrencyARS, formatNumberARS, formatDateARS } from '../../utils/formatters';
import ApiService from '../../services/ApiService';

interface FinancialStat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  link: string;
  info: string;
}

interface Props {
  activeYear?: string;
}

const FinancialStatsSummary: React.FC<Props> = ({ activeYear = '2025' }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [stats, setStats] = useState<FinancialStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stats when year changes
  useEffect(() => {
    loadStatsForYear(activeYear);
  }, [activeYear]);

  const loadStatsForYear = async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      // Load all financial data for the year
      const [
        budgets,
        expenses,
        revenues,
        tenders
      ] = await Promise.all([
        ApiService.getFinancialReports(parseInt(year)),
        ApiService.getOperationalExpenses(parseInt(year)),
        ApiService.getFeesRights(parseInt(year)),
        ApiService.getPublicTenders(parseInt(year))
      ]);

      // Calculate aggregated values
      const totalBudget = budgets.reduce((sum, report) => sum + report.income, 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalRevenues = revenues.reduce((sum, rev) => sum + rev.revenue, 0);
      const executionPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
      const monthlySpending = totalExpenses / 12;
      const activeTenders = tenders.filter(tender => tender.status === 'active').length;

      // Calculate changes from previous year
      const prevYear = (parseInt(year) - 1).toString();
      const [
        prevBudgets,
        prevExpenses,
        prevRevenues,
        prevTenders
      ] = await Promise.all([
        ApiService.getFinancialReports(parseInt(prevYear)).catch(() => []),
        ApiService.getOperationalExpenses(parseInt(prevYear)).catch(() => []),
        ApiService.getFeesRights(parseInt(prevYear)).catch(() => []),
        ApiService.getPublicTenders(parseInt(prevYear)).catch(() => [])
      ]);

      const prevTotalBudget = prevBudgets.reduce((sum: number, report: any) => sum + report.income, 0);
      const prevTotalExpenses = prevExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      const prevTotalRevenues = prevRevenues.reduce((sum: number, rev: any) => sum + rev.revenue, 0);
      const prevExecutionPercentage = prevTotalBudget > 0 ? (prevTotalExpenses / prevTotalBudget) * 100 : 0;
      const prevMonthlySpending = prevTotalExpenses / 12;
      const prevActiveTenders = prevTenders.filter((tender: any) => tender.status === 'active').length;

      const budgetChange = prevTotalBudget > 0 ? ((totalBudget - prevTotalBudget) / prevTotalBudget) * 100 : 0;
      const executionChange = executionPercentage - prevExecutionPercentage;
      const spendingChange = prevMonthlySpending > 0 ? ((monthlySpending - prevMonthlySpending) / prevMonthlySpending) * 100 : 0;
      const tendersChange = prevActiveTenders > 0 ? ((activeTenders - prevActiveTenders) / prevActiveTenders) * 100 : 0;

      const yearStats: FinancialStat[] = [
        {
          title: 'Presupuesto Total',
          value: formatCurrencyARS(totalBudget),
          change: `${budgetChange >= 0 ? '+' : ''}${budgetChange.toFixed(2)}%`,
          isPositive: budgetChange >= 0,
          link: '/budget',
          info: `Presupuesto total aprobado para el año fiscal ${year}`
        },
        {
          title: 'Ejecución Presupuestaria',
          value: `${executionPercentage.toFixed(1)}%`,
          change: `${executionChange >= 0 ? '+' : ''}${executionChange.toFixed(1)}%`,
          isPositive: executionChange >= 0,
          link: '/budget',
          info: `Porcentaje del presupuesto ejecutado hasta la fecha en ${year}`
        },
        {
          title: 'Gastos Mensuales',
          value: formatCurrencyARS(monthlySpending),
          change: `${spendingChange >= 0 ? '+' : ''}${spendingChange.toFixed(1)}%`,
          isPositive: spendingChange >= 0,
          link: '/spending',
          info: `Total de gastos realizados en el último mes de ${year}`
        },
        {
          title: 'Licitaciones Activas',
          value: activeTenders.toString(),
          change: `${tendersChange >= 0 ? '+' : ''}${tendersChange.toFixed(0)}`,
          isPositive: tendersChange >= 0,
          link: '/contracts',
          info: `Número de licitaciones y contrataciones actualmente en proceso en ${year}`
        }
      ];

      setStats(yearStats);
    } catch (err) {
      console.error('Failed to load financial stats for year:', year, err);
      setError('Failed to load financial statistics');
      
      // Fallback to default values
      const fallbackStats: FinancialStat[] = [
        {
          title: 'Presupuesto Total',
          value: '$1,245,300,000',
          change: '+4.75%',
          isPositive: true,
          link: '/budget',
          info: `Presupuesto total aprobado para el año fiscal ${year}`
        },
        {
          title: 'Ejecución Presupuestaria',
          value: '65.3%',
          change: '+2.4%',
          isPositive: true,
          link: '/budget',
          info: `Porcentaje del presupuesto ejecutado hasta la fecha en ${year}`
        },
        {
          title: 'Gastos Mensuales',
          value: '$103,750,000',
          change: '-3.2%',
          isPositive: false,
          link: '/spending',
          info: `Total de gastos realizados en el último mes de ${year}`
        },
        {
          title: 'Licitaciones Activas',
          value: '27',
          change: '+5',
          isPositive: true,
          link: '/contracts',
          info: `Número de licitaciones y contrataciones actualmente en proceso en ${year}`
        }
      ];
      
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas financieras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
        <div className="flex items-center">
          <Info size={16} className="text-red-500 mr-2" />
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error al cargar estadísticas</h3>
        </div>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-6">
        <Info size={16} className="mr-2" />
        Actualizado: {formatDateARS(new Date())}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative"
          >
            <Link 
              to={stat.link}
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150"
            >
              <div className="flex justify-between items-start">
                <div className="relative">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <button
                    className="absolute -right-6 top-0"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTooltip(activeTooltip === index ? null : index);
                    }}
                    aria-label="Información adicional"
                  >
                    <HelpCircle size={14} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stat.value}
                </p>
                <div className={`flex items-center mt-1 ${stat.isPositive ? 'text-success-500' : 'text-error-500'}`}>
                  {stat.isPositive ? 
                    <ArrowUpRight size={16} className="mr-1" /> : 
                    <ArrowDownRight size={16} className="mr-1" />
                  }
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              
              {activeTooltip === index && (
                <div className="absolute z-10 bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg text-sm text-gray-600 dark:text-gray-300 w-48">
                  {stat.info}
                  <div className="absolute w-3 h-3 bottom-0 left-6 transform translate-y-1.5 rotate-45 bg-white dark:bg-gray-900"></div>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FinancialStatsSummary;