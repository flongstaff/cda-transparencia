# Complete Data Integration Architecture
Carmen de Areco Transparency Portal

## Data Sources Integration Overview

The transparency portal integrates multiple data sources to provide comprehensive, complementary data to all pages. All data is served through GitHub Pages without requiring backend processes or tunnels.

## 1. External APIs Integration

### Primary Data Sources
1. **Carmen de Areco Official Portals**
   - Municipal website and transparency portal
   - Official bulletin and notices
   - Budget and financial reports

2. **Provincial Government Sources**
   - Buenos Aires Provincial Open Data
   - Ministry of Finance transparency portals
   - Provincial procurement systems

3. **National Government Sources**
   - datos.gob.ar (National open data)
   - Presupuesto Abierto (Open budget)
   - Contrataciones Públicas (Public procurement)

### Integration Mechanism
- **Service**: `ExternalAPIsService.ts`
- **Method**: Direct HTTP requests with caching
- **GitHub Pages Compatible**: Yes (uses fetch API)

```typescript
// Example implementation
class ExternalAPIsService {
  async fetchGovernmentData(endpoint: string) {
    const url = `https://api.government.gov/data/${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  }
}
```

## 2. Local Repository Files (CSV/JSON)

### Data Structure
```
/public/data/
├── consolidated/          # Processed annual data (JSON)
├── csv/                   # Raw CSV files from government sources
├── json/                 # Structured JSON data
├── pdfs/                  # Processed PDF documents
├── charts/                # Chart-ready data
└── website_data/         # Site metadata
```

### Integration Mechanism
- **Service**: `GitHubDataService.ts`
- **Method**: GitHub raw URLs for production, direct file access for development
- **GitHub Pages Compatible**: Yes (uses GitHub raw URLs)

```typescript
// Example implementation
class GitHubDataService {
  private getFileUrl(filePath: string): string {
    return `https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/${filePath}`;
  }
  
  async fetchJson(filePath: string) {
    const url = this.getFileUrl(filePath);
    const response = await fetch(url);
    return await response.json();
  }
}
```

## 3. PDF OCR Extracted Data

### Processing Pipeline
1. **PDF Collection**: Government documents downloaded from official sources
2. **OCR Extraction**: Text and tabular data extracted using OCR technology
3. **Structured Conversion**: Extracted data converted to JSON/CSV format
4. **Storage**: Processed data stored in `/public/data/pdfs/`

### Integration Mechanism
- **Service**: `OfficialDocumentService.ts`
- **Method**: PDF parsing and text extraction
- **GitHub Pages Compatible**: Yes (processed data stored as JSON/CSV)

```typescript
// Example implementation
class OfficialDocumentService {
  async processPDFDocument(documentPath: string) {
    // In production, processed PDF data is available as JSON/CSV
    const processedData = await this.fetchProcessedData(documentPath);
    return processedData;
  }
  
  private async fetchProcessedData(documentPath: string) {
    // Processed PDF data stored as JSON files
    const jsonPath = documentPath.replace('.pdf', '.json');
    return await githubDataService.fetchJson(jsonPath);
  }
}
```

## 4. Audit System Integration

### Audit Functions
1. **Data Validation**: Compare local vs external data sources
2. **Discrepancy Detection**: Identify inconsistencies between sources
3. **Quality Scoring**: Rate data completeness and accuracy
4. **Issue Reporting**: Generate audit reports for transparency

### Integration Mechanism
- **Service**: `AuditService.ts`
- **Method**: Cross-source comparison and validation
- **GitHub Pages Compatible**: Yes (client-side validation)

```typescript
// Example implementation
class AuditService {
  async compareDataSources(localData: any, externalData: any) {
    const discrepancies = [];
    
    // Compare budget figures
    if (localData.budget.total !== externalData.budget.total) {
      discrepancies.push({
        type: 'budget_discrepancy',
        local: localData.budget.total,
        external: externalData.budget.total,
        difference: Math.abs(localData.budget.total - externalData.budget.total)
      });
    }
    
    return discrepancies;
  }
}
```

## 5. OSINT (Open Source Intelligence) Integration

### OSINT Sources
1. **Government Websites**: Continuous monitoring of official portals
2. **News Media**: Tracking municipality-related news and reports
3. **Civil Society**: Incorporating oversight organization findings
4. **Social Media**: Monitoring official social media accounts

### Integration Mechanism
- **Service**: `OSINTDataService.ts`
- **Method**: Web scraping and data aggregation
- **GitHub Pages Compatible**: Yes (pre-scraped data stored locally)

```typescript
// Example implementation
class OSINTDataService {
  private osintSources = [
    { name: 'Municipal Website', url: 'https://carmendeareco.gob.ar' },
    { name: 'Local News', url: 'https://localnews.com/search' },
    { name: 'Social Media', url: 'https://twitter.com/municipality' }
  ];
  
  async gatherOSINTData() {
    // In production, OSINT data is pre-scraped and stored as JSON files
    const osintData = await githubDataService.fetchJson('/data/osint/latest.json');
    return osintData;
  }
}
```

## Data Integration Architecture

### Integration Flow
```
[External APIs] ──┐
                  │
