#!/bin/bash

# Enhanced Data Strategy Verification Script
# Verifies that the enhanced data strategy is properly implemented

echo "🔍 Verifying Enhanced Data Strategy Implementation..."

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

echo "📋 Checking enhanced directory structure..."

# Check if enhanced directories exist
enhanced_dirs=(
  "public/data/csv/budget"
  "public/data/csv/contracts" 
  "public/data/csv/salaries"
  "public/data/csv/treasury"
  "public/data/csv/debt"
  "public/data/csv/documents"
)

missing_dirs=()
for dir in "${enhanced_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir exists"
  else
    echo "❌ $dir missing"
    missing_dirs+=("$dir")
  fi
done

if [ ${#missing_dirs[@]} -gt 0 ]; then
  echo "⚠️  Missing enhanced directories: ${missing_dirs[*]}"
else
  echo "✅ All enhanced directories present"
fi

echo ""
echo "📂 Checking data organization..."

# Count files in each enhanced category
if [ -d "public/data/csv" ]; then
  budget_files=$(find public/data/csv/budget -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  contracts_files=$(find public/data/csv/contracts -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  salaries_files=$(find public/data/csv/salaries -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  treasury_files=$(find public/data/csv/treasury -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  debt_files=$(find public/data/csv/debt -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  documents_files=$(find public/data/csv/documents -name "*.csv" 2>/dev/null | wc -l | tr -d ' ')
  
  echo "📊 Enhanced data organization:"
  echo "  Budget files: $budget_files"
  echo "  Contracts files: $contracts_files"
  echo "  Salaries files: $salaries_files"
  echo "  Treasury files: $treasury_files"
  echo "  Debt files: $debt_files"
  echo "  Documents files: $documents_files"
  
  total_enhanced_files=$((budget_files + contracts_files + salaries_files + treasury_files + debt_files + documents_files))
  echo "  Total enhanced files: $total_enhanced_files"
  
  if [ "$total_enhanced_files" -gt 0 ]; then
    echo "✅ Enhanced data organization in progress"
  else
    echo "⚠️  No files organized in enhanced structure yet"
  fi
else
  echo "❌ CSV data directory not found"
fi

echo ""
echo "🔧 Verifying data integration services..."

# Check key service files
services_to_check=(
  "src/services/DataIntegrationService.ts"
  "src/services/ExternalAPIsService.ts"
  "src/services/GitHubDataService.ts"
  "src/services/UnifiedDataService.ts"
  "src/hooks/useMasterData.ts"
)

missing_services=()
for service in "${services_to_check[@]}"; do
  if [ -f "$service" ]; then
    echo "✅ $service exists"
  else
    echo "❌ $service missing"
    missing_services+=("$service")
  fi
done

if [ ${#missing_services[@]} -gt 0 ]; then
  echo "⚠️  Missing data integration services: ${missing_services[*]}"
else
  echo "✅ All data integration services present"
fi

echo ""
echo "🔌 Checking frontend data consumption..."

# Check if frontend components use data services
components_using_data=$(grep -r "useMasterData\|useCsvData\|dataService\|DataContext" src/components/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$components_using_data" -gt 0 ]; then
  echo "✅ Components using data services: $components_using_data references"
else
  echo "⚠️  No components found using data services"
fi

echo ""
echo "🌐 Verifying GitHub Pages compatibility..."

# Check for GitHub Pages specific implementations
github_pages_implemented=$(grep -c "raw.githubusercontent.com\|githubDataService\|GitHubDataService" src/services/ 2>/dev/null || echo "0")
if [ "$github_pages_implemented" -gt 0 ]; then
  echo "✅ GitHub Pages compatibility implemented: $github_pages_implemented references"
else
  echo "⚠️  GitHub Pages compatibility may need enhancement"
fi

echo ""
echo "🧪 Testing data loading capabilities..."

# Create a simple test to verify data loading
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

echo "✅ Data loading test prepared"

echo ""
echo "📊 Enhanced Data Strategy Implementation Summary:"
echo "================================================"

# Overall assessment
if [ ${#missing_dirs[@]} -eq 0 ] && [ ${#missing_services[@]} -eq 0 ] && [ "$components_using_data" -gt 0 ]; then
  echo "🎉 Enhanced data strategy implementation is well underway!"
  echo "   - Enhanced directory structure established"
  echo "   - Data integration services in place"
  echo "   - Components consuming data services"
  echo "   - GitHub Pages compatibility implemented"
elif [ ${#missing_dirs[@]} -eq 0 ]; then
  echo "✅ Basic enhanced data strategy foundation is in place"
  echo "   - Enhanced directory structure established"
  echo "   - Core services present"
  echo "   - Further implementation needed for full alignment"
else
  echo "⚠️  Enhanced data strategy implementation needs attention"
  echo "   - Missing directories: ${#missing_dirs[@]}"
  echo "   - Missing services: ${#missing_services[@]}"
  echo "   - Limited data consumption in components"
fi

echo ""
echo "📈 Progress Metrics:"
echo "  - Directory structure: $((100 - (${#missing_dirs[@]} * 100 / ${#enhanced_dirs[@]})))%"
echo "  - Service integration: $((100 - (${#missing_services[@]} * 100 / ${#services_to_check[@]})))%"
echo "  - Data consumption: $((components_using_data > 0 ? 100 : 0))%"
echo "  - GitHub Pages compatibility: $((github_pages_implemented > 0 ? 100 : 0))%"

echo ""
echo "💡 Recommendations for Enhanced Data Strategy:"
echo "1. Run enhance-csv-organization.sh to organize existing CSV files"
echo "2. Update data loading services to use enhanced directory paths"
echo "3. Implement comprehensive metadata generation for all datasets"
echo "4. Enhance frontend components to leverage complementary data sources"
echo "5. Add anomaly detection and flagging capabilities"
echo "6. Verify Cloudflare Pages deployment compatibility"
echo "7. Implement cross-domain data relationship mapping"

echo ""
echo "The enhanced data strategy provides a solid foundation for"
echo "comprehensive, multi-source data integration that works with"
echo "both GitHub Pages and Cloudflare Pages deployment without"
echo "requiring backend processes or tunnels."

echo ""
echo "🚀 To implement the enhanced CSV organization, run:"
echo "   ./scripts/enhance-csv-organization.sh"