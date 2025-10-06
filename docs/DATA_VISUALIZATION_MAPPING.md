# Complete Data Visualization Mapping - All Pages

## Overview
- **Total Pages**: 51 pages
- **PDFs Available**: 201 in `/public/data/pdfs/`
- **Municipal Datasets**: 22 datasets with PDFs
- **National Datasets**: 1,191 datasets (external links)
- **Themes**: 13 categories

## Page-by-Page Data Mapping

### 1. Budget Pages

#### Budget.tsx
**Current Data:** Budget execution data
**Add:**
- ✅ Municipal PDFs: All budget PDFs from `/public/data/pdfs/`
  - `pdf_*_PRESUPUESTO*.pdf`
  - Budget execution reports by year
- ✅ Municipal Datasets: Presupuesto 2025, Budget execution 2017-2024
- 🆕 National Datasets (econ theme): 424 economy/finance datasets
  - National budget data
  - Provincial comparisons
  - Economic indicators

**Components to Add:**
```tsx
<PDFGallery category="presupuesto" />
<NationalDatasetLinks theme="econ" keywords={["presupuesto", "budget"]} />
<DownloadableResources datasets={municipalBudgetData} />
```

#### TestBudgetPage.tsx
**Purpose:** Testing budget visualizations
**Add:** Same as Budget.tsx for testing

---

### 2. Treasury/Revenue Pages

#### TreasuryUnified.tsx
**Current Data:** Revenue data
**Add:**
- ✅ Municipal PDFs:
  - `pdf_*_Estado-de-Ejecucion-de-Recursos*.pdf`
  - `pdf_*_RECURSOS*.pdf`
- ✅ Municipal Datasets: Revenue execution reports
- 🆕 National Datasets (econ):
  - Tax collection data
  - Provincial revenue data
  - National treasury reports

#### MultiYearRevenue.tsx
**Current Data:** Multi-year revenue trends
**Add:** Historical revenue PDFs + national comparative data

---

### 3. Expenses Pages

#### ExpensesPage.tsx
**Current Data:** Expense breakdown
**Add:**
- ✅ Municipal PDFs:
  - `pdf_*_Estado-de-Ejecucion-de-Gastos*.pdf`
  - `pdf_*_GASTOS*.pdf`
  - Gender perspective reports
  - Economic character reports
- ✅ Municipal Datasets: Expense execution 2017-2024
- 🆕 National Datasets: Government spending data

---

### 4. Contracts & Procurement

#### ContractsAndTendersPage.tsx
**Current Data:** Contract tracking
**Add:**
- ✅ Municipal PDFs: Contract documents (if available)
- 🆕 Municipal Datasets: Tender data from catalog
- 🆕 National Datasets (gove theme): 143 government datasets
  - Public procurement data
  - Contract registries
  - Tender announcements

---

### 5. Salaries & Personnel

#### Salaries.tsx
**Current Data:** Salary data
**Add:**
- ✅ Municipal PDFs: Personnel reports
- 🆕 Municipal Datasets: Payroll data
- 🆕 National Datasets (gove):
  - Public sector salaries
  - Employment statistics

---

### 6. Documents & Reports

#### DocumentsUnified.tsx
**Current Data:** Document viewer
**Add:**
- ✅ ALL 201 PDFs organized by category:
  - Boletín Oficial (18 files)
  - Budget reports (100+ files)
  - Economic situation reports
  - Health statistics
  - Ordinances
- 📋 **PDF Categories to Display:**
  1. Presupuesto (Budget)
  2. Ejecución de Gastos (Expenses)
  3. Ejecución de Recursos (Revenue)
  4. Situación Económica (Economic Reports)
  5. Estadísticas de Salud (Health Stats)
  6. Ordenanzas (Ordinances)
  7. Boletín Oficial (Official Bulletin)

#### Reports.tsx
**Current Data:** Financial reports
**Add:**
- ✅ Municipal PDFs: All economic situation reports
  - `SITUACION-ECONOMICA-FINANCIERA*.pdf`
- ✅ Quarterly reports
- 🆕 National comparative reports

---

### 7. Health & Social Services

