# Project Overview

This is a transparency portal for the municipality of Carmen de Areco in Buenos Aires, Argentina. The goal is to provide public access to government data, including financial records, public tenders, and salaries.

The project is a full-stack application with a React frontend and a Node.js backend.

**Frontend:**
- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Key Libraries:**
    - `react-router-dom` for routing
    - `recharts` for data visualization
    - `framer-motion` for animations
    - `lucide-react` for icons

**Backend:**
- **Framework:** Express.js
- **Language:** JavaScript
- **Database:** PostgreSQL with Sequelize ORM
- **Key Libraries:**
    - `cors` for handling cross-origin requests
    - `helmet` for security headers
    - `dotenv` for environment variables

# Building and Running

## Frontend

To run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

This will start the development server on `http://localhost:5173`.

To build the frontend for production:

```bash
cd frontend
npm run build
```

## Backend

To run the backend server:

```bash
cd backend
npm install
npm run start
```

To run the backend in development mode with auto-reloading:

```bash
cd backend
npm run dev
```

# Development Conventions

## Frontend

- The frontend uses functional components with hooks.
- Styling is done with Tailwind CSS utility classes.
- The code is written in TypeScript, so type safety is enforced.
- The project uses ESLint for linting.

## Backend

- The backend follows a standard Express.js project structure with routes, controllers, and models.
- It uses Sequelize as an ORM for interacting with the PostgreSQL database.
- Environment variables are used for configuration.
- The code is written in JavaScript.

# Features, API, and Frontend

This section provides a detailed breakdown of the project's features, the corresponding API endpoints, and the required frontend pages.

## A. Meetings & Decisions

- **Features:** Public meeting schedules, agendas, minutes, decisions, roll-call votes.
- **Frontend Pages:** Meetings list, Meeting detail (agenda, minutes, attachments), Decisions index.
- **API Endpoints:**
    - `GET /api/meetings`
    - `GET /api/meetings/:id`
    - `GET /api/decisions`
    - `CRUD /api/meetings` (admin)
    - `CRUD /api/decisions` (admin)

## B. Budgets & Financial Reports (RAFAM-compatible)

- **Features:** Yearly budgets, execution, revenue/expense categories, charts.
- **Frontend Pages:** Budgets overview, Year detail with Recharts, CSV/JSON export.
- **API Endpoints:**
    - `GET /api/budgets?year=`
    - `GET /api/budgets/:id`
    - `GET /api/exports/budgets.csv`
    - `CRUD /api/budgets` (admin)

## C. Public Tenders (Licitaciones) & Execution

- **Features:** Tender announcements, bidders, awards, status tracking, delays, non-execution flags.
- **Frontend Pages:** Tenders list + filters (status/date/amount/department), tender detail (timeline).
- **API Endpoints:**
    - `GET /api/tenders`
    - `GET /api/tenders/:id`
    - `CRUD /api/tenders` (admin)

## D. Property Declarations (Declaraciones Juradas Patrimoniales)

- **Features:** Official/employee asset declarations, omission flags, consistency checks vs. income.
- **Frontend Pages:** Directory, Declaration detail, “Observations/Anomalies.”
- **API Endpoints:**
    - `GET /api/declarations`
    - `GET /api/declarations/:id`
    - `CRUD /api/declarations` (admin)

## E. Salaries (Sueldos Básicos Brutos)

- **Features:** Salary tables, adjustments vs. inflation, deductions (SOMA, IPS).
- **Frontend Pages:** Salary explorer, period comparisons, inflation overlay.
- **API Endpoints:**
    - `GET /api/salaries?period=`
    - `GET /api/salary-tables`
    - `CRUD /api/salaries` (admin)

## F. Treasury Movements (Movimientos de Tesorería)

- **Features:** Cash inflows/outflows, categorical drill-downs, debt/advances.
- **Frontend Pages:** Cashflow dashboard, category explorer, time series.
- **API Endpoints:**
    - `GET /api/treasury?from=&to=&category=`
    - `CRUD /api/treasury` (admin)

## G. Fees & Rights (Tasas y Derechos)

