# Data Indexing and OCR Extraction System for Carmen de Areco Transparency Portal

## Overview

This document describes the new data indexing and OCR extraction system that links `data.json`, `main-data.json`, and `main.json` files and processes PDFs using OCR technology.

## Components

### 1. Data File Linking System

The system maintains consistency between three main data files:
- `data.json`: Primary data catalog
- `main-data.json`: Main structured data catalog  
- `main.json`: Alternative data representation

These files are linked and synchronized using the `link-data-files.js` script.

### 2. OCR Processing Pipeline

The system uses a hybrid approach for PDF text extraction:
- **Primary**: docstrange library (advanced OCR capabilities)
- **Fallback**: PyPDF2 library (basic PDF text extraction)

## Scripts

### Backend Scripts (located in `/backend/scripts/`)

1. **link-data-files.js** - Links and synchronizes the three main data files
2. **ocr-extraction.js** - JavaScript wrapper for OCR processing
3. **ocr-workflow.js** - Complete workflow orchestrator
4. **process_pdfs_with_docstrange.py** - Python script for OCR processing
5. **test-ocr.js** - Test script to validate the OCR functionality
6. **parse-pdf.js** - Enhanced to support both basic and advanced OCR methods

### Usage Examples

#### Link Data Files
```bash
node backend/scripts/link-data-files.js
```

#### Run Complete OCR Workflow
```bash
node backend/scripts/ocr-workflow.js
```

#### Process with Advanced OCR (in parse-pdf.js)
```bash
node backend/scripts/parse-pdf.js --advanced
```

#### Run Individual OCR Test
```bash
node backend/scripts/test-ocr.js
```

## Directory Structure

```
data/
├── data.json           # Primary data catalog
├── main-data.json      # Main structured data catalog
├── main.json           # Alternative data representation
├── ocr_extracted/      # OCR extraction results
│   ├── csv/            # Extracted CSV data
│   ├── json/           # JSON extraction results
│   ├── text/           # Extracted text files
│   └── pdfs/           # Processed PDFs
└── test_pdfs/          # Test PDF files and results
```

## OCR Processing Workflow

1. **PDF Retrieval**: Download PDFs from URLs specified in data files or use local files
2. **Text Extraction**: 
   - Attempt extraction using docstrange (requires internet for authentication)
   - If docstrange fails or returns empty results, fall back to PyPDF2
3. **Result Storage**: Save extracted text and metadata to JSON files
4. **Data Update**: Add extraction results back to the original data files

## Output Format

Extraction results include:
- Page count
- Text length
- Extracted text (first 2000 characters + ...)
- Fallback method used (if applicable)
- Table count (when available)
- Other metadata

## Configuration and Dependencies

### Python Dependencies
- docstrange: Advanced OCR processing (added to requirements_complete.txt)
- PyPDF2: Fallback PDF text extraction
- Additional dependencies as needed by docstrange

### Node.js Dependencies
- Existing dependencies remain unchanged
- New functionality built on existing framework

## Integration with Existing System

The new OCR system integrates seamlessly with:
- Existing data catalog structure
- Frontend application
- Backend API
- Data processing workflows

The system maintains backward compatibility with existing scripts while adding enhanced OCR capabilities.

## Error Handling

- Network issues during PDF download
- OCR processing failures
- File I/O errors
- Authentication issues with docstrange
- Format incompatibilities

## Testing

The system has been tested with:
- Various PDF formats from Carmen de Areco's transparency portal
- Different file sizes (tested with 331-page budget document)
- Network connectivity issues
- Fallback scenarios

## Performance Considerations

- Large PDFs may take time to process
- Internet connectivity required for docstrange authentication
- Local processing available through PyPDF2 fallback
- Results are cached to avoid reprocessing