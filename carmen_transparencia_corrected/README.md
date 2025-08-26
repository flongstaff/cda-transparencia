# Carmen de Areco Transparency Scraper

A comprehensive Python tool for scraping, processing, and analyzing transparency documents from the Carmen de Areco municipal government website.

## 🚀 Features

- **Multi-source scraping**: Download documents from official website and Wayback Machine
- **Document processing**: Convert PDFs, Excel files, and Word documents to structured formats
- **Data validation**: Verify document integrity and extract financial data  
- **Database storage**: SQLite database for metadata and processed content
- **CLI interface**: Easy-to-use command-line tools
- **Async support**: Fast concurrent document downloading

## 📋 Requirements

- Python 3.11+
- Java (required for tabula-py PDF processing)

## 🔧 Installation

```bash
git clone <repository-url>
cd carmen_transparencia
pip install -r requirements.txt
```

### Java Installation (for PDF processing)
```bash
# Ubuntu/Debian
sudo apt-get install default-jre

# macOS
brew install openjdk

# Windows
# Download and install from https://www.oracle.com/java/technologies/downloads/
```

## 📖 Usage

### Initialize Database
```bash
python -c "from src.database import initialize_database; initialize_database()"
```

### Scrape Documents

**From official website:**
```bash
python -m src.cli scrape live --output data --depth 2
```

**From Wayback Machine:**
```bash
python -m src.cli scrape wayback --output wayback_data --depth 1
```

### Process Documents
```bash
python -m src.cli process documents ./data ./processed_data.json
```

### Populate Database
```bash
# From processed JSON
python -m src.cli populate from-json processed_data.json documents

# From CSV file  
python -m src.cli populate from-csv data.csv financial_reports
```

### Validate Documents
```bash
python -m src.cli validate ./data
```

## 🏗️ Project Structure

```
carmen_transparencia/
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker configuration
├── README.md               # This file
├── tests/
│   └── test_cli.py         # Unit tests
└── src/
    ├── __init__.py         # Package initialization
    ├── data_extraction.py  # Web scraping functions
    ├── processing.py       # Document processing utilities
    ├── database.py         # SQLite database operations
    └── cli.py             # Command-line interface
```

## 🔧 CLI Commands

### Scraping Commands
- `scrape live` - Download from official website
- `scrape wayback` - Download from Wayback Machine

### Processing Commands  
- `process documents` - Convert documents to structured formats
- `validate` - Check document integrity

### Database Commands
- `populate from-json` - Import from JSON file
- `populate from-csv` - Import from CSV file

## 🐳 Docker Usage

```bash
# Build image
docker build -t carmen_scraper .

# Scrape documents
docker run --rm -v $(pwd)/data:/app/data carmen_scraper scrape live --output ./data

# Process documents
docker run --rm -v $(pwd)/data:/app/data carmen_scraper process documents ./data ./results.json
```

## 📊 Data Output Formats

### JSON Summary
```json
{
  "input_directory": "/path/to/documents",
  "processed_at": "2024-01-15T10:30:00",
  "total_files": 25,
  "processed_successfully": 23,
  "results": [
    {
      "original_file": "budget_2024.pdf",
      "filename": "budget_2024.pdf", 
      "type": ".pdf",
      "size": 2048576,
      "valid": true,
      "processed_files": [
        {
          "type": "csv",
          "path": "/path/to/budget_2024_tables.csv"
        }
      ]
    }
  ]
}
```

### Database Schema
- **documents**: Original document metadata
- **processed_files**: Conversion results tracking
- **financial_data**: Extracted financial information

## 🧪 Testing

```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_cli.py::TestCLI::test_main_help

# Run with coverage
pytest --cov=src tests/
```

## 🔍 Examples

### Complete Workflow
```bash
# 1. Scrape recent documents
python -m src.cli scrape live --output ./scraped_docs

# 2. Validate downloaded files
python -m src.cli validate ./scraped_docs

# 3. Process all documents
python -m src.cli process documents ./scraped_docs ./results.json

# 4. Import to database
python -m src.cli populate from-json ./results.json transparency_docs
```

### Database Operations
```python
from src.database import get_document_stats, export_to_json

# Get statistics
stats = get_document_stats()
print(f"Total documents: {stats['total_documents']}")

# Export everything to JSON
export_to_json("full_export.json")
```

## 📈 Performance Tips

- Use `--depth 1` for faster scraping of large sites
- Process documents in batches for large collections
- Enable async mode for faster downloads
- Use SSD storage for database operations

## 🛠️ Troubleshooting

### Common Issues

**Java not found error:**
```bash
export JAVA_HOME=/usr/lib/jvm/default-java  # Linux
export JAVA_HOME=$(/usr/libexec/java_home)  # macOS
```

**PDF processing fails:**
- Ensure Java is installed and in PATH
- Some PDFs may be image-based and require OCR
- Try different PDF processing tools for complex documents

**Network timeouts:**
- Increase timeout values in `data_extraction.py`
- Use VPN if accessing from restricted locations
- Check for rate limiting on target websites

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make changes and add tests
4. Run tests (`pytest`)
5. Commit changes (`git commit -am 'Add new feature'`)
6. Push to branch (`git push origin feature/new-feature`)
7. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- BeautifulSoup4 for HTML parsing
- tabula-py for PDF table extraction  
- pandas for data manipulation
- Click for CLI framework
- aiohttp for async HTTP requests

---

**Note**: This tool is designed for transparency and accountability purposes. Please respect website terms of service and implement appropriate rate limiting when scraping.