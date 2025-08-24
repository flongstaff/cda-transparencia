# Data Management

## Data Sources

The project will collect data from municipal, provincial (Buenos Aires), and national sources, including hidden, archived, and deleted content.

### Municipal Level
- **Official Portal**: https://carmendeareco.gob.ar/transparencia/
- **Government Section**: https://carmendeareco.gob.ar/gobierno/
- **HCD Blog**: http://hcdcarmendeareco.blogspot.com/

### Provincial Level (Buenos Aires)
- **PBAC System**: https://pbac.cgp.gba.gov.ar/ - Provincial procurement system
- **Licitaciones**: https://licitacionesv2.gobdigital.gba.gob.ar/obras
- **Transparency**: https://www.gba.gob.ar/transparencia_institucional
- **Official Bulletin**: https://www.gba.gob.ar/boletin_oficial

### National Level
- **COMPR.AR**: https://comprar.gob.ar/ - National procurement
- **CONTRAT.AR**: https://contratar.gob.ar/ - Public works contracts
- **Official Bulletin**: https://www.boletinoficial.gob.ar/
- **InfoLEG**: https://www.infoleg.gob.ar/ - Legal information

## Data Collection Plan

A comprehensive scraper will be deployed to collect data from all known government sources. The scraper will search for contracts, tenders, employee records, and budget documents.

Hidden data will be extracted using the Wayback Machine, searching for deleted pages, and performing OCR on images.

## Data Processing

Collected data will be processed and organized. This includes:

- **Validation**: Verifying document authenticity and cross-referencing multiple sources.
- **Normalization**: Using a common schema (e.g., Open Contracting Data Standard) to map fields from different sources.
- **Storage**: Storing raw and processed data in a PostgreSQL database.
