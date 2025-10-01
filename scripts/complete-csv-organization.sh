#!/bin/bash

# Comprehensive CSV File Organization Script
# Organizes all remaining CSV files in the root csv directory

echo "📦 Comprehensive CSV File Organization"
echo "===================================="

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

# Create category directories if they don't exist
mkdir -p public/data/csv/{budget,contracts,salaries,treasury,debt,infrastructure,education,health,documents,caif,reserves,licitaciones,personnel,revenue,expenses,financial,trends,reports,other}

echo "📁 Created enhanced directory structure"

# Function to categorize files based on their names
categorize_file() {
  local filename="$1"
  local lowercase_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]')
  
  # Budget-related files (highest priority)
  if [[ "$lowercase_name" == *"budget"* ]] || [[ "$lowercase_name" == *"presupuesto"* ]] || [[ "$lowercase_name" == *"gasto"* ]] || [[ "$lowercase_name" == *"ejecucion"* ]] || [[ "$lowercase_name" == *"execution"* ]]; then
    echo "budget"
    return
  fi
  
  # Contracts-related files
  if [[ "$lowercase_name" == *"contract"* ]] || [[ "$lowercase_name" == *"contrato"* ]] || [[ "$lowercase_name" == *"licitacion"* ]] || [[ "$lowercase_name" == *"tender"* ]] || [[ "$lowercase_name" == *"adjudicat"* ]]; then
    echo "contracts"
    return
  fi
  
  # Salaries/Personnel-related files
  if [[ "$lowercase_name" == *"salary"* ]] || [[ "$lowercase_name" == *"sueldo"* ]] || [[ "$lowercase_name" == *"personal"* ]] || [[ "$lowercase_name" == *"remuneracion"* ]] || [[ "$lowercase_name" == *"empleado"* ]] || [[ "$lowercase_name" == *"payroll"* ]] || [[ "$lowercase_name" == *"personnel"* ]]; then
    echo "salaries"
    return
  fi
  
  # Treasury-related files
  if [[ "$lowercase_name" == *"treasury"* ]] || [[ "$lowercase_name" == *"tesoreria"* ]] || [[ "$lowercase_name" == *"cash"* ]] || [[ "$lowercase_name" == *"flow"* ]] || [[ "$lowercase_name" == *"balance"* ]] || [[ "$lowercase_name" == *"revenue"* ]] || [[ "$lowercase_name" == *"ingreso"* ]]; then
    echo "treasury"
    return
  fi
  
  # Debt-related files
  if [[ "$lowercase_name" == *"debt"* ]] || [[ "$lowercase_name" == *"deuda"* ]] || [[ "$lowercase_name" == *"obligation"* ]] || [[ "$lowercase_name" == *"servicio"* ]] || [[ "$lowercase_name" == *"loan"* ]]; then
    echo "debt"
    return
  fi
  
  # Infrastructure-related files
  if [[ "$lowercase_name" == *"infrastructure"* ]] || [[ "$lowercase_name" == *"infraestructura"* ]] || [[ "$lowercase_name" == *"project"* ]] || [[ "$lowercase_name" == *"obra"* ]] || [[ "$lowercase_name" == *"construction"* ]]; then
    echo "infrastructure"
    return
  fi
  
  # Education-related files
  if [[ "$lowercase_name" == *"education"* ]] || [[ "$lowercase_name" == *"educacion"* ]] || [[ "$lowercase_name" == *"school"* ]] || [[ "$lowercase_name" == *"escuela"* ]] || [[ "$lowercase_name" == *"academic"* ]]; then
    echo "education"
    return
  fi
  
  # Health-related files
  if [[ "$lowercase_name" == *"health"* ]] || [[ "$lowercase_name" == *"salud"* ]] || [[ "$lowercase_name" == *"hospital"* ]] || [[ "$lowercase_name" == *"clinica"* ]] || [[ "$lowercase_name" == *"medical"* ]]; then
    echo "health"
    return
  fi
  
  # CAIF-related files (Centro de Atención e Integración Familiar)
  if [[ "$lowercase_name" == *"caif"* ]] || [[ "$lowercase_name" == *"atencion"* ]] || [[ "$lowercase_name" == *"integracion"* ]] || [[ "$lowercase_name" == *"familiar"* ]] || [[ "$lowercase_name" == *"family"* ]]; then
    echo "caif"
    return
  fi
  
  # Financial reserves-related files
  if [[ "$lowercase_name" == *"reserve"* ]] || [[ "$lowercase_name" == *"reserva"* ]] || [[ "$lowercase_name" == *"financial"* ]] || [[ "$lowercase_name" == *"financiero"* ]]; then
    echo "reserves"
    return
  fi
  
  # Licitaciones-related files
  if [[ "$lowercase_name" == *"licitacion"* ]] || [[ "$lowercase_name" == *"tender"* ]] || [[ "$lowercase_name" == *"procurement"* ]]; then
    echo "licitaciones"
    return
  fi
  
  # Revenue-related files
  if [[ "$lowercase_name" == *"revenue"* ]] || [[ "$lowercase_name" == *"ingreso"* ]] || [[ "$lowercase_name" == *"income"* ]]; then
    echo "revenue"
    return
  fi
  
  # Expenses-related files
  if [[ "$lowercase_name" == *"expense"* ]] || [[ "$lowercase_name" == *"gasto"* ]] || [[ "$lowercase_name" == *"cost"* ]]; then
    echo "expenses"
    return
  fi
  
  # Reports-related files
  if [[ "$lowercase_name" == *"report"* ]] || [[ "$lowercase_name" == *"informe"* ]] || [[ "$lowercase_name" == *"summary"* ]] || [[ "$lowercase_name" == *"resumen"* ]]; then
    echo "reports"
    return
  fi
  
  # Trends-related files
  if [[ "$lowercase_name" == *"trend"* ]] || [[ "$lowercase_name" == *"tendencia"* ]] || [[ "$lowercase_name" == *"analysis"* ]] || [[ "$lowercase_name" == *"analisis"* ]]; then
    echo "trends"
    return
  fi
  
  # Default to documents if no clear category
  echo "documents"
}

