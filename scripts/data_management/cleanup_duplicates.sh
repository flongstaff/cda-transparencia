#!/bin/bash

# Cleanup Duplicates Script for CDA Transparencia Repository
# This script removes duplicate files and organizes the repository structure

set -e

echo "🧹 Starting repository cleanup..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "📂 Working in: $PROJECT_ROOT"

# Create backup directory
BACKUP_DIR="$PROJECT_ROOT/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "💾 Backup directory created: $BACKUP_DIR"

# Function to safely remove duplicates
remove_duplicates() {
    local dir="$1"
    local pattern="$2"
    
    echo "🔍 Removing duplicates in $dir with pattern $pattern"
    
    find "$dir" -name "$pattern" -type f | while read -r file; do
        if [[ -f "$file" ]]; then
            echo "  ❌ Removing: $file"
            # Move to backup instead of deleting
            mkdir -p "$BACKUP_DIR/$(dirname "${file#$PROJECT_ROOT/}")"
            mv "$file" "$BACKUP_DIR/${file#$PROJECT_ROOT/}"
        fi
    done
}

# Remove numbered duplicates (_1, _2, _3, etc.)
echo "🗂️  Phase 1: Removing numbered duplicates..."
remove_duplicates "$PROJECT_ROOT/data" "*_[0-9].pdf"
remove_duplicates "$PROJECT_ROOT/data" "*_[0-9][0-9].pdf"

# Remove 'copia' files
echo "🗂️  Phase 2: Removing 'copia' files..."
remove_duplicates "$PROJECT_ROOT/data" "*-copia.pdf"
remove_duplicates "$PROJECT_ROOT/data" "*copia.pdf"

# Remove system files
echo "🗂️  Phase 3: Removing system files..."
find "$PROJECT_ROOT" -name ".DS_Store" -type f -delete
find "$PROJECT_ROOT" -name "Thumbs.db" -type f -delete
find "$PROJECT_ROOT" -name "desktop.ini" -type f -delete

# Clean up empty directories
echo "🗂️  Phase 4: Removing empty directories..."
find "$PROJECT_ROOT/data" -type d -empty -delete 2>/dev/null || true

# Move remaining files from not_organized to proper locations
echo "🗂️  Phase 5: Organizing remaining files..."

NOT_ORGANIZED_DIR="$PROJECT_ROOT/data/source_materials/not_organized"
if [[ -d "$NOT_ORGANIZED_DIR" ]]; then
    echo "📋 Processing files in not_organized directory..."
    
    # Process files by year
    for year in {2018..2025}; do
        YEAR_DIR="$PROJECT_ROOT/data/source_materials/$year"
        mkdir -p "$YEAR_DIR"
        
        # Move files containing the year
        find "$NOT_ORGANIZED_DIR" -name "*$year*" -type f | while read -r file; do
            filename=$(basename "$file")
            if [[ ! -f "$YEAR_DIR/$filename" ]]; then
                echo "  📁 Moving $filename to $year/"
                mv "$file" "$YEAR_DIR/"
            else
                echo "  ⚠️  File already exists in $year/: $filename"
                mv "$file" "$BACKUP_DIR/duplicates/"
                mkdir -p "$BACKUP_DIR/duplicates/"
            fi
        done
    done
    
    # Move remaining files to a general directory
    GENERAL_DIR="$PROJECT_ROOT/data/source_materials/general"
    mkdir -p "$GENERAL_DIR"
    
    find "$NOT_ORGANIZED_DIR" -type f | while read -r file; do
        filename=$(basename "$file")
        if [[ ! -f "$GENERAL_DIR/$filename" ]]; then
            echo "  📁 Moving $filename to general/"
            mv "$file" "$GENERAL_DIR/"
        fi
    done
    
    # Remove not_organized directory if empty
    rmdir "$NOT_ORGANIZED_DIR" 2>/dev/null || echo "  ℹ️  not_organized directory not empty, keeping it"
fi

# Generate cleanup report
REPORT_FILE="$PROJECT_ROOT/cleanup_report_$(date +%Y%m%d_%H%M%S).txt"
echo "📊 Generating cleanup report: $REPORT_FILE"

cat > "$REPORT_FILE" << EOF
# Repository Cleanup Report
Date: $(date)
Backup Location: $BACKUP_DIR

## Files Statistics
Total PDF files after cleanup: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)
Total files in backup: $(find "$BACKUP_DIR" -type f | wc -l)

## Directory Structure
$(tree -d "$PROJECT_ROOT/data" 2>/dev/null || find "$PROJECT_ROOT/data" -type d | sed 's/^/  /')

## Remaining Files by Year
EOF

for year in {2018..2025}; do
    year_dir="$PROJECT_ROOT/data/source_materials/$year"
    if [[ -d "$year_dir" ]]; then
        file_count=$(find "$year_dir" -type f | wc -l)
        echo "$year: $file_count files" >> "$REPORT_FILE"
    fi
done

echo ""
echo "✅ Cleanup completed successfully!"
echo "📊 Report saved to: $REPORT_FILE"
echo "💾 Backup available at: $BACKUP_DIR"
echo "🔍 Review the backup before permanently deleting it"

# Show final statistics
echo ""
echo "📈 Final Statistics:"
echo "  Total PDF files: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)"
echo "  Files backed up: $(find "$BACKUP_DIR" -type f | wc -l)"
echo "  Repository size: $(du -sh "$PROJECT_ROOT" | cut -f1)"