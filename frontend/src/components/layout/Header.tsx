import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Sun, Moon, Globe, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (lang: 'es' | 'it') => {
    setLanguage(lang);
    setLanguageOpen(false);
  };

  const navigation = [
    { name: t('header.nav.home'), href: '/' },
    { name: t('header.nav.about'), href: '/about' },
    { name: 'Presupuesto', href: '/budget' },
    { name: 'Gastos', href: '/spending' },
    { name: 'Contratos', href: '/contracts' },
    { name: 'Salarios', href: '/salaries' },
    { name: 'Base de Datos', href: '/database' },
    { name: 'Integridad', href: '/data-integrity' },
    { name: 'Informes', href: '/reports' },
    { name: 'Contacto', href: '/contact' },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-30 w-full transition-all duration-200 ${
          isScrolled 
            ? 'bg-white shadow-md dark:bg-gray-800' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt={t('header.title')} 
                  className="h-10 w-10 rounded-full object-cover mr-2"
                />
                <div>
                  <h1 className="font-heading font-bold text-primary-500 text-lg md:text-xl leading-tight">
                    {t('header.title')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    {t('header.subtitle')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'text-primary-500 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'
                  } transition duration-150`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Only on desktop */}
            <div className="hidden md:flex flex-grow max-w-lg mx-8">
              <div className="relative w-full">
                <label htmlFor="desktop-search" className="sr-only">
                  {t('header.search.placeholder')}
                </label>
                <input 
                  id="desktop-search"
                  type="text" 
                  placeholder={t('header.search.placeholder')} 
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition duration-150"
                  aria-label={t('header.search.placeholder')}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={16} className="text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Language selector, theme toggle and mobile menu button */}
            <div className="flex items-center space-x-4">
              {/* Language selector */}
              <div className="relative">
                <button 
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition duration-150 flex items-center"
                  onClick={() => setLanguageOpen(!languageOpen)}
                  aria-label={t('sidebar.language')}
                  aria-expanded={languageOpen}
                  aria-haspopup="true"
                >
                  <Globe size={20} aria-hidden="true" />
                  <span className="ml-1 hidden sm:inline">{language.toUpperCase()}</span>
                </button>
                
                {languageOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50" role="menu">
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left ${language === 'es' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => handleLanguageChange('es')}
                      role="menuitem"
                    >
                      Español
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left ${language === 'it' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => handleLanguageChange('it')}
                      role="menuitem"
                    >
                      Italiano
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile search button */}
              <button 
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={t('header.search.mobile')}
              >
                <Search size={20} />
              </button>
              
              {/* Theme toggle */}
              <button 
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition duration-150"
                aria-label={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
          
          {/* Mobile search - Only shown when toggled */}
          {searchOpen && (
            <div className="pb-4 md:hidden">
              <div className="relative">
                <label htmlFor="mobile-search" className="sr-only">
                  {t('header.search.mobile')}
                </label>
                <input 
                  id="mobile-search"
                  type="text" 
                  placeholder={t('header.search.mobile')} 
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition duration-150"
                  aria-label={t('header.search.mobile')}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={16} className="text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } block px-3 py-2 rounded-md text-base font-medium transition duration-150`}
                onClick={() => setMobileMenuOpen(false)}
                role="menuitem"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;