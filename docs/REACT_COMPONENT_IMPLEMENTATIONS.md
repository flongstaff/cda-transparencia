# React Component Implementation Examples

This document provides code examples for implementing the key UI components in React with TypeScript, following the design specifications.

## 1. Financial Health Score Card

```tsx
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface FinancialHealthScoreCardProps {
  score: number;
  title?: string;
  onClick?: () => void;
}

const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = ({ 
  score, 
  title = "Financial Health Score",
  onClick 
}) => {
  // Determine status and color based on score
  const getStatus = () => {
    if (score >= 85) return { text: "Excellent Financial Health", color: "text-green-500", bg: "bg-green-500" };
    if (score >= 70) return { text: "Good Financial Health", color: "text-orange-500", bg: "bg-orange-500" };
    return { text: "Needs Attention", color: "text-red-500", bg: "bg-red-500" };
  };

  const { text, color, bg } = getStatus();
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">{title}</h3>
      
      <div className="flex items-center justify-between">
        <div className="relative">
          <svg className="w-20 h-20" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 dark:text-gray-600"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={color.replace('text-', 'text-')}
              strokeWidth="8"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-900 dark:text-white">
            {score}%
          </span>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{score}</div>
          <div className={`text-sm font-medium ${color} flex items-center`}>
            {score >= 85 && <CheckCircle className="w-4 h-4 mr-1" />}
            {score >= 70 && score < 85 && <AlertTriangle className="w-4 h-4 mr-1" />}
            {score < 70 && <XCircle className="w-4 h-4 mr-1" />}
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthScoreCard;
```

## 2. Enhanced Metric Card

```tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EnhancedMetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  updatedAt?: string;
  onClick?: () => void;
}

const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon,
  trend,
  updatedAt,
  onClick
}) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex items-center mb-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      
      {trend && (
        <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="mx-2">•</span>
          <span>from last period</span>
        </div>
      )}
      
      {updatedAt && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Last updated: {updatedAt}
        </div>
      )}
    </div>
  );
};

export default EnhancedMetricCard;
```

## 3. Data Verification Badge

```tsx
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

type VerificationStatus = 'verified' | 'processing' | 'pending';

interface DataVerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const DataVerificationBadge: React.FC<DataVerificationBadgeProps> = ({ 
  status,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          text: 'Verified',
          icon: CheckCircle,
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-500 dark:border-green-400',
          textColor: 'text-green-800 dark:text-green-400',
          iconColor: 'text-green-500'
        };
      case 'processing':
        return {
          text: 'Processing',
          icon: Clock,
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          borderColor: 'border-orange-500 dark:border-orange-400',
          textColor: 'text-orange-800 dark:text-orange-400',
          iconColor: 'text-orange-500'
        };
      case 'pending':
        return {
          text: 'Pending',
          icon: AlertCircle,
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          borderColor: 'border-gray-500 dark:border-gray-400',
          textColor: 'text-gray-800 dark:text-gray-400',
          iconColor: 'text-gray-500'
        };
      default:
        return {
          text: 'Unknown',
          icon: AlertCircle,
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          borderColor: 'border-gray-500 dark:border-gray-400',
          textColor: 'text-gray-800 dark:text-gray-400',
          iconColor: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${config.bgColor} ${config.borderColor} border ${config.textColor}
      ${className}
    `}>
      <IconComponent className={`w-3 h-3 mr-1 ${config.iconColor}`} />
      {config.text}
    </span>
  );
};

export default DataVerificationBadge;
```

## 4. Transparency Score

```tsx
import React from 'react';
import { Star } from 'lucide-react';

interface TransparencyScoreProps {
  score: number;
  maxScore?: number;
  documentCount: number;
  onClick?: () => void;
}

