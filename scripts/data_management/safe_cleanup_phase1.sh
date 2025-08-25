#!/bin/bash

# Phase 1: Safe Cleanup - System Files Only
# This script only removes system files that are safe to delete

set -e

echo "🧹 Phase 1: Safe cleanup of system files only..."

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "📂 Working in: $PROJECT_ROOT"

# Create detailed backup log
BACKUP_DIR="$PROJECT_ROOT/backup_phase1_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
LOG_FILE="$PROJECT_ROOT/cleanup_phase1_log.txt"

echo "💾 Backup directory: $BACKUP_DIR" | tee "$LOG_FILE"
echo "📝 Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Count files before cleanup
echo "📊 Before cleanup:" | tee -a "$LOG_FILE"
echo "  Total PDF files: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"
echo "  .DS_Store files: $(find "$PROJECT_ROOT" -name ".DS_Store" | wc -l)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Phase 1: Remove only system files (safest operation)
echo "🗑️  Phase 1: Removing system files..." | tee -a "$LOG_FILE"

# Backup and remove .DS_Store files
if [ "$(find "$PROJECT_ROOT" -name ".DS_Store" | wc -l)" -gt 0 ]; then
    echo "  Backing up .DS_Store files..." | tee -a "$LOG_FILE"
    mkdir -p "$BACKUP_DIR/ds_store_files"
    find "$PROJECT_ROOT" -name ".DS_Store" | while read -r file; do
        rel_path=${file#$PROJECT_ROOT/}
        backup_path="$BACKUP_DIR/ds_store_files/$(dirname "$rel_path")"
        mkdir -p "$backup_path"
        cp "$file" "$backup_path/"
        echo "    Backed up: $rel_path" | tee -a "$LOG_FILE"
    done
    
    echo "  Removing .DS_Store files..." | tee -a "$LOG_FILE"
    find "$PROJECT_ROOT" -name ".DS_Store" -type f -delete
    echo "    ✅ All .DS_Store files removed" | tee -a "$LOG_FILE"
else
    echo "  ℹ️  No .DS_Store files found" | tee -a "$LOG_FILE"
fi

# Remove other system files
echo "  Removing other system files..." | tee -a "$LOG_FILE"
find "$PROJECT_ROOT" -name "Thumbs.db" -type f -delete 2>/dev/null || true
find "$PROJECT_ROOT" -name "desktop.ini" -type f -delete 2>/dev/null || true
find "$PROJECT_ROOT" -name "*.tmp" -type f -delete 2>/dev/null || true
echo "    ✅ System files cleanup completed" | tee -a "$LOG_FILE"

# Count files after Phase 1
echo "" | tee -a "$LOG_FILE"
echo "📊 After Phase 1:" | tee -a "$LOG_FILE"
echo "  Total PDF files: $(find "$PROJECT_ROOT/data" -name "*.pdf" -type f | wc -l)" | tee -a "$LOG_FILE"
echo "  .DS_Store files: $(find "$PROJECT_ROOT" -name ".DS_Store" | wc -l)" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "✅ Phase 1 completed successfully!" | tee -a "$LOG_FILE"
echo "💾 Backup available at: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "📝 Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo ""
echo "🔍 Next: Review the log and run Phase 2 if you're satisfied"