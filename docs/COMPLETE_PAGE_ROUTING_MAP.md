# Complete Page Routing & Data Integration Map

## Current Status
- **Total Pages**: 51 pages
- **Routed in App.tsx**: ~40 pages
- **Missing Routes**: ~11 pages
- **Components Created**: PDFGallery, DatasetCard, UnifiedDataViewer

## All Pages Analysis & Routing

### ✅ Already Routed Pages (40)

#### 1. Core Financial Pages
| Page | Route | Status | Data Integration Needed |
|------|-------|--------|------------------------|
| Home.tsx | `/` | ✅ Routed | Add stats from UnifiedDataViewer |
| Budget.tsx | `/budget` | ✅ Routed | **ADD: UnifiedDataViewer** with category="budget", theme="econ" |
| TreasuryUnified.tsx | `/treasury` | ✅ Routed | **ADD: UnifiedDataViewer** with category="revenue", theme="econ" |
| ExpensesPage.tsx | `/expenses` | ✅ Routed | **ADD: UnifiedDataViewer** with category="expenses", theme="econ" |
| DebtUnified.tsx | `/debt` | ✅ Routed | **ADD: UnifiedDataViewer** with theme="econ" |
| Invest mentsPage.tsx | `/investments` | ✅ Routed | **ADD: UnifiedDataViewer** with theme="econ" |
| MultiYearRevenue.tsx | `/revenue` | ✅ Routed | **ADD: PDFGallery** category="revenue" |

#### 2. Human Resources
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| Salaries.tsx | `/salaries` | ✅ Routed | **ADD: UnifiedDataViewer** theme="gove" |
| PropertyDeclarations.tsx | `/property-declarations` | ✅ Routed | **ADD: National datasets** just theme (73 datasets) |

#### 3. Contracts & Procurement
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| ContractsAndTendersPage.tsx | `/contracts` | ✅ Routed | **ADD: UnifiedDataViewer** theme="gove" |

#### 4. Documents & Reports
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| DocumentsUnified.tsx | `/documents` | ✅ Routed | **ADD: PDFGallery** (all categories) |
| Reports.tsx | `/reports` | ✅ Routed | **ADD: PDFGallery** category="economic_reports" |
| Database.tsx | `/database` | ✅ Routed | **ADD: Complete dataset table view** |
| DocumentAnalysisPage.tsx | `/document-analysis` | ✅ Routed | **ADD: PDF + dataset analysis** |

#### 5. Dashboards
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| DashboardCompleto.tsx | `/dashboard`, `/completo` | ✅ Routed | **ADD: Summary of all data sources** |
| StandardizedDashboard.tsx | `/standardized` | ✅ Routed | **ADD: Standardized dataset views** |
| AnalyticsDashboard.tsx | `/analytics` | ✅ Routed | **ADD: Analytics on combined data** |
| MetaTransparencyDashboard.tsx | `/meta-transparency` | ✅ Routed | **ADD: Data source health indicators** |
| DataVisualizationHub.tsx | `/data-hub` | ✅ Routed | **ADD: All visualizations + datasets** |
| EnhancedTransparencyDashboard.tsx | `/enhanced-transparency` | ✅ Routed | Keep current implementation |
| MonitoringDashboard.tsx | `/monitoring` | ✅ Routed | Keep current implementation |

#### 6. Audits & Compliance
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| Audits.tsx | `/audits` | ✅ Routed | **ADD: Audit PDFs + national audit datasets** |
| AuditAnomaliesExplainer.tsx | `/audit-anomalies` | ✅ Routed | Keep current implementation |
| AuditsAndDiscrepanciesPage.tsx | `/financial-audit` | ✅ Routed | **ADD: Financial audit datasets** |
| AnomalyDashboard.tsx | `/audit-dashboard` | ✅ Routed | Keep current implementation |

#### 7. Anti-Corruption & Transparency
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| AntiCorruptionDashboard.tsx | `/analysis` | ✅ Routed | **ADD: National justice/anti-corruption datasets (73)** |
| CorruptionMonitoringDashboard.tsx | `/corruption-monitoring` | ✅ Routed | **ADD: Public declarations, transparency data** |
| TransparencyPage.tsx | `/transparency` | ✅ Routed | Keep current implementation |
| TransparencyPortal.tsx | `/transparency-portal` | ✅ Routed | Keep current implementation |

