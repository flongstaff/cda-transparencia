import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Monitor,
  DollarSign,
  Briefcase,
  FileText,
  Home as HomeIcon,
  Users,
  PiggyBank,
  TrendingDown,
  Building,
  BarChart3,
  Shield,
  Database,
  MessageSquare,
  Info,
  Phone
} from 'lucide-react';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Inicio', icon: HomeIcon },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/master', label: 'Master View', icon: Monitor },
    { to: '/budget', label: 'Presupuesto', icon: DollarSign },
    { to: '/contracts', label: 'Contratos', icon: Briefcase },
    { to: '/salaries', label: 'Salarios', icon: Users },
    { to: '/treasury', label: 'Tesorería', icon: PiggyBank },
    { to: '/spending', label: 'Gastos', icon: TrendingDown },
    { to: '/property-declarations', label: 'Declaraciones', icon: Building },
    { to: '/documents', label: 'Documentos', icon: FileText },
    { to: '/reports', label: 'Reportes', icon: BarChart3 },
    { to: '/audit', label: 'Auditoría', icon: Shield },
    { to: '/database', label: 'Base de Datos', icon: Database },
    { to: '/whistleblower', label: 'Denuncias', icon: MessageSquare },
    { to: '/about', label: 'Acerca de', icon: Info },
    { to: '/contact', label: 'Contacto', icon: Phone },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Transparencia CDA</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
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
                  className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
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