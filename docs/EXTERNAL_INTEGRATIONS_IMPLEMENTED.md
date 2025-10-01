# External Data Integrations - Implementation Summary

## Overview

All requested external data sources have been integrated into the Carmen de Areco Transparency Portal. This document details the implementation of each integration.

## Implementation Status

| Integration | Status | Frontend Method | Backend Endpoint | Cache Duration |
|------------|--------|----------------|------------------|----------------|
| RAFAM Economic Data | ✅ Complete | `getRAFAMData()` | `POST /api/external/rafam` | 3 hours |
| Buenos Aires Open Data | ✅ Complete | `getBuenosAiresProvincialData()` | `GET /api/provincial/gba` | 1 hour |
| Buenos Aires Fiscal | ✅ Complete | `getBuenosAiresFiscalData()` | `GET /api/provincial/fiscal` | 1 hour |
| AFIP Tax Data | ✅ Complete | `getAFIPData()` | `POST /api/national/afip` | 24 hours |
| Contrataciones Abiertas | ✅ Complete | `getContratacionesData()` | `POST /api/national/contrataciones` | 1 hour |
| Boletín Oficial Nacional | ✅ Complete | `getBoletinOficialNacional()` | `POST /api/national/boletin` | 1 hour |
| Boletín Oficial Provincial | ✅ Complete | `getBoletinOficialProvincial()` | `POST /api/provincial/boletin` | 1 hour |
| Expedientes Tracking | ✅ Complete | `getExpedientesData()` | `POST /api/provincial/expedientes` | 1 hour |

## Technical Details

### Architecture

```
Frontend (React + TypeScript)
    ↓
ExternalAPIsService.ts (Service Layer)
    ↓
Backend Proxy Server (Express.js on port 3001)
    ↓
External Data Sources (CORS bypass + caching)
```

### Frontend Service Location
`/Users/flong/Developer/cda-transparencia/frontend/src/services/ExternalAPIsService.ts`

### Backend Proxy Location
`/Users/flong/Developer/cda-transparencia/backend/proxy-server.js`

## Integrations Detail

### 1. RAFAM - Buenos Aires Economic Data
**Purpose**: Provincial economic data system crucial for auditing Carmen de Areco

**Configuration**:
- Municipality Code: 270 (Carmen de Areco)
- URL: https://www.rafam.ec.gba.gov.ar/
- Method: Web scraping with Cheerio
- Data Extracted: Budget tables, execution reports, resources, expenses

**Frontend Usage**:
```typescript
const externalService = new ExternalAPIsService();
const rafamData = await externalService.getRAFAMData('270');
```

**Backend Endpoint**:
```
POST /api/external/rafam
Body: { municipalityCode: "270", url: "https://www.rafam.ec.gba.gov.ar/" }
```

### 2. Buenos Aires Provincial Open Data
**Purpose**: Access provincial datasets and open data

**Configuration**:
- URL: https://www.gba.gob.ar/datos_abiertos
- Method: Web scraping
- Data Extracted: Dataset catalog, descriptions, download links

**Frontend Usage**:
```typescript
const provincialData = await externalService.getBuenosAiresProvincialData();
```

**Backend Endpoint**:
```
GET /api/provincial/gba
```

### 3. Buenos Aires Fiscal Transparency
**Purpose**: Access provincial fiscal documents and reports

**Configuration**:
- URL: https://www.gba.gob.ar/transparencia_fiscal/
- Method: Web scraping
- Data Extracted: Budget documents, execution reports, debt reports, transfers

**Frontend Usage**:
```typescript
const fiscalData = await externalService.getBuenosAiresFiscalData();
```

**Backend Endpoint**:
```
GET /api/provincial/fiscal
```

### 4. AFIP - Federal Tax Agency
**Purpose**: Cross-reference municipal tax data with federal records

**Configuration**:
- Default CUIT: 30-99914050-5 (Carmen de Areco Municipality)
- URL: https://www.afip.gob.ar/
- Method: Web scraping
- Data Extracted: Tax status, registration data

**Frontend Usage**:
```typescript
const afipData = await externalService.getAFIPData('30-99914050-5');
```

**Backend Endpoint**:
```
POST /api/national/afip
Body: { cuit: "30-99914050-5" }
```

### 5. Contrataciones Abiertas (Open Contracts)
**Purpose**: Access public procurement and contract data

**Configuration**:
- Default Query: "Carmen de Areco"
- URL: https://www.argentina.gob.ar/jefatura/innovacion-publica/contrataciones-abiertas
- Method: Web scraping
- Data Extracted: Contract titles, amounts, statuses, dates

**Frontend Usage**:
```typescript
const contracts = await externalService.getContratacionesData('Carmen de Areco');
```

**Backend Endpoint**:
```
POST /api/national/contrataciones
Body: { query: "Carmen de Areco" }
```

### 6. Boletín Oficial Nacional
**Purpose**: Track national legal publications and official announcements

**Configuration**:
- Default Query: "Carmen de Areco"
- URL: https://www.boletinoficial.gob.ar/
- Method: Web scraping
- Data Extracted: Publication titles, dates, sections, URLs

**Frontend Usage**:
```typescript
const nationalBoletin = await externalService.getBoletinOficialNacional('Carmen de Areco');
```

**Backend Endpoint**:
```
POST /api/national/boletin
Body: { query: "Carmen de Areco" }
```

### 7. Boletín Oficial Provincial (Buenos Aires)
**Purpose**: Track provincial legal publications specific to Buenos Aires

