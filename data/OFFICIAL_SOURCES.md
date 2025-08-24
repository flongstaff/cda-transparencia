# Official Data Sources for Carmen de Areco

## Primary Official Portal
**URL**: https://carmendeareco.gob.ar/transparencia/

This is the main source for all official municipal transparency data.

### Key Sections to Monitor
1. **Declaraciones Juradas Patrimoniales** (Property Declarations)
2. **Presupuesto y Ejecución** (Budget and Execution)
3. **Licitaciones Públicas** (Public Tenders)
4. **Sueldos y Remuneraciones** (Salaries and Compensation)
5. **Informes y Reportes** (Reports and Studies)
6. **Resoluciones y Ordenanzas** (Resolutions and Ordinances)
7. **Deuda Municipal** (Municipal Debt)
8. **Inversiones y Activos** (Investments and Assets)
9. **Gastos Operativos** (Operational Expenses)
10. **Tasas y Derechos** (Fees and Rights)

## Provincial Sources (Buenos Aires)

### 1. PBAC System
**URL**: https://pbac.cgp.gba.gov.ar/
**Description**: Provincial procurement system

### 2. Licitaciones
**URL**: https://licitacionesv2.gobdigital.gba.gob.ar/obras
**Description**: Provincial public works tenders

### 3. Transparency Portal
**URL**: https://www.gba.gob.ar/transparencia_institucional
**Description**: Buenos Aires provincial transparency information

### 4. Official Bulletin
**URL**: https://www.gba.gob.ar/boletin_oficial
**Description**: Official provincial government bulletin

## National Sources

### 1. COMPR.AR
**URL**: https://comprar.gob.ar/
**Description**: National procurement platform

### 2. CONTRAT.AR
**URL**: https://contratar.gob.ar/
**Description**: National public works contracts

### 3. Official Bulletin
**URL**: https://www.boletinoficial.gob.ar/
**Description**: National government official bulletin

### 4. InfoLEG
**URL**: https://www.infoleg.gob.ar/
**Description**: National legal information system

## Web Archive Sources

### Internet Archive (Wayback Machine)
**URL**: https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/*
**Description**: Historical snapshots of the municipal transparency portal

## Data Collection Strategy

### 1. Regular Monitoring
- **Frequency**: Weekly checks for updates
- **Method**: Automated scripts using the existing web scrapers
- **Storage**: Direct download to source_materials directory

### 2. Archive Strategy
- **Critical Documents**: Monthly snapshots of key documents
- **Portal Pages**: Weekly snapshots of main transparency portal
- **Historical Data**: One-time comprehensive archive of historical documents

### 3. Verification Process
- **Cross-reference**: Compare data between multiple sources
- **Integrity Check**: Verify document hashes for authenticity
- **Provenance Tracking**: Maintain source information for all documents

## File Verification Guidelines

### Authenticity Checks
1. **Official Letterheads**: Documents should have official municipal letterheads
2. **Digital Signatures**: Check for digital signatures when available
3. **File Properties**: Verify creation/modification dates and authors
4. **Content Consistency**: Cross-reference with other official sources

### Provenance Documentation
For each document, record:
1. **Source URL**: Direct link to the original document
2. **Download Date**: When the document was retrieved
3. **File Hash**: SHA256 hash for integrity verification
4. **Document Type**: Classification according to our categorization
5. **Relevance**: Brief description of document content

### Storage Best Practices
1. **Original Format**: Keep documents in their original format when possible
2. **Backup Copies**: Maintain at least two copies of critical documents
3. **Version Control**: Track document revisions and updates
4. **Metadata**: Include metadata files with provenance information

## Automation Scripts

The project includes several scripts for automated data collection:

### 1. transparencia_spider.py
Python script for scraping the official transparency portal

### 2. web_scraper.py
General-purpose web scraper for collecting data

### 3. powerbi_spider.py
Specialized scraper for Power BI dashboards (if applicable)

### 4. osint_monitor_compliance.py
Script for monitoring compliance with transparency laws

## Data Processing Pipeline

### 1. Collection Phase
- Automated download from official sources
- Archive capture from Web Archive
- Manual collection for hard-to-reach documents

### 2. Processing Phase
- Document categorization and classification
- Metadata extraction and recording
- Format conversion (when necessary)

### 3. Validation Phase
- Authenticity verification
- Cross-source validation
- Integrity checking

### 4. Storage Phase
- Organized storage in categorized directories
- Provenance documentation
- Backup creation

## Compliance Considerations

### Argentinian Law
- **Ley 27.275**: Ley de Acceso a la Información Pública
- **Decreto 1172/2003**: Reglamenta la Ley de Transparencia
- **Ley 25.326**: Protección de Datos Personales

### Document Retention
- Maintain documents according to legal retention periods
- Document destruction procedures when legally permissible
- Archive destroyed documents to preserve information

## Monitoring Schedule

### Daily
- Check for new documents on official portal
- Run integrity checks on recently added files

### Weekly
- Full scan of official transparency portal
- Update Web Archive snapshots
- Verify document availability and accessibility

### Monthly
- Comprehensive review of all data sources
- Cross-reference data between multiple sources
- Update provenance documentation

### Quarterly
- Archive review and update
- Compliance audit with transparency laws
- Performance review of collection scripts

This list of official sources should be regularly updated to ensure we're collecting data from all relevant official channels and maintaining the reliability and authenticity of our data repository.