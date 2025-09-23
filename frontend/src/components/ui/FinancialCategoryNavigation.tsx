import React, { useState } from 'react';
import { TrendingUp, TrendingDown, TrendingFlat } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  documentCount?: number;
  lastUpdated?: Date;
}

interface FinancialCategoryNavigationProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}

const FinancialCategoryNavigation: React.FC<FinancialCategoryNavigationProps> = ({
  categories,
  activeCategory = 'all',
  onCategoryChange,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  // Format date to human readable format
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  // Get trend icon
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    if (trend === 'stable') return <TrendingFlat className="w-4 h-4 text-gray-500" />;
    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex flex-col items-start px-4 py-3 rounded-lg border transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleCategoryChange(category.id)}
            role="tab"
            aria-selected={selectedCategory === category.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCategoryChange(category.id);
              }
            }}
          >
            <span className="font-medium text-sm">{category.name}</span>
            {category.documentCount !== undefined && (
              <span className="text-xs opacity-75 mt-1">
                {category.documentCount} documentos
              </span>
            )}
            {category.lastUpdated && (
              <span className="text-xs opacity-75">
                Actualizado: {formatDate(category.lastUpdated)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FinancialCategoryNavigation;