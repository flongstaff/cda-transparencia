# Carmen de Areco Live Project - Cleanup Plan

## 🎯 Live Project Requirements

For the live transparency portal, we need only the following components:

### ✅ Keep - Essential Live Components

#### 1. Live Data System (`src/`)
- `src/live_scrape.py` - Live portal scraper
- `src/archived_scrape.py` - Wayback Machine scraper  
- `src/api.py` - REST API server
- `src/cli.py` - Command line interface
- `src/run_scraper.py` - Test runner
- `src/__init__.py` - Module init

#### 2. Frontend Application (`frontend/`)
- Complete React/TypeScript frontend
- Keep all - needed for live dashboard

#### 3. Backend API (`backend/`)
- Node.js/Express backend
- PostgreSQL database integration
- Keep all - provides data API

#### 4. Static Site (`static-site/`)
- `index.html` - Standalone transparency dashboard
- Keep for offline fallback

#### 5. Essential Data (`data/`)
- `data/markdown_documents/` - Converted documents (17 files)
- `data/preserved/json/` - Backup data (12 files)
- `data/cleanup_report.json` - Cleanup status
- Archive directory stays for backup

#### 6. Configuration Files (Root)
- `requirements.txt` - Python dependencies
- `README.md` - Main documentation
- `LIVE_SCRAPING_README.md` - Live system docs
- `pyproject.toml` - Python project config
- Docker/deployment files

### ❌ Remove - Legacy/Archive Components

#### 1. Scripts Archive (`scripts_archive/`)
**Remove entire directory** - These are legacy processing scripts no longer needed:
- 50+ old processing scripts
- Legacy data extraction tools
- Outdated scrapers and processors
- Development/testing utilities

#### 2. Old Scripts (`scripts/`)  
**Remove most files** - Keep only:
- `scripts/final_cleanup.py` (for reference)
- Remove all others (deployment, processing, verification scripts)

#### 3. Legacy Data Processing
- `data/processed/` - Old processed files (can be removed)
- `data/analysis/` - Analysis files (can be removed)
- `data/integration_reports/` - Old integration reports (can be removed)
- `data/db` - SQLite database (can be removed, using PostgreSQL)
- `data/documents.db` - SQLite file (can be removed)

#### 4. Development/Testing Files
- `transparency_orchestrator.log` - Log files
- `scraper.log` - Log files
- `setup.py` - Old setup (using pyproject.toml)
- `transparency_portal/` - Duplicate/old project structure

#### 5. Documentation Cleanup
- `docs/` - Keep main files, remove redundant ones
- Keep: `README.md`, `DATA_SOURCES.md`
- Remove: `TODO.md`, `PROJECT_STATUS.md`, etc.

## 🧹 Cleanup Actions

### Phase 1: Remove Archive Scripts
```bash
rm -rf scripts_archive/
rm -rf scripts/ (except final_cleanup.py)
```

### Phase 2: Clean Data Directory  
```bash
rm -rf data/processed/
rm -rf data/analysis/
rm -rf data/integration_reports/
rm -f data/documents.db
rm -rf data/db/
```

### Phase 3: Remove Legacy Files
```bash
rm -f transparency_orchestrator.log
rm -f scraper.log  
rm -f setup.py
rm -rf transparency_portal/
```

### Phase 4: Documentation Cleanup
```bash
rm -f docs/TODO.md
rm -f docs/PROJECT_STATUS.md
rm -f docs/FINAL_VERIFICATION_REPORT.md
rm -f docs/CONSOLIDATED_DOCUMENTATION.md
```

## 📊 Before/After Comparison

### Before Cleanup:
- 50+ legacy Python scripts
- Multiple data processing pipelines
- Redundant documentation
- Old SQLite databases
- Development logs and temporary files

### After Cleanup:
- 6 essential Python files in `src/`
- Live scraping system only
- Clean data structure
- Production-ready configuration
- Essential documentation only

## 🎯 Final Structure

```
cda-transparencia/
├── src/                    # Live data system
│   ├── live_scrape.py
│   ├── archived_scrape.py  
│   ├── api.py
│   ├── cli.py
│   ├── run_scraper.py
│   └── __init__.py
├── frontend/               # React dashboard
├── backend/                # Node.js API
├── static-site/            # Standalone HTML
├── data/
│   ├── markdown_documents/ # Converted docs (17)
│   ├── preserved/json/     # Backup data (12)
│   └── cleanup_report.json
├── archive_materials/      # Original files backup
├── docs/                   # Essential docs only
│   ├── README.md
│   └── DATA_SOURCES.md
├── requirements.txt
├── pyproject.toml
├── README.md
└── LIVE_SCRAPING_README.md
```

This cleanup will reduce the project size by ~80% while keeping all functionality needed for the live transparency portal.