const TransparencyScore: React.FC<TransparencyScoreProps> = ({ 
  score, 
  maxScore = 5,
  documentCount,
  onClick
}) => {
  // Create array of stars
  const stars = Array.from({ length: maxScore }, (_, i) => i + 1);
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 transition-all hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
        Transparency Score
      </div>
      
      <div className="flex items-center mb-1">
        <div className="flex">
          {stars.map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= score 
                  ? 'fill-orange-500 text-orange-500' 
                  : 'fill-none text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="ml-2 text-sm font-bold text-gray-900 dark:text-white">
          {score.toFixed(1)}/{maxScore}
        </span>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Based on {documentCount} documents
      </div>
    </div>
  );
};

export default TransparencyScore;
```

## 5. Financial Category Navigation

```tsx
import React, { useState } from 'react';

interface FinancialCategoryNavigationProps {
  categories: {
    id: string;
    name: string;
  }[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const FinancialCategoryNavigation: React.FC<FinancialCategoryNavigationProps> = ({ 
  categories, 
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex overflow-x-auto py-3 px-4 -mx-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`
              flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full mr-2 whitespace-nowrap
              ${activeCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }
            `}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FinancialCategoryNavigation;
```

## Usage Examples

### Using the Financial Health Score Card

```tsx
import FinancialHealthScoreCard from './components/FinancialHealthScoreCard';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FinancialHealthScoreCard 
        score={85} 
        title="Overall Financial Health"
        onClick={() => console.log('Navigate to financial health report')}
      />
      {/* Other cards */}
    </div>
  );
};
```

### Using the Enhanced Metric Cards

```tsx
import EnhancedMetricCard from './components/EnhancedMetricCard';
import { PieChart, Coins, CreditCard } from 'lucide-react';

const MetricsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <EnhancedMetricCard
        title="Budget Execution"
        value="92%"
        icon={PieChart}
        trend={{ value: 12, isPositive: true }}
        updatedAt="Jan 15, 2025"
        onClick={() => console.log('Navigate to budget execution details')}
      />
      
      <EnhancedMetricCard
        title="Revenue Collection"
        value="$12.4M"
        icon={Coins}
        trend={{ value: 8, isPositive: true }}
        updatedAt="Jan 15, 2025"
        onClick={() => console.log('Navigate to revenue details')}
      />
      
      <EnhancedMetricCard
        title="Debt Ratio"
        value="18.5%"
        icon={CreditCard}
        trend={{ value: 3, isPositive: false }}
        updatedAt="Jan 15, 2025"
        onClick={() => console.log('Navigate to debt details')}
      />
    </div>
  );
};
```

### Using the Data Verification Badge

```tsx
import DataVerificationBadge from './components/DataVerificationBadge';

const DocumentCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900 dark:text-white">Annual Budget Report</h3>
        <DataVerificationBadge status="verified" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Comprehensive breakdown of the annual budget
      </p>
    </div>
  );
};
```

### Using the Transparency Score

```tsx
import TransparencyScore from './components/TransparencyScore';

const HeaderSection = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carmen de Areco Transparency Portal</h1>
        <p className="text-gray-600 dark:text-gray-400">Financial data and documents for the municipality</p>
      </div>
      <TransparencyScore 
        score={4.2} 
        documentCount={24}
        onClick={() => console.log('Show transparency details')}
      />
    </div>
  );
};
```

### Using the Financial Category Navigation

```tsx
import FinancialCategoryNavigation from './components/FinancialCategoryNavigation';
import { useState } from 'react';

const FinancialDashboard = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'budget', name: 'Budget' },
    { id: 'revenue', name: 'Revenue' },
    { id: 'expenses', name: 'Expenses' },
    { id: 'debt', name: 'Debt' },
    { id: 'investments', name: 'Investments' }
  ];
  
  return (
    <div>
      <FinancialCategoryNavigation 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <div className="mt-6">
        {/* Content based on activeCategory */}
        <p>Showing content for: {categories.find(c => c.id === activeCategory)?.name}</p>
      </div>
    </div>
  );
};
```

These implementations follow React best practices, are fully typed with TypeScript, and include accessibility features. They also match the design specifications with appropriate styling using Tailwind CSS classes.