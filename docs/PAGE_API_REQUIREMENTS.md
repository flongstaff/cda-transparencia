# Page API Requirements Audit

**Date**: October 2, 2025
**Purpose**: Document which APIs each page needs and ensure proxy endpoints exist

## Pages Using External Data (20 total)

### Core Financial Pages

#### 1. Budget.tsx
**Data Hooks**: `useMasterData(selectedYear)`
**External APIs Called**:
- ✅ `externalAPIsService.getRAFAMData('270')` → `/api/external/rafam`
- ⚠️ `externalAPIsService.getBuenosAiresProvincialData()` → `/api/provincial/gba` (500 error)

**Charts**: BudgetAnalysisChart, UnifiedChart
**Grid**: Uses responsive grid for charts and data tables

#### 2. Treasury.tsx / TreasuryUnified.tsx
**Data Hooks**: `useUnifiedData({ page: 'treasury', year, includeExternal: true })`
**External APIs**: From UnifiedDataService
- ✅ RAFAM, GBA, AFIP, Contrataciones, Boletín (National + Provincial)
- ❌ Carmen Official (needs fixing)

**Charts**: FinancialReservesChart, TimeSeriesChart
**Grid**: Card grid + chart grid

#### 3. DebtPage.tsx / DebtUnified.tsx
**Data Hooks**: `useDebtData(year, true)`
**External APIs**: All from UnifiedDataService
- RAFAM debt data
- GBA provincial debt
- National debt metrics

**Charts**: DebtReportChart, WaterfallChart
**Grid**: Responsive chart grid

#### 4. ExpensesPage.tsx
**Data Hooks**: `useExpensesData(year, true)`
**External APIs**: Expenses from all sources
- RAFAM expenditure reports
- Carmen de Areco transparency portal
- National contrataciones

**Charts**: ExpenditureReportChart, ProgrammaticPerformanceChart
**Grid**: Multi-column responsive layout

#### 5. InvestmentsPage.tsx
**Data Hooks**: `useInvestmentsData(year, true)`
**External APIs**:
- National public works API
- Provincial infrastructure data
- RAFAM investment reports

**Charts**: InvestmentReportChart, InfrastructureProjectsChart
**Grid**: Grid with filtering

#### 6. Salaries.tsx
**Data Hooks**: `useSalariesData(year, true)`
**External APIs**:
- ⚠️ AFIP salary data (may need specific endpoint)
- RAFAM personnel expenses
- Carmen transparency portal

**Charts**: PersonnelExpensesChart
**Grid**: Table + chart layout

### Dashboard Pages

#### 7. DashboardCompleto.tsx
**Data Hooks**:
- `useMultiYearData(year)` - Multi-year preloading
- `useDashboardData(selectedYear)` - Unified external data

**External APIs**: ALL external sources via UnifiedDataService
- Municipal: Carmen Official, Transparency, Licitaciones
- Provincial: RAFAM, GBA, Boletín Provincial
- National: Datos, Georef, AFIP, Contrataciones, Boletín

**Charts**: ALL 13 charts
- BudgetExecutionChart
- DebtReportChart
- EconomicReportChart
- EducationDataChart
- ExpenditureReportChart
- FinancialReservesChart
- FiscalBalanceReportChart
- HealthStatisticsChart
- InfrastructureProjectsChart
- InvestmentReportChart
- PersonnelExpensesChart
- RevenueReportChart
- RevenueSourcesChart
- QuarterlyExecutionChart
- ProgrammaticPerformanceChart
- GenderBudgetingChart
- WaterfallExecutionChart

**Grid**: Complex multi-section responsive grid
- Overview section: Stats cards
- Financial section: Charts in 2-column grid
- Transparency section: Audit tables + charts
- Charts section: Dynamic chart grid (2-4 columns responsive)
- Operations section: Contracts + tenders
- Services section: Health + education stats

#### 8. AnalyticsDashboard.tsx
**Data Hooks**: `useDashboardData(year)`
**External APIs**: Analytics-specific aggregations
**Charts**: Custom analytics visualizations
**Grid**: Dashboard grid with panels

#### 9. MonitoringDashboard.tsx
**Data Hooks**: Custom monitoring data
**External APIs**: Real-time monitoring endpoints
**Charts**: Status indicators, time series
**Grid**: Monitoring panel grid

#### 10. FinancialDashboard.tsx
**Data Hooks**: Financial-specific data
**External APIs**: RAFAM, AFIP, provincial financial data
**Charts**: Comprehensive financial charts
**Grid**: Financial metrics grid

### Contract & Documents Pages

#### 11. ContractsAndTendersPage.tsx
**Data Hooks**: `useContractsData(year, true)`
**External APIs**:
- ⚠️ `/api/national/contrataciones` (needs fixing)
- `/api/carmen/licitaciones`
- RAFAM contract data

