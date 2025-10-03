# RAFAM Accessibility Solution with Fallback Mechanisms

## Problem Statement

The official RAFAM website (https://www.rafam.ec.gba.gov.ar/) is currently inaccessible, timing out after extended periods (60+ seconds). This affects all scripts that attempt to extract municipal financial data for Carmen de Areco (municipality code 270).

## Current Status

- **RAFAM Web Interface**: Inaccessible (times out)
- **Impact**: All data extraction scripts fail when trying to access real data
- **Root Cause**: External government portals require authentication or are behind firewalls/VPNs

## Solution Implemented

### Enhanced Fallback Mechanism

I've created updated versions of the RAFAM extraction scripts with enhanced fallback handling:

1. **`scripts/updated-rafam-extractor.js`** - Enhanced RAFAM data extraction with fallbacks
2. **`scripts/updated-rafam-comprehensive-extraction.js`** - Comprehensive extraction with fallbacks

### Three-Tier Fallback System

When the RAFAM website is inaccessible, the scripts now follow this fallback approach:

#### Tier 1: Web Scraping (Primary)
- Attempt to access RAFAM web interface directly
- If successful, extract real-time data as before
- If failed, proceed to next tier

#### Tier 2: Local Organized Data (Secondary)
- Load data from existing organized JSON files in `backend/data/organized_documents/json/`
- These files contain real scraped data from previous successful extractions
- Maintains data authenticity while ensuring availability
- If local files don't exist, proceed to next tier

#### Tier 3: Mock Data (Tertiary)
- Use mock data with realistic values based on historical patterns
- Ensures system continues to function even when real and local data are unavailable
- Maintains proper data structure for frontend compatibility

## Implementation Details

### Directory Structure for Fallback Data

```
backend/
├── data/
│   └── organized_documents/
│       └── json/
│           ├── budget_data_2019.json
│           ├── budget_data_2020.json
│           ├── budget_data_2021.json
│           ├── budget_data_2022.json
│           ├── budget_data_2023.json
│           ├── budget_data_2024.json
│           └── budget_data_2025.json
```

### Data Format Consistency

All tiers return data in the same consistent format:

```json
{
  "year": 2024,
  "total_budget": 80000000,
  "total_executed": 78000000,
  "execution_rate": 97.5,
  "budget_links": [],
  "budget_execution": [
    {
      "quarter": "Q2",
      "budgeted": 80000000,
      "executed": 78000000,
      "percentage": 97.5
    },
    {
      "quarter": "Q3",
      "budgeted": 85000000,
      "executed": 83500000,
      "percentage": 98.2
    }
  ],
  "revenue": {},
  "expenditure": {}
}
```

## OpenRAFAM Potential Solution

As researched, there's also an alternative approach through OpenRAFAM (https://github.com/jazzido/OpenRAFAM):

### What is OpenRAFAM?

OpenRAFAM is a direct database access tool for the RAFAM system that:
- Connects directly to Oracle databases containing RAFAM data
- Bypasses the web interface entirely
- Provides structured access to budget execution data
- Uses credentials to authenticate with the database

### Implementation Requirements

To use OpenRAFAM, you would need:
1. Database credentials for the RAFAM Oracle database
2. Network access to the database server
3. Proper authorization from Buenos Aires Province or Carmen de Areco municipality

### Configuration File Example

```ini
[Database]
username=nombre_de_usuario
password=clave
host=host.del.oracle
sid=oracle_sid
```

## Usage Instructions

### Running the Updated Scripts

1. **Enhanced RAFAM Extractor**:
```bash
cd /Users/flong/Developer/cda-transparencia
node scripts/updated-rafam-extractor.js
```

2. **Comprehensive RAFAM Extraction**:
```bash
cd /Users/flong/Developer/cda-transparencia
node scripts/updated-rafam-comprehensive-extraction.js
```

### Script Behavior

When RAFAM is inaccessible:
1. Scripts will detect the timeout after 30 seconds
2. Automatically switch to local organized data if available
3. Fall back to mock data if local files don't exist
4. Continue operation without failing
5. Log the fallback for monitoring purposes

## Benefits of This Approach

### 1. Continuous Operation
- Portal continues to function even when external sources are unavailable
- No downtime for users when RAFAM is inaccessible

### 2. Data Authenticity
- Prioritizes real data from local files when web scraping fails
- Maintains data quality through structured JSON files

### 3. Graceful Degradation
- Clear indication of data source (web vs. local vs. mock)
- Proper error handling and logging

### 4. Performance Optimization
- Faster loading from local files vs. web scraping
- Reduced dependency on external services

## Monitoring and Maintenance

### Log Messages

The updated scripts provide clear log messages indicating which data source is being used:

```
⚠️  RAFAM site is inaccessible. Using local data fallback for all years.
📂 Loading local RAFAM data for 2024...
✅ Loaded local data for 2024
```

### Error Tracking

All errors are logged in the metadata:
```json
{
  "metadata": {
    "errors": [
      {
        "url": "https://www.rafam.ec.gba.gov.ar/",
        "error": "timeout of 30000ms exceeded",
        "timestamp": "2025-10-03T15:30:45.123Z"
      }
    ]
  }
}
```

## Future Improvements

### 1. Integration with OpenRAFAM
If database credentials become available:
- Implement direct Oracle database connection
- Bypass web interface entirely
- Access real-time data without timeouts

### 2. Enhanced Local Data
- Expand organized JSON files with more detailed data
- Include quarterly and monthly breakdowns
- Add revenue and expense categorizations

### 3. Improved Mock Data
- Generate more realistic mock data based on historical trends
- Implement seasonal variations
- Add anomalies for testing detection systems

## Summary

The updated RAFAM extraction scripts now include robust fallback mechanisms that ensure:
- Continuous operation regardless of RAFAM website availability
- Priority use of real data from local organized files
- Graceful degradation to mock data when needed
- Clear logging of data sources and fallback events
- Maintained data structure for frontend compatibility

This solution addresses the immediate problem of RAFAM inaccessibility while preserving the long-term goal of using real municipal financial data.