#!/bin/bash
# Deploy to Cloudflare Pages

echo "🚀 Starting deployment to Cloudflare Pages..."

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🏗️ Building project..."
npm run build:production

# Cloudflare Pages has a 25MB file size limit - exclude large PDFs
echo "📦 Removing files larger than 25MB (Cloudflare limit)..."
find ./dist/data/pdfs -name "*.pdf" -size +25M -delete

# Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy ./dist --project-name=cda-transparencia --commit-dirty=true

echo "✅ Deployment completed!"