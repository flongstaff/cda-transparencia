import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: t('header.nav.home'), href: '/' },
      { name: t('header.nav.about'), href: '/about' },
      { name: t('header.nav.transparency'), href: '/database' },
      { name: t('header.nav.reports'), href: '/reports' },
      { name: t('header.nav.contact'), href: '/contact' },
    ],
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt={t('header.title')} 
                  className="h-10 w-10 rounded-full object-cover mr-2"
                />
                <h3 className="font-heading font-bold text-primary-500 text-lg">
                  {t('header.title')}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {t('footer.description') || 'Promoviendo transparencia y rendición de cuentas mediante acceso abierto a información pública.'}
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/municipalidaddecarmendeareco" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  aria-label="Facebook"
                >
                  <span className="sr-only">Facebook</span>
                  <Facebook className="h-5 w-5" aria-hidden="true" />
                </a>
                <a 
                  href="https://twitter.com/carmendeareco" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  aria-label="Twitter"
                >
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-5 w-5" aria-hidden="true" />
                </a>
                <a 
                  href="https://www.instagram.com/municipalidaddecarmendeareco" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  aria-label="Instagram"
                >
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-heading text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">
                {t('footer.quickLinks') || 'Enlaces Rápidos'}
              </h3>
              <ul className="space-y-2">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors duration-150 block py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {t('footer.followUs') || 'Síguenos'}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <a 
                    href="https://www.facebook.com/municipalidaddecarmendeareco" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <span className="sr-only">Facebook</span>
                    <Facebook className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a 
                    href="https://twitter.com/carmendeareco" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    aria-label="Twitter"
                    title="Twitter"
                  >
                    <span className="sr-only">Twitter</span>
                    <Twitter className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a 
                    href="https://www.instagram.com/municipalidaddecarmendeareco" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <span className="sr-only">Instagram</span>
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/company/municipalidad-de-carmen-de-areco" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <Linkedin className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a 
                    href="https://www.youtube.com/municipalidaddecarmendeareco" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <span className="sr-only">YouTube</span>
                    <Youtube className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a 
                    href="https://github.com/carmendeareco" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    aria-label="GitHub"
                    title="GitHub"
                  >
                    <span className="sr-only">GitHub</span>
                    <Github className="h-5 w-5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-heading text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">
                {t('footer.contact') || 'Contacto'}
              </h3>
              <address className="not-italic">
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-sm leading-relaxed">
                      <div className="font-medium">Municipalidad de Carmen de Areco</div>
                      <div>Av. 25 de Mayo 123</div>
                      <div>Carmen de Areco, Buenos Aires</div>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    <a 
                      href="tel:+542323456789" 
                      className="text-sm hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded"
                    >
                      +54 2323 456789
                    </a>
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    <a 
                      href="mailto:transparencia@carmendeareco.gob.ar" 
                      className="text-sm hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded break-all"
                    >
                      transparencia@carmendeareco.gob.ar
                    </a>
                  </li>
                </ul>
              </address>
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {t('footer.language') || 'Idioma'}
                </h4>
                <div className="flex space-x-2" role="group" aria-label="Language selection">
                  <button 
                    onClick={() => setLanguage('es')}
                    className={`px-3 py-2 text-xs rounded-md flex items-center transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                      language === 'es' 
                        ? 'bg-primary-500 text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-pressed={language === 'es'}
                    title="Cambiar a Español"
                  >
                    <span className="mr-1" aria-hidden="true">🇪🇸</span>
                    ES
                  </button>
                  <button 
                    onClick={() => setLanguage('it')}
                    className={`px-3 py-2 text-xs rounded-md flex items-center transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                      language === 'it' 
                        ? 'bg-primary-500 text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-pressed={language === 'it'}
                    title="Cambia a Italiano"
                  >
                    <span className="mr-1" aria-hidden="true">🇮🇹</span>
                    IT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <p className="text-center sm:text-left text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} {t('footer.copyright') || 'Municipalidad de Carmen de Areco. Todos los derechos reservados.'}
            </p>
            <div className="flex justify-center sm:justify-end space-x-6 text-xs">
              <Link 
                to="/privacy" 
                className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded"
              >
                {t('footer.privacy') || 'Privacidad'}
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded"
              >
                {t('footer.terms') || 'Términos'}
              </Link>
              <Link 
                to="/accessibility" 
                className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded"
              >
                {t('footer.accessibility') || 'Accesibilidad'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;