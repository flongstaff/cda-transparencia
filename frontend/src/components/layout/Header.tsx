import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Sun, Moon, Globe, Menu, X, Shield, Eye } from 'lucide-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Enhanced scroll handler with throttling for better performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLanguageOpen(false);
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLanguageChange = useCallback((lang: 'es' | 'it') => {
    setLanguage(lang);
    setLanguageOpen(false);
  }, [setLanguage]);

  // Enhanced search functionality with debouncing and security
  const handleSearchSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Sanitize search query to prevent XSS
    const sanitizedQuery = searchQuery.trim().replace(/<[^>]*>?/gm, '');
    
    if (sanitizedQuery.length < 2) {
      console.warn('Search query too short');
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Navigate to database with search query
      navigate(`/database?search=${encodeURIComponent(sanitizedQuery)}`);
    } catch (error) {
      console.error('Search navigation failed:', error);
    } finally {
      setIsSearching(false);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Basic input validation
    if (value.length <= 100) { // Prevent overly long queries
      setSearchQuery(value);
    }
  }, []);

  const navigation = [
    { name: t('header.nav.home'), href: '/' },
    { name: t('header.nav.about'), href: '/about' },
    { name: 'Presupuesto', href: '/budget' },
    { name: 'Gastos', href: '/spending' },
    { name: 'Contratos', href: '/contracts' },
    { name: 'Salarios', href: '/salaries' },
    { name: 'Base de Datos', href: '/database' },
    { name: 'Documentos', href: '/documents' },
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
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <label htmlFor="desktop-search" className="sr-only">
                  {t('header.search.placeholder')}
                </label>
                <input 
                  id="desktop-search"
                  ref={searchRef}
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('header.search.placeholder')} 
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition duration-150"
                  aria-label={t('header.search.placeholder')}
                  disabled={isSearching}
                  maxLength={100}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={16} className={`${isSearching ? 'text-primary-500 animate-pulse' : 'text-gray-400'}`} aria-hidden="true" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
            </div>

            {/* Language selector, theme toggle and mobile menu button */}
            <div className="flex items-center space-x-4">
              {/* Language selector */}
              <div className="relative" ref={languageRef}>
                <button 
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition duration-150 flex items-center p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={() => setLanguageOpen(!languageOpen)}
                  aria-label={t('sidebar.language')}
                  aria-expanded={languageOpen}
                  aria-haspopup="true"
                  id="language-menu-button"
                >
                  <Globe size={20} aria-hidden="true" />
                  <span className="ml-1 hidden sm:inline font-medium">{language.toUpperCase()}</span>
                </button>
                
                {languageOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-in slide-in-from-top-2 duration-200" 
                    role="menu"
                    aria-labelledby="language-menu-button"
                  >
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left transition-colors duration-150 ${
                        language === 'es' 
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset`}
                      onClick={() => handleLanguageChange('es')}
                      role="menuitem"
                      tabIndex={0}
                    >
                      🇪🇸 Español
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left transition-colors duration-150 ${
                        language === 'it' 
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset`}
                      onClick={() => handleLanguageChange('it')}
                      role="menuitem"
                      tabIndex={0}
                    >
                      🇮🇹 Italiano
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile search button */}
              <button 
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition duration-150 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={t('header.search.mobile')}
                aria-expanded={searchOpen}
              >
                <Search size={20} aria-hidden="true" />
              </button>
              
              {/* Theme toggle */}
              <button 
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition duration-150 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
                title={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
              >
                {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition duration-150 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                ref={mobileMenuRef}
              >
                {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
          
          {/* Mobile search - Only shown when toggled */}
          {searchOpen && (
            <div className="pb-4 md:hidden">
              <form onSubmit={handleSearchSubmit} className="relative">
                <label htmlFor="mobile-search" className="sr-only">
                  {t('header.search.mobile')}
                </label>
                <input 
                  id="mobile-search"
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('header.search.mobile')} 
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition duration-150"
                  aria-label={t('header.search.mobile')}
                  disabled={isSearching}
                  maxLength={100}
                  autoFocus
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={16} className={`${isSearching ? 'text-primary-500 animate-pulse' : 'text-gray-400'}`} aria-hidden="true" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
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