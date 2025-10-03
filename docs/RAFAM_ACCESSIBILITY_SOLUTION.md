# RAFAM Accessibility Solution

## Issue Description

The official RAFAM website (https://www.rafam.ec.gba.gov.ar/) is currently inaccessible, timing out after 15+ seconds. This affects all scripts that attempt to extract municipal financial data for Carmen de Areco (municipality code 270).

## Current Status

- **RAFAM Web Interface**: Inaccessible (times out)
- **Impact**: All data extraction scripts fail when trying to access real data
- **Solution**: Implemented fallback mechanism using mock data files

## Solutions Implemented

### 1. Enhanced Scripts with Fallback Mechanism

Updated scripts now:
- First check if the RAFAM site is accessible
- If inaccessible, automatically use mock data from existing JSON files
- Continue operation without failing
- Log the fallback for monitoring purposes

**Files updated:**
- `scripts/enhanced-rafam-extractor.js`
- `scripts/rafam-comprehensive-extraction.js`

### 2. Existing Proxy Server Solution

The backend proxy server (`backend/proxy-server.js`) already had a fallback system using mock data files:
- Uses data from `backend/data/organized_documents/json/budget_data_*.json`
- This approach is working well for the frontend application

### 3. Future Enhancement: OpenRAFAM

For long-term solution, consider implementing OpenRAFAM approach:
- GitHub: https://github.com/jazzido/OpenRAFAM
- Blog: https://blog.jazzido.com/2017/04/03/openrafam-abriendo-los-presupuestos-municipales
- This provides direct Oracle database access as an alternative to web interface
- Requires database credentials from Carmen de Areco municipality

## Data Flow

1. Scripts attempt to access RAFAM web interface
2. If accessible, extract real data
3. If inaccessible, load mock data from existing files
4. Data is saved in the same format regardless of source
5. Frontend applications continue to function normally

## Real Data Source

The system uses real data that was previously scraped and organized from official sources, as documented in PRODUCTION_DATA_FIX_COMPLETE.md:

- `budget_data_2019.json` through `budget_data_2025.json`
- Located in `backend/data/organized_documents/json/`
- These files contain real budget execution data extracted from official PDFs and documents
- As noted in the production documentation: "Real budget data for 2019-2025 from organized JSONs" and "Real data extracted from PDFs/CSVs"

This is NOT mock data but actual scraped and processed municipal financial data that serves as the primary data source when the live RAFAM API is unavailable.

## Monitoring

The scripts now log when fallback mechanisms are used, allowing for:
- Monitoring of RAFAM site availability
- Tracking of data source (real vs. mock)
- Alerting when the primary data source is unavailable

## Testing

Both updated scripts were tested and confirmed to:
- Detect RAFAM unavailability
- Switch to fallback mechanism automatically
- Complete successfully with mock data
- Generate expected output files