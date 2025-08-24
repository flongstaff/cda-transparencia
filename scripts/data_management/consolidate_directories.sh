#!/bin/bash

# Directory Consolidation Script
# Consolidates organized_materials and source_materials into a single clean structure

set -e

echo "🗂️  Consolidating data directories..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "📂 Working in: $PROJECT_ROOT"

# Create backup directory
BACKUP_DIR="$PROJECT_ROOT/backup_consolidation_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
LOG_FILE="$PROJECT_ROOT/consolidation_log.txt"

echo "💾 Backup directory: $BACKUP_DIR" | tee "$LOG_FILE"
echo "📝 Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Count files before consolidation
echo "📊 Before consolidation:" | tee -a "$LOG_FILE"
echo "  organized_materials PDF files: $(find "$PROJECT_ROOT/data/organized_materials" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"
echo "  source_materials PDF files: $(find "$PROJECT_ROOT/data/source_materials" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Backup organized_materials before changes
echo "💾 Creating backup of current structure..." | tee -a "$LOG_FILE"
cp -r "$PROJECT_ROOT/data/organized_materials" "$BACKUP_DIR/" || true
cp -r "$PROJECT_ROOT/data/source_materials" "$BACKUP_DIR/" || true

# Strategy: Keep source_materials as the main structure, merge organized_materials content
echo "🔄 Consolidation strategy: source_materials as primary structure" | tee -a "$LOG_FILE"

# Create category directories in source_materials if they don't exist
mkdir -p "$PROJECT_ROOT/data/source_materials/budgets"
mkdir -p "$PROJECT_ROOT/data/source_materials/declarations"
mkdir -p "$PROJECT_ROOT/data/source_materials/financial_data"
mkdir -p "$PROJECT_ROOT/data/source_materials/reports"
mkdir -p "$PROJECT_ROOT/data/source_materials/tenders"

echo "📁 Moving categorized content from organized_materials..." | tee -a "$LOG_FILE"

# Function to move files safely (avoiding duplicates)
move_files_safely() {
    local source_dir="$1"
    local target_dir="$2"
    local category="$3"
    
    echo "  📂 Processing $category..." | tee -a "$LOG_FILE"
    
    if [[ -d "$source_dir" ]]; then
        find "$source_dir" -type f | while read -r file; do
            filename=$(basename "$file")
            target="$target_dir/$filename"
            
            if [[ -f "$target" ]]; then
                echo "    ⚠️  Duplicate found: $filename (keeping source_materials version)" | tee -a "$LOG_FILE"
                # Move organized_materials duplicate to backup
                mkdir -p "$BACKUP_DIR/duplicates/$category"
                mv "$file" "$BACKUP_DIR/duplicates/$category/"
            else
                mv "$file" "$target"
                echo "    ✅ Moved: $filename" | tee -a "$LOG_FILE"
            fi
        done
    fi
}

# Move organized_materials content to source_materials
move_files_safely "$PROJECT_ROOT/data/organized_materials/budgets" "$PROJECT_ROOT/data/source_materials/budgets" "budgets"
move_files_safely "$PROJECT_ROOT/data/organized_materials/declarations" "$PROJECT_ROOT/data/source_materials/declarations" "declarations"
move_files_safely "$PROJECT_ROOT/data/organized_materials/reports" "$PROJECT_ROOT/data/source_materials/reports" "reports"
move_files_safely "$PROJECT_ROOT/data/organized_materials/tenders" "$PROJECT_ROOT/data/source_materials/tenders" "tenders"

# Handle financial_data - this has many files, merge carefully
echo "  📊 Processing financial_data (large directory)..." | tee -a "$LOG_FILE"
FINANCIAL_SOURCE="$PROJECT_ROOT/data/organized_materials/financial_data"
FINANCIAL_TARGET="$PROJECT_ROOT/data/source_materials/financial_data"

if [[ -d "$FINANCIAL_SOURCE" ]]; then
    duplicates_count=0
    moved_count=0
    
    find "$FINANCIAL_SOURCE" -type f | while read -r file; do
        filename=$(basename "$file")
        target="$FINANCIAL_TARGET/$filename"
        
        if [[ -f "$target" ]]; then
            # Check if files are identical
            if cmp -s "$file" "$target"; then
                echo "    🔄 Identical file: $filename (removing duplicate)" | tee -a "$LOG_FILE"
                rm "$file"
            else
                echo "    ⚠️  Different file: $filename (keeping both, suffix added)" | tee -a "$LOG_FILE"
                # Add suffix to organized_materials version
                name="${filename%.*}"
                ext="${filename##*.}"
                new_name="${name}_organized.${ext}"
                mv "$file" "$FINANCIAL_TARGET/$new_name"
            fi
            ((duplicates_count++))
        else
            mv "$file" "$target"
            echo "    ✅ Moved: $filename" | tee -a "$LOG_FILE"
            ((moved_count++))
        fi
    done
fi

# Move README from organized_materials if it exists
if [[ -f "$PROJECT_ROOT/data/organized_materials/README.md" ]]; then
    echo "  📄 Moving README to source_materials..." | tee -a "$LOG_FILE"
    mv "$PROJECT_ROOT/data/organized_materials/README.md" "$PROJECT_ROOT/data/source_materials/"
fi

# Remove empty directories from organized_materials
echo "🧹 Cleaning up empty directories..." | tee -a "$LOG_FILE"
find "$PROJECT_ROOT/data/organized_materials" -type d -empty -delete 2>/dev/null || true

# Remove organized_materials if it's empty or only has empty directories
if [[ -d "$PROJECT_ROOT/data/organized_materials" ]]; then
    remaining_files=$(find "$PROJECT_ROOT/data/organized_materials" -type f | wc -l)
    if [[ $remaining_files -eq 0 ]]; then
        echo "  📁 Removing empty organized_materials directory" | tee -a "$LOG_FILE"
        rm -rf "$PROJECT_ROOT/data/organized_materials"
    else
        echo "  ℹ️  organized_materials still has $remaining_files files" | tee -a "$LOG_FILE"
    fi
fi

# Count files after consolidation
echo "" | tee -a "$LOG_FILE"
echo "📊 After consolidation:" | tee -a "$LOG_FILE"
echo "  Total PDF files in source_materials: $(find "$PROJECT_ROOT/data/source_materials" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"

# Show final structure summary
echo "  Directory structure:" | tee -a "$LOG_FILE"
for dir in budgets declarations financial_data reports tenders 2018 2019 2020 2021 2022 2023 2024 2025 general; do
    dir_path="$PROJECT_ROOT/data/source_materials/$dir"
    if [[ -d "$dir_path" ]]; then
        count=$(find "$dir_path" -type f | wc -l)
        echo "    $dir/: $count files" | tee -a "$LOG_FILE"
    fi
done

echo "" | tee -a "$LOG_FILE"
echo "✅ Directory consolidation completed!" | tee -a "$LOG_FILE"
echo "📁 Single unified structure: data/source_materials/" | tee -a "$LOG_FILE"
echo "💾 Backup available at: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "📝 Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"

echo ""
echo "🎉 Consolidation complete! Now you have a single, clean directory structure."