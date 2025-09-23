# UI Components Documentation

This documentation provides an overview of the new UI components created for the Carmen de Areco Transparency Portal.

## Overview

The following UI components have been implemented to enhance the user experience and make financial data more approachable for citizens:

1. `FinancialHealthScoreCard` - Displays a financial health score with visual indicators
2. `EnhancedMetricCard` - Shows key metrics with trend indicators and descriptions
3. `DataVerificationBadge` - Indicates data verification status
4. `TransparencyScore` - Displays transparency rating with star indicators
5. `FinancialCategoryNavigation` - Horizontal navigation for financial categories

## Component Details

### FinancialHealthScoreCard

Displays a financial health score with visual representation including:
- Score visualization with color coding (green for excellent, yellow for good, orange for fair, red for poor)
- Progress bar showing the score percentage
- Trend indicators (up/down arrows)
- Clickable interface with keyboard support
- Responsive design for all screen sizes

**Props:**
- `score`: number (0-100) - The financial health score
- `title`: string - Title of the card
- `description`: string - Description of what the score represents
- `trend`: 'up' | 'down' | 'stable' (optional) - Trend indicator
- `changeValue`: string (optional) - Value to display for the trend
- `icon`: ReactNode (optional) - Icon to display in the card
- `className`: string (optional) - Additional CSS classes
- `onClick`: () => void (optional) - Click handler

### EnhancedMetricCard

Shows a key metric with:
- Icon support for visual recognition
- Value display with trend indicators
- Description and timestamp information
- Three priority levels (primary, secondary, tertiary) affecting size and prominence
- Hover effects and keyboard navigation support

**Props:**
- `title`: string - Title of the metric
- `value`: string - Value to display
- `description`: string - Description of the metric
- `icon`: ReactNode - Icon to display
- `trend`: { value: number; isPositive: boolean } (optional) - Trend information
- `updatedAt`: string (optional) - Timestamp of last update
- `priority`: 'primary' | 'secondary' | 'tertiary' (optional) - Priority level
- `className`: string (optional) - Additional CSS classes
- `onClick`: () => void (optional) - Click handler

### DataVerificationBadge

Shows data verification status:
- Four statuses: verified, processing, pending, error
- Color-coded indicators for each status
- Last updated timestamp
- Source attribution

**Props:**
- `status`: 'verified' | 'processing' | 'pending' | 'error' - Verification status
- `lastUpdated`: Date - Last update timestamp
- `source`: string - Data source
- `nextUpdate`: Date (optional) - Next scheduled update
- `className`: string (optional) - Additional CSS classes

### TransparencyScore

Displays transparency rating with star indicators:
- Star-based rating system (0-5 stars)
- Percentage score display
- Last audit date
- Progress bar visualization

**Props:**
- `score`: number - Current score
- `totalPossible`: number - Maximum possible score
- `description`: string - Description of the score
- `lastAudit`: Date - Date of last audit
- `className`: string (optional) - Additional CSS classes

### FinancialCategoryNavigation

Horizontal navigation bar with category pills:
- Support for multiple categories with document counts
- Last updated timestamps for each category
- Active category highlighting
- Responsive design that adapts to screen sizes

**Props:**
- `categories`: Array<{ id: string; name: string; documentCount?: number; lastUpdated?: Date }> - Categories to display
- `activeCategory`: string (optional) - Currently active category
- `onCategoryChange`: (categoryId: string) => void (optional) - Handler for category changes
- `className`: string (optional) - Additional CSS classes

## Implementation Notes

All components were implemented with:
- TypeScript for type safety
- Tailwind CSS for consistent styling
- Lucide React icons for visual elements
- Framer Motion for smooth animations
- React Hooks for state management
- Jest and React Testing Library for unit tests

## Accessibility Features

All components include:
- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Sufficient color contrast ratios
- Semantic HTML structure
- Focus indicators for interactive elements

## Responsive Design

All components are responsive and adapt to different screen sizes:
- Mobile-first approach with adaptive layouts
- Flexible grid systems that work on all screen sizes
- Appropriate touch targets for mobile devices
- Progressive disclosure of information

## Performance Optimization

Components were optimized for performance:
- Efficient rendering with React.memo
- Proper event handling and state management
- Lazy loading for non-critical components
- Optimized SVG rendering

## Usage Examples

```tsx
import { 
  FinancialHealthScoreCard, 
  EnhancedMetricCard, 
  DataVerificationBadge, 
  TransparencyScore,
  FinancialCategoryNavigation
} from '../components/ui';

// Financial Health Score Card
<FinancialHealthScoreCard 
  score={85}
  title="Salud Financiera General"
  description="Basado en ejecución presupuestaria, nivel de deuda y flujo de caja"
  trend="up"
  changeValue="+5% desde el año anterior"
/>

// Enhanced Metric Card
<EnhancedMetricCard
  title="Ejecución Presupuestaria"
  value="92%"
  description="Porcentaje del presupuesto ejecutado"
  icon={<PieChart />}
  trend={{ value: 12, isPositive: true }}
  updatedAt="Ene 15, 2025"
/>

// Data Verification Badge
<DataVerificationBadge 
  status="verified"
  lastUpdated={new Date('2025-01-15')}
  source="Sistema Integrado"
/>

// Transparency Score
<TransparencyScore 
  score={92}
  totalPossible={100}
  description="Basado en documentos publicados y datos disponibles"
  lastAudit={new Date('2025-01-15')}
/>

// Financial Category Navigation
<FinancialCategoryNavigation 
  categories={[
    { id: 'all', name: 'Todos' },
    { id: 'budget', name: 'Presupuesto', documentCount: 24, lastUpdated: new Date('2025-01-15') },
    { id: 'revenue', name: 'Ingresos', documentCount: 18, lastUpdated: new Date('2025-01-10') }
  ]}
  activeCategory="all"
  onCategoryChange={(categoryId) => console.log('Category changed to:', categoryId)}
/>
```

## Testing

Unit tests were created for all components ensuring:
- Proper rendering with different props
- Event handling (click, hover, keyboard)
- Accessibility compliance
- Responsive behavior
- Error handling

## Future Enhancements

Potential future enhancements include:
- Additional chart types for financial visualization
- More detailed tooltips and explanations
- Enhanced data export functionality
- Additional internationalization support
- Performance monitoring and analytics

## Conclusion

These new UI components provide a solid foundation for the Carmen de Areco Transparency Portal with a focus on:
1. Making financial data approachable for average citizens
2. Building trust through transparency indicators
3. Ensuring accessibility for all users
4. Providing a responsive experience across devices
5. Maintaining performance standards