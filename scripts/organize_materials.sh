#!/bin/bash

# Script to organize source materials
# This script will help gather all relevant files and create a structured inventory

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "Organizing source materials in $PROJECT_ROOT..."

# Create a directory for organized materials
mkdir -p "$PROJECT_ROOT/data/organized_materials"

# Create subdirectories for different types of materials
mkdir -p "$PROJECT_ROOT/data/organized_materials/reports"
mkdir -p "$PROJECT_ROOT/data/organized_materials/declarations"
mkdir -p "$PROJECT_ROOT/data/organized_materials/financial_data"
mkdir -p "$PROJECT_ROOT/data/organized_materials/tenders"
mkdir -p "$PROJECT_ROOT/data/organized_materials/budgets"

# Move main reports
if [ -f "$PROJECT_ROOT/data/source_materials/Reporte Completo.md" ]; then
  cp "$PROJECT_ROOT/data/source_materials/Reporte Completo.md" "$PROJECT_ROOT/data/organized_materials/reports/"
  echo "Copied Reporte Completo.md"
fi

if [ -f "$PROJECT_ROOT/data/source_materials/Reporte Completo.pdf" ]; then
  cp "$PROJECT_ROOT/data/source_materials/Reporte Completo.pdf" "$PROJECT_ROOT/data/organized_materials/reports/"
  echo "Copied Reporte Completo.pdf"
fi

if [ -f "$PROJECT_ROOT/data/source_materials/Informe.pdf" ]; then
  cp "$PROJECT_ROOT/data/source_materials/Informe.pdf" "$PROJECT_ROOT/data/organized_materials/reports/"
  echo "Copied Informe.pdf"
fi

# Move yearly financial reports from all years
for year in 2020 2021 2022 2023 2024 2025; do
  if [ -d "$PROJECT_ROOT/data/source_materials/$year" ]; then
    cp "$PROJECT_ROOT/data/source_materials/$year"/*.pdf "$PROJECT_ROOT/data/organized_materials/financial_data/" 2>/dev/null || echo "No PDF files found in $year"
  fi
done

# Move declaration documents
if [ -d "$PROJECT_ROOT/data/source_materials/2018" ]; then
  cp "$PROJECT_ROOT/data/source_materials/2018"/ddjj*.pdf "$PROJECT_ROOT/data/organized_materials/declarations/" 2>/dev/null || echo "No declaration documents found"
fi

# Move budget documents
if [ -f "$PROJECT_ROOT/data/source_materials/2020/PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf" ]; then
  cp "$PROJECT_ROOT/data/source_materials/2020/PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf" "$PROJECT_ROOT/data/organized_materials/budgets/"
  echo "Copied budget document"
fi

# Move tender documents
find "$PROJECT_ROOT/data/source_materials" -name "*licitacion*" -o -name "*LICITACION*" | head -20 | xargs -I {} cp {} "$PROJECT_ROOT/data/organized_materials/tenders/" 2>/dev/null || echo "No tender documents found"

# Create a README with the organization structure
cat > "$PROJECT_ROOT/data/organized_materials/README.md" << EOF
# Organized Source Materials

This directory contains the source materials organized by type:

## Directories

- \`reports/\` - Main analysis reports
- \`declarations/\` - Property declarations (Declaraciones Juradas Patrimoniales)
- \`financial_data/\` - Financial reports and data
- \`tenders/\` - Public tender documents
- \`budgets/\` - Budget documents

## Files

- \`reports/Reporte Completo.md\` - Main comprehensive analysis report
- \`reports/Reporte Completo.pdf\` - PDF version of main report
- \`reports/Informe.pdf\` - Additional report

EOF

echo "Source materials organization complete!"
echo "Check $PROJECT_ROOT/data/organized_materials for organized files."