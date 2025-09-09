# BudgetAnalysisChartEnhanced

A production-ready, highly optimized React component for municipal budget analysis with comprehensive features for performance, accessibility, internationalization, and monitoring.

## 🚀 Features

### Performance Optimizations
- **Memoization**: Uses `useMemo` and `React.memo` for optimal re-rendering
- **Caching**: Local storage cache with TTL (10 minutes default)
- **Debounced Updates**: 500ms debounce on year changes
- **Skeleton Loading**: Professional loading UI
- **Bundle Optimization**: Code splitting ready

### Reliability & Error Handling
- **Retry Logic**: Exponential backoff with configurable attempts
- **Timeout Management**: Configurable request timeouts
- **Offline Support**: Automatic offline detection with cached fallbacks
- **Network Status**: Real-time online/offline status monitoring
- **Graceful Degradation**: Fallback data when validation fails

### Internationalization (i18n)
- **Multi-language**: Spanish/English with extensible translations
- **Dynamic Locale**: Runtime language switching
- **Number Formatting**: Locale-aware currency formatting
- **Date Formatting**: Localized date/time display

### Schema Validation
- **Zod Schemas**: Runtime data validation with detailed error messages
- **Type Safety**: Full TypeScript support with inferred types
- **Business Rules**: Custom validation for budget consistency
- **Data Sanitization**: Clean invalid data with fallbacks

### Accessibility (a11y)
- **ARIA Labels**: Comprehensive screen reader support
- **Live Regions**: Dynamic content announcements
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Dark mode support
- **Focus Management**: Proper focus handling

### Monitoring & Analytics
- **Performance Logging**: Automatic timing measurements
- **Health Checks**: System health monitoring
- **Error Tracking**: Comprehensive error reporting
- **User Metrics**: Usage analytics ready

## 📦 Installation

```bash
npm install zod react-i18next framer-motion lucide-react
```

## 🔧 Usage

### Basic Usage

```tsx
import BudgetAnalysisChart from './components/charts/BudgetAnalysisChartEnhanced';

function App() {
  return (
    <BudgetAnalysisChart
      year={2024}
      locale="es"
      theme="light"
    />
  );
}
```

### Advanced Configuration

```tsx
import BudgetAnalysisChart from './components/charts/BudgetAnalysisChartEnhanced';

function AdvancedApp() {
  const handleDataLoad = (data) => {
    console.log('Data loaded:', data);
  };

  const handleError = (error) => {
    // Send to error tracking service
    analytics.track('chart_error', { error });
  };

  return (
    <BudgetAnalysisChart
      year={2024}
      locale="es"
      theme="light"
      enableCaching={true}
      retryAttempts={3}
      timeout={15000}
      onDataLoad={handleDataLoad}
      onError={handleError}
    />
  );
}
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `year` | `number` | Required | Budget year to analyze |
| `locale` | `string` | `'es'` | Language locale ('es' or 'en') |
| `theme` | `'light' \| 'dark'` | `'light'` | Visual theme |
| `enableCaching` | `boolean` | `true` | Enable local storage caching |
| `retryAttempts` | `number` | `3` | Number of retry attempts on failure |
| `timeout` | `number` | `15000` | Request timeout in milliseconds |
| `onDataLoad` | `(data: BudgetItem[]) => void` | Optional | Callback when data loads successfully |
| `onError` | `(error: string) => void` | Optional | Callback when errors occur |

## 📊 Data Structure

### Input Data (BudgetData)
```typescript
interface BudgetData {
  total_budgeted: number;
  total_executed: number;
  execution_rate: string | number;
  categories?: Record<string, {
    budgeted: number;
    executed: number;
    execution_rate: string | number;
  }>;
}
```

### Processed Chart Data (BudgetItem)
```typescript
interface BudgetItem {
  name: string;
  value: number;
  budgeted?: number;
  executed?: number;
  source?: string;
  category?: string;
  efficiency?: number;
  trend?: 'up' | 'down' | 'stable';
}
```

## 🌐 Internationalization

### Adding New Languages

1. Create translation file in `src/i18n/budget.json`:
```json
{
  "fr": {
    "budget": {
      "title": "Analyse Budgétaire {{year}}",
      "loading": "Chargement...",
      // ... more translations
    }
  }
}
```

2. Use the new locale:
```tsx
<BudgetAnalysisChart year={2024} locale="fr" />
```

## 🔍 Schema Validation

The component uses Zod schemas for runtime validation:

```typescript
// Budget data validation
const BudgetDataSchema = z.object({
  total_budgeted: z.number().min(0),
  total_executed: z.number().min(0),
  execution_rate: z.union([z.string(), z.number()]),
  categories: z.record(z.object({
    budgeted: z.number().min(0),
    executed: z.number().min(0),
    execution_rate: z.union([z.string(), z.number()])
  })).optional()
});
```

## 🎨 Styling

The component supports theming through CSS classes:

```css
.theme-light {
  --chart-bg: #ffffff;
  --chart-text: #1f2937;
  --chart-border: #e5e7eb;
}

