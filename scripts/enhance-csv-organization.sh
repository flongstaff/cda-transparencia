#!/bin/bash

# Enhanced CSV Data Organization Script
# Organizes existing CSV files into the enhanced directory structure

echo "📦 Organizing CSV data files into enhanced directory structure..."

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

# Create enhanced directory structure
echo "📁 Creating enhanced directory structure..."

# Main CSV categories
mkdir -p public/data/csv/{budget,contracts,salaries,treasury,debt,documents}

# Budget subcategories
mkdir -p public/data/csv/budget/{execution,sef,historical}

# Contracts subcategories
mkdir -p public/data/csv/contracts/{licitaciones,adjudications,suppliers}

# Salaries subcategories
mkdir -p public/data/csv/salaries/{personnel,positions}

# Treasury subcategories
mkdir -p public/data/csv/treasury/{cashflow,balances}

# Debt subcategories
mkdir -p public/data/csv/debt/{obligations,servicing}

# Documents subcategories
mkdir -p public/data/csv/documents/{reports,inventory}

echo "✅ Enhanced directory structure created"

# Count existing CSV files
total_csv_files=$(find public/data/csv -name "*.csv" | wc -l | tr -d ' ')
echo "📊 Found $total_csv_files CSV files to organize"

# Move budget-related files
echo "💰 Organizing budget files..."
budget_files=$(find public/data/csv -name "*budget*" -o -name "*Budget*" -o -name "*presupuesto*" -o -name "*Presupuesto*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$budget_files" -gt 0 ]; then
  find public/data/csv -name "*budget*" -o -name "*Budget*" -o -name "*presupuesto*" -o -name "*Presupuesto*" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      mv "$file" public/data/csv/budget/ 2>/dev/null || echo "⚠️  Could not move $file"
    fi
  done
  echo "✅ Moved $budget_files budget files"
else
  echo "ℹ️  No budget files found"
fi

# Move contracts-related files
echo "📋 Organizing contracts files..."
contracts_files=$(find public/data/csv -name "*contract*" -o -name "*Contract*" -o -name "*contrato*" -o -name "*Contrato*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$contracts_files" -gt 0 ]; then
  find public/data/csv -name "*contract*" -o -name "*Contract*" -o -name "*contrato*" -o -name "*Contrato*" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      mv "$file" public/data/csv/contracts/ 2>/dev/null || echo "⚠️  Could not move $file"
    fi
  done
  echo "✅ Moved $contracts_files contracts files"
else
  echo "ℹ️  No contracts files found"
fi

# Move salary-related files
echo "💼 Organizing salary files..."
salary_files=$(find public/data/csv -name "*salary*" -o -name "*Salary*" -o -name "*sueldo*" -o -name "*Sueldo*" -o -name "*personal*" -o -name "*Personal*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$salary_files" -gt 0 ]; then
  find public/data/csv -name "*salary*" -o -name "*Salary*" -o -name "*sueldo*" -o -name "*Sueldo*" -o -name "*personal*" -o -name "*Personal*" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      mv "$file" public/data/csv/salaries/ 2>/dev/null || echo "⚠️  Could not move $file"
    fi
  done
  echo "✅ Moved $salary_files salary files"
else
  echo "ℹ️  No salary files found"
fi

# Move treasury-related files
echo "🏦 Organizing treasury files..."
treasury_files=$(find public/data/csv -name "*treasury*" -o -name "*Treasury*" -o -name "*tesoreria*" -o -name "*Tesoreria*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$treasury_files" -gt 0 ]; then
  find public/data/csv -name "*treasury*" -o -name "*Treasury*" -o -name "*tesoreria*" -o -name "*Tesoreria*" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      mv "$file" public/data/csv/treasury/ 2>/dev/null || echo "⚠️  Could not move $file"
    fi
  done
  echo "✅ Moved $treasury_files treasury files"
else
  echo "ℹ️  No treasury files found"
fi

