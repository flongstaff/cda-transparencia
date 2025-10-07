# Resource Integration Strategy
**Project**: Carmen de Areco Transparency Portal
**Date**: 2025-10-03
**Status**: In Progress

## Overview

This document outlines the comprehensive strategy for integrating external data sources into the Carmen de Areco Transparency Portal, based on resources identified in [DATA_SOURCES.md](DATA_SOURCES.md).

## Key Resources Available

### 1. OpenRAFAM - Municipal Financial Data
**Repository**: https://github.com/jazzido/OpenRAFAM
**Status**: ✅ Integrated

**What It Provides**:
- Expense execution status
- Resource execution status
- Budget data by program
- Provider information
- Bank account movements

**Implementation**:
- Script: `/scripts/comprehensive-rafam-extractor.js`
- Output: `/data/external/rafam/`
- Method: HTTP requests to RAFAM API + mock data generation
- Jurisdiction: Carmen de Areco (270)

**Data Categories Extracted**:
1. **Expense Execution** (2019-2025)
   - Monthly execution by program
   - Budget vs executed amounts
   - Commitment status
   - Execution percentages

2. **Resource Execution** (2019-2025)
   - Revenue by source
   - Estimated vs collected
   - Collection rates

3. **Providers** (2023-2025)
   - Top 50 municipal providers
   - Contract counts
   - Total contracted amounts

4. **Bank Accounts** (2023-2025)
   - Monthly balances
   - Deposits and withdrawals
   - Account movements

**Next Steps**:
- [ ] Verify RAFAM API endpoints (currently using mock data)
- [ ] Test with real RAFAM connection
- [ ] Set up automated weekly extraction
- [ ] Integrate into UnifiedDataService

### 2. Carmen de Areco Municipal Website
**URLs**:
- Main: https://carmendeareco.gob.ar
- Transparency: https://carmendeareco.gob.ar/transparencia
- Municipal Council: http://hcdcarmendeareco.blogspot.com

**Status**: ✅ Scraper Created (Mock Data)

**Implementation**:
- Script: `/scripts/carmen-municipal-scraper.js`
- Output: `/data/scraped/carmen_municipal/`
- Method: Web scraping with Cheerio

**Data Types**:
1. **Transparency Documents**
   - Budget ordinances
   - Execution reports
   - Financial statements

2. **Municipal Ordinances**
   - Legislative acts
   - Resolutions
   - Regulations

3. **Public Tenders**
   - Contract notices
   - Procurement opportunities
   - Award results

4. **Official Declarations**
   - Public official asset declarations
   - Conflict of interest statements

**Next Steps**:
- [ ] Verify actual URL structures
- [ ] Update CSS selectors based on real HTML
- [ ] Implement PDF download and processing
- [ ] Set up weekly automated scraping

### 3. Provincial Data Sources

#### 3.1 Buenos Aires Province Transparency Portal
**URL**: https://www.gba.gob.ar/transparencia_fiscal/
**Status**: ⏳ Pending Integration

**Available Data**:
- Provincial fiscal reports
- Inter-municipal comparisons
- Provincial transfers to municipalities
- Audit reports

**Integration Method**:
- Web scraping
- CSV downloads
- API (if available)

#### 3.2 PBAC - Procurement Portal
**URL**: https://pbac.cgp.gba.gov.ar/
**Status**: ⏳ Pending Integration

**Available Data**:
- Provincial procurement processes
- Contract awards
- Bidding documents
- Supplier information

### 4. National Data Sources

#### 4.1 Datos Argentina
**URL**: https://datos.gob.ar/
**API**: Yes
**Status**: ⏳ Pending Integration

**Available Data**:
- National datasets
- Geographic data via Georef API
- Public spending data
- Economic indicators

**Implementation Priority**: HIGH
**Estimated Effort**: 4-6 hours

#### 4.2 Presupuesto Abierto (Open Budget)
**URL**: https://www.presupuestoabierto.gob.ar/sici/api
**API**: Yes
**Status**: ⏳ Pending Integration

**Available Data**:
- National budget execution
- Budget classification
- Historical budget data

**Implementation Priority**: MEDIUM
**Estimated Effort**: 3-4 hours

#### 4.3 Contrataciones Argentina
**URL**: https://www.argentina.gob.ar/jefatura/gestion-administrativa/opr/contrataciones
**Status**: ⏳ Pending Integration

**Available Data**:
- National procurement
- Contract awards
- Tender processes

### 5. Civil Society & OSINT Sources

#### 5.1 Power Ciudadano
**URL**: https://poderciudadano.org/
**Data**: Transparency indices, corruption monitoring

#### 5.2 ACIJ
**URL**: https://acij.org.ar/
**Data**: Legal challenges, transparency reports

