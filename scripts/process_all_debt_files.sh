#!/bin/bash

# Process all municipal debt Excel files for a given year
# Usage: ./process_all_debt_files.sh <year>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <year>"
    echo "Example: $0 2024"
    exit 1
fi

YEAR=$1
DATA_DIR="data/source_materials/$YEAR"
SCRIPT_PATH="backend/src/etl_scripts/extract_municipal_debt.py"

echo "Processing all municipal debt files for year $YEAR"

# Find all Excel files related to municipal debt
find "$DATA_DIR" -name "*STOCK-DE-DEUDA*" -name "*.xlsx" | while read file; do
    echo "--------------------------------------------------"
    echo "Processing file: $file"
    python3 "$SCRIPT_PATH" "$file" municipal_debt "$YEAR"
    echo ""
done

echo "Finished processing all municipal debt files for year $YEAR"