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
# Use python3 explicitly (more common in CI environments)
if command -v python3 &> /dev/null; then
    python3 scripts/generate-data-index.py
    python3 scripts/transform-processed-data.py
else
    python scripts/generate-data-index.py
    python scripts/transform-processed-data.py
fi

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🏗️  Building frontend..."
npm run build:production

echo "✅ Build complete!"
