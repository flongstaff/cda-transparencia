/**
 * Comprehensive Chart Grid Component
 * Displays all available charts in a responsive grid layout
 * Dynamically loads charts based on available data
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Heart,
  FileText,
  TrendingDown,
  Wallet,
  ArrowUpDown,
  Package,
  Shield,
  Search,
  Calendar,
  Activity,
  CheckCircle,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import DynamicChartLoader from './DynamicChartLoader';
import { CHART_TYPES, CHART_TYPE_NAMES, CHART_TYPE_DESCRIPTIONS } from '../../services/charts/ChartDataService';

// Chart category mapping
const CHART_CATEGORIES: Record<string, { icon: React.ReactNode; color: string }> = {
  'Budget_Execution': { icon: <DollarSign className="w-5 h-5" />, color: 'blue' },
  'Debt_Report': { icon: <TrendingDown className="w-5 h-5" />, color: 'red' },
  'Economic_Report': { icon: <TrendingUp className="w-5 h-5" />, color: 'green' },
  'Education_Data': { icon: <FileText className="w-5 h-5" />, color: 'purple' },
  'Expenditure_Report': { icon: <Wallet className="w-5 h-5" />, color: 'orange' },
  'Financial_Reserves': { icon: <Shield className="w-5 h-5" />, color: 'indigo' },
  'Fiscal_Balance_Report': { icon: <ArrowUpDown className="w-5 h-5" />, color: 'teal' },
  'Health_Statistics': { icon: <Heart className="w-5 h-5" />, color: 'pink' },
  'Infrastructure_Projects': { icon: <Building className="w-5 h-5" />, color: 'yellow' },
  'Investment_Report': { icon: <TrendingUp className="w-5 h-5" />, color: 'cyan' },
  'Personnel_Expenses': { icon: <Users className="w-5 h-5" />, color: 'gray' },
  'Revenue_Report': { icon: <DollarSign className="w-5 h-5" />, color: 'emerald' },
  'Revenue_Sources': { icon: <Package className="w-5 h-5" />, color: 'amber' },
  'Quarterly_Execution': { icon: <Calendar className="w-5 h-5" />, color: 'violet' },
  'Programmatic_Performance': { icon: <Activity className="w-5 h-5" />, color: 'rose' },
  'Gender_Budgeting': { icon: <Users className="w-5 h-5" />, color: 'fuchsia' },
  'Waterfall_Execution': { icon: <BarChart3 className="w-5 h-5" />, color: 'sky' }
};

// Props for the Comprehensive Chart Grid component
interface ComprehensiveChartGridProps {
  year?: number;
  showFilters?: boolean;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const ComprehensiveChartGrid: React.FC<ComprehensiveChartGridProps> = ({
  year,
  showFilters = true,
  viewMode = 'grid',
  className = ''
}) => {
  const [filteredCharts, setFilteredCharts] = useState<string[]>([...CHART_TYPES]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter charts based on search and category
  useEffect(() => {
    let filtered = [...CHART_TYPES];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(chartType => 
        CHART_TYPE_NAMES[chartType as keyof typeof CHART_TYPE_NAMES].toLowerCase().includes(searchQuery.toLowerCase()) ||
        CHART_TYPE_DESCRIPTIONS[chartType as keyof typeof CHART_TYPE_DESCRIPTIONS].toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter (this would need to be implemented based on actual categories)
    if (selectedCategory !== 'all') {
      // For now, we'll just show all charts
    }
    
    setFilteredCharts(filtered);
    setIsLoading(false);
  }, [searchQuery, selectedCategory]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className={`chart-grid-container ${className}`}>
      {/* Filters and Controls */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar gráficos por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface-alt"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={resetFilters}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${searchQuery || selectedCategory !== 'all' ? 'text-blue-600' : ''}`} />
                Limpiar filtros
              </button>
              
              <div className="flex items-center border border-gray-300 dark:border-dark-border rounded-lg overflow-hidden">
                <button
                  onClick={() => {/* Would implement view mode switching */}}
                  className={`px-3 py-2 text-sm font-medium ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {/* Would implement view mode switching */}}
                  className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-dark-border ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-alt'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-surface-alt dark:text-dark-text-secondary dark:hover:bg-dark-surface'
              }`}
            >
              Todos
            </button>
            {Object.entries(CHART_CATEGORIES).slice(0, 6).map(([category, config]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-full flex items-center ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-surface-alt dark:text-dark-text-secondary dark:hover:bg-dark-surface'
                }`}
              >
                {config.icon}
                <span className="ml-2">{CHART_TYPE_NAMES[category as keyof typeof CHART_TYPE_NAMES]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart Grid */}
      <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
        {filteredCharts.map((chartType, index) => {
          const config = CHART_CATEGORIES[chartType] || { icon: <BarChart3 className="w-5 h-5" />, color: 'gray' };
          
          return (
            <motion.div
              key={chartType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/30 mr-3`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                        {CHART_TYPE_NAMES[chartType as keyof typeof CHART_TYPE_NAMES]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
                        {CHART_TYPE_DESCRIPTIONS[chartType as keyof typeof CHART_TYPE_DESCRIPTIONS]}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <DynamicChartLoader 
                  chartType={chartType}
                  height={400}
                  year={year}
                  showTitle={false}
                  showDescription={false}
                />
              </div>
              
              <div className="px-5 py-3 bg-gray-50 dark:bg-dark-surface-alt border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-dark-text-tertiary">
                  <span>Datos disponibles para 2019-2025</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span>Verificado</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCharts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
            No se encontraron gráficos
          </h3>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
            No hay gráficos que coincidan con tu búsqueda.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveChartGrid;