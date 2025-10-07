# Page Standardization Plan

**Goal**: Ensure all 44 pages have consistent design, proper year selector integration, and use unified data services

---

## Core Requirements

### 1. Year Selector Integration ✅

**Pattern to Follow**:
```typescript
const PageName = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Use unified data hook with year
  const {
    data,
    loading,
    error,
    availableYears,
    refetch
  } = usePageData(selectedYear); // Hook automatically refreshes when year changes

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // Hook will auto-refresh via useEffect dependency
  };

  return (
    <div>
      <YearSelector
        selectedYear={selectedYear}
        availableYears={availableYears}
        onChange={handleYearChange}
      />

      {/* ALL components must receive selectedYear prop */}
      <ChartComponent year={selectedYear} />
      <TableComponent year={selectedYear} />
    </div>
  );
};
```

**Key Points**:
- ✅ Hook uses `selectedYear` as dependency
- ✅ Hook auto-refreshes when year changes
- ✅ All child components receive `year` prop
- ✅ No manual refetch needed (handled by hook)

### 2. Consistent Card Design ✅

**Standard Card Component**:
```typescript
// StatCard.tsx - Reusable stat card
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  iconColor: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 bg-${iconColor}-100 dark:bg-${iconColor}-900/20 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${iconColor}-600 dark:text-${iconColor}-400`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4">
        <div className={`flex items-center text-sm ${
          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend.direction === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          <span>{Math.abs(trend.value)}%</span>
        </div>
      </div>
    )}
  </motion.div>
);
```

**Standard Grid Layout**:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard {...props1} />
  <StatCard {...props2} />
  <StatCard {...props3} />
  <StatCard {...props4} />
</div>
```

### 3. Unified Data Service Charts ✅

**Replace CSV-Only Charts**:

```typescript
// ❌ OLD: CSV-only chart
<PersonnelExpensesChart year={selectedYear} />
// Problem: Only loads from CSV, doesn't use unified services

// ✅ NEW: Unified chart
<UnifiedChart
  type="salary"
  year={selectedYear}
  variant="bar"
  height={300}
/>
// Benefits: Uses ALL data sources (CSV + JSON + PDF + External cached)
```

**Chart Types Available in UnifiedChart**:
- `budget` - Budget data
- `debt` - Debt data
- `treasury` - Treasury/revenue data
- `salary` - Salary/personnel data
- `contract` - Contract data
- `property` - Property declarations
- `document` - Document statistics
- `investment` - Investment data
- `revenue` - Revenue sources

**Variants**:
- `bar` - Bar chart
- `pie` - Pie chart
- `line` - Line chart
- `area` - Area chart

### 4. Standard Page Structure ✅

```typescript
const PageName: React.FC = () => {
  // 1. STATE
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');

  // 2. DATA HOOKS (with year dependency)
  const {
    data,
    loading,
    error,
    availableYears,
    activeSources,
    externalData
  } = usePageData(selectedYear);

  // 3. LOADING STATE
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  // 4. RENDER
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1>Page Title {selectedYear}</h1>
          <YearSelector
            selectedYear={selectedYear}
            availableYears={availableYears}
            onChange={setSelectedYear}
          />
        </div>

        {/* DATA SOURCES INDICATOR */}
        <DataSourcesIndicator
          activeSources={activeSources}
          externalData={externalData}
          className="mb-6"
        />

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard {...} />
          <StatCard {...} />
          <StatCard {...} />
          <StatCard {...} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Chart 1">
            <UnifiedChart type="budget" year={selectedYear} variant="bar" />
          </ChartContainer>
          <ChartContainer title="Chart 2">
            <UnifiedChart type="revenue" year={selectedYear} variant="pie" />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};
```

---

## Pages to Fix (Priority Order)

### High Priority (Main Pages)

1. **BudgetUnified.tsx** ✅ (Already uses useMultiYearData)
2. **TreasuryUnified.tsx** ✅ (Already uses useTreasuryData)
3. **ExpensesPage.tsx** ✅ (Just fixed)
4. **Salaries.tsx** - Need to verify
5. **ContractsAndTendersPage.tsx** - Need to verify
6. **DocumentsUnified.tsx** - Need to verify
7. **DebtUnified.tsx** - Need to verify

### Medium Priority (Analysis Pages)

8. **Audits.tsx** - Need to verify
9. **AuditsAndDiscrepanciesPage.tsx** - Need to verify
10. **Reports.tsx** - Need to verify
11. **TransparencyPage.tsx** - Need to verify
12. **DataVisualizationHub.tsx** - Need to verify

### Low Priority (Dashboards)

13. **DashboardCompleto.tsx** ✅ (Uses useMultiYearData)
14. **AllChartsDashboard.tsx** - Need to verify
15. **EnhancedTransparencyDashboard.tsx** - Need to verify

---

## Implementation Checklist per Page

### Data Integration ✅
- [ ] Uses data hook with `year` parameter
- [ ] Hook has `selectedYear` in useEffect dependencies
- [ ] All charts receive `year` prop
- [ ] Data refreshes when year changes

### Design Consistency ✅
- [ ] Uses StatCard for metrics
- [ ] Consistent card spacing (gap-6)
- [ ] Responsive grids (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- [ ] Consistent colors (blue, green, red, purple, yellow)

### Chart Integration ✅
- [ ] Uses UnifiedChart (not CSV-only charts)
- [ ] Charts receive `year` prop
- [ ] Charts have proper `type` and `variant`
- [ ] Charts wrapped in ErrorBoundary

### Layout ✅
- [ ] Max-w-7xl container
- [ ] Proper padding (px-4 sm:px-6 lg:px-8 py-8)
- [ ] Responsive grids for all sections
- [ ] DataSourcesIndicator included

---

## Migration Strategy

### Step 1: Create Reusable Components

1. **StatCard.tsx** - Standard stat card
2. **ChartContainer.tsx** - Standard chart wrapper
3. **PageHeader.tsx** - Standard page header with year selector

### Step 2: Fix High Priority Pages

For each page:
1. Audit current data hooks
2. Replace CSV-only charts with UnifiedChart
3. Standardize card design
4. Verify year selector propagation
5. Test year change refreshes all data

### Step 3: Create Page Templates

- **FinancialPageTemplate** - For budget, treasury, expenses
- **DataPageTemplate** - For contracts, documents, reports
- **AnalysisPageTemplate** - For audits, transparency

---

## Example Fixes

### Before: CSV-Only Chart
```typescript
// OLD: Only loads from CSV
const ExpensesPage = () => {
  const [year, setYear] = useState(2025);

  return (
    <PersonnelExpensesChart year={year} />
    // ❌ Only uses CSV file: Personnel_Expenses.csv
    // ❌ Doesn't include external data
    // ❌ Doesn't use unified services
  );
};
```

### After: Unified Service Chart
```typescript
// NEW: Uses all data sources
const ExpensesPage = () => {
  const [year, setYear] = useState(2025);

  // Hook automatically includes ALL data sources
  const { data, loading, error } = useExpensesData(year);

  return (
    <UnifiedChart
      type="salary"
      year={year}
      variant="bar"
      height={300}
    />
    // ✅ Uses UnifiedDataService
    // ✅ Includes CSV + JSON + PDF + External cached
    // ✅ Auto-refreshes when year changes
  );
};
```

---

## Testing Checklist

For each page after fixes:

### Functional Testing
- [ ] Year selector displays available years
- [ ] Changing year refreshes all data
- [ ] All cards update with new year data
- [ ] All charts update with new year data
- [ ] No console errors
- [ ] No "Gráfico No Disponible" errors

### Visual Testing
- [ ] Cards have consistent design
- [ ] Charts display in proper grid
- [ ] Responsive layout works (mobile, tablet, desktop)
- [ ] Colors are consistent
- [ ] Spacing is consistent

### Data Testing
- [ ] Data from unified services (not just CSV)
- [ ] External cached data included
- [ ] Numbers make sense for selected year
- [ ] Charts show meaningful data

---

## Progress Tracking

### Completed ✅
- [x] ExpensesPage.tsx - Fixed Resumen cards, replaced ValidatedChart
- [x] DataSourcesIndicator.tsx - Made compact
- [x] Created standardization documentation

### In Progress 🔄
- [ ] Create StatCard component
- [ ] Create ChartContainer component
- [ ] Audit remaining pages

### Pending ⏳
- [ ] Fix Salaries.tsx
- [ ] Fix ContractsAndTendersPage.tsx
- [ ] Fix DocumentsUnified.tsx
- [ ] Fix remaining pages

---

**Next Steps**:
1. Create reusable StatCard component
2. Audit Salaries.tsx for year selector issues
3. Replace CSV-only charts systematically
4. Test year selector on each fixed page
