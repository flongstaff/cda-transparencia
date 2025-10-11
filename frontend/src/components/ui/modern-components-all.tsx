import React, { useState, useEffect } from 'react';
import { 
  ModernTabs, 
  ModernTabsList, 
  ModernTabsTrigger, 
  ModernTabsContent, 
  ModernCard, 
  ModernStatCard, 
  ModernChartContainer 
} from './modern-components';

// Modern Data Table Component
interface DataTableColumn<T> {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
  className?: string;
}

interface ModernDataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  title?: string;
  description?: string;
  className?: string;
  onRowClick?: (record: T) => void;
}

export function ModernDataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  title, 
  description,
  className = '',
  onRowClick 
}: ModernDataTableProps<T>) {
  return (
    <ModernCard title={title} description={description} className={className}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  scope="col" 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(record)}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(record[column.key], record) 
                      : String(record[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModernCard>
  );
}

// Modern Search and Filter Component
interface ModernSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    key: string;
  }[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModernSearchFilter({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  activeFilters,
  onFilterChange,
  placeholder = 'Buscar...',
  className = '' 
}: ModernSearchFilterProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}>
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={activeFilters[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">{filter.label}</option>
              {filter.value.split(',').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className = '', 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 } 
}: ResponsiveGridProps) {
  const colClasses = [
    `grid-cols-${cols.sm || 1}`,
    `md:grid-cols-${cols.md || 2}`,
    `lg:grid-cols-${cols.lg || 3}`,
    `xl:grid-cols-${cols.xl || 4}`
  ].join(' ');

  return (
    <div className={`grid ${colClasses} gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Modern Accordion Component
interface AccordionItem {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface ModernAccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function ModernAccordion({ items, className = '' }: ModernAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleAccordion(index)}
            className={`w-full px-6 py-4 text-left flex items-center justify-between ${openIndex === index ? 'bg-blue-50' : 'bg-white'}`}
          >
            <div className="flex items-center">
              {item.icon && <span className="mr-3">{item.icon}</span>}
              <span className="font-medium text-gray-900">{item.title}</span>
            </div>
            <svg 
              className={`h-5 w-5 text-gray-500 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Modern Loading Spinner
interface ModernSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function ModernSpinner({ size = 'md', color = 'blue', className = '' }: ModernSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        className={`${sizeClasses[size]} animate-spin text-${color}-600`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

// Modern Empty State Component
interface ModernEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

export function ModernEmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  className = '' 
}: ModernEmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mx-auto h-12 w-12 text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
      {action && (
        <div className="mt-6">
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {action.text}
          </button>
        </div>
      )}
    </div>
  );
}

// Export everything
export {
  ModernTabs,
  ModernTabsList,
  ModernTabsTrigger,
  ModernTabsContent,
  ModernCard,
  ModernStatCard,
  ModernChartContainer
};