#### PropertyDeclarations.tsx (rename to Health/Social?)
**Add:**
- ✅ Municipal PDFs: CAIF health statistics
  - `CAIF*.pdf` files
- 🆕 National Datasets (heal theme): 63 health datasets
  - National health indicators
  - Vaccination data
  - Hospital statistics

**New Health Dashboard Page Needed:**
```tsx
// HealthDashboard.tsx
- Municipal health PDFs
- CAIF statistics
- National health data comparison
```

---

### 8. Audits & Compliance

#### Audits.tsx
#### AuditsAndDiscrepanciesPage.tsx
#### AuditAnomaliesExplainer.tsx
**Current Data:** Audit results
**Add:**
- ✅ Municipal PDFs: Audit reports
- 🆕 Municipal Datasets: Financial audit data
- 🆕 National Datasets (just theme): 73 justice/legal datasets
  - Anti-corruption reports
  - Public declarations
  - Compliance data

#### AntiCorruptionDashboard.tsx
#### CorruptionMonitoringDashboard.tsx
**Add:**
- 🆕 National: Anti-corruption office data
- 🆕 National: Public official declarations
- Municipal transparency reports

---

### 9. Infrastructure & Investment

#### InfrastructureTracker.tsx
#### InvestmentsPage.tsx
**Current Data:** Infrastructure projects
**Add:**
- ✅ Municipal PDFs: Infrastructure budget reports
- 🆕 National Datasets (regi theme): 3 regional datasets
- 🆕 National Datasets (econ): Public works data

---

### 10. Open Data & Catalog

#### OpenDataPage.tsx
#### OpenDataCatalogPage.tsx
**Current:** Basic catalog view
**Needs Complete Overhaul:**
```tsx
// New Features:
1. Display ALL 1,213 datasets
2. Filter by source (Municipal/National)
3. Filter by theme (13 categories)
4. Search functionality
5. PDF gallery integration
6. Download statistics
```

**Implementation:**
```tsx
<OpenDataCatalog>
  <ThemeFilter themes={themeTaxonomy} />
  <SourceToggle options={['Municipal', 'National', 'All']} />
  <SearchBar placeholder="Search 1,213 datasets..." />
  <DatasetGrid>
    {datasets.map(ds => (
      <DatasetCard
        dataset={ds}
        showPDFs={ds.source === 'municipal'}
        showDownloadLink={true}
      />
    ))}
  </DatasetGrid>
</OpenDataCatalog>
```

---

### 11. Main Dashboards

#### Home.tsx
**Add:**
- 📊 Statistics: Total datasets (1,213), PDFs (201)
- 🎨 Theme quick links
- 📈 Recent updates from both sources

#### DashboardCompleto.tsx
**Current:** Comprehensive dashboard
**Add:**
- ✅ All municipal PDFs organized by category
- 📊 National dataset widgets
- 🔗 Quick links to themed data

#### EnhancedTransparencyDashboard.tsx
#### MetaTransparencyDashboard.tsx
#### StandardizedDashboard.tsx
**Add:**
- Data source indicators (Municipal/National)
- PDF count by category
- Dataset availability status

---

### 12. Analysis & Visualization

#### AnalyticsDashboard.tsx
#### TimeSeriesAnalysisPage.tsx
#### GeographicVisualizationPage.tsx
#### DataVisualizationHub.tsx
**Add:**
- Municipal + National data combination
- Comparative analysis
- Trend visualization with external data

#### AnomalyDashboard.tsx
#### FlaggedAnalysisPage.tsx
**Add:**
- Cross-reference municipal vs national data
- Anomaly detection using combined datasets

---

### 13. Debt & Finances

#### DebtUnified.tsx
**Add:**
- Municipal debt reports (PDFs)
- National debt statistics
- Provincial comparisons

---

### 14. Search & Discovery

#### SearchPage.tsx
**Needs Complete Implementation:**
```tsx
// Search across:
1. All 1,213 datasets (titles, descriptions)
2. All 201 PDFs (filenames, metadata)
3. All page content
4. Theme categories

// Features:
- Fuzzy search
- Filters: source, theme, format, date
- Results grouped by type
- Quick preview
```

