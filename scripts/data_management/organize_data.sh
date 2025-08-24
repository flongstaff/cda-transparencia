#!/bin/bash

# Data Organization Script for Transparency Portal
# This script helps organize data files according to the recommended structure

echo "🔍 Starting data organization process..."

# Create recommended directory structure
echo "📁 Creating directory structure..."
mkdir -p data/source_materials/{declarations,budgets,tenders,salaries,reports,debt,investments,operational_expenses,fees_rights,resolutions,web_archives}

# Function to move files based on keywords
move_files_by_type() {
    local source_dir="$1"
    local target_dir="$2"
    local keywords="$3"
    
    if [ -d "$source_dir" ]; then
        echo "📦 Processing $source_dir for $target_dir..."
        for keyword in $keywords; do
            find "$source_dir" -name "*$keyword*" -type f -exec mv {} "$target_dir/" \; 2>/dev/null
        done
    fi
}

# Organize files by type
echo "📂 Organizing files by type..."

# Move declarations (Property Declarations / DDJJ)
move_files_by_type "data/source_materials" "data/source_materials/declarations" "ddjj DDJJ declaracion Declaracion patrimonio Patrimonio"

# Move budgets
move_files_by_type "data/source_materials" "data/source_materials/budgets" "presupuesto Presupuesto budget Budget ORDENANZA"

# Move tenders/lictitations
move_files_by_type "data/source_materials" "data/source_materials/tenders" "licitacion Licitacion tender Tender LICITACION"

# Move salaries
move_files_by_type "data/source_materials" "data/source_materials/salaries" "sueldo Sueldo salario Salario ESCALA"

# Move reports
move_files_by_type "data/source_materials" "data/source_materials/reports" "informe Informe reporte Reporte estado Estado ejecucion EJECUCION"

# Move debt
move_files_by_type "data/source_materials" "data/source_materials/debt" "deuda Deuda STOCK stock vencimiento Vencimiento"

# Move investments
move_files_by_type "data/source_materials" "data/source_materials/investments" "inversion Inversion activo Activo"

# Move operational expenses
move_files_by_type "data/source_materials" "data/source_materials/operational_expenses" "gasto Gasto operativo Operativo CAIF caif"

# Move fees and rights
move_files_by_type "data/source_materials" "data/source_materials/fees_rights" "tasa Tasa derecho Derecho"

# Move resolutions and ordinances
move_files_by_type "data/source_materials" "data/source_materials/resolutions" "resolucion Resolucion ordenanza Ordenanza disposicion Disposicion"

# Clean up empty year directories
echo "🧹 Cleaning up empty directories..."
find data/source_materials/* -type d -empty -delete 2>/dev/null

# Create README files for each directory
echo "📝 Creating documentation..."

cat > data/source_materials/declarations/README.md << 'EOF'
# Property Declarations (Declaraciones Juradas Patrimoniales)

This directory contains official property declarations from municipal officials.

## File Naming Convention
- DDJJ-{YEAR}-{OFFICIAL_POSITION}.pdf
- Example: DDJJ-2024-Intendente.pdf

## Source
Files in this directory are downloaded from the official municipal transparency portal.
EOF

cat > data/source_materials/budgets/README.md << 'EOF'
# Budget Documents

This directory contains budget-related documents including approved budgets and execution reports.

## File Naming Convention
- PRESUPUESTO-{YEAR}-APROBADO.pdf
- ORDENANZA-{NUMBER}-{YEAR}.pdf

## Source
Files in this directory are downloaded from the official municipal transparency portal.
EOF

cat > data/source_materials/tenders/README.md << 'EOF'
# Public Tenders (Licitaciones Públicas)

This directory contains public tender documents and related information.

## File Naming Convention
- LICITACION-PUBLICA-N{NUMBER}.pdf

## Source
Files in this directory are downloaded from the official municipal transparency portal.
EOF

cat > data/source_materials/salaries/README.md << 'EOF'
# Salaries and Compensation

This directory contains salary scales and compensation information for municipal employees.

## File Naming Convention
- ESCALA-SALARIAL-{MONTH}-{YEAR}.pdf
- SUELDOS-{MONTH}-{YEAR}.pdf

## Source
Files in this directory are downloaded from the official municipal transparency portal.
EOF

cat > data/source_materials/reports/README.md << 'EOF'
# Reports and Studies

This directory contains various reports and analytical studies.

## File Naming Convention
- ESTADO-EJECUCION-{PERIOD}.pdf
- INFORME-{TYPE}-{PERIOD}.pdf

## Source
Files in this directory are downloaded from the official municipal transparency portal.
EOF

cat > data/source_materials/debt/README.md << 'EOF'
# Municipal Debt

This directory contains documents related to municipal debt and financing.

## File Naming Convention
- STOCK-DE-DEUDA-{PERIOD}.pdf
- PERFIL-DE-VENCIMIENTOS-{PERIOD}.pdf

## Source
Files in this directory are downloaded from the official municipal transparency portal.
EOF

echo "✅ Data organization complete!"

echo "
📊 Summary:
- Created organized directory structure
- Moved files to appropriate categories
- Cleaned up empty directories
- Created documentation for each category

📁 Next steps:
1. Review moved files for accuracy
2. Remove any remaining unnecessary files
3. Add web archive snapshots for critical documents
4. Update main README.md with current structure
"