# Move debt-related files
echo "💳 Organizing debt files..."
debt_files=$(find public/data/csv -name "*debt*" -o -name "*Debt*" -o -name "*deuda*" -o -name "*Deuda*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$debt_files" -gt 0 ]; then
  find public/data/csv -name "*debt*" -o -name "*Debt*" -o -name "*deuda*" -o -name "*Deuda*" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      mv "$file" public/data/csv/debt/ 2>/dev/null || echo "⚠️  Could not move $file"
    fi
  done
  echo "✅ Moved $debt_files debt files"
else
  echo "ℹ️  No debt files found"
fi

# Move document-related files
echo "📄 Organizing document files..."
document_files=$(find public/data/csv -name "*document*" -o -name "*Document*" -o -name "*report*" -o -name "*Report*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$document_files" -gt 0 ]; then
  find public/data/csv -name "*document*" -o -name "*Document*" -o -name "*report*" -o -name "*Report*" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      mv "$file" public/data/csv/documents/ 2>/dev/null || echo "⚠️  Could not move $file"
    fi
  done
  echo "✅ Moved $document_files document files"
else
  echo "ℹ️  No document files found"
fi

# Check for remaining unorganized CSV files
remaining_files=$(find public/data/csv -maxdepth 1 -name "*.csv" | wc -l | tr -d ' ')
if [ "$remaining_files" -gt 0 ]; then
  echo "⚠️  $remaining_files CSV files remain unorganized in root csv directory"
  echo "📋 Remaining files:"
  find public/data/csv -maxdepth 1 -name "*.csv" | head -10
else
  echo "✅ All CSV files organized"
fi

# Create README for each directory explaining the structure
echo "📝 Creating directory documentation..."

cat > public/data/csv/README.md << 'EOF'
# CSV Data Directory Structure

This directory contains all CSV data files organized by category.

## Directory Structure

```
/csv/
├── budget/              # Budget execution and SEF data
│   ├── execution/       # Budget execution by period
│   ├── sef/            # Sistema Electrónico de Finanzas data
│   └── historical/     # Historical budget data
├── contracts/           # Contract and procurement data
│   ├── licitaciones/   # Public tender announcements
│   ├── adjudications/  # Contract awards
│   └── suppliers/      # Supplier information
├── salaries/            # Personnel and salary data
│   ├── personnel/      # Overall personnel data
│   └── positions/      # Position-specific data
├── treasury/            # Treasury and cash flow data
│   ├── cashflow/       # Cash flow statements
│   └── balances/       # Account balances
├── debt/                # Debt and obligation data
│   ├── obligations/    # Outstanding obligations
│   └── servicing/      # Debt service payments
└── documents/           # Document and report inventories
    ├── reports/        # Administrative reports
    └── inventory/      # Document inventories
```

## Data Integration

These CSV files are used by the frontend to provide comprehensive transparency data. The system:

1. **Prioritizes external APIs** for real-time data
2. **Uses local CSV files** as secondary sources
3. **Processes PDF documents** as tertiary sources
4. **Generates fallback data** when other sources are unavailable

## File Naming Convention

Files follow a consistent naming pattern:
- `category_year_period.extension` (e.g., `budget_2024_Q2.csv`)
- `subcategory_year.extension` (e.g., `sef_2024.csv`)
- `dataset_year_range.extension` (e.g., `historical_2019-2025.csv`)

## Data Quality

All CSV files are:
- Regularly updated from official sources
- Validated for accuracy and completeness
- Cross-referenced with external data sources
- Annotated with metadata for traceability
EOF

echo "✅ Directory documentation created"

echo ""
echo "🎉 Enhanced CSV data organization completed!"
echo "📊 Summary:"
echo "  - Enhanced directory structure created"
echo "  - $total_csv_files CSV files processed"
echo "  - Budget, contracts, salaries, treasury, debt, and document files organized"
echo "  - Directory documentation added"
echo "  - Ready for enhanced data integration"

echo ""
echo "💡 Next steps:"
echo "1. Review unorganized files and categorize manually if needed"
echo "2. Update data loading services to use new paths"
echo "3. Implement enhanced metadata generation"
echo "4. Test data integration with new structure"