---

### 15. Special Pages

#### Database.tsx
**Add:**
- Database of all datasets
- Filterable table view
- Export functionality

#### DataConnectivityTest.tsx
**Add:**
- Test all dataset URLs
- Verify PDF accessibility
- Health check dashboard

#### DataVerificationPage.tsx
**Add:**
- Verify municipal data
- Cross-check with national datasets
- Data quality metrics

---

## Implementation Strategy

### Phase 1: PDF Integration (Week 1)
1. Create PDF index/manifest
2. Build PDF gallery component
3. Add PDFs to relevant pages
4. Organize by category

### Phase 2: Municipal Dataset Display (Week 1-2)
1. Display all 22 municipal datasets
2. Show PDF attachments
3. Add download buttons
4. Metadata display

### Phase 3: National Dataset Integration (Week 2-3)
1. Add national dataset filters
2. Theme-based browsing
3. External link handling
4. Comparative views

### Phase 4: Search & Discovery (Week 3-4)
1. Full-text search
2. Advanced filters
3. Result ranking
4. Quick preview

## Component Library Needed

### 1. PDFGallery Component
```tsx
interface PDFGalleryProps {
  category?: string;
  year?: number;
  searchTerm?: string;
}

<PDFGallery
  category="presupuesto"
  year={2024}
  layout="grid"
  showThumbnails={true}
/>
```

### 2. DatasetCard Component
```tsx
interface DatasetCardProps {
  dataset: Dataset;
  source: 'municipal' | 'national';
  showPDFs?: boolean;
  compact?: boolean;
}

<DatasetCard
  dataset={dataset}
  source="municipal"
  showPDFs={true}
  actions={['download', 'view', 'share']}
/>
```

### 3. ThemeNavigator Component
```tsx
<ThemeNavigator
  themes={themeTaxonomy}
  onSelect={handleThemeSelect}
  showCounts={true}
/>
```

### 4. SourceFilter Component
```tsx
<SourceFilter
  sources={['municipal', 'national']}
  selected={selectedSource}
  onChange={handleSourceChange}
/>
```

### 5. UnifiedDataViewer Component
```tsx
<UnifiedDataViewer
  municipalData={localDatasets}
  nationalData={externalDatasets}
  pdfs={relevantPDFs}
  theme="econ"
/>
```

## Data Structure Requirements

### PDF Manifest
```json
{
  "pdfs": [
    {
      "filename": "boletin_oficial_pdf_1_2019-Situacion-Economico-Financiero-Carmen-de-Areco.pdf",
      "title": "Situación Económico-Financiera 2019",
      "category": "economic_reports",
      "year": 2019,
      "quarter": null,
      "theme": ["econ"],
      "relatedDatasets": ["ds-presupuesto-2019"],
      "size": "2.3MB",
      "pages": 45,
      "accessURL": "/data/pdfs/boletin_oficial_pdf_1_2019..."
    }
  ]
}
```

### Dataset Enhancement
```json
{
  "dataset": {
    "id": "ds-presupuesto-2025",
    "source": "municipal",
    "theme": ["econ"],
    "relatedPDFs": ["PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf"],
    "relatedPages": ["/budget", "/reports", "/open-data"],
    "visualizations": ["bar-chart", "time-series", "comparison"]
  }
}
```

## Success Metrics

- ✅ All 201 PDFs accessible from relevant pages
- ✅ All 22 municipal datasets displayed with PDFs
- ✅ All 1,191 national datasets browsable by theme
- ✅ Search functionality covers all data
- ✅ Each page shows 100% of relevant data
- ✅ Cross-linking between related datasets/PDFs
- ✅ Download tracking implemented
- ✅ Mobile-responsive display

## Next Steps

1. **Create PDF manifest** - Index all 201 PDFs
2. **Build component library** - 5 reusable components
3. **Update pages** - Add data to each of 51 pages
4. **Implement search** - Full-text across all data
5. **Add analytics** - Track which data is viewed/downloaded
6. **Test coverage** - Verify all data is accessible

Would you like me to start implementing this mapping?
