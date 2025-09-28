#!/bin/bash

echo "🚀 Carmen de Areco Transparency Dashboard Pipeline"
echo "==================================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
else
    echo "✅ Virtual environment already exists"
    source venv/bin/activate
fi

echo ""
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "🧹 Step 1: Deduplicating PDFs..."
python src/03_deduplicate_pdfs.py

echo ""
echo "🧼 Step 2: Cleaning and standardizing data..."
python src/01_clean_data.py

echo ""
echo "📊 Step 3: Extracting programmatic indicators..."
python src/02_extract_indicators.py

echo ""
echo "📈 Step 4: Generating static charts..."
# Check if jupyter is available
if command -v jupyter &> /dev/null; then
    jupyter nbconvert --to notebook --execute notebooks/*.ipynb
else
    echo "⚠️  Jupyter not available, skipping notebook execution"
    echo "   To install jupyter: pip install jupyter"
fi

echo ""
echo "✅ Pipeline completed successfully!"
echo ""
echo "📁 Output files generated:"
echo "   • data/processed/cleaned/budget_execution_all_years.csv"
echo "   • data/processed/indicators_all_years.csv"
echo "   • data/processed/indicators_all_years.json"
echo "   • public/charts/budget_execution_trend.html"
echo "   • public/charts/budget_execution_percentage.html"
echo "   • public/charts/security_cameras_timeline.html"
echo "   • public/charts/families_assisted_timeline.html"
echo "   • public/charts/gender_staffing_placeholder.html"
echo "   • public/charts/procurement_timeline.html"
echo "   • public/charts/procurement_amounts.html"
echo "   • public/charts/monthly_procurement_activity.html"
echo ""
echo "🌐 To view the dashboard:"
echo "   Open public/index.html in your browser"
echo ""
echo "☁️  To deploy to Cloudflare Pages:"
echo "   1. Push the public/ directory to your Cloudflare Pages repo"
echo "   2. Configure Cloudflare Pages to serve from the public/ directory"