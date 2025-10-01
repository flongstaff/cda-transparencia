#!/bin/bash

# Deployment script for Carmen de Areco Transparency Portal

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Building frontend..."
cd frontend
npm run build
cd ..

echo "📋 Running audits..."
cd scripts
npm install axios
node fetch-external.js
cd ..

echo "✅ Deployment preparation complete!"

echo "🌐 To deploy to GitHub Pages:"
echo "   1. Push to the main branch"
echo "   2. GitHub Actions will automatically deploy"

echo "☁️  To deploy to Cloudflare Pages:"
echo "   1. Push to the main branch"
echo "   2. Cloudflare Pages will automatically deploy via GitHub Actions"

echo "🎉 Deployment script completed successfully!"