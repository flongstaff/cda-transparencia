import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  BarChart3,
  DollarSign,
  FileText,
  Users,
  Shield,
  Database,
  Info,
  TrendingUp,
  PieChart,
  Monitor,
  Calculator,
  Briefcase
} from 'lucide-react';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/dashboard', label: 'Panel Principal', icon: BarChart3 },
    { to: '/ultimate', label: 'TODOS los Gráficos', icon: Monitor },
    { to: '/budget', label: 'Presupuesto', icon: DollarSign },
    { to: '/spending', label: 'Gastos Públicos', icon: Calculator },
    { to: '/treasury', label: 'Tesorería', icon: TrendingUp },
    { to: '/contracts', label: 'Contratos', icon: Briefcase },
    { to: '/salaries', label: 'Sueldos', icon: Users },
    { to: '/documents', label: 'Documentos', icon: FileText },
    { to: '/reports', label: 'Reportes', icon: PieChart },
    { to: '/audit', label: 'Auditoría', icon: Shield },
    { to: '/database', label: 'Base de Datos', icon: Database },
    { to: '/about', label: 'Acerca de', icon: Info }
  ];

  return (
    <nav className="bg-white dark:bg-dark-surface shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Transparencia CDA</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary hover:text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary hover:border-gray-300 dark:border-dark-border"
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary hover:text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;