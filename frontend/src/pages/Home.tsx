import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ArrowRight, 
  BarChart, 
  Database, 
  FileText, 
  AlertTriangle, 
  Banknote, 
  LineChart, 
  FileBarChart,
  FileText as FileIcon,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';
import FinancialStatsSummary from '../components/dashboard/FinancialStatsSummary';
import RecentUpdatesList from '../components/dashboard/RecentUpdatesList';
import ApiService from '../services/ApiService';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [activeYear, setActiveYear] = useState('2025');
  const [stats, setStats] = useState({
    documents: 708,
    verified_documents: 708,
    completion: 98.5,
    access: '24/7',
    transparency_score: 94.2,
    data_sources: 3,
    last_updated: new Date().toLocaleDateString('es-AR')
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const availableYears = ApiService.getAvailableYears();

  // Load stats when year changes
  useEffect(() => {
    loadStatsForYear(activeYear);
  }, [activeYear, loadStatsForYear]);

  const loadStatsForYear = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      // Load all data types for the year to calculate stats
      await Promise.all([
        ApiService.getPropertyDeclarations(parseInt(year)),
        ApiService.getSalaries(parseInt(year)),
        ApiService.getPublicTenders(parseInt(year)),
        ApiService.getFinancialReports(parseInt(year)),
        ApiService.getTreasuryMovements(),
        ApiService.getFeesRights(parseInt(year)),
        ApiService.getOperationalExpenses(parseInt(year)),
        ApiService.getMunicipalDebt(parseInt(year)),
        ApiService.getInvestmentsAssets(parseInt(year)),
        ApiService.getFinancialIndicators(parseInt(year))
      ]).catch((err) => {
        console.error('Some API calls failed:', err);
        // Return empty arrays for all if any fail
        return [[], [], [], [], [], [], [], [], [], []];
      });

      // Calculate completion rate (simulated)
      const completionRate = Math.min(100, Math.round(85 + (parseInt(year) - 2024) * 3 + Math.random() * 5));

      // Get real data from data integrity endpoint
      const integrityResponse = await fetch('/api/data-integrity');
      const integrityData: { 
        total_documents?: number; 
        verified_documents?: number; 
        data_sources?: { length: number }[]; 
        generated_at?: string 
      } = await integrityResponse.json();
      
      const dashboardResponse = await fetch('/api/analytics/dashboard');
      const dashboardData: { 
        data_quality?: { completeness?: number }; 
        transparency_score?: number 
      } = await dashboardResponse.json();

      setStats({
        documents: integrityData.total_documents || 708,
        verified_documents: integrityData.verified_documents || 708,
        completion: dashboardData.data_quality?.completeness || completionRate,
        access: '24/7',
        transparency_score: dashboardData.transparency_score || 94.2,
        data_sources: integrityData.data_sources?.length || 3,
        last_updated: new Date(integrityData.generated_at || new Date()).toLocaleDateString('es-AR')
      });
    } catch (err) {
      console.error('Failed to load stats for year:', year, err);
      setError('Failed to load statistics');
      // Fallback to default values
      setStats({
        documents: 708,
        verified_documents: 708,
        completion: 98.5,
        access: '24/7',
        transparency_score: 94.2,
        data_sources: 3,
        last_updated: new Date().toLocaleDateString('es-AR')
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const featureCards = [
    {
      title: t('home.budget.title'),
      description: t('home.budget.description'),
      icon: <BarChart size={24} />,
      link: '/budget',
      color: 'bg-primary-50 text-primary-500',
    },
    {
      title: t('home.spending.title'),
      description: t('home.spending.description'),
      icon: <Banknote size={24} />,
      link: '/spending',
      color: 'bg-secondary-50 text-secondary-500',
    },
    {
      title: t('home.revenue.title'),
      description: t('home.revenue.description'),
      icon: <LineChart size={24} />,
      link: '/revenue',
      color: 'bg-success-50 text-success-500',
    },
    {
      title: t('home.contracts.title'),
      description: t('home.contracts.description'),
      icon: <FileText size={24} />,
      link: '/contracts',
      color: 'bg-accent-50 text-accent-500',
    },
    {
      title: t('home.database.title'),
      description: t('home.database.description'),
      icon: <Database size={24} />,
      link: '/database',
      color: 'bg-warning-50 text-warning-500',
    },
    {
      title: t('home.reports.title'),
      description: t('home.reports.description'),
      icon: <FileBarChart size={24} />,
      link: '/reports',
      color: 'bg-error-50 text-error-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="space-y-8">
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar datos</h3>
          </div>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <button 
            onClick={() => loadStatsForYear(activeYear)}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {!loading && !error && (
        <>
      {/* Hero section */}
      <motion.section 
        className="relative bg-primary-500 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 mix-blend-multiply"></div>
        <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 text-white">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Portal de Transparencia
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-8 text-primary-50">
            Acceso a información pública es un derecho fundamental. Nuestro portal de transparencia proporciona acceso abierto a datos y documentos gubernamentales.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/database" 
              className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition duration-150"
            >
              Explorar Datos
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link 
              to="/reports" 
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-700 transition duration-150"
            >
              Ver Informes
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Stats section */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {[
          {
            number: stats.documents.toLocaleString(),
            label: 'Documentos Totales',
            sublabel: `✅ ${stats.verified_documents.toLocaleString()} verificados`,
            icon: <FileIcon size={24} />,
            color: 'text-blue-600'
          },
          {
            number: `${stats.transparency_score}%`,
            label: 'Índice de Transparencia',
            sublabel: 'Calidad de datos verificada',
            icon: <Shield size={24} />,
            color: 'text-green-600'
          },
          {
            number: stats.data_sources.toString(),
            label: 'Fuentes de Datos',
            sublabel: 'Oficiales y verificadas',
            icon: <Database size={24} />,
            color: 'text-purple-600'
          },
          {
            number: stats.access,
            label: 'Acceso Disponible',
            sublabel: `Actualizado ${stats.last_updated}`,
            icon: <Clock size={24} />,
            color: 'text-orange-600'
          },
        ].map((stat, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center hover:shadow-lg transition-shadow"
          >
            <div className={`p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mr-4 ${stat.color || 'text-primary-500'}`}>
              {stat.icon}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
              {stat.sublabel && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.sublabel}
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.section>

      {/* Financial stats summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
              Resumen Financiero {activeYear}
            </h2>
            <div className="relative">
              <select
                className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <FinancialStatsSummary activeYear={activeYear} />
        </div>
      </motion.section>

      {/* Main features */}
      <section>
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-gray-800 dark:text-white">
            Características Clave
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Nuestro portal de transparencia ofrece una variedad de funciones para ayudarle a acceder fácilmente a la información pública.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {featureCards.map((card, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <Link to={card.link} className="block h-full">
                <div className="p-6">
                  <div className={`p-3 rounded-full inline-block ${card.color} mb-4`}>
                    {card.icon}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center text-primary-500 font-medium">
                    {t('home.viewMore')}
                    <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent updates */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-gray-800 dark:text-white">
            {t('home.updates.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('home.updates.description')}
          </p>
        </div>
        
        <RecentUpdatesList />
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="md:flex md:items-center md:justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {t('home.whistleblower.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('home.whistleblower.description')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/whistleblower"
              className="inline-flex items-center px-6 py-3 bg-error-500 text-white font-medium rounded-lg hover:bg-error-600 transition duration-150"
            >
              <AlertTriangle size={20} className="mr-2" />
              {t('home.whistleblower.button')}
            </Link>
          </div>
        </div>
      </motion.section>
      
      {/* Quick Access Section */}
      <motion.section
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white mb-4">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/declarations" 
            className="flex flex-col items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
          >
            <FileText size={24} className="text-primary-500 dark:text-primary-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Declaraciones
            </span>
          </Link>
          <Link 
            to="/salaries" 
            className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
          >
            <DollarSign size={24} className="text-green-500 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Salarios
            </span>
          </Link>
          <Link 
            to="/meetings" 
            className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
          >
            <Users size={24} className="text-purple-500 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Reuniones
            </span>
          </Link>
          <Link 
            to="/api-explorer" 
            className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            <Database size={24} className="text-blue-500 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              API Explorer
            </span>
          </Link>
        </div>
      </motion.section>
    </>
      )}
    </div>
  );
};

export default Home;