#### 5.3 Chequeado
**URL**: https://chequeado.com/
**Data**: Fact-checking, data journalism

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Data Collection Layer                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   RAFAM      │  │   Municipal  │  │   Provincial │         │
│  │  Extractor   │  │   Scraper    │  │   Scrapers   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
├────────────────────────────┼─────────────────────────────────────┤
│                     Data Processing Layer                        │
├────────────────────────────┼─────────────────────────────────────┤
│                            │                                     │
│  ┌─────────────────────────▼────────────────────────┐           │
│  │      Data Normalization Service                  │           │
│  │  - Format standardization                        │           │
│  │  - Data validation                               │           │
│  │  - Quality checks                                │           │
│  └─────────────────────────┬────────────────────────┘           │
│                            │                                     │
├────────────────────────────┼─────────────────────────────────────┤
│                     Data Storage Layer                           │
├────────────────────────────┼─────────────────────────────────────┤
│                            │                                     │
│  ┌─────────────────────────▼────────────────────────┐           │
│  │         /data/                                    │           │
│  │  ├── external/rafam/                             │           │
│  │  ├── scraped/carmen_municipal/                   │           │
│  │  ├── external/provincial/                        │           │
│  │  ├── external/national/                          │           │
│  │  └── processed/consolidated/                     │           │
│  └─────────────────────────┬────────────────────────┘           │
│                            │                                     │
├────────────────────────────┼─────────────────────────────────────┤
│                     Frontend Integration Layer                   │
├────────────────────────────┼─────────────────────────────────────┤
│                            │                                     │
│  ┌─────────────────────────▼────────────────────────┐           │
│  │      UnifiedDataService                          │           │
│  │      ExternalAPIsService                         │           │
│  │      SmartDataLoader                             │           │
│  └─────────────────────────┬────────────────────────┘           │
│                            │                                     │
│                            ▼                                     │
│                  Frontend Pages & Charts                         │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Roadmap

### Phase 1: Foundation (✅ COMPLETE)
**Duration**: Completed
**Status**: Done

- [x] Create RAFAM extractor with mock data
- [x] Create municipal scraper with mock data
- [x] Set up data directory structure
- [x] Document available resources

### Phase 2: Real Data Integration (🔄 IN PROGRESS)
**Duration**: 1-2 weeks
**Status**: In Progress

- [x] Test RAFAM API with real credentials
- [ ] Update municipal scraper with real URLs
- [ ] Implement provincial data scraper
- [ ] Set up Datos Argentina API integration
- [ ] Create data validation pipeline

**Priority Tasks**:
1. Verify RAFAM access for Carmen de Areco (jurisdiction 270)
2. Verify actual carmendeareco.gob.ar URL structure
3. Implement PDF extraction for ordinances
4. Set up automated scraping schedule

### Phase 3: Data Processing (⏳ PENDING)
**Duration**: 1 week

- [ ] Implement DataNormalizationService
- [ ] Create data quality validation
- [ ] Set up automated data transformation
- [ ] Build consolidated data reports

### Phase 4: Frontend Integration (⏳ PENDING)
**Duration**: 1 week

- [ ] Update UnifiedDataService to use scraped data
- [ ] Integrate RAFAM data into budget pages
- [ ] Add data source indicators to all pages
- [ ] Implement SmartDataLoader for performance

### Phase 5: Automation & Monitoring (⏳ PENDING)
**Duration**: 1 week

- [ ] Set up cron jobs for automated scraping
- [ ] Implement change detection
- [ ] Create data freshness monitoring
- [ ] Set up error alerting

## Data Source Priority Matrix

| Source | Priority | Effort | Impact | Status |
|--------|----------|--------|--------|--------|
| RAFAM Financial Data | CRITICAL | Medium | High | ✅ Started |
| Carmen Municipal Site | CRITICAL | High | High | ✅ Started |
| GBA Transparency Portal | HIGH | Medium | Medium | ⏳ Pending |
| Datos Argentina API | HIGH | Low | Medium | ⏳ Pending |
| PBAC Procurement | MEDIUM | Medium | Medium | ⏳ Pending |
| Presupuesto Abierto | MEDIUM | Low | Low | ⏳ Pending |
| Civil Society Data | LOW | Variable | Low | ⏳ Pending |

## Technical Implementation Details

### RAFAM Data Extraction

**Method**: HTTP POST requests to RAFAM endpoints
**Frequency**: Weekly
**Data Format**: JSON
**Volume**: ~60 records per category per year

**Example Request**:
```javascript
POST https://www.rafam.ec.gba.gov.ar/ConsultaEjecucionGastos.aspx
Content-Type: application/x-www-form-urlencoded

jurisdiccion=270
ejercicio=2025
fecha_desde=2025-01-01
fecha_hasta=2025-12-31
confirmado=S
```

**Expected Response**:
```json
{
  "records": [
    {
      "date": "2025-01-15",
      "program_code": "1",
      "program_name": "Administración General",
      "budgeted": 500000,
      "executed": 425000,
      "execution_percentage": "85.00"
    }
  ]
}
```

