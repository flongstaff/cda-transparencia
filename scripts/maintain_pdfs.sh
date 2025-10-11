#!/bin/bash
# PDF Maintenance Script
# This script should be run periodically to maintain the optimized PDF structure

echo "Starting PDF maintenance..."

# Run deduplication and organization
echo "1. Running PDF deduplication..."
python3 /Users/flong/Developer/cda-transparencia/pdf_optimization_manager.py deduplicate

# Create backup
echo "2. Creating PDF backup..."
python3 /Users/flong/Developer/cda-transparencia/pdf_optimization_manager.py backup

# Clean up old backups (keep only 5 most recent)
echo "3. Cleaning up old backups..."
python3 /Users/flong/Developer/cda-transparencia/pdf_optimization_manager.py cleanup

echo "PDF maintenance completed!"