#!/bin/bash

# Safe Duplicate Analysis Script - NO DELETIONS
# This script only identifies and reports duplicates without removing anything

set -e

echo "🔍 Starting safe duplicate analysis..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "📂 Working in: $PROJECT_ROOT"

# Create analysis report
REPORT_FILE="$PROJECT_ROOT/duplicate_analysis_$(date +%Y%m%d_%H%M%S).md"

echo "📊 Creating analysis report: $REPORT_FILE"

cat > "$REPORT_FILE" << 'EOF'
# Duplicate Files Analysis Report

## Overview
This report identifies potential duplicate files in the repository without making any changes.

## Statistics
EOF

# Add statistics to report
echo "" >> "$REPORT_FILE"
echo "- **Total PDF files**: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)" >> "$REPORT_FILE"
echo "- **Files with numeric suffixes**: $(find "$PROJECT_ROOT/data" -name "*_[0-9].pdf" -o -name "*_[0-9][0-9].pdf" | wc -l)" >> "$REPORT_FILE"
echo "- **Files with 'copia' in name**: $(find "$PROJECT_ROOT/data" -name "*copia*" | wc -l)" >> "$REPORT_FILE"
echo "- **System files (.DS_Store)**: $(find "$PROJECT_ROOT" -name ".DS_Store" | wc -l)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Identify potential duplicates by base name
echo "## Potential Duplicates by Base Name" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

find "$PROJECT_ROOT/data" -name "*.pdf" -type f | while read -r file; do
    basename_file=$(basename "$file")
    # Remove numeric suffixes and 'copia' to find base name
    base_name=$(echo "$basename_file" | sed -E 's/_[0-9]+\.pdf$/.pdf/' | sed -E 's/-copia\.pdf$/.pdf/' | sed -E 's/copia\.pdf$/.pdf/')
    echo "$base_name|$file"
done | sort | uniq -d -f1 > /tmp/potential_duplicates.tmp

if [[ -s /tmp/potential_duplicates.tmp ]]; then
    echo "### Files that appear to have duplicates:" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    while IFS='|' read -r base_name full_path; do
        echo "**Base name**: $base_name" >> "$REPORT_FILE"
        # Find all variations of this file
        find "$PROJECT_ROOT/data" -name "*$(echo "$base_name" | sed 's/\.pdf$//')*" -type f | while read -r variation; do
            size=$(du -h "$variation" | cut -f1)
            echo "- $variation ($size)" >> "$REPORT_FILE"
        done
        echo "" >> "$REPORT_FILE"
    done < /tmp/potential_duplicates.tmp
else
    echo "No clear duplicates found by base name analysis." >> "$REPORT_FILE"
fi

# List files in not_organized directory
echo "## Files in not_organized directory" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

NOT_ORGANIZED_DIR="$PROJECT_ROOT/data/source_materials/not_organized"
if [[ -d "$NOT_ORGANIZED_DIR" ]]; then
    file_count=$(find "$NOT_ORGANIZED_DIR" -type f | wc -l)
    echo "**Total files in not_organized**: $file_count" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    echo "### Files by potential year:" >> "$REPORT_FILE"
    for year in {2018..2025}; do
        year_files=$(find "$NOT_ORGANIZED_DIR" -name "*$year*" -type f | wc -l)
        if [[ $year_files -gt 0 ]]; then
            echo "- **$year**: $year_files files" >> "$REPORT_FILE"
        fi
    done
    
    unidentified_files=$(find "$NOT_ORGANIZED_DIR" -type f | grep -v -E '(2018|2019|2020|2021|2022|2023|2024|2025)' | wc -l)
    echo "- **Unidentified year**: $unidentified_files files" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    echo "No not_organized directory found." >> "$REPORT_FILE"
fi

# Directory structure summary
echo "## Current Directory Structure" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

# Safe directory listing
find "$PROJECT_ROOT/data" -type d | sort | while read -r dir; do
    rel_path=${dir#$PROJECT_ROOT/}
    depth=$(echo "$rel_path" | grep -o '/' | wc -l)
    indent=$(printf "%*s" $((depth*2)) "")
    file_count=$(find "$dir" -maxdepth 1 -type f | wc -l)
    echo "$indent$(basename "$dir")/ ($file_count files)" >> "$REPORT_FILE"
done

echo '```' >> "$REPORT_FILE"

# Recommendations
echo "" >> "$REPORT_FILE"
echo "## Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Based on this analysis, consider the following safe actions:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. **Review numbered duplicates**: Files with _1, _2, etc. suffixes are likely duplicates" >> "$REPORT_FILE"
echo "2. **Check 'copia' files**: Files with 'copia' in the name are likely copies" >> "$REPORT_FILE"
echo "3. **Organize by year**: Move files from not_organized to appropriate year folders" >> "$REPORT_FILE"
echo "4. **Remove system files**: .DS_Store files can be safely removed" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Next Steps" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. Review this report carefully" >> "$REPORT_FILE"
echo "2. Manually verify a few suspected duplicates" >> "$REPORT_FILE"
echo "3. Create a backup before making any changes" >> "$REPORT_FILE"
echo "4. Start with small, safe changes (like removing .DS_Store files)" >> "$REPORT_FILE"

# Clean up temp files
rm -f /tmp/potential_duplicates.tmp

echo ""
echo "✅ Analysis completed successfully!"
echo "📊 Report saved to: $REPORT_FILE"
echo "🔍 Please review the report before making any changes"