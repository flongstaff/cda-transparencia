#!/bin/bash

# Phase 3: Organize Files by Year and Category
# This script organizes files from not_organized into proper year directories

set -e

echo "🗂️  Phase 3: Organizing files by year and category..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "📂 Working in: $PROJECT_ROOT"

# Create backup directory
BACKUP_DIR="$PROJECT_ROOT/backup_phase3_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
LOG_FILE="$PROJECT_ROOT/organize_phase3_log.txt"

echo "💾 Backup directory: $BACKUP_DIR" | tee "$LOG_FILE"
echo "📝 Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

NOT_ORGANIZED_DIR="$PROJECT_ROOT/data/source_materials/not_organized"

if [[ ! -d "$NOT_ORGANIZED_DIR" ]]; then
    echo "❌ not_organized directory not found!" | tee -a "$LOG_FILE"
    exit 1
fi

# Count files before organization
echo "📊 Before Phase 3:" | tee -a "$LOG_FILE"
echo "  Files in not_organized: $(find "$NOT_ORGANIZED_DIR" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to move files by year
organize_by_year() {
    local year="$1"
    local year_dir="$PROJECT_ROOT/data/source_materials/$year"
    
    echo "🗓️  Organizing $year files..." | tee -a "$LOG_FILE"
    mkdir -p "$year_dir"
    
    # Find files that contain the year in their name
    find "$NOT_ORGANIZED_DIR" -name "*$year*" -type f | while read -r file; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            target="$year_dir/$filename"
            
            # Check if file already exists in target directory
            if [[ -f "$target" ]]; then
                echo "  ⚠️  File exists in $year/: $filename (skipping)" | tee -a "$LOG_FILE"
                # Move duplicate to backup
                mkdir -p "$BACKUP_DIR/duplicates/$year"
                mv "$file" "$BACKUP_DIR/duplicates/$year/"
                echo "    📁 Moved duplicate to backup: $filename" | tee -a "$LOG_FILE"
            else
                mv "$file" "$target"
                echo "  📁 Moved to $year/: $filename" | tee -a "$LOG_FILE"
            fi
        fi
    done
}

# Organize files by year (2018-2025)
for year in {2018..2025}; do
    organize_by_year "$year"
done

# Create special directories for unidentified files
GENERAL_DIR="$PROJECT_ROOT/data/source_materials/general"
ARCHIVE_DIR="$PROJECT_ROOT/data/source_materials/web_archives"

mkdir -p "$GENERAL_DIR"
mkdir -p "$ARCHIVE_DIR"

echo "📦 Organizing remaining files..." | tee -a "$LOG_FILE"

# Move web archive directories
if [[ -d "$NOT_ORGANIZED_DIR/web_archive" ]]; then
    echo "  📁 Moving web_archive to web_archives/" | tee -a "$LOG_FILE"
    mv "$NOT_ORGANIZED_DIR/web_archive"* "$ARCHIVE_DIR/" 2>/dev/null || true
fi

# Move remaining PDF files to general
find "$NOT_ORGANIZED_DIR" -name "*.pdf" -type f | while read -r file; do
    if [[ -f "$file" ]]; then
        filename=$(basename "$file")
        target="$GENERAL_DIR/$filename"
        
        if [[ -f "$target" ]]; then
            echo "  ⚠️  File exists in general/: $filename (moving to backup)" | tee -a "$LOG_FILE"
            mkdir -p "$BACKUP_DIR/duplicates/general"
            mv "$file" "$BACKUP_DIR/duplicates/general/"
        else
            mv "$file" "$target"
            echo "  📁 Moved to general/: $filename" | tee -a "$LOG_FILE"
        fi
    fi
done

# Move remaining directories to appropriate locations
echo "📂 Organizing remaining directories..." | tee -a "$LOG_FILE"

# Move specific directories
for dir in decretos ley licitaciones_gba boletin_oficial; do
    if [[ -d "$NOT_ORGANIZED_DIR/$dir" ]]; then
        target="$PROJECT_ROOT/data/source_materials/$dir"
        echo "  📁 Moving $dir/ to source_materials/" | tee -a "$LOG_FILE"
        mv "$NOT_ORGANIZED_DIR/$dir" "$target"
    fi
done

# Remove empty directories
echo "🧹 Cleaning up empty directories..." | tee -a "$LOG_FILE"
find "$NOT_ORGANIZED_DIR" -type d -empty -delete 2>/dev/null || true

# Remove not_organized if it's empty or only has empty directories
if [[ -d "$NOT_ORGANIZED_DIR" ]]; then
    remaining_files=$(find "$NOT_ORGANIZED_DIR" -type f | wc -l)
    if [[ $remaining_files -eq 0 ]]; then
        echo "  📁 Removing empty not_organized directory" | tee -a "$LOG_FILE"
        rmdir "$NOT_ORGANIZED_DIR" 2>/dev/null || true
    else
        echo "  ℹ️  not_organized directory still has $remaining_files files" | tee -a "$LOG_FILE"
    fi
fi

# Count files after organization
echo "" | tee -a "$LOG_FILE"
echo "📊 After Phase 3:" | tee -a "$LOG_FILE"
echo "  Total PDF files: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"

# Show organization by year
for year in {2018..2025}; do
    year_dir="$PROJECT_ROOT/data/source_materials/$year"
    if [[ -d "$year_dir" ]]; then
        count=$(find "$year_dir" -name "*.pdf" -type f | wc -l)
        echo "  $year: $count files" | tee -a "$LOG_FILE"
    fi
done

if [[ -d "$GENERAL_DIR" ]]; then
    general_count=$(find "$GENERAL_DIR" -name "*.pdf" -type f | wc -l)
    echo "  General: $general_count files" | tee -a "$LOG_FILE"
fi

# Show space and organization summary
if command -v du > /dev/null; then
    backup_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "Unknown")
    echo "  Files in backup: $backup_size" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "✅ Phase 3 completed successfully!" | tee -a "$LOG_FILE"
echo "💾 Backup available at: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "📝 Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo ""
echo "🎉 Repository organization complete!"
echo "📋 Files are now organized by year in data/source_materials/"