.theme-dark {
  --chart-bg: #1f2937;
  --chart-text: #f9fafb;
  --chart-border: #374151;
}
```

## 📈 Performance Monitoring

### Built-in Performance Logging

The component automatically logs performance metrics:

```typescript
// Performance monitoring example
const logPerformance = (operation: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`🚀 BudgetChart: ${operation} took ${duration.toFixed(2)}ms`);
  
  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    analytics.track('chart_performance', { operation, duration });
  }
};
```

### Health Checks

The component performs automatic health checks:

```typescript
const healthCheck = useCallback(async () => {
  try {
    const health = await consolidatedApiService.getSystemHealth();
    return health.status === 'success';
  } catch {
    return false;
  }
}, []);
```

## 🚨 Error Handling

### Error Types Handled

1. **Network Errors**: Connection timeouts, DNS failures
2. **Validation Errors**: Invalid data structure
3. **Timeout Errors**: Request exceeded timeout limit
4. **Abort Errors**: Request cancelled by user
5. **Offline Errors**: No internet connection

### Error Recovery Strategies

1. **Retry with Backoff**: Exponential retry delays
2. **Cache Fallback**: Use locally cached data
3. **Graceful Degradation**: Show partial data or safe defaults
4. **User Feedback**: Clear error messages with retry options

## ♿ Accessibility Features

### WCAG 2.1 Compliance

- **Level A**: Basic accessibility requirements met
- **Level AA**: Enhanced accessibility (target compliance)
- **Screen Reader**: Full NVDA/JAWS/VoiceOver support
- **Keyboard Navigation**: Tab order and focus management
- **Color Contrast**: Meets 4.5:1 contrast ratio

### ARIA Implementation

```tsx
// Example ARIA usage in the component
<div
  role="img"
  aria-label={t('budget.chartAriaLabel', 'Budget analysis chart for year {{year}}', { year })}
  aria-live="polite"
>
  <UniversalChart />
</div>
```

## 🔄 Caching Strategy

### Cache Implementation

```typescript
interface CacheConfig {
  duration: number;    // 10 minutes TTL
  storage: 'localStorage';
  keyPrefix: 'budget_';
  compression: boolean; // Future: LZ-string compression
}

// Cache key format: budget_{year}_{locale}
const cacheKey = `budget_${year}_${locale}`;
```

### Cache Invalidation

- **Time-based**: 10-minute TTL
- **Version-based**: API version changes
- **User-initiated**: Refresh button
- **Network-based**: Online status changes

## 📊 Analytics & Monitoring

### Tracked Events

```typescript
// Performance metrics
analytics.track('chart_performance', {
  operation: 'data_fetch',
  duration: 1250,
  year: 2024,
  cacheHit: false
});

// Error tracking
analytics.track('chart_error', {
  errorType: 'validation_error',
  year: 2024,
  retryCount: 2
});

// User interactions
analytics.track('chart_interaction', {
  action: 'retry_clicked',
  year: 2024,
  errorState: 'timeout'
});
```

## 🧪 Testing

### Unit Tests Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import BudgetAnalysisChart from './BudgetAnalysisChartEnhanced';

describe('BudgetAnalysisChart', () => {
  test('renders loading state', () => {
    render(<BudgetAnalysisChart year={2024} />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  test('handles error state with retry', async () => {
    // Mock API failure
    jest.spyOn(consolidatedApiService, 'getBudgetData')
        .mockRejectedValue(new Error('Network error'));

    render(<BudgetAnalysisChart year={2024} />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });
  });
});
```

## 🚀 Deployment Considerations

### Production Optimizations

1. **Bundle Size**: Tree-shake unused translations
2. **CDN**: Serve static assets from CDN
3. **Service Worker**: Cache API responses
4. **Error Boundaries**: Wrap component in error boundaries
5. **Loading States**: Preload critical data

### Environment Variables

```env
# API Configuration
VITE_API_URL=https://api.carmendeareco.gob.ar
VITE_CACHE_DURATION=600000
VITE_RETRY_ATTEMPTS=3

# Monitoring
VITE_ANALYTICS_KEY=your-analytics-key
VITE_ERROR_TRACKING=enabled
```

## 📝 Migration Guide

### From Legacy BudgetAnalysisChart

```typescript
// Before (legacy)
<BudgetAnalysisChart year={2024} />

// After (enhanced)
<BudgetAnalysisChartEnhanced
  year={2024}
  locale="es"
  theme="light"
  enableCaching={true}
  onDataLoad={(data) => console.log('Loaded:', data)}
  onError={(error) => console.error('Error:', error)}
/>
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update translations for new text
4. Document performance implications
5. Test accessibility with screen readers

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Carmen de Areco's transparency initiative**