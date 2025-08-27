# Carmen de Areco Transparency Portal - Scripts

This directory contains all Python scripts organized by function for the transparency portal.

## Directory Structure

### 📊 Data Processing (`data-processing/`)
- **`api.py`** - Main API data processing script
- **`comprehensive_data_api.py`** - Comprehensive data API with multi-source integration
- **`extract_declarations.py`** - ETL script for property declarations
- **`extract_municipal_debt.py`** - ETL script for municipal debt data
- **`extract_salaries.py`** - ETL script for salary data

### 🗄️ Database (`database/`)
- **`prepare_production_deployment.py`** - Production deployment preparation script

### 🌐 Web Scraping (`scraping/`)
- **`live_scrape.py`** - Live data scraper for official Carmen de Areco transparency site
  - Downloads PDFs, Excel files, and documents
  - Handles document indexing and metadata extraction
  - **IMPORTANT**: This script was working and took significant time to develop

### ✅ Verification & Testing (`verification/`)
- **`accurate_data_verification.py`** - Verifies actual working API endpoints
- **`comprehensive_charts_verification.py`** - Tests chart and visualization functionality
- **`data_sources_verification.py`** - Multi-source data integration testing
- **`final_verification.py`** - Final system verification
- **`page_by_page_verification.py`** - Page-by-page data completeness testing
- **`test_integration.py`** - Integration testing script
- **`verify_data_completeness.py`** - Data completeness verification

## Key Scripts

### Live Scraper (`live_scrape.py`)
This is a critical script that performs live scraping of the official transparency site:
- URL: https://carmendeareco.gob.ar/transparencia/
- Downloads and indexes all transparency documents
- Handles PDF and Excel file processing
- **Status**: Working and validated

### Data Verification Scripts
Multiple verification scripts ensure system integrity:
- All API endpoints operational (6/6 working)
- Multi-year data coverage (2009-2025)
- Multi-source integration verified
- 343+ records confirmed across all data types

## Usage

All scripts are designed to work with the existing database and API infrastructure:
- PostgreSQL database: `transparency_portal_db`
- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:5174`

## Environment Requirements

Scripts require:
- Python 3.8+
- PostgreSQL connection
- Required packages: `requests`, `beautifulsoup4`, `pandas`, `psycopg2`