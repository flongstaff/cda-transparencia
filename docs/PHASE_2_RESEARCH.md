# Phase 2: Open Data Catalog & Accessibility Enhancement

## Objective
Expand the Carmen de Areco Transparency Portal with reusable open data in standard formats following AAIP guidelines for transparency system organization and accessibility compliance (WCAG 2.1 AA standards).

## Implementation Approach

### 1. Open Data Categories Based on AAIP Guidelines
Following AAIP's transparency indices methodology, we'll implement 12 standardized categories:

1. **Planning and Budgeting** - Budget ordinances, planning documents, 4-year plans
2. **Institutional Information** - Structure, contact info, functions, organizational charts
3. **Normative Framework** - Laws, ordinances, regulations, internal norms
4. **Economic and Financial Information** - Budgets, execution, contracts, expenses
5. **Public Procurement** - Tenders, contracts, procurement procedures
6. **Public Services** - Services offered, performance indicators, quality metrics
7. **Human Resources** - Personnel directory, salaries, declarations, positions
8. **Infrastructure and Works** - Public works, infrastructure projects, investments
9. **Transparency and Access to Information** - SIAO structure, request statistics
10. **Social Programs** - Social assistance, educational programs, healthcare programs
11. **Citizen Participation** - Public hearings, consultation mechanisms, participation tools
12. **Evaluation and Control** - Internal controls, audit reports, evaluation results

### 2. Accessibility Implementation (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios (4.5:1 minimum)
- Alt text for all images
- Semantic HTML structure
- ARIA labels and descriptions
- Skip to content links
- Resizable text (up to 200%)

### 3. Open Data Standards
- Multiple format availability (CSV, JSON, Excel, PDF)
- Metadata compliance with AAIP standards
- Update frequency indicators
- Data quality metrics
- API endpoints for developers
- Machine-readable formats

### 4. Technical Implementation Plan

#### Frontend Components:
- `OpenDataCatalog.tsx` - Main catalog interface
- `DataCategoryCard.tsx` - Individual category display component
- `DataFormatSelector.tsx` - Format selection controls
- `AccessibilityToolbar.tsx` - Accessibility enhancement controls

#### Backend Services:
- `openDataService.js` - Open data retrieval and formatting
- `metadataService.js` - Metadata management
- `accessibilityService.js` - Accessibility validation

#### Data Files:
- `data-categories-structure.json` - Category definitions
- `metadata-standards.json` - AAIP-compliant metadata schema
- `accessibility-checklist.json` - WCAG compliance checklist

## Implementation Files to Create

1. `frontend/src/components/OpenDataCatalog.tsx` - Main catalog component
2. `frontend/src/components/DataCategoryCard.tsx` - Category card component
3. `frontend/src/components/AccessibilityToolbar.tsx` - Accessibility tools
4. `frontend/src/components/DataFormatSelector.tsx` - Format selection UI
5. `frontend/src/services/openDataService.ts` - Open data service
6. `frontend/src/services/metadataService.ts` - Metadata service
7. `backend/src/services/openDataService.js` - Backend open data service
8. `data/categories-structure.json` - Category definitions
9. `data/metadata-standards.json` - Metadata schema
10. `data/accessibility-standards.json` - WCAG compliance data

## AAIP Compliance Measures
- All categories align with AAIP transparency index methodology
- Update frequencies follow AAIP regulatory guidelines
- Accessibility features comply with AAIP pedagogical guidelines
- Proactive publication schedule aligns with AAIP requirements
- Metadata structure follows AAIP standards