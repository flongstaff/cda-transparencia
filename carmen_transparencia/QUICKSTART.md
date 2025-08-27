# Quick Start Guide

## 🚀 Getting Started

```bash
# Navigate to the project directory
cd carmen_transparencia

# Install the package (if not already installed)
pip install -e .

# Check that the CLI works
carmen-transparencia --help
```

## 📊 Working with Your Existing Data

```bash
# Import your existing CSV inventory into the database
carmen-transparencia populate from-csv ../data/preserved/csv/complete_file_inventory.csv documents

# Check the database
sqlite3 audit.db "SELECT COUNT(*) FROM documents;"
```

## 🆕 Processing New Documents

```bash
# Scrape new documents from the live website
carmen-transparencia scrape live --output ../data/new_documents

# Process documents into structured formats
carmen-transparencia process documents ../data/new_documents ../data/processed/report.json

# Import processed data into database
carmen-transparencia populate from-json ../data/processed/report.json new_documents
```

## 🔍 Database Queries

```bash
# See database schema
sqlite3 audit.db ".schema"

# Count documents by type
sqlite3 audit.db "SELECT file_type, COUNT(*) FROM documents GROUP BY file_type;"

# Export database backup
sqlite3 audit.db ".dump" > backup.sql
```

## 🧪 Validation

```bash
# Validate document integrity
carmen-transparencia validate ../data/live_scrape
```

## 🐍 Python API Usage

```python
from carmen_transparencia.database import initialize_database, get_document_stats

# Initialize database
initialize_database()

# Get statistics
stats = get_document_stats()
print(f"Total documents: {stats['total_documents']}")
```