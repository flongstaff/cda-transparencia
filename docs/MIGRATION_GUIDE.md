# UI Component Migration Guide

This document provides detailed guidance for migrating from the existing UI components to the new enhanced components that follow the design specifications.

## 1. Component Migration Overview

### Before Migration
The existing implementation used generic card components with basic styling and limited interactivity.

### After Migration
The new implementation follows the design specifications in `KEY_UI_COMPONENTS_DESIGN.md` and provides:
- Consistent visual design with proper spacing, typography, and colors
- Enhanced accessibility features
- Improved interactivity with hover and focus states
- Responsive design for all screen sizes
- Proper ARIA attributes for screen readers

## 2. Step-by-Step Migration Instructions

### Step 1: Install Dependencies
Ensure all required dependencies are installed:
```bash
npm install lucide-react
```

### Step 2: Import New Components
Replace existing imports with the new UI components:

```tsx
// Before
import { FileText, CheckCircle, Shield, DollarSign } from 'lucide-react';

// After
import { 
  FinancialHealthScoreCard, 
  EnhancedMetricCard, 
  DataVerificationBadge, 
  TransparencyScore,
  FinancialCategoryNavigation
} from '../components/ui';
```

### Step 3: Replace Key Metrics Section
Replace the existing key metrics grid with the new components:

```tsx
// Before
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-white rounded-lg p-6 shadow-sm border">
    <div className="flex items-center">
      <div className="p-3 bg-blue-100 rounded-lg">
        <FileText className="h-6 w-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Documentos Totales</p>
        <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
      </div>
    </div>
  </div>
  {/* ... other metric cards */}
</div>

// After
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <FinancialHealthScoreCard 
    score={stats.transparency_score}
    title="Índice de Transparencia"
    className="lg:col-span-2"
  />

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
    <EnhancedMetricCard
      title="Documentos Totales"
      value={stats.documents.toString()}
      icon={FileText}
      trend={{ value: 12, isPositive: true }}
      updatedAt="Ene 15, 2025"
    />
    
    <EnhancedMetricCard
      title="Presupuesto {currentYear}"
      value={formatCurrency(stats.budget_total)}
      icon={DollarSign}
      trend={{ value: 8, isPositive: true }}
      updatedAt="Ene 15, 2025"
    />
  </div>
</div>
```

### Step 4: Add Financial Category Navigation
Add the new financial category navigation component:

```tsx
<FinancialCategoryNavigation 
  categories={[
    { id: 'all', name: 'All' },
    { id: 'budget', name: 'Budget' },
    { id: 'revenue', name: 'Revenue' },
    { id: 'expenses', name: 'Expenses' },
    { id: 'debt', name: 'Debt' },
    { id: 'investments', name: 'Investments' }
  ]}
  activeCategory="all"
  onCategoryChange={(categoryId) => console.log('Category changed to:', categoryId)}
  className="mb-6"
/>
```

### Step 5: Replace Individual Metric Cards
Replace individual metric cards with the EnhancedMetricCard component:

```tsx
// Before
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 transition-all hover:shadow-md">
  <div className="flex items-center justify-between mb-4">
    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
      <DollarSign className="w-4 h-4" />
    </div>
    <div className="text-sm font-medium text-green-600 dark:text-green-400">
      <TrendingUp className="w-4 h-4" />
    </div>
  </div>
  <div>
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      Presupuesto Total
    </p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {formatCurrencyARS(financialOverview?.totalBudget || 0)}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Presupuesto total asignado para el año, distribuido en diferentes categorías municipales.
    </p>
  </div>
</div>

// After
<EnhancedMetricCard
  title="Budget Execution"
  value="92%"
  icon={PieChart}
  trend={{ value: 12, isPositive: true }}
  updatedAt="Jan 15, 2025"
  onClick={() => console.log('Budget execution card clicked')}
/>
```

## 3. Component API Reference

### FinancialHealthScoreCard
```tsx
interface FinancialHealthScoreCardProps {
  score: number;           // Score value (0-100)
  title?: string;          // Card title (default: "Financial Health Score")
  onClick?: () => void;    // Click handler
  className?: string;      // Additional CSS classes
}
```

### EnhancedMetricCard
```tsx
interface EnhancedMetricCardProps {
  title: string;                    // Card title
  value: string;                    // Metric value
  icon: LucideIcon;                 // Icon component
  trend?: {                         // Trend indicator
    value: number;
    isPositive: boolean;
  };
  updatedAt?: string;               // Last updated timestamp
  onClick?: () => void;             // Click handler
  className?: string;               // Additional CSS classes
}
```

### DataVerificationBadge
```tsx
type VerificationStatus = 'verified' | 'processing' | 'pending';

interface DataVerificationBadgeProps {
  status: VerificationStatus;       // Verification status
  className?: string;               // Additional CSS classes
}
```

### TransparencyScore
```tsx
interface TransparencyScoreProps {
  score: number;                    // Score value (0-5)
  maxScore?: number;                // Maximum score (default: 5)
  documentCount: number;            // Number of documents
  onClick?: () => void;             // Click handler
  className?: string;               // Additional CSS classes
}
```

### FinancialCategoryNavigation
```tsx
interface FinancialCategoryNavigationProps {
  categories: {                     // Navigation categories
    id: string;
    name: string;
  }[];
  activeCategory: string;           // Active category ID
  onCategoryChange: (categoryId: string) => void; // Category change handler
  className?: string;               // Additional CSS classes
}
```

## 4. Styling and Customization

All components use Tailwind CSS classes and can be customized using the `className` prop:

```tsx
<FinancialHealthScoreCard 
  score={85}
  className="border-2 border-blue-500 shadow-lg"
/>
```

## 5. Accessibility Features

All components include:
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader-friendly labels
- Sufficient color contrast
- Focus indicators

## 6. Responsive Design

All components are designed to be responsive:
- Mobile-first approach
- Flexible grid layouts
- Appropriate sizing for different screen sizes
- Touch-friendly targets

## 7. Performance Considerations

- Components use React.memo for optimized rendering
- Minimal DOM structure
- Efficient CSS with Tailwind classes
- Lazy loading support for complex visualizations