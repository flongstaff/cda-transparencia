# Consolidated Documentation for Transparency Portal

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technical Implementation](#technical-implementation)
3. [Features and Requirements](#features-and-requirements)
4. [Data Management](#data-management)
5. [Development Plan](#development-plan)
6. [API Documentation](#api-documentation)
7. [Deployment and Infrastructure](#deployment-and-infrastructure)
8. [Current Status and Progress](#current-status-and-progress)

---

## PROJECT OVERVIEW

### Project Summary
The Carmen de Areco Transparency Portal is an open-source government transparency platform designed to provide citizens with easy access to information about government activities, budgets, and decision-making processes. Based on a detailed financial analysis of the municipality of Carmen de Areco in Buenos Aires, Argentina, this portal aims to promote accountability and citizen engagement through accessible, comprehensive public data.

### Key Features
1. **Property Declarations Tracking**: Display officials' property declarations with analysis
2. **Salary Information**: Show detailed salary structures and adjustments
3. **Public Tenders**: Track tender processes and execution status
4. **Financial Reports**: Present comprehensive budget and expenditure analysis
5. **Treasury Movements**: Visualize cash flow and expense categorization
6. **Revenue Tracking**: Monitor fees, rights, and other municipal income
7. **Operational Expenses**: Track maintenance and service costs
8. **Municipal Debt**: Analyze debt tracking and loan monitoring
9. **Investments and Assets**: Present asset inventory and depreciation analysis
10. **Transparency Metrics**: Calculate and display transparency indices
11. **Financial Indicators**: Show key financial metrics and solvency analysis
12. **Citizen Participation**: Facilitate public engagement and feedback
13. **Financial Projections**: Provide forecasting and scenario planning

### Technology Stack
**Frontend:**
- React with TypeScript
- Vite build tool
- Tailwind CSS for styling
- React Router for navigation
- Recharts for data visualization
- Framer Motion for animations
- Lucide React for icons

**Backend:**
- Node.js runtime
- Express.js web framework
- PostgreSQL database
- Sequelize ORM

**Infrastructure:**
- GitHub Pages for frontend hosting
- Self-hosted backend on Proxmox server
- Nginx reverse proxy
- Let's Encrypt SSL certificates

### Source Materials
The project is based on extensive financial documentation including:
- Reporte Completo.md: Comprehensive 2000+ line analysis
- Yearly Financial Reports: PDF documents from 2018-2025
- Property Declarations: Official documents from 2019-2024
- Budget Documents: Approved budgets and execution reports
- Tender Documents: Public tender processes and results

---

## TECHNICAL IMPLEMENTATION

### System Architecture
The Carmen de Areco transparency portal now has a comprehensive data management system with year-based data switching, reliable data sources integration, and automated collection scripts.

#### Key Features Implemented
1. **Year-Based Data Switching** ✅
   - Dynamic year selection: All pages now respond to year changes
   - Real-time data loading: Data updates automatically when switching years
   - Growth factor calculations: Realistic year-over-year projections
   - Historical data support: Complete data for 2022-2025

2. **Database Layer for Live and Cold Data** ✅
   - SQLite database: Full schema with tables for documents, budget, revenue, contracts
   - Data source management: Live, cold, and archive source tracking
   - Cross-reference validation: Automatic data integrity checking
   - Backup and restore: Complete data protection system

3. **Reliable Data Source Integration** ✅
   - Official site crawler: Downloads from carmendeareco.gob.ar/transparencia/
   - Web Archive spider: Crawls archive.org snapshots
   - Multi-source comparison: Validates data between official, archive, and local sources
   - Document categorization: Automatic classification (budget, contracts, reports, etc.)

4. **Automated Data Collection Scripts** ✅
   - Full synchronization: Daily automated sync with all sources
   - Incremental updates: Hourly checks for new documents
   - Deep crawling: Weekly comprehensive site analysis
   - Scheduled tasks: Cron-based automation system

5. **Live Document Preview System** ✅
   - PDF Viewer: Full-featured document preview with zoom, rotation, navigation
   - Document Explorer: Integrated document browser with live data visualization
   - Split-view interface: Documents alongside related charts and analysis
   - Multi-source document access: Official, archive, and backup document retrieval

### Data Flow Architecture
```
Official Site → Data Collector → SQLite Database → Data Sync Manager → Frontend DataService → Year-Based Components
Web Archive → Web Spider →                    ↗
Local Backups → Database Manager →          ↗
```

---

## FEATURES AND REQUIREMENTS

### GEMINI.md Requirements
Based on the GEMINI.md documentation, the project requires implementation of the following features:

#### A. Meetings & Decisions
- Public meeting schedules, agendas, minutes, decisions, roll-call votes
- Frontend Pages: Meetings list, Meeting detail, Decisions index
- API Endpoints: `/api/meetings`, `/api/meetings/:id`, `/api/decisions`, CRUD endpoints

#### B. Budgets & Financial Reports (RAFAM-compatible)
- Yearly budgets, execution, revenue/expense categories, charts
- Frontend Pages: Budgets overview, Year detail with Recharts, CSV/JSON export
- API Endpoints: `/api/budgets`, `/api/budgets/:id`, `/api/exports/budgets.csv`, CRUD endpoints

#### C. Public Tenders (Licitaciones) & Execution
- Tender announcements, bidders, awards, status tracking, delays
- Frontend Pages: Tenders list + filters, tender detail
- API Endpoints: `/api/tenders`, `/api/tenders/:id`, CRUD endpoints

#### D. Property Declarations (Declaraciones Juradas Patrimoniales)
- Asset declarations, omission flags, consistency checks vs. income
- Frontend Pages: Directory, Declaration detail, "Observations/Anomalies"
- API Endpoints: `/api/declarations`, `/api/declarations/:id`, CRUD endpoints

#### E. Salaries (Sueldos Básicos Brutos)
- Salary tables, adjustments vs. inflation, deductions (SOMA, IPS)
- Frontend Pages: Salary explorer, period comparisons, inflation overlay
- API Endpoints: `/api/salaries`, `/api/salary-tables`, CRUD endpoints

#### F. Treasury Movements (Movimientos de Tesorería)
- Cash inflows/outflows, categorical drill-downs, debt/advances
- Frontend Pages: Cashflow dashboard, category explorer, time series
- API Endpoints: `/api/treasury`, CRUD endpoints

#### G. Fees & Rights (Tasas y Derechos)
- Revenue per fee type, collection efficiency, arrears
- Frontend Pages: Fee performance dashboards, arrears heatmap
- API Endpoints: `/api/fees`, CRUD endpoints

#### H. Operational Expenses (Gastos Operativos)
- Maintenance/services, admin costs, supplier breakdowns
- Frontend Pages: Expense explorer with filters, supplier leaderboard
- API Endpoints: `/api/op-expenses`, CRUD endpoints

#### I. Municipal Debt (Deuda)
- Loans, maturities, rates, repayment schedules, solvency/coverage
- Frontend Pages: Debt overview, schedule visualization, stress tests
- API Endpoints: `/api/debts`, `/api/debts/:id/schedule`, CRUD endpoints

#### J. Investments & Assets
- Asset registry, categories, useful life, depreciation
- Frontend Pages: Asset inventory table, depreciation charts
- API Endpoints: `/api/assets`, CRUD endpoints

#### K. Financial Indicators & Transparency Index
- Compute solvency/liquidity/efficiency ratios; transparency index composites
- Frontend Pages: Indicators dashboard, methodology modal
- API Endpoints: `/api/indicators`, `/api/transparency-index`, POST `/api/indicators/recompute`

#### L. Citizen Participation & Governance
- Consultation topics, surveys, submissions, FOI/Access to Info requests
- Frontend Pages: Consultations, participate forms, "Solicitar Información" form
- API Endpoints: `/api/consultations`, `/api/consultations/:id/submit`, `/api/foi/requests`

#### M. Projections & Scenarios
- Simple forecasting, multiple scenarios
- Frontend Pages: Projection builder, scenario compare
- API Endpoints: `/api/projections`, POST `/api/projections/run`, CRUD endpoints

#### N. Documents & Open Data
- Document repository, anti-virus scan, typed metadata, open data exports
- Frontend Pages: Recent Documents, type/tag filters, preview/download, dataset catalog
- API Endpoints: `/api/documents`, `/api/documents/upload`, `/api/exports/*.csv|.json`

---

## DATA MANAGEMENT

### Data Sources
The project will collect data from municipal, provincial (Buenos Aires), and national sources, including hidden, archived, and deleted content.

#### Municipal Level
- Official Portal: https://carmendeareco.gob.ar/transparencia/
- Government Section: https://carmendeareco.gob.ar/gobierno/
- HCD Blog: http://hcdcarmendeareco.blogspot.com/

#### Provincial Level (Buenos Aires)
- PBAC System: https://pbac.cgp.gba.gov.ar/ - Provincial procurement system
- Licitaciones: https://licitacionesv2.gobdigital.gba.gob.ar/obras
- Transparency: https://www.gba.gob.ar/transparencia_institucional
- Official Bulletin: https://www.gba.gob.ar/boletin_oficial

#### National Level
- COMPR.AR: https://comprar.gob.ar/ - National procurement
- CONTRAT.AR: https://contratar.gob.ar/ - Public works contracts
- Official Bulletin: https://www.boletinoficial.gob.ar/
- InfoLEG: https://www.infoleg.gob.ar/ - Legal information

### Data Collection Plan
A comprehensive scraper will be deployed to collect data from all known government sources. The scraper will search for contracts, tenders, employee records, and budget documents.

Hidden data will be extracted using the Wayback Machine, searching for deleted pages, and performing OCR on images.

### Data Processing
Collected data will be processed and organized. This includes:
- Validation: Verifying document authenticity and cross-referencing multiple sources
- Normalization: Using a common schema (e.g., Open Contracting Data Standard) to map fields from different sources
- Storage: Storing raw and processed data in a PostgreSQL database

### Data Validation System
#### Integrity Checks
- Document hash verification: Ensures file integrity
- Cross-source validation: Compares data between sources
- Temporal consistency: Checks for reasonable year-over-year changes
- Completeness scoring: Measures data coverage

#### Automated Quality Assurance
```javascript
// Example validation report
{
  overall_score: 87,
  data_completeness: 92,
  source_reliability: 85,
  temporal_consistency: 84,
  recommendations: [
    "Investigate missing budget documents for Q3 2024",
    "Verify contract amounts show unusual variance"
  ]
}
```

---

## DEVELOPMENT PLAN

### Agile Development Approach
We'll follow an agile development approach with iterative sprints, focusing on delivering value to users early and often.

### Phase 1: Foundation (Weeks 1-2)
#### Week 1: Project Setup
1. Initialize Git repository
2. Create project structure
3. Set up development environments
4. Define basic package.json for both frontend and backend
5. Set up ESLint and Prettier for code consistency
6. Create README.md with project description and setup instructions

#### Week 2: Data Analysis and API Design
1. Complete analysis of Reporte Completo.md
2. Design database schema
3. Design API endpoints
4. Create API documentation using OpenAPI/Swagger
5. Set up database connection in backend

### Phase 2: Core Implementation (Weeks 3-6)
#### Weeks 3-4: Backend Development
1. Implement database models and migrations
2. Develop data import scripts to process Reporte Completo.md
3. Build API endpoints
4. Implement error handling and validation
5. Add unit tests for API endpoints
6. Set up API documentation with Swagger UI

#### Weeks 5-6: Frontend Development
1. Create basic layout and navigation
2. Implement dashboard with key financial indicators
3. Build pages for major report sections
4. Develop data visualization components
5. Implement responsive design
6. Add basic styling with Material-UI

### Phase 3: Integration and Enhancement (Weeks 7-8)
#### Week 7: Integration
1. Connect frontend to backend API
2. Implement data loading states and error handling in UI
3. Add search and filtering to frontend
4. Implement pagination for large datasets
5. Conduct integration testing

#### Week 8: Advanced Features
1. Add detailed data visualizations
2. Implement accessibility features (WCAG 2.1 compliance)
3. Add public consultation platform features
4. Develop open data API endpoints
5. Create user documentation

### Phase 4: Testing and Deployment (Weeks 9-10)
#### Week 9: Testing
1. Perform unit testing for frontend components
2. Conduct end-to-end testing
3. Perform accessibility testing
4. Security review
5. Performance optimization
6. User acceptance testing with stakeholders

#### Week 10: Deployment
1. Set up hosting environment
2. Configure CI/CD pipeline
3. Deploy frontend and backend
4. Configure domain and SSL certificates
5. Implement monitoring and logging
6. Create deployment documentation

### Phase 5: Documentation and Maintenance (Ongoing)
#### Ongoing Tasks
1. Maintain and update documentation
2. Plan for regular data updates
3. Establish maintenance procedures
4. Set up issue tracking and feature requests
5. Gather user feedback for future improvements

---

## API DOCUMENTATION

### API Endpoints
#### Property Declarations
- `GET /api/declarations` - Get all property declarations
- `GET /api/declarations/:year` - Get declarations for a specific year
- `GET /api/declarations/official/:name` - Get declarations for a specific official

#### Salaries
- `GET /api/salaries` - Get all salary data
- `GET /api/salaries/:year` - Get salary data for a specific year
- `GET /api/salaries/official/:name` - Get salary data for a specific official

#### Public Tenders
- `GET /api/tenders` - Get all public tenders
- `GET /api/tenders/:year` - Get tenders for a specific year
- `GET /api/tenders/status/:status` - Get tenders by execution status

#### Financial Reports
- `GET /api/reports` - Get all financial reports
- `GET /api/reports/:year` - Get reports for a specific year
- `GET /api/reports/:year/:quarter` - Get reports for a specific year and quarter

#### Treasury Movements
- `GET /api/treasury` - Get all treasury movements
- `GET /api/treasury/:year` - Get movements for a specific year
- `GET /api/treasury/category/:category` - Get movements by category

#### Fees and Rights
- `GET /api/fees` - Get all fees and rights data
- `GET /api/fees/:year` - Get data for a specific year
- `GET /api/fees/category/:category` - Get data by category

#### Operational Expenses
- `GET /api/expenses` - Get all operational expenses
- `GET /api/expenses/:year` - Get expenses for a specific year
- `GET /api/expenses/category/:category` - Get expenses by category

#### Municipal Debt
- `GET /api/debt` - Get all municipal debt data
- `GET /api/debt/:year` - Get debt data for a specific year
- `GET /api/debt/status/:status` - Get debt by status

#### Investments and Assets
- `GET /api/investments` - Get all investments and assets
- `GET /api/investments/:year` - Get data for a specific year
- `GET /api/investments/type/:type` - Get data by asset type

#### Financial Indicators
- `GET /api/indicators` - Get all financial indicators
- `GET /api/indicators/:year` - Get indicators for a specific year
- `GET /api/indicators/name/:name` - Get specific indicator data

### Database Schema
#### 1. Property Declarations (Declaraciones Juradas Patrimoniales)
```sql
CREATE TABLE property_declarations (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  official_name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  cuil VARCHAR(20),
  declaration_date DATE,
  status VARCHAR(50),
  uuid VARCHAR(255),
  observations TEXT,
  public_verification TEXT,
  critical_review TEXT
);
```

#### 2. Salaries (Sueldos)
```sql
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  official_name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  basic_salary DECIMAL(12, 2),
  adjustments TEXT,
  deductions TEXT,
  net_salary DECIMAL(12, 2),
  inflation_rate DECIMAL(5, 2)
);
```

#### 3. Public Tenders (Licitaciones Públicas)
```sql
CREATE TABLE public_tenders (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(12, 2),
  awarded_to VARCHAR(255),
  award_date DATE,
  execution_status VARCHAR(100),
  delay_analysis TEXT
);
```

#### 4. Financial Reports (RAFAM)
```sql
CREATE TABLE financial_reports (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  quarter INTEGER,
  report_type VARCHAR(100),
  income DECIMAL(15, 2),
  expenses DECIMAL(15, 2),
  balance DECIMAL(15, 2),
  execution_percentage DECIMAL(5, 2)
);
```

#### 5. Treasury Movements (Movimientos de Tesorería)
```sql
CREATE TABLE treasury_movements (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  amount DECIMAL(15, 2),
  balance DECIMAL(15, 2),
  debt_tracking TEXT
);
```

#### 6. Fees and Rights (Tasas y Derechos)
```sql
CREATE TABLE fees_rights (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  category VARCHAR(100),
  description TEXT,
  revenue DECIMAL(15, 2),
  collection_efficiency DECIMAL(5, 2)
);
```

#### 7. Operational Expenses (Gastos Operativos)
```sql
CREATE TABLE operational_expenses (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  category VARCHAR(100),
  description TEXT,
  amount DECIMAL(15, 2),
  administrative_analysis TEXT
);
```

#### 8. Municipal Debt (Deuda Municipal)
```sql
CREATE TABLE municipal_debt (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  debt_type VARCHAR(100),
  description TEXT,
  amount DECIMAL(15, 2),
  interest_rate DECIMAL(5, 2),
  due_date DATE,
  status VARCHAR(50)
);
```

#### 9. Investments and Assets (Inversiones y Activos)
```sql
CREATE TABLE investments_assets (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  asset_type VARCHAR(100),
  description TEXT,
  value DECIMAL(15, 2),
  depreciation DECIMAL(15, 2),
  location VARCHAR(255)
);
```

#### 10. Financial Indicators (Indicadores Financieros)
```sql
CREATE TABLE financial_indicators (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  indicator_name VARCHAR(100),
  value DECIMAL(15, 2),
  description TEXT,
  comparison_previous_year DECIMAL(5, 2)
);
```

---

## DEPLOYMENT AND INFRASTRUCTURE

### Hosting and Deployment
#### Frontend
- GitHub Pages: Free hosting with automatic SSL
- Global CDN: Fast worldwide access
- Easy Updates: Simple deployment process

#### Backend
- Self-hosted: On Proxmox server for full control
- Docker Ready: Containerized deployment option
- Scalable: Can grow with project needs

#### Database
- PostgreSQL: Robust, reliable database
- Self-managed: Full control over data
- Backup Ready: Automated backup strategies

### Security
- SSL Encryption: Let's Encrypt certificates
- Reverse Proxy: Nginx for security and performance
- Rate Limiting: Protection against abuse
- CORS: Controlled cross-origin requests

### Accessibility
The portal follows WCAG 2.1 guidelines to ensure:
- Perceivable: Text alternatives, adaptable content, distinguishable elements
- Operable: Keyboard accessibility, enough time, seizures and physical reactions
- Understandable: Readable content, predictable navigation, input assistance
- Robust: Compatible with current and future technologies

### Performance
#### Optimizations
- Frontend: Vite for fast builds and hot module replacement
- Backend: PM2 for process management
- Database: Connection pooling and query optimization
- Caching: (Planned) Redis for frequently accessed data
- CDN: GitHub Pages global content delivery

#### Benchmarks
- Page Load: Target < 2 seconds
- API Response: Target < 500ms
- Database Queries: Target < 100ms

### Maintenance
#### Automated Processes
- Backups: Daily database dumps
- SSL Renewal: Automatic certificate renewal
- Monitoring: Health checks and alerts
- Updates: Automated security updates

#### Manual Processes
- Content Updates: Quarterly data refreshes
- Security Audits: Monthly reviews
- Performance Reviews: Quarterly analysis
- Feature Updates: As needed based on feedback

---

## CURRENT STATUS AND PROGRESS

### Integration Success
The transparency portal has successfully achieved its core integration objectives with:
- Complete frontend ↔ backend ↔ database connectivity
- Real data flowing through all components
- Robust error handling and user experience
- Solid technical foundation

### Current Implementation Status
#### Implemented Pages (10/14)
1. Home (/) - Basic homepage with navigation
2. Budget (/budget) - Budget overview with charts and data
3. Public Spending (/spending) - Spending analysis and visualization
4. Revenue (/revenue) - Revenue tracking and analysis
5. Contracts (/contracts) - Contract information and tracking
6. Database (/database) - Document database with search and filters
7. Reports (/reports) - Financial reports and analysis
8. Whistleblower (/whistleblower) - Reporting mechanism
9. About (/about) - Project information
10. Contact (/contact) - Contact information

#### Missing Pages (4/14)

2. Property Declarations - No dedicated page (data exists but no specialized page)
3. Salaries - No dedicated page (data exists but no specialized page)
4. API Explorer - No API documentation/explorer page

### Path to Full Compliance
#### Phase 1: Missing Pages (Week 1)
1. Create Property Declarations Page (/declarations)
2. Create Salaries Page (/salaries)
3. Create Meetings & Decisions Page (/meetings)
4. Create API Explorer Page (/api-explorer)

#### Phase 2: API Enhancement (Week 2)
1. Add CRUD endpoints for admin functionality
2. Implement data export endpoints (CSV/JSON)
3. Add advanced filtering parameters
4. Add API documentation (Swagger/OpenAPI)

#### Phase 3: Infrastructure Hardening (Week 3)
1. Implement database migration system
2. Add structured logging (pino)
3. Implement JWT authentication
4. Add background job system (BullMQ)

#### Phase 4: Advanced Features (Week 4)
1. Add citizen participation features
2. Implement projection and scenario planning
3. Create specialized data visualizations
4. Add data provenance tracking

### Success Metrics
#### Current Status
| Metric | Status | Target |
|--------|--------|--------|
| Integration | ✅ 100% | 100% |
| Core Pages | ✅ 71% | 100% |
| Core API | ✅ 100% | 100% |
| Admin Features | ❌ 0% | 100% |
| Advanced Features | ❌ 0% | 100% |
| Infrastructure | ⚠️ 38% | 100% |

#### User Experience
- ✅ Loading states implemented
- ✅ Error handling with fallback
- ✅ Responsive design maintained
- ✅ Real data displayed

#### Technical Excellence
- ✅ Complete data flow
- ✅ API endpoints functional
- ✅ Database connectivity
- ✅ Environment configuration

This consolidated documentation provides a comprehensive overview of the Transparency Portal project, combining all the essential information from the various markdown files in the docs and docs/archive directories.