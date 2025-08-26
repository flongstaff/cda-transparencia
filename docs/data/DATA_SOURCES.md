# Data Sources

The Carmen de Areco Transparency Portal aggregates data from multiple official sources to provide a comprehensive view of municipal financial transparency.

## Official Sources

### 1. Municipal Portal
- **URL:** https://carmendeareco.gob.ar/transparencia/
- **Content:** Official financial documents, budgets, contracts, and reports
- **Format:** PDF, Excel, Word documents
- **Frequency:** Updated regularly by the municipality

### 2. Boletín Oficial
- **URL:** https://www.boletinoficial.gob.ar/
- **Content:** Official government announcements, decrees, and resolutions
- **Format:** PDF documents
- **Frequency:** Daily updates

### 3. Provincial Sources
- **Ministry of Finance:** Budget execution reports
- **Ministry of Infrastructure:** Public works contracts
- **Ministry of Health:** Health expenditure reports

## Archive Sources

### 1. Wayback Machine
- **URL:** https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/
- **Content:** Historical snapshots of the municipal transparency portal
- **Format:** HTML, PDF, Excel, Word documents
- **Coverage:** 2009-2025

### 2. National Archive
- **URL:** https://datos.gob.ar/
- **Content:** National datasets that include municipal data
- **Format:** CSV, JSON, Excel
- **Coverage:** Various time periods

## Data Processing

### Document Types
1. **Budget Documents** - Annual and quarterly budget reports
2. **Financial Statements** - Balance sheets, income statements
3. **Contracts** - Public procurement contracts
4. **Payroll Data** - Municipal employee salaries
5. **Debt Reports** - Municipal debt obligations
6. **Investment Reports** - Public investment projects

### Processing Pipeline
1. **Collection** - Automated scraping of official sources
2. **Conversion** - PDF/Excel to structured data (JSON/CSV)
3. **Validation** - Data integrity checks
4. **Storage** - Database and file system storage
5. **API** - RESTful API for data access
6. **Visualization** - Dashboard and reports

## Data Quality

### Verification Process
- **Hash Verification** - SHA256 checksums for document integrity
- **Source Validation** - Cross-referencing with multiple sources
- **Format Consistency** - Standardized data structures
- **Completeness Checks** - Missing data identification

### Update Frequency
- **Real-time:** API data (where available)
- **Daily:** Newly published documents
- **Weekly:** Archive synchronization
- **Monthly:** Comprehensive data verification

## Legal Compliance

All data collection and processing activities comply with:
- **Ley 27.275** (Access to Public Information)
- **Ley 25.326** (Personal Data Protection)
- **Municipal Transparency Ordinances**