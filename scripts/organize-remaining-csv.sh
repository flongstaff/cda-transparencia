#!/bin/bash

# Organize Remaining CSV Files Script
# Moves remaining unorganized CSV files to appropriate category directories

echo "📦 Organizing Remaining CSV Files"
echo "================================"

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

# Create a function to categorize files based on their names
categorize_file() {
  local filename="$1"
  local lowercase_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]')
  
  # Budget-related files
  if [[ "$lowercase_name" == *"budget"* ]] || [[ "$lowercase_name" == *"presupuesto"* ]] || [[ "$lowercase_name" == *"gasto"* ]] || [[ "$lowercase_name" == *"ejecucion"* ]]; then
    echo "budget"
    return
  fi
  
  # Contracts-related files
  if [[ "$lowercase_name" == *"contract"* ]] || [[ "$lowercase_name" == *"contrato"* ]] || [[ "$lowercase_name" == *"licitacion"* ]] || [[ "$lowercase_name" == *"tender"* ]] || [[ "$lowercase_name" == *"adjudicat"* ]]; then
    echo "contracts"
    return
  fi
  
  # Salaries-related files
  if [[ "$lowercase_name" == *"salary"* ]] || [[ "$lowercase_name" == *"sueldo"* ]] || [[ "$lowercase_name" == *"personal"* ]] || [[ "$lowercase_name" == *"remuneracion"* ]] || [[ "$lowercase_name" == *"empleado"* ]]; then
    echo "salaries"
    return
  fi
  
  # Treasury-related files
  if [[ "$lowercase_name" == *"treasury"* ]] || [[ "$lowercase_name" == *"tesoreria"* ]] || [[ "$lowercase_name" == *"cash"* ]] || [[ "$lowercase_name" == *"flow"* ]] || [[ "$lowercase_name" == *"balance"* ]]; then
    echo "treasury"
    return
  fi
  
  # Debt-related files
  if [[ "$lowercase_name" == *"debt"* ]] || [[ "$lowercase_name" == *"deuda"* ]] || [[ "$lowercase_name" == *"obligation"* ]] || [[ "$lowercase_name" == *"servicio"* ]]; then
    echo "debt"
    return
  fi
  
  # Infrastructure-related files
  if [[ "$lowercase_name" == *"infrastructure"* ]] || [[ "$lowercase_name" == *"infraestructura"* ]] || [[ "$lowercase_name" == *"project"* ]] || [[ "$lowercase_name" == *"obra"* ]]; then
    echo "infrastructure"
    return
  fi
  
  # Education-related files
  if [[ "$lowercase_name" == *"education"* ]] || [[ "$lowercase_name" == *"educacion"* ]] || [[ "$lowercase_name" == *"school"* ]] || [[ "$lowercase_name" == *"escuela"* ]]; then
    echo "education"
    return
  fi
  
  # Health-related files
  if [[ "$lowercase_name" == *"health"* ]] || [[ "$lowercase_name" == *"salud"* ]] || [[ "$lowercase_name" == *"hospital"* ]] || [[ "$lowercase_name" == *"clinica"* ]]; then
    echo "health"
    return
  fi
  
  # Documents-related files
  if [[ "$lowercase_name" == *"document"* ]] || [[ "$lowercase_name" == *"documento"* ]] || [[ "$lowercase_name" == *"report"* ]] || [[ "$lowercase_name" == *"informe"* ]] || [[ "$lowercase_name" == *"file"* ]]; then
    echo "documents"
    return
  fi
  
  # CAIF-related files (Centro de Atención e Integración Familiar)
  if [[ "$lowercase_name" == *"caif"* ]] || [[ "$lowercase_name" == *"atencion"* ]] || [[ "$lowercase_name" == *"integracion"* ]] || [[ "$lowercase_name" == *"familiar"* ]]; then
    echo "caif"
    return
  fi
  
  # Financial reserves-related files
  if [[ "$lowercase_name" == *"reserve"* ]] || [[ "$lowercase_name" == *"reserva"* ]] || [[ "$lowercase_name" == *"financial"* ]]; then
    echo "reserves"
    return
  fi
  
  # Default to documents if no clear category
  echo "documents"
}

# Create category directories if they don't exist
mkdir -p public/data/csv/{budget,contracts,salaries,treasury,debt,infrastructure,education,health,documents,caif,reserves}

# List of remaining unorganized CSV files (from the previous output)
remaining_files=(
  "public/data/csv/Infrastructure_Projects_2021_table_0.csv"
  "public/data/csv/ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-2023-4°TRI_tabula_table_2.csv"
  "public/data/csv/Education_Data_2023_table_0.csv"
  "public/data/csv/estadisticas_index_enhanced.csv"
  "public/data/csv/Personnel_Expenses_2019_table_0.csv"
  "public/data/csv/estadisticas_index_estadisticas_index.csv"
  "public/data/csv/2019_personnel_expenses.csv"
  "public/data/csv/category_caif.csv"
  "public/data/csv/Financial_Reserves_2021_table_0.csv"
  "public/data/csv/2019_balance_demonstration.csv"
)

echo "📁 Found ${#remaining_files[@]} remaining CSV files to organize"

# Process each remaining file
organized_count=0
for file in "${remaining_files[@]}"; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    category=$(categorize_file "$filename")
    
    # Create subdirectories for each category
    mkdir -p "public/data/csv/$category/execution"
    mkdir -p "public/data/csv/$category/historical"
    mkdir -p "public/data/csv/$category/reports"
    
    # Determine subcategory based on filename
    subcategory="execution"
    if [[ "$filename" == *"historical"* ]] || [[ "$filename" == *"index"* ]] || [[ "$filename" == *"summary"* ]]; then
      subcategory="historical"
    elif [[ "$filename" == *"report"* ]] || [[ "$filename" == *"Informe"* ]]; then
      subcategory="reports"
    fi
    
    # Move file to appropriate directory
    destination="public/data/csv/$category/$subcategory/$filename"
    if mv "$file" "$destination" 2>/dev/null; then
      echo "✅ Moved $filename to $category/$subcategory/"
      ((organized_count++))
    else
      echo "❌ Failed to move $filename"
    fi
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "📊 Organization Summary:"
echo "======================"
echo "✅ Organized $organized_count files"
echo "📁 Files are now organized in category directories:"
echo "   - Budget: public/data/csv/budget/"
echo "   - Contracts: public/data/csv/contracts/"
echo "   - Salaries: public/data/csv/salaries/"
echo "   - Treasury: public/data/csv/treasury/"
echo "   - Debt: public/data/csv/debt/"
echo "   - Infrastructure: public/data/csv/infrastructure/"
echo "   - Education: public/data/csv/education/"
echo "   - Health: public/data/csv/health/"
echo "   - Documents: public/data/csv/documents/"
echo "   - CAIF: public/data/csv/caif/"
echo "   - Reserves: public/data/csv/reserves/"

echo ""
echo "🎉 All remaining CSV files have been organized!"
echo "The enhanced directory structure is now complete."