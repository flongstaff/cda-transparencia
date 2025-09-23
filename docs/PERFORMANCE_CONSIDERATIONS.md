# UI Component Performance Considerations

This document outlines performance considerations and best practices for the new UI components.

## 1. Component Optimization

### React.memo Usage
All components use React.memo to prevent unnecessary re-renders:

```tsx
const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = ({ 
  score, 
  title = "Financial Health Score",
  onClick,
  className = ""
}) => {
  // Component implementation
};

export default React.memo(FinancialHealthScoreCard);
```

### Memoization of Expensive Calculations
Expensive calculations are memoized using useMemo:

```tsx
const getStatus = useCallback(() => {
  if (score >= 85) return { text: "Excellent Financial Health", color: "text-green-500", bg: "bg-green-500" };
  if (score >= 70) return { text: "Good Financial Health", color: "text-orange-500", bg: "bg-orange-500" };
  return { text: "Needs Attention", color: "text-red-500", bg: "bg-red-500" };
}, [score]);
```

## 2. Bundle Size Optimization

### Tree Shaking
Components are exported individually to enable tree shaking:

```tsx
// Import only what you need
import { FinancialHealthScoreCard } from '../components/ui/FinancialHealthScoreCard';

// Instead of importing everything
import * as UIComponents from '../components/ui';
```

### Code Splitting
Large components can be code-split for lazy loading:

```tsx
const FinancialHealthScoreCard = React.lazy(() => import('../components/ui/FinancialHealthScoreCard'));

// In component
<Suspense fallback={<div>Loading...</div>}>
  <FinancialHealthScoreCard score={85} />
</Suspense>
```

## 3. Rendering Performance

### Virtualization
For lists of components, consider virtualization:

```tsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedMetricCards = ({ metrics }) => (
  <List
    height={600}
    itemCount={metrics.length}
    itemSize={200}
    itemData={metrics}
  >
    {({ index, style }) => (
      <div style={style}>
        <EnhancedMetricCard {...metrics[index]} />
      </div>
    )}
  </List>
);
```

### Conditional Rendering
Avoid rendering components that are not visible:

```tsx
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setIsVisible(entry.isIntersecting),
    { threshold: 0.1 }
  );
  
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);

return (
  <div ref={ref}>
    {isVisible && <FinancialHealthScoreCard score={85} />}
  </div>
);
```

## 4. Asset Optimization

### SVG Optimization
SVG icons are inline and optimized:

```tsx
// Instead of importing external SVG files
<svg className="w-20 h-20" viewBox="0 0 100 100">
  <circle
    className="text-gray-200"
    strokeWidth="8"
    stroke="currentColor"
    fill="transparent"
    r="40"
    cx="50"
    cy="50"
  />
  {/* ... */}
</svg>
```

### Image Optimization
For components that might include images:

```tsx
import { LazyLoadImage } from 'react-lazy-load-image-component';

const ComponentWithImage = () => (
  <LazyLoadImage
    src="image.jpg"
    alt="Description"
    placeholder={<div className="bg-gray-200 animate-pulse" />}
    threshold={300}
  />
);
```

## 5. Event Handling Optimization

### Debounced Event Handlers
For expensive operations on events:

```tsx
import { debounce } from 'lodash';

const FinancialCategoryNavigation: React.FC<FinancialCategoryNavigationProps> = ({ 
  categories, 
  activeCategory,
  onCategoryChange
}) => {
  const debouncedOnChange = useMemo(
    () => debounce(onCategoryChange, 300),
    [onCategoryChange]
  );

  return (
    <div className="flex overflow-x-auto">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => debouncedOnChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
```

### Event Listener Cleanup
Proper cleanup of event listeners:

```tsx
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## 6. CSS Performance

### Efficient Selectors
Use efficient CSS selectors:

```css
/* Good - ID selectors are fastest */
#financial-score-card { }

/* Good - Class selectors are fast */
.financial-score-card { }

/* Avoid - Descendant selectors are slow */
.dashboard .financial-score-card { }
```

### Critical CSS
Extract critical CSS for above-the-fold content:

```tsx
import { Helmet } from 'react-helmet-async';

const FinancialHealthScoreCard = () => (
  <>
    <Helmet>
      <style>{`
        .financial-score-card { /* critical styles */ }
      `}</style>
    </Helmet>
    <div className="financial-score-card">
      {/* Component content */}
    </div>
  </>
);
```

## 7. Data Fetching Optimization

### Suspense for Data Loading
Use Suspense for data fetching:

```tsx
const FinancialData = () => {
  const { data, isLoading } = useFinancialOverview(2025);
  
  if (isLoading) {
    return <div className="bg-gray-200 animate-pulse rounded-xl w-full h-48" />;
  }
  
  return <FinancialHealthScoreCard score={data.score} />;
};
```

### Pagination for Large Datasets
Implement pagination for large datasets:

```tsx
const PaginatedMetrics = ({ page, pageSize }) => {
  const { data, isLoading } = useMetrics({ page, pageSize });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.map(metric => (
        <EnhancedMetricCard key={metric.id} {...metric} />
      ))}
    </div>
  );
};
```

## 8. Caching Strategies

### Component Caching
Cache expensive components:

```tsx
import { cache } from 'react';

const CachedFinancialScoreCard = cache(({ score }: { score: number }) => (
  <FinancialHealthScoreCard score={score} />
));
```

### Data Caching
Cache API responses:

```tsx
import { useQuery } from '@tanstack/react-query';

const useFinancialOverview = (year: number) => {
  return useQuery({
    queryKey: ['financialOverview', year],
    queryFn: () => fetchFinancialOverview(year),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};
```

## 9. Monitoring and Analytics

### Performance Monitoring
Monitor component performance:

```tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
```

### Error Boundaries
Implement error boundaries for graceful degradation:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

const UIComponentWithErrorBoundary = () => (
  <ErrorBoundary
    fallback={<div className="p-4 bg-red-100 rounded">Something went wrong</div>}
    onError={(error, info) => {
      console.error('Component error:', error, info);
    }}
  >
    <FinancialHealthScoreCard score={85} />
  </ErrorBoundary>
);
```

## 10. Best Practices Summary

1. **Minimize Re-renders**: Use React.memo and useMemo appropriately
2. **Optimize Bundle Size**: Import only what you need
3. **Lazy Load**: Use code splitting for non-critical components
4. **Efficient CSS**: Use efficient selectors and minimize specificity
5. **Virtualize Lists**: For large datasets, use virtualization
6. **Debounce Events**: For expensive operations on user events
7. **Cache Data**: Use appropriate caching strategies
8. **Monitor Performance**: Implement performance monitoring
9. **Handle Errors**: Use error boundaries for graceful degradation
10. **Test Performance**: Include performance tests in your test suite