#!/bin/bash

# Master Processing Script
# This script processes all files in source_materials, generates markdown versions, and moves files

set -e  # Exit on any error

echo "=== CDA Transparency - Master Processing Script ==="
echo ""

# Define directories
PROJECT_ROOT="/Users/flong/Developer/cda-transparencia-old"
SOURCE_DIR="$PROJECT_ROOT/data/source_materials"
MARKDOWN_DIR="$PROJECT_ROOT/data/markdown_documents"
COLD_STORAGE="$PROJECT_ROOT/cold_storage_processed"
REGISTRY_FILE="$PROJECT_ROOT/data/file_registry.json"

# Create directories if they don't exist
mkdir -p "$MARKDOWN_DIR"
mkdir -p "$COLD_STORAGE"

echo "1. Processing all files with ETL pipeline..."
echo "----------------------------------------"
python3 "$PROJECT_ROOT/scripts/master_etl.py" "$SOURCE_DIR" "$REGISTRY_FILE"

echo ""
echo "2. Generating markdown versions of all files..."
echo "---------------------------------------------"
python3 "$PROJECT_ROOT/scripts/convert_data_to_markdown.py"

echo ""
echo "3. Moving processed files to cold storage..."
echo "------------------------------------------"

# Create a timestamped directory for this processing run
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
COLD_STORAGE_RUN="$COLD_STORAGE/run_$TIMESTAMP"
mkdir -p "$COLD_STORAGE_RUN"

# Move all source files to cold storage
echo "Moving files to $COLD_STORAGE_RUN..."
mv "$SOURCE_DIR"/* "$COLD_STORAGE_RUN/" 2>/dev/null || true

# Recreate the source_materials directory for future use
mkdir -p "$SOURCE_DIR"

echo ""
echo "=== Processing Complete ==="
echo "Processed files have been moved to: $COLD_STORAGE_RUN"
echo "Markdown documents are in: $MARKDOWN_DIR"
echo "File registry is at: $REGISTRY_FILE"
echo ""
echo "Next steps:"
echo "1. Verify the data in PostgreSQL database"
echo "2. Review the markdown documents"
echo "3. Check the file registry for any errors"