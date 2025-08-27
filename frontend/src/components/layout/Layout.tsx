import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import LegalDisclaimer from '../LegalDisclaimer';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex-grow flex">
        {/* Mobile sidebar toggle */}
        <button
          className="fixed bottom-4 right-4 md:hidden z-50 bg-primary-500 text-white p-3 rounded-full shadow-lg"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? t('sidebar.menu') + ' close' : t('sidebar.menu') + ' open'}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Sidebar */}
        <div className={`
          fixed md:static inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition duration-200 ease-in-out z-40 w-64 bg-white dark:bg-gray-800 shadow-md md:shadow
        `}>
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main content */}
        <main className="flex-grow p-4 md:p-6 md:ml-0 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
      <LegalDisclaimer />
    </div>
  );
};

export default Layout;