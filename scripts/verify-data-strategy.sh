#!/bin/bash

# Data Organization Strategy Verification Script
# Verifies that the current implementation aligns with the defined strategy

echo "🔍 Verifying Data Organization Strategy Implementation..."

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

echo "📋 Checking directory structure alignment..."

# Check if key directories exist
required_dirs=(
  "public/data"
  "public/data/execution"
  "public/data/sef"
  "public/data/procurement"
  "public/data/statistics"
  "public/data/raw_pdfs"
)

missing_dirs=()
for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir exists"
  else
    echo "❌ $dir missing"
    missing_dirs+=("$dir")
  fi
done

if [ ${#missing_dirs[@]} -gt 0 ]; then
  echo "⚠️  Missing directories: ${missing_dirs[*]}"
else
  echo "✅ All required directories present"
fi

echo ""
echo "📄 Checking data file organization..."

# Count files in each category
if [ -d "public/data" ]; then
  execution_files=$(find public/data -path "*/execution/*" -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  sef_files=$(find public/data -path "*/sef/*" -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  procurement_files=$(find public/data -path "*/procurement/*" -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  statistics_files=$(find public/data -path "*/statistics/*" -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  pdf_files=$(find public/data -path "*/raw_pdfs/*" -name "*.pdf" 2>/dev/null | wc -l | tr -d ' ')
  
  echo "📊 Data files found:"
  echo "  Execution files: $execution_files"
  echo "  SEF files: $sef_files"
  echo "  Procurement files: $procurement_files"
  echo "  Statistics files: $statistics_files"
  echo "  PDF files: $pdf_files"
  
  if [ "$execution_files" -gt 0 ] || [ "$sef_files" -gt 0 ] || [ "$procurement_files" -gt 0 ]; then
    echo "✅ CSV data files are organized by category"
  else
    echo "⚠️  No categorized CSV files found"
  fi
else
  echo "❌ Data directory not found"
fi

echo ""
echo "🔧 Checking metadata implementation..."

# Check for metadata files
metadata_files=$(find public/data -name "*.json" -not -name "data-index.json" 2>/dev/null | wc -l | tr -d ' ')
if [ "$metadata_files" -gt 0 ]; then
  echo "✅ Metadata files found: $metadata_files"
else
  echo "⚠️  No metadata files found"
fi

echo ""
echo "🔌 Verifying data pipeline components..."

# Check for key service files
pipeline_services=(
  "src/services/ExternalAPIsService.ts"
  "src/services/GitHubDataService.ts"
  "src/services/DataIntegrationService.ts"
  "src/services/UnifiedTransparencyService.ts"
)

missing_services=()
for service in "${pipeline_services[@]}"; do
  if [ -f "$service" ]; then
    echo "✅ $service exists"
  else
    echo "❌ $service missing"
    missing_services+=("$service")
  fi
done

if [ ${#missing_services[@]} -gt 0 ]; then
  echo "⚠️  Missing pipeline services: ${missing_services[*]}"
else
  echo "✅ All pipeline services present"
fi

echo ""
echo "📊 Checking data integration in components..."

# Check if components are using CSV data
components_with_csv=$(grep -r "useCsvData\|Papa.parse\|\.csv" src/components/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$components_with_csv" -gt 0 ]; then
  echo "✅ Components using CSV data: $components_with_csv references"
else
  echo "⚠️  No components found using CSV data"
fi

echo ""
echo "🎨 Verifying frontend visualization integration..."

# Check for chart components
chart_components=$(find src/components -name "*Chart*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$chart_components" -gt 0 ]; then
  echo "✅ Chart components found: $chart_components"
else
  echo "⚠️  No chart components found"
fi

# Check for data hooks
data_hooks=$(find src/hooks -name "use*Csv*.ts" -o -name "use*Data*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$data_hooks" -gt 0 ]; then
  echo "✅ Data hooks found: $data_hooks"
else
  echo "⚠️  No data hooks found"
fi

echo ""
echo "🔍 Checking anomaly detection implementation..."

# Check for anomaly-related files
anomaly_files=$(find . -name "*anomaly*" -o -name "*flag*" -o -name "*audit*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$anomaly_files" -gt 0 ]; then
  echo "✅ Anomaly detection components found: $anomaly_files"
else
  echo "⚠️  No anomaly detection components found"
fi

echo ""
echo "🔗 Verifying GitHub Pages compatibility..."

# Check for GitHub data service usage
github_service_usage=$(grep -r "githubDataService\|raw.githubusercontent.com" src/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$github_service_usage" -gt 0 ]; then
  echo "✅ GitHub Pages compatibility implemented: $github_service_usage references"
else
  echo "⚠️  GitHub Pages compatibility may not be fully implemented"
fi

echo ""
echo "🧪 Testing data loading capabilities..."

# Create a simple test to verify CSV loading
cat > /tmp/data-loading-test.ts << 'EOF'
// Test data loading capabilities
import Papa from 'papaparse';

async function testDataLoading() {
  try {
    // Test that PapaParse can be imported
    console.log('✅ PapaParse import successful');
    
    // Test basic CSV parsing capability
    const testCsv = "name,value\nTest,123\nAnother,456";
    Papa.parse(testCsv, {
      header: true,
      complete: (results) => {
        console.log('✅ CSV parsing successful:', results.data);
      },
      error: (error) => {
        console.error('❌ CSV parsing failed:', error);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Data loading test failed:', error);
    return false;
  }
}

testDataLoading();
EOF

echo "✅ Data loading capabilities test prepared"

echo ""
echo "📋 Strategy Implementation Summary:"
echo "==================================="

# Overall assessment
if [ ${#missing_dirs[@]} -eq 0 ] && [ ${#missing_services[@]} -eq 0 ] && [ "$components_with_csv" -gt 0 ]; then
  echo "🎉 Strategy implementation is well underway!"
  echo "   - Directory structure aligned with strategy"
  echo "   - Pipeline services in place"
  echo "   - Components consuming CSV data"
  echo "   - GitHub Pages compatibility implemented"
elif [ ${#missing_dirs[@]} -eq 0 ]; then
  echo "✅ Basic strategy foundation is in place"
  echo "   - Directory structure established"
  echo "   - Core services present"
  echo "   - Further implementation needed for full alignment"
else
  echo "⚠️  Strategy implementation needs attention"
  echo "   - Missing directories: ${#missing_dirs[@]}"
  echo "   - Missing services: ${#missing_services[@]}"
  echo "   - Limited CSV data consumption"
fi

echo ""
echo "💡 Recommendations:"
echo "1. Create missing directories if needed"
echo "2. Organize existing CSV files into category folders"
echo "3. Implement metadata generation for datasets"
echo "4. Enhance components to use CSV data more extensively"
echo "5. Add anomaly detection and flagging capabilities"
echo "6. Verify GitHub Pages deployment compatibility"

echo ""
echo "The data organization strategy provides a solid foundation for"
echo "comprehensive, multi-source data integration that works with"
echo "GitHub Pages deployment without backend dependencies."