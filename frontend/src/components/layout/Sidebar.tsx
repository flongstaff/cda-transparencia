import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  BarChart3, 
  Banknote, 
  LineChart, 
  FileText, 
  Database, 
  FileBarChart, 
  AlertTriangle, 
  Home,
  Info,
  Mail,
  Code, // For API Explorer
  FolderOpen, // For Documents
  PieChart, // For Debt
  Building, // For Investments
  Wallet // For Treasury
} from 'lucide-react';

interface SidebarProps {
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const { t, language } = useLanguage();
  
  const navItems = [
    { to: '/', label: t('sidebar.home'), icon: <Home size={20} /> },
    { to: '/about', label: t('sidebar.about'), icon: <Info size={20} /> },
    { to: '/dashboard', label: t('sidebar.dashboard'), icon: <BarChart3 size={20} /> },
    { to: '/budget', label: t('sidebar.budget'), icon: <BarChart3 size={20} /> },
    { to: '/spending', label: t('sidebar.spending'), icon: <Banknote size={20} /> },
    { to: '/revenue', label: t('sidebar.revenue'), icon: <LineChart size={20} /> },
    { to: '/contracts', label: t('sidebar.contracts'), icon: <FileText size={20} /> },
    { to: '/debt', label: t('sidebar.debt'), icon: <PieChart size={20} /> },
    { to: '/investments', label: t('sidebar.investments'), icon: <Building size={20} /> },
    { to: '/treasury', label: t('sidebar.treasury'), icon: <Wallet size={20} /> },
    { to: '/property-declarations', label: t('sidebar.property'), icon: <FileText size={20} /> },
    { to: '/salaries', label: t('sidebar.salaries'), icon: <FileText size={20} /> },
    { to: '/database', label: t('sidebar.database'), icon: <Database size={20} /> },
    { to: '/documents', label: t('sidebar.documents'), icon: <FolderOpen size={20} /> },
    { to: '/reports', label: t('sidebar.reports'), icon: <FileBarChart size={20} /> },
    { to: '/contact', label: t('sidebar.contact'), icon: <Mail size={20} /> },
    { to: '/whistleblower', label: t('sidebar.whistleblower'), icon: <AlertTriangle size={20} /> },
    { to: '/api-explorer', label: t('sidebar.apiExplorer'), icon: <Code size={20} /> },
  ];

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-heading font-bold text-lg text-gray-800 dark:text-white">
          {t('sidebar.menu')}
        </h2>
      </div>
      
      <nav className="flex-grow py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={closeSidebar}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 font-medium dark:bg-primary-900 dark:text-primary-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  transition duration-150
                `}
              >
                <span className="mr-3 text-gray-500 dark:text-gray-400">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {language === 'es' ? 'Última actualización:' : 'Ultimo aggiornamento:'}
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            {new Date().toLocaleDateString(language === 'es' ? 'es-AR' : 'it-IT')}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;