# Carmen de Areco Live Data Scraping System

Complete implementation of the live data scraping and comparison system for the Carmen de Areco transparency portal.

## 🚀 Features Implemented

### 1. Live Data Scraper (`src/live_scrape.py`)
- **Real-time document discovery** from official transparency portal
- **Multi-source scanning** with backup URL fallback
- **Intelligent document detection** (PDF, Excel, Word, CSV)
- **Progress tracking** with tqdm progress bars
- **Comprehensive reporting** with JSON outputs
- **Connection resilience** with retry logic

### 2. Archive Data Scraper (`src/archived_scrape.py`)
- **Wayback Machine integration** for historical snapshots
- **Multi-year snapshot analysis** with configurable date ranges
- **Duplicate detection** and version comparison
- **Archive availability checking** before attempting downloads
- **Historical trend analysis** across different time periods

### 3. Live API Server (`src/api.py`)
- **RESTful API endpoints** for real-time data access
- **Cross-origin support** (CORS enabled) for frontend integration
- **Multi-source comparison** endpoint
- **File serving** capabilities for downloaded documents
- **Health monitoring** and error handling
- **JSON report generation**

### 4. Command Line Interface (`src/cli.py`)
- **Click-based CLI** with intuitive commands
- **Source comparison** tools
- **Status reporting** for all data sources
- **Comprehensive reporting** in multiple formats
- **API server management** commands

### 5. Static Website (`static-site/index.html`)
- **Responsive dashboard** for transparency data
- **Real-time source selection** with checkboxes
- **Interactive statistics** display
- **Document browsing** with filtering
- **Comparison tools** for data validation
- **Offline fallback** when API unavailable

## 📦 Installation & Dependencies

```bash
# Install required dependencies
pip install requests beautifulsoup4 lxml tqdm flask flask-cors click

# Verify installation
python3 src/run_scraper.py
```

## 🎯 Quick Start

### Option 1: CLI Usage

```bash
# Fetch live data from official portal
python3 -c "
import sys; sys.path.append('src')
from cli import cli
cli(['live', '--output', 'data/live_scrape'])
"

# Fetch archived data from Wayback Machine  
python3 -c "
import sys; sys.path.append('src')  
from cli import cli
cli(['archived', '--years', '2023', '2024'])
"

# Compare sources
python3 -c "
import sys; sys.path.append('src')
from cli import cli  
cli(['compare'])
"

# Start API server
python3 -c "
import sys; sys.path.append('src')
from cli import cli
cli(['serve', '--host', '0.0.0.0', '--port', '5555'])
"
```

### Option 2: Direct Script Usage

```bash
# Live scraper
python3 src/live_scrape.py --output data/live_scrape --verbose

# Archive scraper  
python3 src/archived_scrape.py --output data/archived --years 2023 2024

# API server
python3 src/api.py --host 0.0.0.0 --port 5555 --debug
```

### Option 3: Static Website

```bash
# Open the static dashboard
open static-site/index.html

# Or serve with Python
cd static-site && python3 -m http.server 8000
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/data/live` | GET | Live portal data |
| `/data/archived?years=2023,2024` | GET | Historical archive data |
| `/data/compare` | GET | Source comparison |
| `/data/report` | GET | Comprehensive report |
| `/files/<filename>` | GET | Serve downloaded files |

## 📊 Data Flow Architecture

```
Official Portal → Live Scraper → Local Storage → API Server → Frontend
     ↓              ↓              ↓              ↓           ↓
Wayback Machine → Archive Scraper → JSON Reports → Database → Dashboard
```

## 🛡️ Security & Compliance

- **OSINT Compliant**: Only accesses publicly available information
- **Rate Limited**: Respectful crawling with delays
- **User Agent**: Properly identified scraper
- **Error Handling**: Graceful failure management
- **Data Integrity**: SHA-256 verification for downloaded files

## 📈 Monitoring & Reports

### Automatic Reports Generated:
- `data/live_scrape/scrape_report.json` - Live scraping statistics
- `data/archived_scrape/wayback_scrape_report.json` - Archive analysis
- `data/live_scrape/discovery_report.json` - Document discovery log
- `data/cleanup_report.json` - Repository cleanup status

### Key Metrics Tracked:
- Total documents discovered
- Download success rates
- Source comparison statistics
- Historical availability trends
- Processing performance

## 🔧 Configuration Options

### Environment Variables
```bash
export TRANSPARENCY_API_HOST="0.0.0.0"
export TRANSPARENCY_API_PORT="5555"
export SCRAPE_OUTPUT_DIR="data/live_scrape"
export ARCHIVE_OUTPUT_DIR="data/archived_scrape"
```

### Customization Points
- **Base URLs**: Modify `BASE_URL` and `BACKUP_URLS` in scrapers
- **Document Patterns**: Adjust `doc_pattern` regex for file types
- **Archive Years**: Configure target years for historical analysis
- **API Configuration**: CORS, timeout, and rate limiting settings

## 🚀 Deployment Options

### 1. Local Development
```bash
# Start API server
python3 src/api.py --debug

# Open dashboard  
open static-site/index.html
```

### 2. Production Server
```bash
# Using gunicorn
pip install gunicorn
cd src && gunicorn -w 4 -b 0.0.0.0:5555 api:app

# With nginx reverse proxy
# Configure nginx to proxy to localhost:5555
```

### 3. GitHub Pages + GitHub Actions
```yaml
# .github/workflows/scrape.yml
name: Live Data Scraping
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python3 src/live_scrape.py
      - run: git add data/
      - run: git commit -m "Update transparency data $(date)"
      - run: git push
```

## 📚 Integration Examples

### Frontend Integration
```javascript
// Fetch live data
fetch('http://localhost:5555/data/live')
  .then(response => response.json())
  .then(data => updateDashboard(data));

// Compare sources
fetch('http://localhost:5555/data/compare')
  .then(response => response.json())
  .then(comparison => showComparison(comparison));
```

### Python Integration
```python
from src.live_scrape import LiveScraper
from src.archived_scrape import ArchivedScraper

# Use in other scripts
scraper = LiveScraper('custom_output')
for url, path in scraper.scrape_all():
    process_document(path)
```

## 🎯 Current Status

✅ **Repository Cleanup Complete**
- Source materials archived to `archive_materials/`
- 478 markdown documents preserved
- PostgreSQL database with 1000+ records
- 12 preserved JSON backup files

✅ **Live Scraping System Complete**
- All components implemented and tested
- Full CLI interface available
- RESTful API server ready
- Static dashboard deployed

✅ **Ready for Production**
- GitHub deployment optimized
- Multiple data source support
- Comprehensive monitoring
- OSINT compliance maintained

## 🔮 Next Steps

1. **Deploy API Server**: Choose hosting platform (Heroku, AWS, etc.)
2. **Configure GitHub Actions**: Automated daily scraping
3. **Set up Monitoring**: Health checks and alerts
4. **Customize Frontend**: Branding and additional features
5. **Add Data Validation**: Cross-reference with other municipal sources

The complete live data scraping system is now ready for deployment and provides real-time access to Carmen de Areco transparency data with full comparison capabilities across multiple sources.