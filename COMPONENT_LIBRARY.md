th# UI Component Library

This document provides an overview of the new UI components created for the Carmen de Areco Transparency Portal.

## Components

### 1. FinancialHealthScoreCard

A card component that displays a financial health score with visual indicators.

**Props:**
- `score`: number (0-100) - The financial health score
- `title`: string - Title of the card
- `description`: string - Description of what the score represents
- `trend`: 'up' | 'down' | 'stable' (optional) - Trend indicator
- `changeValue`: string (optional) - Value to display for the trend
- `icon`: ReactNode (optional) - Icon to display in the card
- `className`: string (optional) - Additional CSS classes
- `onClick`: () => void (optional) - Click handler

**Usage:**
```tsx
import { FinancialHealthScoreCard } from '../components/ui';

<FinancialHealthScoreCard 
  score={85}
  title="Overall Financial Health"
  description="Based on budget execution, debt level, and cash flow"
  trend="up"
  changeValue="+5% from last year"
  icon={<BarChart3 className="w-8 h-8" />}
/>
```

### 2. EnhancedMetricCard

A metric card with icon, value, trend indicator, and timestamp.

**Props:**
- `title`: string - Title of the metric
- `value`: string - Value to display
- `description`: string - Description of the metric
- `icon`: ReactNode - Icon to display
- `trend`: { value: number; isPositive: boolean } (optional) - Trend information
- `updatedAt`: string (optional) - Timestamp of last update
- `priority`: 'primary' | 'secondary' | 'tertiary' (optional) - Priority level affecting size
- `className`: string (optional) - Additional CSS classes
- `onClick`: () => void (optional) - Click handler

**Usage:**
```tsx
import { EnhancedMetricCard } from '../components/ui';
import { PieChart } from 'lucide-react';

<EnhancedMetricCard
  title="Budget Execution"
  value="92%"
  description="Percentage of budget executed"
  icon={PieChart}
  trend={{ value: 12, isPositive: true }}
  updatedAt="Jan 15, 2025"
/>
```

### 3. DataVerificationBadge

A badge indicating data verification status.

**Props:**
- `status`: 'verified' | 'processing' | 'pending' | 'error' - Verification status
- `lastUpdated`: Date - Last update timestamp
- `source`: string - Data source
- `nextUpdate`: Date (optional) - Next scheduled update
- `className`: string (optional) - Additional CSS classes

**Usage:**
```tsx
import { DataVerificationBadge } from '../components/ui';

<DataVerificationBadge 
  status="verified"
  lastUpdated={new Date('2025-01-15')}
  source="Integrated System"
/>
```

### 4. TransparencyScore

A component showing transparency rating with star indicators.

**Props:**
- `score`: number - Current score
- `totalPossible`: number - Maximum possible score
- `description`: string - Description of the score
- `lastAudit`: Date - Date of last audit
- `className`: string (optional) - Additional CSS classes

**Usage:**
```tsx
import { TransparencyScore } from '../components/ui';

<TransparencyScore 
  score={92}
  totalPossible={100}
  description="Based on published documents and available data"
  lastAudit={new Date('2025-01-15')}
/>
```

### 5. FinancialCategoryNavigation

A horizontal navigation bar with category pills.

**Props:**
- `categories`: Array<{ id: string; name: string; description?: string; documentCount?: number; lastUpdated?: Date }> - Categories to display
- `activeCategory`: string (optional) - Currently active category
- `onCategoryChange`: (categoryId: string) => void (optional) - Handler for category changes
- `className`: string (optional) - Additional CSS classes

**Usage:**
```tsx
import { FinancialCategoryNavigation } from '../components/ui';

<FinancialCategoryNavigation 
  categories={[
    { id: 'all', name: 'All' },
    { id: 'budget', name: 'Budget', documentCount: 24, lastUpdated: new Date('2025-01-15') },
    { id: 'revenue', name: 'Revenue', documentCount: 18, lastUpdated: new Date('2025-01-10') }
  ]}
  activeCategory="all"
  onCategoryChange={(categoryId) => console.log('Category changed to:', categoryId)}
/>
```

## Accessibility

All components are designed with accessibility in mind:
- Proper ARIA attributes
- Keyboard navigation support
- Sufficient color contrast
- Semantic HTML structure
- Screen reader support

## Responsive Design

All components are responsive and adapt to different screen sizes:
- Mobile-first approach
- Flexible layouts
- Appropriate touch targets
- Adaptive typography

## Testing

Each component includes unit tests using React Testing Library to ensure proper functionality and accessibility.