# Carmen de Areco Transparency Portal - Data Organization

## Overview

This directory contains the source materials organized for the Carmen de Areco Transparency Portal project. The data spans from 2017 through 2025 and includes official government documents related to municipal finances, property declarations, public tenders, and other transparency-related information.

## Organization Structure

The data is organized using a dual approach that preserves chronological context while enabling thematic navigation:

### Chronological Organization (2017-2025)
Each year directory contains documents from that specific year:
- `2017/` - Documents from 2017
- `2018/` - Documents from 2018
- `2019/` - Documents from 2019
- `2020/` - Documents from 2020
- `2021/` - Documents from 2021
- `2022/` - Documents from 2022
- `2023/` - Documents from 2023
- `2024/` - Documents from 2024
- `2025/` - Documents from 2025

### Thematic Organization
Documents are also organized by type and topic:
- `budgets/` - Budget documents and financial plans
- `declarations/` - Property declarations (Declaraciones Juradas Patrimoniales)
- `Licitaciones/` - Public tenders and bidding documents
- `Salarios-DDJ/` - Salary information and declarations
- `reports/` - General reports and studies
- `financial_data/` - Financial data and analysis
- `web_archives/` - Archived versions of documents
- `ley/` - Laws and legislation
- `Ordenanzas/` - Municipal ordinances
- `decretos/` - Government decrees
- `Informes/` - Official reports
- `tenders/` - Tender documents
- `geo/` - Geographic and spatial data
- `Graficos/` - Charts and graphics
- `general/` - General documents and miscellaneous files

## Data Sources

### Primary Official Sources
1. **Municipal Portal**: https://carmendeareco.gob.ar/transparencia/
2. **Provincial Government**: https://www.gba.gob.ar/
3. **National Government**: https://www.argentina.gob.ar/

### Secondary Sources
1. **Web Archive**: https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/*
2. **COMPR.AR**: https://comprar.gob.ar/ - National procurement
3. **CONTRAT.AR**: https://contratar.gob.ar/ - Public works contracts

## Document Types

### Financial Documents
- Budget approvals and execution reports
- Treasury movement records
- Debt documentation
- Investment and asset registers
- Fee and right collections

### Legal Documents
- Laws (ley)
- Ordinances (ordenanzas)
- Decrees (decretos)
- Resolutions (resoluciones)

### Administrative Documents
- Property declarations (DDJJ)
- Salary scales and compensation
- Public tender announcements
- Contract awards
- Official reports

## File Naming Conventions

Documents follow descriptive naming conventions:
- `PRESUPUESTO-{YEAR}-APROBADO-ORD-{NUMBER}.pdf`
- `ddjj-{YEAR}.pdf`
- `LICITACION-PUBLICA-N{NUMBER}.pdf`
- `ESCALA-SALARIAL-{MONTH}-{YEAR}.pdf`
- `STOCK-DE-DEUDA-{PERIOD}.xlsx`

## Data Quality

### Verification Process
- Documents sourced from official government portals
- Cross-referenced with multiple sources when possible
- File integrity verified through metadata
- Provenance documented for each document

### Update Frequency
- New documents added as they become available
- Existing documents reviewed quarterly
- Archive snapshots captured monthly
- Broken links checked weekly

## Access and Usage

### For Researchers
- All documents are publicly available official records
- Documents can be cited using their original source information
- Related documents are cross-referenced in metadata

### For Developers
- Directory structure enables programmatic access
- Metadata files provide structured data about documents
- Consistent naming conventions facilitate automation

## Archive Strategy

### Web Archive Integration
- Critical documents snapshotted monthly
- Portal pages archived weekly
- Historical versions preserved for comparison

### Cold Storage
- Documents backed up to secure cold storage
- Multiple copies maintained for redundancy
- Integrity checks performed regularly

## Compliance

### Legal Compliance
- All documents are official public records
- Documents organized according to transparency laws
- Access maintained in accordance with Ley 27.275

### Data Integrity
- Original documents preserved without modification
- Provenance tracked for all documents
- Version history maintained where applicable

## Future Updates

### Ongoing Collection
- Monthly monitoring of official sources
- Quarterly comprehensive collection sweeps
- Annual archive updates
- Continuous broken link repair

### Enhancement Opportunities
- OCR processing for scanned documents
- Structured data extraction from PDFs
- Cross-reference mapping between related documents
- Search index creation

## Acknowledgments

This collection represents hundreds of hours of research and data collection from official Argentine government sources. The documents are organized to facilitate transparency, accountability, and civic engagement with the municipal government of Carmen de Areco.

## Contact

For questions about this data collection or to report issues with specific documents, please contact the project maintainers through the GitHub repository.