- **Features:** Revenue per fee type, collection efficiency, arrears.
- **Frontend Pages:** Fee performance dashboards, arrears heatmap.
- **API Endpoints:**
    - `GET /api/fees?type=&period=`
    - `CRUD /api/fees` (admin)

## H. Operational Expenses (Gastos Operativos)

- **Features:** Maintenance/services, admin costs, supplier breakdowns.
- **Frontend Pages:** Expense explorer with filters, supplier leaderboard.
- **API Endpoints:**
    - `GET /api/op-expenses?period=&supplier=`
    - `CRUD /api/op-expenses` (admin)

## I. Municipal Debt (Deuda)

- **Features:** Loans, maturities, rates, repayment schedules, solvency/coverage.
- **Frontend Pages:** Debt overview, schedule visualization, stress tests.
- **API Endpoints:**
    - `GET /api/debts`
    - `GET /api/debts/:id/schedule`
    - `CRUD /api/debts` (admin)

## J. Investments & Assets

- **Features:** Asset registry, categories, useful life, depreciation.
- **Frontend Pages:** Asset inventory table, depreciation charts.
- **API Endpoints:**
    - `GET /api/assets?category=`
    - `CRUD /api/assets` (admin)

## K. Financial Indicators & Transparency Index

- **Features:** Compute solvency/liquidity/efficiency ratios; transparency index composites.
- **Frontend Pages:** Indicators dashboard, methodology modal.
- **API Endpoints:**
    - `GET /api/indicators?year=`
    - `GET /api/transparency-index?year=`
    - `POST /api/indicators/recompute` (admin)

## L. Citizen Participation & Governance

- **Features:** Consultation topics, surveys, submissions, FOI/Access to Info requests.
- **Frontend Pages:** Consultations (open/closed), participate forms, “Solicitar Información” form.
- **API Endpoints:**
    - `GET /api/consultations`
    - `POST /api/consultations/:id/submit`
    - `POST /api/foi/requests`

## M. Projections & Scenarios

- **Features:** Simple forecasting (trend/seasonal), multiple scenarios saved for a year.
- **Frontend Pages:** Projection builder, scenario compare.
- **API Endpoints:**
    - `GET /api/projections?year=`
    - `POST /api/projections/run`
    - `CRUD /api/projections` (admin)

## N. Documents & Open Data

- **Features:** Document repository (PDF/CSV/MD), anti-virus scan, typed metadata, open data exports.
- **Frontend Pages:** Recent Documents, type/tag filters, preview/download, dataset catalog.
- **API Endpoints:**
    - `GET /api/documents?type=&tag=`
    - `POST /api/documents/upload`
    - `GET /api/exports/*.csv|.json`

# Scripts

The `scripts/` directory contains several utility scripts to automate common tasks:

- `init_backend.sh`: Initializes the backend directory structure and `package.json`.
- `organize_materials.sh`: Organizes source materials into categorized directories.
- `setup_gh_pages.sh`: Configures the frontend for deployment to GitHub Pages.
- `deploy.sh`: Deploys the frontend to GitHub Pages.
- `transparencia_spider.py`: A Scrapy spider for scraping data.
- `web_scraper.py`: A general-purpose web scraper.
- `osint_monitor_compliance.py`: A script for monitoring compliance.

To make the shell scripts executable, run:

```bash
chmod +x scripts/*.sh
```

# Testing

## Frontend

TODO: Add instructions for running frontend tests once a testing framework is set up.

## Backend

To run the backend tests:

```bash
cd backend
npm test
```

# Data Flow

1.  **Data Source:** Data is stored in a PostgreSQL database.
2.  **Backend API:** The Node.js backend uses Sequelize to query the database and exposes the data through a RESTful API.
3.  **Frontend:** The React frontend uses services in `src/services` to make HTTP requests to the backend API. The fetched data is then stored in component state and displayed to the user.

# Next Steps for Gold Standard Compliance

### Immediate Priorities (Next 1-2 Weeks)
1. **Database Migrations**: Implement proper database migration system
2. **API Documentation**: Add OpenAPI spec and Swagger UI
3. **Authentication**: Implement JWT-based authentication for admin functions
4. **Structured Logging**: Replace console.log with pino or similar structured logger
5. **Data Provenance**: Add source tracking to data models
