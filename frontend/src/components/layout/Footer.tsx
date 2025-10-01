import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cookie, User, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 dark:bg-dark-surface text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Portal de Transparencia Carmen de Areco</h3>
            <p className="text-gray-400 dark:text-dark-text-tertiary">Garantizando la transparencia en la gestión pública</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 rounded-full px-4 py-2 font-bold">
              <span className="text-white">Calidad:</span>
              <span className="ml-2 text-xl">100/100</span>
            </div>
          </div>
        </div>
        
        {/* Privacy and Legal Links */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link 
              to="/privacy-policy" 
              className="flex items-center text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-white transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Política de Privacidad
            </Link>
            <Link 
              to="/data-rights" 
              className="flex items-center text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-white transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Derechos de Datos
            </Link>
            <Link 
              to="/cookie-policy" 
              className="flex items-center text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-white transition-colors"
            >
              <Cookie className="h-4 w-4 mr-2" />
              Política de Cookies
            </Link>
            <a 
              href="https://www.argentina.gob.ar/aaip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-white transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              AAIP
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 dark:text-dark-text-tertiary text-sm">
          <p>© {currentYear} Portal de Transparencia Carmen de Areco. Datos verificados y actualizados regularmente.</p>
          <p className="mt-2 flex items-center justify-center">
            <Heart className="h-4 w-4 mr-1 text-red-500" />
            <span>Hecho con amor para la comunidad</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;