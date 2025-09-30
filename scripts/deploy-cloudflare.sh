#!/bin/bash
# Deploy to Cloudflare Pages

echo "🚀 Starting deployment to Cloudflare Pages..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🏗️ Building project..."
npm run build

# Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy ./dist --project-name=cda-transparencia

echo "✅ Deployment completed!"