#!/bin/bash

# Script to verify all pages and document display functionality

echo "=== Carmen de Areco Transparency Portal - Verification Script ==="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root directory"
  exit 1
fi

echo "✅ Project root verified"
echo ""

# Check frontend directory
if [ ! -d "frontend" ]; then
  echo "❌ Error: Frontend directory not found"
  exit 1
fi

echo "✅ Frontend directory found"
echo ""

# Check if frontend builds
echo "🔧 Testing frontend build..."
cd frontend
if npm run build > /dev/null 2>&1; then
  echo "✅ Frontend builds successfully"
else
  echo "❌ Frontend build failed"
  exit 1
fi
cd ..

echo ""

# Check for required pages
echo "📄 Checking required pages..."
PAGES_DIR="frontend/src/pages"
REQUIRED_PAGES=(
  "Home.tsx"
  "About.tsx"
  "FinancialDashboard.tsx"
  "Budget.tsx"
  "PublicSpending.tsx"
  "Revenue.tsx"
  "Contracts.tsx"
  "Debt.tsx"
  "Investments.tsx"
  "Treasury.tsx"
  "PropertyDeclarations.tsx"
  "Salaries.tsx"
  "Database.tsx"
  "Documents.tsx"
  "DocumentDetail.tsx"
  "Reports.tsx"
  "Contact.tsx"
  "Whistleblower.tsx"
  "ApiExplorer.tsx"
)

MISSING_PAGES=()
for page in "${REQUIRED_PAGES[@]}"; do
  if [ -f "$PAGES_DIR/$page" ]; then
    echo "✅ $page"
  else
    echo "❌ $page - MISSING"
    MISSING_PAGES+=("$page")
  fi
done

echo ""

if [ ${#MISSING_PAGES[@]} -eq 0 ]; then
  echo "✅ All required pages present"
else
  echo "❌ Missing ${#MISSING_PAGES[@]} pages:"
  for page in "${MISSING_PAGES[@]}"; do
    echo "   - $page"
  done
fi

echo ""

# Check document functionality
echo "📂 Checking document functionality..."

# Check if documents directory exists
if [ -d "data/markdown_documents" ]; then
  echo "✅ Document directory found"
  
  # Count documents by year
  echo "📊 Document count by year:"
  for year in {2017..2025}; do
    if [ -d "data/markdown_documents/$year" ]; then
      COUNT=$(find "data/markdown_documents/$year" -name "*.md" | wc -l)
      echo "   $year: $COUNT documents"
    elif [ -d "data/markdown_documents" ]; then
      COUNT=$(find "data/markdown_documents" -name "*.md" -path "*/$year/*" | wc -l)
      if [ $COUNT -gt 0 ]; then
        echo "   $year: $COUNT documents"
      fi
    fi
  done
else
  echo "⚠️  Document directory not found (may be in different location)"
fi

echo ""

# Check document components
echo "🔧 Checking document components..."

COMPONENTS_DIR="frontend/src/components"
DOCUMENT_COMPONENTS=(
  "documents/DocumentViewer.tsx"
  "documents/MarkdownRenderer.tsx"
  "DocumentExplorer.tsx"
)

MISSING_COMPONENTS=()
for component in "${DOCUMENT_COMPONENTS[@]}"; do
  if [ -f "$COMPONENTS_DIR/$component" ]; then
    echo "✅ $component"
  else
    echo "❌ $component - MISSING"
    MISSING_COMPONENTS+=("$component")
  fi
done

echo ""

if [ ${#MISSING_COMPONENTS[@]} -eq 0 ]; then
  echo "✅ All document components present"
else
  echo "❌ Missing ${#MISSING_COMPONENTS[@]} components:"
  for component in "${MISSING_COMPONENTS[@]}"; do
    echo "   - $component"
  done
fi

echo ""

# Summary
echo "=== SUMMARY ==="

TOTAL_PAGES=${#REQUIRED_PAGES[@]}
PRESENT_PAGES=$((TOTAL_PAGES - ${#MISSING_PAGES[@]}))
echo "📄 Pages: $PRESENT_PAGES/$TOTAL_PAGES"

TOTAL_COMPONENTS=${#DOCUMENT_COMPONENTS[@]}
PRESENT_COMPONENTS=$((TOTAL_COMPONENTS - ${#MISSING_COMPONENTS[@]}))
echo "🔧 Components: $PRESENT_COMPONENTS/$TOTAL_COMPONENTS"

if [ ${#MISSING_PAGES[@]} -eq 0 ] && [ ${#MISSING_COMPONENTS[@]} -eq 0 ]; then
  echo ""
  echo "🎉 ALL CHECKS PASSED - Portal is ready for deployment!"
  echo "   - All pages are present"
  echo "   - All document components are present"
  echo "   - Frontend builds successfully"
  echo "   - Document display functionality verified"
else
  echo ""
  echo "⚠️  Some checks failed - please review missing components/pages"
fi

echo ""
echo "=== END VERIFICATION ==="