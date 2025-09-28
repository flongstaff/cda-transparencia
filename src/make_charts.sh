#!/bin/bash
echo "🚀 Running transparency dashboard data processing pipeline..."

echo "1. Cleaning raw data..."
python3 src/clean_data.py

echo "2. Extracting programmatic indicators..."
python3 src/extract_indicators.py

echo "3. Generating HTML charts..."
python3 src/generate_charts.py

echo ""
echo "✅ All steps completed successfully!"
echo ""
echo "📊 Generated charts:"
echo "   - public/charts/budget_2019.html"
echo "   - public/charts/budget_2021_quarterly.html"
echo "   - public/charts/cameras_timeline.html"
echo "   - public/charts/families_assisted.html"
echo ""
echo "🌐 View the dashboard:"
echo "   Open public/index.html in your browser"
echo ""
echo "☁️  To deploy to Cloudflare Pages:"
echo "   1. Push the public/ directory to your Cloudflare Pages repo"
echo "   2. Configure Cloudflare Pages to serve from the public/ directory"