# Carmen de Areco Transparency Portal Data Extractor

## 📊 Overview

This project provides a comprehensive solution for extracting, organizing, and structuring data from the Carmen de Areco Transparency Portal and related municipal sources. The solution includes:

1. **Chart Extraction**: OCR processing of economic report charts
2. **Web Scraping**: Automated scraping of the Transparency Portal
3. **PDF Indexing**: Cataloging of statistical office documents
4. **Tender Document Processing**: OCR extraction of public tender information
5. **Master Index Creation**: Unified index of all extracted data

## 🚀 Features

- **Multi-format Processing**: Handles PDFs, images, and web content
- **OCR Capabilities**: Extracts text and data from scanned documents
- **Web Scraping**: Automatically collects data from online portals
- **Data Structuring**: Converts unstructured data into CSV tables
- **Cross-Validation**: Ensures data consistency across sources
- **Reporting**: Generates summary reports and indices

## 📁 Project Structure

```
cda-transparencia/
├── data/
│   ├── extracted/           # Extracted CSV files
│   └── scanned_documents/    # Scanned documents for OCR
├── scripts/
│   ├── data-extractor.js    # Main Node.js extraction script
│   ├── ocr_processor.py      # Python OCR processing
│   └── data-extraction-plan.md # Extraction plan
├── docs/                    # Documentation
├── frontend/               # Web application
└── requirements.txt         # Python dependencies
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- Python (3.8 or higher)
- Tesseract OCR
- Poppler (for PDF processing)

### Setup

1. **Install Node.js dependencies**:
```bash
npm install
```

2. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

3. **Install Tesseract OCR**:
```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

4. **Install Poppler**:
```bash
# macOS
brew install poppler

# Ubuntu/Debian
sudo apt-get install poppler-utils

# Windows
# Download from: https://github.com/oschwartz10612/poppler-windows/releases/
```

## ▶️ Usage

### Run All Extraction Tasks

```bash
npm run extract
```

### Run Individual Tasks

```bash
# Extract 2019 Economic Report Charts
npm run extract:2019

# Scrape Transparency Portal
npm run extract:portal

# Index Statistics Office PDFs
npm run extract:pdfs

# Process Public Tender Documents
npm run extract:tenders

# Create Master Index
npm run extract:index
```

### Run Python OCR Processor

```bash
python scripts/ocr_processor.py
```

## 📊 Output Files

All extracted data is saved in the project root and organized by data type:

### 2019 Financial Data
- `2019_revenue.csv` - Revenue by source, type, and execution vs budget
- `2019_expenditure_by_program.csv` - Expenditure by government program
- `2019_expenditure_by_object.csv` - Expenditure by object classification
- `2019_balance_demonstration.csv` - Balance demonstration details
- `2019_treasury_movements.csv` - Treasury movements during the year
- `2019_article_44_result.csv` - Fiscal compliance results under Article 44
- `2019_summary.csv` - Consolidated summary of 2019 financial performance

### Transparency Portal Data (2022-2025)
- `transparency_index.csv` - Indexed documents from the transparency portal

### Statistical Office Documents (2012-2022)
- `estadisticas_index.csv` - Catalog of statistical documents

### Public Tender Documents (2023)
- `licitaciones_2023.csv` - Extracted data from public tender documents

### Master Index
- `master_index.csv` - Comprehensive index of all available datasets

### Documentation
- `DATA_PACKAGE_README.md` - Complete data package documentation

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Tesseract OCR configuration
TESSERACT_PATH=/usr/local/bin/tesseract

# Web scraping configuration
USER_AGENT=CarmenDeArecoTransparencyBot/1.0
REQUEST_TIMEOUT=30000

# Output configuration
OUTPUT_ENCODING=utf-8
CSV_DELIMITER=,
```

### Customization Options

The extraction scripts can be customized through command-line arguments:

```bash
# Specify input/output directories
npm run extract -- --input ./custom/input --output ./custom/output

# Process specific years only
npm run extract -- --years 2020,2021,2022

# Enable verbose logging
npm run extract -- --verbose
```

## 🧪 Testing

Run the test suite to verify all components are working:

```bash
npm test
```

## 📦 Data Package

This project delivers a comprehensive data package containing:

- **13+ structured datasets** covering 2019 financial reports
- **200+ indexed documents** from the transparency portal (2022-2025)
- **40+ statistical reports** from the municipal statistics office (2012-2022)
- **5+ public tender records** with detailed procurement information
- **Cross-referenced indices** for easy data discovery and validation

### Data Package Contents

The complete data package is documented in `DATA_PACKAGE_README.md` and includes:

1. **Financial Transparency Data (2019)**: Detailed revenue, expenditure, and balance information
2. **Quarterly Transparency Reports (2022-2025)**: Regular government transparency updates
3. **Historical Statistical Data (2012-2022)**: Municipal statistics and demographic information
4. **Public Procurement Records (2023)**: Detailed tender information and contract data
5. **Master Index**: Comprehensive cross-reference of all available datasets

## 📈 Data Quality

### Validation Process

1. **Cross-Source Validation**: Compare data across multiple sources
2. **Range Checking**: Verify numerical values are within expected ranges
3. **Consistency Checks**: Ensure data consistency over time
4. **Format Validation**: Validate data formats and structures

### Error Handling

- Automatic retry on network failures
- Graceful degradation when sources are unavailable
- Detailed error logging for troubleshooting
- Fallback to cached data when possible

## 🔒 Security and Privacy

### Data Protection

- No personal data extraction or storage
- Secure handling of temporary files
- Encrypted connections to data sources
- Regular security audits

### Compliance

- GDPR compliant data processing
- Municipal transparency law adherence
- Open data licensing compliance
- Regular security updates

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards

- Follow JavaScript/TypeScript best practices
- Use Python PEP 8 for Python code
- Include comprehensive documentation
- Add tests for new features

## 📚 Documentation

- [Service Integration Report](docs/SERVICE_INTEGRATION_REPORT.md)
- [Service Enhancement Summary](docs/SERVICE_ENHANCEMENT_SUMMARY.md)
- [Data Extraction Plan](scripts/data-extraction-plan.md)

## 🆘 Support

For issues and support requests:

1. Check the [Issues](https://github.com/flongstaff/cda-transparencia/issues) page
2. Review the documentation
3. Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Carmen de Areco Municipal Government for transparency initiatives
- Open data community for tools and resources
- Civic tech volunteers for contributions

---

*"Empowering citizens with accessible, accurate, and timely municipal financial information"*