#### 8. Open Data & Catalog
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| OpenDataPage.tsx | `/open-data` | ✅ Routed | **UPGRADE: Show all 1,213 datasets with filters** |
| OpenDataCatalogPage.tsx | `/open-data-catalog` | ✅ Routed | **UPGRADE: Full catalog with theme navigation** |

#### 9. Sectoral & Specialized
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| SectoralStatsDashboard.tsx | `/sectoral` | ✅ Routed | **ADD: Sectoral datasets by theme** |
| InfrastructureTracker.tsx | `/infrastructure` | ✅ Routed | **ADD: Infrastructure datasets** |

#### 10. Verification & Rights
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| DataVerificationPage.tsx | `/data-verification` | ✅ Routed | **ADD: Dataset verification status** |
| PrivacyPolicyPage.tsx | `/privacy-policy` | ✅ Routed | Static content - OK |
| DataRightsPage.tsx | `/data-rights` | ✅ Routed | Static content - OK |

#### 11. Informational
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| About.tsx | `/about` | ✅ Routed | Static content - OK |
| Contact.tsx | `/contact` | ✅ Routed | Static content - OK |
| CarmenDeArecoPage.tsx | `/carmen` | ✅ Routed | Keep current implementation |

#### 12. Search & Discovery
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| SearchPage.tsx | `/search` | ✅ Routed | **IMPLEMENT: Search across all PDFs + datasets** |

#### 13. Test Pages
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| TestCarmenComponents.tsx | `/test-carmen` | ✅ Routed | Testing only |
| TestBudgetPage.tsx | `/test-budget` | ✅ Routed | Testing only |

#### 14. Error Pages
| Page | Route | Status | Data Integration |
|------|-------|--------|-----------------|
| NotFoundPage.tsx | `*` | ✅ Routed | Static content - OK |

---

### ❌ Missing Routes (11 pages)

These pages exist but are NOT routed in App.tsx:

| Page | Suggested Route | Priority | Data Integration |
|------|----------------|----------|-----------------|
| **TestAllChartsPage.tsx** | `/all-charts` | Low | Testing - **ADD ROUTE** |
| **GeographicVisualizationPage.tsx** | `/geographic` | **HIGH** | **ADD ROUTE** + regional datasets |
| **TimeSeriesAnalysisPage.tsx** | `/time-series` | **HIGH** | **ADD ROUTE** + historical data |
| **CustomizableReportingPage.tsx** | `/custom-reports` | **HIGH** | **ADD ROUTE** + dataset selection |
| **FlaggedAnalysisPage.tsx** | `/flagged` | Medium | **ADD ROUTE** + flagged datasets |
| **InteractiveDashboard.tsx** | `/interactive` | Medium | **ADD ROUTE** + interactive viz |
| **DataConnectivityTest.tsx** | `/data-connectivity-test` | Low | Testing - **ADD ROUTE** |
| **TestDataLoader.tsx** | `/test-data-loader` | Low | Testing - **ADD ROUTE** |

---

## Implementation Plan

### Phase 1: Add Missing Routes ✨

```typescript
// Add to App.tsx imports
import TestAllChartsPage from './pages/TestAllChartsPage';
import GeographicVisualizationPage from './pages/GeographicVisualizationPage';
import TimeSeriesAnalysisPage from './pages/TimeSeriesAnalysisPage';
import CustomizableReportingPage from './pages/CustomizableReportingPage';
import FlaggedAnalysisPage from './pages/FlaggedAnalysisPage';
import InteractiveDashboard from './pages/InteractiveDashboard';
import DataConnectivityTest from './pages/DataConnectivityTest';
import TestDataLoader from './pages/TestDataLoader';

// Add to Routes
<Route path="/all-charts" element={<TestAllChartsPage />} />
<Route path="/geographic" element={<GeographicVisualizationPage />} />
<Route path="/time-series" element={<TimeSeriesAnalysisPage />} />
<Route path="/custom-reports" element={<CustomizableReportingPage />} />
<Route path="/flagged" element={<FlaggedAnalysisPage />} />
<Route path="/interactive" element={<InteractiveDashboard />} />
<Route path="/data-connectivity-test" element={<DataConnectivityTest />} />
<Route path="/test-data-loader" element={<TestDataLoader />} />
```

