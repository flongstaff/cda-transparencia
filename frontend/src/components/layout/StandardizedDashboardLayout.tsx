import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Filter,
  Search,
  Download,
  Settings,
  Bell,
  User,
  Menu,
  X
} from 'lucide-react';
import StandardizedCard from './StandardizedCard';

interface StandardizedDashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onYearChange?: (year: number) => void;
  availableYears?: number[];
  selectedYear?: number;
  className?: string;
}

/**
 * Standardized Dashboard Layout Component
 * Provides consistent dashboard layout with header, filters, and actions
 */
const StandardizedDashboardLayout: React.FC<StandardizedDashboardLayoutProps> = ({
  title,
  subtitle,
  children,
  filters,
  actions,
  onYearChange,
  availableYears,
  selectedYear,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Default years if not provided
  const years = availableYears || Array.from(
    { length: 7 }, 
    (_, i) => new Date().getFullYear() - i
  ).reverse();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark-background ${className}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  type="button"
                  className="mr-3 p-2 rounded-md text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Year selector */}
                {onYearChange && (
                  <div className="hidden sm:block">
                    <label htmlFor="year-select" className="sr-only">Seleccionar año</label>
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={(e) => onYearChange(Number(e.target.value))}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year} {year === new Date().getFullYear() && '(Actual)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-md text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt">
                    <Bell className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-md text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-md text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt">
                    <User className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Secondary header with filters and actions */}
        {(filters || actions) && (
          <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {filters}
                  
                  {/* Mobile year selector */}
                  {onYearChange && (
                    <div className="sm:hidden">
                      <label htmlFor="mobile-year-select" className="sr-only">Seleccionar año</label>
                      <select
                        id="mobile-year-select"
                        value={selectedYear}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  {actions}
                  
                  <button className="p-2 rounded-md text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt">
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button className="p-2 rounded-md text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StandardizedDashboardLayout;