# Count total files to organize
total_files=$(find public/data/csv/ -maxdepth 1 -name "*.csv" | wc -l | tr -d ' ')
echo "📊 Found $total_files CSV files to organize"

# Process each CSV file in the root csv directory
organized_count=0
failed_count=0

find public/data/csv/ -maxdepth 1 -name "*.csv" | while read file; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    category=$(categorize_file "$filename")
    
    # Create subdirectories for each category
    mkdir -p "public/data/csv/$category/execution"
    mkdir -p "public/data/csv/$category/historical"
    mkdir -p "public/data/csv/$category/reports"
    
    # Determine subcategory based on filename
    subcategory="execution"
    if [[ "$filename" == *"historical"* ]] || [[ "$filename" == *"index"* ]] || [[ "$filename" == *"summary"* ]] || [[ "$filename" == *"resumen"* ]]; then
      subcategory="historical"
    elif [[ "$filename" == *"report"* ]] || [[ "$filename" == *"Informe"* ]] || [[ "$filename" == *"summary"* ]]; then
      subcategory="reports"
    fi
    
    # Move file to appropriate directory
    destination="public/data/csv/$category/$subcategory/$filename"
    if mv "$file" "$destination" 2>/dev/null; then
      echo "✅ Moved $filename to $category/$subcategory/"
      ((organized_count++))
    else
      echo "❌ Failed to move $filename"
      ((failed_count++))
    fi
  fi
done

echo ""
echo "📊 Organization Summary:"
echo "======================"
echo "✅ Organized $organized_count files"
echo "❌ Failed to organize $failed_count files"
echo ""
echo "📁 Files are now organized in enhanced category directories:"
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
echo "   - Licitaciones: public/data/csv/licitaciones/"
echo "   - Personnel: public/data/csv/personnel/"
echo "   - Revenue: public/data/csv/revenue/"
echo "   - Expenses: public/data/csv/expenses/"
echo "   - Financial: public/data/csv/financial/"
echo "   - Trends: public/data/csv/trends/"
echo "   - Reports: public/data/csv/reports/"
echo "   - Other: public/data/csv/other/"

echo ""
echo "🎉 Enhanced CSV file organization completed!"
echo "The comprehensive directory structure is now complete."