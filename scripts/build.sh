#!/bin/bash
set -e

echo "🔧 Installing Python dependencies..."
# Determine if we're in CI or local environment
if [ -n "$CI" ] || [ -n "$CLOUDFLARE" ]; then
    # CI environment - install normally
    if command -v pip3 &> /dev/null; then
        pip3 install -r requirements_complete.txt
    elif command -v pip &> /dev/null; then
        pip install -r requirements_complete.txt
    else
        python3 -m pip install -r requirements_complete.txt
    fi
else
    # Local environment - use --user flag to avoid system package conflicts
    echo "📍 Local environment detected, using --user flag"
    if command -v pip3 &> /dev/null; then
        pip3 install --user -r requirements_complete.txt 2>/dev/null || echo "⚠️  Skipping pip install (packages may already be installed)"
    elif command -v pip &> /dev/null; then
        pip install --user -r requirements_complete.txt 2>/dev/null || echo "⚠️  Skipping pip install (packages may already be installed)"
    else
        python3 -m pip install --user -r requirements_complete.txt 2>/dev/null || echo "⚠️  Skipping pip install (packages may already be installed)"
    fi
fi

echo "📊 Running data preprocessing..."
# Use node to run JavaScript scripts
if command -v node &> /dev/null; then
    node scripts/generate-data-index.js
    node scripts/transform-processed-data.js
else
    echo "❌ Node.js is required to run preprocessing scripts"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps

echo "🏗️  Building frontend..."
npm run build:production

echo "✅ Build complete!"
