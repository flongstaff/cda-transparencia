#!/bin/bash

# Simple Document Date Checker
# Checks dates in PDF files and categorizes them

echo "🔍 Starting document date analysis..."

# Create output directory and file
OUTPUT_DIR="/Users/flong/Developer/cda-transparencia/data/analysis"
mkdir -p "$OUTPUT_DIR"

# Create results file
RESULTS_FILE="$OUTPUT_DIR/document_dates_analysis.csv"
echo "Filename,Directory,ExtractedText,DatePatternsFound,PotentialDateRanges" > "$RESULTS_FILE"

# Counter for processed files
processed=0
total_files=$(find /Users/flong/Developer/cda-transparencia/data/source_materials -name "*.pdf" | wc -l | tr -d ' ')

echo "Found $total_files PDF files to analyze..."

# Process PDF files
find /Users/flong/Developer/cda-transparencia/data/source_materials -name "*.pdf" | head -20 | while read -r pdf_file; do
    filename=$(basename "$pdf_file")
    directory=$(dirname "$pdf_file" | xargs basename)
    
    echo "Processing ($((++processed))/$total_files): $filename"
    
    # Extract text content
    temp_txt=$(mktemp).txt
    if pdftotext -layout "$pdf_file" "$temp_txt" 2>/dev/null; then
        # Extract first 500 characters for quick analysis
        extracted_text=$(head -c 500 "$temp_txt" | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^ *//;s/ *$//')
        
        # Look for date patterns
        date_patterns=$(grep -Eo "(Del [0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4} al [0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{4}-[0-9]{4}|[Pp][Rr][Oo][Dd][Uu][Cc][Cc][Ii][Óó][Nn] [0-9]{4})" "$temp_txt" 2>/dev/null | head -3 | tr '\n' ';' | sed 's/;$//')
        
        # Look for Spanish month patterns
        spanish_months=$(grep -Eoi "(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre) [0-9]{4}" "$temp_txt" 2>/dev/null | head -3 | tr '\n' ';' | sed 's/;$//')
        
        # Combine all date findings
        all_dates="$date_patterns;$spanish_months"
        
        # Clean up empty entries
        all_dates=$(echo "$all_dates" | sed 's/;;/;/g;s/^;//;s/;$//')
        
        # Look for production or period patterns
        period_patterns=$(grep -Eio "(PRODUCCION|Del.*al|Periodo|Trimestre)" "$temp_txt" 2>/dev/null | head -2 | tr '\n' ';' | sed 's/;$//')
        
        # Write to CSV
        echo "\"$filename\",\"$directory\",\"$extracted_text\",\"$all_dates\",\"$period_patterns\"" >> "$RESULTS_FILE"
        
        # Show findings if dates were found
        if [ -n "$all_dates" ] || [ -n "$period_patterns" ]; then
            echo "  📅 Dates found: $all_dates"
            echo "  📆 Periods: $period_patterns"
        fi
    else
        echo "  ⚠️  Could not extract text"
        echo "\"$filename\",\"$directory\",\"TEXT_EXTRACTION_FAILED\",\"\",\"\"" >> "$RESULTS_FILE"
    fi
    
    # Clean up temp file
    rm -f "$temp_txt"
    
    # Limit processing for demo purposes
    if [ $processed -ge 20 ]; then
        echo "Reached processing limit for demo. Stopping..."
        break
    fi
done

echo "✅ Document date analysis complete!"
echo "Results saved to: $RESULTS_FILE"
echo ""
echo "📊 Next steps:"
echo "1. Review the CSV file for date patterns"
echo "2. Manually verify document authenticity"
echo "3. Categorize documents by year/type"
echo "4. Remove duplicates and unnecessary files"