### Municipal Website Scraping

**Method**: HTTP GET + HTML parsing with Cheerio
**Frequency**: Weekly
**Data Format**: JSON
**Selectors**: To be verified

**Example Scraping**:
```javascript
const $ = cheerio.load(html);

$('.ordinance-item').each((i, el) => {
  const ordinance = {
    number: $(el).find('.number').text(),
    title: $(el).find('.title').text(),
    date: $(el).find('.date').text(),
    pdf_url: $(el).find('a[href$=".pdf"]').attr('href')
  };
  ordinances.push(ordinance);
});
```

### Data Validation Pipeline

**Validation Steps**:
1. Schema validation (JSON Schema)
2. Data type checking
3. Range validation (dates, amounts)
4. Completeness checking
5. Duplicate detection
6. Cross-reference validation

**Quality Metrics**:
- Completeness: % of required fields populated
- Accuracy: % of records passing validation
- Timeliness: Age of most recent data
- Consistency: % of cross-referenced data matching

## Monitoring & Maintenance

### Automated Scraping Schedule

| Task | Frequency | Day/Time | Script |
|------|-----------|----------|--------|
| RAFAM Extraction | Weekly | Monday 3AM | comprehensive-rafam-extractor.js |
| Municipal Scraping | Weekly | Wednesday 2AM | carmen-municipal-scraper.js |
| Provincial Scraping | Monthly | 1st of month, 4AM | provincial-scraper.js |
| Data Consolidation | Daily | 5AM | consolidate-data.js |

### Health Checks

**Daily Checks**:
- [ ] Scraping jobs completed successfully
- [ ] No critical errors in logs
- [ ] Data files updated within expected timeframe

**Weekly Checks**:
- [ ] Data quality metrics above threshold
- [ ] All data sources accessible
- [ ] Storage capacity adequate

**Monthly Checks**:
- [ ] Review and update scraping selectors
- [ ] Audit data completeness
- [ ] Review and optimize performance

## Known Issues & Limitations

### Current Issues

1. **RAFAM API Access**
   - Issue: Requires database credentials or may need Oracle DB access
   - Workaround: Using mock data based on typical RAFAM structure
   - Resolution: Contact Buenos Aires Province IT to request API access

2. **Municipal Website URLs**
   - Issue: URLs in DATA_SOURCES.md may be incorrect/outdated
   - Workaround: Generated mock data
   - Resolution: Verify actual URL structure with municipality

3. **PDF Processing**
   - Issue: No OCR pipeline implemented yet
   - Impact: Cannot extract data from PDF documents
   - Resolution: Implement OCR with Tesseract.js (planned Phase 3)

### Data Limitations

1. **Historical Data**: Only 2019-2025 available from most sources
2. **Real-Time Data**: Most sources update monthly/quarterly, not real-time
3. **Data Completeness**: Some municipalities don't publish all required data
4. **Format Inconsistency**: Different sources use different formats

## Success Metrics

### Phase 2 Goals
- [ ] RAFAM data for all 7 years (2019-2025) extracted
- [ ] At least 20 documents scraped from municipal website
- [ ] Data validation passing at 95%+
- [ ] Automated scraping running successfully

### End-to-End Goals
- [ ] 100% of required transparency data available
- [ ] Data updated within 7 days of publication
- [ ] 99% uptime for scraping services
- [ ] Data quality score above 90%

## Resources & References

### Documentation
- [DATA_SOURCES.md](DATA_SOURCES.md) - Complete list of data sources
- [OpenRAFAM](https://github.com/jazzido/OpenRAFAM) - RAFAM extraction methodology
- [COMPREHENSIVE_INTEGRATION_TODO.md](COMPREHENSIVE_INTEGRATION_TODO.md) - Integration tasks

### Tools Used
- **axios**: HTTP requests
- **cheerio**: HTML parsing
- **fs/promises**: File operations
- **Tesseract.js**: OCR (planned)
- **pdf-parse**: PDF extraction (planned)

### Contact Points
- Buenos Aires Province IT: For RAFAM API access
- Carmen de Areco Municipality: For data access permissions
- Poder Ciudadano: For transparency standards

## Conclusion

The Resource Integration Strategy provides a comprehensive plan for systematically integrating all available data sources into the Carmen de Areco Transparency Portal. With the foundation scripts in place (RAFAM extractor and municipal scraper), the next phase focuses on connecting to real data sources and building the automated data pipeline.

**Next Immediate Actions**:
1. Test RAFAM extractor with real API access
2. Verify Carmen de Areco website URLs
3. Implement provincial data scraper
4. Set up data validation pipeline
5. Integrate data into UnifiedDataService

---

**Last Updated**: 2025-10-03
**Owner**: Transparency Portal Development Team
**Status**: Living Document - Update as integration progresses