### Phase 2: Integrate UnifiedDataViewer into Key Pages

#### Budget.tsx
```tsx
import { UnifiedDataViewer } from '@components/data-viewers';

// Add at bottom of page
<UnifiedDataViewer
  title="Documentos y Datasets de Presupuesto"
  category="budget"
  theme="econ"
  year={selectedYear}
  showSearch={true}
/>
```

#### TreasuryUnified.tsx
```tsx
<UnifiedDataViewer
  title="Recursos y Tesorería"
  category="revenue"
  theme="econ"
  year={selectedYear}
/>
```

#### ExpensesPage.tsx
```tsx
<UnifiedDataViewer
  title="Documentos de Gastos"
  category="expenses"
  theme="econ"
  year={selectedYear}
/>
```

### Phase 3: Upgrade Open Data Pages

#### OpenDataPage.tsx - Complete Rewrite
```tsx
import { UnifiedDataViewer } from '@components/data-viewers';

export const OpenDataPage = () => {
  return (
    <div className="space-y-6">
      <h1>Catálogo de Datos Abiertos</h1>

      {/* Show full catalog with all features */}
      <UnifiedDataViewer
        title="Catálogo Completo"
        description="1,213 datasets (22 municipales + 1,191 nacionales) y 201 documentos PDF"
        source="all"
        showSearch={true}
        defaultTab="datasets"
        maxDatasets={1213}
      />
    </div>
  );
};
```

### Phase 4: Implement Search

#### SearchPage.tsx
```tsx
import { useState } from 'react';
import { UnifiedDataViewer } from '@components/data-viewers';

export const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar en 1,213 datasets y 201 PDFs..."
      />

      <UnifiedDataViewer
        searchTerm={searchTerm}
        source="all"
        showSearch={false} // Using external search
      />
    </div>
  );
};
```

### Phase 5: Add Health Dashboards

Create new page for health data:

```tsx
// frontend/src/pages/HealthDashboard.tsx
import { UnifiedDataViewer } from '@components/data-viewers';

export const HealthDashboard = () => {
  return (
    <UnifiedDataViewer
      title="Salud y Estadísticas Sanitarias"
      category="health"
      theme={['heal', 'salud-y-asistencia-social']}
      description="Estadísticas de salud municipal (CAIF) y datos nacionales"
    />
  );
};

// Add route: <Route path="/health" element={<HealthDashboard />} />
```

---

## Summary of Changes Needed

### Immediate Actions:
1. ✅ **Add 8 missing routes** to App.tsx
2. ✅ **Import UnifiedDataViewer** in 10+ pages
3. ✅ **Update OpenDataPage** to show all 1,213 datasets
4. ✅ **Implement SearchPage** with full-text search
5. ✅ **Add PDFGallery** to Documents, Reports, Budget, Treasury, Expenses
6. ✅ **Create HealthDashboard** for health data

### Files to Modify:
- `/frontend/src/App.tsx` - Add 8 routes
- `/frontend/src/pages/Budget.tsx` - Add UnifiedDataViewer
- `/frontend/src/pages/TreasuryUnified.tsx` - Add UnifiedDataViewer
- `/frontend/src/pages/ExpensesPage.tsx` - Add UnifiedDataViewer
- `/frontend/src/pages/DocumentsUnified.tsx` - Add PDFGallery
- `/frontend/src/pages/Reports.tsx` - Add PDFGallery
- `/frontend/src/pages/OpenDataPage.tsx` - Complete rewrite
- `/frontend/src/pages/SearchPage.tsx` - Implement search
- `/frontend/src/pages/Audits.tsx` - Add audit datasets
- `/frontend/src/pages/AntiCorruptionDashboard.tsx` - Add national datasets

### New Files to Create:
- `/frontend/src/pages/HealthDashboard.tsx`
- `/frontend/src/components/search/DatasetSearch.tsx`
- `/frontend/src/hooks/useDatasetSearch.ts`

---

## Next Steps

Ready to implement! Should I:
1. **Add missing routes** to App.tsx?
2. **Update Budget.tsx** with UnifiedDataViewer?
3. **Rewrite OpenDataPage** for full catalog?
4. **All of the above**?