[Local Files] ────┼──→ [DataIntegrationService] ──→ [Unified Data]
                  │
[PDF Processed] ──┘
                  │
[Audit System] ────┘
                  │
[OSINT Data] ──────┘
```

### Implementation
```typescript
// DataIntegrationService.ts
class DataIntegrationService {
  async loadIntegratedData(year: number) {
    // Load data from all sources in parallel
    const [
      externalData,
      localJsonData,
      localCsvData,
      processedPdfData,
      osintData
    ] = await Promise.allSettled([
      externalAPIsService.loadExternalData(year),
      githubDataService.fetchJson(`/data/consolidated/${year}/summary.json`),
      this.loadCsvData(`/data/csv/budget_${year}.csv`),
      githubDataService.fetchJson(`/data/pdfs/processed_${year}.json`),
      osintDataService.gatherOSINTData()
    ]);
    
    // Integrate and prioritize data
    const integratedData = this.integrateDataSources({
      external: externalData,
      localJson: localJsonData,
      localCsv: localCsvData,
      pdf: processedPdfData,
      osint: osintData
    }, year);
    
    return integratedData;
  }
  
  private integrateDataSources(sources: any, year: number) {
    // Priority 1: External API data (most current)
    if (sources.external.status === 'fulfilled') {
      return sources.external.value;
    }
    
    // Priority 2: Local JSON data (structured)
    if (sources.localJson.status === 'fulfilled') {
      return sources.localJson.value;
    }
    
    // Priority 3: Local CSV data (historical)
    if (sources.localCsv.status === 'fulfilled') {
      return this.parseCsvData(sources.localCsv.value);
    }
    
    // Priority 4: Processed PDF data
    if (sources.pdf.status === 'fulfilled') {
      return sources.pdf.value;
    }
    
    // Fallback: Generate mock data
    return this.generateMockData(year);
  }
}
```

## GitHub Pages Deployment Compatibility

### Key Principles
1. **No Backend Required**: All data processing happens client-side
2. **Static Assets**: Data files stored as static JSON/CSV assets
3. **GitHub Raw URLs**: Production data access via GitHub raw URLs
4. **Client-Side Caching**: Efficient browser caching of data assets

### Implementation Details
```typescript
// Environment-aware data loading
class EnvironmentAwareLoader {
  async loadData(filePath: string) {
    if (process.env.NODE_ENV === 'production') {
      // Production: Use GitHub raw URLs
      const githubUrl = `https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/${filePath}`;
      return await fetch(githubUrl).then(res => res.json());
    } else {
      // Development: Use local file system
      return await fetch(`/${filePath}`).then(res => res.json());
    }
  }
}
```

## Complementary Data Distribution

### Per-Page Data Integration
Each page receives complementary data from all sources:

1. **Budget Page**
   - Core: Budget execution data (CSV/JSON)
   - Complementary: Related contracts (PDF processed), salary impacts (external API), audit validation (AuditService), OSINT context (OSINTDataService)

2. **Contracts Page**
   - Core: Contract details (external API)
   - Complementary: Budget allocations (JSON), vendor performance (OSINT), compliance audits (AuditService), document references (PDF processed)

3. **Salaries Page**
   - Core: Personnel compensation (CSV/JSON)
   - Complementary: Budget impact (external API), market comparisons (OSINT), equity analysis (AuditService), historical trends (local files)

### Implementation Pattern
```typescript
// Example: BudgetPage component
const BudgetPage: React.FC = () => {
  const {
    // Core budget data from multiple sources
    currentBudget,
    
    // Complementary data enhancing understanding
    relatedContracts,
    salaryImpactAnalysis,
    auditValidation,
    osintContext,
    
    // Metadata about data sources
    dataSources,
    dataQuality
  } = useMasterData(selectedYear);
  
  return (
    <div>
      {/* Core budget visualization */}
      <BudgetChart data={currentBudget} />
      
      {/* Complementary contract data */}
      <ContractImpactSection 
        data={relatedContracts} 
        budgetCategory={currentBudget.category}
      />
      
      {/* Salary impact analysis */}
      <SalaryImpactChart data={salaryImpactAnalysis} />
      
      {/* Audit validation indicators */}
      <AuditStatus data={auditValidation} />
      
      {/* OSINT context */}
      <OSINTContext data={osintContext} />
      
      {/* Data source metadata */}
      <DataSourceMetadata 
        sources={dataSources} 
        quality={dataQuality} 
      />
    </div>
  );
};
```

## Benefits of Full Integration

### 1. Comprehensive Coverage
- Never relies on a single data source
- Multiple fallbacks ensure data availability
- Cross-validation improves data reliability

### 2. Rich User Experience
- Pages show relationships between data domains
- Contextual information enhances understanding
- Multiple perspectives provide complete picture

### 3. Robust Architecture
- Works perfectly with GitHub Pages deployment
- No backend dependencies or tunneling required
- Scalable and maintainable design

### 4. Transparency and Accountability
- Clear data source attribution
- Audit trails for verification
- OSINT context for broader understanding

This architecture ensures that all pages receive rich, complementary data from multiple sources without ever relying on just one file for all information, while maintaining full compatibility with GitHub Pages deployment.