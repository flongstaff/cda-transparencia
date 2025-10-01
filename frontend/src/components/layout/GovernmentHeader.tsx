import React, { useState, useRef } from 'react';
import { Shield, Calendar, Phone, Mail, Home, BarChart3, FileText, Users, Building, ShieldCheck, Search, Command, Filter } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Combobox, Transition } from '@headlessui/react';
import DarkModeToggle from '../ui/DarkModeToggle';

const GovernmentHeader: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sample search suggestions
  const searchSuggestions = [
    'Presupuesto 2024',
    'Contratos de obra pública',
    'Salarios municipales',
    'Declaraciones patrimoniales',
    'Licitaciones públicas',
    'Estados financieros',
    'Auditorías internas'
  ];
  
  // Recommended navigation items
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home, path: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'documents', label: 'Documentos', icon: FileText, path: '/documents' },
    { id: 'budget', label: 'Presupuesto', icon: BarChart3, path: '/budget' },
    { id: 'salaries', label: 'Salarios', icon: Users, path: '/salaries' },
    { id: 'contracts', label: 'Contratos', icon: Building, path: '/contracts' },
    { id: 'audits', label: 'Auditorías', icon: ShieldCheck, path: '/audits' },
    { id: 'contact', label: 'Contacto', icon: Mail, path: '/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-background border-b border-gray-200 dark:border-dark-border shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Government Identity */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary font-heading">
                  Análisis de Datos Públicos
                </h1>
                <p className="text-sm text-red-600 dark:text-red-400 font-semibold">NO OFICIAL - Carmen de Areco</p>
              </div>
            </div>
          </div>

          {/* Center: Enhanced Search and Navigation */}
          <div className="flex items-center space-x-6 flex-1 max-w-4xl mx-6">
            {/* Compact Navigation for larger screens */}
            <div className="hidden 2xl:flex items-center space-x-1">
              {navItems.slice(0, 4).map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <motion.div
                  className="relative"
                  animate={{
                    scale: isSearchFocused ? 1.02 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className={`h-5 w-5 transition-colors duration-200 ${
                      isSearchFocused ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Buscar en presupuestos, contratos, declaraciones patrimoniales, auditorías..."
                    className="w-full pl-12 pr-20 py-3.5 text-base border-2 border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="flex items-center space-x-3">
                      <motion.button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          // Clear search
                          setSearchQuery('');
                          if (searchInputRef.current) searchInputRef.current.focus();
                        }}
                      >
                        <Command className="h-4 w-4" />
                      </motion.button>
                      <kbd className="hidden sm:inline-flex items-center px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono font-semibold text-gray-500 bg-gray-50 dark:bg-dark-surface-alt dark:text-gray-400">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </motion.div>

                {/* Search Suggestions Dropdown */}
                <Transition
                  show={isSearchFocused && searchQuery.length === 0}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-surface shadow-lg rounded-xl border border-gray-200 dark:border-dark-border max-h-64 overflow-auto">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">Búsquedas sugeridas</p>
                    </div>
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-alt cursor-pointer flex items-center space-x-3"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          navigate(`/search?q=${encodeURIComponent(suggestion)}`);
                          setIsSearchFocused(false);
                        }}
                      >
                        <Search className="h-4 w-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </Transition>
              </form>
            </div>
          </div>

          {/* Right: Theme Toggle and Contact */}
          <div className="flex items-center space-x-3">
            <DarkModeToggle />
            <Link to="/contact" className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Phone className="h-4 w-4 mr-1" />
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GovernmentHeader;