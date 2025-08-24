# CDA Transparencia - Frontend

This document provides a comprehensive overview of the frontend for the Carmen de Areco transparency portal.

## Table of Contents

- [Project Overview](#project-overview)
- [Project Plan](#project-plan)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Development Conventions](#development-conventions)
- [Features](#features)
  - [A. Meetings & Decisions](#a-meetings--decisions)
  - [B. Budgets & Financial Reports](#b-budgets--financial-reports-rafam-compatible)
  - [C. Public Tenders & Execution](#c-public-tenders-licitaciones--execution)
  - [D. Property Declarations](#d-property-declarations-declaraciones-juradas-patrimoniales)
  - [E. Salaries](#e-salaries-sueldos-básicos-brutos)
  - [F. Treasury Movements](#f-treasury-movements-movimientos-de-tesorería)
  - [G. Fees & Rights](#g-fees--rights-tasas-y-derechos)
  - [H. Operational Expenses](#h-operational-expenses-gastos-operativos)
  - [I. Municipal Debt](#i-municipal-debt-deuda)
  - [J. Investments & Assets](#j-investments--assets)
  - [K. Financial Indicators & Transparency Index](#k-financial-indicators--transparency-index)
  - [L. Citizen Participation & Governance](#l-citizen-participation--governance)
  - [M. Projections & Scenarios](#m-projections--scenarios)
  - [N. Documents & Open Data](#n-documents--open-data)
- [Data Sources and Tools](#data-sources-and-tools)
- [Scripts](#scripts)
- [Testing](#testing)
- [Data Flow](#data-flow)

## Project Overview

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

## Project Plan

The detailed project plan, including implementation priorities and checklists, is available in the [PLAN.md](PLAN.md) file.

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your system.

### Frontend Setup

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

### Backend Setup

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

## Development Conventions

### Frontend

- The frontend uses functional components with hooks.
- Styling is done with Tailwind CSS utility classes.
- The code is written in TypeScript, so type safety is enforced.
- The project uses ESLint for linting.

### Backend

- The backend follows a standard Express.js project structure with routes, controllers, and models.
- It uses Sequelize as an ORM for interacting with the PostgreSQL database.
- Environment variables are used for configuration.
- The code is written in JavaScript.

## Frontend Architecture

The frontend is built with modern React patterns and TypeScript for type safety.

### Component Structure
- **Pages**: Main route components in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **Services**: API integration in `src/services/`
- **Types**: TypeScript definitions in `src/types/`

### Key Technologies
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **Framer Motion**: Animations and transitions
- **Lucide React**: Modern icon library

> **📚 For complete feature documentation, see [docs/FEATURES.md](../docs/FEATURES.md)**

## Data Sources and Tools

<details>
<summary>Click to expand the comprehensive catalog of data sources, tools, and integration ideas.</summary>

# 🌐 Comprehensive Data Sources & Tools Catalog
## Carmen de Areco Transparency Portal - External Resources & Integration Opportunities

---

## 🇦🇷 **ARGENTINE GOVERNMENT DATA SOURCES**

### Federal Level
- **📊 datos.gob.ar** - `https://datos.gob.ar`
  - Primary federal open data portal
  - API: `https://datos.gob.ar/api/3/`
  - **Usable for**: Budget comparisons, federal transfers, economic indicators

- **💰 Argentina Compra** - `https://comprar.gob.ar`
  - Federal procurement system
  - **Usable for**: Cross-reference municipal contracts with federal standards

- **🏛️ InfoLEG** - `http://www.infoleg.gob.ar`
  - Legal information system
  - **Usable for**: Legal framework validation, regulatory compliance

- **📈 INDEC** - `https://www.indec.gob.ar`
  - National statistics institute
  - **Usable for**: Economic indicators, population data, inflation rates

- **🏦 BCRA** - `https://www.bcra.gob.ar`
  - Central Bank data
  - **Usable for**: Exchange rates, monetary policy impact analysis

### Provincial Level (Buenos Aires)
- **🏛️ GBA Transparencia** - `https://www.gba.gob.ar/transparencia`
  - Provincial transparency portal
  - **Usable for**: Provincial budget comparisons, transfers to municipalities

- **📋 GBA Contrataciones** - `https://www.gba.gob.ar/contrataciones`
  - Provincial procurement
  - **Usable for**: Regional contract benchmarking

- **💼 GBA Hacienda** - `https://www.gba.gob.ar/hacienda`
  - Provincial finance ministry
  - **Usable for**: Tax revenue data, municipal coparticipation

### Municipal Networks
- **🏘️ FAM** - `https://www.fam.org.ar`
  - Federation of Argentine Municipalities
  - **Usable for**: Inter-municipal comparisons, best practices

---

## 🌍 **INTERNATIONAL TRANSPARENCY SOURCES**

### Global Standards
- **🌐 Open Government Partnership** - `https://www.opengovpartnership.org`
  - Global transparency standards
  - **Usable for**: Best practices, compliance frameworks

- **📊 World Bank Open Data** - `https://data.worldbank.org`
  - International development data
  - **Usable for**: Comparative analysis, development indicators

### Regional Networks
- **🇺🇾 Uruguay Datos Abiertos** - `https://catalogodatos.gub.uy`
- **🇧🇷 Brasil Dados Abertos** - `https://dados.gov.br`
- **🇨🇱 Chile Datos Abiertos** - `https://datos.gob.cl`
  - **Usable for**: Regional benchmarking, similar municipality comparisons

---

## 🛠️ **GITHUB PROJECTS & TOOLS**

### Data Collection & Scraping
1. **📥 ScrapyJS** - `https://github.com/scrapyjs/scrapyjs`
   - JavaScript web scraping
   - **Usage**: Scrape dynamic transparency portals

2. **🕷️ Puppeteer** - `https://github.com/puppeteer/puppeteer`
   - Headless browser automation
   - **Usage**: Screenshot generation, dynamic content scraping

3. **⚡ Playwright** - `https://github.com/microsoft/playwright`
   - Cross-browser automation
   - **Usage**: Multi-browser transparency portal testing

4. **🔄 Cheerio** - `https://github.com/cheeriojs/cheerio`
   - Server-side HTML parsing
   - **Usage**: Parse government HTML documents

### Data Processing & Validation
5. **📋 Pandas.js** - `https://github.com/opensource9ja/danfojs`
   - Data manipulation in JavaScript
   - **Usage**: Process CSV/Excel government data

6. **🔍 Joi** - `https://github.com/sideway/joi`
   - Data validation library
   - **Usage**: Validate government data schemas

7. **📊 D3.js** - `https://github.com/d3/d3`
   - Data visualization
   - **Usage**: Advanced transparency charts

8. **🧮 Simple-statistics** - `https://github.com/simple-statistics/simple-statistics`
   - Statistical analysis
   - **Usage**: Budget variance analysis, trend detection

### Document Processing
9. **📄 PDF-lib** - `https://github.com/Hopding/pdf-lib`
   - PDF manipulation
   - **Usage**: Extract data from government PDFs

10. **📝 Mammoth.js** - `https://github.com/mwilliamson/mammoth.js`
    - Word document conversion
    - **Usage**: Process .docx transparency reports

11. **📊 ExcelJS** - `https://github.com/exceljs/exceljs`
    - Excel file processing
    - **Usage**: Parse government budget spreadsheets

### Database & Storage
12. **🗄️ TypeORM** - `https://github.com/typeorm/typeorm`
    - Database ORM
    - **Usage**: Manage transparency data relationships

13. **⚡ Prisma** - `https://github.com/prisma/prisma`
    - Modern database toolkit
    - **Usage**: Type-safe database operations

### Monitoring & Alerting
14. **🔔 Node-cron** - `https://github.com/node-cron/node-cron`
    - Scheduled tasks
    - **Usage**: Automated data collection

15. **📧 Nodemailer** - `https://github.com/nodemailer/nodemailer`
    - Email notifications
    - **Usage**: Alert on data discrepancies

---

## 🏛️ **TRANSPARENCY-SPECIFIC PROJECTS**

### Open Source Platforms
16. **🌐 CKAN** - `https://github.com/ckan/ckan`
    - Open data platform
    - **Usage**: Structure transparency data catalog

17. **📊 OpenSpending** - `https://github.com/openspending/openspending`
    - Budget visualization platform
    - **Usage**: Advanced budget analysis tools

18. **🏛️ Alaveteli** - `https://github.com/mysociety/alaveteli`
    - Freedom of Information platform
    - **Usage**: FOI request management

### Government-Specific
19. **🇺🇸 Open Data Census** - `https://github.com/okfn/opendatacensus`
    - Data availability assessment
    - **Usage**: Evaluate transparency completeness

20. **🏛️ Budget Data Package** - `https://github.com/openspending/budget-data-package`
    - Budget data standards
    - **Usage**: Standardize budget data format

---

## 🔍 **WEB ARCHIVING & HISTORICAL DATA**

### Archive Services
- **🗄️ Internet Archive** - `https://archive.org`
  - Wayback Machine API: `https://archive.org/wayback/available`
  - **Usage**: Historical transparency data recovery

- **📚 Archive.today** - `https://archive.today`
  - Real-time archiving
  - **Usage**: Preserve current transparency snapshots

- **🌐 WebCite** - `http://webcitation.org`
  - Academic web archiving
  - **Usage**: Create permanent citations

### Archive Tools
21. **📦 Archivebox** - `https://github.com/ArchiveBox/ArchiveBox`
    - Self-hosted web archiving
    - **Usage**: Create local transparency archive

22. **🕷️ Wayback Machine Downloader** - `https://github.com/hartator/wayback-machine-downloader`
    - Bulk download from archives
    - **Usage**: Download historical government sites

---

## 🔐 **PRIVACY & COMPLIANCE TOOLS**

### Data Protection
23. **🛡️ Microsoft Presidio** - `https://github.com/microsoft/presidio`
    - PII detection and anonymization
    - **Usage**: Enhanced privacy protection

24. **🔒 Faker.js** - `https://github.com/faker-js/faker`
    - Generate fake data for testing
    - **Usage**: Create anonymized test datasets

25. **🏛️ GDPR Compliance** - `https://github.com/good-labs/gdpr`
    - GDPR compliance tools
    - **Usage**: Ensure European data protection compliance

---

## 🚀 **INFRASTRUCTURE & DEPLOYMENT**

### Hosting & CDN
- **⚡ Cloudflare** - `https://cloudflare.com`
  - CDN, security, performance
  - **Usage**: Fast, secure transparency portal delivery

- **🌐 Vercel** - `https://vercel.com`
  - Serverless deployment
  - **Usage**: Easy deployment with automatic scaling

### Monitoring
26. **📊 Grafana** - `https://github.com/grafana/grafana`
    - Monitoring dashboards
    - **Usage**: Track data collection success rates

27. **🔔 Uptime Kuma** - `https://github.com/louislam/uptime-kuma`
    - Uptime monitoring
    - **Usage**: Monitor transparency portal availability

---

## 🤖 **AI & AUTOMATION TOOLS**

### Natural Language Processing
28. **🧠 Natural** - `https://github.com/NaturalNode/natural`
    - NLP for JavaScript
    - **Usage**: Analyze government document content

29. **📝 Compromise** - `https://github.com/spencermountain/compromise`
    - Text processing
    - **Usage**: Extract entities from government documents

### Machine Learning
30. **🤖 TensorFlow.js** - `https://github.com/tensorflow/tfjs`
    - Machine learning in browser
    - **Usage**: Detect anomalies in budget data

---

## 📊 **SPECIFIC USE CASES & INTEGRATION IDEAS**

### 1. **Enhanced Data Collection**
```javascript
// Example: Multi-source budget data collection
const dataSources = [
  'https://carmendeareco.gob.ar/transparencia/',
  'https://www.gba.gob.ar/transparencia',
  'https://datos.gob.ar/api/3/action/package_search?q=carmen+areco'
];
```

### 2. **Historical Data Recovery**
```javascript
// Example: Wayback Machine integration
const waybackAPI = 'https://archive.org/wayback/available?url=';
const historicalSnapshots = await getHistoricalData(targetUrl, '2018-2025');
```

### 3. **Cross-Municipal Comparisons**
```javascript
// Example: Compare with similar municipalities
const similarMunicipalities = [
  'San Antonio de Areco',
  'Capitán Sarmiento', 
  'San Andrés de Giles'
];
```

### 4. **Real-time Monitoring**
```javascript
// Example: Monitor transparency portal changes
const monitoringTargets = [
  { url: 'https://carmendeareco.gob.ar/transparencia/', frequency: '1h' },
  { url: 'https://www.gba.gob.ar/transparencia', frequency: '6h' }
];
```

### 5. **Document Processing Pipeline**
```javascript
// Example: Automated document processing
const processingPipeline = [
  'download_pdfs',
  'extract_text',
  'detect_pii',
  'anonymize_data',
  'validate_numbers',
  'store_database'
];
```

---

</details>

## Scripts

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

## Testing

### Frontend

TODO: Add instructions for running frontend tests once a testing framework is set up.

### Backend

To run the backend tests:

```bash
cd backend
npm test
```

## Data Flow

1.  **Data Source:** Data is stored in a PostgreSQL database.
2.  **Backend API:** The Node.js backend uses Sequelize to query the database and exposes the data through a RESTful API.
3.  **Frontend:** The React frontend uses services in `src/services` to make HTTP requests to the backend API. The fetched data is then stored in component state and displayed to the user.
