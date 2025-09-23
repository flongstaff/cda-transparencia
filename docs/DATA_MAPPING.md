# Data Mapping for Carmen de Areco Transparency Portal

## Data Files and Their Usage

### Core Data Files

1. **data/organized_documents/document_inventory.json**
   - Contains comprehensive inventory of all documents
   - Used by: DocumentDataService, EnhancedDocumentDataService
   - Feeds into: Documents page, DocumentDetail page, search functionality

2. **frontend/src/data/data_index_2022.json** through **data_index_2025.json**
   - Year-specific data indexes
   - Used by: useUnifiedData hook, YearDashboard pages
   - Feeds into: Dashboard, Budget, Spending, Investments pages

3. **data/organized_analysis/financial_oversight/budget_analysis/budget_data_2024.json**
   - Detailed budget data for 2024
   - Used by: Budget page, Financial charts
   - Feeds into: BudgetAnalysisChart, FinancialHealthScoreCard

4. **frontend/src/data/comprehensive_data_index.json**
   - Overall data index
   - Used by: useComprehensiveData hook
   - Feeds into: Home page, Dashboard page

### UI Component Mappings

1. **FinancialHealthScoreCard**
   - Data source: budget_data_2024.json, data_index_*.json
   - Properties: score, title, description, trend, changeValue

2. **EnhancedMetricCard**
   - Data source: data_index_*.json, budget_data_*.json
   - Properties: title, value, description, icon, trend, updatedAt

3. **DataVerificationBadge**
   - Data source: document inventory, verification reports
   - Properties: status, lastUpdated, source

4. **TransparencyScore**
   - Data source: data_index_*.json
   - Properties: score, totalPossible, description, lastAudit

5. **FinancialCategoryNavigation**
   - Data source: document_inventory.json
   - Properties: categories, activeCategory

### Page Mappings

1. **Home.tsx**
   - Data sources: comprehensive_data_index.json
   - Components: Quick links, search functionality

2. **Dashboard.tsx**
   - Data sources: data_index_*.json, budget_data_2024.json
   - Components: FinancialHealthScoreCard, EnhancedMetricCard, DataVerificationBadge

3. **Documents.tsx**
   - Data sources: document_inventory.json
   - Components: Document lists, filters, search

4. **DocumentDetail.tsx**
   - Data sources: document_inventory.json
   - Components: Document viewer, metadata display

5. **Budget.tsx**
   - Data sources: budget_data_2024.json, data_index_*.json
   - Components: BudgetAnalysisChart, financial metrics

6. **Spending.tsx**
   - Data sources: data_index_*.json
   - Components: Spending charts, category breakdown

7. **Investments.tsx**
   - Data sources: data_index_*.json
   - Components: Investment tracking, project lists

8. **Salaries.tsx**
   - Data sources: data_index_*.json
   - Components: Salary data, employee information

9. **Contracts.tsx**
   - Data sources: data_index_*.json
   - Components: Contract lists, tender information

## External Data Sources to Implement

Based on DATA_SOURCES.md, the following external sources need implementation:

1. **Datos Argentina API** (https://datos.gob.ar/)
   - Budget data
   - Contracts data
   - Geographic data

2. **Presupuesto Abierto API** (https://www.presupuestoabierto.gob.ar/sici/api)
   - National budget execution data

3. **Georef Argentina API** (https://apis.datos.gob.ar/georef)
   - Geographic reference data for Carmen de Areco

4. **Official Municipal Website** (https://carmendeareco.gob.ar)
   - Live scraping for latest documents
   - Ordinances and resolutions

5. **Boletín Oficial Municipal**
   - Official announcements and notices

6. **Licitaciones Carmen de Areco**
   - Active tenders and contracts

## Data Integration Strategy

1. **Primary Data Source**: Local JSON files in repository
2. **Secondary Data Source**: External APIs listed above
3. **Fallback Data Source**: Hardcoded sample data for development

## Update Frequency

| Data Type | Update Frequency | Source | Method |
|-----------|------------------|--------|--------|
| Budget | Monthly | Municipal Budget Office | Direct request + scraping |
| Contracts | Weekly | Official Gazette | Automated scraping |
| Projects | Monthly | Municipality Website | Automated scraping |
| Declarations | Quarterly | Anticorruption Office | API + manual verification |
| Ordinances | Weekly | Municipal Bulletin | Automated scraping |