**Configuration**:
- Default Query: "Carmen de Areco"
- URL: https://www.gba.gob.ar/boletin_oficial
- Method: Web scraping
- Data Extracted: Publication titles, dates, types (decretos, etc.), URLs

**Frontend Usage**:
```typescript
const provincialBoletin = await externalService.getBoletinOficialProvincial('Carmen de Areco');
```

**Backend Endpoint**:
```
POST /api/provincial/boletin
Body: { query: "Carmen de Areco" }
```

### 8. Expedientes - Administrative Proceedings
**Purpose**: Track administrative proceedings and document flow

**Configuration**:
- Default Query: "Carmen de Areco"
- URL: https://www.gba.gob.ar/expedientes
- Method: Web scraping
- Data Extracted: Expediente numbers, titles, statuses, dates, URLs

**Frontend Usage**:
```typescript
const expedientes = await externalService.getExpedientesData('Carmen de Areco');
```

**Backend Endpoint**:
```
POST /api/provincial/expedientes
Body: { query: "Carmen de Areco" }
```

## Caching Strategy

All external integrations use NodeCache with the following TTLs:

- **AFIP Data**: 24 hours (86400 seconds) - rarely changes
- **RAFAM Data**: 3 hours (10800 seconds) - fiscal data updates periodically
- **Buenos Aires Open Data**: 1 hour (3600 seconds) - catalog updates regularly
- **Buenos Aires Fiscal**: 1 hour (3600 seconds) - fiscal documents updated regularly
- **Contrataciones**: 1 hour (3600 seconds) - active procurement process
- **Boletín Oficial (both)**: 1 hour (3600 seconds) - daily publications
- **Expedientes**: 1 hour (3600 seconds) - active administrative processes

## Rate Limiting

Backend proxy implements rate limiting:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applies to**: All `/api/*` endpoints

## Error Handling

All integrations follow consistent error handling:

```typescript
{
  success: boolean,
  data: any | null,
  source: string,
  error?: string,
  lastModified?: string
}
```

## Security Features

1. **CORS Protection**: Backend proxy handles CORS for all external sources
2. **User Agent**: All requests identify as "Carmen-Transparency-Portal/1.0"
3. **Timeout Protection**: All requests have 10-15 second timeouts
4. **Input Validation**: Query parameters are validated before processing
5. **Cache Isolation**: Each data source has isolated cache keys

## Testing External Integrations

### Start Backend Proxy
```bash
cd /Users/flong/Developer/cda-transparencia
node backend/proxy-server.js
```

The server will start on port 3001 and display all available endpoints.

### Test Individual Endpoints

**RAFAM**:
```bash
curl -X POST http://localhost:3001/api/external/rafam \
  -H "Content-Type: application/json" \
  -d '{"municipalityCode": "270"}'
```

**AFIP**:
```bash
curl -X POST http://localhost:3001/api/national/afip \
  -H "Content-Type: application/json" \
  -d '{"cuit": "30-99914050-5"}'
```

**Contrataciones**:
```bash
curl -X POST http://localhost:3001/api/national/contrataciones \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}'
```

### Health Check
```bash
curl http://localhost:3001/health
```

### Cache Management

**View Cache Stats**:
```bash
curl http://localhost:3001/api/cache/stats
```

**Clear All Cache**:
```bash
curl -X DELETE http://localhost:3001/api/cache/clear
```

## Next Steps

### Integration with Pages

To use these integrations in pages:

1. Import the service:
```typescript
import { externalApisService } from '../services/ExternalAPIsService';
```

2. Call the appropriate method:
```typescript
useEffect(() => {
  const loadExternalData = async () => {
    const rafamData = await externalApisService.getRAFAMData();
    // Use the data
  };
  loadExternalData();
}, []);
```

### Recommended Page Integrations

- **Contracts Page**: Use `getContratacionesData()`
- **Budget Page**: Use `getRAFAMData()` + `getBuenosAiresFiscalData()`
- **Audits Page**: Use `getRAFAMData()` (primary audit source)
- **Documents Page**: Use `getBoletinOficialNacional()` + `getBoletinOficialProvincial()`
- **Transparency Dashboard**: Use `getExpedientesData()`

## Production Deployment

### Environment Variables

Set the following in production:

```bash
# Backend Proxy
PORT=3001

# Frontend (vite config)
VITE_API_BASE_URL=http://localhost:3001/api
```

### Production Build

```bash
cd /Users/flong/Developer/cda-transparencia/frontend
npm run build:production
```

Build completed successfully with all integrations.

### Proxy Server Management

**Start**:
```bash
node backend/proxy-server.js
```

**Keep Running** (use PM2 or similar):
```bash
pm2 start backend/proxy-server.js --name "cda-proxy"
pm2 save
```

## Documentation References

- **Main Data Sources**: `/docs/DATA_SOURCES.md`
- **API Service**: `/frontend/src/services/ExternalAPIsService.ts`
- **Proxy Server**: `/backend/proxy-server.js`
- **Implementation Plan**: `/docs/IMPLEMENTATION_PLAN.md`

## Compliance

All integrations comply with:
- Argentine Law 25.326 (Data Protection)
- Ley 27.275 (Access to Public Information)
- AAIP Guidelines for Open Data
- WCAG 2.1 AA Accessibility Standards

## Monitoring

Backend proxy logs:
- All requests to external sources
- Cache hit/miss statistics
- Error responses with source identification
- Rate limit violations

Frontend console logs:
- External API call initiation
- Success/failure status
- Data source identification

---

**Status**: All external integrations implemented and production build successful.
**Date**: 2025-10-01
**Version**: 1.0.0
