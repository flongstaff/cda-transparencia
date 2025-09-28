import React, { useState, useMemo } from 'react';
import {
  Menu,
  X,
  Eye,
  Shield,
  Globe
} from 'lucide-react';
import SidebarMenu from './SidebarMenu';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed by default

  // Memoize the sidebar menu to prevent unnecessary re-renders
  const sidebarMenu = useMemo(() => <SidebarMenu isExpanded={isExpanded} />, [isExpanded]);

  return (
    <>
      {/* Floating Sidebar Toggle Button - Logo Only */}
      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="fixed left-4 top-20 z-30 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
          aria-label="Abrir menú de navegación"
        >
          <Shield className="h-5 w-5" />
        </button>
      )}

      {/* Floating Overlay Sidebar - Only show when expanded */}
      {isExpanded && (
        <div
          className="fixed left-4 top-20 w-72 h-[calc(100vh-5rem)] bg-white dark:bg-dark-background border border-gray-200 dark:border-dark-border shadow-2xl rounded-2xl transition-all duration-300 z-50"
          role="complementary"
          aria-label="Menú de navegación principal"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white">Transparencia</h1>
                <div className="flex items-center text-blue-100 text-xs mt-0.5">
                  <Globe className="h-3 w-3 mr-1" />
                  <span>Carmen de Areco</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                aria-label="Contraer menú"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Municipality Info */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-dark-surface-alt border-b border-gray-200 dark:border-dark-border">
            <div className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
              Acceso ciudadano completo a la información financiera, administrativa y documental del gobierno municipal.
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] sidebar-nav p-4">
            {sidebarMenu}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-alt rounded-b-2xl">
            <div className="text-xs text-gray-500 dark:text-dark-text-tertiary text-center">
              <div className="mb-1">Última actualización: {new Date().toLocaleDateString('es-AR')}</div>
              <div className="flex items-center justify-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Sistema Activo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
