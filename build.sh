#!/bin/bash
set -e

echo "🔧 Installing Python dependencies..."
pip install -r requirements_complete.txt

echo "📊 Running data preprocessing..."
python scripts/generate-data-index.py
python scripts/transform-processed-data.py

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🏗️  Building frontend..."
npm run build:production

echo "✅ Build complete!"
