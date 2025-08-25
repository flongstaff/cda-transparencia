import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, BarChart3, Banknote, AlertTriangle, Loader2, Info } from 'lucide-react';
import { formatDateARS } from '../../utils/formatters';
import ApiService from '../../services/ApiService';

interface RecentUpdate {
  id: number;
  title: string;
  date: string;
  category: string;
  icon: React.ReactNode;
  iconBg: string;
  link: string;
}

const RecentUpdatesList: React.FC = () => {
  const [updates, setUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load recent updates on component mount
  useEffect(() => {
    loadRecentUpdates();
  }, []);

  const loadRecentUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all data types to create a combined recent updates list
      const [
        declarations,
        salaries,
        tenders,
        reports,
        treasury,
        fees,
        expenses,
        debt,
        investments
      ] = await Promise.all([
        ApiService.getPropertyDeclarations(),
        ApiService.getSalaries(),
        ApiService.getPublicTenders(),
        ApiService.getFinancialReports(),
        ApiService.getTreasuryMovements(),
        ApiService.getFeesRights(),
        ApiService.getOperationalExpenses(),
        ApiService.getMunicipalDebt(),
        ApiService.getInvestmentsAssets()
      ]);

      // Create recent updates from all data types
      const allUpdates: RecentUpdate[] = [
        // Property Declarations
        ...declarations.slice(0, 2).map((declaration, index) => ({
          id: declaration.id,
          title: `Nueva Declaración Jurada Patrimonial - ${declaration.official_name}`,
          date: declaration.declaration_date,
          category: 'Declaraciones',
          icon: <FileText size={18} />,
          iconBg: 'bg-primary-100 text-primary-500 dark:bg-primary-900/30 dark:text-primary-400',
          link: `/declarations/${declaration.id}`
        })),
        
        // Public Tenders
        ...tenders.slice(0, 2).map((tender, index) => ({
          id: tender.id + 1000,
          title: `Nueva licitación: ${tender.title}`,
          date: tender.award_date,
          category: 'Contratos',
          icon: <FileText size={18} />,
          iconBg: 'bg-accent-100 text-accent-500 dark:bg-accent-900/30 dark:text-accent-400',
          link: `/tenders/${tender.id}`
        })),
        
        // Financial Reports
        ...reports.slice(0, 2).map((report, index) => ({
          id: report.id + 2000,
          title: `Informe Trimestral de Ejecución Presupuestaria Q${report.quarter} ${report.year}`,
          date: `${report.year}-${report.quarter * 3}-01`,
          category: 'Presupuesto',
          icon: <BarChart3 size={18} />,
          iconBg: 'bg-secondary-100 text-secondary-500 dark:bg-secondary-900/30 dark:text-secondary-400',
          link: `/reports/${report.id}`
        })),
        
        // Operational Expenses
        ...expenses.slice(0, 2).map((expense, index) => ({
          id: expense.id + 3000,
          title: `Publicación de gastos mensuales - ${expense.category}`,
          date: new Date().toISOString(),
          category: 'Gastos',
          icon: <Banknote size={18} />,
          iconBg: 'bg-success-100 text-success-500 dark:bg-success-900/30 dark:text-success-400',
          link: `/expenses/${expense.id}`
        })),
        
        // Municipal Debt
        ...debt.slice(0, 2).map((debtItem, index) => ({
          id: debtItem.id + 4000,
          title: `Resolución de caso de investigación #${debtItem.id}`,
          date: debtItem.due_date,
          category: 'Deuda',
          icon: <AlertTriangle size={18} />,
          iconBg: 'bg-error-100 text-error-500 dark:bg-error-900/30 dark:text-error-400',
          link: `/debt/${debtItem.id}`
        }))
      ];

      // Sort by date (most recent first)
      const sortedUpdates = allUpdates.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 5); // Take only the 5 most recent

      setUpdates(sortedUpdates);
    } catch (err) {
      console.error('Failed to load recent updates:', err);
      setError('Failed to load recent updates');
      
      // Fallback to mock data
      const mockUpdates: RecentUpdate[] = [
        {
          id: 1,
          title: 'Actualización del Informe Trimestral de Ejecución Presupuestaria',
          date: '2025-04-15',
          category: 'Presupuesto',
          icon: <BarChart3 size={18} />,
          iconBg: 'bg-primary-100 text-primary-500 dark:bg-primary-900/30 dark:text-primary-400',
          link: '/budget'
        },
        {
          id: 2,
          title: 'Nueva licitación: Mejora de infraestructura vial',
          date: '2025-04-12',
          category: 'Contratos',
          icon: <FileText size={18} />,
          iconBg: 'bg-accent-100 text-accent-500 dark:bg-accent-900/30 dark:text-accent-400',
          link: '/contracts'
        },
        {
          id: 3,
          title: 'Publicación de gastos mensuales - Marzo 2025',
          date: '2025-04-10',
          category: 'Gastos',
          icon: <Banknote size={18} />,
          iconBg: 'bg-secondary-100 text-secondary-500 dark:bg-secondary-900/30 dark:text-secondary-400',
          link: '/spending'
        },
        {
          id: 4,
          title: 'Resolución de caso de investigación #2023-156',
          date: '2025-04-05',
          category: 'Denuncias',
          icon: <AlertTriangle size={18} />,
          iconBg: 'bg-error-100 text-error-500 dark:bg-error-900/30 dark:text-error-500',
          link: '/whistleblower'
        }
      ];
      
      setUpdates(mockUpdates);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando actualizaciones recientes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar actualizaciones</h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={loadRecentUpdates}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {updates.map((update) => (
          <li key={update.id}>
            <Link 
              to={update.link} 
              className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
            >
              <div className="flex items-center px-6 py-4">
                <div className={`${update.iconBg} p-2 rounded-lg mr-4`}>
                  {update.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {update.title}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 px-2 py-0.5 rounded">
                      {update.category}
                    </span>
                    <div className="flex items-center ml-3 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      {formatDateARS(update.date)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
        <Link 
          to="/database" 
          className="text-sm font-medium text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 flex justify-center"
        >
          Ver todas las actualizaciones
        </Link>
      </div>
    </div>
  );
};

export default RecentUpdatesList;