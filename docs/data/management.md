# Data Management

This document outlines the data management strategy for the Carmen de Areco Transparency Portal.

## Data Sources

(Content from DATA_SOURCES.md)

## Web Archive Links

Here are some working Web Archive links for the Carmen de Areco website:

- [Carmen de Areco Oficial (June 18, 2023)](https://web.archive.org/web/20230618000000*/https://carmendeareco.gob.ar/)
- [Carmen de Areco Noticias (December 2, 2022)](https://web.archive.org/web/20221202000000*/https://carmendeareco.gob.ar/noticias)
- [Carmen de Areco Turismo (October 7, 2022)](https://web.archive.org/web/20221007000000*/https://carmendeareco.gob.ar/turismo)

## Prioritizing Data Ingestion

Given the extensive list of data sources and tools, it's crucial to prioritize efforts to efficiently populate the portal with live data.

### 1. High-Priority Data Sources

Focus on these authoritative sources first, as they directly provide the core data required for the portal's main features (Property Declarations, Salaries, Public Tenders, Financial Reports):

*   **Municipal Website (`carmendeareco.gob.ar`):**
    *   Direct sections: `/transparencia`, `/declaraciones-juradas`, `/licitaciones`, `/boletin-oficial`, `/presupuesto`, `/empleados` (if available).
    *   This is your primary source for current, official municipal data.
*   **National Open Data Portal (`datos.gob.ar`):**
    *   Search for datasets specifically related to "Carmen de Areco" or relevant categories (e.g., "presupuesto", "contrataciones").
    *   This portal often provides structured data (CSV, JSON) that is easier to ingest.
*   **Provincial Data Portal (`gba.gob.ar`):**
    *   Look for sections on provincial budgets, public procurement, and transparency that might include municipal-level breakdowns or related data.
*   **Web Archive (`web.archive.org`):
    *   Crucial for historical data and recovering information that may no longer be available on the live sites. Use the specific archived URLs identified.

### 2. Essential Tools for Initial Data Ingestion

Leverage the following tools, many of which are already part of your project setup, to streamline the data ingestion process:

*   **`web_scraper.py` (Python):**
    *   **Purpose:** Your primary tool for downloading HTML pages and documents (PDF, XLSX) from websites, including live and archived versions.
    *   **Action:** Refine its `scrape_page` and `download_documents` methods to target the specific URLs identified in your high-priority data sources.
*   **`BeautifulSoup` (Python):**
    *   **Purpose:** For parsing HTML content downloaded by `web_scraper.py` and extracting structured data from tables, lists, or specific elements.
    *   **Action:** Integrate parsing logic directly into `web_scraper.py` or a dedicated "extraction" module.
*   **`pdfplumber` (Python):**
    *   **Purpose:** Essential for extracting text and tabular data from PDF documents downloaded by the scraper. Many government reports are in PDF format.
    *   **Action:** Develop dedicated Python scripts (ETL scripts) that read these PDFs and extract the necessary information.
*   **`pandas` (Python):**
    *   **Purpose:** Powerful library for data manipulation, cleaning, and transformation. Ideal for processing extracted data before loading it into the database.
    *   **Action:** Use `pandas` DataFrames in your ETL scripts to clean, validate, and reshape data.
*   **`psycopg2` (Python):**
    *   **Purpose:** The Python adapter for PostgreSQL. Used to connect to your database and execute SQL commands for loading data.
    *   **Action:** Implement the "Load" part of your ETL scripts using `psycopg2` to insert processed data into your PostgreSQL tables.

### 3. Lean Data Ingestion Strategy

Follow these principles to avoid getting bogged down:

*   **Start Small:** Pick one data type (e.g., Property Declarations) and one primary source for it. Get the end-to-end pipeline working for this single data type first.
*   **Iterate:** Data scraping and parsing is rarely perfect on the first try. Expect to refine your scraping and extraction logic multiple times.
*   **Focus on Core Data:** Initially, only extract the data points absolutely necessary for your PostgreSQL schema. You can always add more fields later.
*   **Automate Gradually:** Once manual extraction and loading are proven for a data type, then focus on automating the entire process (e.g., with scheduled scripts).

By focusing on these high-priority sources and essential tools, you can efficiently move from sample data to live data without getting lost in the extensive list of possibilities.

## Data Collection Plan

(Content from PLAN.md and SCRAP.md)

## Data Processing

(Content from SCRAP.md)

## Data Validation

(Content from SCRAP.md)
# Data Sources - Carmen de Areco Transparency Portal

## Official Documents

- **Budget Ordinances**: Annual budget documents from the Municipal Council
- **Statistical Reports**: Official statistics on various aspects of municipal management
- **Public Contracts**: Documents related to municipal contracts and tenders

## Investigation Data

- **2018-2025 Investigation**: Data collected through FOIA requests and public sources
- **Financial Records**: Records of municipal expenditures and income
- **Employee Directory**: Public employee information

## Sources

- Carmen de Areco Municipal Website
- Boletín Oficial
- FOIA Requests
- Public Records

## Government and Legal Links

- **Leyes y Decretos Nacionales de SAIJ**: [https://github.com/clarius/normas](https://github.com/clarius/normas)
- **Constitución Argentina**: [https://github.com/FdelMazo/ConstitucionArgentina](https://github.com/FdelMazo/ConstitucionArgentina)
- **Carmen de Areco Oficial**: [https://carmendeareco.gob.ar](https://carmendeareco.gob.ar)
- **Carmen de Areco (Archivo histórico)**: [https://web.archive.org/web/20250000000000*/https://carmendeareco.gob.ar](https://web.archive.org/web/20250000000000*/https://carmendeareco.gob.ar)
- **Portal de Transparencia**: [carmendeareco.gob.ar/transparencia](http://carmendeareco.gob.ar/transparencia)
- **Portal de Transparencia (Archivo)**: [https://web.archive.org/web/20250000000000*/https://carmendeareco.gob.ar/transparencia/](https://web.archive.org/web/20250000000000*/https://carmendeareco.gob.ar/transparencia/)
- **InfoLEG**: [http://www.infoleg.gob.ar/](http://www.infoleg.gob.ar/)
- **Ley de Acceso a la Información Pública**: [https://www.argentina.gob.ar/aaip](https://www.argentina.gob.ar/aaip)
- **Ministerio de Justicia - Datos Abiertos**: [https://datos.jus.gob.ar/](https://datos.jus.gob.ar/)
- **Ley de Responsabilidad del Estado**: [http://servicios.infoleg.gob.ar/infolegInternet/anexos/230000-234999/233216/norma.htm](http://servicios.infoleg.gob.ar/infolegInternet/anexos/230000-234999/233216/norma.htm)
- **Ordenanzas Municipales**: [https://www.hcd.gov.ar/](https://www.hcd.gov.ar/) (adaptar a tu municipio)

## Similar Municipalities (Reference Models)

- **Transparencia Bahía Blanca**: [https://transparencia.bahia.gob.ar/](https://transparencia.bahia.gob.ar/)
- **Transparencia Mar del Plata**: [https://www.mardelplata.gob.ar/datos-abiertos](https://www.mardelplata.gob.ar/datos-abiertos)
- **Municipio de Pilar - Portal de Datos Abiertos**: [https://datosabiertos.pilar.gov.ar/](https://datosabiertos.pilar.gov.ar/)
- **San Isidro - Transparencia**: [https://www.sanisidro.gob.ar/transparencia](https://www.sanisidro.gob.ar/transparencia)
- **Rosario - Gobierno Abierto**: [https://www.rosario.gob.ar/web/gobierno/gobierno-abierto](https://www.rosario.gob.ar/web/gobierno/gobierno-abierto)
- **Rafaela - Gobierno Abierto**: [https://rafaela-gob-ar.github.io/](https://rafaela-gob-ar.github.io/)

## Nearby Municipalities

- **Municipalidad de Chacabuco**: [https://chacabuco.gob.ar/](https://chacabuco.gob.ar/)
- **Municipalidad de Chivilcoy**: [https://chivilcoy.gov.ar/](https://chivilcoy.gov.ar/)
- **Municipalidad de San Antonio de Areco**: [https://www.sanantoniodeareco.gob.ar/](https://www.sanantoniodeareco.gob.ar/)
- **Municipalidad de San Andrés de Giles**: [https://www.sag.gob.ar/](https://www.sag.gob.ar/)
- **Municipalidad de Pergamino**: [https://www.pergamino.gob.ar/](https://www.pergamino.gob.ar/)
- **Municipalidad de Salto**: [https://www.salto.gob.ar/](https://www.salto.gob.ar/)
- **Municipalidad de Capitán Sarmiento**: [https://capitansarmiento.gob.ar/](https://capitansarmiento.gob.ar/)

## Carmen de Areco - Specific Resources

- **Honorable Concejo Deliberante de Carmen de Areco**: [http://hcdcarmendeareco.blogspot.com/](http://hcdcarmendeareco.blogspot.com/)
- **Carmen de Areco en Datos Argentina**: [https://datos.gob.ar/dataset?q=carmen+de+areco](https://datos.gob.ar/dataset?q=carmen+de+areco)
- **Portal de Municipios - Buenos Aires**: [https://www.gba.gob.ar/municipios](https://www.gba.gob.ar/municipios)
- **Presupuesto Participativo Carmen de Areco**: [https://carmendeareco.gob.ar/presupuesto-participativo/](https://carmendeareco.gob.ar/presupuesto-participativo/) (verify exact URL)
- **Boletín Oficial Municipal**: [https://carmendeareco.gob.ar/boletin-oficial/](https://carmendeareco.gob.ar/boletin-oficial/) (verify exact URL)
- **Licitaciones Carmen de Areco**: [https://carmendeareco.gob.ar/licitaciones/](https://carmendeareco.gob.ar/licitaciones/) (verify exact URL)
- **Declaraciones Juradas Funcionarios**: [https://carmendeareco.gob.ar/declaraciones-juradas/](https://carmendeareco.gob.ar/declaraciones-juradas/) (verify exact URL)
- **Carmen de Areco en datos.gob.ar**: [https://datos.gob.ar/dataset?organization=carmen-de-areco](https://datos.gob.ar/dataset?organization=carmen-de-areco)

## APIs and Public Data

- **API Georef Argentina**: [https://apis.datos.gob.ar/georef](https://apis.datos.gob.ar/georef)
- **Documentación Georef**: [https://github.com/datosgobar/georef-ar-api](https://github.com/datosgobar/georef-ar-api)
- **Guía de interoperabilidad**: [https://datosgobar.github.io/paquete-apertura-datos/guia-interoperables/](https://datosgobar.github.io/paquete-apertura-datos/guia-interoperables/)
- **API de Presupuesto Abierto**: [https://datos.gob.ar/dataset/sspm-presupuesto-abierto](https://datos.gob.ar/dataset/sspm-presupuesto-abierto)
- **API Contrataciones Abiertas**: [https://datos.gob.ar/dataset/modernizacion-sistema-contrataciones-electronicas-argentina](https://datos.gob.ar/dataset/modernizacion-sistema-contrataciones-electronicas-argentina)
- **API de Obras Públicas**: [https://www.argentina.gob.ar/obras-publicas/api-seguimiento-de-obras](https://www.argentina.gob.ar/obras-publicas/api-seguimiento-de-obras)
- **Portal Nacional de Datos Abiertos**: [https://datos.gob.ar/](https://datos.gob.ar/)
- **API de Presupuesto Nacional**: [https://www.presupuestoabierto.gob.ar/sici/api](https://www.presupuestoabierto.gob.ar/sici/api)
- **Argentina API**: [https://github.com/Franqsanz/argentina-api](https://github.com/Franqsanz/argentina-api)
- **Catálogo de APIs públicas**: [https://apidocs.ar/lista.html](https://apidocs.ar/lista.html)
- **Repositorio de APIs públicas**: [http://github.com/enzonotario/apidocs.ar](http://github.com/enzonotario/apidocs.ar)

## Development Tools

- **AfipSDK PHP**: [https://github.com/AfipSDK/afip.php](https://github.com/AfipSDK/afip.php)
- **AfipSDK JS**: [https://github.com/AfipSDK/afip.js](https://github.com/AfipSDK/afip.js)
- **AfipSDK Blog**: [https://afipsdk.com/blog/](https://afipsdk.com/blog/)
- **AfipSDK Blog - APIs**: [https://afipsdk.com/blog/category/API/](https://afipsdk.com/blog/category/API/)
- **arg.js**: [https://github.com/miparnisari/arg.js](https://github.com/miparnisari/arg.js)
- **Argentina.js**: [https://github.com/seppo0010/argentina.js](https://github.com/seppo0010/argentina.js)
- **PyAfipWs**: [https://github.com/reingart/pyafipws](https://github.com/reingart/pyafipws)
- **Civics API**: [https://github.com/datosgobar/civics-apis-argentina](https://github.com/datosgobar/civics-apis-argentina)
- **Poncho**: [https://github.com/argob/poncho](https://github.com/argob/poncho)

## Data Analysis and Capture Tools

- **BORA App**: [https://github.com/juancarlospaco/borapp](https://github.com/juancarlospaco/borapp)
- **BORA App Web**: [https://juancarlospaco.github.io/borapp](https://juancarlospaco.github.io/borapp)
- **Archivador datos públicos**: [https://datos.nulo.ar/](https://datos.nulo.ar/)
- **Repositorio archivador**: [https://github.com/catdevnull/transicion-desordenada-diablo](https://github.com/catdevnull/transicion-desordenada-diablo)
- **BORA Crawler**: [https://github.com/chrishein/bora_crawler](https://github.com/chrishein/bora_crawler)
- **Catálogo Social**: [https://catalogosocial.fly.dev/](https://catalogosocial.fly.dev/)
- **Repo Catálogo Social**: [https://github.com/pdelboca/catalogosocial](https://github.com/pdelboca/catalogosocial)
- **DataHub Argentina**: [https://github.com/datosgobar/datahub](https://github.com/datosgobar/datahub)
- **Scraper Ministerio de Justicia**: [https://github.com/jorgechavez6816/minjus_reg_sociedades_argentina](https://github.com/jorgechavez6816/minjus_reg_sociedades_argentina)
- **Scraper Boletín Oficial**: [https://github.com/tommanzur/scraper_boletin_oficial](https://github.com/tommanzur/scraper_boletin_oficial)
- **Análisis BCRA**: [https://github.com/ezebinker/DatosAPI-BCRA](https://github.com/ezebinker/DatosAPI-BCRA)
- **Bot SIBOM**: [https://github.com/nmontesoro/SIBOM](https://github.com/nmontesoro/SIBOM)
- **@BoletinMGP**: [https://x.com/BoletinMGP](https://x.com/BoletinMGP)

## Transparency and Audit Tools

- **Portal de Transparencia Fiscal PBA**: [https://www.gba.gob.ar/transparencia_fiscal/](https://www.gba.gob.ar/transparencia_fiscal/)
- **Mapa de inversiones**: [https://www.argentina.gob.ar/jefatura/innovacion-publica/mapa-inversiones](https://www.argentina.gob.ar/jefatura/innovacion-publica/mapa-inversiones)
- **Directorio Legislativo**: [https://directoriolegislativo.org/](https://directoriolegislativo.org/)
- **Poder Ciudadano**: [https://poderciudadano.org/](https://poderciudadano.org/)
- **Chequeado Datos**: [https://chequeado.com/proyectos/](https://chequeado.com/proyectos/)
- **ACIJ - Asociación Civil por la Igualdad y la Justicia**: [https://acij.org.ar/](https://acij.org.ar/)
- **La Nación Data**: [https://www.lanacion.com.ar/data/](https://www.lanacion.com.ar/data/)

## Useful Code Repositories

- **Repositorio de datos políticos**: [https://github.com/PoliticaArgentina/data_warehouse](https://github.com/PoliticaArgentina/data_warehouse)
- **Expedientes Transparentes**: [https://github.com/expedientes-transparentes/et-api](https://github.com/expedientes-transparentes/et-api)
- **Cargografías**: [https://github.com/cargografias/cargografias](https://github.com/cargografias/cargografias)
- **OGP Argentina**: [https://github.com/ogpargentina/standards](https://github.com/ogpargentina/standards)
- **Municipalities-Argentina**: [https://github.com/martinlabuschin/municipalities-argentina](https://github.com/martinlabuschin/municipalities-argentina)

## Blockchain and Verification

- **Blockchain Federal Argentina**: [https://bfa.ar/](https://bfa.ar/)
- **Democracia en Red**: [https://github.com/DemocraciaEnRed](https://github.com/DemocraciaEnRed)
- **Open Contracting**: [https://standard.open-contracting.org/latest/es/](https://standard.open-contracting.org/latest/es/)
- **Decentralized Identity Foundation**: [https://identity.foundation/](https://identity.foundation/)

## Data Visualization Tools

- **Tableau Public**: [https://public.tableau.com/](https://public.tableau.com/)
- **Observable**: [https://observablehq.com/](https://observablehq.com/)
- **Flourish**: [https://flourish.studio/](https://flourish.studio/)
- **Grafana**: [https://grafana.com/](https://grafana.com/)

## Educational Resources and Articles

- **Análisis con Neo4j**: [https://medium.com/@chrishein/detecting-suspicious-patterns-in-argentinean-companies-incorporation-using-scrapy-and-neo4j-e826bacb0809#.b3em4ckuc]

## Continuous Monitoring Tools

- **FeedBurner**: [https://feedburner.google.com/](https://feedburner.google.com/) (for monitoring website changes)
- **Wayback Machine API**: [https://archive.org/help/wayback_api.php](https://archive.org/help/wayback_api.php)
- **CrawlMonitor**: [https://github.com/crawlmonitor/crawlmonitor](https://github.com/crawlmonitor/crawlmonitor)
- **Scrapy Cloud**: [https://www.zyte.com/scrapy-cloud/](https://www.zyte.com/scrapy-cloud/)
- **WebScraper.io**: [https://webscraper.io/](https://webscraper.io/)
- **IFTTT para monitoreo**: [https://ifttt.com/](https://ifttt.com/)
- **Change Detection**: [https://github.com/dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io)

## Data Verification Tools

- **Open Refine**: [https://openrefine.org/](https://openrefine.org/)
- **CSVLint**: [https://csvlint.io/](https://csvlint.io/)
- **Data Quality Tool**: [https://github.com/frictionlessdata/goodtables-py](https://github.com/frictionlessdata/goodtables-py)
- **Talend Open Studio**: [https://www.talend.com/products/talend-open-studio/](https://www.talend.com/products/talend-open-studio/)

## Reference Projects

- [https://github.com/RedeGlobo/transparencia_scraper](https://github.com/RedeGlobo/transparencia_scraper)
- [https://github.com/gilsondev/colaboradados-o-bot](https://github.com/gilsondev/colaboradados-o-bot)
- [https://github.com/ciudadanointeligente/partidopublico](https://github.com/ciudadanointeligente/partidopublico)
- [https://github.com/jalvarezsamayoa/OpenWolf](https://github.com/jalvarezsamayoa/OpenWolf)
- [https://transparencia.gob.gt/](https://transparencia.gob.gt/)

## Additional References

- [https://github.com/basedosdados/sdk](https://github.com/basedosdados/sdk)
- [https://www.clearpointstrategy.com/blog/technology-local-government-transparency](https://www.clearpointstrategy.com/blog/technology-local-government-transparency)
- [https://github.com/basedosdados/analises](https://github.com/basedosdados/analises)

## Verification Tasks

- Verify any relationship with [cda-transparencia](https://carmendeareco.gob.ar/) ([https://carmendeareco.gob.ar/transparencia](https://carmendeareco.gob.ar/transparencia))
- [https://github.com/GibranMena/ScrappingPlataformaNacionalTransparencia/blob/master/Taller_PNT.md](https://github.com/GibranMena/ScrappingPlataformaNacionalTransparencia/blob/master/Taller_PNT.md)
- Verify how to use with Carmen de Areco and Employees ([https://github.com/basedosdados/sdk](https://github.com/basedosdados/sdk))

## Implementation Strategy

### Data Collection Priorities

1. **High Priority**
   - Municipal budgets and execution reports
   - Active contracts and procurement notices
   - Public official declarations
   - Municipal ordinances and resolutions

2. **Medium Priority**
   - Historical budget data (5-year lookback)
   - Completed projects documentation
   - Geographic data for municipal projects
   - Audit reports

3. **Low Priority**
   - Comparative data with other municipalities
   - International standards compliance assessment
   - Historical archives (beyond 5 years)

### Regular Data Updates

| Data Type | Update Frequency | Source | Method |
|-----------|------------------|--------|--------|
| Budget | Monthly | Municipal Budget Office | Direct request + scraping |
| Contracts | Weekly | Official Gazette | Automated scraping |
| Projects | Monthly | Municipality Website | Automated scraping |
| Declarations | Quarterly | Anticorruption Office | API + manual verification |
| Ordinances | Weekly | Municipal Bulletin | Automated scraping |

### Verification Procedures

1. **Document Authenticity**
   - Digital signature verification
   - Cross-reference with official publications
   - Direct confirmation for significant documents

2. **Data Consistency**
   - Cross-check between related datasets
   - Historical trend analysis for anomalies
   - Independent verification for key statistics

3. **Completeness Assessment**
   - Regular audit of mandatory disclosures
   - Comparison with legal requirements
   - Tracking of missing documents

## Additional Resources

### Community Support

- **Civic Tech Argentina**: [https://civictechargentina.org/](https://civictechargentina.org/)
- **Hacks/Hackers Buenos Aires**: [https://www.meetup.com/es-ES/HacksHackersBA/](https://www.meetup.com/es-ES/HacksHackersBA/)
- **Open Knowledge Argentina**: [https://okfn.org.ar/](https://okfn.org.ar/)

# Plataforma de Transparencia - Carmen de Areco

## Enlaces de referencia y recursos

## Enlaces gubernamentales y legales

- **Leyes y Decretos Nacionales de SAIJ**: <https://github.com/clarius/normas>
- **Constitución Argentina**: <https://github.com/FdelMazo/ConstitucionArgentina>
-# Carmen Areco Transparencia - Data Sources Reference

This document provides a comprehensive list of data sources that can be used to populate the Carmen Areco Transparencia portal. These sources are categorized by data type and include both official and supplementary sources.

## Official Government Data Sources

### National Level

#### 1. Datos Argentina
- **URL**: [https://datos.gob.ar/](https://datos.gob.ar/)
- **API Access**: Yes, REST API available
- **Data Types**: Budget, contracts, declarations, geographic data
- **Format**: CSV, JSON, XML
- **Update Frequency**: Monthly
- **Notes**: Official national open data portal with extensive datasets

#### 2. Oficina Anticorrupción
- **URL**: [https://www.argentina.gob.ar/anticorrupcion](https://www.argentina.gob.ar/anticorrupcion)
- **API Access**: Partial
- **Data Types**: Public official declarations, conflicts of interest
- **Format**: PDF, HTML
- **Update Frequency**: Quarterly
- **Notes**: Official source for public declarations and transparency reports

#### 3. Presupuesto Abierto
- **URL**: [https://www.presupuestoabierto.gob.ar/](https://www.presupuestoabierto.gob.ar/)
- **API Access**: Yes
- **Data Types**: Budget, execution, fiscal reports
- **Format**: CSV, JSON, XLSX
- **Update Frequency**: Monthly
- **Notes**: Visualizations and raw data for national budget

### Provincial Level

#### 1. Buenos Aires Data
- **URL**: [https://www.gba.gob.ar/datos_abiertos](https://www.gba.gob.ar/datos_abiertos)
- **API Access**: Yes
- **Data Types**: Provincial budgets, programs, geographic data
- **Format**: CSV, GeoJSON
- **Update Frequency**: Quarterly
- **Notes**: Official provincial data portal

#### 2. Provincial Transparency Portal
- **URL**: [https://www.gba.gob.ar/transparencia/](https://www.gba.gob.ar/transparencia/)
- **API Access**: No
- **Data Types**: Financial reports, audits, public officials
- **Format**: PDF, HTML
- **Update Frequency**: Monthly
- **Notes**: Official transparency site for Buenos Aires province

### Municipal Level

#### 1. Municipality Website
- **URL**: [https://municipalidad.carmenareco.gob.ar/](https://municipalidad.carmenareco.gob.ar/) [https://carmendeareco.gob.ar/] (https://carmendeareco.gob.ar/)
- **API Access**: No
- **Data Types**: Local ordinances, resolutions, public notices
- **Format**: PDF, HTML
- **Update Frequency**: Weekly
- **Notes**: Primary source for official municipal documents

#### 2. Municipal Budget Office
- **Access**: In-person/Direct request required
- **Data Types**: Detailed budgets, execution reports, local contracts
- **Format**: PDF, XLSX
- **Update Frequency**: Quarterly
- **Notes**: May require formal information request

## Supplementary Data Sources

### Civil Society Organizations

#### 1. CIPPEC (Center for the Implementation of Public Policies for Equity and Growth)
- **URL**: [https://www.cippec.org/datos/](https://www.cippec.org/datos/)
- **API Access**: No
- **Data Types**: Budget analysis, policy evaluations
- **Format**: PDF, XLSX
- **Update Frequency**: Varies
- **Notes**: Provides expert analysis and contextualized data

#### 2. Directorio Legislativo
- **URL**: [https://directoriolegislativo.org/](https://directoriolegislativo.org/)
- **API Access**: Yes (partially)
- **Data Types**: Public officials profiles, voting records
- **Format**: JSON, CSV
- **Update Frequency**: Monthly
- **Notes**: Comprehensive database of elected officials

#### 3. Poder Ciudadano
- **URL**: [https://poderciudadano.org/](https://poderciudadano.org/)
- **API Access**: No
- **Data Types**: Transparency indices, corruption reports
- **Format**: PDF
- **Update Frequency**: Annually
- **Notes**: Produces valuable transparency assessments

### Academic Sources

#### 1. Universidad de Buenos Aires - Public Policy Observatory
- **URL**: [http://observatorios.filo.uba.ar/](http://observatorios.filo.uba.ar/)
- **API Access**: No
- **Data Types**: Policy analysis, academic research
- **Format**: PDF
- **Update Frequency**: Varies
- **Notes**: Academic perspective on governance issues

#### 2. University Research Repositories
- **URL**: Various university repositories
- **API Access**: Varies
- **Data Types**: Research papers, local governance studies
- **Format**: PDF
- **Update Frequency**: Irregular
- **Notes**: Search for specific studies on municipal governance

### International Organizations

#### 1. World Bank - Argentina Data
- **URL**: [https://data.worldbank.org/country/argentina](https://data.worldbank.org/country/argentina)
- **API Access**: Yes
- **Data Types**: Development indicators, economic data
- **Format**: CSV, XML, JSON
- **Update Frequency**: Annually
- **Notes**: Provides comparative international context

#### 2. OECD Public Governance Reviews
- **URL**: [https://www.oecd.org/governance/](https://www.oecd.org/governance/)
- **API Access**: Partial
- **Data Types**: Governance benchmarks, best practices
- **Format**: PDF, XLSX
- **Update Frequency**: Annually
- **Notes**: International standards and comparisons

#### 3. International Budget Partnership
- **URL**: [https://www.internationalbudget.org/](https://www.internationalbudget.org/)
- **API Access**: No
- **Data Types**: Budget transparency assessments
- **Format**: PDF
- **Update Frequency**: Annually
- **Notes**: Global standards for budget transparency

## OSINT and Data Collection Tools

### Web Scraping Tools

#### 1. Argentine Official Gazette Scraper
- **Repository**: [https://github.com/garciarodriguezenrique/boletin-oficial-argentina](https://github.com/garciarodriguezenrique/boletin-oficial-argentina)
- **Language**: Python
- **Description**: Tool for scraping the Official Gazette for government contracts and resolutions
- **Usage**: `python scraper.py --date YYYY-MM-DD`

#### 2. Public Procurement Monitor
- **Repository**: [https://github.com/datasketch/contrataciones-abiertas-infraestructura](https://github.com/datasketch/contrataciones-abiertas-infraestructura)
- **Language**: Python
- **Description**: Tool for monitoring public procurement websites
- **Usage**: See repository README

### Data Processing Tools

#### 1. Budget Data Standardizer
- **Repository**: [https://github.com/openspending/gobify](https://github.com/openspending/gobify)
- **Language**: Python
- **Description**: Tool for standardizing budget data to international formats
- **Usage**: `python gobify.py input.csv --schema budget`

#### 2. PDF Data Extractor
- **Repository**: [https://github.com/jsvine/pdfplumber](https://github.com/jsvine/pdfplumber)
- **Language**: Python
- **Description**: Extract data tables from PDF documents
- **Usage**: `import pdfplumber`

### Verification Tools

#### 1. Document Validation Tool
- **Repository**: [https://github.com/ddddavidmartin/docs-validator](https://github.com/ddddavidmartin/docs-validator)
- **Language**: Python
- **Description**: Validates document integrity and authenticity
- **Usage**: `python validate.py document.pdf`

#### 2. Data Integrity Checker
- **Repository**: [https://github.com/cienciadedatos/datos-de-miercoles](https://github.com/cienciadedatos/datos-de-miercoles)
- **Language**: R
- **Description**: Checks data consistency and flags anomalies
- **Usage**: See repository documentation

## Data Standards and Schemas

### Budget Data

#### 1. International Budget Partnership Schema
- **Documentation**: [https://www.internationalbudget.org/publications/budget-data-schema/](https://www.internationalbudget.org/publications/budget-data-schema/)
- **Format**: JSON Schema
- **Description**: Standard schema for budget data publication

#### 2. Open Fiscal Data Package
- **Documentation**: [https://specs.frictionlessdata.io/fiscal-data-package/](https://specs.frictionlessdata.io/fiscal-data-package/)
- **Format**: JSON
- **Description**: Standard for publishing fiscal data

### Contract Data

#### 1. Open Contracting Data Standard
- **Documentation**: [https://standard.open-contracting.org/](https://standard.open-contracting.org/)
- **Format**: JSON Schema
- **Description**: International standard for publishing contracting data

#### 2. Public Contracts Ontology
- **Documentation**: [https://github.com/opendatacz/public-contracts-ontology](https://github.com/opendatacz/public-contracts-ontology)
- **Format**: OWL/RDF
- **Description**: Ontology for describing public contracts

### Geographic Data

#### 1. Argentine National Geographic Institute Standards
- **Documentation**: [https://www.ign.gob.ar/](https://www.ign.gob.ar/)
- **Format**: Various
- **Description**: Standards for geographic data in Argentina

## Implementation Strategy

### Data Collection Priorities

1. **High Priority**
   - Municipal budgets and execution reports
   - Active contracts and procurement notices
   - Public official declarations
   - Municipal ordinances and resolutions

2. **Medium Priority**
   - Historical budget data (5-year lookback)
   - Completed projects documentation
   - Geographic data for municipal projects
   - Audit reports

3. **Low Priority**
   - Comparative data with other municipalities
   - International standards compliance assessment
   - Historical archives (beyond 5 years)

### Regular Data Updates

| Data Type | Update Frequency | Source | Method |
|-----------|------------------|--------|--------|
| Budget | Monthly | Municipal Budget Office | Direct request + scraping |
| Contracts | Weekly | Official Gazette | Automated scraping |
| Projects | Monthly | Municipality Website | Automated scraping |
| Declarations | Quarterly | Anticorruption Office | API + manual verification |
| Ordinances | Weekly | Municipal Bulletin | Automated scraping |

### Verification Procedures

1. **Document Authenticity**
   - Digital signature verification
   - Cross-reference with official publications
   - Direct confirmation for significant documents

2. **Data Consistency**
   - Cross-check between related datasets
   - Historical trend analysis for anomalies
   - Independent verification for key statistics

3. **Completeness Assessment**
   - Regular audit of mandatory disclosures
   - Comparison with legal requirements
   - Tracking of missing documents

## Additional Resources

### Community Support

- **Civic Tech Argentina**: [https://civictechargentina.org/](https://civictechargentina.org/)
- **Hacks/Hackers Buenos Aires**: [https://www.meetup.com/es-ES/HacksHackersBA/](https://www.meetup.com/es-ES/HacksHackersBA/)
- **Open Knowledge Argentina**: [https://okfn.org.ar/](https://okfn.org.ar/)

### Tools and Services

- **Scrapy Cloud**: <https://www.zyte.com/scrapy-cloud/>
- **WebScraper.io**: <https://webscraper.io/>
- **IFTTT para monitoreo**: <https://ifttt.com/>
- **Change Detection**: <https://github.com/dgtlmoon/changedetection.io>

## Herramientas de verificación de datos

- **Open Refine**: <https://openrefine.org/>
- **CSVLint**: <https://csvlint.io/>
- **Data Quality Tool**: <https://github.com/frictionlessdata/goodtables-py>
- **Talend Open Studio**: <https://www.talend.com/products/talend-open-studio/>

## Diferentes projectos que pueden ayudar

<https://github.com/RedeGlobo/transparencia_scraper>
<https://github.com/gilsondev/colaboradados-o-bot>
<https://github.com/ciudadanointeligente/partidopublico>
<https://github.com/jalvarezsamayoa/OpenWolf>
<https://transparencia.gob.gt/>

## Tengo que verificar cualquier parentezco con [cda-transparencia](https://carmendeareco.gob.ar/) (<https://carmendeareco.gob.ar/transparencia>) : <https://github.com/GibranMena/ScrappingPlataformaNacionalTransparencia/blob/master/Taller_PNT.md>)

## Verificar como usar con Carmen de Areco y Empleados

(<https://github.com/basedosdados/sdk>))

## Good reference how to display data

<https://www.clearpointstrategy.com/blog/technology-local-government-transparency>

https://github.com/basedosdados/analises

# Plataforma de Transparencia - Carmen de Areco

## Enlaces de referencia y recursos

## Enlaces gubernamentales y legales

- **Leyes y Decretos Nacionales de SAIJ**: <https://github.com/clarius/normas>
- **Constitución Argentina**: <https://github.com/FdelMazo/ConstitucionArgentina>
- **Carmen de Areco Oficial**: <https://carmendeareco.gob.ar>
- **Carmen de Areco (Archivo histórico)**: <https://web.archive.org/web/20250000000000*/https://carmendeareco.gob.ar>
- **Portal de Transparencia**: carmendeareco.gob.ar/transparencia
- **Portal de Transparencia (Archivo)**: <https://web.archive.org/web/20250000000000*/https://carmendeareco.gob.ar/transparencia/>
- **InfoLEG**: <http://www.infoleg.gob.ar/>
- **Ley de Acceso a la Información Pública**: <https://www.argentina.gob.ar/aaip>
- **Ministerio de Justicia - Datos Abiertos**: <https://datos.jus.gob.ar/>
- **Ley de Responsabilidad del Estado**: <http://servicios.infoleg.gob.ar/infolegInternet/anexos/230000-234999/233216/norma.htm>
- **Ordenanzas Municipales**: <https://www.hcd.gov.ar/> (adaptar a tu municipio)

## Municipios similares (modelos de referencia)

Transparencia Bahía Blanca: <https://transparencia.bahia.gob.ar/>
Transparencia Mar del Plata: <https://www.mardelplata.gob.ar/datos-abiertos>
Municipio de Pilar - Portal de Datos Abiertos: <https://datosabiertos.pilar.gov.ar/>
San Isidro - Transparencia: <https://www.sanisidro.gob.ar/transparencia>
Rosario - Gobierno Abierto: <https://www.rosario.gob.ar/web/gobierno/gobierno-abierto>
Rafaela - Gobierno Abierto: <https://rafaela-gob-ar.github.io/>
https://portaldatransparencia.gov.br/

## Municipios cercanos a Carmen de Areco

Municipalidad de Chacabuco: <https://chacabuco.gob.ar/>
Municipalidad de Chivilcoy: <https://chivilcoy.gov.ar/>
Municipalidad de San Antonio de Areco: <https://www.sanantoniodeareco.gob.ar/>
Municipalidad de San Andrés de Giles: <https://www.sag.gob.ar/>
Municipalidad de Pergamino: <https://www.pergamino.gob.ar/>
Municipalidad de Salto: <https://www.salto.gob.ar/>
Municipalidad de Capitán Sarmiento: <https://capitansarmiento.gob.ar/>

## Carmen de Areco - Recursos específicos

- **Honorable Concejo Deliberante de Carmen de Areco**: <http://hcdcarmendeareco.blogspot.com/>
- **Carmen de Areco en Datos Argentina**: <https://datos.gob.ar/dataset?q=carmen+de+areco>
- **Portal de Municipios - Buenos Aires**: <https://www.gba.gob.ar/municipios>
- **Presupuesto Participativo Carmen de Areco**: <https://carmendeareco.gob.ar/presupuesto-participativo/> (verificar URL exacta)
- **Boletín Oficial Municipal**: <https://carmendeareco.gob.ar/boletin-oficial/> (verificar URL exacta)
- **Licitaciones Carmen de Areco**: <https://carmendeareco.gob.ar/licitaciones/> (verificar URL exacta)
- **Declaraciones Juradas Funcionarios**: <https://carmendeareco.gob.ar/declaraciones-juradas/> (verificar URL exacta)
- **Carmen de Areco en datos.gob.ar**: <https://datos.gob.ar/dataset?organization=carmen-de-areco>

## APIs y datos públicos

- **API Georef Argentina**: <https://apis.datos.gob.ar/georef>
- **Documentación Georef**: <https://github.com/datosgobar/georef-ar-api>
- **Guía de interoperabilidad**: <https://datosgobar.github.io/paquete-apertura-datos/guia-interoperables/>
- **API de Presupuesto Abierto**: <https://datos.gob.ar/dataset/sspm-presupuesto-abierto>
- **API Contrataciones Abiertas**: <https://datos.gob.ar/dataset/modernizacion-sistema-contrataciones-electronicas-argentina>
- **API de Obras Públicas**: <https://www.argentina.gob.ar/obras-publicas/api-seguimiento-de-obras>
- **Portal Nacional de Datos Abiertos**: <https://datos.gob.ar/>
- **API de Presupuesto Nacional**: <https://www.presupuestoabierto.gob.ar/sici/api>
- **Argentina API**: <https://github.com/Franqsanz/argentina-api>
- **Catálogo de APIs públicas**: <https://apidocs.ar/lista.html>
- **Repositorio de APIs públicas**: <http://github.com/enzonotario/apidocs.ar>

## Herramientas para desarrollo

- **AfipSDK PHP**: <https://github.com/AfipSDK/afip.php>
- **AfipSDK JS**: <https://github.com/AfipSDK/afip.js>
- **AfipSDK Blog**: <https://afipsdk.com/blog/>
- **AfipSDK Blog - APIs**: <https://afipsdk.com/blog/category/API/>
- **arg.js**: <https://github.com/miparnisari/arg.js>
- **Argentina.js**: <https://github.com/seppo0010/argentina.js>
- **PyAfipWs**: <https://github.com/reingart/pyafipws>
- **Civics API**: <https://github.com/datosgobar/civics-apis-argentina>
- **Poncho**: <https://github.com/argob/poncho>

## Herramientas para análisis y captura de datos

- **BORA App**: <https://github.com/juancarlospaco/borapp>
- **BORA App Web**: <https://juancarlospaco.github.io/borapp>
- **Archivador datos públicos**: <https://datos.nulo.ar/>
- **Repositorio archivador**: <https://github.com/catdevnull/transicion-desordenada-diablo>
- **BORA Crawler**: <https://github.com/chrishein/bora_crawler>
- **Catálogo Social**: <https://catalogosocial.fly.dev/>
- **Repo Catálogo Social**: <https://github.com/pdelboca/catalogosocial>
- **DataHub Argentina**: <https://github.com/datosgobar/datahub>
- **Scraper Ministerio de Justicia**: <https://github.com/jorgechavez6816/minjus_reg_sociedades_argentina>
- **Scraper Boletín Oficial**: <https://github.com/tommanzur/scraper_boletin_oficial>
- **Análisis BCRA**: <https://github.com/ezebinker/DatosAPI-BCRA>
- **Bot SIBOM**: <https://github.com/nmontesoro/SIBOM>
- **@BoletinMGP**: <https://x.com/BoletinMGP>

## Herramientas de transparencia y auditoría

- **Portal de Transparencia Fiscal PBA**: <https://www.gba.gob.ar/transparencia_fiscal/>
- **Mapa de inversiones**: <https://www.argentina.gob.ar/jefatura/innovacion-publica/mapa-inversiones>
- **Directorio Legislativo**: <https://directoriolegislativo.org/>
- **Poder Ciudadano**: <https://poderciudadano.org/>
- **Chequeado Datos**: <https://chequeado.com/proyectos/>
- **ACIJ - Asociación Civil por la Igualdad y la Justicia**: <https://acij.org.ar/>
- **La Nación Data**: <https://www.lanacion.com.ar/data/>

## Repositorios de código útiles

- **Repositorio de datos políticos**: <https://github.com/PoliticaArgentina/data_warehouse>
- **Expedientes Transparentes**: <https://github.com/expedientes-transparentes/et-api>
- **Cargografías**: <https://github.com/cargografias/cargografias>
- **OGP Argentina**: <https://github.com/ogpargentina/standards>
- **Municipalities-Argentina**: <https://github.com/martinlabuschin/municipalities-argentina>

## Blockchain y verificación

- **Blockchain Federal Argentina**: <https://bfa.ar/>
- **Democracia en Red**: <https://github.com/DemocraciaEnRed>
- **Open Contracting**: <https://standard.open-contracting.org/latest/es/>
- **Decentralized Identity Foundation**: <https://identity.foundation/>

## Herramientas de visualización

- **Tableau Public**: <https://public.tableau.com/>
- **Observable**: <https://observablehq.com/>
- **Flourish**: <https://flourish.studio/>
- **Grafana**: <https://grafana.com/>

## Artículos y recursos educativos

- **Análisis con Neo4j**: <https://medium.com/@chrishein/detecting-suspicious-patterns-in-argentinean-companies-incorporation-using-scrapy-and-neo4j-e826bacb0809#.b3em4ckuc>

## Herramientas para monitoreo continuo

- **FeedBurner**: <https://feedburner.google.com/> (para monitorear cambios en sitios web)
- **Wayback Machine API**: <https://archive.org/help/wayback_api.php>
- **CrawlMonitor**: <https://github.com/crawlmonitor/crawlmonitor>
- **Scrapy Cloud**: <https://www.zyte.com/scrapy-cloud/>
- **WebScraper.io**: <https://webscraper.io/>
- **IFTTT para monitoreo**: <https://ifttt.com/>
- **Change Detection**: <https://github.com/dgtlmoon/changedetection.io>

## Herramientas de verificación de datos

- **Open Refine**: <https://openrefine.org/>
- **CSVLint**: <https://csvlint.io/>
- **Data Quality Tool**: <https://github.com/frictionlessdata/goodtables-py>
- **Talend Open Studio**: <https://www.talend.com/products/talend-open-studio/>

## Diferentes projectos que pueden ayudar

### Portales de Transparencia Municipal

- **Vota Inteligente Portal Electoral**: [https://github.com/ciudadanointeligente/votainteligente-portal-electoral](https://github.com/ciudadanointeligente/votainteligente-portal-electoral)
- **Portal de Transparencia Nacional**: [https://portal.transparencia.gob.ar/transparencia](https://portal.transparencia.gob.ar/transparencia)
- **Guías de Publicación de Transparencia BA**: [https://transparenciaba.github.io/guias-publicacion-ta/](https://transparenciaba.github.io/guias-publicacion-ta/)
- **Paquete de Apertura de Datos**: [https://github.com/datosgobar/paquete-apertura-datos](https://github.com/datosgobar/paquete-apertura-datos)
- **Guía de Datos Abiertos**: [https://datosgobar.github.io/paquete-apertura-datos/guia-abiertos/](https://datosgobar.github.io/paquete-apertura-datos/guia-abiertos/)
- **Guía de Metadatos**: [https://datosgobar.github.io/paquete-apertura-datos/guia-metadatos/](https://datosgobar.github.io/paquete-apertura-datos/guia-metadatos/)

### Informes y Estudios

- **Informe de Transparencia Fiscal Municipal BA 2024**: [https://asap.org.ar/img_informes/12111441_InformeTransparenciaFiscalMunicipalBA2024.11.pdf](https://asap.org.ar/img_informes/12111441_InformeTransparenciaFiscalMunicipalBA2024.11.pdf)

### Recursos Legales y Normativos

- **Legislatura de Buenos Aires - Licitaciones y Contrataciones**: [https://www.legislatura.gob.ar/seccion/licitaciones-contrataciones.html](https://www.legislatura.gob.ar/seccion/licitaciones-contrataciones.html)

### Portales de Contrataciones Públicas

- **Portal de Búsqueda de Adquisiciones y Contrataciones**: [https://pbac.cgp.gba.gov.ar/Default.aspx](https://pbac.cgp.gba.gov.ar/Default.aspx)
- **Licitaciones Provincia de Buenos Aires**: [https://www.gba.gob.ar/produccion/licitaciones](https://www.gba.gob.ar/produccion/licitaciones)
- **Consulta de Contrataciones**: [https://sistemas.gba.gob.ar/consulta/contrataciones/](https://sistemas.gba.gob.ar/consulta/contrataciones/)
- **Licitaciones Públicas GBA**: [https://gba.gob.ar/content/licitaciones_p%C3%BAblicas](https://gba.gob.ar/content/licitaciones_p%C3%BAblicas)
- **Licitaciones Infraestructura**: [https://www.gba.gob.ar/infraestructura/licitaciones](https://www.gba.gob.ar/infraestructura/licitaciones)
- **Contrataciones Infraestructura TAL**: [https://www.gba.gob.ar/infraestructura_tal/contrataciones](https://www.gba.gob.ar/infraestructura_tal/contrataciones)

### Portales de Transparencia

- **Portal de Transparencia Nacional**: [https://portal.transparencia.gob.ar/](https://portal.transparencia.gob.ar/)
- **Transparencia Buenos Aires**: [https://buenosaires.gob.ar/legalytecnica/transparencia](https://buenosaires.gob.ar/legalytecnica/transparencia)

### Portales de Referencia

- **Transparencia Bahía Blanca**: [https://transparencia.bahia.gob.ar/](https://transparencia.bahia.gob.ar/)
- **Transparencia Mar del Plata**: [https://www.mardelplata.gob.ar/datos-abiertos](https://www.mardelplata.gob.ar/datos-abiertos)
- **Municipio de Pilar - Portal de Datos Abiertos**: [https://datosabiertos.pilar.gov.ar/](https://datosabiertos.pilar.gov.ar/)
- **San Isidro - Transparencia**: [https://www.sanisidro.gob.ar/transparencia](https://www.sanisidro.gob.ar/transparencia)
- **Rosario - Gobierno Abierto**: [https://www.rosario.gob.ar/web/gobierno/gobierno-abierto](https://www.rosario.gob.ar/web/gobierno/gobierno-abierto)
- **Rafaela - Gobierno Abierto**: [https://rafaela-gob-ar.github.io/](https://rafaela-gob-ar.github.io/)

### Recursos para Visualización y Desarrollo

- **Astro + D3.js**: [https://github.com/withastro/astro/tree/main/examples/with-d3js](https://github.com/withastro/astro/tree/main/examples/with-d3js)
- **Astro + React + ChartJS**: [https://github.com/withastro/astro/tree/main/examples/with-react](https://github.com/withastro/astro/tree/main/examples/with-react)

### Herramientas de Código Abierto

- **Open Contracting Data Standard**: [https://github.com/open-contracting/standard](https://github.com/open-contracting/standard)
- **OpenFisca**: [https://github.com/openfisca/openfisca-core](https://github.com/openfisca/openfisca-core)
- **OpenSpending**: [https://github.com/openspending/openspending](https://github.com/openspending/openspending)

### Frameworks OSINT

- **OSINT Framework**: [https://github.com/lockfale/OSINT-Framework](https://github.com/lockfale/OSINT-Framework)
- **Maltego**: [https://www.maltego.com/](https://www.maltego.com/)

### Herramientas de Extracción y Procesamiento

- **Tabula-py**: [https://github.com/chezou/tabula-py](https://github.com/chezou/tabula-py)
- **Scrapy**: [https://github.com/scrapy/scrapy](https://github.com/scrapy/scrapy)
- **pandas**: [https://github.com/pandas-dev/pandas](https://github.com/pandas-dev/pandas)
- **OpenCV**: [https://github.com/opencv/opencv-python](https://github.com/opencv/opencv-python)

### Bases de Datos y Almacenamiento

- **SQLite**: [https://www.sqlite.org/](https://www.sqlite.org/)
- **MongoDB**: [https://www.mongodb.com/](https://www.mongodb.com/)
- **MinIO**: [https://github.com/minio/minio](https://github.com/minio/minio)

### Herramientas para Gestión de Multimedia

- **Sharp**: [https://github.com/lovell/sharp](https://github.com/lovell/sharp)
- **FFmpeg**: [https://github.com/FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg)
- **Cloudinary**: [https://cloudinary.com/](https://cloudinary.com/)
- **ImgProxy**: [https://github.com/imgproxy/imgproxy](https://github.com/imgproxy/imgproxy)

### Metodologías y Estándares

- **Open Data Charter**: [https://opendatacharter.net/](https://opendatacharter.net/)
- **Five Star Open Data**: [https://5stardata.info/](https://5stardata.info/)
- **International Open Data Conference**: [https://opendatacon.org/](https://opendatacon.org/)

### Organizaciones y Comunidades

- **Open Knowledge Foundation**: [https://okfn.org/](https://okfn.org/)
- **Transparency International**: [https://www.transparency.org/](https://www.transparency.org/)
- **Directorio Legislativo**: [https://directoriolegislativo.org/](https://directoriolegislativo.org/)
- **Civic Tech Argentina**: [https://civictechargentina.org/](https://civictechargentina.org/)
- **Hacks/Hackers**: [https://www.hackshackers.com/](https://www.hackshackers.com/)

## TO VERIFY (DON'T REMOVE)

<https://github.com/RedeGlobo/transparencia_scraper>
<https://github.com/gilsondev/colaboradados-o-bot>
<https://github.com/ciudadanointeligente/partidopublico>
<https://github.com/jalvarezsamayoa/OpenWolf>
<https://transparencia.gob.gt/>
<https://github.com/RedeGlobo/transparencia_scraper>

## Tengo que verificar cualquier parentezco con [cda-transparencia](https://carmendeareco.gob.ar/) (<https://carmendeareco.gob.ar/transparencia>) : <https://github.com/GibranMena/ScrappingPlataformaNacionalTransparencia/blob/master/Taller_PNT.md>)

## Verificar como usar con Carmen de Areco y Empleados

(<https://github.com/basedosdados/sdk>))

## Good reference how to display data

<https://www.clearpointstrategy.com/blog/technology-local-government-transparency>
# Complete Action Plan - Carmen de Areco Government Data Collection

## 🎯 Mission
Collect ALL government data related to Carmen de Areco from municipal, provincial (Buenos Aires), and national sources, including hidden, archived, and deleted content.

## 🔍 Current Findings

Based on my research, I've identified the following key sources:

### Municipal Level
- **Official Portal**: https://carmendeareco.gob.ar/transparencia/ (needs verification)
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

## 📋 Implementation Steps

### Step 1: Set Up Environment (Day 1)

```bash
# Install required packages
pip install requests beautifulsoup4 selenium waybackpy pytesseract pandas \
            pymongo redis cryptography pillow openpyxl PyPDF2

# Install system dependencies
sudo apt-get install tesseract-ocr tesseract-ocr-spa chromium-driver

# Create project structure
mkdir carmen_areco_transparency
cd carmen_areco_transparency
```

### Step 2: Deploy Comprehensive Scraper (Days 2-5)

1. **Run the comprehensive government scraper**:
```bash
python comprehensive_gov_scraper.py
```

This will:
- Scrape all known government sources
- Search PBAC for Carmen de Areco contracts
- Query national procurement systems
- Download all found documents
- Generate a comprehensive report

### Step 3: Extract Hidden Data (Days 6-8)

2. **Run the hidden data extractor**:
```bash
python hidden_data_extractor.py
```

This will:
- Find archived versions using Wayback Machine
- Search for deleted pages
- Extract JavaScript-rendered content
- Find hidden forms and API endpoints
- Perform OCR on images
- Search for database exports

### Step 4: Data Processing (Days 9-12)

3. **Process and organize collected data**:
```bash
python process_files.py
python organize_data.py
```

### Step 5: Deploy Monitoring System (Day 13-15)

4. **Set up continuous monitoring**:
```bash
python monitoring_automation_script.py
```

Configure cron job:
```bash
# Edit crontab
crontab -e

# Add monitoring jobs
0 */6 * * * /usr/bin/python3 /path/to/monitoring_automation_script.py
0 2 * * * /usr/bin/python3 /path/to/comprehensive_gov_scraper.py
```

## 🔐 Data Types to Collect

### Priority 1 - Critical Documents
- **Licitaciones** (Tenders/Bids)
- **Contratos** (Contracts)
- **Expedientes** (Administrative files)
- **Empleados** (Employee lists and salaries)
- **Presupuesto** (Budget documents)

### Priority 2 - Compliance Documents
- **Declaraciones Juradas** (Asset declarations)
- **Ordenanzas** (Municipal ordinances)
- **Decretos** (Decrees)
- **Resoluciones** (Resolutions)
- **Auditorías** (Audit reports)

### Priority 3 - Supporting Documents
- **Boletines Oficiales** (Official bulletins)
- **Actas** (Meeting minutes)
- **Informes** (Reports)
- **Estadísticas** (Statistics)
- **Proyectos** (Projects)

## 🛠️ Technical Strategies

### 1. **Multi-Level Searching**
- Direct URL access
- Search engine queries
- Form submissions with wildcards
- API endpoint discovery
- JavaScript variable extraction

### 2. **Archive Recovery**
- Wayback Machine (all years)
- Google Cache
- Archive.today/Archive.ph
- Local government backups
- Deleted page detection

### 3. **Obfuscation Bypass**
- Base64 decoding
- URL decoding
- OCR for image-based documents
- JavaScript deobfuscation
- Hidden form discovery

### 4. **Pattern Recognition**
Search for these patterns in all content:
- Expediente: `EX-2024-12345678`, `EXP-2024/1234`
- Licitación: `LIC.PUB.Nº 01/2024`, `LP 12-2024`
- Decreto: `DEC Nº 123/2024`, `DECRETO-2024-123`
- Resolution: `RES Nº 456/2024`, `RESOL-2024-456`

## 🚨 Special Attention Areas

### 1. **PBAC System** (Provincial)
- Search variations: "carmen de areco", "municipalidad carmen", "muni carmen areco"
- Check all contract statuses: active, completed, cancelled
- Download ALL attached documents

### 2. **Hidden Directories**
Common patterns to check:
```
/transparencia/old/
/transparencia/2023/
/transparencia/archivo/
/licitaciones/historico/
/admin/uploads/
/files/expedientes/
/documentos/reservados/
```

### 3. **Database Exports**
Look for:
```
backup.sql, dump.sql, municipio.sql
backup_20240101.zip
db_export_2024.csv
sistema_backup.tar.gz
```

### 4. **API Endpoints**
Test these patterns:
```
/api/licitaciones
/api/v1/contratos
/rest/empleados
/ajax/search
/json/expedientes
```

## 📊 Expected Results

Based on the comprehensive approach, you should collect:

- **500+ Official Documents** (PDFs, Excel, Word)
- **100+ Contracts and Tenders**
- **Employee Records** (if publicly available)
- **5+ Years of Historical Data** (from archives)
- **Hidden/Deleted Content** (recovered from caches)
- **API Data** (JSON/XML responses)
- **OCR-Extracted Text** (from images)

## 🔄 Continuous Monitoring

### Daily Tasks
- Check for new bulletin publications
- Monitor PBAC for new processes
- Scan for website changes

### Weekly Tasks
- Full website backup
- Archive comparison
- Report generation

### Monthly Tasks
- Deep archive search
- Pattern analysis
- FOIA request follow-up

## 📈 Next Steps After Collection

1. **Data Validation**
   - Verify document authenticity
   - Cross-reference multiple sources
   - Check digital signatures

2. **Data Analysis**
   - Identify suspicious patterns
   - Track budget irregularities
   - Monitor contract awards

3. **Public Portal Development**
   - Deploy your Astro frontend
   - Implement search functionality
   - Add data visualizations

4. **Legal Protection**
   - Document your methodology
   - Ensure compliance with laws
   - Prepare for potential pushback

## 🚀 Quick Start Commands

```bash
# 1. Clone and setup
git clone [your-repo]
cd carmen-areco-transparency
pip install -r requirements.txt

# 2. Run comprehensive scraper
python comprehensive_gov_scraper.py

# 3. Extract hidden data
python hidden_data_extractor.py

# 4. Start monitoring
python monitoring_automation_script.py

# 5. Generate report
python generate_report.py
```

## ⚠️ Important Warnings

1. **Respect robots.txt** where legally required
2. **Use delays** between requests (2-5 seconds)
3. **Document everything** for transparency
4. **Verify data** before publishing
5. **Secure your infrastructure** against retaliation

## 📞 Support Resources

- **Technical Issues**: Use GitHub issues
- **Legal Questions**: Consult with Poder Ciudadano
- **Security Concerns**: Implement proper OpSec
- **Collaboration**: Join transparency networks

## 🎯 Success Metrics

- ✅ All known sources scraped
- ✅ Hidden directories discovered
- ✅ Historical data recovered
- ✅ Monitoring system active
- ✅ Data properly organized
- ✅ Reports generated
- ✅ Portal deployed

1. Qué queremos lograr

“Portal de Transparencia para la Municipalidad de Carmen de Areco”

• Publicar de forma abierta (CSV/JSON/XLSX) todos los documentos públicos que la municipalidad debe divulgar por ley (editores de presupuesto, contratos, rendiciones, declaraciones juradas, etc.).
• Facilitar a la ciudadanía la búsqueda, el filtrado y la visualización de esos datos.
• Permitir la descarga directa de los archivos originales (PDF, DOC, etc.).
• Documentar la fuente, las fechas de publicación y el estado de cada registro (ej.: “aún revisado”, “en auditoría”, “sanado” …).
• Proveer una API pública (REST/GraphQL) que quede en línea permanentemente.
• Registrar los cambios y versionar los archivos (git + GitHub Actions + S3/Blob Storage).

2. Arquitectura recomendada

 ┌─────────────────────┐                           ┌─────────────────────┐
 │   Fuentes externas   │   (web scraper / FOIA)   │     API externa      │
 └───────┬───────┬──────┘   ┌──────────────────────┴───────────────────────┘
         │       │      │
   ┌───▼─────┐  ┌─▼──────┐ ┌─────▼─────┐
   │   Scraper │ │   API  │ │   FOIA    │
   └────┬────┘  └────┬───┘ └────┬──────┘
        │           │          │
     ┌──▼──────┐ ┌─▼───────┐   ┌─▼───────┐
     │  Ingest │ │  Ingest │   │  Ingest │
     └───┬─────┘ └────┬────┘   └────┬────┘
         │          │            │
   ┌────▼─────┐ ┌───▼───────┐ ┌───▼───────┐
   │  Raw DB │ │  Staging DB│ │  Audit DB │
   └───┬─────┘ └────┬──────┘ └────┬──────┘
       │          │            │
   ┌───▼──────┐┌────▼──────┐   │
   │  Validation││  Normalization││
   └────┬─────┘└─────┬──────┘   │
        │          │            │
   ┌────▼─────┐ ┌───▼─────┐  ┌─▼──────┐
   │ Public DB│ │  Audit  │  │ Reports │
   └────┬─────┘ └─────┬──┘  └──────┘
        │          │            │
   ┌────▼───────▼──────────────▼─────┐
   │          Front‑End (React + Node) │
   └──────────────────────────────────┘
Scrapers → Ingest pipelines → Data lake & staging → Validation / Normalization → Production DB → APIs → Portal + downloads.

3. Fuentes de datos y cómo extraerlas

Fuente	Tipo	Método de obtención	Frecuencia recomendada
Boletín Oficial de la Provincia (páginas específicas)	PDFs con resoluciones	1. Web‑scraper (Python + requests, beautifulsoup)
2. Opcional: pdfplumber para extracción de tablas	Manual o script semanal (cuando el Boletín se publica).
Sitio oficial de Carmen de Areco (boletín, contratos, presupuestos)	HTML, JSON, PDFs	Scraper con Scrapy o Selenium (para páginas dinámicas)	Semanalmente / cuando haya actualización.
**FOIA **	PDF / Word / HTML	Solícito FOIA, se recibe a través de un mailbox.	Según respuesta de la oficina.
Data Argentina (conjunto de datasets públicos)	JSON / CSV	API (https://datos.gob.ar/api/...)	Mensual.
Open Contracting (contrataciones de provincia)	JSON‑LD	API oficial (https://api.contrataciones.gob.ar/)	Diario.
Gobierno Abierto (GBA)	CSV/JSON	API (https://api.gba.gob.ar/...)	Mensual.
Ministry of Justice (Datos abiertos)	JSON/CSV	API (https://datos.jus.gob.ar/...)	Semanal.
Georef, Presupuesto Abierto, Infraestructura	GeoJSON, CSV, XML	APIs específicas	Según disponibilidad.
Ejemplo de scraper con requests y pdfplumber

import requests, pdfplumber, re

def download_pdf(url, dest):
    r = requests.get(url, stream=True)
    r.raise_for_status()
    with open(dest, 'wb') as f:
        for chunk in r.iter_content(1024):
            f.write(chunk)

def extract_tables(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for t in tables:
                print("### table")
                for row in t: print(row)

pdf_url = "https://www.dateas.com/es/docs/boletin-bsas-oficial/2022/02/23"
download_pdf(pdf_url, "boletin_2022_02_23.pdf")
extract_tables("boletin_2022_02_23.pdf")
4. Ingest & Validación

Raw Table

guarda los PDFs y los metadatos (URL, fecha, título, pdf‑size).
en un bucket S3 (raw/).
Staging

convertir tablas en CSV con pandas + tabula-py.
validar tipos de columnas, formatos (fechas, numerales).
versionar cada archivo con un hash (SHA‑256).
Audit

registrar cada cambio: quién lo hizo, porque, fecha.
usar “diff” para detectar modificaciones entre versiones.
Normalization

usar un esquema OWL/JSON‑Schema (Open Contracting Data Standard, Budget Transparency Charter).
mapear campos de la fuente a un modelo común (ex. entity:municipality, field:budget, field:expenditure, etc.).
cargar en un banco Postgres + PostGIS para consultas complejas.
Public DB

exposición vía API REST (FastAPI) + GraphQL (ArangoDB or Hasura).
endpoints:
/presupuestos/?year=2023
/contratos/?startDate=2023-01-01&endDate=2023-12-31
/multas/?municipality=carme etc.
Data Quality Reports (CSV/JSON)

métricas: “total presupuesto”, “expenditures by sector”, “gap”, “sanction amounts”.
publicarlos en /reports/.
5. Portal Front‑End (React + Vite + TypeScript)

npm create vite@latest cda-transparency -- --template react-ts
cd cda-transparency
npm i axios react-router-dom
Arquitectura de carpetas

src/
 ├─ api/          # wrappers around FastAPI endpoints
 ├─ components/   # reusable UI components (Table, FilterBar, Chart)
 ├─ pages/        # Home, Budgets, Contracts, Sanctions, Reports
 ├─ hooks/        # custom hooks (useBudgets, useContracts)
 └─ lib/          # utilities (formatCurrency, formatDate)
Ejemplo de page: BudgetsPage.tsx

import React from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { Table } from '../components/Table';

export const BudgetsPage = () => {
  const { data, loading, error } = useBudgets(2023);

  return (
    <section>
      <h1>Presupuesto 2023</h1>
      {loading && <p>cargando…</p>}
      {error && <p>error: {error.message}</p>}
      {data && <Table columns={data.columns} rows={data.rows} />}
    </section>
  );
};
Chart con Chart.js

import { Bar } from 'react-chartjs-2';

const chartData = {
  labels: ['Alimentos', 'Salud', 'Educación'],
  datasets: [{
    label: 'Gasto total (USD)',
    data: [120000, 90000, 75000],
    backgroundColor: '#3e95cd',
  }],
};
<Bar data={chartData} />;
6. Seguridad y gobernanza de datos

Categoría	Acción	Herramienta
Almacén	Versionado de archivos, backup nightly	AWS S3 + Glacier
Acceso API	Rate‑limiting + API‑Key	Kong / Tyk
Identidad	OAuth2 + OIDC	Keycloak
Autenticación pública	“Open” endpoints + “Authenticated” endpoints (administradores)	JWT
Logs	CloudWatch, ELK	Elastic + Logstash
Auditoría	Registro de cambios, revisión semestral	GitHub Actions + GitHub Audit Logs
7. Monitoreo de cambios en la web

Wayback Machine API – comprobar si la página oficial cambió en los últimos X días.
GitHub Actions – trigger cada vez que se detecte un cambio en el repositorio de los PDFs (Git LFS).
Webhook – enviar mensaje a Slack / Teams cuando se publica un nuevo Boletín, cuando un archivo pasa a “approved”, etc.
8. Próximos pasos (road‑map)

Kick‑off – confirmación de la lista de documentos obligatorios (presupuesto, rendición, contratos…).
Construir Scraper – comenzar con el Boletín de 2022 (última fecha de los enlaces que me dio).
Implementar pipeline – ingestion → transformation → storage → API → UI.
Testeo – unit tests (pytest), integration tests, fuzz‑testing de PDFs.
Deployment – Docker + Kubernetes (EKS) + Load Balancer (Traefik).
Open API Docs – swagger UI (fastapi.openapi).
Publicación – portal en https://carmendeareco.gob.ar/transparencia con certificado TLS (let‑encrypt).
Mantenimiento – cron‑job semanal para nuevos Boletines / FOIA; revisión de cambios en APIs públicas.
Mejoras – Dashboard de análisis visual, alertas por “sanctions > X%”, comparación histórica.
9. Enlace rápido a los recursos que me proporcionaste

Docos oficiales

BOLETÍN OFICIAL (ej. https://www.dateas.com/es/docs/boletin-bsas-oficial/2022/02/23)
Boletín oficial municipal – https://carmendeareco.gob.ar/boletin-oficial/
Licitaciones – https://carmendeareco.gob.ar/licitaciones/
APIs & open data

https://datos.gob.ar/api/ – Datos Argentina
https://api.contrataciones.gob.ar/ – Contrataciones Abiertas
https://api.gba.gob.ar/ – Gobierno Abierto de la PBA
https://apis.datos.gob.ar/georef/ – Georef
Herramientas & librerías

Scrapy, BeautifulSoup, pdfplumber, tabula-py
FastAPI, Uvicorn, Pydantic
PostgreSQL + PostGIS, Hasura (auto‑SQL ↔ GraphQL)
React + Vite + TypeScript + Chart.js
GitHub Actions + Docker + S3
Estándares y guías

Open Contracting Data Standard – https://standard.open-contracting.org
5‑Star Open Data – https://5stardata.info
Charters: https://opendatacharter.net
Comunidades

GBA Transparencia – https://gba.gob.ar/transparencia_fiscal
Open Knowledge Argentina – https://okfn.org.ar
Civic Tech Argentina – https://civictechargentina.org/
Repositorios útiles (para clonar, fork, copiar ejemplos)

https://github.com/RedeGlobo/transparencia_scraper
https://github.com/gilsondev/colaboradados-o-bot
https://github.com/ciudadanointeligente/partidopublico
https://github.com/jalvarezsamayoa/OpenWolf
10. Resumen ejecutivo

Colecta: Scrapeo de los Boletines, FOIA y sitios oficiales.
Transformación: Conversión a CSV/JSON → normalización con estándares internacionales.
Almacenamiento: Raw + Staging + Audit + Production en Postgres.
API: FastAPI → Swagger & GraphQL.
UI: React + Charts.
Gobierno: Versionado, logging, seguridad (JWT, OAuth2).
Monitorización: Wayback, Slack alerts, GitHub Actions.
Deployment: Docker, K8s, Cloudfront, let‑encrypt TLS.
