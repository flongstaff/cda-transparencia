# Document Verification Environment Setup

## Required Tools for OCR and Document Analysis

### 1. PDF Text Extraction
- **pdftotext**: Extract text from PDF files
- **pdfinfo**: Get PDF metadata including creation dates
- **exiftool**: Extract comprehensive metadata from PDFs

### 2. OCR Processing
- **Tesseract OCR**: Optical character recognition for scanned documents
- **OCRmyPDF**: Combines OCR with PDF processing

### 3. Document Analysis Tools
- **pdffonts**: Identify fonts used in PDFs
- **pdfimages**: Extract images from PDFs
- **qpdf**: PDF transformation and inspection

## Installation Commands

### macOS (using Homebrew)
```bash
# Install required tools
brew install poppler tesseract ocrmypdf exiftool qpdf

# Install additional language packs for Tesseract (Spanish)
brew install tesseract-lang
```

### Ubuntu/Debian
```bash
# Install required tools
sudo apt-get update
sudo apt-get install poppler-utils tesseract-ocr ocrmypdf exiftool qpdf

# Install Spanish language pack for Tesseract
sudo apt-get install tesseract-ocr-spa
```

## Document Verification Workflow

### 1. Basic Document Information Extraction
```bash
# Get PDF metadata
pdfinfo document.pdf

# Extract text content
pdftotext -layout document.pdf document.txt

# Get font information
pdffonts document.pdf
```

### 2. OCR Processing for Scanned Documents
```bash
# Process PDF with OCR (assuming Spanish text)
ocrmypdf --language spa input.pdf output.pdf
```

### 3. Metadata Extraction
```bash
# Extract comprehensive metadata
exiftool document.pdf
```

## Document Date Verification Script

Let me create a script to systematically check document dates:

```bash
#!/bin/bash

# Document Date Verification Script
# This script extracts and verifies dates from PDF documents

DOCUMENT_DIR="/Users/flong/Developer/cda-transparencia/data/source_materials"
OUTPUT_FILE="/Users/flong/Developer/cda-transparencia/data/document_dates.csv"

# Create CSV header
echo "Filename,CreationDate,ModificationDate,Title,Author,Subject,Keywords,ExtractedDates" > "$OUTPUT_FILE"

# Process all PDF files
find "$DOCUMENT_DIR" -name "*.pdf" | while read -r pdf_file; do
    echo "Processing: $(basename "$pdf_file")"
    
    # Extract PDF metadata
    pdf_info=$(pdfinfo "$pdf_file" 2>/dev/null)
    
    # Get metadata fields
    creation_date=$(echo "$pdf_info" | grep "CreationDate" | cut -d":" -f2- | xargs)
    mod_date=$(echo "$pdf_info" | grep "ModDate" | cut -d":" -f2- | xargs)
    title=$(echo "$pdf_info" | grep "Title" | cut -d":" -f2- | xargs)
    author=$(echo "$pdf_info" | grep "Author" | cut -d":" -f2- | xargs)
    subject=$(echo "$pdf_info" | grep "Subject" | cut -d":" -f2- | xargs)
    keywords=$(echo "$pdf_info" | grep "Keywords" | cut -d":" -f2- | xargs)
    
    # Extract text content for date detection
    temp_txt=$(mktemp).txt
    pdftotext -layout "$pdf_file" "$temp_txt" 2>/dev/null
    
    # Extract dates from text (various formats)
    extracted_dates=$(grep -Eo "[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{4}" "$temp_txt" 2>/dev/null | head -10 | tr '\n' ';' | sed 's/;$//')
    
    # Clean up temp file
    rm -f "$temp_txt"
    
    # Write to CSV
    filename=$(basename "$pdf_file")
    echo "\"$filename\",\"$creation_date\",\"$mod_date\",\"$title\",\"$author\",\"$subject\",\"$keywords\",\"$extracted_dates\"" >> "$OUTPUT_FILE"
done

echo "Document date verification complete!"
echo "Results saved to: $OUTPUT_FILE"
```

## Advanced Date Pattern Recognition

### Common Date Formats to Look For:
1. **DD/MM/YYYY**: 02/01/2024
2. **MM/DD/YYYY**: 01/02/2024
3. **YYYY-MM-DD**: 2024-01-02
4. **Month Names**: Enero 2024, Febrero 2024
5. **Periods**: Del 02/01/2024 al 31/03/2024
6. **Years**: 2012-2021, 2024

### Spanish Month Names:
- Enero, Febrero, Marzo, Abril, Mayo, Junio
- Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre

## Document Categorization by Date

Let me create a script to categorize documents by their date ranges:

```bash
#!/bin/bash

# Document Categorization Script
# Categorizes documents based on extracted dates

INPUT_CSV="/Users/flong/Developer/cda-transparencia/data/document_dates.csv"
OUTPUT_DIR="/Users/flong/Developer/cda-transparencia/data/categorized_documents"

# Create output directories
mkdir -p "$OUTPUT_DIR"/{2018,2019,2020,2021,2022,2023,2024,2025,multi_year,undated}

# Process CSV file
tail -n +2 "$INPUT_CSV" | while IFS=',' read -r filename creation_date mod_date title author subject keywords extracted_dates; do
    echo "Categorizing: $filename"
    
    # Extract years from extracted dates
    years=$(echo "$extracted_dates" | grep -oE '[0-9]{4}' | sort -u)
    year_count=$(echo "$years" | wc -l)
    
    if [ "$year_count" -eq 1 ]; then
        # Single year document
        year=$(echo "$years" | head -1)
        if [ "$year" -ge 2018 ] && [ "$year" -le 2025 ]; then
            echo "Moving to: $OUTPUT_DIR/$year/"
            # In a real implementation, we would move/copy the file
        fi
    elif [ "$year_count" -gt 1 ]; then
        # Multi-year document
        echo "Multi-year document: $years"
        # Move to multi_year directory
    else
        # Undated document
        echo "Undated document"
        # Move to undated directory
    fi
done
```

## Quality Assurance Checks

### Document Verification Checklist:
1. ✅ **File Integrity**: Check if PDF opens without errors
2. ✅ **Metadata Verification**: Extract creation/modification dates
3. ✅ **Content Analysis**: Extract text and search for key phrases
4. ✅ **Date Validation**: Verify document dates match content
5. ✅ **Authenticity Check**: Look for official seals, signatures
6. ✅ **Cross-Reference**: Compare with other documents on same topic

## Automated Document Verification Pipeline

```bash
#!/bin/bash

# Automated Document Verification Pipeline

verify_document() {
    local pdf_file="$1"
    local filename=$(basename "$pdf_file")
    
    echo "=== Verifying: $filename ==="
    
    # 1. File integrity check
    if ! pdfinfo "$pdf_file" >/dev/null 2>&1; then
        echo "❌ File integrity check FAILED"
        return 1
    fi
    echo "✅ File integrity check PASSED"
    
    # 2. Metadata extraction
    creation_date=$(pdfinfo "$pdf_file" 2>/dev/null | grep "CreationDate" | cut -d":" -f2- | xargs)
    mod_date=$(pdfinfo "$pdf_file" 2>/dev/null | grep "ModDate" | cut -d":" -f2- | xargs)
    echo "📅 Creation Date: $creation_date"
    echo "📅 Modification Date: $mod_date"
    
    # 3. Text extraction
    temp_txt=$(mktemp).txt
    if pdftotext -layout "$pdf_file" "$temp_txt" 2>/dev/null; then
        echo "✅ Text extraction PASSED"
        
        # 4. Date pattern matching
        dates_found=$(grep -Eo "(Del [0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4} al [0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{4}|Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)" "$temp_txt" | head -5)
        echo "📆 Dates found: $dates_found"
        
        # 5. Key phrase search (official indicators)
        if grep -iq "carmen.*de.*areco\|municipalidad\|intendente\|concejo\|deliberante" "$temp_txt"; then
            echo "🏛️ Official document indicators FOUND"
        else
            echo "⚠️ Official document indicators NOT FOUND"
        fi
        
        rm -f "$temp_txt"
    else
        echo "⚠️ Text extraction FAILED (likely scanned document)"
        # Try OCR
        echo "🔍 Attempting OCR..."
        # ocrmypdf command would go here
    fi
    
    echo "=== Verification complete for: $filename ==="
    echo
}

# Process all PDF files
DOCUMENT_DIR="/Users/flong/Developer/cda-transparencia/data/source_materials"
find "$DOCUMENT_DIR" -name "*.pdf" | head -5 | while read -r pdf_file; do
    verify_document "$pdf_file"
done
```

## Next Steps for Document Verification

### 1. Install Required Tools
```bash
# For macOS
brew install poppler tesseract ocrmypdf exiftool qpdf tesseract-lang

# For Ubuntu
sudo apt-get install poppler-utils tesseract-ocr ocrmypdf exiftool qpdf
```

### 2. Run Initial Verification
```bash
# Make scripts executable
chmod +x /Users/flong/Developer/cda-transparencia/scripts/document_verification.sh

# Run verification
./scripts/document_verification.sh
```

### 3. Review Results
- Check CSV output for date information
- Identify documents that need OCR processing
- Flag documents with inconsistent dates
- Categorize documents by year and type

This environment setup will help us systematically verify document authenticity and extract accurate date information for proper organization.