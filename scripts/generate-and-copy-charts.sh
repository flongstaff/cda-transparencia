#!/bin/bash
# Generate and copy all charts

echo "📊 Generating and copying all charts..."

# Generate static charts
echo "🏗️ Generating static charts..."
python scripts/generate-static-charts.py

# Copy charts to frontend
echo "📋 Copying charts to frontend..."
bash scripts/copy-charts-to-frontend.sh

echo "✅ All charts generated and copied successfully!"