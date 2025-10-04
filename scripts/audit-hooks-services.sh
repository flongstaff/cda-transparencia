#!/bin/bash

echo "=== COMPREHENSIVE HOOKS & SERVICES AUDIT ==="
echo ""

# Check all pages for hook usage
echo "📄 PAGES HOOK USAGE:"
echo "===================="
for file in frontend/src/pages/*.tsx; do
    filename=$(basename "$file")
    hooks=$(grep -o "use[A-Z][a-zA-Z]*" "$file" 2>/dev/null | sort -u | tr '\n' ', ' || echo "none")
    echo "$filename: $hooks"
done

echo ""
echo "📊 CHART COMPONENTS SERVICE USAGE:"
echo "==================================="
for file in frontend/src/components/charts/*.tsx; do
    filename=$(basename "$file")
    # Check for service imports
    services=$(grep -E "from.*services.*|import.*Service" "$file" 2>/dev/null | head -3 | cut -d"'" -f2 || echo "")
    # Check for hook usage
    hooks=$(grep -o "use[A-Z][a-zA-Z]*" "$file" 2>/dev/null | head -3 | sort -u | tr '\n' ', ' || echo "")
    if [ ! -z "$services" ] || [ ! -z "$hooks" ]; then
        echo "$filename:"
        [ ! -z "$services" ] && echo "  Services: $services"
        [ ! -z "$hooks" ] && echo "  Hooks: $hooks"
    fi
done

echo ""
echo "🔗 YEAR PROP PROPAGATION:"
echo "========================="
grep -r "year={" frontend/src/pages/*.tsx 2>/dev/null | wc -l | xargs echo "Total year props passed in pages:"
grep -r "year:" frontend/src/components/charts/*.tsx 2>/dev/null | wc -l | xargs echo "Total year props accepted in charts:"

echo ""
echo "✅ UNIFIED DATA SERVICE USAGE:"
echo "=============================="
grep -r "useUnifiedData\|UnifiedDataService" frontend/src/pages/*.tsx 2>/dev/null | wc -l | xargs echo "Pages using UnifiedDataService:"
grep -r "useUnifiedData\|UnifiedDataService" frontend/src/components/charts/*.tsx 2>/dev/null | wc -l | xargs echo "Charts using UnifiedDataService:"