**Charts**: Contract timeline, amount distribution
**Grid**: Table + chart grid

#### 12. Documents.tsx / DocumentsUnified.tsx
**Data Hooks**: `useDocumentsData(year, true)`
**External APIs**:
- Carmen de Areco Boletín Oficial
- National Boletín Oficial
- Provincial Boletín

**Charts**: Document categories, timeline
**Grid**: Document grid + filters

#### 13. Reports.tsx
**Data Hooks**: `useReportsData(year, true)`
**External APIs**: All audit and report sources
**Charts**: ChartAuditReport
**Grid**: Report cards grid

#### 14. Audits.tsx / AuditsAndDiscrepanciesPage.tsx
**Data Hooks**: `useAuditsData(year, true)`
**External APIs**:
- ❌ AAIP Transparency Index (missing endpoint)
- Audit reports from all sources

**Charts**: Audit visualizations
**Grid**: Audit findings grid

### Other Pages

#### 15. InfrastructureTracker.tsx
**Data Hooks**: Custom infrastructure data
**External APIs**:
- ❌ Public works API (needs endpoint)
- Geographic data (Georef)
- RAFAM infrastructure

**Charts**: Infrastructure progress charts
**Grid**: Project cards grid

#### 16. TransparencyPortal.tsx
**Data Hooks**: `useDashboardData`
**External APIs**: Transparency-specific sources
**Charts**: Transparency metrics
**Grid**: Portal layout grid

#### 17. DataVisualizationHub.tsx
**Data Hooks**: Multiple chart data hooks
**External APIs**: All visualization data sources
**Charts**: ALL available charts
**Grid**: Hub grid with chart categories

#### 18-20. Monitoring & Transparency Pages
**MonitoringPage.tsx, TransparencyPage.tsx, OpenDataCatalogPage.tsx**
**Data Hooks**: Various
**External APIs**: Catalog and monitoring sources
**Charts**: Custom per page
**Grid**: Responsive catalog grids

## Missing Proxy Endpoints Summary

### Critical (Pages Won't Work) ❌

1. `/api/external/proxy` - Generic URL proxying for any external source
2. `/api/external/all-external-data` - Aggregated endpoint for all sources
3. `/api/national/obras-publicas` - Public works API (already exists in proxy-server.js line 999, not responding)
4. `/api/external/aaip/transparency-index` - AAIP transparency scores
5. `/api/external/carmen-de-areco` - Carmen municipality aggregation

### Civil Society Organizations ❌

6. `/api/external/poder-ciudadano` - Poder Ciudadano oversight
7. `/api/external/acij` - ACIJ transparency data
8. `/api/external/infoleg` - InfoLEG legal database
9. `/api/external/ministry-of-justice` - Ministry transparency
10. `/api/external/directorio-legislativo` - Legislative directory

### Needs Fixing ⚠️

11. `/api/carmen/official` - HTTP 500 error (scraping issue)
12. `/api/external/rafam` - 15s timeout (needs longer timeout)
13. `/api/provincial/gba` - HTTP 500 error (404 on external site)
14. `/api/national/contrataciones` - Intermittent failures

## Chart Grid Requirements

### Grid Patterns Used

1. **DashboardCompleto**:
   - Stats: 3-column grid (lg:grid-cols-3)
   - Charts: 2-column grid (lg:grid-cols-2)
   - Sections: Tab-based sections with nested grids

2. **Budget/Treasury/Debt Pages**:
   - Header: Full width
   - Filters: Horizontal row
   - Charts: 2-3 column responsive (sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

3. **DataVisualizationHub**:
   - Chart categories: 4-column grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
   - Individual charts: Auto-fit with min-width

### Responsive Breakpoints

- **Mobile (default)**: 1 column
- **sm (640px)**: 1-2 columns
- **md (768px)**: 2 columns
- **lg (1024px)**: 2-3 columns
- **xl (1280px)**: 3-4 columns
- **2xl (1536px)**: 4 columns

### Chart Height Standards

- Default: 400px
- Compact: 300px
- Expanded: 500-600px
- Full section: min-h-screen

## Action Items

### Immediate Priority

- [ ] Add missing `/api/external/proxy` endpoint
- [ ] Add `/api/external/all-external-data` aggregation
- [ ] Fix RAFAM timeout (increase to 30s)
- [ ] Fix Carmen official scraping
- [ ] Add AAIP transparency index endpoint

### Medium Priority

- [ ] Add civil society organization endpoints
- [ ] Fix GBA provincial data endpoint
- [ ] Improve contrataciones reliability
- [ ] Test all charts load correctly
- [ ] Verify responsive grids on all pages

### Long Term

- [ ] Run master data ingestion for 2018-2025
- [ ] Implement Wayback Machine historical data
- [ ] Set up automated data refresh
- [ ] Create GitHub Actions workflow
- [ ] Production deployment testing
