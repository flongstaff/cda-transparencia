# Carmen de Areco Transparency Portal - Complete System Documentation

## Overview

This document provides a comprehensive overview of the Carmen de Areco Transparency Portal system, including all scripts, modules, and processes that ensure complete data coverage from 2017-2025.

## System Architecture

The system is organized into the following components:

### 1. Data Sources
- **Years Covered**: 2017-2025
- **Document Types**: PDF reports, Excel spreadsheets, legal documents
- **Categories**: Budget execution, salaries, public tenders, property declarations, financial reports

### 2. Processing Pipeline

```
Source Documents (PDF/Excel) 
    ↓
Data Extraction Scripts
    ↓
Structured Data Generation
    ↓
Database Loading
    ↓
Web Interface Visualization
```

### 3. Key Scripts and Modules

#### Data Extraction
- `extract_tender_data.py` - Extracts public tender information
- `extract_salaries.py` - Extracts salary data for visualization
- `final_extract_budget_data.py` - Extracts budget execution data from PDFs
- `extract_declarations.py` - Extracts property declaration data

#### Data Processing
- `data_preservation.py` - Preserves and catalogs all source documents
- `convert_data_to_markdown.py` - Converts documents to markdown for GitHub
- `populate_database_from_preserved.py` - Loads structured data into PostgreSQL

#### Web Interface
- Frontend (React/Vite) - Interactive dashboard with visualizations
- Backend (Node.js/Express) - API serving structured data
- Database (PostgreSQL) - Storage for structured data

## Data Coverage by Year

### Document Access (All Years)
✅ **2017-2025**: Complete document access through PDF viewer

### Structured Data with Visualizations
- **2022-2025**: ✅ Full structured data with charts and analytics
- **2017-2021**: 🔄 Enhanced with budget data extraction (in progress)

## Recent Enhancements

### 1. Year Consistency
- Updated all UI components to show years 2017-2025 consistently
- Improved error handling for years without structured data
- Added navigation to document viewer when structured data unavailable

### 2. Budget Data Extraction
- Created specialized parsers for budget execution documents
- Extracted financial data from PDF tables using precise pattern matching
- Loaded extracted data into database for visualization

### 3. Module Organization
- Created `transparency_portal/` package structure
- Organized scripts into logical modules:
  - `data_extraction/` - Data extraction scripts
  - `processing/` - Data processing and preservation
  - `scripts/` - Executable orchestrators and tools
- Added master orchestrator for end-to-end processing

## Usage Instructions

### Master Orchestrator
```bash
# Run complete end-to-end process
python transparency_portal/scripts/simple_orchestrator.py --mode full

# Run specific operations
python transparency_portal/scripts/simple_orchestrator.py --mode setup     # Environment setup
python transparency_portal/scripts/simple_orchestrator.py --mode extract   # Extract data
python transparency_portal/scripts/simple_orchestrator.py --mode process   # Process data
python transparency_portal/scripts/simple_orchestrator.py --mode load      # Load to database
python transparency_portal/scripts/simple_orchestrator.py --mode verify    # Verify data
```

### Web Interface
```bash
# Start backend API
cd backend && npm start

# Start frontend dashboard
cd frontend && npm run dev
```

## Data Verification

### Check Document Coverage
```bash
# Verify all years have documents
python -c "
import psycopg2
conn = psycopg2.connect(host='localhost', port=5432, database='transparency_portal', user='postgres', password='postgres')
cur = conn.cursor()
cur.execute('SELECT year, COUNT(*) FROM processed_documents GROUP BY year ORDER BY year')
for row in cur.fetchall():
    print(f'{row[0]}: {row[1]} documents')
cur.close()
conn.close()
"
```

### Check Structured Data
```bash
# Check financial reports by year
curl -s http://localhost:3000/api/reports | jq 'group_by(.year) | map({year: .[0].year, count: length})'
```

## Future Enhancements

### 1. Expanded Data Extraction
- [ ] Complete budget data extraction for all years 2017-2021
- [ ] Extract salary data from earlier years
- [ ] Parse tender documents for detailed project information

### 2. Advanced Visualization
- [ ] Time series analysis across all years
- [ ] Comparative dashboards (year-over-year)
- [ ] Document content search within PDFs

### 3. Enhanced User Experience
- [ ] Document viewer improvements (zoom, search, annotations)
- [ ] Mobile-responsive design
- [ ] Multi-language support

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Start PostgreSQL container
   docker start transparency_portal
   ```

2. **Missing Dependencies**
   ```bash
   # Install Python requirements
   pip install -r transparency_portal/requirements.txt
   
   # Install Node.js dependencies
   cd frontend && npm install
   cd backend && npm install
   ```

3. **No Data for Specific Year**
   - Check if structured data extraction is available for that year
   - Navigate to document viewer for raw document access
   - Run data extraction scripts for that year

## Contact

For questions or support:
- Portal: https://carmendeareco.gob.ar/transparencia/
- Technical Issues: transparency@carmendeareco.gob.ar