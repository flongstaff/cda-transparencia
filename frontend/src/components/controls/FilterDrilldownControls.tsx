/**
 * Filter and Drilldown Controls Component
 * Provides UI controls for filtering, sorting, and drilling down into data
 */

import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  Building, 
  CreditCard, 
  FileText, 
  Eye, 
  Download, 
  Share2, 
  Settings, 
  Sliders 
} from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string | number | boolean;
  type: 'checkbox' | 'radio' | 'select' | 'range';
  options?: Array<{ value: string | number; label: string }>;
  min?: number;
  max?: number;
}

interface FilterDrilldownControlsProps {
  filters: FilterOption[];
  onFilterChange: (filterId: string, value: any) => void;
  onResetFilters: () => void;
  onExport?: () => void;
  onViewChange?: (view: 'table' | 'chart' | 'cards') => void;
  currentView?: 'table' | 'chart' | 'cards';
  showAnomaliesOnly?: boolean;
  onToggleAnomalies?: () => void;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enableExport?: boolean;
  enableViewToggle?: boolean;
  enableAnomalyToggle?: boolean;
  className?: string;
}

const FilterDrilldownControls: React.FC<FilterDrilldownControlsProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExport,
  onViewChange,
  currentView = 'table',
  showAnomaliesOnly = false,
  onToggleAnomalies,
  searchPlaceholder = "Buscar...",
  enableSearch = true,
  enableExport = true,
  enableViewToggle = true,
  enableAnomalyToggle = true,
  className = ''
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would trigger a search
    console.log('Searching for:', searchTerm);
  };

  // Render filter controls based on type
  const renderFilterControl = (filter: FilterOption) => {
    switch (filter.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              {filter.label}
            </label>
            <div className="space-y-2">
              {filter.options?.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`${filter.id}-${option.value}`}
                    type="checkbox"
                    checked={filter.value === option.value}
                    onChange={() => onFilterChange(filter.id, option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-dark-surface dark:border-dark-border"
                  />
                  <label
                    htmlFor={`${filter.id}-${option.value}`}
                    className="ml-3 block text-sm text-gray-700 dark:text-dark-text-secondary"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              {filter.label}
            </label>
            <div className="space-y-2">
              {filter.options?.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`${filter.id}-${option.value}`}
                    type="radio"
                    checked={filter.value === option.value}
                    onChange={() => onFilterChange(filter.id, option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-dark-surface dark:border-dark-border"
                  />
                  <label
                    htmlFor={`${filter.id}-${option.value}`}
                    className="ml-3 block text-sm text-gray-700 dark:text-dark-text-secondary"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label htmlFor={filter.id} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              {filter.label}
            </label>
            <select
              id={filter.id}
              value={filter.value as string}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-dark-surface dark:border-dark-border dark:text-dark-text-primary"
            >
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              {filter.label}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                value={filter.value as number}
                onChange={(e) => onFilterChange(filter.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-dark-surface-alt"
              />
              <span className="text-sm text-gray-600 dark:text-dark-text-tertiary min-w-[40px]">
                {filter.value}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-dark-text-tertiary">
              <span>{filter.min}</span>
              <span>{filter.max}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6 ${className}`}>
      {/* Search and Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {enableSearch && (
          <div className="flex-1 max-w-lg">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-secondary" />
                </button>
              )}
            </form>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          {enableViewToggle && (
            <div className="flex items-center bg-gray-100 dark:bg-dark-surface-alt rounded-lg p-1">
              {(['table', 'chart', 'cards'] as const).map((view) => {
                const isActive = currentView === view;
                const icons = {
                  table: <FileText className="h-4 w-4" />,
                  chart: <BarChart3 className="h-4 w-4" />,
                  cards: <CreditCard className="h-4 w-4" />
                };

                return (
                  <button
                    key={view}
                    onClick={() => onViewChange?.(view)}
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-dark-surface text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary'
                    }`}
                  >
                    <span className="mr-1">{icons[view]}</span>
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Anomaly Toggle */}
          {enableAnomalyToggle && onToggleAnomalies && (
            <button
              onClick={onToggleAnomalies}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showAnomaliesOnly
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
                  : 'bg-gray-100 dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface border border-gray-200 dark:border-dark-border'
              }`}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Solo anomalías
            </button>
          )}

          {/* Export Button */}
          {enableExport && onExport && (
            <button
              onClick={onExport}
              className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-surface-alt rounded-lg hover:bg-gray-200 dark:hover:bg-dark-surface border border-gray-200 dark:border-dark-border transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </button>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-surface-alt rounded-lg hover:bg-gray-200 dark:hover:bg-dark-surface border border-gray-200 dark:border-dark-border transition-colors"
          >
            <Sliders className="h-4 w-4 mr-1" />
            Filtros
            {isFiltersOpen ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-600 dark:text-dark-text-tertiary">Filtros aplicados:</span>
        {filters.filter(f => f.value !== undefined && f.value !== '').length > 0 ? (
          filters
            .filter(f => f.value !== undefined && f.value !== '')
            .map(filter => (
              <span
                key={filter.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
              >
                {filter.label}: {filter.value.toString()}
                <button
                  onClick={() => onFilterChange(filter.id, '')}
                  className="ml-1 inline-flex items-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
        ) : (
          <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">Ninguno</span>
        )}
        
        {filters.filter(f => f.value !== undefined && f.value !== '').length > 0 && (
          <button
            onClick={onResetFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar todos
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="border-t border-gray-200 dark:border-dark-border pt-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-1">
                {renderFilterControl(filter)}
              </div>
            ))}
            
            <div className="flex items-end">
              <button
                onClick={onResetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-surface-alt rounded-lg hover:bg-gray-200 dark:hover:bg-dark-surface border border-gray-200 dark:border-dark-border transition-colors"
              >
                Restablecer filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDrilldownControls;