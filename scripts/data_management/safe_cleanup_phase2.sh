#!/bin/bash

# Phase 2: Safe Cleanup - Clear Duplicates
# This script removes obvious duplicates (numbered files and 'copia' files)

set -e

echo "🧹 Phase 2: Safe cleanup of obvious duplicates..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "📂 Working in: $PROJECT_ROOT"

# Create backup directory
BACKUP_DIR="$PROJECT_ROOT/backup_phase2_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
LOG_FILE="$PROJECT_ROOT/cleanup_phase2_log.txt"

echo "💾 Backup directory: $BACKUP_DIR" | tee "$LOG_FILE"
echo "📝 Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Count files before cleanup
echo "📊 Before Phase 2:" | tee -a "$LOG_FILE"
echo "  Total PDF files: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"
echo "  Files with _1, _2, etc: $(find "$PROJECT_ROOT/data" -name "*_[0-9].pdf" -o -name "*_[0-9][0-9].pdf" | wc -l)" | tee -a "$LOG_FILE"
echo "  Files with 'copia': $(find "$PROJECT_ROOT/data" -name "*copia*.pdf" | wc -l)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to safely move duplicates to backup
move_to_backup() {
    local pattern="$1"
    local description="$2"
    
    echo "🗂️  Processing: $description" | tee -a "$LOG_FILE"
    
    find "$PROJECT_ROOT/data" -name "$pattern" -type f | while read -r file; do
        if [[ -f "$file" ]]; then
            # Create relative path for backup structure
            rel_path=${file#$PROJECT_ROOT/}
            backup_path="$BACKUP_DIR/$(dirname "$rel_path")"
            mkdir -p "$backup_path"
            
            # Move file to backup
            mv "$file" "$backup_path/"
            echo "  📁 Moved: $rel_path" | tee -a "$LOG_FILE"
        fi
    done
}

# Phase 2a: Remove numbered duplicates
echo "🗂️  Phase 2a: Moving numbered duplicates to backup..." | tee -a "$LOG_FILE"
move_to_backup "*_1.pdf" "Files ending with _1.pdf"
move_to_backup "*_[2-9].pdf" "Files ending with _2.pdf through _9.pdf"
move_to_backup "*_1[0-9].pdf" "Files ending with _10.pdf through _19.pdf"

# Phase 2b: Remove 'copia' files
echo "🗂️  Phase 2b: Moving 'copia' files to backup..." | tee -a "$LOG_FILE"
move_to_backup "*copia*.pdf" "Files containing 'copia'"
move_to_backup "*-copia.pdf" "Files ending with -copia.pdf"

# Phase 2c: Clean up empty directories
echo "🗂️  Phase 2c: Removing empty directories..." | tee -a "$LOG_FILE"
find "$PROJECT_ROOT/data" -type d -empty -delete 2>/dev/null || true
echo "  ✅ Empty directories removed" | tee -a "$LOG_FILE"

# Count files after Phase 2
echo "" | tee -a "$LOG_FILE"
echo "📊 After Phase 2:" | tee -a "$LOG_FILE"
echo "  Total PDF files: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"
echo "  Files with _1, _2, etc: $(find "$PROJECT_ROOT/data" -name "*_[0-9].pdf" -o -name "*_[0-9][0-9].pdf" | wc -l)" | tee -a "$LOG_FILE"
echo "  Files with 'copia': $(find "$PROJECT_ROOT/data" -name "*copia*.pdf" | wc -l)" | tee -a "$LOG_FILE"
echo "  Files moved to backup: $(find "$BACKUP_DIR" -name "*.pdf" | wc -l)" | tee -a "$LOG_FILE"

# Show space saved
if command -v du > /dev/null; then
    backup_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "Unknown")
    echo "  Space reclaimed: $backup_size" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "✅ Phase 2 completed successfully!" | tee -a "$LOG_FILE"
echo "💾 Backup available at: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "📝 Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo ""
echo "🔍 Next: Review the results and run Phase 3 for organization"
echo "⚠️  Important: Keep the backup until you're sure everything is working correctly"